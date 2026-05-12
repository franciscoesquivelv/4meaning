'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ApproveButton({ agreementId, adminId }: { agreementId: string; adminId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleApprove() {
    setLoading(true)
    await supabase
      .from('agreements')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: adminId,
      })
      .eq('id', agreementId)
    setLoading(false)
    setConfirming(false)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#A09A8F] whitespace-nowrap">¿Confirmar?</span>
        <button
          onClick={handleApprove}
          disabled={loading}
          className={[
            'px-3 py-1.5 bg-[#16A34A] text-white text-xs font-semibold rounded-lg transition-opacity whitespace-nowrap cursor-pointer',
            loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700',
          ].join(' ')}
        >
          {loading ? 'Aprobando...' : 'Sí, aprobar'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="px-3 py-1.5 bg-[#3A3A3A] text-[#A09A8F] text-xs font-semibold rounded-lg transition-opacity whitespace-nowrap cursor-pointer hover:bg-[#4A4A4A] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 bg-[#16A34A] text-white text-xs font-semibold rounded-lg transition-opacity whitespace-nowrap cursor-pointer hover:bg-green-700"
    >
      Aprobar
    </button>
  )
}
