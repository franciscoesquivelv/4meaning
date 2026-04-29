'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function ApproveButton({ agreementId }: { agreementId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function approve() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from('agreements')
      .update({
        status:      'approved',
        approved_at: new Date().toISOString(),
        approved_by: user?.id,
      })
      .eq('id', agreementId)

    router.refresh()
    setLoading(false)
  }

  return (
    <Button size="sm" loading={loading} onClick={approve}>
      Aprobar
    </Button>
  )
}
