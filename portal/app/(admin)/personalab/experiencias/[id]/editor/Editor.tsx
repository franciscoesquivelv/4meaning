'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import BloqueLector from '../../../Bloques'
import SubirArchivo from '../../../SubirArchivo'
import AtmosferaVistaPrevia from '../../../AtmosferaVistaPrevia'
import {
  NIVEL, definicion,
  TIPOS_FRECUENTES, TIPOS_OCASIONALES, CON_MEDIO,
  type Bloque, type TipoBloque, type Audiencia,
} from '@/lib/personalab/bloques'
import {
  crearBloque, guardarBloque, borrarBloque, borrarMedio, reordenarRemoto,
  camposPorDefecto, cambiarAudiencia, reordenar,
  crearSeccionRemoto, guardarSeccionRemoto, borrarSeccionRemoto,
  reordenarSecciones, reordenarSeccionesRemoto, seccionNueva,
  ConflictoDeVersion,
} from '../../../almacenRemoto'
import type { ExperienciaEditable, BloqueEditable, BisagraEditable } from '@/lib/personalab/editorDatos'
import { ETIQUETA_TIEMPO, type Tiempo } from '../../../dominio'
import { BTN_PRIMARIO, BTN_SECUNDARIO, BTN_FILA, BTN_PELIGRO, TARJETA } from '../../../tokens'
import { Boton, Girador } from '../../../ui'
import { PASTILLA_CURSO } from '@/lib/estilos/oficina'

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

// Los cuatro tonos ya existen en `lib/estilos/oficina.ts` (TONO), en uso en
// el resto de PersonaLab: cero token nuevo, cero contraste sin medir.
const CHIP: Record<EstadoBloque, { texto: string; clase: string }> = {
  limpio:    { texto: 'Todo guardado',       clase: 'text-gray-ui' },
  pendiente: { texto: 'Cambios sin guardar', clase: 'text-terra-ui' },
  guardando: { texto: 'Guardando',           clase: 'text-gray-ui' },
  guardado:  { texto: 'Guardado',            clase: 'text-bien' },
  error:     { texto: 'No se pudo guardar',  clase: 'text-alerta' },
}

// El orden importa: si un bloque está en error, eso manda sobre cualquier
// otra cosa que esté pasando en el resto de la pantalla.
const PESO_ESTADO: Record<EstadoBloque, number> = {
  error: 4, guardando: 3, pendiente: 2, guardado: 1, limpio: 0,
}

const DEMORA_AUTOGUARDADO = 700

// MISMO TEXTO, UN SOLO LUGAR. Vivía repetido igual en `guardarOCrear` y
// `crearAhora`; la auditoría de Sora (2026-09-23) encontró que faltaba en
// tres sitios más (crear/mover/borrar sección) que también pueden chocar
// contra una versión que dejó de ser el borrador vivo, y que cada uno lo
// habría escrito a mano distinto si no se centraliza aquí.
const MENSAJE_CONFLICTO_VERSION =
  'Esta experiencia cambió del lado del servidor mientras editabas (alguien publicó o deshizo una publicación). Para no perder ni tu trabajo ni el de esa persona, recarga la página y vuelve a hacer tu cambio sobre la versión más reciente.'

// SEGUNDA CAUSA, DISTINTA DE LA DE ARRIBA, ENCONTRADA AUDITANDO LA
// CONCURRENCIA A PEDIDO DE FRANCISCO (2026-09-29: "si yo tengo abierta mi
// cuenta y mi tía también, al mismo tiempo"). Hasta hoy, CUALQUIER
// `ConflictoDeVersion` mostraba el mismo mensaje de arriba -- que dice
// "alguien publicó o deshizo una publicación", y eso es FALSO en el caso
// más común que Francisco preguntó: dos personas del equipo editando el
// mismo bloque o el mismo segmento a la vez, sin que nadie haya publicado
// nada. `ConflictoDeVersion.revReal` ya distinguía las dos causas desde
// que existe (`guardarBloque` la usa para construir el error) -- lo que
// faltaba era leerla aquí para elegir el mensaje correcto en vez de
// mentir con el mismo texto siempre.
const MENSAJE_CONFLICTO_EDICION_SIMULTANEA =
  'Alguien más del equipo guardó un cambio aquí mismo mientras editabas -- están editando al mismo tiempo. Para no perder ni tu trabajo ni el de esa persona, recarga la página: lo que ya se había guardado se queda, y esto que ves ahora sin guardar vas a tener que volver a escribirlo sobre lo último que esa persona dejó.'

// Devuelve el mensaje correcto, o `null` si esto no es un conflicto de
// verdad. `revReal >= 0` significa que la fila SIGUE viva con un cambio
// de alguien más encima (edición simultánea); `revReal === -1` es la
// señal ya establecida (`guardarBloque`, `guardarSeccionRemoto`, y los
// caminos que nunca pudieron releer la fila real: reordenar, borrar,
// crear) de que la fila o la versión entera ya no está.
function mensajeDeConflicto(e: unknown): string | null {
  if (e instanceof ConflictoDeVersion) {
    return e.revReal >= 0 ? MENSAJE_CONFLICTO_EDICION_SIMULTANEA : MENSAJE_CONFLICTO_VERSION
  }
  if ((e as { code?: string } | null)?.code === '42501') return MENSAJE_CONFLICTO_VERSION
  return null
}

// HALLAZGO DE SORA, 2026-09-23: "Intenta de nuevo" es activamente
// engañoso cuando la causa real es que se cortó la conexión -- reintentar
// sin señal vuelve a fallar, siempre, y el mensaje no lo dice. `onLine` no
// detecta toda caída de red (una VPN o un proxy pueden fallar con
// `navigator.onLine` todavía en `true`), pero cuando SÍ está en `false` es
// una señal segura, y es la única distinción barata que se puede hacer
// aquí sin guardar de dónde vino cada error.
function mensajeDeFallo(generico: string): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'Se cortó la conexión a internet. Nada de lo que ya estaba guardado se perdió; vuelve a intentar en cuanto tengas señal.'
  }
  return generico
}

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

const ETIQUETA_INPUT = 'block text-[11px] font-semibold uppercase tracking-wider text-gray-ui mb-1.5'
const INPUT =
  'w-full bg-white border border-line rounded-[10px] px-3 py-2 text-sm text-ink placeholder:text-gray-ui focus:outline-none focus:border-dom/40 transition-colors'

const TIEMPOS: Tiempo[] = ['vispera', 'ignicion', 'retorno']

export default function Editor({
  experiencia, bloquesIniciales,
}: {
  experiencia: ExperienciaEditable
  bloquesIniciales: BloqueEditable[]
}) {
  const [bloques, setBloques] = useState<BloqueEditable[]>(bloquesIniciales)
  // HASTA HOY ESTO ERA `useMemo` sobre `experiencia.bisagras`, el prop
  // inicial del servidor, que nunca cambia durante la sesión de edición --
  // por eso crear, renombrar, reordenar o borrar una sección era
  // literalmente imposible desde aquí, sin importar qué botón se
  // inventara: no había dónde guardar el cambio. Encontrado por Francisco
  // usando el editor real por primera vez (2026-09-23), confirmado por Leo
  // contra el historial completo del store viejo -- nunca existió, no es
  // una regresión.
  const [bisagras, setBisagras] = useState<BisagraEditable[]>(
    () => experiencia.bisagras.slice().sort((a, b) => a.orden - b.orden)
  )
  const [estadosPorSeccion, setEstadosPorSeccion] = useState<Map<string, EstadoBloque>>(new Map())
  const [creandoSeccion, setCreandoSeccion] = useState(false)
  const [porBorrarSeccion, setPorBorrarSeccion] = useState<string | null>(null)
  const [activa, setActiva] = useState<string>('')
  const [estadosPorBloque, setEstadosPorBloque] = useState<Map<string, EstadoBloque>>(new Map())
  // EL SELECTOR "COMO PARTICIPANTE/COMO MODERADOR" SE QUITÓ, A PEDIDO
  // EXPLÍCITO DE FRANCISCO, 2026-09-24 -- reabre a propósito lo que el
  // 2026-09-23 Leo y Julian habían dejado como dos ejes independientes
  // (ver P-013 en docs/PENDIENTES.md): quitarlo perdía la única forma de
  // ver la descripción de sección solo-moderador en la vista previa. La
  // vista previa ahora SIEMPRE muestra la lente más completa
  // (equivalente a "moderador" de antes: todo lo que no es exclusivo de
  // equipo), así que esa pérdida queda cerrada de otra forma: nada se
  // esconde nunca al editar, no hace falta alternar para verlo todo.
  const [dispositivo, setDispositivo] = useState<'celular' | 'computadora'>('celular')
  // EL RIEL SE MINIMIZA, NO DESAPARECE. Pedido de Francisco, 2026-09-24,
  // junto con ensanchar el editor: "que la pestaña de sección sea
  // retráctil... que se pueda minimizar hacia un lado y volver a abrir
  // fácilmente". Colapsado dibuja una franja angosta con el asa para
  // volver a abrir -- nunca una sección oculta sin cómo recuperarla.
  const [rielColapsado, setRielColapsado] = useState(false)
  const [porBorrar, setPorBorrar] = useState<string | null>(null)
  const [borrando, setBorrando] = useState<string | null>(null)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
  const [conflicto, setConflicto] = useState<string | null>(null)
  const [recienCreado, setRecienCreado] = useState<string | null>(null)
  // COLAPSAR ES UNA PREFERENCIA, NO UN ESTADO INICIAL. Vacío por defecto:
  // toda tarjeta nace expandida, igual que se veía antes de que existiera
  // este mecanismo, así que abrir una bisagra que ya tiene 10 bloques no
  // cambia nada a primera vista. Colapsar una la vuelve compacta hasta que
  // alguien la vuelva a abrir; sirve para escanear una bisagra larga sin
  // perder la que se está editando. Hallazgo de Julian, verificado por Leo
  // contra el mecanismo de autoguardado: envolver solo el cuerpo de la
  // tarjeta (`<div className="p-4">`, no la cabecera) no toca `bloquesRef`,
  // `estadosPorBloque` ni el `scrollIntoView` de `recienCreado`.
  const [colapsados, setColapsados] = useState<Set<string>>(new Set())
  function alternarColapso(clave: string) {
    setColapsados(prev => {
      const copia = new Set(prev)
      if (copia.has(clave)) copia.delete(clave)
      else copia.add(clave)
      return copia
    })
  }
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

  // `activa` de nuevo por la misma razón que `bloquesRef`: una función de
  // deshacer se registra en un momento y se ejecuta en otro, potencialmente
  // varias acciones después. Sin este ref, la función capturaría la
  // sección activa DE CUANDO SE CREÓ el deshacer, no la de cuando de
  // verdad se usa.
  const activaRef = useRef(activa)
  useEffect(() => {
    activaRef.current = activa
  }, [activa])

  // ── DESHACER (Ctrl/Cmd+Z) ────────────────────────────────────────────
  //
  // NO EXISTÍA. Pedido de Francisco, 2026-09-29: "que sea coherente y
  // fácil de marcar para los errores que se cometieron". Hasta hoy lo
  // único que había era el deshacer NATIVO del navegador dentro de un
  // campo de texto enfocado -- que no cubre borrar un bloque o un
  // segmento (los dos avisan "no vas a poder recuperar el contenido", y
  // hasta hoy era cierto), no cubre reordenar, y se pierde en cuanto se
  // cambia de segmento (el textarea se desmonta: React lo confirma, el
  // historial nativo de ese campo se va con él).
  //
  // LA REGLA, para que las dos formas de deshacer convivan sin pisarse:
  // dentro de un campo de texto, Ctrl/Cmd+Z deshace últimas pulsaciones
  // con el mecanismo nativo del navegador -- letra por letra, ya funciona
  // bien, no hay razón para reemplazarlo por algo más torpe. Fuera de un
  // campo (el caso típico: justo después de borrar algo), Ctrl/Cmd+Z usa
  // esta pila. Ver el atajo de teclado más abajo, junto al de Cmd/Ctrl+S.
  //
  // UNA ENTRADA POR ACCIÓN ESTRUCTURAL (crear/borrar/mover un bloque o un
  // segmento), Y UNA POR RÁFAGA DE EDICIÓN DE TEXTO, no por tecla: escribir
  // agrupa como una sola entrada mientras no haya una pausa de
  // `DEMORA_AUTOGUARDADO` (el mismo ritmo que ya agrupa el autoguardado),
  // y una pausa que ya alcanzó a guardar empieza una entrada nueva al
  // seguir escribiendo. Deshacer letra por letra un texto ya sería el
  // trabajo del deshacer nativo, no de este.
  //
  // CADA ENTRADA REVIERTE LLAMANDO A LAS MISMAS FUNCIONES DE BAJO NIVEL
  // (`crearBloque`, `borrarBloque`, `reordenarRemoto`, etc. de
  // `almacenRemoto.ts`), nunca a las funciones públicas instrumentadas
  // (`agregar`, `borrar`, `mover`...) -- si deshacer un borrado llamara a
  // `agregar`, que a su vez registra su propio deshacer, cada Ctrl+Z
  // generaría el deshacer del deshacer, un ping-pong sin salida.
  type AccionDeshacer = { etiqueta: string; deshacer: () => void | Promise<void> }
  const LIMITE_DESHACER = 25
  const [pilaDeshacer, setPilaDeshacer] = useState<AccionDeshacer[]>([])
  const pilaDeshacerRef = useRef<AccionDeshacer[]>([])
  useEffect(() => {
    pilaDeshacerRef.current = pilaDeshacer
  }, [pilaDeshacer])

  function registrarDeshacer(etiqueta: string, deshacer: () => void | Promise<void>) {
    setPilaDeshacer(prev => {
      const nueva = [...prev, { etiqueta, deshacer }]
      return nueva.length > LIMITE_DESHACER ? nueva.slice(nueva.length - LIMITE_DESHACER) : nueva
    })
  }

  const deshacer = useCallback(() => {
    const pila = pilaDeshacerRef.current
    if (pila.length === 0) return
    const ultima = pila[pila.length - 1]
    setPilaDeshacer(prev => prev.slice(0, -1))
    ultima.deshacer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // El chip global es el peor caso entre todos los bloques Y SECCIONES con
  // actividad reciente. Un bloque o sección que nunca se tocó no cuenta: si
  // contara, la pantalla abriría diciendo "Todo guardado" de forma vacía,
  // sin que nadie hubiera guardado nada todavía.
  //
  // HASTA HOY ESTO SOLO MIRABA `estadosPorBloque`. `estadosPorSeccion`
  // existía, `marcarSeccion` lo escribía en cada guardado de sección, pero
  // nada lo leía: editar el título de una sección no movía este chip ni en
  // éxito ni en error, y el guardia de "¿salir del sitio?" de más abajo
  // (que también depende solo de `estadoGlobal`) no avisaba si alguien
  // cerraba la pestaña con un título sin guardar. Hallazgo de Sora,
  // 2026-09-23: más grave que el reporte original ("no se pudo guardar" sin
  // explicación), porque esto era pérdida silenciosa de datos, no solo un
  // mensaje pobre.
  const estadoGlobal = useMemo<EstadoBloque>(() => {
    let peor: EstadoBloque = 'limpio'
    Array.from(estadosPorBloque.values()).forEach(e => {
      if (PESO_ESTADO[e] > PESO_ESTADO[peor]) peor = e
    })
    Array.from(estadosPorSeccion.values()).forEach(e => {
      if (PESO_ESTADO[e] > PESO_ESTADO[peor]) peor = e
    })
    return peor
  }, [estadosPorBloque, estadosPorSeccion])

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
      setErrorGlobal(null)

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
      const conflicto = mensajeDeConflicto(e)
      if (conflicto) {
        // DOS CAUSAS DE VERDAD, DOS MENSAJES DISTINTOS DESDE EL 2026-09-29
        // -- antes era el mismo banner para las dos, y decía "alguien
        // publicó" incluso cuando la causa real era la otra persona del
        // equipo editando ESTE MISMO bloque a la vez (el caso que
        // Francisco preguntó explícitamente: "si yo tengo abierta mi
        // cuenta y mi tía también"). `guardarBloque` ya distinguía las
        // dos con `revReal` desde que existe; `mensajeDeConflicto` es lo
        // que finalmente lee esa distinción. Un insert nuevo contra una
        // versión muerta no tiene fila que comparar (Postgres lo rechaza
        // directo con `42501`, sin `revReal`), así que siempre cae en el
        // mensaje de versión, nunca en el de edición simultánea -- un
        // bloque que no existía no puede tener "otra persona editándolo".
        setConflicto(conflicto)
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
      } else {
        // EL HUECO ORIGINAL: cualquier otro código (fallo de red, un 500,
        // lo que sea) caía aquí sin poner nada en `errorGlobal` -- el chip
        // del bloque decía "No se guardó" y no había ninguna explicación
        // en ningún lado de por qué ni qué hacer. Esto es literalmente lo
        // que Francisco reportó ("por qué putas... no nos puede pasar con
        // un cliente"), y lo que disparó la auditoría completa de Sora.
        setErrorGlobal(mensajeDeFallo(`No se pudo guardar "${definicion(b.tipo).nombre}". Intenta de nuevo.`))
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
      setErrorGlobal(null)
      return creado
    } catch (e) {
      const codigo = (e as { code?: string } | null)?.code
      if (codigo === '23514') {
        marcarPorClave(clave, 'limpio')
        return null
      }
      const conflicto = mensajeDeConflicto(e)
      if (conflicto) {
        // Un bloque nuevo, creado contra una versión que dejó de ser el
        // borrador vivo (alguien publicó o revirtió mientras se escribía):
        // no hay fila que comparar como en `guardarBloque`, así que
        // Postgres lo rechaza directo por RLS en vez de devolver cero
        // filas -- siempre cae en el mensaje de versión, nunca en el de
        // edición simultánea (un bloque que todavía no existía no puede
        // tener a otra persona editándolo). Hallazgo de Hugo.
        setConflicto(conflicto)
      } else {
        // Mismo hueco que en `guardarOCrear`: sin esto, un fallo real
        // (red, un 500) marcaba el bloque en error sin decir por qué.
        setErrorGlobal(mensajeDeFallo('No se pudo crear este bloque. Intenta de nuevo.'))
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
    const clave = claveDe(id)
    // PRIMERA PULSACIÓN DE UNA RÁFAGA NUEVA, NO CADA TECLA. Si ya hay un
    // temporizador pendiente para este bloque, esta edición es parte de
    // la ráfaga que ya se estaba capturando -- no se vuelve a capturar el
    // "antes", porque el "antes" correcto sigue siendo el de la primera
    // tecla de la ráfaga. Mismo límite de 700ms que ya agrupa el
    // autoguardado (`DEMORA_AUTOGUARDADO`), a propósito: la sensación de
    // "esto se deshace junto" tiene que calzar con la de "esto se guarda
    // junto".
    if (!temporizadores.current.has(clave)) {
      const anterior = bloquesRef.current.find(b => b.id === id)
      if (anterior) {
        registrarDeshacer('Cambios en un bloque', () => restaurarContenidoDeBloque(clave, anterior))
      }
    }
    setBloques(prev => prev.map(b => (b.id === id ? { ...b, ...campos } : b)))
    marcarPorClave(clave, 'pendiente')
    programarGuardado(clave)
  }

  // El id puede haber cambiado desde que se capturó `anterior` (de
  // `local:` a uno real, ver PREFIJO_LOCAL): por eso se guarda y se
  // busca por CLAVE, nunca por id, igual que el resto de esta
  // contabilidad. Solo se restauran los campos de CONTENIDO -- id y rev
  // se toman del bloque actual, nunca de la captura vieja, porque una
  // `rev` vieja haría que el próximo guardado choque contra un
  // `ConflictoDeVersion` que no es real.
  function restaurarContenidoDeBloque(clave: string, anterior: BloqueEditable) {
    const idActual = idPorClave(clave)
    if (!idActual) return
    const actual = bloquesRef.current.find(b => b.id === idActual)
    if (!actual) return // se borró mientras tanto: ese borrado tiene su propia entrada de deshacer
    const { id: _idViejo, rev: _revVieja, ...contenidoAnterior } = anterior
    setBloques(prev => prev.map(b => (b.id === idActual ? { ...actual, ...contenidoAnterior } : b)))
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
    // "Guardar ahora" solo aparece cuando `estadoGlobal === 'pendiente'`, y
    // desde que ese estado también mira `estadosPorSeccion` (hallazgo de
    // Sora), el botón puede aparecer por un título de sección sin guardar,
    // no solo por un bloque. Sin esto, hacer clic en "Guardar ahora" con
    // solo una sección pendiente no habría hecho nada: el chip seguiría
    // diciendo "pendiente" después del clic, sin ningún error que lo
    // explicara.
    Array.from(temporizadoresSeccion.current.entries()).forEach(([id, t]) => {
      clearTimeout(t)
      temporizadoresSeccion.current.delete(id)
      guardarSeccionAhora(id)
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
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        const objetivo = e.target as HTMLElement | null
        const enCampoEditable =
          objetivo?.tagName === 'TEXTAREA' || objetivo?.tagName === 'INPUT' || objetivo?.isContentEditable
        // DENTRO de un campo, este atajo se deja pasar a propósito: el
        // deshacer nativo del navegador ya funciona ahí, letra por letra,
        // y tomarlo aquí lo reemplazaría por algo más torpe (la pila solo
        // agrupa por ráfaga de 700ms, no por tecla). Fuera de un campo no
        // hay deshacer nativo que proteger -- es el momento típico
        // después de borrar un bloque o un segmento.
        if (enCampoEditable) return
        e.preventDefault()
        deshacer()
      }
    }
    window.addEventListener('keydown', atajo)
    return () => window.removeEventListener('keydown', atajo)
  }, [guardarYa, deshacer])

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

  // ── Secciones: crear, renombrar, reordenar, borrar ─────────────────
  //
  // Más simple que el guardado de bloques a propósito: una sección nace
  // YA con id real (`hinges` solo exige `tiempo`+`titulo`, sin el CHECK
  // por tipo que fuerza a un bloque a vivir "local" hasta tener contenido
  // válido), así que no hace falta el mecanismo de id local/creación en
  // curso. El debounce de edición sí se reusa: mismo ritmo que un bloque,
  // para que la sensación sea la misma en las dos pantallas.
  const seccionesRef = useRef<BisagraEditable[]>(bisagras)
  useEffect(() => { seccionesRef.current = bisagras }, [bisagras])
  const temporizadoresSeccion = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  function marcarSeccion(id: string, e: EstadoBloque) {
    setEstadosPorSeccion(prev => {
      const copia = new Map(prev)
      copia.set(id, e)
      return copia
    })
  }

  async function guardarSeccionAhora(id: string) {
    const s = seccionesRef.current.find(x => x.id === id)
    if (!s) return
    marcarSeccion(id, 'guardando')
    try {
      const rev = await conPisoPerceptible(guardarSeccionRemoto(s, experiencia.versionId))
      // Sin esto, el `rev` local se queda congelado en el que trajo la
      // carga inicial: el PRÓXIMO guardado de este mismo segmento
      // mandaría ese `rev` viejo contra la base, que ya subió con este
      // guardado que sí funcionó -- un conflicto falso contra el propio
      // trabajo de quien edita. Mismo patrón que `guardarOCrear` ya usa
      // para bloques.
      setBisagras(prev => prev.map(x => (x.id === id ? { ...x, rev } : x)))
      marcarSeccion(id, 'guardado')
      setErrorGlobal(null)
    } catch (e) {
      // `guardarSeccionRemoto` ahora también lanza `ConflictoDeVersion`
      // cuando OTRA PERSONA ya guardó un cambio en este mismo segmento
      // (candado real desde el 2026-09-29, ver
      // `supabase/migrations/20260929_1715_hinges_concurrencia_optimista.sql`),
      // no solo cuando la versión entera dejó de ser el borrador vivo.
      // `mensajeDeConflicto` es lo que decide cuál de las dos cosas
      // pasó y elige el texto correcto para cada una.
      const conflicto = mensajeDeConflicto(e)
      if (conflicto) {
        setConflicto(conflicto)
      } else {
        setErrorGlobal(mensajeDeFallo('No se pudo guardar este segmento. Intenta de nuevo.'))
      }
      marcarSeccion(id, 'error')
    }
  }

  function actualizarSeccion(id: string, campos: Partial<BisagraEditable>) {
    // Misma regla de ráfaga que `actualizar` para bloques: se captura el
    // "antes" solo en la primera edición desde el último guardado, no en
    // cada tecla.
    if (!temporizadoresSeccion.current.has(id)) {
      const anterior = seccionesRef.current.find(s => s.id === id)
      if (anterior) {
        registrarDeshacer('Cambios en un segmento', () => restaurarContenidoDeSeccion(id, anterior))
      }
    }
    setBisagras(prev => prev.map(s => (s.id === id ? { ...s, ...campos } : s)))
    marcarSeccion(id, 'pendiente')
    const existente = temporizadoresSeccion.current.get(id)
    if (existente) clearTimeout(existente)
    temporizadoresSeccion.current.set(
      id,
      setTimeout(() => {
        temporizadoresSeccion.current.delete(id)
        guardarSeccionAhora(id)
      }, DEMORA_AUTOGUARDADO)
    )
  }

  // Una sección nace con id real desde el primer momento (a diferencia de
  // un bloque, nunca vive como `local:`), así que aquí no hace falta la
  // indirección de clave: el id no cambia nunca.
  function restaurarContenidoDeSeccion(id: string, anterior: BisagraEditable) {
    const actual = seccionesRef.current.find(s => s.id === id)
    if (!actual) return // se borró mientras tanto: ese borrado tiene su propia entrada de deshacer
    setBisagras(prev =>
      prev.map(s => (s.id === id ? { ...s, titulo: anterior.titulo, descripcion: anterior.descripcion } : s))
    )
    marcarSeccion(id, 'pendiente')
    const existente = temporizadoresSeccion.current.get(id)
    if (existente) clearTimeout(existente)
    temporizadoresSeccion.current.set(
      id,
      setTimeout(() => {
        temporizadoresSeccion.current.delete(id)
        guardarSeccionAhora(id)
      }, DEMORA_AUTOGUARDADO)
    )
  }

  async function agregarSeccion() {
    setCreandoSeccion(true)
    setErrorGlobal(null)
    try {
      const tiempo: Tiempo = bisagraActivaTiempo ?? 'ignicion'
      const enEseTiempo = seccionesRef.current.filter(s => s.tiempo === tiempo)
      const propuesta = seccionNueva(tiempo, enEseTiempo.length + 1)
      const creada = await crearSeccionRemoto(propuesta, experiencia.id, experiencia.versionId)
      setBisagras(prev => [...prev, creada])
      setActiva(creada.id)
      registrarDeshacer('Segmento nuevo', () => deshacerCreacionDeSeccion(creada.id))
      // La nueva sección nace con el título genérico "Nueva sección" ya
      // seleccionado en el campo, lista para que quien la creó escriba el
      // nombre real sin tener que borrar nada primero -- mismo espíritu
      // que el enfoque automático de un bloque recién creado.
      setTimeout(() => {
        const campo = document.getElementById('titulo-seccion') as HTMLInputElement | null
        campo?.focus()
        campo?.select()
      }, 50)
    } catch (e) {
      const conflicto = mensajeDeConflicto(e)
      if (conflicto) setConflicto(conflicto)
      else setErrorGlobal(mensajeDeFallo('No se pudo crear el segmento. Intenta de nuevo.'))
    } finally {
      setCreandoSeccion(false)
    }
  }

  function deshacerCreacionDeSeccion(id: string) {
    const t = temporizadoresSeccion.current.get(id)
    if (t) clearTimeout(t)
    temporizadoresSeccion.current.delete(id)
    setBisagras(prev => prev.filter(s => s.id !== id))
    if (activaRef.current === id) {
      const siguiente = seccionesRef.current.find(s => s.id !== id)
      setActiva(siguiente?.id ?? '')
    }
    borrarSeccionRemoto(id).catch(() => {
      // Deshacer ya quitó el segmento de la pantalla; si el borrado
      // remoto falla, queda huérfano en la base sin afectar a nadie --
      // mismo espíritu que el archivo huérfano de `mediosAReemplazar`.
    })
  }

  async function moverSeccion(id: string, delta: number) {
    const tiempo = seccionesRef.current.find(s => s.id === id)?.tiempo
    if (!tiempo) return
    const antes = seccionesRef.current
    const despues = reordenarSecciones(antes, tiempo, id, delta)
    if (despues === antes) return
    setBisagras(despues)
    const cambios = despues
      .filter(s => s.tiempo === tiempo)
      .filter(s => antes.find(a => a.id === s.id)?.orden !== s.orden)
      .map(s => ({ id: s.id, orden: s.orden }))
    const ordenPrevio = new Map(antes.map(s => [s.id, s.orden]))
    try {
      await reordenarSeccionesRemoto(cambios, experiencia.versionId)
      setErrorGlobal(null)
      registrarDeshacer('Segmento movido', () => restaurarOrdenDeSecciones(ordenPrevio, cambios.map(c => c.id)))
    } catch (e) {
      setBisagras(antes) // el servidor no lo aceptó: se revierte a lo que sí está guardado
      const conflicto = mensajeDeConflicto(e)
      if (conflicto) setConflicto(conflicto)
      else setErrorGlobal(mensajeDeFallo('No se pudo reordenar. Intenta de nuevo.'))
    }
  }

  function restaurarOrdenDeSecciones(ordenPrevio: Map<string, number>, ids: string[]) {
    setBisagras(prev =>
      prev.map(s => (ids.includes(s.id) && ordenPrevio.has(s.id) ? { ...s, orden: ordenPrevio.get(s.id)! } : s))
    )
    reordenarSeccionesRemoto(
      ids.map(id => ({ id, orden: ordenPrevio.get(id)! })),
      experiencia.versionId
    ).catch(() => {
      setErrorGlobal(mensajeDeFallo('No se pudo deshacer el orden de un segmento. Intenta de nuevo.'))
    })
  }

  // ARRASTRAR DE VERDAD, no solo flechas. Pedido explícito de Francisco,
  // 2026-09-23. Reusa exactamente `moverSeccion`: `reordenarSecciones` ya
  // acepta cualquier delta, no solo ±1 (mismo `splice` sirve para mover
  // tres lugares de una vez), así que arrastrar es el mismo mecanismo que
  // las flechas, con un delta más grande. Las flechas se quedan -- son el
  // camino accesible por teclado, `@dnd-kit` no las reemplaza.
  //
  // PointerSensor con `distance: 4` evita que un clic normal (seleccionar
  // la sección) se confunda con el inicio de un arrastre: sin ese umbral,
  // el primer pixel de movimiento del mouse ya cuenta como "arrastrando".
  const sensoresArrastre = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function alSoltarSeccion(evento: DragEndEvent) {
    const { active, over } = evento
    if (!over || active.id === over.id) return

    const activaId = String(active.id)
    const sobreId = String(over.id)
    const tiempo = seccionesRef.current.find(s => s.id === activaId)?.tiempo
    const tiempoDestino = seccionesRef.current.find(s => s.id === sobreId)?.tiempo
    // Nunca cruza de un tiempo a otro (víspera/ignición/retorno): son
    // listas separadas a propósito, no una sola lista larga.
    if (!tiempo || tiempo !== tiempoDestino) return

    const dentro = seccionesRef.current
      .filter(s => s.tiempo === tiempo)
      .sort((a, b) => a.orden - b.orden)
    const iViejo = dentro.findIndex(s => s.id === activaId)
    const iNuevo = dentro.findIndex(s => s.id === sobreId)
    if (iViejo < 0 || iNuevo < 0) return

    moverSeccion(activaId, iNuevo - iViejo)
  }

  async function confirmarBorrarSeccion(id: string) {
    setPorBorrarSeccion(null)
    const antes = seccionesRef.current
    // Capturado ANTES de borrar: `borrarSeccionRemoto` se lleva sus
    // bloques con ella (`blocks.hinge_id` tiene `on delete cascade`, ver
    // `almacenRemoto.ts`), así que deshacer esto no es solo recrear la
    // sección -- es recrear la sección Y cada uno de sus bloques.
    const seccionCapturada = antes.find(s => s.id === id)
    const bloquesCapturados = bloquesRef.current.filter(b => b.bisagraId === id)
    setBisagras(prev => prev.filter(s => s.id !== id))
    if (activa === id) {
      const siguiente = seccionesRef.current.find(s => s.id !== id)
      setActiva(siguiente?.id ?? '')
    }
    try {
      await borrarSeccionRemoto(id)
      setErrorGlobal(null)
      if (seccionCapturada) {
        registrarDeshacer('Segmento borrado', () => restaurarSeccionBorrada(seccionCapturada, bloquesCapturados))
      }
    } catch (e) {
      setBisagras(antes) // no se pudo borrar del lado del servidor: se restaura
      const conflicto = mensajeDeConflicto(e)
      if (conflicto) setConflicto(conflicto)
      else setErrorGlobal(mensajeDeFallo('No se pudo borrar el segmento. Intenta de nuevo.'))
    }
  }

  // Recrea la sección con id NUEVO (la base nunca reutiliza uno borrado) y
  // cada uno de sus bloques encima, en el mismo orden que tenían. Un
  // bloque que seguía `local:` (nunca llegó a existir en la base) se
  // restaura con el mismo mecanismo que uno recién agregado -- si de
  // verdad tenía contenido válido, el autoguardado lo va a crear de
  // verdad; si no, se queda esperando, igual que antes de borrarse.
  async function restaurarSeccionBorrada(seccion: BisagraEditable, bloquesDeLaSeccion: BloqueEditable[]) {
    try {
      const { id: _idVieja, rev: _revVieja, ...datosSeccion } = seccion
      const recreada = await crearSeccionRemoto(datosSeccion, experiencia.id, experiencia.versionId)
      setBisagras(prev => [...prev, recreada])
      setActiva(recreada.id)
      for (const b of bloquesDeLaSeccion) {
        const { id: _idViejo, rev: _revVieja, bisagraId: _bisagraIdVieja, ...contenido } = b
        if (esLocal(b.id)) {
          const nuevoId = idLocal()
          const restaurado: BloqueEditable = { ...contenido, id: nuevoId, bisagraId: recreada.id, rev: 0 }
          clavesEstables.current.set(nuevoId, nuevoId)
          setBloques(prev => [...prev, restaurado])
          programarGuardado(claveDe(nuevoId))
        } else {
          const creado = await crearBloque({ ...contenido, bisagraId: recreada.id }, experiencia.versionId)
          setBloques(prev => [...prev, creado])
        }
      }
    } catch (e) {
      setErrorGlobal(mensajeDeFallo('No se pudo deshacer el borrado del segmento. Intenta de nuevo.'))
    }
  }

  const bisagraActiva = bisagras.find(b => b.id === activa)
  // Dónde cae la próxima sección que se cree: el mismo tiempo de la que
  // está activa, o 'ignicion' (donde vive el contenido propio de cada
  // experiencia digital) si no hay ninguna todavía.
  const bisagraActivaTiempo: Tiempo | null = bisagraActiva?.tiempo ?? null
  const delBloque = useMemo(
    () => bloques.filter(b => b.bisagraId === activa).sort((a, b) => a.orden - b.orden),
    [bloques, activa]
  )
  // Techo en NIVEL.moderador (2), no NIVEL.equipo (3): lo exclusivo de
  // equipo se queda fuera de la vista previa siempre, con o sin
  // selector -- eso nunca cambió con el selector que se quitó, era el
  // mismo techo con el toggle en "moderador".
  const visiblesEnPrevia = useMemo(
    () => delBloque.filter(b => NIVEL[b.audiencia] <= 2),
    [delBloque]
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
    registrarDeshacer('Bloque nuevo', () => deshacerCreacionDeBloque(clave))
  }

  // Espera a que una creación en curso termine antes de decidir qué
  // hacer: si se deshace mientras el bloque todavía es `local:` PERO ya
  // hay un INSERT en camino (`creacionesEnCurso`), resolver el id
  // demasiado pronto lo encontraría local, no llamaría a `borrarBloque`,
  // y el INSERT que sigue en vuelo dejaría una fila huérfana en la base
  // que nadie en pantalla conoce. Mismo mecanismo de sincronización que
  // ya usa `guardarOCrear` para el mismo tipo de carrera.
  async function deshacerCreacionDeBloque(clave: string) {
    const enCurso = creacionesEnCurso.current.get(clave)
    if (enCurso) await enCurso
    const id = idPorClave(clave)
    if (!id) return
    const t = temporizadores.current.get(clave)
    if (t) clearTimeout(t)
    temporizadores.current.delete(clave)
    setBloques(prev => prev.filter(b => b.id !== id))
    if (!esLocal(id)) {
      borrarBloque(id).catch(() => {
        // Deshacer ya quitó el bloque de la pantalla; si el borrado
        // remoto falla, queda huérfano en la base sin afectar a nadie --
        // mismo espíritu que el archivo huérfano de `mediosAReemplazar`.
      })
    }
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
      setErrorGlobal(null)
      const idsCambiados = cambiadosReales.map(b => b.id)
      registrarDeshacer('Bloque movido', () => restaurarOrdenDeBloques(antes, idsCambiados))
    } catch (e) {
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
      const conflicto = mensajeDeConflicto(e)
      if (conflicto) {
        setConflicto(conflicto)
      } else {
        setErrorGlobal(
          'No se pudo mover el bloque. Se deshizo el cambio en pantalla. Si moviste varios a la vez, revisa el orden: reordenarRemoto no es una sola operación, así que alguno pudo haberse guardado antes de que fallara.'
        )
      }
    }
  }

  function restaurarOrdenDeBloques(ordenPrevio: Map<string, number>, ids: string[]) {
    setBloques(prev =>
      prev.map(b => (ids.includes(b.id) && ordenPrevio.has(b.id) ? { ...b, orden: ordenPrevio.get(b.id)! } : b))
    )
    for (const id of ids) marcarPorClave(claveDe(id), 'guardando')
    reordenarRemoto(
      ids.map(id => ({ id, orden: ordenPrevio.get(id)! })),
      experiencia.versionId
    )
      .then(() => {
        for (const id of ids) marcarPorClave(claveDe(id), 'guardado')
      })
      .catch(() => {
        for (const id of ids) marcarPorClave(claveDe(id), 'error')
        setErrorGlobal(mensajeDeFallo('No se pudo deshacer el orden de un bloque. Intenta de nuevo.'))
      })
  }

  // ARRASTRAR BLOQUES DENTRO DE UN SEGMENTO, mismo mecanismo que ya prueba
  // `alSoltarSeccion`: `reordenar()` (la versión de bloques de
  // `reordenarSecciones`) ya acepta cualquier delta por el mismo `splice`,
  // así que arrastrar tres lugares de una vez es `mover(id, delta)` con un
  // delta más grande -- ni `mover` ni `reordenarRemoto` cambian. La única
  // pieza nueva es traducir `active`/`over` (que llegan como la CLAVE
  // estable, no el id real -- ver `useSortable({id: claveDe(b.id)})` en
  // `TarjetaBloque`) de vuelta a un id real con `idPorClave`, porque un
  // bloque recién creado todavía puede estar en `local:...` mientras se
  // arrastra y su id real puede llegar a mitad del gesto.
  function alSoltarBloque(evento: DragEndEvent) {
    const { active, over } = evento
    if (!over || active.id === over.id) return

    const activaId = idPorClave(String(active.id))
    const sobreId = idPorClave(String(over.id))
    if (!activaId || !sobreId) return

    // `delBloque` ya está filtrado a la sección activa y ordenado por
    // `orden` -- es la misma lista que se renderiza, así que sus índices
    // son los índices reales de pantalla, sin volver a filtrar nada.
    const iViejo = delBloque.findIndex(b => b.id === activaId)
    const iNuevo = delBloque.findIndex(b => b.id === sobreId)
    if (iViejo < 0 || iNuevo < 0) return

    mover(activaId, iNuevo - iViejo)
  }

  function resaltar(id: string, conFoco: boolean) {
    enfocarAlResaltar.current = conFoco
    setRecienCreado(id)
  }

  async function borrar(id: string) {
    setErrorGlobal(null)
    const capturado = bloquesRef.current.find(b => b.id === id)

    // Local: nunca llegó a la base. Quitarlo de pantalla es todo lo que
    // hay que hacer, y no hace falta esperar ninguna red.
    if (esLocal(id)) {
      const clave = claveDe(id)
      const t = temporizadores.current.get(clave)
      if (t) clearTimeout(t)
      temporizadores.current.delete(clave)
      setBloques(prev => prev.filter(b => b.id !== id))
      setPorBorrar(null)
      if (capturado) registrarDeshacer('Bloque quitado', () => restaurarBloqueBorrado(capturado))
      return
    }

    setBorrando(id)
    try {
      await borrarBloque(id)
      setBloques(prev => prev.filter(b => b.id !== id))
      setPorBorrar(null)
      if (capturado) registrarDeshacer('Bloque borrado', () => restaurarBloqueBorrado(capturado))
    } catch (e) {
      const conflicto = mensajeDeConflicto(e)
      if (conflicto) setConflicto(conflicto)
      else setErrorGlobal(mensajeDeFallo('No se pudo quitar el bloque. Sigue ahí, sin cambios.'))
    } finally {
      setBorrando(null)
    }
  }

  // El id viejo nunca vuelve (ni local ni real): se restaura como un
  // bloque nuevo con el mismo contenido, mismo mecanismo que crear uno de
  // verdad -- si el contenido ya era válido, el autoguardado lo persiste
  // de inmediato; si no, se queda en pantalla esperando, igual que
  // cualquier bloque recién agregado.
  function restaurarBloqueBorrado(bloque: BloqueEditable) {
    const nuevoId = idLocal()
    const { id: _idViejo, rev: _revVieja, ...contenido } = bloque
    const restaurado: BloqueEditable = { ...contenido, id: nuevoId, rev: 0 }
    clavesEstables.current.set(nuevoId, nuevoId)
    setBloques(prev => [...prev, restaurado])
    resaltar(nuevoId, false)
    programarGuardado(claveDe(nuevoId))
  }

  return (
    // MODO EDITOR: PANTALLA COMPLETA DEDICADA, SIN CROMO DEL PORTAL ARRIBA.
    // Veredicto del consejo (Leo/Julian/Sora), 2026-09-24, a pedido de
    // Francisco ("que el menú de arriba se colapse o se vaya... necesito
    // que el teléfono siempre se vea completo"): las dos barras de arriba
    // (BARRA_CASA, 56px, y BARRA_WORKSPACE, 48px) se apagan POR COMPLETO
    // -- nunca una versión encogida -- mientras la ruta está bajo /editor.
    // Quien las apaga es `AdminChrome.tsx` y `PersonaLabChrome.tsx`, contra
    // `enModoEditor()` (lib/personalab/modoEditor.ts); esta pantalla ya no
    // recibe ningún envoltorio de esos dos -- `PersonaLabChrome` entrega
    // `children` sin tocar cuando la ruta es esta -- así que el truco de
    // escape a -50vw que vivía aquí, y la cancelación de un `py-8` ajeno,
    // dejaron de hacer falta: no queda cromo ajeno del que escapar.
    // `lg:max-w-[1600px] lg:mx-auto` se conserva igual que en la novena
    // vuelta -- el editor ancho sigue siendo una decisión aparte de esta.
    // `pb-8 lg:pb-0`: aire abajo en el celular, donde la página SÍ
    // scrollea de forma normal; en escritorio las tres columnas ya llenan
    // exacto `100vh - 69px` (ver más abajo), así que agregar aire aquí
    // repetiría la causa exacta del bug de "espacio blanco al final" que
    // se cerró en la vuelta anterior.
    <div className="px-6 pb-8 lg:pb-0 lg:max-w-[1600px] lg:mx-auto">
      {/* Cabecera del editor. Único cromo visible en modo editor: pegada
          al borde real de la pantalla (`top-0`), ya no a 104px de dos
          barras que ya no están. */}
      <div className="sticky top-0 z-30 bg-paper/95 backdrop-blur-sm border-b border-line -mx-6 px-6 py-3 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-baseline gap-3 min-w-0">
            <Link
              href={`/personalab/experiencias/${experiencia.slug}`}
              className="text-xs text-gray-ui hover:text-gray-ui transition-colors whitespace-nowrap"
            >
              ← {experiencia.nombre}
            </Link>
            <span className="text-sm font-semibold text-ink truncate">Editor</span>
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
            {/* CUARTA VUELTA, 2026-09-23. "Nueva sección" vivía como
                botón flotante (gramática de app de celular, un FAB en
                una esquina) o antes como enlace de texto al fondo de una
                lista de hasta veinte filas -- las dos veces Francisco no
                lo encontró. Veredicto de Sora: la cabecera fija es donde
                el editor YA entrenó a mirar ("Guardar ahora", "Revisar y
                publicar" viven aquí), así que la acción de crear una
                sección va aquí también, no en un patrón nuevo que nadie
                pidió aprender. Deshabilitado mientras se crea, para que
                no se dispare dos veces con un doble clic. */}
            <Boton
              variante="secundario"
              onClick={agregarSeccion}
              disabled={creandoSeccion}
              title="Agregar un segmento nuevo"
            >
              + {creandoSeccion ? 'Creando…' : 'Nuevo segmento'}
            </Boton>
            {/* DESHACER, VISIBLE, NO SOLO POR TECLADO. Pedido de
                Francisco, 2026-09-29: "fácil de marcar para los errores
                que se cometieron". Ctrl/Cmd+Z ya funciona (ver el atajo
                más arriba), pero un atajo que nadie ve es la misma
                lección que ya dejó "Nueva sección" como FAB: si la única
                pista es un atajo, la mitad de quienes lo necesitan no lo
                encuentran. El título dice QUÉ va a deshacer, no solo que
                algo se puede deshacer. */}
            {pilaDeshacer.length > 0 && (
              <Boton
                variante="secundario"
                onClick={deshacer}
                title={`Deshacer: ${pilaDeshacer[pilaDeshacer.length - 1].etiqueta} (Ctrl+Z / Cmd+Z)`}
              >
                ↩ Deshacer
              </Boton>
            )}
            {/* SEGUNDA VUELTA, 2026-09-23. La primera corrección lo dejó
                deshabilitado-pero-visible, con un título que explica la
                diferencia -- y Francisco siguió sin entenderlo: "sigue
                visible cuando se entra al editor y confunde". Tenía
                razón: un botón gris apagado, al lado de uno negro sólido,
                todavía SE LEE como un botón de verdad, solo que "menos
                importante", no como "no hay nada que hacer aquí". La
                corrección real no es explicarlo mejor, es que deje de
                estar cuando no hace falta: aparece SOLO cuando hay algo
                pendiente de guardar, que es el único momento en que
                adelantar el debounce significa algo. */}
            {estadoGlobal === 'pendiente' && (
              <Boton
                variante="secundario"
                onClick={guardarYa}
                title="Guarda ya, sin esperar los segundos del autoguardado"
              >
                Guardar ahora
              </Boton>
            )}
            <Link
              href={`/personalab/experiencias/${experiencia.slug}/publicar`}
              className={BTN_PRIMARIO}
            >
              Revisar y publicar
            </Link>
          </div>
        </div>

        {conflicto && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-3 flex items-start justify-between gap-4 flex-wrap">
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
          <div className="mt-3 bg-red-50 border border-red-200 rounded-[10px] px-4 py-3">
            <p className="text-sm text-red-800 leading-relaxed max-w-[70ch]">{errorGlobal}</p>
          </div>
        )}
      </div>

      {porBorrarSeccion && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[10px] shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-base font-semibold text-ink">
              ¿Estás seguro que quieres borrar este segmento?
            </h3>
            <p className="text-sm text-gray-ui mt-2 leading-relaxed">
              "{bisagras.find(s => s.id === porBorrarSeccion)?.titulo}" y todo lo que tenga
              escrito adentro se borran juntos. No vas a poder recuperar el contenido.
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={() => setPorBorrarSeccion(null)} className={BTN_SECUNDARIO} autoFocus>
                Cancelar
              </button>
              <button onClick={() => confirmarBorrarSeccion(porBorrarSeccion)} className={BTN_PELIGRO}>
                Sí, borrar segmento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LAS TRES COLUMNAS AHORA SE LEEN COMO TRES ZONAS, NO COMO UNA SOLA
          SUPERFICIE CON TARJETAS SUELTAS. Pedido de Francisco, 2026-10-01:
          "todo se ve igual y confunde, mentalmente es como estar
          trabajando todo lo mismo... que quizá haya alguna sombra o una
          diferencia de tono para dividir las partes del editor". Pase de
          Julian: nada de sombra (`shadow-lg` en este portal está
          reservado a lo que de verdad flota encima del contenido, como el
          menú de `oficina.ts:118` -- usarla aquí para tres columnas
          quietas habría sido un lenguaje nuevo que nadie más usa, lo
          contrario de "que tenga coherencia"). La separación es TONO, con
          el mismo sistema de dos peldaños que ya rige el resto del portal
          (`lib/estilos/oficina.ts`: `paper-2` es el suelo, `paper` con
          `border-line` es lo que se eleva). Antes las tres columnas
          flotaban sueltas sobre el mismo suelo `paper-2` del layout, sin
          ningún borde propio -- un riel sin marco, un lienzo sin marco,
          una columna de vista previa sin marco, así que donde terminaba
          una y empezaba la otra no se podía adivinar sin fijarse en el
          contenido. Ahora cada una es su propio panel `TARJETA`
          (`bg-paper border border-line rounded-marca`), con el `gap` de
          esta cuadrícula pintando el suelo `paper-2` entre los tres como
          el corte real -- `gap-4`, no el `gap-6` original: con las tres
          columnas ya bordeadas, ese mismo espacio de siempre se leía como
          un vacío entre tarjetas, no como aire alrededor de contenido
          suelto. Hallazgo de Francisco, 2026-10-01, en el primer vistazo
          al cambio ("hay mucho márgen entre el espacio de bloques y el
          espacio del celular"): un borde visible cambia cuánto espacio
          vacío se percibe, aunque el número de píxeles no haya cambiado
          nunca antes de este commit. Dentro del riel y de la vista previa
          esto deja
          piezas que ya eran `TARJETA` (la fila de sección activa, el
          selector celular/computadora) ahora dentro de un panel del mismo
          tono: se les quitó su propio fondo/borde donde quedaba
          redundante, y lo que las distingue de su panel es exactamente lo
          mismo que ya distingue a una fila de sección del resto del riel
          -- `bg-paper-2`, no un segundo borde encima de otro. */}
      {/* 680px -> 760px EN MODO COMPUTADORA, 2026-10-02. El panel de
          escritorio ganó `AtmosferaVistaPrevia` (ver el comentario junto
          a ese panel, más abajo) para que la columna de 620px no se
          sintiera flotando sola -- pero medido en vivo con 680px de
          columna, el margen total alrededor del contenido era de solo
          ~34px (680 menos 620 menos el borde del panel), demasiado poco
          para que un degradado de 170-320px de ancho tuviera dónde
          respirar. 760px da ~110px de margen total, parecido en
          proporción a la página de vista previa de pantalla completa
          (P-025), que nunca tuvo este problema por no vivir apretada
          entre el riel y el lienzo. El modo celular (320px) no cambia:
          el bisel del teléfono ya tiene su propio ancho real, 320px de
          columna ya le sobra margen de siempre. */}
      <div className={`grid grid-cols-1 gap-4 items-start ${
        dispositivo === 'computadora'
          ? rielColapsado ? 'lg:grid-cols-[40px_minmax(0,1fr)_760px]' : 'lg:grid-cols-[180px_minmax(0,1fr)_760px]'
          : rielColapsado ? 'lg:grid-cols-[40px_minmax(0,1fr)_320px]' : 'lg:grid-cols-[180px_minmax(0,1fr)_320px]'
      }`}>
        {/* Riel de secciones. Scroll propio (Julian, 2026-09-23), sin
            barra visible (pedido de Francisco). "Nueva sección" YA NO
            vive aquí dentro: desde el 2026-09-23 vive en la cabecera fija
            de arriba (ver el comentario "CUARTA VUELTA" junto a ese
            botón), nunca más como flotante -- las dos veces que lo fue
            Francisco no lo encontró. `pb-16` deja aire abajo para que la
            última sección de una lista larga no quede pegada al borde de
            la ventana, mismo motivo que el mismo padding en el lienzo de
            bloques (más abajo en este archivo).

            93px, NO 173px -- MODO EDITOR, 2026-09-24. Hasta la vuelta
            anterior esta cifra era 173px (104px de las dos barras del
            portal más 69px de la cabecera propia del editor). El modo
            editor apaga esas dos barras por completo (ver el comentario
            grande al principio del archivo), así que lo único que queda
            arriba es la cabecera propia. NO es 69 (su sólo alto): la
            cabecera también lleva `mb-6` (24px) antes de que empiece
            esta cuadrícula, y ese margen es parte real de dónde cae la
            columna en la página, no un detalle a ignorar -- medido en
            vivo con `getBoundingClientRect()`, la columna de vista
            previa arrancaba en 93px, no en 69px, y con 69 el teléfono se
            recortaba 19px por abajo en una ventana de 768px de alto. */}
        <nav className="lg:sticky lg:top-[93px] lg:h-[calc(100vh-93px)] bg-paper border border-line rounded-marca overflow-hidden">
        <div className="lg:h-full lg:overflow-y-auto scroll-sin-barra p-2 pb-16">
          {/* EL ASA SIEMPRE ESTÁ, colapsado o no -- minimizar nunca es
              un callejón sin salida. Pedido de Francisco, 2026-09-24.
              `min-h-toque` (44px), no `h-8` (32px) -- hallazgo de Julian,
              2026-09-24: los demás controles nuevos de esa sesión ya
              usaban ese mismo token; este había quedado más chico que sus
              vecinos, sin razón. */}
          <button
            onClick={() => setRielColapsado(v => !v)}
            className="flex items-center justify-center w-full min-h-toque mb-2 rounded-[10px] text-gray-ui hover:text-ink hover:bg-paper-2 transition-colors"
            title={rielColapsado ? 'Mostrar segmentos' : 'Minimizar segmentos'}
            aria-label={rielColapsado ? 'Mostrar segmentos' : 'Minimizar segmentos'}
            aria-expanded={!rielColapsado}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${rielColapsado ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {!rielColapsado && (
          <DndContext
            sensors={sensoresArrastre}
            collisionDetection={closestCenter}
            onDragEnd={alSoltarSeccion}
          >
            {TIEMPOS.map(t => {
              const bs = bisagras.filter(b => b.tiempo === t).sort((a, b) => a.orden - b.orden)
              if (bs.length === 0) return null
              return (
                <div key={t} className="mb-5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-ui mb-2 px-2">
                    {ETIQUETA_TIEMPO[t]}
                  </div>
                  <SortableContext items={bs.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    {bs.map((b, i) => {
                      // Solo cuenta lo que de verdad está en la base. Un
                      // bloque local recién creado (todavía sin contenido
                      // válido) hacía que esto dijera "1 bloque" para una
                      // sección que, si se recarga la página ahora mismo,
                      // sigue vacía. Dos señales que mentían en la misma
                      // dirección. Hallazgo de Julián.
                      const n = bloques.filter(x => x.bisagraId === b.id && !esLocal(x.id)).length
                      return (
                        <FilaSeccion
                          key={b.id}
                          b={b}
                          tiempo={t}
                          activa={b.id === activa}
                          nBloques={n}
                          primera={i === 0}
                          ultima={i === bs.length - 1}
                          estado={estadosPorSeccion.get(b.id) ?? 'limpio'}
                          onSeleccionar={() => setActiva(b.id)}
                          onMover={delta => moverSeccion(b.id, delta)}
                        />
                      )
                    })}
                  </SortableContext>
                </div>
              )
            })}
          </DndContext>
          )}
        </div>
        </nav>

        {/* Lienzo. Mismo arreglo de scroll que el riel, sin barra visible --
            el riel SÍ traía `pb-16` desde el principio y este contenedor no,
            así que el último bloque quedaba pegado al borde de la ventana
            al llegar al final del scroll. Hallazgo de Francisco, 2026-10-01
            ("no tiene un padding o un margen inferior... se ve raro"):
            un `pb-16` que faltaba, no un diseño nuevo. */}
        {/* `lg:max-w-[720px]`, hallazgo de Julian, 2026-09-24: al
            ensanchar el editor a 1600px sin ponerle techo propio al
            lienzo, el texto que se está escribiendo podía llegar a
            ~130 caracteres por línea -- casi el doble del techo de 75
            que él mismo fijó un día antes para el lector real (P-013,
            620px de columna). Mismo criterio de legibilidad, aplicado
            aquí: más aire alrededor de una medida de lectura/escritura
            constante, no más caracteres por línea. */}
        <div className="min-w-0 lg:max-w-[720px] lg:h-[calc(100vh-93px)] bg-paper border border-line rounded-marca overflow-hidden">
        <div className="lg:h-full lg:overflow-y-auto scroll-sin-barra p-4 pb-16">
          {bisagras.length === 0 && (
            <div className="border border-dashed border-line rounded-[10px] px-5 py-10 text-center">
              <p className="text-sm text-gray-ui">
                {experiencia.nombre} todavía no tiene segmentos.
              </p>
              <p className="text-xs text-gray-ui mt-2 leading-relaxed max-w-[46ch] mx-auto">
                Un segmento es cada momento de la experiencia. El contenido se escribe dentro de
                ellos, así que hay que crear uno primero.
              </p>
              <button onClick={agregarSeccion} disabled={creandoSeccion} className={`${BTN_PRIMARIO} mt-4`}>
                {creandoSeccion ? 'Creando…' : 'Crear el primer segmento'}
              </button>
            </div>
          )}

          {bisagraActiva && (
            <div className="mb-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-terra-ui">
                  {ETIQUETA_TIEMPO[bisagraActiva.tiempo]}
                </div>
                <button
                  onClick={() => setPorBorrarSeccion(bisagraActiva.id)}
                  className="text-[11px] text-gray-ui hover:text-alerta transition-colors"
                >
                  Borrar segmento
                </button>
              </div>
              {/* CAMPO CON FORMA DE CAMPO EN REPOSO, no un lápiz encima
                  de texto que se ve fijo. Veredicto de Sora, 2026-09-23:
                  el lápiz de la vuelta anterior no arregla el problema,
                  lo parcha -- es una segunda señal sobre una primera
                  (borde invisible hasta hover) que no existía en reposo.
                  Un campo se lee como campo por su caja, no por un
                  ícono al lado. Con caja visible siempre, el lápiz ya no
                  agrega nada: se quita en vez de sumarse.

                  MEDIDO, NO ESTIMADO, y con un límite que hay que decir:
                  `bg-white border border-line` (el mismo `INPUT` que ya
                  usa TODO este editor para sus demás campos) da apenas
                  1.15:1 de contraste borde-contra-fondo -- muy por
                  debajo del 3:1 que pide WCAG para el borde de un
                  control. No es un defecto nuevo de este campo: es la
                  convención de caja de TODO el editor (`INPUT`,
                  `Editor.tsx:111`), y corregirla de verdad significa
                  revisar esa convención entera, no solo este campo --
                  alcance de otra pasada, con Julian. Lo que sí se
                  corrigió aquí: usar exactamente esa misma convención
                  en vez de una peor (`bg-paper-2`, que medía todavía
                  más bajo, 1.09:1), para que el campo sea consistente
                  con el resto del editor mientras esa pasada más grande
                  no se haga. */}
              <input
                id="titulo-seccion"
                value={bisagraActiva.titulo}
                onChange={e => actualizarSeccion(bisagraActiva.id, { titulo: e.target.value })}
                placeholder="Título del segmento"
                spellCheck
                lang="es"
                className="w-full text-xl font-semibold tracking-tight text-ink bg-white border border-line rounded-[10px] focus:border-dom/40 outline-none transition-colors px-3 py-2 mt-1"
              />
              <input
                value={bisagraActiva.descripcion ?? ''}
                onChange={e => actualizarSeccion(bisagraActiva.id, { descripcion: e.target.value })}
                placeholder="Una descripción breve (opcional, no la ve el participante)"
                spellCheck
                lang="es"
                className="w-full text-sm text-gray-ui bg-white border border-line rounded-[10px] focus:border-dom/40 outline-none transition-colors px-3 py-2 mt-2"
              />
            </div>
          )}

          {/* Arriba, no abajo de la lista. Pedido de Francisco, 2026-10-01:
              "quita [el panel de abajo] para no tener que scrollear hasta
              abajo cada vez que quiero agregar algo" -- antes vivía después
              de la lista de bloques, así que agregar el bloque número 10
              significaba desplazarse más allá de los nueve anteriores cada
              vez. Compacto a propósito ("que no robe mucho espacio"): mitad
              del padding y del espacio entre filas que tenía antes, etiqueta
              más chica. El botón flotante "+" que antes llevaba hasta este
              panel se quitó el mismo 2026-10-01 ("estorba"): con el panel
              ya arriba, siempre visible al entrar a un segmento, dejó de
              hacer falta un atajo para encontrarlo. */}
          {bisagraActiva && (
            <div className={`${TARJETA} p-2.5 mb-3`}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-ui mb-1.5">
                Agregar bloque
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TIPOS_FRECUENTES.map(t => (
                  <BotonTipo key={t} t={t} onClick={() => agregar(t)} compacto />
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5 pt-1.5 border-t border-line">
                {TIPOS_OCASIONALES.map(t => (
                  <BotonTipo key={t} t={t} onClick={() => agregar(t)} tenue compacto />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {bisagraActiva && delBloque.length === 0 && (
              <div className="border border-dashed border-line rounded-[10px] px-5 py-8 text-center">
                <p className="text-sm text-gray-ui">
                  {bisagraActiva.titulo} todavía no tiene nada escrito.
                </p>
                <button onClick={() => agregar('texto')} className={`${BTN_SECUNDARIO} mt-4`}>
                  Escribir el primer bloque
                </button>
              </div>
            )}

            <DndContext
              sensors={sensoresArrastre}
              collisionDetection={closestCenter}
              onDragEnd={alSoltarBloque}
            >
              <SortableContext items={delBloque.map(b => claveDe(b.id))} strategy={verticalListSortingStrategy}>
                {delBloque.map((b, i) => (
                  <TarjetaBloque
                    key={claveDe(b.id)}
                    b={b}
                    claveArrastre={claveDe(b.id)}
                    primero={i === 0}
                    ultimo={i === delBloque.length - 1}
                    porBorrar={porBorrar === b.id}
                    borrando={borrando === b.id}
                    resaltado={recienCreado === b.id}
                    expandido={!colapsados.has(claveDe(b.id))}
                    onToggleExpandido={() => alternarColapso(claveDe(b.id))}
                    estado={estadosPorBloque.get(claveDe(b.id)) ?? 'limpio'}
                    onCambio={campos => actualizar(b.id, campos)}
                    onMover={d => mover(b.id, d)}
                    onPedirBorrar={() => setPorBorrar(b.id)}
                    onCancelarBorrar={() => setPorBorrar(null)}
                    onBorrar={() => borrar(b.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
        </div>

        {/* Vista previa en teléfono. BUG REAL reportado por Francisco:
            "necesito que en todo momento se esté viendo la pantalla
            completa del celular". Dos causas, no una:
            1. `sticky` sin una altura propia se quedaba pegado solo
               mientras el contenido natural de esta columna alcanzaba --
               resuelto dándole la misma altura fija que ya tienen el
               riel y el lienzo (`h-[calc(100vh-93px)]`, ver más arriba).
            2. SEGUNDA CAUSA, ENCONTRADA VERIFICANDO EL MODO EDITOR EN
               VIVO, 2026-09-24: aun con esa altura correcta, el bisel del
               teléfono tenía `style={{ height: 620 }}` -- un número FIJO
               que no respondía al espacio real disponible. En una
               ventana de 768px de alto, el selector celular/computadora
               de arriba ya ocupaba de sobra para que los 620px no
               entraran: medido, el bisel se recortaba por debajo del
               borde de la ventana aunque el offset de arriba ya
               estuviera correcto. (El pie "Estás viendo el borrador" de
               abajo, que en 2026-09-24 también restaba espacio aquí, se
               quitó el 2026-10-01 por pedido de Francisco -- un
               `lg:flex-none` menos no reabre este bug, le deja más
               espacio al bisel, no menos.) `lg:flex lg:flex-col` en esta
               columna, con el selector como `lg:flex-none` (su tamaño
               natural) y el bisel como `lg:flex-1 lg:min-h-0` (se lleva
               lo que sobra, nunca más), hace que el teléfono se ENCOJA
               cuando hace falta en vez de
               desbordar -- `lg:max-h-[620px]` sigue poniendo el techo de
               "tamaño de teléfono real" para cuando sí sobra espacio (un
               monitor alto). Verificado con `getBoundingClientRect()`:
               sin desborde en 768px de alto, y el bisel sigue midiendo
               620px en una ventana de 1000px. */}
        <div className="lg:sticky lg:top-[93px] lg:h-[calc(100vh-93px)] bg-paper border border-line rounded-marca overflow-hidden">
        <div className="h-full lg:flex lg:flex-col lg:min-h-0 p-3">
          {/* EL SELECTOR DE AUDIENCIA (participante/moderador) SE QUITÓ
              DE AQUÍ, a pedido de Francisco -- ver el comentario junto al
              estado `dispositivo`. Este es ahora el único selector de la
              vista previa: solo el ancho de pantalla, nunca quién ve
              qué. La vista previa muestra siempre todo lo que no es
              exclusivo de equipo (ver `visiblesEnPrevia`). Ya no lleva su
              propia tarjeta (`TARJETA`): vive directo dentro del panel de
              la columna, que ahora es el marco -- una tarjeta idéntica
              dentro de otra tarjeta idéntica no sumaba nada. */}
          <div className="mb-3 lg:flex-none">
            <div className="flex bg-paper-2 rounded-[10px] p-1">
              {(['celular', 'computadora'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDispositivo(d)}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    dispositivo === d ? 'bg-white text-ink shadow-sm' : 'text-gray-ui hover:text-gray-ui'
                  }`}
                >
                  {d === 'celular' ? 'En celular' : 'En computadora'}
                </button>
              ))}
            </div>
          </div>

          {dispositivo === 'celular' ? (
            // BUG REAL, ENCONTRADO PROBANDO EN 375px EXACTOS: `w-[375px]`
            // fijo no cabía en su propia columna, que resta el `px-6`
            // (24px por lado) del ancho del viewport -- en un teléfono
            // de 375px de ancho real, sólo hay 327px disponibles ahí.
            // `w-full max-w-[375px]` se encoge para caber cuando hace
            // falta y solo llega a 375px cuando de verdad sobra el
            // espacio.
            //
            // SEGUNDO BUG REAL, el mismo día que el panel de arriba (P-026):
            // en `lg:` esto era `lg:w-[320px]` fijo, calibrado contra una
            // columna de 320px SIN borde ni padding propios. En cuanto esa
            // columna ganó su panel (`border` + `p-3`, 26px entre los dos),
            // el bisel pedía más ancho del que su contenedor ya tenía --
            // se recortaba contra el `overflow-hidden` del panel nuevo.
            // Francisco lo encontró de inmediato ("el borde derecho del
            // celular se corta"). Dos números fijos (320px aquí Y el ancho
            // de columna del grid, más abajo) describiendo la misma cosa
            // sin que nada los mantuviera iguales es justo lo que rompió
            // esto -- la corrección no es otro número fijo, es dejar de
            // fijar uno: sin `lg:w-...`, el bisel ESTIRA al 100% del
            // espacio real que `flex` le da dentro de su panel.
            // `lg:max-w-[320px]` quedó como techo -- un teléfono real no
            // debería verse más ancho que eso aunque la columna algún día
            // tenga más espacio.
            <div className="relative mx-auto w-full max-w-[375px] lg:max-w-[320px] lg:flex-1 lg:min-h-0">
              <div
                className="relative bg-paper rounded-[40px] border-4 border-slate-800 overflow-hidden shadow-xl h-[620px] lg:h-full lg:max-h-[620px]"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-slate-800 rounded-b-2xl z-20" />
                <div className="absolute top-9 left-1/2 -translate-x-1/2 z-30 text-[9px] font-semibold uppercase tracking-widest text-terra-ui bg-paper-2 px-2 py-0.5 rounded-full">
                  Vista previa
                </div>
                <div className="overflow-y-auto scroll-sin-barra h-full px-6 pt-16 pb-10">
                  <PreviaContenido
                    bisagraActiva={bisagraActiva}
                    visiblesEnPrevia={visiblesEnPrevia}
                    delBloque={delBloque}
                    claveDe={claveDe}
                  />
                </div>
              </div>
            </div>
          ) : (
            // SIN BISEL, A PROPÓSITO. Un celular es un objeto con un marco
            // real; una laptop o un monitor no tienen uno que valga la pena
            // dibujar, y ponerle uno habría sido decoración, no información.
            //
            // EL ANCHO DE 620PX SE QUEDA, PERO YA NO SE SIENTE COMO MOBILE.
            // 2026-10-01: Francisco vio este panel como "demasiado delgado,
            // como si estuviese hecho para mobile" y pidió quitar el techo
            // de ancho. Antes de hacerlo, se investigó POR QUÉ existe: es
            // la misma cifra que Julian calibró para el LECTOR REAL
            // (P-013) -- 620px da 67 caracteres por línea, dentro del
            // óptimo de lectura 45-75; ensancharla lo habría roto, no
            // mejorado. Verificado en vivo, con una cuenta de prueba y un
            // grant real (revocado después): el lector real YA resuelve
            // "que no se sienta como mobile en escritorio" con
            // `AtmosferaLectura.tsx`, un degradado ambiental alrededor de
            // la columna, nunca ensanchando la columna misma -- y SÍ
            // funciona, confirmado por `getComputedStyle` contra la
            // pantalla real. Con ese hallazgo sobre la mesa, Francisco
            // decidió: "dejar la columna en 620px... si el editor y mi
            // preview ya tienen el mismo degradado ambiental". Este panel
            // ahora lo tiene (`AtmosferaVistaPrevia`, la versión adaptada
            // a un panel chico en vez de a la ventana completa -- ver su
            // propio comentario). `relative` nuevo aquí: el degradado es
            // `absolute` contra ESTE contenedor, no contra la ventana.
            // Mismo mecanismo de encoger que el bisel: `lg:flex-1
            // lg:min-h-0` en el marco y en su región de scroll,
            // `lg:max-h-[620px]` como techo DE ALTO (nunca decidió cuánto
            // texto cabe por línea, eso siempre fue el ancho). `shadow-md`,
            // agregado el 2026-10-01 junto con el panel de la columna
            // entera (mismo tono `bg-paper` que este marco): sin sombra,
            // el marco de escritorio quedaba un borde flotando sobre un
            // fondo idéntico. El bisel del celular ya tenía `shadow-xl`
            // desde siempre por ser un objeto (una pantalla, no una
            // tarjeta de contenido) -- esto no es un lenguaje nuevo, es la
            // MISMA idea aplicada al modo que no la tenía.
            <div className="relative bg-paper border border-line rounded-[10px] overflow-hidden shadow-md lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
              <AtmosferaVistaPrevia />
              <div className="relative text-center pt-4 lg:flex-none">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-terra-ui bg-paper-2 px-2 py-0.5 rounded-full">
                  Vista previa
                </span>
              </div>
              <div className="relative bg-paper overflow-y-auto scroll-sin-barra px-8 md:px-10 pt-6 pb-10 mx-auto max-w-[620px] w-full max-h-[620px] lg:flex-1 lg:min-h-0 lg:max-h-[620px]">
                <PreviaContenido
                  bisagraActiva={bisagraActiva}
                  visiblesEnPrevia={visiblesEnPrevia}
                  delBloque={delBloque}
                  claveDe={claveDe}
                />
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

// ── Contenido de la vista previa ─────────────────────────────────
//
// Extraído para que el celular y la computadora pinten EXACTAMENTE lo
// mismo -- mismo título, misma descripción, mismos bloques filtrados por
// lente -- y la única diferencia real entre los dos modos sea el marco
// que los rodea (bisel de teléfono contra columna de escritorio sin
// bisel), nunca el contenido ni la lógica de qué se muestra.
function PreviaContenido({
  bisagraActiva, visiblesEnPrevia, delBloque, claveDe,
}: {
  bisagraActiva: BisagraEditable | undefined
  visiblesEnPrevia: BloqueEditable[]
  delBloque: BloqueEditable[]
  claveDe: (id: string) => string
}) {
  return (
    <>
      {bisagraActiva && (
        <header>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terra-ui">
            {ETIQUETA_TIEMPO[bisagraActiva.tiempo]}
          </div>
          <h1 className="mt-3 text-[26px] leading-[1.12] font-extralight tracking-[-0.025em] text-dom">
            {bisagraActiva.titulo}
          </h1>
          {/* Sin selector de audiencia, la descripción (solo-moderador
              por definición del propio campo) se muestra siempre --
              quien edita es quien la necesita ver, siempre. */}
          {bisagraActiva.descripcion && (
            <p className="mt-2 text-[13px] leading-[1.5] text-gray-ui italic border-l-2 border-line pl-3">
              {bisagraActiva.descripcion}
            </p>
          )}
        </header>
      )}
      <div className="mt-8">
        {visiblesEnPrevia.length === 0 ? (
          <p className="text-[15px] font-light text-gray-ui leading-relaxed">
            {delBloque.length === 0
              ? 'Aquí va a leerse lo que escribas.'
              : 'Todo lo que hay en este segmento está marcado como exclusivo de equipo.'}
          </p>
        ) : (
          visiblesEnPrevia.map(b => <BloqueLector key={claveDe(b.id)} b={b} />)
        )}
      </div>
    </>
  )
}

// ── Botón de tipo de bloque ─────────────────────────────────────

function BotonTipo({
  t, onClick, tenue = false, compacto = false,
}: {
  t: TipoBloque; onClick: () => void; tenue?: boolean; compacto?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={definicion(t).ayuda}
      className={`text-xs rounded-[10px] border transition-[background-color,border-color,transform] duration-100 active:scale-[0.97] hover:bg-dom hover:text-paper hover:border-dom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom/25 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
        compacto ? 'px-2.5 py-1' : 'px-3 py-1.5'
      } ${
        tenue ? 'border-line text-gray-ui' : 'border-line text-ink font-medium'
      }`}
    >
      {definicion(t).nombre}
    </button>
  )
}

// ── Fila de sección, arrastrable ─────────────────────────────────
//
// `useSortable` pone la fila entera como zona de arrastre EXCEPTO donde
// hay un control propio (el botón de seleccionar, las flechas): el
// `listeners` del arrastre se aplican solo al asa (⠿), no al `<div>`
// completo, para que un clic normal siga seleccionando la sección sin
// competir con el gesto de arrastrar.
function FilaSeccion({
  b, tiempo, activa, nBloques, primera, ultima, estado, onSeleccionar, onMover,
}: {
  b: BisagraEditable
  tiempo: Tiempo
  activa: boolean
  nBloques: number
  primera: boolean
  ultima: boolean
  estado: EstadoBloque
  onSeleccionar: () => void
  onMover: (delta: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: b.id,
    data: { tiempo },
  })
  const estilo = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={estilo}
      className={`group flex items-center gap-0.5 rounded-[10px] mb-0.5 transition-colors ${
        activa ? 'bg-paper-2/70' : 'hover:bg-paper-2'
      } ${estado === 'error' ? 'ring-1 ring-red-300' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        // MEDIDO, NO ESTIMADO: al 50% de opacidad (como estaba antes de
        // esta corrección) el contraste real contra el fondo crema es
        // 1.94:1 -- muy por debajo del mínimo de 3:1 que pide WCAG para
        // un control funcional (no es un adorno, es el asa real de
        // arrastrar). Sin opacidad, `text-gray-ui` sólido da 4.52:1,
        // igual que el resto de los textos secundarios del panel.
        className="flex-shrink-0 px-1 py-2 text-gray-ui hover:text-ink cursor-grab active:cursor-grabbing touch-none"
        title="Arrastra para reordenar"
        aria-label={`Arrastrar ${b.titulo} para reordenar`}
      >
        ⠿
      </button>
      <button
        onClick={onSeleccionar}
        className="flex-1 min-w-0 text-left px-1 py-2"
      >
        <span className={`block text-[13px] leading-snug truncate ${activa ? 'text-ink font-medium' : 'text-gray-ui'}`}>
          {b.titulo}
        </span>
        {/* HASTA HOY ESTA LÍNEA SOLO MOSTRABA EL CONTEO DE BLOQUES, SIN
            IMPORTAR SI HABÍA UN GUARDADO EN CURSO O FALLIDO -- Sora
            encontró que `estadosPorSeccion` se escribía pero nada lo leía
            en ningún elemento visible. Ahora, mientras el título o la
            descripción de la sección tienen algo pendiente, guardándose o
            en error, esta línea lo dice en vez del conteo; vuelve al
            conteo en cuanto se resuelve. */}
        <span className={`block text-[11px] mt-0.5 tabular-nums ${estado === 'error' ? 'text-alerta font-medium' : 'text-gray-ui'}`}>
          {estado === 'error'
            ? 'No se guardó'
            : estado === 'guardando'
              ? 'Guardando…'
              : estado === 'pendiente'
                ? 'Sin guardar'
                : nBloques === 0 ? 'vacía' : `${nBloques} bloque${nBloques > 1 ? 's' : ''}`}
        </span>
      </button>
      <div className="flex flex-col opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity pr-1">
        <button
          onClick={() => onMover(-1)}
          disabled={primera}
          className="text-gray-ui hover:text-ink disabled:opacity-20 disabled:hover:text-gray-ui text-[10px] leading-none py-0.5"
          title="Subir"
          aria-label={`Subir ${b.titulo}`}
        >
          ▲
        </button>
        <button
          onClick={() => onMover(1)}
          disabled={ultima}
          className="text-gray-ui hover:text-ink disabled:opacity-20 disabled:hover:text-gray-ui text-[10px] leading-none py-0.5"
          title="Bajar"
          aria-label={`Bajar ${b.titulo}`}
        >
          ▼
        </button>
      </div>
    </div>
  )
}

// ── Tarjeta de un bloque ────────────────────────────────────────

function TarjetaBloque({
  b, claveArrastre, primero, ultimo, porBorrar, borrando, resaltado, expandido, onToggleExpandido, estado,
  onCambio, onMover, onPedirBorrar, onCancelarBorrar, onBorrar,
}: {
  b: Bloque
  claveArrastre: string
  primero: boolean
  ultimo: boolean
  porBorrar: boolean
  borrando: boolean
  resaltado: boolean
  expandido: boolean
  onToggleExpandido: () => void
  estado: EstadoBloque
  onCambio: (campos: Partial<Bloque>) => void
  onMover: (delta: number) => void
  onPedirBorrar: () => void
  onCancelarBorrar: () => void
  onBorrar: () => void
}) {
  // Misma clave estable que ya usa React para esta tarjeta (`claveDe`,
  // nunca el `id` real): un bloque recién creado vive como `local:...`
  // hasta su primer guardado, y si `useSortable` usara ese id cambiante,
  // dnd-kit vería un ítem distinto a mitad de un arrastre en curso.
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: claveArrastre,
  })
  const estiloArrastre = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  const esNota = b.tipo === 'nota'
  // La etiqueta del campo principal ya la declara el contrato, por tipo
  // (bloques.ts). Mostrarla solo cuando de verdad agrega algo que el badge
  // de arriba no dice: para los seis tipos de solo texto (texto/cita/
  // consigna/aviso/nota/gesto) la etiqueta del campo y el nombre del tipo
  // son la misma palabra, así que repetirla es ruido, no aclaración.
  // Hallazgo de Leo, confirmado por Julian con la misma cita de línea.
  const etiquetaCampoPrincipal = definicion(b.tipo).campos.texto?.etiqueta
  const previa = typeof b.texto === 'string' && b.texto.trim() ? b.texto.trim() : null

  // ── Toolbar de texto: negrita, cursiva, y (solo para 'texto') estilo
  // de línea. Decisión de Julian, 2026-09-23, contra BRAND.md §5: sí a
  // negrita/itálica/H2/H3 (ya interpretados por RenderMarkdown, ahora
  // también por los otros seis tipos vía `Enfasis`, ver Bloques.tsx); NO
  // a un H1 (la sección ya ocupa ese peldaño), NO a tamaños libres (la
  // "lista de catorce tamaños" que su propio criterio lleva meses
  // rechazando), NO a color libre ni centrar/justificar. Las opciones se
  // nombran Párrafo/Subtítulo/Título, no h2/h3: quien escribe piensa en
  // jerarquía, no en HTML.
  const areaRef = useRef<HTMLTextAreaElement>(null)

  function envolverSeleccion(marcador: string) {
    const el = areaRef.current
    if (!el) return
    const valor = b.texto ?? ''
    let s = el.selectionStart ?? valor.length
    let e = el.selectionEnd ?? valor.length

    // BUG REAL, ENCONTRADO PROBANDO EN EL NAVEGADOR: un triple-clic
    // selecciona el párrafo completo INCLUYENDO el salto de línea que lo
    // separa del siguiente. Envolver esa selección tal cual deja el
    // marcador de cierre después del salto -- `**párrafo\n\n**` -- y
    // `RenderMarkdown` parte en párrafos ANTES de leer los marcadores en
    // línea, así que el cierre queda huérfano en su propio párrafo y
    // ninguno de los dos se pinta en negrita. Se recorta la selección al
    // texto real antes de envolver, para que el marcador quede siempre
    // pegado al contenido, nunca a un salto de línea.
    while (s < e && /\s/.test(valor[s])) s++
    while (e > s && /\s/.test(valor[e - 1])) e--
    if (s >= e) { s = el.selectionStart ?? valor.length; e = el.selectionEnd ?? valor.length }

    const seleccion = valor.slice(s, e)
    const nuevo = valor.slice(0, s) + marcador + seleccion + marcador + valor.slice(e)
    onCambio({ texto: nuevo })
    requestAnimationFrame(() => {
      // BUG REAL, reportado por Francisco: "me tira hasta abajo del
      // texto y me pierdo en donde iba". `el.focus()` sin
      // `preventScroll` dispara el comportamiento nativo del navegador
      // de desplazar la PÁGINA para que el elemento enfocado quede a la
      // vista -- si el campo ya estaba parcialmente fuera de la
      // ventana (bisagras largas, de 5 a 9 bloques, es el caso normal),
      // cada clic en negrita/cursiva saltaba la página entera. No hacía
      // falta: el campo ya estaba enfocado desde antes de hacer clic en
      // el botón, `focus()` aquí solo restaura el foco después de que
      // React vuelve a pintar el textarea con el valor nuevo.
      el.focus({ preventScroll: true })
      const inicio = s + marcador.length
      el.setSelectionRange(inicio, inicio + seleccion.length)
    })
  }

  // Opera sobre la LÍNEA donde está el cursor, no sobre la selección: es
  // el mismo modelo que Notion/Google Docs para "estilo de bloque".
  function estiloDeLinea(prefijo: '' | '##' | '###') {
    const el = areaRef.current
    if (!el) return
    const valor = b.texto ?? ''
    const pos = el.selectionStart ?? valor.length
    const inicioLinea = valor.lastIndexOf('\n', pos - 1) + 1
    const finBuscado = valor.indexOf('\n', pos)
    const finLinea = finBuscado === -1 ? valor.length : finBuscado
    const linea = valor.slice(inicioLinea, finLinea)
    const limpia = linea.replace(/^#{2,3}\s/, '')
    const nuevaLinea = prefijo ? `${prefijo} ${limpia}` : limpia
    const nuevo = valor.slice(0, inicioLinea) + nuevaLinea + valor.slice(finLinea)
    onCambio({ texto: nuevo })
    const delta = nuevaLinea.length - linea.length
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true }) // ver comentario de envolverSeleccion
      const p = Math.max(inicioLinea, pos + delta)
      el.setSelectionRange(p, p)
    })
  }

  // VIÑETA/NUMERADA, SOBRE LA LÍNEA DEL CURSOR, mismo modelo que
  // `estiloDeLinea`. Se agregó el mismo día que `RenderMarkdown` ganó
  // soporte real de listas (P-029): el contenido real de "El Presente
  // como Regalo" ya tenía a alguien escribiendo "1. algo" a mano,
  // esperando que se viera como lista -- el botón no reemplaza saber la
  // sintaxis, es para no tener que saberla. Alterna: si la línea ya tiene
  // el marcador pedido, lo quita; si tiene el OTRO marcador, lo
  // reemplaza, nunca los apila. El número literal no importa -- un
  // `<ol>` de verdad se renumera solo, por eso siempre se inserta "1.".
  function alternarMarcadorLista(tipo: 'viñeta' | 'numerada') {
    const el = areaRef.current
    if (!el) return
    const valor = b.texto ?? ''
    const pos = el.selectionStart ?? valor.length
    const inicioLinea = valor.lastIndexOf('\n', pos - 1) + 1
    const finBuscado = valor.indexOf('\n', pos)
    const finLinea = finBuscado === -1 ? valor.length : finBuscado
    const linea = valor.slice(inicioLinea, finLinea)

    const yaViñeta = /^[-*]\s+/.test(linea)
    const yaNumerada = /^\d+\.\s*/.test(linea)
    const limpia = linea.replace(/^[-*]\s+/, '').replace(/^\d+\.\s*/, '')

    const quitar = (tipo === 'viñeta' && yaViñeta) || (tipo === 'numerada' && yaNumerada)
    const nuevaLinea = quitar ? limpia : tipo === 'viñeta' ? `- ${limpia}` : `1. ${limpia}`

    const nuevo = valor.slice(0, inicioLinea) + nuevaLinea + valor.slice(finLinea)
    onCambio({ texto: nuevo })
    const delta = nuevaLinea.length - linea.length
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true }) // ver comentario de envolverSeleccion
      const p = Math.max(inicioLinea, pos + delta)
      el.setSelectionRange(p, p)
    })
  }

  const BTN_HERRAMIENTA = 'px-2 py-1 rounded text-xs text-gray-ui hover:bg-paper-2 hover:text-ink transition-colors'

  return (
    <div
      ref={setNodeRef}
      id={`bloque-${b.id}`}
      style={estiloArrastre}
      className={`${TARJETA} overflow-hidden transition-shadow duration-500 ${
        resaltado ? 'ring-2 ring-dom/15' : ''
      } ${estado === 'error' ? 'ring-2 ring-red-300' : ''}`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-line bg-paper/60">
        <div className="flex items-center gap-1 min-w-0">
          {/* Asa de arrastre separada del botón de expandir, mismo motivo
              que en `FilaSeccion`: el gesto de arrastrar no puede competir
              con un clic normal para expandir o colapsar la tarjeta. */}
          <button
            {...attributes}
            {...listeners}
            className="flex-shrink-0 px-1 py-1 text-gray-ui hover:text-ink cursor-grab active:cursor-grabbing touch-none"
            title="Arrastra para reordenar"
            aria-label={`Arrastrar ${definicion(b.tipo).nombre} para reordenar`}
          >
            ⠿
          </button>
          <button
            onClick={onToggleExpandido}
            className="flex items-center gap-2.5 min-w-0 text-left"
            title={expandido ? 'Colapsar' : 'Expandir'}
          >
            <span className="text-gray-ui text-[10px] flex-shrink-0 w-3">{expandido ? '▾' : '▸'}</span>
            <span className="text-xs font-semibold text-gray-ui flex-shrink-0">{definicion(b.tipo).nombre}</span>
            {!expandido && previa && (
              <span className="text-xs text-gray-ui truncate">{previa}</span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* La audiencia casi siempre es "Todos": el valor con el que nace
              todo bloque nuevo. Lo que está en su default no necesita caja;
              solo "Solo moderador" pesa como una decisión real. Hallazgo de
              Julian, confirmado por Leo contra el elemento HTML real (sigue
              siendo el mismo `<select>`, solo cambia su clase). */}
          <select
            value={b.audiencia}
            onChange={e => onCambio({ audiencia: cambiarAudiencia(b.tipo, e.target.value as Audiencia) })}
            disabled={esNota}
            className={
              b.audiencia === 'moderador'
                ? `${PASTILLA_CURSO} pr-1 disabled:opacity-60 disabled:cursor-not-allowed`
                : 'text-[11px] text-gray-ui bg-transparent border-none disabled:opacity-60 disabled:cursor-not-allowed'
            }
            title={esNota ? 'Una nota nunca es pública: es su definición.' : 'Quién puede ver este bloque'}
          >
            <option value="todos">Todos</option>
            <option value="moderador">Solo moderador</option>
          </select>
          {estado === 'error' && (
            <span className="text-[11px] text-alerta font-medium">No se guardó</span>
          )}
          <div className="flex items-center gap-1">
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
      </div>

      {expandido && (
      <div className="p-4">
        {b.tipo === 'pausa' ? (
          <>
            <p className="text-sm text-gray-ui">Un respiro. Nadie ve texto aquí.</p>
            <div className="mt-3">
              <label className={ETIQUETA_INPUT}>
                Segundos de espera (máximo {definicion('pausa').campos.segundos.max})
              </label>
              <input
                type="number"
                min={definicion('pausa').campos.segundos.min}
                max={definicion('pausa').campos.segundos.max}
                value={b.segundos ?? ''}
                onChange={e => onCambio({ segundos: e.target.value === '' ? undefined : Number(e.target.value) })}
                placeholder="0"
                className={`${INPUT} w-24`}
              />
              {/* `max` en un input numérico no bloquea teclear un número
                  mayor, solo limita las flechitas. El lector SÍ recorta en
                  silencio al techo (`PisoDeTiempo.tsx`, CEILING), así que
                  sin este aviso alguien podía escribir 600 sin enterarse de
                  que el participante nunca ve más de 30. Hallazgo de Leo. */}
              {(b.segundos ?? 0) > definicion('pausa').campos.segundos.max! ? (
                <p className="text-[11px] text-alerta mt-1.5 leading-relaxed">
                  Se va a mostrar como {definicion('pausa').campos.segundos.max} segundos, el techo del
                  sistema. La persona nunca espera más que eso.
                </p>
              ) : (
                <p className="text-[11px] text-gray-ui mt-1.5 leading-relaxed">
                  Cuánto espera la persona antes de que aparezca el botón para seguir. Sin este campo,
                  la pausa no detiene nada.
                </p>
              )}
            </div>
          </>
        ) : b.tipo === 'divisor' ? (
          <p className="text-sm text-gray-ui">
            Un corte visual entre bloques. No lleva contenido: se guarda solo, apenas se agrega.
          </p>
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
                spellCheck
                lang="es"
              />
            </div>

            {b.tipo === 'archivo' && (
              <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={b.descargable ?? false}
                  onChange={e => onCambio({ descargable: e.target.checked })}
                  className="w-4 h-4 rounded border-line accent-dom"
                />
                <span className="text-xs text-gray-ui">Se puede descargar</span>
                <span className="text-xs text-gray-ui">
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
            {etiquetaCampoPrincipal !== definicion(b.tipo).nombre && (
              <label className={ETIQUETA_INPUT}>{etiquetaCampoPrincipal}</label>
            )}
            <div className="flex items-center gap-0.5 mb-1 -ml-2">
              <button type="button" onClick={() => envolverSeleccion('**')} className={BTN_HERRAMIENTA} title="Negrita: rodea lo que selecciones con **">
                <b>N</b>
              </button>
              <button type="button" onClick={() => envolverSeleccion('*')} className={BTN_HERRAMIENTA} title="Cursiva: rodea lo que selecciones con *">
                <i>I</i>
              </button>
              <span className="w-px h-4 bg-paper-2 mx-1" />
              {/* Viñeta/numerada: para TODO tipo que admite texto largo,
                  no solo "Texto" -- `RenderMarkdown` ya las soporta en los
                  siete (P-029). */}
              <button type="button" onClick={() => alternarMarcadorLista('viñeta')} className={BTN_HERRAMIENTA} title="Línea del cursor: viñeta">
                ◦—
              </button>
              <button type="button" onClick={() => alternarMarcadorLista('numerada')} className={BTN_HERRAMIENTA} title="Línea del cursor: lista numerada">
                1.—
              </button>
              {b.tipo === 'texto' && (
                <>
                  <span className="w-px h-4 bg-paper-2 mx-1" />
                  <button type="button" onClick={() => estiloDeLinea('')} className={BTN_HERRAMIENTA} title="Línea del cursor: texto normal">
                    Párrafo
                  </button>
                  <button type="button" onClick={() => estiloDeLinea('###')} className={BTN_HERRAMIENTA} title="Línea del cursor: subtítulo">
                    Subtítulo
                  </button>
                  <button type="button" onClick={() => estiloDeLinea('##')} className={BTN_HERRAMIENTA} title="Línea del cursor: título">
                    Título
                  </button>
                </>
              )}
            </div>
            {b.tipo === 'texto' || b.tipo === 'nota' ? (
              <textarea
                ref={areaRef}
                value={b.texto ?? ''}
                onChange={e => onCambio({ texto: e.target.value })}
                rows={b.tipo === 'texto' ? 6 : 3}
                placeholder={b.tipo === 'texto' ? 'Escribe. O usa los botones de arriba para negrita, cursiva, viñetas, numerada, subtítulo y título.' : 'Lo que el moderador necesita saber y el grupo no.'}
                className={`${INPUT} resize-y leading-relaxed`}
                spellCheck
                lang="es"
              />
            ) : (
              <textarea
                ref={areaRef}
                value={b.texto ?? ''}
                onChange={e => onCambio({ texto: e.target.value })}
                rows={2}
                className={`${INPUT} resize-y leading-relaxed`}
                spellCheck
                lang="es"
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
                  spellCheck
                  lang="es"
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
                  spellCheck
                  lang="es"
                />
              </div>
            )}

            {/* UN GESTO DE SALA NO ES AUTOMÁTICAMENTE UN GESTO DIGITAL. Sin
                marcar, el lector digital no lo pinta (falla cerrado, ver
                lib/personalab/bloques.ts). Hallazgo de Daniel: bisagras
                reales dicen "escríbelo a mano en tu libreta" a un comprador
                digital-solo que nunca tuvo una libreta. */}
            {b.tipo === 'gesto' && (
              <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={b.aplicaDigital ?? false}
                  onChange={e => onCambio({ aplicaDigital: e.target.checked })}
                  className="w-4 h-4 rounded border-line accent-dom"
                />
                <span className="text-xs text-gray-ui">Aplica al modo digital</span>
                <span className="text-xs text-gray-ui">
                  Sin marcar, quien compra la experiencia por su cuenta no ve este bloque.
                </span>
              </label>
            )}

            {/* EL INTERRUPTOR POR SECCIÓN. Decisión de Francisco, 2026-09-13:
                quien escribe el contenido decide, consigna por consigna, si
                lo que la persona responde se guarda de verdad
                (`public.responses`) o vive solo en su pestaña, como antes.
                Falla cerrado: sin marcar, no se guarda. */}
            {b.tipo === 'consigna' && (
              <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={b.guarda ?? false}
                  onChange={e => onCambio({ guarda: e.target.checked })}
                  className="w-4 h-4 rounded border-line accent-dom"
                />
                <span className="text-xs text-gray-ui">Se guarda la respuesta</span>
                <span className="text-xs text-gray-ui">
                  Sin marcar, lo que escriba se pierde al cerrar la pestaña, como siempre.
                </span>
              </label>
            )}

          </>
        )}
      </div>
      )}
    </div>
  )
}
