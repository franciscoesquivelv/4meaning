import { createClient } from '@/lib/supabase/server'
import PublicSignButton from './PublicSignButton'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface AgreementRow {
  id: string
  nombre: string
  type: string
  contenido: unknown
  status: string
  signed_at: string | null
  signing_token: string | null
  family_id: string | null
  event_id: string | null
  families: { nombre_familia: string } | null
  events: { nombre: string } | null
}

export default async function FirmarPage({
  params,
}: {
  params: { token: string }
}) {
  const supabase = createClient()

  const { data } = await supabase
    .from('agreements')
    .select(
      'id, nombre, type, contenido, status, signed_at, signing_token, family_id, event_id, families(nombre_familia), events(nombre)'
    )
    .eq('signing_token', params.token)
    .single()

  const agreement = data as AgreementRow | null

  // Token inválido o no encontrado
  if (!agreement) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-7 h-7 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#F5F0E8] mb-2">
            Este enlace no es válido
          </h1>
          <p className="text-[#B0A898] text-sm">
            El enlace de firma no existe o ha expirado. Solicita uno nuevo a tu coordinador.
          </p>
        </div>
      </div>
    )
  }

  const isSigned =
    agreement.status === 'signed' || agreement.status === 'approved'
  const family = agreement.families as { nombre_familia: string } | null
  const event = agreement.events as { nombre: string } | null
  const contenido = (agreement.contenido ?? null) as string | null

  // Ya firmado
  if (isSigned) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/40 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#F5F0E8] mb-1">
            Este acuerdo ya fue firmado
          </h1>
          {agreement.signed_at && (
            <p className="text-[#B0A898] text-sm mb-4">
              Firmado el {formatDate(agreement.signed_at)}
            </p>
          )}
          <div className="bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 text-left mt-4">
            <p className="text-[#F5F0E8] font-medium text-sm">{agreement.nombre}</p>
            {family?.nombre_familia && (
              <p className="text-[#B0A898] text-xs mt-1">{family.nombre_familia}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Disponible para firmar
  return (
    <div className="max-w-lg mx-auto px-6 pt-10 pb-20">
      {/* Header */}
      <div className="mb-8">
        {event?.nombre && (
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] mb-2">
            {event.nombre}
          </p>
        )}
        <h1 className="text-3xl font-light font-[family-name:var(--font-cormorant)] text-[#F5F0E8] leading-tight mb-1">
          {agreement.nombre}
        </h1>
        {family?.nombre_familia && (
          <p className="text-sm text-[#B0A898]">{family.nombre_familia}</p>
        )}
      </div>

      {/* Contenido del acuerdo */}
      {contenido && typeof contenido === 'string' && contenido.trim().length > 0 && (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 mb-8">
          <p className="text-sm leading-relaxed text-[#D4CFC9] whitespace-pre-wrap">
            {contenido}
          </p>
        </div>
      )}

      {/* Separador */}
      <div className="border-t border-white/10 mb-6" />

      {/* Sección de firma */}
      <p className="text-sm text-[#B0A898] mb-6 leading-relaxed">
        Al firmar este documento confirmas que has leído y aceptas los términos.
      </p>

      <PublicSignButton token={params.token} agreementId={agreement.id} />
    </div>
  )
}
