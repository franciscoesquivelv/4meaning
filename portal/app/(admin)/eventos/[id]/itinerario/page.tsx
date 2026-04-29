import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import DeleteItemButton from './DeleteItemButton'

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

interface ItineraryItem {
  id: string
  dia: number
  fecha: string | null
  hora_inicio: string | null
  hora_fin: string | null
  titulo: string
  descripcion: string | null
  tipo: string
  visibilidad: string
  ubicacion: string | null
  responsable: string | null
}

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

  const { data: items } = await supabase
    .from('itinerary_items')
    .select('id, dia, fecha, hora_inicio, hora_fin, titulo, descripcion, tipo, visibilidad, ubicacion, responsable')
    .eq('event_id', params.id)
    .order('dia')
    .order('orden')
    .order('hora_inicio')

  const byDay: Record<number, ItineraryItem[]> = {}
  for (const item of (items ?? []) as ItineraryItem[]) {
    if (!byDay[item.dia]) byDay[item.dia] = []
    byDay[item.dia].push(item)
  }

  return (
    <div style={{ padding: 32, maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/eventos/${params.id}`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← {evento.nombre}
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Itinerario</h1>
          <Link
            href={`/eventos/${params.id}/itinerario/nuevo`}
            style={{ padding: '8px 16px', background: '#111', color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            + Agregar item
          </Link>
        </div>
      </div>

      {!items?.length ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 32, textAlign: 'center', color: '#9ca3af' }}>
          <p style={{ fontSize: 15, marginBottom: 16 }}>El itinerario está vacío.</p>
          <Link
            href={`/eventos/${params.id}/itinerario/nuevo`}
            style={{ padding: '8px 16px', background: '#111', color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            Agregar primer item
          </Link>
        </div>
      ) : (
        Object.entries(byDay).map(([dia, dayItems]) => (
          <div key={dia} style={{ marginBottom: 28 }}>
            <div style={{ marginBottom: 10 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>Día {dia}</h2>
              {dayItems[0]?.fecha && (
                <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>{formatDate(dayItems[0].fecha)}</p>
              )}
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
              {dayItems.map((item, i) => (
                <div key={item.id} style={{
                  padding: '12px 16px',
                  borderBottom: i < dayItems.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                }}>
                  <div style={{ minWidth: 100, fontSize: 12, color: '#9ca3af', paddingTop: 2 }}>
                    {formatTime(item.hora_inicio)}{item.hora_fin ? ` – ${formatTime(item.hora_fin)}` : ''}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{item.titulo}</span>
                      <TipoBadge tipo={item.tipo} />
                      {item.visibilidad === 'staff_only' && (
                        <span style={{ padding: '1px 6px', borderRadius: 6, fontSize: 10, background: '#fef9c3', color: '#854d0e', fontWeight: 600 }}>
                          STAFF
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6b7280' }}>
                      {item.ubicacion && <span>📍 {item.ubicacion}</span>}
                      {item.responsable && <span>👤 {item.responsable}</span>}
                    </div>
                  </div>
                  <DeleteItemButton itemId={item.id} />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
