// SQL migration (run manually):
// alter table public.itinerary_items add column if not exists delayed boolean not null default false;

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import OperacionClient from './OperacionClient'

export default async function OperacionPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre, fecha_inicio, fecha_fin')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const today = new Date().toISOString().slice(0, 10)

  const [
    { data: families },
    { data: allItems },
    { data: announcements },
  ] = await Promise.all([
    supabase
      .from('families')
      .select('id, nombre_familia, nombre1, nombre2, habitacion, status, checked_in_at, notas')
      .eq('event_id', params.id)
      .order('nombre_familia'),
    supabase
      .from('itinerary_items')
      .select('id, dia, hora_inicio, hora_fin, titulo, tipo, ubicacion, descripcion, delayed')
      .eq('event_id', params.id)
      .order('dia')
      .order('orden')
      .order('hora_inicio'),
    supabase
      .from('announcements')
      .select('id, titulo, tipo, created_at')
      .eq('event_id', params.id)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <OperacionClient
      evento={evento}
      families={families ?? []}
      items={allItems ?? []}
      announcements={announcements ?? []}
      today={today}
    />
  )
}
