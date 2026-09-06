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

  // `marcarVideoEntregado` DEVUELVE el error, no lo lanza, asi que el
  // try/catch nunca lo veia: un fallo de base terminaba en un aviso verde de
  // "entregado" sobre algo que no se guardo. Aqui se lee el retorno.
  function handleClick() {
    startTransition(async () => {
      try {
        const res = await marcarVideoEntregado(familyId, eventId)
        if (res?.error) {
          addToast(`No se pudo marcar el video: ${res.error}`, 'error')
          return
        }
        addToast('Video marcado como entregado', 'success')
      } catch {
        addToast('No se pudo marcar el video como entregado', 'error')
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
