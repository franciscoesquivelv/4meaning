'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useToast } from '@/hooks/useToast'

interface CheckInButtonProps {
  familyId: string
  checkedInAt: string | null
  eventId: string
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function CheckInButton({ familyId, checkedInAt, eventId }: CheckInButtonProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [optimisticCheckedIn, setOptimisticCheckedIn] = useState<string | null>(checkedInAt)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleCheckIn() {
    if (loading) return
    setLoading(true)
    const now = new Date().toISOString()
    setOptimisticCheckedIn(now)
    const { error } = await supabase
      .from('families')
      .update({ checked_in_at: now })
      .eq('id', familyId)
    setLoading(false)
    if (error) {
      setOptimisticCheckedIn(checkedInAt)
      addToast('Error al registrar check-in', 'error')
    } else {
      addToast('Check-in registrado', 'success')
    }
    router.refresh()
  }

  async function handleUndo() {
    if (loading) return
    setLoading(true)
    setOptimisticCheckedIn(null)
    const { error } = await supabase
      .from('families')
      .update({ checked_in_at: null })
      .eq('id', familyId)
    setLoading(false)
    if (error) {
      setOptimisticCheckedIn(checkedInAt)
      addToast('Error al registrar check-in', 'error')
    }
    router.refresh()
  }

  if (optimisticCheckedIn) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
          Llegó {formatTime(optimisticCheckedIn)}
        </span>
        <button
          onClick={handleUndo}
          disabled={loading}
          className="text-slate-400 hover:text-slate-600 text-xs font-bold leading-none transition-colors disabled:opacity-40"
          title="Deshacer check-in"
        >
          ×
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={handleCheckIn}
      disabled={loading}
      className="text-xs text-slate-600 border border-slate-300 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium disabled:opacity-40 whitespace-nowrap"
    >
      Registrar llegada
    </button>
  )
}
