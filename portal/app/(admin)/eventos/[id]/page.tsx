import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    draft:     { bg: '#f3f4f6', color: '#374151' },
    active:    { bg: '#dcfce7', color: '#166534' },
    completed: { bg: '#dbeafe', color: '#1e40af' },
    archived:  { bg: '#f3f4f6', color: '#6b7280' },
    signed:    { bg: '#fef9c3', color: '#854d0e' },
    approved:  { bg: '#dcfce7', color: '#166534' },
    invited:   { bg: '#ede9fe', color: '#6d28d9' },
    confirmed: { bg: '#dbeafe', color: '#1e40af' },
    sent:      { bg: '#fef9c3', color: '#854d0e' },
    viewed:    { bg: '#e0f2fe', color: '#075985' },
  }
  const s = colors[status] ?? { bg: '#f3f4f6', color: '#374151' }
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
    }}>
      {status}
    </span>
  )
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(t: string | null) {
  if (!t) return ''
  return t.slice(0, 5)
}

export default async function EventoDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!evento) notFound()

  const [
    { data: families },
    { data: agreements },
    { data: itinerary },
  ] = await Promise.all([
    supabase
      .from('families')
      .select('id, nombre_familia, habitacion, status')
      .eq('event_id', params.id)
      .order('nombre_familia'),
    supabase
      .from('agreements')
      .select('id, nombre, type, status, signed_at')
      .eq('event_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('itinerary_items')
      .select('id, dia, fecha, hora_inicio, hora_fin, titulo, tipo, ubicacion')
      .eq('event_id', params.id)
      .order('dia')
      .order('orden')
      .order('hora_inicio')
      .limit(8),
  ])

  const signedCount = agreements?.filter(a => ['signed', 'approved'].includes(a.status)).length ?? 0
  const totalAgreements = agreements?.length ?? 0

  // Group itinerary by day
  const byDay: Record<number, typeof itinerary> = {}
  for (const item of itinerary ?? []) {
    if (!byDay[item.dia]) byDay[item.dia] = []
    byDay[item.dia]!.push(item)
  }

  return (
    <div style={{ padding: 32, maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{evento.nombre}</h1>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: '#6b7280', fontSize: 14 }}>
          {evento.ciudad && <span>{evento.ciudad}, {evento.pais}</span>}
          <span>{formatDate(evento.fecha_inicio)} – {formatDate(evento.fecha_fin)}</span>
          {evento.ubicacion && <span>{evento.ubicacion}</span>}
          <StatusBadge status={evento.status} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Familias', value: families?.length ?? 0 },
          { label: 'Acuerdos totales', value: totalAgreements },
          { label: 'Acuerdos firmados/aprobados', value: signedCount },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '16px 20px',
          }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Families */}
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Familias</h2>
          {!families?.length ? (
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Sin familias.</p>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              {families.map((f, i) => (
                <div
                  key={f.id}
                  style={{
                    padding: '10px 16px',
                    borderBottom: i < families.length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 13,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{f.nombre_familia}</div>
                    {f.habitacion && <div style={{ color: '#9ca3af', fontSize: 12 }}>Hab. {f.habitacion}</div>}
                  </div>
                  <StatusBadge status={f.status} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Agreements */}
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Acuerdos recientes</h2>
          {!agreements?.length ? (
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Sin acuerdos.</p>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              {agreements.slice(0, 10).map((ag, i) => (
                <div
                  key={ag.id}
                  style={{
                    padding: '10px 16px',
                    borderBottom: i < Math.min(agreements.length, 10) - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 13,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{ag.nombre}</div>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>{ag.type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={ag.status} />
                    {ag.signed_at && (
                      <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 2 }}>{formatDate(ag.signed_at)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Itinerary preview */}
      {Object.keys(byDay).length > 0 && (
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Itinerario (preview)</h2>
          {Object.entries(byDay).map(([dia, items]) => (
            <div key={dia} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Día {dia}
              </h3>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                {items?.map((item, i) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '10px 16px',
                      borderBottom: i < (items?.length ?? 0) - 1 ? '1px solid #f3f4f6' : 'none',
                      display: 'flex',
                      gap: 16,
                      alignItems: 'flex-start',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ color: '#9ca3af', minWidth: 90, fontSize: 12 }}>
                      {formatTime(item.hora_inicio)}{item.hora_fin ? ` – ${formatTime(item.hora_fin)}` : ''}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.titulo}</div>
                      {item.ubicacion && <div style={{ color: '#9ca3af', fontSize: 12 }}>{item.ubicacion}</div>}
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: 8,
                        fontSize: 11,
                        background: '#f3f4f6',
                        color: '#374151',
                      }}>
                        {item.tipo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
