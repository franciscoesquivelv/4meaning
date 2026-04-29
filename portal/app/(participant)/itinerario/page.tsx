import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fmtDate, fmtTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Itinerario' }

const TYPE_COLORS: Record<string, string> = {
  actividad: 'bg-info/10 text-info',
  taller:    'bg-info/10 text-info',
  comida:    'bg-success/10 text-success',
  logistica: 'bg-muted/10 text-muted',
  libre:     'bg-warning/10 text-warning',
  privado:   'bg-border text-muted',
  traslado:  'bg-border text-muted',
}

const TYPE_LABELS: Record<string, string> = {
  actividad: 'Actividad',
  taller:    'Taller',
  comida:    'Comida',
  logistica: 'Logística',
  libre:     'Tiempo libre',
  privado:   'Privado',
  traslado:  'Traslado',
}

export default async function ItinerarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get family + event
  const { data: family } = await supabase
    .from('families')
    .select('event_id')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .maybeSingle()

  if (!family?.event_id) {
    return (
      <div className="text-center py-16">
        <p className="text-[12px] text-muted">Aún no estás asignado a un evento.</p>
      </div>
    )
  }

  const { data: items } = await supabase
    .from('itinerary_items')
    .select('id, dia, fecha, hora_inicio, hora_fin, titulo, descripcion, tipo, ubicacion')
    .eq('event_id', family.event_id)
    .in('visibilidad', ['participant', 'all'])
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
      <div>
        <h1 className="text-xl font-bold text-ink">Itinerario</h1>
        <p className="text-[11px] text-muted mt-1">Tu programa del retiro.</p>
      </div>

      {Object.keys(days).length === 0 && (
        <div className="text-center py-12">
          <p className="text-[12px] text-muted">El itinerario aún no está disponible.</p>
        </div>
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

          <div className="relative pl-4 border-l border-border space-y-3">
            {dayItems.map((item, idx) => (
              <div key={item.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-border-hi" />

                <div className="bg-surface border border-border rounded-lg px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-ink leading-tight">
                        {item.titulo}
                      </p>
                      {item.descripcion && (
                        <p className="text-[10.5px] text-muted mt-1 leading-relaxed">
                          {item.descripcion}
                        </p>
                      )}
                      {item.ubicacion && (
                        <p className="text-[10px] text-muted mt-1.5">
                          📍 {item.ubicacion}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <p className="text-[10px] font-mono text-muted">
                        {fmtTime(item.hora_inicio)}
                        {item.hora_fin && ` – ${fmtTime(item.hora_fin)}`}
                      </p>
                      <span className={cn(
                        'text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded',
                        TYPE_COLORS[item.tipo] ?? 'bg-border text-muted'
                      )}>
                        {TYPE_LABELS[item.tipo] ?? item.tipo}
                      </span>
                    </div>
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
