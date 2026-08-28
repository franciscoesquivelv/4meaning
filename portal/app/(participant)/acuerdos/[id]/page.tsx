import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SignAgreementButton from './SignAgreementButton'
import HelpButton from '@/components/HelpButton'

interface AgreementContent {
  intro?: string
  articles?: { heading: string; body: string }[]
  meta?: Record<string, string> | string
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
    <div className="min-h-screen bg-paper px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <a
          href="/acuerdos"
          className="inline-block text-gray-ui text-sm mb-6 no-underline hover:text-ink transition-colors"
        >
          ← Volver a acuerdos
        </a>

        {/* Document */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-6">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b border-slate-100">
            <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">
              {agreement.type}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">{agreement.nombre}</h1>
            {family && (
              <div className="text-sm text-slate-500">{family.nombre_familia}</div>
            )}
          </div>

          {/* Intro */}
          {contenido.intro && (
            <p className="text-sm leading-relaxed text-slate-700 mb-6">
              {contenido.intro}
            </p>
          )}

          {/* Articles */}
          {contenido.articles?.map((article, i) => (
            <div key={i} className="mb-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                {article.heading}
              </h3>
              <p className="text-sm leading-relaxed text-slate-700">
                {article.body}
              </p>
            </div>
          ))}

          {/* Meta */}
          {contenido.meta && (
            typeof contenido.meta === 'string' ? (
              <p className="text-sm leading-relaxed text-slate-600 bg-slate-50 rounded-lg px-4 py-3 mt-6 mb-6">
                {contenido.meta}
              </p>
            ) : Object.keys(contenido.meta).length > 0 ? (
              <div className="bg-slate-50 rounded-lg px-4 py-3 mt-6 mb-6 text-sm text-slate-500">
                {Object.entries(contenido.meta).map(([k, v]) => (
                  <div key={k} className="flex gap-2 mb-1">
                    <span className="font-medium text-slate-700">{k}:</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            ) : null
          )}

          {/* Signature lines */}
          {contenido.sigs && contenido.sigs.length > 0 && (
            <div className="mt-8 flex gap-6 flex-wrap">
              {contenido.sigs.map((sig, i) => (
                <div key={i} className="flex-1 min-w-[120px]">
                  <div className="border-t border-slate-400 pt-2 text-xs text-slate-400 text-center">
                    {sig.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status / Sign */}
        {isSigned ? (
          <div className="bg-white border border-line rounded-xl px-5 py-4 flex gap-3 items-center">
            <div className="w-9 h-9 rounded-full bg-terra/10 border border-terra/40 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-terra-ui" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-ink text-sm">
                {agreement.status === 'approved' ? 'Acuerdo aprobado' : 'Acuerdo firmado'}
              </div>
              {agreement.signed_at && (
                <div className="text-gray-ui text-xs mt-0.5">
                  Firmado el {formatDate(agreement.signed_at)}
                </div>
              )}
            </div>
          </div>
        ) : (
          <SignAgreementButton agreementId={agreement.id} />
        )}
      </div>

      <HelpButton pageId="acuerdos" />
    </div>
  )
}
