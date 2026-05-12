'use client'

import { useState, useTransition } from 'react'
import { marcarVideoEntregado } from './actions'

interface VideoEntregadoButtonProps {
  familyId: string
  eventId: string
}

export default function VideoEntregadoButton({ familyId, eventId }: VideoEntregadoButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(() => {
      marcarVideoEntregado(familyId, eventId)
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
