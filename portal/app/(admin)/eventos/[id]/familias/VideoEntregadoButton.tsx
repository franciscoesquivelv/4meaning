'use client'

import { useTransition } from 'react'
import { marcarVideoEntregado } from './actions'
import { useToast } from '@/hooks/useToast'

interface VideoEntregadoButtonProps {
  familyId: string
  eventId: string
}

export default function VideoEntregadoButton({ familyId, eventId }: VideoEntregadoButtonProps) {
  const [isPending, startTransition] = useTransition()
  const { addToast } = useToast()

  function handleClick() {
    startTransition(async () => {
      try {
        await marcarVideoEntregado(familyId, eventId)
        addToast('Video marcado como entregado', 'success')
      } catch {
        addToast('Error al marcar video como entregado', 'error')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40 whitespace-nowrap"
    >
      {isPending ? 'Guardando…' : 'Marcar entregado'}
    </button>
  )
}
