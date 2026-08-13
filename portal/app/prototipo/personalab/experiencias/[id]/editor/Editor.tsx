'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import BloqueLector from '../../../Bloques'
import SubirArchivo from '../../../SubirArchivo'
import { useFuente } from '../../../useFuente'
import {
  CATALOGO, NIVEL,
  type Bloque, type TipoBloque, type Audiencia,
} from '../../../contenido'
import {
  cargar, guardar, descartarBorrador, hayBorrador,
  bloqueNuevo, reordenar, cambiarAudiencia,
  type EstadoGuardado,
} from '../../../almacen'
import type { Bisagra, Experiencia, Tiempo } from '../../../dominio'
import { ETIQUETA_TIEMPO } from '../../../dominio'
import { BTN_PRIMARIO, BTN_SECUNDARIO, BTN_FILA, TARJETA } from '../../../tokens'

const TIEMPOS: Tiempo[] = ['vispera', 'ignicion', 'retorno']

// El catalogo completo. Los tres ultimos llevan subida simulada: el archivo
// no sale del navegador y la pantalla lo dice.
const TIPOS_EDITABLES: TipoBloque[] = [
  'texto', 'cita', 'consigna', 'aviso', 'gesto', 'objeto', 'nota', 'pausa',
  'archivo', 'imagen', 'video',
]
const CON_SUBIDA: TipoBloque[] = ['archivo', 'imagen', 'video']

const CHIP: Record<EstadoGuardado, { texto: string; clase: string }> = {
  limpio:    { texto: 'Sin cambios',  clase: 'text-slate-400' },
  pendiente: { texto: 'Sin guardar',  clase: 'text-amber-600' },
  guardando: { texto: 'Guardando…',   clase: 'text-slate-400' },
  guardado:  { texto: 'Guardado',     clase: 'text-emerald-600' },
  error:     { texto: 'No se guardó', clase: 'text-red-600' },
}

const ETIQUETA_INPUT = 'block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5'
const INPUT =
  'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-colors'

export default function Editor({ experiencia }: { experiencia: Experiencia }) {
  const [bloques, setBloques] = useState<Bloque[]>([])
  const [activa, setActiva] = useState<string>('')
  const [estado, setEstado] = useState<EstadoGuardado>('limpio')
  const [lente, setLente] = useState<'participante' | 'moderador'>('participante')
  const [porBorrar, setPorBorrar] = useState<string | null>(null)
  const [conBorrador, setConBorrador] = useState(false)
  const montado = useRef(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fuente = useFuente()

  useEffect(() => {
    setBloques(cargar())
    setConBorrador(hayBorrador())
    const primera = experiencia.bisagras.slice().sort((a, b) => a.orden - b.orden)[0]
    if (primera) setActiva(primera.id)
    montado.current = true
  }, [experiencia])

  // Autoguardado con retardo. El estado del chip es el contrato con el autor.
  useEffect(() => {
    if (!montado.current || bloques.length === 0) return
    setEstado('pendiente')
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => {
      setEstado('guardando')
      try {
        guardar(bloques)
        setConBorrador(true)
        setEstado('guardado')
      } catch {
        setEstado('error')
      }
    }, 700)
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [bloques])

  // No dejar salir con cambios sin escribir.
  useEffect(() => {
    function alSalir(e: BeforeUnloadEvent) {
      if (estado === 'pendiente' || estado === 'guardando') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', alSalir)
    return () => window.removeEventListener('beforeunload', alSalir)
  }, [estado])

  const guardarYa = useCallback(() => {
    if (temporizador.current) clearTimeout(temporizador.current)
    setEstado('guardando')
    try {
      guardar(bloques)
      setConBorrador(true)
      setEstado('guardado')
    } catch {
      setEstado('error')
    }
  }, [bloques])

  useEffect(() => {
    function atajo(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        guardarYa()
      }
    }
    window.addEventListener('keydown', atajo)
    return () => window.removeEventListener('keydown', atajo)
  }, [guardarYa])

  const bisagras = useMemo(
    () => experiencia.bisagras.slice().sort((a, b) => a.orden - b.orden),
    [experiencia]
  )
  const bisagraActiva = bisagras.find(b => b.id === activa)
  const delBloque = useMemo(
    () => bloques.filter(b => b.bisagraId === activa).sort((a, b) => a.orden - b.orden),
    [bloques, activa]
  )
  const visiblesEnPrevia = useMemo(
    () => delBloque.filter(b => NIVEL[b.audiencia] <= (lente === 'moderador' ? 2 : 1)),
    [delBloque, lente]
  )

  function actualizar(id: string, campos: Partial<Bloque>) {
    setBloques(prev => prev.map(b => (b.id === id ? { ...b, ...campos } : b)))
  }
  function agregar(tipo: TipoBloque) {
    setBloques(prev => [...prev, bloqueNuevo(activa, tipo, delBloque.length + 1)])
  }
  function mover(id: string, delta: number) {
    setBloques(prev => reordenar(prev, activa, id, delta))
  }
  function borrar(id: string) {
    setBloques(prev => prev.filter(b => b.id !== id))
    setPorBorrar(null)
  }

  if (fuente.modo === 'cargando') {
    return <div className="px-6 py-10 text-sm text-slate-400">Comprobando sesión…</div>
  }

  // El adaptador remoto está encendido pero no hay sesión. No es un error:
  // el prototipo vive fuera del gate a propósito, y la RLS exige sesión.
  if (fuente.modo === 'sin-sesion') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-slate-900">Entra para editar con datos reales</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Este editor está conectado a la base de verdad, y la base solo responde a cuentas del
            equipo. Sin sesión no vería ni un bloque, así que prefiero decírtelo en vez de mostrarte
            una pantalla vacía.
          </p>
          <div className="flex gap-2 mt-5">
            <Link href="/login" className={BTN_PRIMARIO}>Iniciar sesión</Link>
            <Link
              href={`/prototipo/personalab/experiencias/${experiencia.id}`}
              className={BTN_SECUNDARIO}
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!montado.current && bloques.length === 0) {
    return <div className="px-6 py-10 text-sm text-slate-400">Cargando…</div>
  }

  return (
    <>
      {/* Cabecera del editor */}
      <div className="sticky top-[104px] z-30 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 -mx-6 px-6 py-3 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-baseline gap-3 min-w-0">
            <Link
              href={`/prototipo/personalab/experiencias/${experiencia.id}`}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap"
            >
              ← {experiencia.nombre}
            </Link>
            <span className="text-sm font-semibold text-slate-900 truncate">Editor</span>
            <span className={`text-xs ${CHIP[estado].clase} whitespace-nowrap`}>{CHIP[estado].texto}</span>
            {/* De dónde salen los datos. Sin esto, una captura del editor
                no dice si lo que se ve es real o simulado. */}
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                fuente.modo === 'remoto'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
              title={
                fuente.modo === 'remoto'
                  ? `Conectado a la base como ${fuente.email}`
                  : 'Los cambios se guardan solo en este navegador y no se comparten'
              }
            >
              {fuente.modo === 'remoto' ? 'Base real' : 'Solo este navegador'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {conBorrador && (
              <button
                onClick={() => {
                  descartarBorrador()
                  setBloques(cargar())
                  setConBorrador(false)
                  setEstado('limpio')
                }}
                className={BTN_FILA}
              >
                Descartar borrador
              </button>
            )}
            <button onClick={guardarYa} className={BTN_SECUNDARIO}>Guardar</button>
            <Link
              href={`/prototipo/personalab/experiencias/${experiencia.id}/publicar`}
              className={BTN_PRIMARIO}
            >
              Revisar y publicar
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[210px_minmax(0,1fr)_375px] gap-6 items-start">
        {/* Riel de bisagras */}
        <nav className="xl:sticky xl:top-[164px]">
          {TIEMPOS.map(t => {
            const bs = bisagras.filter(b => b.tiempo === t)
            if (bs.length === 0) return null
            return (
              <div key={t} className="mb-5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">
                  {ETIQUETA_TIEMPO[t]}
                </div>
                {bs.map(b => {
                  const n = bloques.filter(x => x.bisagraId === b.id).length
                  const act = b.id === activa
                  return (
                    <button
                      key={b.id}
                      onClick={() => setActiva(b.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg mb-0.5 transition-colors ${
                        act ? 'bg-slate-200/70' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span className={`block text-[13px] leading-snug ${act ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                        {b.titulo}
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5 tabular-nums">
                        {n === 0 ? 'vacía' : `${n} bloque${n > 1 ? 's' : ''}`}
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* Lienzo */}
        <div className="min-w-0">
          {bisagraActiva && (
            <div className="mb-5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8F5341]">
                {ETIQUETA_TIEMPO[bisagraActiva.tiempo]}
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 mt-1">
                {bisagraActiva.titulo}
              </h2>
              <p className="text-sm text-slate-500 mt-1">{bisagraActiva.descripcion}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {delBloque.length === 0 && (
              <div className="border border-dashed border-slate-200 rounded-xl px-5 py-8 text-center">
                <p className="text-sm text-slate-500">Esta bisagra está vacía.</p>
                <p className="text-xs text-slate-400 mt-1">Agrega el primer bloque abajo.</p>
              </div>
            )}

            {delBloque.map((b, i) => (
              <TarjetaBloque
                key={b.id}
                b={b}
                primero={i === 0}
                ultimo={i === delBloque.length - 1}
                porBorrar={porBorrar === b.id}
                onCambio={campos => actualizar(b.id, campos)}
                onMover={d => mover(b.id, d)}
                onPedirBorrar={() => setPorBorrar(b.id)}
                onCancelarBorrar={() => setPorBorrar(null)}
                onBorrar={() => borrar(b.id)}
              />
            ))}
          </div>

          {/* Agregar bloque */}
          <div className={`${TARJETA} p-4 mt-4`}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Agregar bloque
            </div>
            <div className="flex flex-wrap gap-2">
              {TIPOS_EDITABLES.map(t => (
                <button
                  key={t}
                  onClick={() => agregar(t)}
                  title={CATALOGO[t].ayuda}
                  className="text-xs border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
                >
                  {CATALOGO[t].nombre}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
              Archivo, imagen y video ya se pueden agregar. La subida está simulada: el archivo no sale
              de tu navegador.
            </p>
          </div>
        </div>

        {/* Vista previa en teléfono */}
        <div className="xl:sticky xl:top-[164px]">
          <div className={`${TARJETA} p-3 mb-3`}>
            <div className="flex bg-slate-100 rounded-lg p-1">
              {(['participante', 'moderador'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLente(l)}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    lente === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {l === 'participante' ? 'Como participante' : 'Como moderador'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mx-auto" style={{ width: 375 }}>
            <div
              className="relative bg-[#FAF8F4] rounded-[40px] border-4 border-slate-800 overflow-hidden shadow-xl"
              style={{ height: 620 }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-slate-800 rounded-b-2xl z-20" />
              <div className="absolute top-9 left-1/2 -translate-x-1/2 z-30 text-[9px] font-semibold uppercase tracking-widest text-[#8F5341] bg-[#EFE9E0] px-2 py-0.5 rounded-full">
                Vista previa
              </div>
              <div className="overflow-y-auto h-full px-6 pt-16 pb-10">
                {bisagraActiva && (
                  <header>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
                      {ETIQUETA_TIEMPO[bisagraActiva.tiempo]}
                    </div>
                    <h1 className="mt-3 text-[26px] leading-[1.12] font-extralight tracking-[-0.025em] text-[#002B34]">
                      {bisagraActiva.titulo}
                    </h1>
                  </header>
                )}
                <div className="mt-8">
                  {visiblesEnPrevia.length === 0 ? (
                    <p className="text-[15px] font-light text-[#676E6E] leading-relaxed">
                      {delBloque.length === 0
                        ? 'Nada escrito todavía.'
                        : 'Con esta lente el participante no ve nada. Lo que hiciste es solo para el moderador.'}
                    </p>
                  ) : (
                    visiblesEnPrevia.map(b => <BloqueLector key={b.id} b={b} />)
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-3 leading-relaxed px-4">
            Estás viendo el borrador. El participante ve la última versión publicada hasta que publiques
            de nuevo.
          </p>
        </div>
      </div>
    </>
  )
}

// ── Tarjeta de un bloque ────────────────────────────────────────

function TarjetaBloque({
  b, primero, ultimo, porBorrar,
  onCambio, onMover, onPedirBorrar, onCancelarBorrar, onBorrar,
}: {
  b: Bloque
  primero: boolean
  ultimo: boolean
  porBorrar: boolean
  onCambio: (campos: Partial<Bloque>) => void
  onMover: (delta: number) => void
  onPedirBorrar: () => void
  onCancelarBorrar: () => void
  onBorrar: () => void
}) {
  const esNota = b.tipo === 'nota'

  return (
    <div className={`${TARJETA} overflow-hidden`}>
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-semibold text-slate-700">{CATALOGO[b.tipo].nombre}</span>
          <select
            value={b.audiencia}
            onChange={e => onCambio({ audiencia: cambiarAudiencia(b.tipo, e.target.value as Audiencia) })}
            disabled={esNota}
            className="text-[11px] border border-slate-200 rounded-md px-1.5 py-0.5 bg-white text-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
            title={esNota ? 'Una nota nunca es pública: es su definición.' : 'Quién puede ver este bloque'}
          >
            <option value="todos">Todos</option>
            <option value="moderador">Solo moderador</option>
          </select>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onMover(-1)} disabled={primero} className={`${BTN_FILA} disabled:opacity-30`} title="Subir">↑</button>
          <button onClick={() => onMover(1)} disabled={ultimo} className={`${BTN_FILA} disabled:opacity-30`} title="Bajar">↓</button>
          {porBorrar ? (
            <>
              <button onClick={onBorrar} className="text-xs border border-red-300 text-red-700 bg-red-50 px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors">
                Confirmar
              </button>
              <button onClick={onCancelarBorrar} className={BTN_FILA}>Cancelar</button>
            </>
          ) : (
            <button onClick={onPedirBorrar} className={`${BTN_FILA} hover:text-red-600 hover:border-red-200`}>
              Quitar
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {b.tipo === 'pausa' ? (
          <p className="text-sm text-slate-400">Un respiro. No lleva contenido.</p>
        ) : CON_SUBIDA.includes(b.tipo) ? (
          <>
            <label className={ETIQUETA_INPUT}>
              {b.tipo === 'archivo' ? 'PDF' : b.tipo === 'video' ? 'Video' : 'Imagen'}
            </label>
            <SubirArchivo
              tipo={b.tipo}
              nombre={b.nombreArchivo}
              url={b.url}
              onListo={d => onCambio({ nombreArchivo: d.nombreArchivo, peso: d.peso, url: d.url })}
              onQuitar={() => onCambio({ nombreArchivo: '', peso: undefined, url: undefined })}
            />

            <div className="mt-3">
              <label className={ETIQUETA_INPUT}>
                {b.tipo === 'archivo' ? 'Qué es este documento' : 'Pie'}
              </label>
              <input
                value={b.pie ?? ''}
                onChange={e => onCambio({ pie: e.target.value })}
                placeholder={
                  b.tipo === 'archivo'
                    ? 'Guion de sala, versión 1.2'
                    : 'Una frase. Se lee debajo.'
                }
                className={INPUT}
              />
            </div>

            {b.tipo === 'archivo' && (
              <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={b.descargable ?? false}
                  onChange={e => onCambio({ descargable: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 accent-slate-900"
                />
                <span className="text-xs text-slate-600">Se puede descargar</span>
                <span className="text-xs text-slate-400">
                  Los guiones de sala suelen ser solo para el moderador.
                </span>
              </label>
            )}
          </>
        ) : (
          <>
            <label className={ETIQUETA_INPUT}>
              {b.tipo === 'objeto' ? 'Qué se tiene en la mano' : 'Texto'}
            </label>
            {b.tipo === 'texto' || b.tipo === 'nota' ? (
              <textarea
                value={b.texto ?? ''}
                onChange={e => onCambio({ texto: e.target.value })}
                rows={b.tipo === 'texto' ? 6 : 3}
                placeholder={b.tipo === 'texto' ? 'Escribe. Admite **negrita**, *cursiva* y ## subtítulos.' : 'Lo que el moderador necesita saber y el foro no.'}
                className={`${INPUT} resize-y leading-relaxed`}
              />
            ) : (
              <textarea
                value={b.texto ?? ''}
                onChange={e => onCambio({ texto: e.target.value })}
                rows={2}
                className={`${INPUT} resize-y leading-relaxed`}
              />
            )}

            {b.tipo === 'cita' && (
              <div className="mt-3">
                <label className={ETIQUETA_INPUT}>Quién lo dijo</label>
                <input
                  value={b.autor ?? ''}
                  onChange={e => onCambio({ autor: e.target.value })}
                  placeholder="Nombre de quien lo dijo"
                  className={INPUT}
                />
              </div>
            )}

            {b.tipo === 'objeto' && (
              <div className="mt-3">
                <label className={ETIQUETA_INPUT}>Nota al pie</label>
                <input
                  value={b.pie ?? ''}
                  onChange={e => onCambio({ pie: e.target.value })}
                  placeholder="Una frase sobre qué hacer con el objeto."
                  className={INPUT}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
