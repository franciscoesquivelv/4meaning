import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ItinerarioClient from './ItinerarioClient'

export default async function ItinerarioAdminPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const [
    { data: items },
    { data: teamMembers },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('itinerary_items')
      .select('id, dia, fecha, hora_inicio, hora_fin, titulo, descripcion, tipo, visibilidad, ubicacion, responsable, grupo, notas_staff, orden')
      .eq('event_id', params.id)
      .order('dia')
      .order('hora_inicio'),
    supabase
      .from('event_team')
      .select('id, nombre, rol')
      .eq('event_id', params.id)
      .order('orden'),
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single(),
  ])

  const isAdmin = profile?.role ? ['super_admin', 'admin'].includes(profile.role) : false

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Itinerario</h1>
        <Link
          href={`/eventos/${params.id}/itinerario/nuevo`}
          className="px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          + Agregar item
        </Link>
      </div>

      <ItinerarioClient
        eventId={params.id}
        eventName={evento.nombre}
        items={items ?? []}
        teamMembers={teamMembers ?? []}
        isAdmin={isAdmin}
      />
    </div>
  )
}
