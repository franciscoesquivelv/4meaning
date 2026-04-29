import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string; label: string }> = {
    draft:     { bg: '#f3f4f6', color: '#374151', label: 'Borrador' },
    active:    { bg: '#dcfce7', color: '#166534', label: 'Activo' },
    completed: { bg: '#dbeafe', color: '#1e40af', label: 'Completado' },
    archived:  { bg: '#f3f4f6', color: '#6b7280', label: 'Archivado' },
  }
  const s = colors[status] ?? { bg: '#f3f4f6', color: '#374151', label: status }
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
    }}>
      {s.label}
    </span>
  )
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
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
    { data: documents },
    { data: responses },
  ] = await Promise.all([
    supabase.from('families').select('id, nombre_familia, habitacion, status').eq('event_id', params.id).order('nombre_familia'),
    supabase.from('agreements').select('id, nombre, type, status, signed_at').eq('event_id', params.id).order('created_at', { ascending: false }),
    supabase.from('itinerary_items').select('id, dia, hora_inicio, hora_fin, titulo, tipo, ubicacion').eq('event_id', params.id).order('dia').order('orden').order('hora_inicio').limit(6),
    supabase.from('documents').select('id').eq('event_id', params.id),
    supabase.from('intake_responses').select('id, family_id').eq('event_id', params.id),
  ])

  const familiesCount = families?.length ?? 0
  const agreementsCount = agreements?.length ?? 0
  const itineraryCount = (await supabase.from('itinerary_items').select('id', { count: 'exact', head: true }).eq('event_id', params.id)).count ?? 0
  const documentsCount = documents?.length ?? 0
  const formulariosCount = responses?.length ?? 0

  const signedCount = agreements?.filter(a => ['signed', 'approved'].includes(a.status)).length ?? 0

  const tabs = [
    { href: `/eventos/${params.id}/familias`, label: 'Familias', count: familiesCount, color: '#6d28d9' },
    { href: `/eventos/${params.id}/acuerdos`, label: 'Acuerdos', count: agreementsCount, color: '#1e40af' },
    { href: `/eventos/${params.id}/itinerario`, label: 'Itinerario', count: itineraryCount, color: '#166534' },
    { href: `/eventos/${params.id}/documentos`, label: 'Documentos', count: documentsCount, color: '#854d0e' },
    { href: `/eventos/${params.id}/formularios`, label: 'Formularios', count: formulariosCount, color: '#0369a1' },
  ]

  return (
    <div style={{ padding: 32, maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/eventos" style={{ color: '#6b7280', fontSize: 13, textDecoration: 'none' }}>← Todos los eventos</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 10 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, marginTop: 0 }}>{evento.nombre}</h1>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: '#6b7280', fontSize: 14, alignItems: 'center' }}>
              {evento.ciudad && <span>{evento.ciudad}{evento.pais ? `, ${evento.pais}` : ''}</span>}
              <span>{formatDate(evento.fecha_inicio)} – {formatDate(evento.fecha_fin)}</span>
              {evento.ubicacion && <span>{evento.ubicacion}</span>}
              <StatusBadge status={evento.status} />
            </div>
          </div>
          <Link
            href={`/eventos/${params.id}/editar`}
            style={{ padding: '8px 16px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Editar evento
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Familias inscritas', value: familiesCount },
          { label: 'Acuerdos totales', value: agreementsCount },
          { label: 'Acuerdos firmados', value: signedCount },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '16px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Navigation tabs */}
      <h2 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Secciones del evento</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 36 }}>
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '16px',
              textDecoration: 'none',
              color: '#111',
              display: 'block',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: tab.color }}>{tab.count}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 4 }}>{tab.label}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Ver todos →</div>
          </Link>
        ))}
      </div>

      {/* Notas internas */}
      {evento.notas_internas && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 10, padding: 16, marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#78350f', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Notas internas
          </div>
          <p style={{ fontSize: 14, color: '#78350f', margin: 0, lineHeight: 1.5 }}>{evento.notas_internas}</p>
        </div>
      )}

      {/* Families preview + Agreements preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Families */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Familias recientes</h3>
            <Link href={`/eventos/${params.id}/familias`} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>Ver todas</Link>
          </div>
          {!families?.length ? (
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Sin familias.</p>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              {families.slice(0, 5).map((f, i) => (
                <div key={f.id} style={{ padding: '10px 14px', borderBottom: i < Math.min(families.length, 5) - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{f.nombre_familia}</div>
                    {f.habitacion && <div style={{ color: '#9ca3af', fontSize: 12 }}>Hab. {f.habitacion}</div>}
                  </div>
                  <span style={{ padding: '2px 7px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: '#f3f4f6', color: '#374151' }}>{f.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Agreements */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Acuerdos recientes</h3>
            <Link href={`/eventos/${params.id}/acuerdos`} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>Ver todos</Link>
          </div>
          {!agreements?.length ? (
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Sin acuerdos.</p>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              {agreements.slice(0, 5).map((ag, i) => (
                <div key={ag.id} style={{ padding: '10px 14px', borderBottom: i < Math.min(agreements.length, 5) - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{ag.nombre}</div>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>{ag.type}</div>
                  </div>
                  <span style={{ padding: '2px 7px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: '#f3f4f6', color: '#374151' }}>{ag.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Itinerary preview */}
      {itinerary && itinerary.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Itinerario (preview)</h3>
            <Link href={`/eventos/${params.id}/itinerario`} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>Ver completo</Link>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            {itinerary.map((item, i) => (
              <div key={item.id} style={{ padding: '10px 14px', borderBottom: i < itinerary.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 13 }}>
                <div style={{ color: '#9ca3af', minWidth: 80, fontSize: 12 }}>
                  Día {item.dia} {item.hora_inicio ? `· ${item.hora_inicio.slice(0, 5)}` : ''}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{item.titulo}</div>
                  {item.ubicacion && <div style={{ color: '#9ca3af', fontSize: 12 }}>{item.ubicacion}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
