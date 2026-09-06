import { createServiceClient } from '@/lib/supabase/server'
import PublicSignButton from './PublicSignButton'

interface AgreementContent {
  intro?: string
  articles?: { heading: string; body: string }[]
  meta?: string
  sigs?: { label: string }[]
}

interface AgreementRow {
  id: string
  nombre: string
  type: string
  contenido: unknown
  status: string
  signed_at: string | null
  signed_name: string | null
  signing_token: string | null
  family_id: string | null
  event_id: string | null
  families: { nombre_familia: string } | null
  events: { nombre: string } | null
}

function formatDate(d: string | null) {
  // Marcador de nulo. Era el caracter de guion largo, que la marca no usa en
  // texto visible.
  if (!d) return 'Sin fecha'
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const TYPE_LABELS: Record<string, string> = {
  participante: 'Acuerdo de Participación',
  video: 'Autorización de Imagen y Video',
  staff: 'Acuerdo de Confidencialidad',
  custom: 'Acuerdo',
}

export default async function FirmarPage({
  params,
}: {
  params: { token: string }
}) {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('agreements')
    .select(
      'id, nombre, type, contenido, status, signed_at, signed_name, signing_token, family_id, event_id, families(nombre_familia), events(nombre)'
    )
    .eq('signing_token', params.token)
    .single()

  const agreement = data as AgreementRow | null

  // Token inválido o no encontrado
  if (!agreement) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-alerta/10 border border-alerta/40 flex items-center justify-center mx-auto mb-5 text-alerta">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-ink mb-2">Enlace no válido</h1>
          <p className="text-gray-ui text-sm">
            Este enlace no existe o ha expirado. Solicita uno nuevo a tu coordinador.
          </p>
        </div>
      </div>
    )
  }

  const isSigned = agreement.status === 'signed' || agreement.status === 'approved'
  const family = agreement.families as { nombre_familia: string } | null
  const event = agreement.events as { nombre: string } | null
  const contenido = (agreement.contenido ?? {}) as AgreementContent

  // Ya firmado
  if (isSigned) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-terra/10 border border-terra/40 flex items-center justify-center mx-auto mb-5 text-terra-ui">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-ink mb-1">Acuerdo firmado</h1>
          {agreement.signed_at && (
            <p className="text-gray-ui text-sm mb-4">
              Firmado el {formatDate(agreement.signed_at)}
              {agreement.signed_name ? ` por ${agreement.signed_name}` : ''}
            </p>
          )}
          <div className="bg-paper-2 border border-line rounded-xl px-5 py-4 text-left mt-4">
            <p className="text-ink font-medium text-sm">{agreement.nombre}</p>
            {family?.nombre_familia && (
              <p className="text-gray-ui text-xs mt-1">{family.nombre_familia}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Disponible para firmar
  return (
    <div className="max-w-2xl mx-auto px-4 pt-10 pb-24">

      {/* Marca */}
      <div className="text-center mb-8">
        <p className="cejilla">Trascendencia</p>
      </div>

      {/* Documento */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">

        {/* Header del documento */}
        <div className="px-8 pt-10 pb-7 border-b border-line text-center">
          <div className="cejilla mb-2">
            {TYPE_LABELS[agreement.type] ?? 'Acuerdo'}
          </div>
          <h1 className="display text-[22px] text-ink mb-1">
            {agreement.nombre}
          </h1>
          {family?.nombre_familia && (
            <p className="text-sm text-gray-ui">{family.nombre_familia}</p>
          )}
          {event?.nombre && (
            <p className="text-xs text-gray-ui mt-1">{event.nombre}</p>
          )}
        </div>

        {/* Cuerpo del documento */}
        <div className="px-8 py-7">

          {/* Intro */}
          {contenido.intro && (
            <p className="text-sm leading-relaxed text-ink mb-7">
              {contenido.intro}
            </p>
          )}

          {/* Artículos */}
          {contenido.articles && contenido.articles.length > 0 && (
            <div className="space-y-5 mb-7">
              {contenido.articles.map((article, i) => (
                <div key={i}>
                  <h3 className="text-sm font-semibold text-ink mb-1">
                    {i + 1}. {article.heading}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-ui">
                    {article.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Cierre */}
          {contenido.meta && (
            <p className="text-xs leading-relaxed text-gray-ui italic border-t border-line pt-5 mb-5">
              {contenido.meta}
            </p>
          )}

          {/* Líneas de firma */}
          {contenido.sigs && contenido.sigs.length > 0 && (
            <div className="flex gap-8 flex-wrap mt-6 pt-6 border-t border-line">
              {contenido.sigs.map((sig, i) => (
                <div key={i} className="flex-1 min-w-[100px]">
                  <div className="border-t-2 border-line pt-2 text-xs text-gray-ui text-center">
                    {sig.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sección de firma electrónica */}
      <div className="bg-paper-2 border border-line border-l-4 border-l-terra rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-ink mb-1">Firma electrónica</h2>
        <p className="text-xs text-gray-ui mb-5 leading-relaxed">
          Tu nombre y la fecha quedarán registrados como constancia de tu aceptación voluntaria de este acuerdo.
        </p>
        <PublicSignButton token={params.token} agreementId={agreement.id} />
      </div>

    </div>
  )
}
