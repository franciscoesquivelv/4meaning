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
import type { Experiencia, Tiempo } from '../../../dominio'
import { ETIQUETA_TIEMPO } from '../../../dominio'
import { BTN_PRIMARIO, BTN_SECUNDARIO, BTN_FILA, BTN_PELIGRO, TARJETA } from '../../../tokens'
import { Boton, Girador, EsqueletoEditor } from '../../../ui'

const TIEMPOS: Tiempo[] = ['vispera', 'ignicion', 'retorno']

// El catalogo, partido en dos filas segun cuanto se usa de verdad. En el
// contenido sembrado, texto aparece 9 veces y nota 5; imagen y video, cero.
// Once botones del mismo peso mienten sobre esa diferencia.
const TIPOS_FRECUENTES: TipoBloque[] = ['texto', 'cita', 'consigna', 'gesto', 'pausa', 'nota']
const TIPOS_OCASIONALES: TipoBloque[] = ['aviso', 'objeto', 'archivo', 'imagen', 'video']
const CON_SUBIDA: TipoBloque[] = ['archivo', 'imagen', 'video']

const CHIP: Record<EstadoGuardado, { texto: string; clase: string }> = {
  limpio:    { texto: 'Todo guardado',       clase: 'text-slate-400' },
  pendiente: { texto: 'Cambios sin guardar', clase: 'text-amber-600' },
  guardando: { texto: 'Guardando',           clase: 'text-slate-400' },
  guardado:  { texto: 'Guardado',            clase: 'text-emerald-600' },
  error:     { texto: 'No se pudo guardar',  clase: 'text-red-600' },
}

// Debajo de este umbral el ojo no registra el cambio y el boton parece no
// haber respondido. localStorage es instantaneo, asi que sin este piso el
// estado "guardando" no llega a pintarse nunca.
const MINIMO_PERCEPTIBLE = 400

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
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false)
  const [guardandoUI, setGuardandoUI] = useState(false)
  const [recienGuardado, setRecienGuardado] = useState(false)
  const [recienCreado, setRecienCreado] = useState<string | null>(null)
  const montado = useRef(false)
  const enfocarAlResaltar = useRef(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  // La firma de lo ultimo que quedo en disco. Sirve para dos cosas: no
  // marcar "sin guardar" por el simple hecho de haber cargado, y volver a
  // "todo guardado" solo si deshaces hasta donde estabas.
  const ultimoGuardado = useRef<string | null>(null)
  const fuente = useFuente()

  useEffect(() => {
    const inicial = cargar(experiencia.id)
    setBloques(inicial)
    ultimoGuardado.current = JSON.stringify(inicial)
    setConBorrador(hayBorrador(experiencia.id))
    setEstado('limpio')

    // ?bisagra= viene de la pantalla de publicar. Cada hallazgo señala una
    // bisagra concreta, y antes el enlace traía al editor genérico: el autor
    // aterrizaba en la primera y tenía que buscar a mano lo que el sistema
    // acababa de señalarle.
    const orden = experiencia.bisagras.slice().sort((a, b) => a.orden - b.orden)
    const pedida = new URLSearchParams(window.location.search).get('bisagra')
    const valida = pedida && orden.some(b => b.id === pedida) ? pedida : null
    setActiva(valida ?? (orden[0]?.id ?? ''))
    montado.current = true
  }, [experiencia])

  // Autoguardado con retardo. El estado del chip es el contrato con el autor,
  // asi que no puede mentir en ninguna de las dos direcciones: ni decir que
  // hay cambios cuando solo se abrio la pantalla, ni callarse cuando los hay.
  useEffect(() => {
    if (ultimoGuardado.current === null) return
    const serie = JSON.stringify(bloques)
    if (serie === ultimoGuardado.current) {
      setEstado('limpio')
      return
    }
    setEstado('pendiente')
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => {
      setEstado('guardando')
      try {
        guardar(experiencia.id, bloques)
        ultimoGuardado.current = serie
        setConBorrador(true)
        setEstado('guardado')
      } catch {
        setEstado('error')
      }
    }, 700)
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [bloques, experiencia.id])

  // Llevar la vista al bloque recien creado o movido, y el cursor dentro si
  // acaba de nacer. Corre DESPUES del commit, que es cuando el bloque ya
  // existe en el DOM: hacerlo dentro del manejador no funciona, porque ahi
  // React todavia no lo ha montado.
  useEffect(() => {
    if (!recienCreado) return
    const el = document.getElementById(`bloque-${recienCreado}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (enfocarAlResaltar.current) {
      el?.querySelector<HTMLTextAreaElement | HTMLInputElement>('textarea, input[type="text"], input:not([type])')?.focus()
      enfocarAlResaltar.current = false
    }
    const t = setTimeout(() => setRecienCreado(actual => (actual === recienCreado ? null : actual)), 1400)
    return () => clearTimeout(t)
  }, [recienCreado])

  // No dejar salir con trabajo que no llego a disco. El estado de error
  // cuenta: es justo cuando mas caro sale cerrar la pestana.
  useEffect(() => {
    function alSalir(e: BeforeUnloadEvent) {
      if (estado === 'pendiente' || estado === 'guardando' || estado === 'error') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', alSalir)
    return () => window.removeEventListener('beforeunload', alSalir)
  }, [estado])

  const guardarYa = useCallback(async () => {
    if (temporizador.current) clearTimeout(temporizador.current)
    const serie = JSON.stringify(bloques)
    setGuardandoUI(true)
    setEstado('guardando')
    const inicio = Date.now()
    let ok = true
    try {
      guardar(experiencia.id, bloques)
      ultimoGuardado.current = serie
      setConBorrador(true)
    } catch {
      ok = false
    }
    const resto = MINIMO_PERCEPTIBLE - (Date.now() - inicio)
    if (resto > 0) await new Promise(r => setTimeout(r, resto))
    setGuardandoUI(false)
    setEstado(ok ? 'guardado' : 'error')
    if (ok) {
      setRecienGuardado(true)
      setTimeout(() => setRecienGuardado(false), 1200)
    }
  }, [bloques, experiencia.id])

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
  // Agregar tiene que terminar donde empieza el trabajo: en el campo del
  // bloque nuevo. Antes no pasaba nada visible y con seis bloques en
  // pantalla el nuevo nacia fuera de vista.
  function agregar(tipo: TipoBloque) {
    const nuevo = bloqueNuevo(activa, tipo, delBloque.length + 1)
    setBloques(prev => [...prev, nuevo])
    resaltar(nuevo.id, true)
  }
  function mover(id: string, delta: number) {
    setBloques(prev => reordenar(prev, activa, id, delta))
    // Sin esto la tarjeta cambia de sitio sin dejar traza y el ojo pierde
    // cual se movio.
    resaltar(id, false)
  }
  // Solo marca. Llevar la vista y el foco se hace en el efecto de abajo,
  // porque aqui el bloque nuevo todavia no existe en el DOM.
  function resaltar(id: string, conFoco: boolean) {
    enfocarAlResaltar.current = conFoco
    setRecienCreado(id)
  }
  function borrar(id: string) {
    setBloques(prev => prev.filter(b => b.id !== id))
    setPorBorrar(null)
  }

  if (fuente.modo === 'cargando') {
    return (
      <>
        <p className="text-sm text-slate-400 mb-6 flex items-center gap-2">
          <Girador />
          Comprobando tu sesión
        </p>
        <EsqueletoEditor />
      </>
    )
  }

  // El adaptador remoto está encendido pero no hay sesión. No es un error:
  // el prototipo vive fuera del gate a propósito, y la RLS exige sesión.
  if (fuente.modo === 'sin-sesion') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-slate-900">
            Necesitas tu cuenta del equipo para editar
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            La base solo responde a cuentas del equipo. Sin sesión esta pantalla saldría vacía, y
            prefiero decírtelo antes que mostrártela así.
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

  if (!montado.current) {
    return <EsqueletoEditor />
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
            <span
              className={`text-xs ${CHIP[estado].clase} whitespace-nowrap inline-flex items-center gap-1.5`}
              role="status"
              aria-live="polite"
            >
              {estado === 'guardando' && <Girador />}
              {CHIP[estado].texto}
            </span>
            {/* DONDE QUEDA EL TRABAJO, que no es lo mismo que si hay sesión.
                Esta pastilla decía "Base real" en verde en cuanto había
                sesión, pero el editor escribe en localStorage en los dos
                casos: el adaptador remoto está escrito y todavía no
                enchufado. Una pastilla verde que miente sobre dónde está el
                trabajo de alguien es peor que no tener pastilla. */}
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap bg-amber-100 text-amber-700"
              title={
                fuente.modo === 'remoto'
                  ? `Tu sesión es válida (${fuente.email}), pero el editor todavía escribe en esta computadora y no en la base.`
                  : 'El trabajo se guarda en esta computadora y no se comparte con el resto del equipo.'
              }
            >
              Guardado en este navegador
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {conBorrador && !confirmandoDescarte && (
              <button onClick={() => setConfirmandoDescarte(true)} className={BTN_FILA}>
                Descartar borrador
              </button>
            )}
            <Boton
              variante="secundario"
              onClick={guardarYa}
              cargando={guardandoUI}
              listo={recienGuardado}
              textoCargando="Guardando"
              textoListo="Guardado"
              disabled={estado === 'limpio'}
            >
              Guardar
            </Boton>
            <Link
              href={`/prototipo/personalab/experiencias/${experiencia.id}/publicar`}
              className={BTN_PRIMARIO}
            >
              Revisar y publicar
            </Link>
          </div>
        </div>

        {/* Descartar borrador borraba todo el trabajo no publicado con un
            clic y sin preguntar, mientras que quitar UN bloque sí
            preguntaba. La acción destructiva grande era la que no pedía
            confirmación. */}
        {confirmandoDescarte && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start justify-between gap-4 flex-wrap">
            <p className="text-sm text-red-800 leading-relaxed max-w-[70ch]">
              Descartar el borrador borra todo lo que escribiste desde la última publicación. Vuelves
              a la versión que hoy leen los participantes.
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  descartarBorrador(experiencia.id)
                  const vuelta = cargar(experiencia.id)
                  setBloques(vuelta)
                  ultimoGuardado.current = JSON.stringify(vuelta)
                  setConBorrador(false)
                  setConfirmandoDescarte(false)
                  setEstado('limpio')
                }}
                className={BTN_PELIGRO}
              >
                Sí, descartar
              </button>
              <button onClick={() => setConfirmandoDescarte(false)} className={`${BTN_FILA} bg-white`}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* El error no puede ser solo un chip rojo: sin salida, el autor no
            sabe si perdió el trabajo ni qué hacer con él. */}
        {estado === 'error' && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start justify-between gap-4 flex-wrap">
            <p className="text-sm text-red-800 leading-relaxed max-w-[70ch]">
              No se pudo guardar. Tu trabajo sigue en pantalla y no se ha perdido. Si el problema
              sigue, copia el texto a otro lado antes de cerrar esta pestaña.
            </p>
            <Boton variante="peligro" onClick={guardarYa} cargando={guardandoUI} textoCargando="Guardando">
              Reintentar
            </Boton>
          </div>
        )}
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
          {/* Dos de las cuatro experiencias no tienen bisagras todavía. Sin
              esto el lienzo salía en blanco, sin decir por qué. */}
          {bisagras.length === 0 && (
            <div className="border border-dashed border-slate-200 rounded-xl px-5 py-10 text-center">
              <p className="text-sm text-slate-600">
                {experiencia.nombre} todavía no tiene bisagras.
              </p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-[46ch] mx-auto">
                Una bisagra es cada momento de la experiencia. El contenido se escribe dentro de
                ellas, así que hay que definirlas antes de poder escribir. Todavía no se puede hacer
                desde aquí.
              </p>
            </div>
          )}

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
            {/* El vacío se nombra con el título de la bisagra, y la acción
                que lo resuelve va DENTRO de la caja. Antes decía "agrega el
                primer bloque abajo" y ese "abajo" quedaba a 300 px, después
                de otra tarjeta. */}
            {bisagraActiva && delBloque.length === 0 && (
              <div className="border border-dashed border-slate-200 rounded-xl px-5 py-8 text-center">
                <p className="text-sm text-slate-500">
                  {bisagraActiva.titulo} todavía no tiene nada escrito.
                </p>
                <button onClick={() => agregar('texto')} className={`${BTN_SECUNDARIO} mt-4`}>
                  Escribir el primer bloque
                </button>
              </div>
            )}

            {delBloque.map((b, i) => (
              <TarjetaBloque
                key={b.id}
                b={b}
                primero={i === 0}
                ultimo={i === delBloque.length - 1}
                porBorrar={porBorrar === b.id}
                resaltado={recienCreado === b.id}
                onCambio={campos => actualizar(b.id, campos)}
                onMover={d => mover(b.id, d)}
                onPedirBorrar={() => setPorBorrar(b.id)}
                onCancelarBorrar={() => setPorBorrar(null)}
                onBorrar={() => borrar(b.id)}
              />
            ))}
          </div>

          {/* Agregar bloque. Dos filas: los seis que se usan siempre y los
              cinco ocasionales, en vez de once del mismo peso. */}
          {bisagraActiva && (
            <div className={`${TARJETA} p-4 mt-4`}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Agregar bloque
              </div>
              <div className="flex flex-wrap gap-2">
                {TIPOS_FRECUENTES.map(t => (
                  <BotonTipo key={t} t={t} onClick={() => agregar(t)} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100">
                {TIPOS_OCASIONALES.map(t => (
                  <BotonTipo key={t} t={t} onClick={() => agregar(t)} tenue />
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                La subida de archivo, imagen y video todavía no está conectada. Puedes armar el bloque
                y ver cómo queda; el archivo no sale de tu navegador y se pierde al recargar.
              </p>
            </div>
          )}
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
                        ? 'Aquí va a leerse lo que escribas.'
                        : 'Con la lente de participante esto sale en blanco. Todo lo que hay en esta bisagra está marcado como solo moderador.'}
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

// ── Botón de tipo de bloque ─────────────────────────────────────

function BotonTipo({ t, onClick, tenue = false }: { t: TipoBloque; onClick: () => void; tenue?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={CATALOGO[t].ayuda}
      className={`text-xs px-3 py-1.5 rounded-lg border transition-[background-color,border-color,transform] duration-100 active:scale-[0.97] hover:bg-slate-900 hover:text-white hover:border-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/25 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 ${
        tenue ? 'border-slate-200 text-slate-500' : 'border-slate-300 text-slate-800 font-medium'
      }`}
    >
      {CATALOGO[t].nombre}
    </button>
  )
}

// ── Tarjeta de un bloque ────────────────────────────────────────

function TarjetaBloque({
  b, primero, ultimo, porBorrar, resaltado,
  onCambio, onMover, onPedirBorrar, onCancelarBorrar, onBorrar,
}: {
  b: Bloque
  primero: boolean
  ultimo: boolean
  porBorrar: boolean
  resaltado: boolean
  onCambio: (campos: Partial<Bloque>) => void
  onMover: (delta: number) => void
  onPedirBorrar: () => void
  onCancelarBorrar: () => void
  onBorrar: () => void
}) {
  const esNota = b.tipo === 'nota'

  return (
    <div
      id={`bloque-${b.id}`}
      className={`${TARJETA} overflow-hidden transition-shadow duration-500 ${
        resaltado ? 'ring-2 ring-slate-900/15' : ''
      }`}
    >
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
          <button onClick={() => onMover(-1)} disabled={primero} className={BTN_FILA} title="Subir">↑</button>
          <button onClick={() => onMover(1)} disabled={ultimo} className={BTN_FILA} title="Bajar">↓</button>
          {porBorrar ? (
            <>
              <button onClick={onBorrar} className={BTN_PELIGRO}>Confirmar</button>
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
