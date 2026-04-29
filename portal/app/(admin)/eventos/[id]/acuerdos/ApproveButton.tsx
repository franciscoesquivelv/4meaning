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
      style={{
        padding: '6px 14px',
        background: '#166534',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? 'Aprobando...' : 'Aprobar'}
    </button>
  )
}
