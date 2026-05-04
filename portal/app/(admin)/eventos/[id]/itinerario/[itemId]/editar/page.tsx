import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EditarItemForm from './EditarItemForm'

export default async function EditarItemPage({ params }: { params: { id: string; itemId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: item },
    { data: teamMembers },
  ] = await Promise.all([
    supabase
      .from('itinerary_items')
      .select('id, event_id, dia, fecha, hora_inicio, hora_fin, titulo, descripcion, tipo, visibilidad, ubicacion, responsable, grupo, notas_staff')
      .eq('id', params.itemId)
      .eq('event_id', params.id)
      .single(),
    supabase
      .from('event_team')
      .select('id, nombre, rol')
      .eq('event_id', params.id)
      .order('orden'),
  ])

  if (!item) notFound()

  return <EditarItemForm item={item} teamMembers={teamMembers ?? []} />
}
