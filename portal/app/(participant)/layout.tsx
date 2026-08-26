import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ParticipantNav from '@/components/ParticipantNav'

export default async function ParticipantLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  if (!['participant', 'super_admin', 'admin', 'staff'].includes(profile.role)) {
    redirect('/login')
  }

  // El equipo YA NO se rebota al dashboard. Ese rebote era lo que hacía
  // imposible que alguien del equipo viera la app del participante, y era
  // redundante: la raíz (app/page.tsx) ya enruta por rol al entrar, así que
  // nadie del equipo aterriza aquí por accidente.
  //
  // Quien llega aquí siendo del equipo es porque abrió la previa a
  // propósito, con ?familia= señalando a qué pareja quiere mirar.

  const { data: family } = await supabase
    .from('families')
    .select('nombre_familia, event_id, events(nombre)')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .maybeSingle()

  // marca-trascendencia fija la dominancia: dentro de aquí, `bg-dom-deep`
  // pinta vino y no teal. Lo declara el layout de la marca, no cada pantalla.
  //
  // El fondo y el color de texto ya NO viven aquí. Vivían, en negro #0C0C0C
  // y crema #F5F0E8, dos colores que no están en ninguna paleta de 4 Meaning.
  // Ahora cada pantalla declara el suyo, que es lo que permite convertirlas
  // una por una sin que las demás queden con texto claro sobre fondo claro.
  return (
    <div className="marca-trascendencia min-h-screen bg-paper">
      <main className="max-w-lg mx-auto pb-24">
        {children}
      </main>
      <ParticipantNav />
    </div>
  )
}
