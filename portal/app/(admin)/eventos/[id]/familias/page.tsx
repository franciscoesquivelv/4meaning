import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    invited:   { bg: '#ede9fe', color: '#6d28d9', label: 'Invitado' },
    confirmed: { bg: '#dbeafe', color: '#1e40af', label: 'Confirmado' },
    completed: { bg: '#f3f4f6', color: '#6b7280', label: 'Completado' },
    pending:   { bg: '#fef9c3', color: '#854d0e', label: 'Pendiente' },
  }
  const s = map[status] ?? { bg: '#f3f4f6', color: '#374151', label: status }
  return (
    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

export default async function FamiliasPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: families } = await supabase
    .from('families')
    .select('id, nombre_familia, nombre1, email1, nombre2, email2, habitacion, status, notas')
    .eq('event_id', params.id)
    .order('nombre_familia')

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/eventos/${params.id}`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← {evento.nombre}
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Familias</h1>
          <Link
            href={`/eventos/${params.id}/familias/nueva`}
            style={{ padding: '8px 16px', background: '#111', color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            + Agregar familia
          </Link>
        </div>
      </div>

      {!families?.length ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 32, textAlign: 'center', color: '#9ca3af' }}>
          <p style={{ fontSize: 15, marginBottom: 16 }}>No hay familias registradas en este evento.</p>
          <Link
            href={`/eventos/${params.id}/familias/nueva`}
            style={{ padding: '8px 16px', background: '#111', color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            Agregar primera familia
          </Link>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={thStyle}>Familia</th>
                <th style={thStyle}>Integrantes</th>
                <th style={thStyle}>Habitación</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {families.map((f, i) => (
                <tr key={f.id} style={{ borderBottom: i < families.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{f.nombre_familia}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: 13 }}>
                      <div>{f.nombre1} <span style={{ color: '#9ca3af', fontSize: 12 }}>{f.email1}</span></div>
                      {f.nombre2 && (
                        <div style={{ marginTop: 2 }}>{f.nombre2} <span style={{ color: '#9ca3af', fontSize: 12 }}>{f.email2}</span></div>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 13, color: '#374151' }}>{f.habitacion || '—'}</span>
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={f.status} />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link
                        href={`/eventos/${params.id}/familias/${f.id}/editar`}
                        style={{ fontSize: 12, color: '#374151', textDecoration: 'none', padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 5, fontWeight: 500 }}
                      >
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  verticalAlign: 'middle',
}
