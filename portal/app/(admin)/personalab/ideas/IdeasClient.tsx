'use client'

import { useState, useTransition } from 'react'
import { crearIdea, borrarIdea } from './actions'
import { Boton } from '../ui'
import { TARJETA, BTN_FILA, BTN_PELIGRO } from '../tokens'
import type { Idea } from '@/lib/personalab/ideas'

function formatoFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function IdeasClient({ ideasIniciales }: { ideasIniciales: Idea[] }) {
  const [ideas, setIdeas] = useState(ideasIniciales)
  const [texto, setTexto] = useState('')
  const [porBorrar, setPorBorrar] = useState<string | null>(null)
  const [pendienteAgregar, startAgregar] = useTransition()
  const [pendienteBorrar, startBorrar] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function agregar() {
    const limpio = texto.trim()
    if (!limpio) return
    setError(null)
    startAgregar(async () => {
      const r = await crearIdea(limpio)
      if ('error' in r) { setError(r.error); return }
      setIdeas(prev => [r.idea, ...prev])
      setTexto('')
    })
  }

  function borrar(id: string) {
    setError(null)
    startBorrar(async () => {
      const r = await borrarIdea(id)
      if ('error' in r) { setError(r.error); return }
      setIdeas(prev => prev.filter(i => i.id !== id))
      setPorBorrar(null)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={e => { e.preventDefault(); agregar() }}
        className={`${TARJETA} p-3`}
      >
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          // Cmd/Ctrl+Enter envía -- la libreta es para anotar rápido, no
          // para ir a buscar el botón cada vez.
          onKeyDown={e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); agregar() }
          }}
          placeholder="¿Qué se te ocurrió? (Cmd/Ctrl+Enter para guardar)"
          rows={2}
          spellCheck
          lang="es"
          className="w-full text-sm text-ink bg-white border border-line rounded-[10px] focus:border-dom/40 outline-none transition-colors px-3 py-2 resize-none"
        />
        <div className="flex items-center justify-between gap-3 mt-2">
          {error ? <p className="text-xs text-alerta">{error}</p> : <span />}
          <Boton
            type="submit"
            variante="primario"
            cargando={pendienteAgregar}
            textoCargando="Guardando…"
            disabled={pendienteAgregar || !texto.trim()}
          >
            Agregar
          </Boton>
        </div>
      </form>

      {ideas.length === 0 ? (
        <div className="border border-dashed border-line rounded-[10px] px-5 py-10 text-center">
          <p className="text-sm text-gray-ui">Todavía no hay ninguna idea anotada.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ideas.map(idea => (
            <div key={idea.id} className={`${TARJETA} p-3`}>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{idea.texto}</p>
              <div className="flex items-center justify-between gap-3 mt-2">
                <p className="text-xs text-gray-ui">{idea.autor} · {formatoFecha(idea.creadaEn)}</p>
                {porBorrar === idea.id ? (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => borrar(idea.id)}
                      disabled={pendienteBorrar}
                      className={BTN_PELIGRO}
                    >
                      {pendienteBorrar ? 'Quitando…' : 'Confirmar'}
                    </button>
                    <button
                      onClick={() => setPorBorrar(null)}
                      disabled={pendienteBorrar}
                      className={BTN_FILA}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPorBorrar(idea.id)}
                    className={`${BTN_FILA} hover:text-red-600 hover:border-red-200 flex-shrink-0`}
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
