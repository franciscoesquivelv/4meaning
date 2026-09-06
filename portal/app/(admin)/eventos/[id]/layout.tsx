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
    .select('id, nombre, pipeline_status, fecha_fin')
    .eq('id', params.id)
    .single()

  if (!evento) notFound()

  return (
    <>
      {/* `fecha_fin` va a la barra porque hay secciones que solo tienen
          materia despues del retiro. Una barra que las muestra siempre le
          pide al equipo que decida en cual entrar sin decirle cual esta viva. */}
      <EventSubNav
        eventId={params.id}
        eventName={evento.nombre}
        pipelineStatus={evento.pipeline_status ?? 'prospecto'}
        fechaFin={evento.fecha_fin ?? null}
      />
      <div className="pt-0">{children}</div>
    </>
  )
}
