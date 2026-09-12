import { createClient } from '@/lib/supabase/server'
import { yaEstablecioContrasena } from '@/lib/supabase/contrasenaEstablecida'
import { NextResponse } from 'next/server'

// EL MISMO `code` PUEDE TRAER A DOS PERSONAS MUY DISTINTAS.
//
// Alguien que ya tiene cuenta y contraseña, entrando por comodidad desde un
// enlace. O alguien recién invitado (`inviteUserByEmail`), que nunca ha
// puesto una contraseña propia. Antes esta ruta trataba a los dos igual:
// canjeaba el código y mandaba a la persona derecho al portal. A quien nunca
// puso contraseña eso la deja sin ninguna forma de volver a entrar el día
// que cierre sesión o el enlace expire.
//
// Encontrado en vivo por Francisco el 2026-09-11, con su propia cuenta de
// prueba. Ver la migración `20260911_1700_profiles_contrasena_establecida.sql`
// para la columna que distingue los dos casos.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      if (!(await yaEstablecioContrasena(supabase, data.user.id))) {
        return NextResponse.redirect(`${origin}/nueva-contrasena`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
