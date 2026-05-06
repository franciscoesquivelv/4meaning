import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EventSubNav from './EventSubNav'

export default async function EventoLayout({
  params,
  children,
}: {
  params: { id: string }
  children: React.ReactNode
}) {
  const supabase = createClient()

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre, pipeline_status')
    .eq('id', params.id)
    .single()

  if (!evento) notFound()

  return (
    <>
      <EventSubNav
        eventId={params.id}
        eventName={evento.nombre}
        pipelineStatus={evento.pipeline_status ?? 'prospecto'}
      />
      <div className="pt-0">{children}</div>
    </>
  )
}
