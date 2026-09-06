import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PrintButton, BackButton } from '../PrintButtons'

interface AgreementContent {
  intro?: string
  articles?: { heading: string; body: string }[]
  meta?: string
  sigs?: { label: string }[]
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

export default async function ImprimirAcuerdoPage({
  searchParams,
}: {
  searchParams: { agreement_id?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { agreement_id } = searchParams
  if (!agreement_id) {
    return <div style={{ padding: 32, fontFamily: 'sans-serif', color: '#666' }}>Parámetro agreement_id requerido.</div>
  }

  const { data: agreement } = await supabase
    .from('agreements')
    .select('id, nombre, type, contenido, status, signed_at, signed_name, signed_ip, signed_user_agent, families(nombre_familia), events(nombre, ciudad, pais, fecha_inicio)')
    .eq('id', agreement_id)
    .single()

  if (!agreement) {
    return <div style={{ padding: 32, fontFamily: 'sans-serif', color: '#666' }}>Acuerdo no encontrado.</div>
  }

  const contenido = (agreement.contenido ?? {}) as AgreementContent
  const family = agreement.families as unknown as { nombre_familia: string } | null
  const event = agreement.events as unknown as { nombre: string; ciudad: string | null; pais: string | null; fecha_inicio: string | null } | null
  const isSigned = agreement.status === 'signed' || agreement.status === 'approved'

  const eventDate = event?.fecha_inicio
    ? new Date(event.fecha_inicio + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  return (
    <div>
      {/* Botón imprimir: no aparece en impresión */}
      <div className="no-print" style={{
        position: 'fixed', top: 16, right: 16, zIndex: 100,
        display: 'flex', gap: 8,
      }}>
        <PrintButton label="Imprimir / Guardar PDF" />
        <BackButton />
      </div>

      {/* Documento */}
      <div style={{
        maxWidth: 680, margin: '40px auto', padding: '0 24px 60px',
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40, borderBottom: '1px solid #e2e8f0', paddingBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>
            Trascendencia
          </div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 12 }}>
            {TYPE_LABELS[agreement.type] ?? 'Acuerdo'}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            {agreement.nombre}
          </h1>
          {family?.nombre_familia && (
            <div style={{ fontSize: 14, color: '#475569', marginBottom: 4 }}>{family.nombre_familia}</div>
          )}
          {event?.nombre && (
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {event.nombre}
              {eventDate ? ` · ${eventDate}` : ''}
              {event.ciudad ? ` · ${event.ciudad}` : ''}
            </div>
          )}
        </div>

        {/* Sello FIRMADO: solo si está firmado */}
        {isSigned && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 10, padding: '10px 16px', marginBottom: 28,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>✓</span>
            </div>
            <div style={{ fontFamily: 'sans-serif' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>
                Acuerdo firmado
                {agreement.status === 'approved' ? ' y aprobado' : ''}
              </div>
              {agreement.signed_at && (
                <div style={{ fontSize: 11, color: '#4ade80', marginTop: 1 }}>
                  {formatDate(agreement.signed_at)}
                  {agreement.signed_name ? ` · Por: ${agreement.signed_name}` : ''}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Intro */}
        {contenido.intro && (
          <p style={{ fontSize: 14, lineHeight: 1.7, color: '#334155', marginBottom: 28 }}>
            {contenido.intro}
          </p>
        )}

        {/* Artículos */}
        {contenido.articles && contenido.articles.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            {contenido.articles.map((article, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>
                  {i + 1}. {article.heading}
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: '#475569', margin: 0 }}>
                  {article.body}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Cierre */}
        {contenido.meta && (
          <p style={{
            fontSize: 12, lineHeight: 1.6, color: '#64748b', fontStyle: 'italic',
            borderTop: '1px solid #e2e8f0', paddingTop: 16, marginBottom: 28,
          }}>
            {contenido.meta}
          </p>
        )}

        {/* Líneas de firma */}
        {contenido.sigs && contenido.sigs.length > 0 && (
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', marginTop: 32, paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
            {contenido.sigs.map((sig, i) => (
              <div key={i} style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
                {isSigned && agreement.signed_name && i === 0 ? (
                  <div style={{
                    fontFamily: '"Segoe Script", "Comic Sans MS", cursive',
                    fontSize: 18, color: '#1e40af', marginBottom: 4, minHeight: 28,
                  }}>
                    {agreement.signed_name}
                  </div>
                ) : (
                  <div style={{ height: 28 }} />
                )}
                <div style={{ borderTop: '1.5px solid #64748b', paddingTop: 6, fontSize: 11, color: '#64748b' }}>
                  {sig.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Metadata forense: pie de página */}
        {isSigned && (
          <div style={{
            marginTop: 48, paddingTop: 16, borderTop: '1px dashed #cbd5e1',
            fontFamily: 'monospace', fontSize: 10, color: '#94a3b8',
            lineHeight: 1.8,
          }}>
            <div style={{ fontFamily: 'sans-serif', fontSize: 10, fontWeight: 600, color: '#94a3b8', marginBottom: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Registro de firma electrónica
            </div>
            {agreement.signed_name && <div>Firmado por: {agreement.signed_name}</div>}
            {agreement.signed_at && <div>Fecha: {formatDate(agreement.signed_at)}</div>}
            {agreement.signed_ip && <div>IP: {agreement.signed_ip}</div>}
            {agreement.signed_user_agent && (
              <div style={{ wordBreak: 'break-all' }}>UA: {agreement.signed_user_agent}</div>
            )}
            <div>ID del acuerdo: {agreement.id}</div>
          </div>
        )}
      </div>
    </div>
  )
}
