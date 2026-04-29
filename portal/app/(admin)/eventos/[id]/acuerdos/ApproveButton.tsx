'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ApproveButton({ agreementId, adminId }: { agreementId: string; adminId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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
    router.refresh()
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className={[
        'px-3 py-1.5 bg-[#16A34A] text-white text-xs font-semibold rounded-lg transition-opacity whitespace-nowrap cursor-pointer',
        loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700',
      ].join(' ')}
    >
      {loading ? 'Aprobando...' : 'Aprobar'}
    </button>
  )
}
