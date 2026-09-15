'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import BloqueLector from '../../../Bloques'
import SubirArchivo from '../../../SubirArchivo'
import {
  NIVEL, definicion,
  TIPOS_FRECUENTES, TIPOS_OCASIONALES, CON_MEDIO,
  type Bloque, type TipoBloque, type Audiencia,
} from '@/lib/personalab/bloques'
import {
  crearBloque, guardarBloque, borrarBloque, borrarMedio, reordenarRemoto,
  camposPorDefecto, cambiarAudiencia, reordenar,
  ConflictoDeVersion,
} from '../../../almacenRemoto'
import type { ExperienciaEditable, BloqueEditable } from '@/lib/personalab/editorDatos'
import { ETIQUETA_TIEMPO, type Tiempo } from '../../../dominio'
import { BTN_PRIMARIO, BTN_SECUNDARIO, BTN_FILA, BTN_PELIGRO, TARJETA } from '../../../tokens'
import { Boton, Girador } from '../../../ui'

// ETAPA 3. Este componente ya no guarda en localStorage: cada acción
// (agregar, editar, mover, borrar un bloque) escribe a la base real, contra
// el borrador de esta experiencia. `almacen.ts` y su copia de "borrador vs.
// publicado" quedan retirados: ahora el borrador ES la versión en estado
// 'borrador' de `experience_versions`, y lo protege la base, no el
// navegador de quien edita.
//
// EL CAMBIO DE FONDO: antes se acumulaban ediciones en memoria y se volcaba
// el arreglo COMPLETO a disco cada 700ms. Eso no existe con una base
// compartida: dos personas editando pisarían el trabajo de la otra en cada
// volcado. Ahora cada bloque persiste POR SU CUENTA, con el mismo candado de
// concurrencia optimista (`rev`) que ya traía `almacenRemoto.ts` escrito y
// sin usar.

type EstadoBloque = 'limpio' | 'pendiente' | 'guardando' | 'guardado' | 'error'

// UN BLOQUE PUEDE EXISTIR EN PANTALLA ANTES DE EXISTIR EN LA BASE.
//
// ENCONTRADO PROBANDO, NO LEYENDO: la primera versión de este archivo creaba
// el bloque en la base EN EL INSTANTE de hacer clic en "Texto", con
// contenido vacío. `blocks_contenido_por_tipo` exige contenido no vacío
// para casi todos los tipos desde la primera fila (`pausa` es el único que
// no exige nada), así que ese insert fallaba siempre, en el primer intento,
// para once de doce tipos. "No se pudo crear el bloque" apenas se
// terminaba de construir la función que lo crea.
//
// La corrección no es rellenar el contenido con algo falso para pasar la
// validación (un espacio en blanco pasaría el CHECK de la base y seguiría
// siendo vacío para quien lee): es no mentir sobre cuándo existe la fila.
// Un bloque recién agregado vive SOLO en el navegador (id con el prefijo
// `local:`) hasta que tiene contenido de verdad; el primer guardado que ya
// no viola el CHECK es el que lo crea en la base, con su id real. Si se
// abandona vacío y se navega a otra bisagra, nunca llegó a existir en la
// base: no hay nada que limpiar después.
const PREFIJO_LOCAL = 'local:'
function esLocal(id: string): boolean {
  return id.startsWith(PREFIJO_LOCAL)
}
function idLocal(): string {
  return PREFIJO_LOCAL + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const CHIP: Record<EstadoBloque, { texto: string; clase: string }> = {
  limpio:    { texto: 'Todo guardado',       clase: 'text-slate-400' },
  pendiente: { texto: 'Cambios sin guardar', clase: 'text-amber-600' },
  guardando: { texto: 'Guardando',           clase: 'text-slate-400' },
  guardado:  { texto: 'Guardado',            clase: 'text-emerald-600' },
  error:     { texto: 'No se pudo guardar',  clase: 'text-red-600' },
}

// El orden importa: si un bloque está en error, eso manda sobre cualquier
// otra cosa que esté pasando en el resto de la pantalla.
const PESO_ESTADO: Record<EstadoBloque, number> = {
  error: 4, guardando: 3, pendiente: 2, guardado: 1, limpio: 0,
}

const DEMORA_AUTOGUARDADO = 700

// Debajo de este piso el ojo no registra el cambio de "Guardando" a
// "Guardado" y parece que no pasó nada. Ya regía para el botón manual de
// Publicar.tsx (`MINIMO_PERCEPTIBLE`, decisión de Julián); se le había
// olvidado aplicar al guardado automático de cada bloque al reescribir este
// archivo para la base real, y en red rápida el chip podía no pintarse un
// solo cuadro. Mismo nombre, mismo valor, para que la sensación sea igual
// en las dos pantallas.
const MINIMO_PERCEPTIBLE = 400

async function conPisoPerceptible<T>(promesa: Promise<T>): Promise<T> {
  const inicio = Date.now()
  const resultado = await promesa
  const resto = MINIMO_PERCEPTIBLE - (Date.now() - inicio)
  if (resto > 0) await new Promise(r => setTimeout(r, resto))
  return resultado
}

const ETIQUETA_INPUT = 'block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5'
const INPUT =
  'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-colors'

const TIEMPOS: Tiempo[] = ['vispera', 'ignicion', 'retorno']

export default function Editor({
  experiencia, bloquesIniciales,
}: {
  experiencia: ExperienciaEditable
  bloquesIniciales: BloqueEditable[]
}) {
  const [bloques, setBloques] = useState<BloqueEditable[]>(bloquesIniciales)
  const [activa, setActiva] = useState<string>('')
  const [estadosPorBloque, setEstadosPorBloque] = useState<Map<string, EstadoBloque>>(new Map())
  const [lente, setLente] = useState<'participante' | 'moderador'>('participante')
  const [porBorrar, setPorBorrar] = useState<string | null>(null)
  const [borrando, setBorrando] = useState<string | null>(null)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
  const [conflicto, setConflicto] = useState<string | null>(null)
  const [recienCreado, setRecienCreado] = useState<string | null>(null)
  const enfocarAlResaltar = useRef(false)
  const temporizadores = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  // BUG REAL, ENCONTRADO PROBANDO EN EL NAVEGADOR, NO LEYENDO EL CÓDIGO:
  // `guardarBloqueAhora` hacía `bloques.find(...)` cerrando sobre el
  // `bloques` de la renderización donde el temporizador se programó. Al
  // escribir rápido, varias pulsaciones caen dentro del mismo lote de
  // React antes de que exista una renderización nueva, así que el cierre
  // que sobrevivía (el del último timeout) seguía viendo el texto de
  // ANTES de escribir. El chip decía "Guardado" y la base se guardaba de
  // verdad, solo que con el contenido viejo: pérdida de datos silenciosa,
  // sin ningún error que la delatara. Verificado contra la base real con
  // la llave de servicio: `rev` subía, `contenido` no cambiaba.
  //
  // La corrección: una ref que SIEMPRE tiene el `bloques` más reciente,
  // sin importar de qué renderización viene el cierre que la lee. Un ref
  // se desreferencia en el momento en que se lee, no en el momento en que
  // el cierre se creó, que es justo la garantía que un `setTimeout`
  // necesita y que el estado de React no da por sí solo.
  const bloquesRef = useRef<BloqueEditable[]>(bloques)
  useEffect(() => {
    bloquesRef.current = bloques
  }, [bloques])

  // LA LLAVE DE REACT DE UNA TARJETA NO PUEDE SER `b.id`. Un bloque nace
  // local y su id cambia una vez, al primer guardado que lo crea de verdad
  // (ver PREFIJO_LOCAL arriba). Si la llave de React fuera el id, ese
  // cambio desmontaría la tarjeta y remontaría una nueva: quien estuviera
  // escribiendo en ese instante perdería el foco del campo a mitad de
  // palabra. Esta tabla asigna una llave que nace con el bloque y no
  // cambia aunque su id sí.
  const clavesEstables = useRef<Map<string, string>>(
    new Map(bloquesIniciales.map(b => [b.id, b.id]))
  )
  function claveDe(id: string): string {
    let c = clavesEstables.current.get(id)
    if (!c) {
      c = id
      clavesEstables.current.set(id, c)
    }
    return c
  }
  function renombrarClave(idViejo: string, idNuevo: string) {
    const c = clavesEstables.current.get(idViejo) ?? idViejo
    clavesEstables.current.delete(idViejo)
    clavesEstables.current.set(idNuevo, c)
  }

  useEffect(() => {
    const orden = experiencia.bisagras.slice().sort((a, b) => a.orden - b.orden)
    const pedida = new URLSearchParams(window.location.search).get('bisagra')
    const valida = pedida && orden.some(b => b.id === pedida) ? pedida : null
    setActiva(valida ?? (orden[0]?.id ?? ''))
  }, [experiencia])

  // El chip global es el peor caso entre todos los bloques con actividad
  // reciente. Un bloque que nunca se tocó no cuenta: si contara, la
  // pantalla abriría diciendo "Todo guardado" de forma vacía, sin que
  // nadie hubiera guardado nada todavía.
  const estadoGlobal = useMemo<EstadoBloque>(() => {
    let peor: EstadoBloque = 'limpio'
    Array.from(estadosPorBloque.values()).forEach(e => {
      if (PESO_ESTADO[e] > PESO_ESTADO[peor]) peor = e
    })
    return peor
  }, [estadosPorBloque])

  // Los estados y los temporizadores también se llevan por clave estable,
  // no por id, por la misma razón que la llave de React: el id de un
  // bloque local cambia una vez, y nada de esta contabilidad puede
  // perderse ni duplicarse cuando eso pasa.
  function marcarPorClave(clave: string, e: EstadoBloque) {
    setEstadosPorBloque(prev => {
      const copia = new Map(prev)
      copia.set(clave, e)
      return copia
    })
  }

  function idPorClave(clave: string): string | null {
    for (const [id, c] of Array.from(clavesEstables.current.entries())) {
      if (c === clave) return id
    }
    return null
  }

  // No dejar salir con un guardado en curso o fallido. Cuenta lo mismo que
  // antes: es justo cuando más caro sale cerrar la pestaña.
  //
  // LA BANDERA ES PARA UN CASO DISTINTO: cuando el botón "Recargar" del
  // banner de conflicto llama a esto él mismo, a propósito, para abandonar
  // el estado local roto y traer el real del servidor. Sin esta bandera,
  // ese mismo `estadoGlobal === 'error'` que puso el conflicto activa este
  // guardia y el navegador pregunta "¿Salir del sitio?" — justo el
  // recuadro que puede tragarse sin querer alguien que ya está tratando de
  // salir de un error. Hallazgo de Hugo, reproducido: el diálogo nativo
  // bloqueó la recuperación dos veces seguidas en su propia prueba.
  const saltarConfirmacionSalida = useRef(false)
  useEffect(() => {
    function alSalir(e: BeforeUnloadEvent) {
      if (saltarConfirmacionSalida.current) return
      if (estadoGlobal === 'pendiente' || estadoGlobal === 'guardando' || estadoGlobal === 'error') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', alSalir)
    return () => window.removeEventListener('beforeunload', alSalir)
  }, [estadoGlobal])

  useEffect(() => {
    const temporizadoresActuales = temporizadores.current
    return () => {
      Array.from(temporizadoresActuales.values()).forEach(t => clearTimeout(t))
    }
  }, [])

  // Una creación en camino por clave, para que dos guardados que caen muy
  // cerca (escribir, y volver a escribir antes de que la primera creación
  // responda) no terminen creando DOS filas para el mismo bloque. El
  // segundo espera a que la primera termine y sigue desde ahí, en vez de
  // dispararse por su cuenta.
  const creacionesEnCurso = useRef<Map<string, Promise<BloqueEditable | null>>>(new Map())

  // EL ARCHIVO QUE "REEMPLAZAR" REEMPLAZABA A MEDIAS. `onListo` (más abajo)
  // deja aquí el `medioId` viejo, por clave, antes de que `onCambio` lo
  // pise con el nuevo. Se borra recién DESPUÉS de que el guardado con el
  // `medioId` nuevo confirme, nunca antes: si el guardado fallara primero,
  // el archivo viejo se queda como estaba en vez de perderse sin que el
  // nuevo haya quedado a salvo. Hallazgo de Leo.
  const mediosAReemplazar = useRef<Map<string, string>>(new Map())

  async function guardarOCrear(clave: string) {
    let id = idPorClave(clave)
    if (!id) return

    if (esLocal(id)) {
      const enCurso = creacionesEnCurso.current.get(clave)
      if (enCurso) {
        await enCurso
        id = idPorClave(clave)
        if (!id || esLocal(id)) return // la creación en curso falló: nada más que hacer aquí
      } else {
        const promesa = crearAhora(clave, id)
        creacionesEnCurso.current.set(clave, promesa)
        await promesa
        creacionesEnCurso.current.delete(clave)
        return
      }
    }

    const b = bloquesRef.current.find(x => x.id === id)
    if (!b) return
    marcarPorClave(clave, 'guardando')
    try {
      const rev = await conPisoPerceptible(guardarBloque(b, experiencia.versionId))
      setBloques(prev => prev.map(x => (x.id === b.id ? { ...x, rev } : x)))
      marcarPorClave(clave, 'guardado')

      const medioViejo = mediosAReemplazar.current.get(clave)
      if (medioViejo) {
        mediosAReemplazar.current.delete(clave)
        borrarMedio(medioViejo).catch(() => {
          // No hay nada que el usuario pueda hacer con este error: el
          // bloque ya quedó bien, un archivo huérfano en el almacén no le
          // afecta a nadie. Se deja para una limpieza aparte, no para una
          // alarma en pantalla por algo que ya no tiene remedio desde aquí.
        })
      }
    } catch (e) {
      const codigo = (e as { code?: string } | null)?.code
      if (e instanceof ConflictoDeVersion || codigo === '42501') {
        // MISMO BANNER PARA LAS DOS CAUSAS, A PROPÓSITO. El mensaje viejo
        // decía "alguien guardó cambios en ESTE bloque", y eso era falso
        // en el caso real que lo disparó: alguien publicó o revirtió la
        // EXPERIENCIA completa mientras se editaba, no tocó este bloque en
        // particular. Un update contra una versión que ya no es el
        // borrador vivo cae aquí (RLS lo invalida en silencio, sale como
        // `ConflictoDeVersion` porque el update no afecta ninguna fila).
        // Un insert nuevo contra esa misma versión muerta no tiene fila
        // que comparar: Postgres lo rechaza directo con `42501`, y antes
        // de este arreglo caía al chip rojo genérico sin explicación.
        // Hallazgo de Hugo, reproducido en vivo con una publicación real
        // mientras el editor seguía abierto.
        setConflicto(
          'Esta experiencia cambió del lado del servidor mientras editabas (alguien publicó o deshizo una publicación). Para no perder ni tu trabajo ni el de esa persona, recarga la página y vuelve a hacer tu cambio sobre la versión más reciente.'
        )
      } else if (codigo === '23514') {
        // Vaciar un campo obligatorio de un bloque QUE YA EXISTÍA es
        // distinto de un fallo de red, y antes de esto se veían igual:
        // el mismo chip rojo genérico para las dos causas. Aquí lo que
        // hay en la base sigue siendo lo último que sí se guardó — lo
        // que se perdería es solo lo que se ve en pantalla ahora mismo,
        // si se recarga sin corregirlo. Hallazgo de Julián.
        setErrorGlobal(
          `${definicion(b.tipo).nombre}: no puede quedar sin ${definicion(b.tipo).campos.texto ? 'texto' : 'contenido'}. Lo último que sí se guardó sigue en la base; esto que ves ahora no se ha guardado.`
        )
      }
      marcarPorClave(clave, 'error')
    }
  }

  // La primera vez que un bloque local tiene algo que valga la pena
  // guardar, ESTO lo crea de verdad, con id real, y avisa a
  // `clavesEstables` del cambio. Si el contenido sigue sin ser válido para
  // su tipo, la base lo rechaza con el CHECK `blocks_contenido_por_tipo`
  // (código 23514): eso no es un error para mostrar, es "todavía no hay
  // nada que guardar", y el bloque se queda local hasta la próxima vez.
  async function crearAhora(clave: string, idLocalDeAhora: string): Promise<BloqueEditable | null> {
    const b = bloquesRef.current.find(x => x.id === idLocalDeAhora)
    if (!b) return null
    marcarPorClave(clave, 'guardando')
    try {
      const creado = await conPisoPerceptible(crearBloque(b, experiencia.versionId))
      renombrarClave(idLocalDeAhora, creado.id)
      // SOLO id Y rev vienen del servidor, nunca el resto del bloque.
      // `creado` refleja el contenido tal como estaba en el instante en
      // que se mandó el INSERT (t=700ms del debounce); si la persona
      // siguió escribiendo mientras la red respondía (realista: un
      // INSERT tarda lo suyo), reemplazar el objeto completo por
      // `creado` habría hecho retroceder el texto en pantalla a mitad de
      // escritura, en el momento exacto en que la creación resuelve, sin
      // ningún error que lo delatara. Hallazgo de Daniel, auditando esta
      // misma etapa. La edición que llegó durante la espera ya tiene su
      // propio guardado programado (el debounce de esa tecla), así que
      // fusionar en vez de reemplazar no pierde nada: ese guardado
      // posterior la persiste como una actualización normal.
      setBloques(prev => prev.map(x => (x.id === idLocalDeAhora ? { ...x, id: creado.id, rev: creado.rev } : x)))
      marcarPorClave(clave, 'guardado')
      return creado
    } catch (e) {
      const codigo = (e as { code?: string } | null)?.code
      if (codigo === '23514') {
        marcarPorClave(clave, 'limpio')
        return null
      }
      if (codigo === '42501') {
        // Un bloque nuevo, creado contra una versión que dejó de ser el
        // borrador vivo (alguien publicó o revirtió mientras se escribía):
        // no hay fila que comparar como en `guardarBloque`, así que
        // Postgres lo rechaza directo por RLS en vez de devolver cero
        // filas. Antes de este arreglo caía al mismo `else` genérico que
        // un fallo de red, sin explicación. Mismo banner que el caso de
        // edición, mismo remedio. Hallazgo de Hugo.
        setConflicto(
          'Esta experiencia cambió del lado del servidor mientras editabas (alguien publicó o deshizo una publicación). Para no perder ni tu trabajo ni el de esa persona, recarga la página y vuelve a hacer tu cambio sobre la versión más reciente.'
        )
      }
      marcarPorClave(clave, 'error')
      return null
    }
  }

  function programarGuardado(clave: string) {
    const existente = temporizadores.current.get(clave)
    if (existente) clearTimeout(existente)
    temporizadores.current.set(
      clave,
      setTimeout(() => {
        temporizadores.current.delete(clave)
        guardarOCrear(clave)
      }, DEMORA_AUTOGUARDADO)
    )
  }

  // Debounce POR BLOQUE, no global. Editar el bloque A y luego el B dispara
  // dos temporizadores independientes; guardar A no espera a B ni al revés.
  function actualizar(id: string, campos: Partial<Bloque>) {
    // Reemplazar o quitar un archivo cambia `medioId` a otra cosa (uno
    // nuevo, o null). Las dos veces el archivo viejo se queda huérfano en
    // Storage y en `media` si nadie lo borra — ver el comentario de
    // `mediosAReemplazar` más arriba y el de `borrarMedio` en
    // `almacenRemoto.ts`. Se detecta aquí, en el único sitio por el que
    // pasa todo cambio de `medioId`, en vez de repetirlo en cada `onListo`
    // y `onQuitar` de `TarjetaBloque`.
    if ('medioId' in campos) {
      const medioViejo = bloquesRef.current.find(x => x.id === id)?.medioId
      if (medioViejo && medioViejo !== campos.medioId) {
        mediosAReemplazar.current.set(claveDe(id), medioViejo)
      }
    }
    setBloques(prev => prev.map(b => (b.id === id ? { ...b, ...campos } : b)))
    const clave = claveDe(id)
    marcarPorClave(clave, 'pendiente')
    programarGuardado(clave)
  }

  // El botón "Guardar" y Cmd/Ctrl+S adelantan lo pendiente en vez de
  // esperar el debounce. No hacen nada nuevo: solo dejan de esperar.
  const guardarYa = useCallback(() => {
    Array.from(temporizadores.current.entries()).forEach(([clave, t]) => {
      clearTimeout(t)
      temporizadores.current.delete(clave)
      guardarOCrear(clave)
    })
    // Deps vacías a propósito, no un olvido: el cuerpo no lee `bloques` ni
    // `experiencia` directamente, todo pasa por `guardarOCrear`, que lee
    // `bloquesRef.current` (siempre al día) y `experiencia` por closure de
    // props (la misma experiencia durante toda la sesión de edición). Antes
    // decía `[bloques, experiencia.versionId]`, una dependencia que ya no
    // describía lo que el cuerpo hace. Hallazgo de Daniel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // Nace local, no en la base. Ver PREFIJO_LOCAL: la base exige contenido
  // válido desde la primera fila para once de los doce tipos, así que
  // crear en el instante del clic fallaba siempre para esos once. Ahora se
  // agrega a la pantalla de inmediato (para que la persona pueda empezar a
  // escribir ya mismo) y se programa un intento de guardado con el mismo
  // mecanismo que usa cada tecla: si el tipo puede existir vacío (pausa),
  // se crea solo; si no, se queda local hasta que haya algo que guardar.
  function agregar(tipo: TipoBloque) {
    setErrorGlobal(null)
    const id = idLocal()
    const nuevo: BloqueEditable = {
      id, bisagraId: activa, orden: delBloque.length + 1, tipo, audiencia: 'todos', rev: 0,
      ...camposPorDefecto(tipo),
    }
    setBloques(prev => [...prev, nuevo])
    const clave = claveDe(id)
    resaltar(id, true)
    programarGuardado(clave)
  }

  async function mover(id: string, delta: number) {
    const antes = new Map(bloques.map(b => [b.id, b.orden]))
    const despues = reordenar(bloques, activa, id, delta)
    const cambiados = despues.filter(b => antes.get(b.id) !== b.orden)
    if (cambiados.length === 0) return

    setBloques(despues)
    resaltar(id, false)

    // Los locales no existen en la base todavía: mover uno es pura
    // contabilidad de pantalla, nada que persistir hasta que se cree.
    const cambiadosReales = cambiados.filter(b => !esLocal(b.id))
    if (cambiadosReales.length === 0) return

    for (const c of cambiadosReales) marcarPorClave(claveDe(c.id), 'guardando')
    try {
      await reordenarRemoto(cambiadosReales.map(b => ({ id: b.id, orden: b.orden })), experiencia.versionId)
      for (const c of cambiadosReales) marcarPorClave(claveDe(c.id), 'guardado')
    } catch {
      // Revertir SOLO el orden de los bloques que ESTE movimiento tocó,
      // sobre el estado más reciente (función de actualización, no el
      // `bloques` cerrado de cuando se hizo clic). `reordenarRemoto` manda
      // sus updates uno por uno, no en una transacción (el propio
      // comentario ahí lo admite a propósito), así que mientras esperaba
      // la red, otro bloque pudo haberse autoguardado con su propio
      // cambio real. `setBloques(bloques)` volvía a ESE snapshot viejo
      // completo y se llevaba esa edición por delante sin avisar.
      // Hallazgo de Daniel, mismo tipo de cierre obsoleto que ya había
      // corregido en el guardado de texto, reaparecido aquí porque la
      // corrección de uno no cubría al otro.
      const ordenPrevio = new Map(cambiados.map(b => [b.id, antes.get(b.id)!]))
      setBloques(prev => prev.map(b => (ordenPrevio.has(b.id) ? { ...b, orden: ordenPrevio.get(b.id)! } : b)))
      for (const c of cambiadosReales) marcarPorClave(claveDe(c.id), 'error')
      setErrorGlobal(
        'No se pudo mover el bloque. Se deshizo el cambio en pantalla. Si moviste varios a la vez, revisa el orden: reordenarRemoto no es una sola operación, así que alguno pudo haberse guardado antes de que fallara.'
      )
    }
  }

  function resaltar(id: string, conFoco: boolean) {
    enfocarAlResaltar.current = conFoco
    setRecienCreado(id)
  }

  async function borrar(id: string) {
    setErrorGlobal(null)

    // Local: nunca llegó a la base. Quitarlo de pantalla es todo lo que
    // hay que hacer, y no hace falta esperar ninguna red.
    if (esLocal(id)) {
      const clave = claveDe(id)
      const t = temporizadores.current.get(clave)
      if (t) clearTimeout(t)
      temporizadores.current.delete(clave)
      setBloques(prev => prev.filter(b => b.id !== id))
      setPorBorrar(null)
      return
    }

    setBorrando(id)
    try {
      await borrarBloque(id)
      setBloques(prev => prev.filter(b => b.id !== id))
      setPorBorrar(null)
    } catch {
      setErrorGlobal('No se pudo quitar el bloque. Sigue ahí, sin cambios.')
    } finally {
      setBorrando(null)
    }
  }

  return (
    <>
      {/* Cabecera del editor */}
      <div className="sticky top-[104px] z-30 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 -mx-6 px-6 py-3 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-baseline gap-3 min-w-0">
            <Link
              href={`/personalab/experiencias/${experiencia.slug}`}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap"
            >
              ← {experiencia.nombre}
            </Link>
            <span className="text-sm font-semibold text-slate-900 truncate">Editor</span>
            <span
              className={`text-xs ${CHIP[estadoGlobal].clase} whitespace-nowrap inline-flex items-center gap-1.5`}
              role="status"
              aria-live="polite"
            >
              {estadoGlobal === 'guardando' && <Girador />}
              {CHIP[estadoGlobal].texto}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Boton
              variante="secundario"
              onClick={guardarYa}
              disabled={estadoGlobal !== 'pendiente'}
            >
              Guardar
            </Boton>
            <Link
              href={`/personalab/experiencias/${experiencia.slug}/publicar`}
              className={BTN_PRIMARIO}
            >
              Revisar y publicar
            </Link>
          </div>
        </div>

        {conflicto && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start justify-between gap-4 flex-wrap">
            <p className="text-sm text-amber-900 leading-relaxed max-w-[70ch]">{conflicto}</p>
            <button
              onClick={() => { saltarConfirmacionSalida.current = true; window.location.reload() }}
              className={BTN_PRIMARIO}
            >
              Recargar
            </button>
          </div>
        )}

        {errorGlobal && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-800 leading-relaxed max-w-[70ch]">{errorGlobal}</p>
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
                  // Solo cuenta lo que de verdad está en la base. Un
                  // bloque local recién creado (todavía sin contenido
                  // válido) hacía que esto dijera "1 bloque" para una
                  // bisagra que, si se recarga la página ahora mismo,
                  // sigue vacía. Dos señales que mentían en la misma
                  // dirección. Hallazgo de Julián.
                  const n = bloques.filter(x => x.bisagraId === b.id && !esLocal(x.id)).length
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
                key={claveDe(b.id)}
                b={b}
                primero={i === 0}
                ultimo={i === delBloque.length - 1}
                porBorrar={porBorrar === b.id}
                borrando={borrando === b.id}
                resaltado={recienCreado === b.id}
                estado={estadosPorBloque.get(claveDe(b.id)) ?? 'limpio'}
                onCambio={campos => actualizar(b.id, campos)}
                onMover={d => mover(b.id, d)}
                onPedirBorrar={() => setPorBorrar(b.id)}
                onCancelarBorrar={() => setPorBorrar(null)}
                onBorrar={() => borrar(b.id)}
              />
            ))}
          </div>

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
                    visiblesEnPrevia.map(b => <BloqueLector key={claveDe(b.id)} b={b} />)
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
      title={definicion(t).ayuda}
      className={`text-xs px-3 py-1.5 rounded-lg border transition-[background-color,border-color,transform] duration-100 active:scale-[0.97] hover:bg-slate-900 hover:text-white hover:border-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/25 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 ${
        tenue ? 'border-slate-200 text-slate-500' : 'border-slate-300 text-slate-800 font-medium'
      }`}
    >
      {definicion(t).nombre}
    </button>
  )
}

// ── Tarjeta de un bloque ────────────────────────────────────────

function TarjetaBloque({
  b, primero, ultimo, porBorrar, borrando, resaltado, estado,
  onCambio, onMover, onPedirBorrar, onCancelarBorrar, onBorrar,
}: {
  b: Bloque
  primero: boolean
  ultimo: boolean
  porBorrar: boolean
  borrando: boolean
  resaltado: boolean
  estado: EstadoBloque
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
      } ${estado === 'error' ? 'ring-2 ring-red-300' : ''}`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-semibold text-slate-700">{definicion(b.tipo).nombre}</span>
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
          {estado === 'error' && (
            <span className="text-[11px] text-red-600 font-medium">No se guardó</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onMover(-1)} disabled={primero} className={BTN_FILA} title="Subir">↑</button>
          <button onClick={() => onMover(1)} disabled={ultimo} className={BTN_FILA} title="Bajar">↓</button>
          {porBorrar ? (
            <>
              <button onClick={onBorrar} disabled={borrando} className={BTN_PELIGRO}>
                {borrando ? 'Quitando…' : 'Confirmar'}
              </button>
              <button onClick={onCancelarBorrar} disabled={borrando} className={BTN_FILA}>Cancelar</button>
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
          <>
            <p className="text-sm text-slate-400">Un respiro. Nadie ve texto aquí.</p>
            <div className="mt-3">
              <label className={ETIQUETA_INPUT}>Segundos de espera (máximo 30)</label>
              <input
                type="number"
                min={0}
                max={30}
                value={b.segundos ?? ''}
                onChange={e => onCambio({ segundos: e.target.value === '' ? undefined : Number(e.target.value) })}
                placeholder="0"
                className={`${INPUT} w-24`}
              />
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Cuánto espera la persona antes de que aparezca el botón para seguir. Sin este campo,
                la pausa no detiene nada.
              </p>
            </div>
          </>
        ) : CON_MEDIO.includes(b.tipo) ? (
          <>
            <label className={ETIQUETA_INPUT}>{definicion(b.tipo).nombre}</label>
            <SubirArchivo
              tipo={b.tipo}
              nombre={b.nombreArchivo}
              url={b.medioId ? b.url : undefined}
              onListo={d => onCambio({ nombreArchivo: d.nombreArchivo, peso: d.peso, url: d.url, medioId: d.medioId })}
              onQuitar={() => onCambio({ nombreArchivo: '', peso: undefined, url: undefined, medioId: null })}
            />

            {/* EL CAMINO QUE LA COMPUERTA YA PROMETÍA Y NINGUNA PANTALLA
                OFRECÍA. `blocks_contenido_por_tipo` acepta video y audio
                con solo una URL, sin archivo subido (contrato:
                `admiteUrl`), y `revision.ts` le decía a quien edita "pega
                un enlace" — pero no había dónde. Encontrado por Julián,
                probando en el navegador, mientras el bucket de audio
                todavía no existía y subir un archivo directo no era
                opción. Ahora sí lo es (Etapa 5, `lib/personalab/medios.ts`),
                pero el enlace externo se queda: para video sigue siendo la
                vía honesta hacia Vimeo o un YouTube sin listar, algo que
                subir el archivo nunca reemplaza. */}
            {definicion(b.tipo).medio?.admiteUrl && !b.medioId && (
              <div className="mt-3">
                <label className={ETIQUETA_INPUT}>
                  O pega un enlace{b.tipo === 'video' ? ' (Vimeo, YouTube sin listar)' : ''}
                </label>
                <input
                  value={b.url ?? ''}
                  onChange={e => onCambio({ url: e.target.value || undefined })}
                  placeholder="https://…"
                  className={INPUT}
                />
              </div>
            )}

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

            {/* El contrato (bloques.ts) declara `duracion` para video y
                audio desde que existen, pero nunca tuvo dónde escribirse
                aquí: quien editaba solo podía teclearla directo en
                Supabase. Campo opcional, así que nunca bloqueó publicar,
                pero era un campo prometido sin pantalla. Hallazgo de Leo. */}
            {(b.tipo === 'video' || b.tipo === 'audio') && (
              <div className="mt-3">
                <label className={ETIQUETA_INPUT}>Duración</label>
                <input
                  value={b.duracion ?? ''}
                  onChange={e => onCambio({ duracion: e.target.value || undefined })}
                  placeholder="12:34"
                  className={`${INPUT} w-24`}
                />
              </div>
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
