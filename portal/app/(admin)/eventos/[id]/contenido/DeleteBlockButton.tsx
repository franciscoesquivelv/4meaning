'use client'

import { useState, useTransition } from 'react'
import { deleteContentBlock } from './actions'

interface Props {
  blockId: string
  eventId: string
}

export default function DeleteBlockButton({ blockId, eventId }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteContentBlock(blockId, eventId)
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-2.5 py-1 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {isPending ? '...' : 'Eliminar'}
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
      title="Eliminar bloque"
    >
      ✕
    </button>
  )
}
