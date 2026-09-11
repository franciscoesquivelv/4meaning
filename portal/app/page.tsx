import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { inicioDe } from '@/lib/rutas/porRol'

export default async function RootPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
