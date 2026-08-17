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
  //
  // robots.txt, sw.js y manifest.json son archivos estaticos que POR
  // DEFINICION se piden sin sesion: un rastreador y el instalador de la PWA
  // no tienen cookie. Sin excluirlos, el middleware les devuelve un 307 al
  // login y el robots.txt no se lee nunca, con lo que el noindex de la rama
  // /prototipo quedaria a medias.
  matcher: [
    '/((?!prototipo(?:/|$)|_next/static|_next/image|favicon.ico|robots\\.txt|sw\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
