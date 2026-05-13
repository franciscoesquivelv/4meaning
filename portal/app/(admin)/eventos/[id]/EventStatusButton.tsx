'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function EventStatusButton({
  eventId,
  currentStatus,
}: {
  eventId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const statusConfig: Record<string, { next: string | null; label: string; nextLabel: string }> = {
    draft:     { next: 'active',    label: 'Activar evento',      nextLabel: 'Marcar como activo' },
    active:    { next: 'completed', label: 'Marcar completado',   nextLabel: 'Confirmar — el evento pasará al historial' },
    completed: { next: 'archived',  label: 'Archivar',            nextLabel: 'Confirmar archivo' },
    archived:  { next: null,        label: 'Archivado',           nextLabel: '' },
  }

  const config = statusConfig[currentStatus]
  if (!config || !config.next) return null

  async function handleChange() {
    setLoading(true)
    await supabase.from('events').update({ status: config.next }).eq('id', eventId)
    setLoading(false)
    setConfirming(false)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">{config.nextLabel}</span>
        <button
          onClick={handleChange}
          disabled={loading}
          className="px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? '...' : 'Confirmar'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
    >
      {config.label}
    </button>
  )
}
