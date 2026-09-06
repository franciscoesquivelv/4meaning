import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import CopiarEnlaceButton from './CopiarEnlaceButton'

function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function FormulariosAdminPage({ params }: { params: { id: string } }) {
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
    .select('id, nombre_familia, nombre1, nombre2')
    .eq('event_id', params.id)
    .order('nombre_familia')

  const { data: responses } = await supabase
    .from('intake_responses')
    .select('id, family_id, submitted_at')
    .eq('event_id', params.id)

  const responseMap = new Map((responses ?? []).map(r => [r.family_id, r]))

  const submitted = (families ?? []).filter(f => responseMap.has(f.id))
  const pending = (families ?? []).filter(f => !responseMap.has(f.id))

  return (
    <div style={{ padding: 32, maxWidth: 760 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/eventos/${params.id}`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← {evento.nombre}
        </Link>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Formularios de intake</h1>
          <div style={{ fontSize: 14, color: '#6b7280' }}>
            {submitted.length}/{(families ?? []).length} enviados
          </div>
        </div>
      </div>

      {/* Progress */}
      {(families ?? []).length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ background: '#e5e7eb', borderRadius: 8, height: 8, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.round((submitted.length / (families ?? []).length) * 100)}%`,
              height: '100%',
              background: '#111',
              borderRadius: 8,
            }} />
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
            {Math.round((submitted.length / (families ?? []).length) * 100)}% completado
          </p>
        </div>
      )}

      {/* Submitted */}
      {submitted.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Enviados ({submitted.length})
          </h2>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            {submitted.map((f, i) => {
              const resp = responseMap.get(f.id)
              return (
                <div key={f.id} style={{
                  padding: '14px 16px',
                  borderBottom: i < submitted.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{f.nombre_familia}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                      {f.nombre1}{f.nombre2 ? ` & ${f.nombre2}` : ''} · Enviado {formatDate(resp?.submitted_at ?? null)}
                    </div>
                  </div>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#dcfce7', color: '#166534' }}>
                    Completado
                  </span>
                  <Link
                    href={`/eventos/${params.id}/formularios/${f.id}`}
                    style={{ fontSize: 13, color: '#374151', textDecoration: 'none', padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontWeight: 500 }}
                  >
                    Ver respuestas
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <section>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Pendientes ({pending.length})
          </h2>
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10 }}>
            Comparte el enlace con las familias para que completen su perfil.
          </p>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            {pending.map((f, i) => (
              <div key={f.id} style={{
                padding: '14px 16px',
                borderBottom: i < pending.length - 1 ? '1px solid #f3f4f6' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {f.nombre_familia}
                    <CopiarEnlaceButton />
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    {f.nombre1}{f.nombre2 ? ` & ${f.nombre2}` : ''}
                  </div>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#fef9c3', color: '#854d0e' }}>
                  Pendiente
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!(families ?? []).length && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 32, textAlign: 'center', color: '#9ca3af' }}>
          No hay familias registradas en este evento.
        </div>
      )}
    </div>
  )
}
