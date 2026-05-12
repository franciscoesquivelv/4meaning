// SQL migration (run manually):
// alter table public.itinerary_items add column if not exists delayed boolean not null default false;

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import OperacionClient from './OperacionClient'

type SuggestedRol = 'facilitador' | 'coordinador' | 'director' | null

function mapTeamRolToOperacion(teamRol: string): SuggestedRol {
  const r = teamRol.toLowerCase()
  if (r.includes('facilitador')) return 'facilitador'
  if (r.includes('coordinador') || r.includes('coord')) return 'coordinador'
  if (r.includes('foto') || r.includes('fotografo') || r.includes('director de foto')) return 'director'
  return null
}

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

  // Compute which "day" of the event today is (1, 2, 3...)
  // Returns '0' if event hasn't started yet or no fecha_inicio
  function getEventDay(fechaInicio: string | null): string {
    if (!fechaInicio) return '0'
    const start = new Date(fechaInicio + 'T00:00:00')
    const now = new Date()
    // Normalize both to local date midnight
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffDays = Math.floor((nowMidnight.getTime() - startMidnight.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return '0' // before event
    return String(diffDays + 1) // day 1, 2, 3...
  }

  const today = getEventDay(evento.fecha_inicio)

  const [
    { data: families },
    { data: allItems },
    { data: announcements },
    { data: profile },
    { data: teamMembers },
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
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('event_team')
      .select('nombre, rol')
      .eq('event_id', params.id),
  ])

  // Detect suggested role from team roster
  let suggestedRole: SuggestedRol = null
  const fullName = profile?.full_name ?? ''
  if (fullName && teamMembers) {
    const match = teamMembers.find(
      m => m.nombre && m.nombre.toLowerCase().includes(fullName.toLowerCase())
    ) ?? teamMembers.find(
      m => m.nombre && fullName.toLowerCase().includes(m.nombre.toLowerCase())
    )
    if (match?.rol) {
      suggestedRole = mapTeamRolToOperacion(match.rol)
    }
  }

  return (
    <OperacionClient
      evento={evento}
      families={families ?? []}
      items={allItems ?? []}
      announcements={announcements ?? []}
      today={today}
      suggestedRole={suggestedRole}
    />
  )
}
