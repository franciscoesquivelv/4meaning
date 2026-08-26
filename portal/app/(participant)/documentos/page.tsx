import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const tipoLabels: Record<string, string> = {
  itinerario:       'Itinerario',
  material_familia: 'Material para familias',
  storybook:        'Storybook',
  info_preliminar:  'Info preliminar',
  custom:           'Documento',
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default async function DocumentosPage() {
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
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Documentos</h1>
        <p style={{ color: 'var(--gray)', fontSize: 14 }}>No tienes un evento asignado todavía.</p>
      </div>
    )
  }

  const { data: documents } = await supabase
    .from('documents')
    .select('id, nombre, tipo, pdf_url, created_at, visibilidad')
    .eq('event_id', family.event_id)
    .in('visibilidad', ['participant', 'all'])
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Documentos</h1>

      {!documents?.length ? (
        <p style={{ color: 'var(--gray)', fontSize: 14 }}>No hay documentos disponibles todavía.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {documents.map(doc => (
            <div
              key={doc.id}
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{doc.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--gray)' }}>
                  {tipoLabels[doc.tipo] ?? doc.tipo} · {formatDate(doc.created_at)}
                </div>
              </div>
              {doc.pdf_url && (
                <a
                  href={doc.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '6px 14px',
                    background: '#111',
                    color: '#fff',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    marginLeft: 12,
                    flexShrink: 0,
                  }}
                >
                  Descargar
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
