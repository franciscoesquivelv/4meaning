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
      style={{
        padding: '4px 10px',
        background: 'transparent',
        border: '1px solid #fca5a5',
        borderRadius: 6,
        color: '#ef4444',
        fontSize: 12,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? '...' : 'Eliminar'}
    </button>
  )
}
