import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { inicioDe } from '@/lib/rutas/porRol'

export default async function RootPage({
  searchParams,
}: {
  searchParams: { code?: string }
}) {
  // EL ENLACE DE UN CORREO DE INVITACIÓN PUEDE ATERRIZAR AQUÍ, EN LA RAÍZ.
  //
  // El "Site URL" del proyecto es `https://app.4meaning.life` (la raíz), y
  // `inviteUserByEmail` no le da un destino propio, así que Supabase manda
  // ahí el enlace de vuelta. Con el flujo PKCE (el que usa esta librería por
  // defecto), eso llega como `/?code=...`.
  //
  // Antes de esta línea, esta página ignoraba `code` por completo: miraba si
  // había sesión, no la había, y redirigía a `/login` con un `redirect()`
  // que no reenvía ningún parámetro. El código quedaba tirado en el camino,
  // en silencio, y quien aceptaba una invitación caía en un formulario de
  // login vacío sin ninguna pista de qué pasó. Se detectó al preparar la
  // guía de prueba de la Etapa 6, antes de que nadie lo sufriera de verdad.
  //
  // `/auth/callback` ya sabe canjear ese código por una sesión real; aquí
  // solo hace falta no perderlo en el camino.
  if (searchParams.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(searchParams.code)}`)
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // El caso del flujo implícito (tokens en el fragmento de la URL, `#...`)
  // no necesita nada aquí: el fragmento nunca llega al servidor, así que ni
  // esta página ni ninguna otra puede verlo. Pero SÍ sobrevive este mismo
  // redirect hacia `/login` (es una propiedad del navegador, no algo que el
  // código controle), y `/login` ya sabe recogerlo con `CompletarSesion`.
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Antes esto solo distinguía 'participant' de todo lo demás, y todo lo
  // demás caía en /hoy. Un rol nuevo (como 'individual', el cliente de
  // PersonaLab) caía ahí también, que es de Trascendencia y exige ser del
  // equipo: rebotaba. Ver lib/rutas/porRol.ts.
  redirect(inicioDe(profile?.role))
}
