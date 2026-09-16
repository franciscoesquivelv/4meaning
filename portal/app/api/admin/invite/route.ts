import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolverCuentaPorCorreo, otorgarAccesoExperiencia } from '@/lib/personalab/acceso'

export async function POST(request: NextRequest) {
  // Verify the requester is admin/super_admin
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const body = await request.json()
  const { email, full_name, role = 'participant', family_id, slot, experience_id } = body

  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

  const service = createServiceClient()

  // 1. Resolver la cuenta (crearla, reenviar su invitación si estaba sin
  //    confirmar, o reutilizarla si ya está activa) y escribir su perfil.
  //
  // ANTES esto eran dos pasos a mano aquí mismo: invitar comparando
  // `inviteError.message` contra el substring "already registered" (que
  // nunca calzaba con el mensaje real de Supabase para una cuenta
  // confirmada, "...has already been registered", con "been" en medio;
  // verificado en vivo), y despues dos escrituras de perfil distintas
  // (upsert si la cuenta era nueva, update si ya existia) sin revisar
  // `error` en ninguna — el incidente documentado en
  // docs/INCIDENTE-ROL-INDIVIDUAL.md. Con el substring roto, invitar a
  // cualquier correo YA CONFIRMADO se detenia aqui con un 400 crudo y
  // nunca llegaba a la rama de "ya existe, reutilizala": ni el perfil se
  // actualizaba ni el grant se creaba. Hallazgo de Leo, Etapa 6a. Ahora
  // `resolverCuentaPorCorreo` (lib/personalab/acceso.ts, compartido con el
  // canje de compras) compara por `code`, no por texto, y una sola
  // escritura de perfil (upsert) cubre los dos casos.
  const cuenta = await resolverCuentaPorCorreo(email, full_name)
  if (cuenta.estado === 'fallo') {
    return NextResponse.json({ error: cuenta.motivo }, { status: 400 })
  }
  const resolvedUserId = cuenta.userId

  const { error: perfilError } = await service
    .from('profiles')
    .upsert({
      id: resolvedUserId,
      email,
      full_name: full_name ?? null,
      role,
    }, { onConflict: 'id' })

  if (perfilError) {
    return NextResponse.json(
      { error: `La cuenta se resolvió, pero no se pudo escribir su perfil: ${perfilError.message}` },
      { status: 500 }
    )
  }

  // 3. Link to family if specified
  if (resolvedUserId && family_id && slot) {
    const col = slot === '1' ? 'user_id1' : 'user_id2'
    await service
      .from('families')
      .update({ [col]: resolvedUserId })
      .eq('id', family_id)
  }

  // 4. Dar acceso a una experiencia de PersonaLab, si se pidió.
  //
  // Es el mismo par de pasos (crear cuenta, crear grant) que ya usa el
  // canje de compras (`lib/personalab/compras.ts`): crea o reutiliza la
  // cuenta, y le da acceso a lo que corresponde. `otorgarAccesoExperiencia`
  // (lib/personalab/acceso.ts) es la misma lógica de "buscar a mano y
  // decidir" que vivía aquí, ahora compartida con ese otro disparador en
  // vez de reinventada.
  if (resolvedUserId && experience_id) {
    const grant = await otorgarAccesoExperiencia({
      profileId: resolvedUserId,
      experienceId: experience_id,
      otorgadoPor: user.id,
    })

    if (grant.estado === 'fallo') {
      // La cuenta ya se resolvió; no se deshace por esto. Se informa y el
      // grant se puede dar a mano después.
      return NextResponse.json({
        ok: true,
        userId: resolvedUserId,
        correoEnviado: cuenta.correoEnviado,
        avisoGrant: grant.motivo,
      })
    }
  }

  return NextResponse.json({ ok: true, userId: resolvedUserId, correoEnviado: cuenta.correoEnviado })
}
