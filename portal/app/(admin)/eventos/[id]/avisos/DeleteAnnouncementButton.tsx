'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function DeleteAnnouncementButton({
  announcementId,
  eventId,
}: {
  announcementId: string
  eventId: string
}) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('announcements').delete().eq('id', announcementId)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-2.5 py-1 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {deleting ? '...' : 'Eliminar'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2.5 py-1 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="shrink-0 text-slate-300 hover:text-red-400 transition-colors text-sm px-1"
      title="Eliminar aviso"
    >
      ✕
    </button>
  )
}
