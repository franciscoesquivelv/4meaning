import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PrintButton, BackButton } from '../PrintButtons'

interface AgreementContent {
  intro?: string
  articles?: { heading: string; body: string }[]
  meta?: string
  sigs?: { label: string }[]
}

interface Agreement {
  id: string
  nombre: string
  type: string
  contenido: unknown
  status: string
  signed_at: string | null
  signed_name: string | null
  signed_ip: string | null
  signed_user_agent: string | null
  families: { nombre_familia: string } | null
  events: { nombre: string; ciudad: string | null; fecha_inicio: string | null } | null
}

const TYPE_LABELS: Record<string, string> = {
  participante: 'Acuerdo de Participación',
  video: 'Autorización de Imagen y Video',
  staff: 'Acuerdo de Confidencialidad',
  custom: 'Acuerdo',
}

function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function AgreementDoc({ ag, showPageBreak }: { ag: Agreement; showPageBreak: boolean }) {
  const contenido = (ag.contenido ?? {}) as AgreementContent
  const family = ag.families as { nombre_familia: string } | null
  const event = ag.events as { nombre: string; ciudad: string | null; fecha_inicio: string | null } | null
  const isSigned = ag.status === 'signed' || ag.status === 'approved'

  const eventDate = event?.fecha_inicio
    ? new Date(event.fecha_inicio + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  return (
    <div style={{
      padding: '48px 56px',
      pageBreakAfter: showPageBreak ? 'always' : 'auto',
      minHeight: showPageBreak ? '100vh' : undefined,
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32, borderBottom: '1px solid #e2e8f0', paddingBottom: 24 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>
          Trascendencia · {TYPE_LABELS[ag.type] ?? 'Acuerdo'}
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '4px 0 6px', fontFamily: 'Georgia, serif' }}>
          {ag.nombre}
        </h2>
        {family?.nombre_familia && (
          <div style={{ fontSize: 13, color: '#475569', fontFamily: 'sans-serif' }}>{family.nombre_familia}</div>
        )}
        {event?.nombre && (
          <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'sans-serif', marginTop: 2 }}>
            {event.nombre}{eventDate ? ` · ${eventDate}` : ''}{event.ciudad ? ` · ${event.ciudad}` : ''}
          </div>
        )}
      </div>

      {/* Badge firmado */}
      {isSigned && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 8, padding: '6px 14px', marginBottom: 24,
          fontFamily: 'sans-serif',
        }}>
          <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 13 }}>✓</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#15803d' }}>
            Firmado · {formatDate(ag.signed_at)}{ag.signed_name ? ` · ${ag.signed_name}` : ''}
          </span>
        </div>
      )}

      {/* Intro */}
      {contenido.intro && (
        <p style={{ fontSize: 13, lineHeight: 1.7, color: '#334155', marginBottom: 20, fontFamily: 'Georgia, serif' }}>
          {contenido.intro}
        </p>
      )}

      {/* Artículos */}
      {contenido.articles && contenido.articles.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {contenido.articles.map((article, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4, fontFamily: 'sans-serif' }}>
                {i + 1}. {article.heading}
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.7, color: '#475569', margin: 0, fontFamily: 'Georgia, serif' }}>
                {article.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Cierre */}
      {contenido.meta && (
        <p style={{
          fontSize: 11, lineHeight: 1.6, color: '#64748b', fontStyle: 'italic',
          borderTop: '1px solid #e2e8f0', paddingTop: 12, marginBottom: 20,
          fontFamily: 'Georgia, serif',
        }}>
          {contenido.meta}
        </p>
      )}

      {/* Líneas de firma */}
      {contenido.sigs && contenido.sigs.length > 0 && (
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
          {contenido.sigs.map((sig, i) => (
            <div key={i} style={{ flex: 1, minWidth: 100, textAlign: 'center' }}>
              {isSigned && ag.signed_name && i === 0 ? (
                <div style={{
                  fontFamily: '"Segoe Script", "Comic Sans MS", cursive',
                  fontSize: 16, color: '#1e40af', marginBottom: 4, minHeight: 24,
                }}>
                  {ag.signed_name}
                </div>
              ) : (
                <div style={{ height: 24 }} />
              )}
              <div style={{ borderTop: '1.5px solid #64748b', paddingTop: 4, fontSize: 10, color: '#64748b', fontFamily: 'sans-serif' }}>
                {sig.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metadata forense */}
      {isSigned && (
        <div style={{
          marginTop: 32, paddingTop: 10, borderTop: '1px dashed #cbd5e1',
          fontFamily: 'monospace', fontSize: 9, color: '#94a3b8', lineHeight: 1.8,
        }}>
          <span style={{ fontFamily: 'sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Registro de firma electrónica ·
          </span>
          {ag.signed_name && ` Por: ${ag.signed_name} ·`}
          {ag.signed_at && ` ${formatDate(ag.signed_at)} ·`}
          {ag.signed_ip && ` IP: ${ag.signed_ip} ·`}
          {` ID: ${ag.id}`}
        </div>
      )}
    </div>
  )
}

export default async function ImprimirAcuerdosPage({
  searchParams,
}: {
  searchParams: { event_id?: string; solo_firmados?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { event_id, solo_firmados } = searchParams
  if (!event_id) {
    return <div style={{ padding: 32, fontFamily: 'sans-serif', color: '#666' }}>Parámetro event_id requerido.</div>
  }

  let query = supabase
    .from('agreements')
    .select('id, nombre, type, contenido, status, signed_at, signed_name, signed_ip, signed_user_agent, families(nombre_familia), events(nombre, ciudad, fecha_inicio)')
    .eq('event_id', event_id)
    .order('created_at', { ascending: true })

  if (solo_firmados === '1') {
    query = query.in('status', ['signed', 'approved'])
  }

  const { data: agreements } = await query

  if (!agreements || agreements.length === 0) {
    return (
      <div style={{ padding: 48, fontFamily: 'sans-serif', textAlign: 'center', color: '#666' }}>
        No hay acuerdos para este evento.
      </div>
    )
  }

  const signedCount = agreements.filter(a => ['signed', 'approved'].includes(a.status)).length

  return (
    <div>
      {/* Controles: no imprimen */}
      <div className="no-print" style={{
        position: 'fixed', top: 16, right: 16, zIndex: 100,
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#64748b' }}>
          {agreements.length} acuerdos · {signedCount} firmados
        </span>
        <PrintButton label="Guardar PDF completo" />
        <BackButton />
      </div>

      {/* Un acuerdo por hoja */}
      {(agreements as unknown as Agreement[]).map((ag, i) => (
        <AgreementDoc
          key={ag.id}
          ag={ag}
          showPageBreak={i < agreements.length - 1}
        />
      ))}
    </div>
  )
}
