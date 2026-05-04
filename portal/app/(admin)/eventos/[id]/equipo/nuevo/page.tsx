import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AgregarMiembroForm from './AgregarMiembroForm'

export default async function NuevoMiembroPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  return <AgregarMiembroForm eventId={evento.id} eventNombre={evento.nombre} />
}
