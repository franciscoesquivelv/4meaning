import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const tipoColors: Record<string, { bg: string; color: string }> = {
  actividad:  { bg: '#dbeafe', color: '#1e40af' },
  taller:     { bg: '#ede9fe', color: '#6d28d9' },
  comida:     { bg: '#fef9c3', color: '#854d0e' },
  logistica:  { bg: '#f3f4f6', color: '#374151' },
  libre:      { bg: '#dcfce7', color: '#166534' },
  privado:    { bg: '#fee2e2', color: '#991b1b' },
  traslado:   { bg: '#e0f2fe', color: '#075985' },
}

function formatTime(t: string | null) {
  if (!t) return ''
  return t.slice(0, 5)
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long' })
}

export default async function ItinerarioPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: family } = await supabase
    .from('families')
    .select('id, event_id')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .maybeSingle()

  if (!family) {
    return (
      <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Itinerario</h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>No tienes un evento asignado todavía.</p>
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
  const byDay: Record<number, {
    id: string
    dia: number
    fecha: string | null
    hora_inicio: string | null
    hora_fin: string | null
    titulo: string
    descripcion: string | null
    tipo: string
    ubicacion: string | null
  }[]> = {}

  for (const item of items ?? []) {
    if (!byDay[item.dia]) byDay[item.dia] = []
    byDay[item.dia]!.push(item)
  }

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Itinerario</h1>

      {Object.keys(byDay).length === 0 ? (
        <p style={{ color: '#9ca3af', fontSize: 14 }}>El itinerario aún no está disponible.</p>
      ) : (
        Object.entries(byDay).map(([dia, dayItems]) => {
          const firstItem = dayItems[0]
          return (
            <div key={dia} style={{ marginBottom: 32 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Día {dia}
                </div>
                {firstItem?.fecha && (
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginTop: 2 }}>
                    {formatDate(firstItem.fecha)}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dayItems.map(item => {
                  const tc = tipoColors[item.tipo] ?? { bg: '#f3f4f6', color: '#374151' }
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 10,
                        padding: '14px 16px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{item.titulo}</div>
                          {item.hora_inicio && (
                            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
                              {formatTime(item.hora_inicio)}
                              {item.hora_fin ? ` – ${formatTime(item.hora_fin)}` : ''}
                            </div>
                          )}
                          {item.ubicacion && (
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{item.ubicacion}</div>
                          )}
                          {item.descripcion && (
                            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 1.5 }}>
                              {item.descripcion}
                            </p>
                          )}
                        </div>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          background: tc.bg,
                          color: tc.color,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}>
                          {item.tipo}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
