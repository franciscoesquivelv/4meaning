import { createServiceClient } from '@/lib/supabase/server'
import { todosLosUsuariosDeAuth } from '@/lib/supabase/usuariosAuth'

// ── RESOLVER UNA CUENTA A PARTIR DE UN CORREO ───────────────────────────
//
// Extraído de `/api/admin/invite/route.ts`, que ya lo hacía a mano y con
// un defecto real: comparaba `inviteError.message` contra el substring
// literal "already registered". El mensaje real que devuelve Supabase para
// una cuenta YA CONFIRMADA es "A user with this email address has already
// been registered" ("been" en medio), así que esa comparación nunca
// calzaba. Verificado en vivo, no en teoría: se invitó a una cuenta de
// prueba con contraseña ya puesta y Supabase devolvió exactamente ese
// mensaje, con `code: 'email_exists'`. Como la comparación fallaba, la
// ruta entera se detenía ahí con un 400 crudo, y la rama de "ya existe,
// reutilízala" que el propio código decía tener nunca se alcanzaba: ni
// actualizaba el perfil ni creaba el grant. Se compara por `code`, que
// Supabase documenta como estable, no por el texto del mensaje.
//
// El caso de una cuenta invitada pero TODAVÍA NO CONFIRMADA es distinto y
// no necesita rama propia: `inviteUserByEmail` sobre ese correo no falla,
// vuelve a mandar el correo de invitación tal cual (confirmado también en
// vivo). Por eso aquí solo hay dos caminos: la llamada tuvo éxito (cuenta
// nueva o reenvío, y en ambos casos se mandó correo), o falló con
// `email_exists` (cuenta ya activa, no se manda nada y se reutiliza el id).
export type ResultadoCuenta =
  | { estado: 'ok'; userId: string; correoEnviado: boolean }
  | { estado: 'fallo'; motivo: string }

export async function resolverCuentaPorCorreo(
  email: string,
  fullName?: string | null
): Promise<ResultadoCuenta> {
  const service = createServiceClient()

  const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName ?? undefined },
  })

  if (!error) {
    if (!data.user) return { estado: 'fallo', motivo: 'Supabase no devolvió el usuario invitado.' }
    return { estado: 'ok', userId: data.user.id, correoEnviado: true }
  }

  if (error.code !== 'email_exists') {
    return { estado: 'fallo', motivo: error.message }
  }

  const usuarios = await todosLosUsuariosDeAuth()
  const existente = usuarios.find(u => u.email === email)
  if (!existente) {
    return { estado: 'fallo', motivo: 'El correo ya está registrado, pero no se encontró la cuenta para reutilizarla.' }
  }
  return { estado: 'ok', userId: existente.id, correoEnviado: false }
}

// ── DAR (O REACTIVAR) EL ACCESO A UNA EXPERIENCIA ───────────────────────
//
// Extraído tal cual de `/api/admin/invite/route.ts`. La razón de no usar
// `upsert`+`onConflict` sigue siendo la misma: la restricción única de
// `grants` es `(profile_id, experience_id, run_id)`, y aquí `run_id` va
// nulo porque esto no es una corrida presencial. Postgres no considera
// iguales dos NULL para una restricción única, así que el `onConflict`
// nunca dispara sobre estas filas: cada intento repetido crearía OTRO
// grant en vez de reactivar el que ya existe.
export type ResultadoAcceso =
  | { estado: 'ok'; grantId: string }
  | { estado: 'fallo'; motivo: string }

export async function otorgarAccesoExperiencia(params: {
  profileId: string
  experienceId: string
  otorgadoPor: string
}): Promise<ResultadoAcceso> {
  const service = createServiceClient()

  const { data: existente } = await service
    .from('grants')
    .select('id, revocado_at')
    .eq('profile_id', params.profileId)
    .eq('experience_id', params.experienceId)
    .is('run_id', null)
    .maybeSingle()

  if (existente) {
    const { error } = await service
      .from('grants')
      .update({ revocado_at: null, otorgado_por: params.otorgadoPor, otorgado_at: new Date().toISOString() })
      .eq('id', existente.id)
    if (error) return { estado: 'fallo', motivo: error.message }
    return { estado: 'ok', grantId: existente.id }
  }

  const { data: creado, error } = await service
    .from('grants')
    .insert({
      profile_id: params.profileId,
      experience_id: params.experienceId,
      titularidad: 'individual',
      otorgado_por: params.otorgadoPor,
    })
    .select('id')
    .single()

  if (error || !creado) return { estado: 'fallo', motivo: error?.message ?? 'El grant no devolvió id.' }
  return { estado: 'ok', grantId: creado.id }
}

// Crea el perfil si el correo nunca había tocado el portal. Si ya existía
// (por ejemplo, alguien que ya era participante de Trascendencia y ahora
// también compra en PersonaLab), su rol NO se toca: pisarlo con
// 'individual' le podría cerrar pantallas que ya tenía por su rol anterior,
// y nadie pidió resolver esa mezcla aquí.
export async function asegurarPerfilIndividual(params: {
  userId: string
  email: string
}): Promise<{ estado: 'ok' } | { estado: 'fallo'; motivo: string }> {
  const service = createServiceClient()

  const { data: perfil } = await service
    .from('profiles')
    .select('id')
    .eq('id', params.userId)
    .maybeSingle()

  if (perfil) return { estado: 'ok' }

  const { error } = await service
    .from('profiles')
    .insert({ id: params.userId, email: params.email, role: 'individual' })

  if (error) return { estado: 'fallo', motivo: error.message }
  return { estado: 'ok' }
}
