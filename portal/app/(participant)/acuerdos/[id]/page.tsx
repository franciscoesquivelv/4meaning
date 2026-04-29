import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import SignAgreementButton from '@/components/participant/SignAgreementButton'
import { Badge, agreementStatusVariant } from '@/components/ui/badge'
import { STATUS_LABELS } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Acuerdo' }

export default async function AgreementDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: agreement } = await supabase
    .from('agreements')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!agreement) notFound()

  const { intro, articles, meta, sigs } = agreement.contenido
  const isSigned = ['signed', 'approved'].includes(agreement.status)

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link href="/acuerdos" className="text-[10px] text-muted hover:text-ink">
          ← Acuerdos
        </Link>
        <Badge variant={agreementStatusVariant(agreement.status)}>
          {STATUS_LABELS[agreement.status] ?? agreement.status}
        </Badge>
      </div>

      {/* Document */}
      <div className="bg-white rounded-xl px-6 py-7 text-[#1a1a1a]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[6px] font-bold tracking-[0.32em] uppercase text-[#999] mb-1">
            Acuerdo de Confidencialidad
          </p>
          <p className="text-[13px] font-bold uppercase tracking-wide text-[#111]">
            {agreement.nombre}
          </p>
          <div className="w-10 h-px bg-[#d8d6d2] mx-auto mt-3" />
        </div>

        {/* Intro */}
        {intro && (
          <p className="text-[10.5px] leading-7 text-[#1a1a1a] mb-6">{intro}</p>
        )}

        {/* Articles */}
        {articles?.map((art: { heading: string; body: string }, i: number) => (
          <div key={i} className="mb-5">
            <p className="text-[7px] font-bold uppercase tracking-[0.24em] text-[#555] pb-2 border-b border-[#e6e4e0] mb-3">
              {art.heading}
            </p>
            <div className="text-[10.5px] leading-7 text-[#222] whitespace-pre-line">
              {art.body}
            </div>
          </div>
        ))}

        {/* Meta */}
        {meta && (
          <p className="text-[9px] text-[#aaa] mt-6">{meta}</p>
        )}

        {/* Signature lines */}
        <div className="flex gap-6 mt-7">
          {sigs?.map((sig: { label: string }, i: number) => (
            <div key={i} className="flex-1">
              <div className="h-px bg-[#ccc] mb-1.5" />
              <p className="text-[8.5px] text-[#aaa]">{sig.label}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-[6.5px] font-bold tracking-[0.3em] uppercase text-[#bbb] mt-8 pt-4 border-t border-[#ece9e4]">
          TRASCENDENCIA · www.latrascendencia.com
        </p>
      </div>

      {/* Sign button */}
      {!isSigned && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted text-center leading-relaxed">
            Al firmar confirmas que leíste y aceptas el contenido de este acuerdo.
          </p>
          <SignAgreementButton agreementId={agreement.id} />
        </div>
      )}

      {isSigned && (
        <div className="bg-success/8 border border-success/20 rounded-lg px-4 py-3 text-center">
          <p className="text-[11px] text-success font-semibold">
            ✓ Acuerdo firmado
          </p>
          {agreement.signed_at && (
            <p className="text-[10px] text-success/60 mt-1">
              {new Date(agreement.signed_at).toLocaleDateString('es', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
