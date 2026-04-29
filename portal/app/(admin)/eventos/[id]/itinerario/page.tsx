import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fmtDate, fmtTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Itinerario' }

const VIS_BADGE: Record<string, 'warning' | 'muted' | 'info'> = {
  staff_only:  'warning',
  participant: 'info',
  all:         'muted',
}
const VIS_LABEL: Record<string, string> = {
  staff_only:  'Solo staff',
  participant: 'Participantes',
  all:         'Todos',
}

const TYPE_DOT: Record<string, string> = {
  actividad: 'bg-info',
  taller:    'bg-info',
  comida:    'bg-success',
  logistica: 'bg-muted',
  libre:     'bg-warning',
  privado:   'bg-border-hi',
  traslado:  'bg-border-hi',
}

export default async function AdminItinerarioPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()

  if (!event) notFound()

  const { data: items } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('event_id', params.id)
    .order('dia')
    .order('orden')
    .order('hora_inicio')

  // Group by day
  const days = items?.reduce((acc: Record<number, typeof items>, item) => {
    const day = item.dia
    if (!acc[day]) acc[day] = []
    acc[day].push(item)
    return acc
  }, {}) ?? {}

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/eventos/${params.id}`} className="text-[10px] text-muted hover:text-ink mb-2 inline-block">
            ← {event.nombre}
          </Link>
          <h1 className="text-lg font-bold text-ink">Itinerario</h1>
          <p className="text-[11px] text-muted mt-1">
            {items?.length ?? 0} items · Vista completa (staff)
          </p>
        </div>
        {/* TODO: Add item button */}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-warning inline-block" />
          Solo staff (oculto a participantes)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-info inline-block" />
          Visible a participantes
        </span>
      </div>

      {Object.keys(days).length === 0 && (
        <Card>
          <p className="text-[12px] text-muted text-center py-10">
            No hay items en el itinerario aún.
          </p>
        </Card>
      )}

      {Object.entries(days).map(([dayNum, dayItems]) => (
        <div key={dayNum}>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted">
              Día {dayNum}
            </p>
            {dayItems[0]?.fecha && (
              <p className="text-[10px] text-muted">{fmtDate(dayItems[0].fecha)}</p>
            )}
          </div>

          <div className="space-y-2">
            {dayItems.map((item: any) => (
              <div
                key={item.id}
                className={cn(
                  'bg-surface border border-border rounded-lg px-4 py-3',
                  item.visibilidad === 'staff_only' && 'border-warning/20 bg-warning/4'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Type dot */}
                    <div className={cn(
                      'w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0',
                      TYPE_DOT[item.tipo] ?? 'bg-border'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-ink leading-snug">
                        {item.titulo}
                      </p>
                      {item.descripcion && (
                        <p className="text-[10.5px] text-muted mt-0.5 leading-relaxed">
                          {item.descripcion}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[10px] text-muted">
                        {item.ubicacion && <span>📍 {item.ubicacion}</span>}
                        {item.responsable && <span>👤 {item.responsable}</span>}
                      </div>
                      {/* Staff notes — only visible here */}
                      {item.notas_staff && (
                        <p className="text-[10px] text-warning/70 mt-1.5 bg-warning/8 px-2 py-1 rounded">
                          📋 {item.notas_staff}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <p className="text-[10px] font-mono text-muted">
                      {fmtTime(item.hora_inicio)}
                      {item.hora_fin && <span className="text-muted/50"> – {fmtTime(item.hora_fin)}</span>}
                    </p>
                    <Badge variant={VIS_BADGE[item.visibilidad] ?? 'muted'}>
                      {VIS_LABEL[item.visibilidad] ?? item.visibilidad}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
