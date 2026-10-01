'use client'

import { useState, useTransition } from 'react'
import { crearIdea, borrarIdea, actualizarEstadoIdea } from './actions'
import { Boton, Badge } from '../ui'
import { TARJETA, BTN_FILA, BTN_PELIGRO } from '../tokens'
import { TONO } from '@/lib/estilos/oficina'
import type { Idea, EstadoIdea } from '@/lib/personalab/ideas'

function formatoFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// Mismo criterio que `docs/PENDIENTES.md`: cuatro estados, no dos. Abierta
// y en progreso siguen vivas; hecha y descartada son las dos formas
// honestas de que una idea deje de estar en juego -- "se hizo" y "se
// decidió no hacerla" no son la misma verdad, aunque las dos signifiquen
// "ya no hay que pensar en esto".
const ETIQUETA_ESTADO: Record<EstadoIdea, string> = {
  abierta: 'Abierta',
  en_progreso: 'En progreso',
  hecha: 'Hecha',
  descartada: 'Descartada',
}
const TONO_ESTADO: Record<EstadoIdea, string> = {
  abierta: TONO.neutro,
  en_progreso: TONO.curso,
  hecha: TONO.bien,
  descartada: TONO.alerta,
}

type Filtro = 'activas' | 'hechas' | 'descartadas' | 'todas'
const FILTROS: { valor: Filtro; etiqueta: string }[] = [
  { valor: 'activas', etiqueta: 'Activas' },
  { valor: 'hechas', etiqueta: 'Hechas' },
  { valor: 'descartadas', etiqueta: 'Descartadas' },
  { valor: 'todas', etiqueta: 'Todas' },
]

function pasaFiltro(idea: Idea, filtro: Filtro): boolean {
  switch (filtro) {
    case 'activas': return idea.estado === 'abierta' || idea.estado === 'en_progreso'
    case 'hechas': return idea.estado === 'hecha'
    case 'descartadas': return idea.estado === 'descartada'
    case 'todas': return true
  }
}

export default function IdeasClient({ ideasIniciales }: { ideasIniciales: Idea[] }) {
  const [ideas, setIdeas] = useState(ideasIniciales)
  const [texto, setTexto] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('activas')
  const [porBorrar, setPorBorrar] = useState<string | null>(null)
  const [pendienteAgregar, startAgregar] = useTransition()
  const [pendienteBorrar, startBorrar] = useTransition()
  const [cambiandoEstado, setCambiandoEstado] = useState<string | null>(null)
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

  // Optimista, con reversión real si falla -- mismo criterio que el
  // editor (`Editor.tsx`, `mover`/`actualizar`): se ve el cambio de
  // inmediato, y si el servidor lo rechaza, vuelve al valor de antes en
  // vez de quedarse mintiendo sobre lo que de verdad se guardó.
  async function cambiarEstado(id: string, nuevo: EstadoIdea) {
    const anterior = ideas.find(i => i.id === id)?.estado
    if (!anterior) return
    setError(null)
    setCambiandoEstado(id)
    setIdeas(prev => prev.map(i => (i.id === id ? { ...i, estado: nuevo } : i)))
    const r = await actualizarEstadoIdea(id, nuevo)
    setCambiandoEstado(null)
    if ('error' in r) {
      setIdeas(prev => prev.map(i => (i.id === id ? { ...i, estado: anterior } : i)))
      setError(r.error)
    }
  }

  const visibles = ideas.filter(i => pasaFiltro(i, filtro))

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

      <div className="flex bg-paper-2 rounded-[10px] p-1 self-start">
        {FILTROS.map(f => {
          const n = ideas.filter(i => pasaFiltro(i, f.valor)).length
          return (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filtro === f.valor ? 'bg-white text-ink shadow-sm' : 'text-gray-ui hover:text-gray-ui'
              }`}
            >
              {f.etiqueta} <span className="tabular-nums">{n}</span>
            </button>
          )
        })}
      </div>

      {visibles.length === 0 ? (
        <div className="border border-dashed border-line rounded-[10px] px-5 py-10 text-center">
          <p className="text-sm text-gray-ui">
            {ideas.length === 0
              ? 'Todavía no hay ninguna idea anotada.'
              : 'Nada con este filtro todavía.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibles.map(idea => (
            <div key={idea.id} className={`${TARJETA} p-3`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{idea.texto}</p>
                <Badge label={ETIQUETA_ESTADO[idea.estado]} cls={`${TONO_ESTADO[idea.estado]} flex-shrink-0`} />
              </div>
              <div className="flex items-center justify-between gap-3 mt-2">
                <p className="text-xs text-gray-ui">{idea.autor} · {formatoFecha(idea.creadaEn)}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={idea.estado}
                    onChange={e => cambiarEstado(idea.id, e.target.value as EstadoIdea)}
                    disabled={cambiandoEstado === idea.id}
                    className="text-xs text-gray-ui bg-transparent border border-line rounded-md px-1.5 py-1 disabled:opacity-60"
                    title="Cambiar estado"
                  >
                    {(Object.keys(ETIQUETA_ESTADO) as EstadoIdea[]).map(e => (
                      <option key={e} value={e}>{ETIQUETA_ESTADO[e]}</option>
                    ))}
                  </select>
                  {porBorrar === idea.id ? (
                    <div className="flex items-center gap-1.5">
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
                      className={`${BTN_FILA} hover:text-red-600 hover:border-red-200`}
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
