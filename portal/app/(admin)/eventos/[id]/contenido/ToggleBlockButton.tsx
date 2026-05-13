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
      <div className="flex items-center gap-2">
        {/* Estado — solo informativo */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 whitespace-nowrap">
          {isPending
            ? <span className="inline-block w-2 h-2 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            : <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          }
          Activo
        </span>
        {/* Acción — solo acción */}
        <button
          onClick={handleClick}
          disabled={isPending}
          className="px-2 py-0.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors disabled:opacity-40 whitespace-nowrap"
        >
          Desactivar
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Estado — solo informativo */}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-400 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
        Inactivo
      </span>
      {/* Acción — solo acción */}
      <button
        onClick={handleClick}
        disabled={isPending}
        className="px-2 py-0.5 text-xs font-semibold rounded-lg border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-40 whitespace-nowrap"
      >
        {isPending
          ? <span className="inline-block w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          : 'Activar'
        }
      </button>
    </div>
  )
}
