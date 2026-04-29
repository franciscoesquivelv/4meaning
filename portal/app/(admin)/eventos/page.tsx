import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    draft:     { bg: '#f3f4f6', color: '#374151' },
    active:    { bg: '#dcfce7', color: '#166534' },
    completed: { bg: '#dbeafe', color: '#1e40af' },
    archived:  { bg: '#f3f4f6', color: '#6b7280' },
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

export default async function EventosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: eventos } = await supabase
    .from('events')
    .select('id, nombre, ciudad, pais, fecha_inicio, fecha_fin, n_parejas, status')
    .order('fecha_inicio', { ascending: false })

  return (
    <div style={{ padding: 32, maxWidth: 960 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Eventos</h1>
        <Link
          href="/eventos/nuevo"
          style={{
            padding: '9px 18px',
            background: '#111',
            color: '#fff',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          + Nuevo evento
        </Link>
      </div>

      {!eventos?.length ? (
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Sin eventos registrados.</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Ciudad</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Fechas</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Parejas</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#374151' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((ev, i) => (
                <tr
                  key={ev.id}
                  style={{ borderBottom: i < eventos.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <Link
                      href={`/eventos/${ev.id}`}
                      style={{ fontWeight: 500, color: '#111', textDecoration: 'none' }}
                    >
                      {ev.nombre}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>{ev.ciudad ?? '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                    {formatDate(ev.fecha_inicio)} – {formatDate(ev.fecha_fin)}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>{ev.n_parejas ?? 0}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={ev.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
