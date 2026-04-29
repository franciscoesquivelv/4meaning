import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function TipoBadge({ tipo }: { tipo: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    sesion:     { bg: '#ede9fe', color: '#6d28d9' },
    comida:     { bg: '#fef9c3', color: '#854d0e' },
    actividad:  { bg: '#dbeafe', color: '#1e40af' },
    libre:      { bg: '#f3f4f6', color: '#6b7280' },
    traslado:   { bg: '#e0f2fe', color: '#075985' },
    bienvenida: { bg: '#dcfce7', color: '#166534' },
    cierre:     { bg: '#fee2e2', color: '#991b1b' },
  }
  const s = map[tipo] ?? { bg: '#f3f4f6', color: '#374151' }
  return (
    <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {tipo}
    </span>
  )
}

function formatTime(t: string | null) {
  if (!t) return ''
  return t.slice(0, 5)
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
}

interface ItineraryItem {
  id: string
  dia: number
  fecha: string | null
  hora_inicio: string | null
  hora_fin: string | null
  titulo: string
  descripcion: string | null
  tipo: string
  ubicacion: string | null
}

export default async function ProgramaPage() {
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
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Programa</h1>
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 10, padding: 20, color: '#78350f', fontSize: 14 }}>
          Tu cuenta no tiene una familia asignada todavía.
        </div>
      </div>
    )
  }

  const { data: items } = await supabase
    .from('itinerary_items')
    .select('id, dia, fecha, hora_inicio, hora_fin, titulo, descripcion, tipo, ubicacion')
    .eq('event_id', family.event_id)
    .in('visibilidad', ['all', 'participant'])
    .order('dia')
    .order('orden')
    .order('hora_inicio')

  const byDay: Record<number, ItineraryItem[]> = {}
  for (const item of (items ?? []) as ItineraryItem[]) {
    if (!byDay[item.dia]) byDay[item.dia] = []
    byDay[item.dia].push(item)
  }

  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b)
  const todayDia = days.find(dia => {
    const dayItems = byDay[dia]
    return dayItems && dayItems[0]?.fecha && isToday(dayItems[0].fecha)
  })

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Programa</h1>

      {!items?.length ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 24, textAlign: 'center', color: '#9ca3af' }}>
          El programa estará disponible próximamente.
        </div>
      ) : (
        days.map(dia => {
          const dayItems = byDay[dia]
          const dayDate = dayItems?.[0]?.fecha ?? null
          const today = dia === todayDia
          return (
            <div key={dia} style={{ marginBottom: 28 }}>
              <div style={{
                padding: '8px 12px',
                background: today ? '#111' : '#f9fafb',
                borderRadius: 8,
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: today ? '#fff' : '#374151' }}>Día {dia}</span>
                  {dayDate && (
                    <span style={{ fontSize: 13, color: today ? '#d1d5db' : '#6b7280', marginLeft: 8 }}>
                      {formatDate(dayDate)}
                    </span>
                  )}
                </div>
                {today && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: '#333', padding: '2px 8px', borderRadius: 10 }}>
                    HOY
                  </span>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                {/* Timeline line */}
                <div style={{
                  position: 'absolute',
                  left: 52,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: '#e5e7eb',
                }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {(dayItems ?? []).map((item, i) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      gap: 0,
                      paddingBottom: i < (dayItems?.length ?? 0) - 1 ? 16 : 0,
                    }}>
                      {/* Time */}
                      <div style={{
                        minWidth: 52,
                        fontSize: 12,
                        color: '#9ca3af',
                        paddingTop: 2,
                        textAlign: 'right',
                        paddingRight: 12,
                        lineHeight: 1.3,
                        flexShrink: 0,
                      }}>
                        {formatTime(item.hora_inicio)}
                      </div>

                      {/* Dot */}
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: today ? '#111' : '#d1d5db',
                        border: `2px solid ${today ? '#111' : '#e5e7eb'}`,
                        marginTop: 4,
                        flexShrink: 0,
                        position: 'relative',
                        zIndex: 1,
                      }} />

                      {/* Content */}
                      <div style={{
                        flex: 1,
                        paddingLeft: 12,
                        paddingBottom: 4,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{item.titulo}</span>
                          <TipoBadge tipo={item.tipo} />
                        </div>
                        {item.hora_fin && (
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>
                            hasta {formatTime(item.hora_fin)}
                          </div>
                        )}
                        {item.ubicacion && (
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>📍 {item.ubicacion}</div>
                        )}
                        {item.descripcion && (
                          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4, lineHeight: 1.5 }}>{item.descripcion}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
