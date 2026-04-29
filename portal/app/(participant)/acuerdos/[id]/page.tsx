import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SignAgreementButton from './SignAgreementButton'

interface AgreementContent {
  intro?: string
  articles?: { heading: string; body: string }[]
  meta?: Record<string, string>
  sigs?: { label: string }[]
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function AcuerdoDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: agreement } = await supabase
    .from('agreements')
    .select('id, nombre, type, status, contenido, signed_at, families(nombre_familia)')
    .eq('id', params.id)
    .single()

  if (!agreement) notFound()

  const contenido = (agreement.contenido ?? {}) as AgreementContent
  const isSigned = ['signed', 'approved'].includes(agreement.status)
  const family = agreement.families as unknown as { nombre_familia: string } | null

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      {/* Back */}
      <a href="/acuerdos" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
        ← Volver a acuerdos
      </a>

      {/* Document */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 32,
        marginBottom: 24,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            {agreement.type}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{agreement.nombre}</h1>
          {family && <div style={{ fontSize: 14, color: '#6b7280' }}>Familia {family.nombre_familia}</div>}
        </div>

        {/* Intro */}
        {contenido.intro && (
          <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', marginBottom: 24 }}>
            {contenido.intro}
          </p>
        )}

        {/* Articles */}
        {contenido.articles?.map((article, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 6 }}>
              {article.heading}
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151' }}>
              {article.body}
            </p>
          </div>
        ))}

        {/* Meta */}
        {contenido.meta && Object.keys(contenido.meta).length > 0 && (
          <div style={{
            background: '#f9fafb',
            borderRadius: 8,
            padding: '12px 16px',
            marginTop: 24,
            marginBottom: 24,
            fontSize: 13,
            color: '#6b7280',
          }}>
            {Object.entries(contenido.meta).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 500, color: '#374151' }}>{k}:</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Signature lines */}
        {contenido.sigs && contenido.sigs.length > 0 && (
          <div style={{ marginTop: 32, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {contenido.sigs.map((sig, i) => (
              <div key={i} style={{ flex: 1, minWidth: 120 }}>
                <div style={{ borderTop: '1px solid #9ca3af', paddingTop: 8, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
                  {sig.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status / Sign */}
      {isSigned ? (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 10,
          padding: '16px 20px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 20 }}>✓</div>
          <div>
            <div style={{ fontWeight: 600, color: '#166534', fontSize: 14 }}>
              {agreement.status === 'approved' ? 'Acuerdo aprobado' : 'Acuerdo firmado'}
            </div>
            {agreement.signed_at && (
              <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
                Firmado el {formatDate(agreement.signed_at)}
              </div>
            )}
          </div>
        </div>
      ) : (
        <SignAgreementButton agreementId={agreement.id} />
      )}
    </div>
  )
}
