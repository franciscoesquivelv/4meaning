'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function SignAgreementButton({ agreementId }: { agreementId: string }) {
  const [signedName, setSignedName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSign() {
    if (signedName.trim().length < 3) return
    setLoading(true)
    setError('')

    const { error: updateError } = await supabase
      .from('agreements')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
        signed_name: signedName.trim(),
        signed_user_agent: navigator.userAgent,
        signed_ip: null,
      })
      .eq('id', agreementId)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setDone(true)
    router.refresh()
  }

  if (done) {
    return (
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-6 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/40 flex items-center justify-center">
          <svg className="w-6 h-6 text-[#C9A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[#F5F0E8] font-semibold text-sm">Acuerdo firmado correctamente</p>
        <p className="text-[#F5F0E8]/50 text-xs text-center">Tu firma ha sido registrada.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="signed-name" className="text-[#F5F0E8] text-sm font-medium">
          Escribe tu nombre completo para firmar
        </label>
        <input
          id="signed-name"
          type="text"
          value={signedName}
          onChange={(e) => setSignedName(e.target.value)}
          placeholder="Nombre completo"
          className="bg-[#0C0C0C] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[#F5F0E8] text-sm placeholder:text-[#F5F0E8]/30 focus:outline-none focus:border-[#C9A96E]/60 transition-colors"
        />
        <p className="text-[#F5F0E8]/40 text-xs mt-1">
          Al escribir tu nombre confirmas que has leído y aceptas este acuerdo.
        </p>
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      <button
        onClick={handleSign}
        disabled={loading || signedName.trim().length < 3}
        className="w-full py-2.5 px-6 bg-[#C9A96E] text-[#0C0C0C] font-semibold text-sm rounded-lg transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
      >
        {loading ? 'Firmando...' : 'Firmar acuerdo'}
      </button>
    </div>
  )
}
