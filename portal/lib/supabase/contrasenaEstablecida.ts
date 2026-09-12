import type { SupabaseClient } from '@supabase/supabase-js'

// ── EL PUNTO ÚNICO PARA "¿YA PUSO SU PROPIA CONTRASEÑA?" ──────────
//
// `inviteUserByEmail` crea la cuenta sin contraseña. El enlace del correo
// entrega una sesión válida por dos caminos distintos (PKCE en
// `app/auth/callback/route.ts`, implícito en `components/CompletarSesion.tsx`),
// y los dos necesitan la misma pregunta antes de dejar pasar a la persona al
// portal: si nunca puso contraseña, va a `/nueva-contrasena`, no adentro.
//
// Estaba escrita dos veces, a mano, en los dos archivos. Es el mismo patrón
// que ya se cerró una vez en este repo (`lib/supabase/usuariosAuth.ts`,
// hallazgo de Hugo en la Etapa 5, `listUsers()` duplicado sin paginar). Aquí
// se cierra desde el origen: cualquier camino de entrada nuevo (otro
// proveedor, otro tipo de enlace) llama a esta función por nombre, no
// reescribe la consulta.
//
// Funciona igual con el cliente de servidor y el de navegador: los dos
// implementan la misma interfaz de `SupabaseClient` para `.from().select()`.
export async function yaEstablecioContrasena(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('contrasena_establecida_at')
    .eq('id', userId)
    .maybeSingle()

  // No se distingue "la consulta falló" de "la fila no tiene la marca": a
  // propósito. Las dos caen del mismo lado seguro, mandar a poner
  // contraseña. Fallar hacia adentro del portal reproduciría el bug que
  // esto corrige.
  return Boolean(data?.contrasena_establecida_at)
}
