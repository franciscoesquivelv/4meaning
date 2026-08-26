'use client'

import { useState, useTransition } from 'react'

interface Compromiso {
  id: string
  texto: string
  categoria: 'relacion' | 'personal' | 'familia' | 'general'
  completado: boolean
  completado_at: string | null
  orden: number
}

interface Props {
  compromisos: Compromiso[]
  familyId: string
  eventId: string
}

const CATEGORY_STYLES: Record<string, string> = {
  relacion: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  personal: 'bg-sky-500/10 text-sky-300 border border-sky-500/20',
  familia:  'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  general:  'bg-paper-2 text-gray',
}

const CATEGORY_LABELS: Record<string, string> = {
  relacion: 'Relación',
  personal: 'Personal',
  familia:  'Familia',
  general:  'General',
}

const CATEGORIES = ['relacion', 'personal', 'familia', 'general'] as const

function CheckCircle({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <div className="w-7 h-7 rounded-full bg-wine flex items-center justify-center flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--paper)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    )
  }
  return (
    <div className="w-7 h-7 rounded-full border border-line flex-shrink-0" />
  )
}

export default function CompromisosClient({ compromisos: initial, familyId, eventId }: Props) {
  const [compromisos, setCompromisos] = useState<Compromiso[]>(initial)
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState<typeof CATEGORIES[number]>('general')
  const [adding, setAdding] = useState(false)
  const [, startTransition] = useTransition()

  async function handleToggle(id: string, current: boolean) {
    const next = !current
    // Optimistic update
    setCompromisos(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, completado: next, completado_at: next ? new Date().toISOString() : null }
          : c
      )
    )

    try {
      const res = await fetch('/api/compromisos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completado: next }),
      })
      if (!res.ok) {
        // Revert on failure
        setCompromisos(prev =>
          prev.map(c => (c.id === id ? { ...c, completado: current, completado_at: current ? new Date().toISOString() : null } : c))
        )
      }
    } catch {
      setCompromisos(prev =>
        prev.map(c => (c.id === id ? { ...c, completado: current, completado_at: null } : c))
      )
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = texto.trim()
    if (!trimmed) return

    setAdding(true)
    try {
      const res = await fetch('/api/compromisos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family_id: familyId, event_id: eventId, texto: trimmed, categoria }),
      })
      if (res.ok) {
        const newItem: Compromiso = await res.json()
        startTransition(() => {
          setCompromisos(prev => [...prev, newItem])
          setTexto('')
        })
      }
    } finally {
      setAdding(false)
    }
  }

  const pending = compromisos.filter(c => !c.completado)
  const done = compromisos.filter(c => c.completado)

  return (
    <div>
      {/* Pending compromisos */}
      {pending.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[11px] font-semibold text-gray uppercase tracking-wider mb-3">
            Por cumplir ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map(c => (
              <button
                key={c.id}
                onClick={() => handleToggle(c.id, c.completado)}
                className="w-full flex items-start gap-3 p-4 bg-white border border-line rounded-2xl text-left hover:border-wine/30 transition-colors"
              >
                <CheckCircle filled={false} />
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm text-ink leading-snug">{c.texto}</p>
                  <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_STYLES[c.categoria]}`}>
                    {CATEGORY_LABELS[c.categoria]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Completed compromisos */}
      {done.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[11px] font-semibold text-gray uppercase tracking-wider mb-3">
            Cumplidos ({done.length})
          </h2>
          <div className="space-y-2">
            {done.map(c => (
              <button
                key={c.id}
                onClick={() => handleToggle(c.id, c.completado)}
                className="w-full flex items-start gap-3 p-4 bg-white border border-line rounded-2xl text-left opacity-60 hover:opacity-80 transition-opacity"
              >
                <CheckCircle filled={true} />
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm text-ink leading-snug line-through decoration-gray/50">{c.texto}</p>
                  <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_STYLES[c.categoria]}`}>
                    {CATEGORY_LABELS[c.categoria]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {compromisos.length === 0 && (
        <div className="bg-white border border-line rounded-2xl p-6 text-center text-gray text-sm leading-relaxed mb-6">
          Aún no hay compromisos registrados. Agrega el primero abajo.
        </div>
      )}

      {/* Add new compromiso */}
      <form onSubmit={handleAdd} className="bg-white border border-line rounded-2xl p-4">
        <p className="text-[11px] font-semibold text-gray uppercase tracking-wider mb-3">
          Agregar compromiso
        </p>

        {/* Category selector */}
        <div className="flex flex-wrap gap-2 mb-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoria(cat)}
              className={[
                'text-[11px] font-medium px-3 py-1 rounded-full border transition-all',
                categoria === cat
                  ? 'bg-wine text-paper border-wine'
                  : 'bg-transparent text-gray border-line hover:border-gray',
              ].join(' ')}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Agregar un compromiso..."
            className="flex-1 bg-paper border border-line rounded-xl px-4 py-2.5 text-sm text-ink placeholder-gray focus:outline-none focus:border-wine/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!texto.trim() || adding}
            className="px-4 py-2.5 bg-wine text-paper text-sm font-semibold rounded-xl hover:bg-wine-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {adding ? '...' : 'Agregar'}
          </button>
        </div>
      </form>
    </div>
  )
}
