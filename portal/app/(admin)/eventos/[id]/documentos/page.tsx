import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

function VisibilidadBadge({ v }: { v: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    all:          { bg: '#dcfce7', color: '#166534', label: 'Todos' },
    participant:  { bg: '#dbeafe', color: '#1e40af', label: 'Participantes' },
    staff:        { bg: '#fef9c3', color: '#854d0e', label: 'Staff' },
    admin:        { bg: '#f3f4f6', color: '#374151', label: 'Admin' },
  }
  const s = map[v] ?? { bg: '#f3f4f6', color: '#374151', label: v }
  return (
    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function DocumentosAdminPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: documents } = await supabase
    .from('documents')
    .select('id, nombre, tipo, visibilidad, pdf_url, created_at, families(nombre_familia)')
    .eq('event_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: 32, maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/eventos/${params.id}`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← {evento.nombre}
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Documentos</h1>
          <Link
            href={`/eventos/${params.id}/documentos/nuevo`}
            style={{ padding: '8px 16px', background: '#111', color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            + Nuevo documento
          </Link>
        </div>
      </div>

      {!documents?.length ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 32, textAlign: 'center', color: '#9ca3af' }}>
          <p style={{ fontSize: 15, marginBottom: 16 }}>No hay documentos en este evento.</p>
          <Link
            href={`/eventos/${params.id}/documentos/nuevo`}
            style={{ padding: '8px 16px', background: '#111', color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            Subir primer documento
          </Link>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Familia</th>
                <th style={thStyle}>Visibilidad</th>
                <th style={thStyle}>PDF</th>
                <th style={thStyle}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(documents as unknown as Array<{
                id: string
                nombre: string
                tipo: string
                visibilidad: string
                pdf_url: string | null
                created_at: string
                families: { nombre_familia: string } | null
              }>).map((doc, i) => (
                <tr key={doc.id} style={{ borderBottom: i < documents.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{doc.nombre}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase' }}>{doc.tipo}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 13, color: '#374151' }}>
                      {doc.families?.nombre_familia ?? <span style={{ color: '#9ca3af' }}>Evento</span>}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <VisibilidadBadge v={doc.visibilidad} />
                  </td>
                  <td style={tdStyle}>
                    {doc.pdf_url ? (
                      <a href={doc.pdf_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
                        Ver PDF
                      </a>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{formatDate(doc.created_at)}</span>
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
