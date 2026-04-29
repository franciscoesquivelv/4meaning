'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteItemButton({ itemId }: { itemId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleDelete() {
    if (!confirm('¿Eliminar este item del itinerario?')) return
    setLoading(true)
    await supabase.from('itinerary_items').delete().eq('id', itemId)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={[
        'px-2.5 py-1 text-xs text-[#DC2626] border border-[#FCA5A5] rounded-lg transition-colors whitespace-nowrap cursor-pointer bg-transparent',
        loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#FEE2E2]',
      ].join(' ')}
    >
      {loading ? '...' : 'Eliminar'}
    </button>
  )
}
