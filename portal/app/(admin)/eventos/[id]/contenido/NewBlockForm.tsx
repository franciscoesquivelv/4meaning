'use client'

import { useState, useTransition } from 'react'
import { createContentBlock } from './actions'

type Tipo = 'info' | 'actividad' | 'reflexion' | 'formato'

const TIPO_OPTIONS: { value: Tipo; label: string }[] = [
  { value: 'info',       label: 'Información' },
  { value: 'actividad',  label: 'Actividad' },
  { value: 'reflexion',  label: 'Reflexión' },
  { value: 'formato',    label: 'Formato' },
]

interface Props {
  eventId: string
  nextOrden: number
}

export default function NewBlockForm({ eventId, nextOrden }: Props) {
  const [open, setOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [tipo, setTipo] = useState<Tipo>('info')
  const [orden, setOrden] = useState<number>(nextOrden)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleClose() {
    setOpen(false)
    setTitulo('')
    setContenido('')
    setTipo('info')
    setOrden(nextOrden)
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    setError(null)

    startTransition(async () => {
      try {
        await createContentBlock({
          event_id: eventId,
          titulo: titulo.trim(),
          contenido: contenido.trim() || undefined,
          tipo,
          orden,
        })
        handleClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar el bloque')
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
      >
        + Nuevo bloque
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Nuevo bloque de contenido</h3>

      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Título */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Ej. Reflexión sobre el tema de Hijos"
            required
            autoFocus
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Contenido */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
            Contenido (opcional)
          </label>
          <textarea
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            placeholder="Texto, instrucciones o descripción del bloque..."
            rows={4}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
          />
        </div>

        {/* Tipo y Orden en fila */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
              Tipo
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as Tipo)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-700"
            >
              {TIPO_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="w-28">
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
              Orden
            </label>
            <input
              type="number"
              min={0}
              value={orden}
              onChange={e => setOrden(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={isPending || !titulo.trim()}
          className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60"
        >
          {isPending ? 'Guardando...' : 'Guardar bloque'}
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
