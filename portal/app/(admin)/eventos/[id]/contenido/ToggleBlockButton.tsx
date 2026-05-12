'use client'

import { useState, useTransition } from 'react'
import { toggleContentBlock } from './actions'
import { useToast } from '@/hooks/useToast'

interface Props {
  blockId: string
  activo: boolean
  eventId: string
}

export default function ToggleBlockButton({ blockId, activo, eventId }: Props) {
  const [optimisticActivo, setOptimisticActivo] = useState<boolean>(activo)
  const [isPending, startTransition] = useTransition()
  const { addToast } = useToast()

  function handleClick() {
    const next = !optimisticActivo
    setOptimisticActivo(next)
    startTransition(async () => {
      await toggleContentBlock(blockId, next, eventId)
      if (next) {
        addToast('Bloque activado — visible para participantes', 'success')
      } else {
        addToast('Bloque desactivado', 'success')
      }
    })
  }

  if (optimisticActivo) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        {isPending ? (
          <span className="inline-block w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
        )}
        Activo — desactivar
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60 whitespace-nowrap"
    >
      {isPending ? (
        <span className="inline-block w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      ) : null}
      Activar
    </button>
  )
}
