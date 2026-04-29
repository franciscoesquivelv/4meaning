import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    draft:     { bg: '#f3f4f6', color: '#374151' },
    active:    { bg: '#dcfce7', color: '#166534' },
    completed: { bg: '#dbeafe', color: '#1e40af' },
    archived:  { bg: '#f3f4f6', color: '#6b7280' },
    signed:    { bg: '#fef9c3', color: '#854d0e' },
    approved:  { bg: '#dcfce7', color: '#166534' },
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

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const [
    { count: eventsCount },
    { count: familiesCount },
    { count: pendingAgreementsCount },
    { data: activeEvents },
    { data: pendingAgreements },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('families').select('*', { count: 'exact', head: true }),
    supabase.from('agreements').select('*', { count: 'exact', head: true }).eq('status', 'signed'),
    supabase
      .from('events')
      .select('id, nombre, ciudad, fecha_inicio, fecha_fin, status')
      .in('status', ['draft', 'active'])
      .order('fecha_inicio', { ascending: false }),
    supabase
      .from('agreements')
      .select('id, nombre, type, status, signed_at, families(nombre_familia)')
      .eq('status', 'signed')
      .order('signed_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div style={{ padding: 32, maxWidth: 960 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        Hola, {profile?.full_name ?? user.email}
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Resumen del portal Trascendencia</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Eventos', value: eventsCount ?? 0 },
          { label: 'Familias', value: familiesCount ?? 0 },
          { label: 'Acuerdos pendientes (firmados)', value: pendingAgreementsCount ?? 0 },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '20px 24px',
          }}>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Active Events */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Eventos activos / borrador</h2>
        {!activeEvents?.length ? (
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Sin eventos activos.</p>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Ciudad</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Fechas</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {activeEvents.map((ev, i) => (
                  <tr key={ev.id} style={{ borderBottom: i < activeEvents.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{ev.nombre}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{ev.ciudad ?? '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                      {formatDate(ev.fecha_inicio)} – {formatDate(ev.fecha_fin)}
                    </td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={ev.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pending Agreements */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Acuerdos pendientes de aprobación</h2>
        {!pendingAgreements?.length ? (
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Sin acuerdos pendientes.</p>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Familia</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Acuerdo</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Firmado</th>
                </tr>
              </thead>
              <tbody>
                {pendingAgreements.map((ag, i) => {
                  const family = ag.families as unknown as { nombre_familia: string } | null
                  return (
                    <tr key={ag.id} style={{ borderBottom: i < pendingAgreements.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{family?.nombre_familia ?? '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{ag.nombre}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{ag.signed_at ? formatDate(ag.signed_at) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
