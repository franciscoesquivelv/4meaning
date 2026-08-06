import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // `prototipo` queda fuera del gate de sesion a proposito: es una maqueta
  // con datos simulados que debe poder verse sin credenciales de Supabase.
  // La frontera va anclada con (?:/|$) a proposito: sin el ancla, una ruta
  // futura como /prototipos o /prototipo-v2 quedaria fuera del gate de sesion
  // en silencio.
  matcher: ['/((?!prototipo(?:/|$)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
