'use client'

import { createBrowserClient } from '@supabase/ssr'
import {
  desdeFila, aContenido, formatearPeso,
  type Bloque, type TipoBloque, type Audiencia, type FilaBloque,
} from '@/lib/personalab/bloques'
import type { BisagraEditable } from '@/lib/personalab/editorDatos'
import type { Tiempo, Soporte } from './dominio'

// Adaptador contra Supabase. Se escribió completo desde la Etapa 1 y no se
// usó hasta la Etapa 3: `Editor.tsx` y `Publicar.tsx` lo llaman ahora de
// verdad, en cada acción. `almacen.ts` (localStorage, borrador/publicado
// como dos copias en el navegador) y el interruptor
// `NEXT_PUBLIC_PERSONALAB_REMOTO` quedaron retirados junto con esto: ya no
// hay un modo local que mantener en sincronía con este.

export class ConflictoDeVersion extends Error {
  constructor(public revEsperada: number, public revReal: number) {
    super('Alguien más guardó cambios mientras editabas.')
    this.name = 'ConflictoDeVersion'
  }
}

function cliente() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// LA TRADUCCIÓN SE FUE AL CONTRATO, Y ESTA ERA LA COPIA MALA.
//
// Aquí vivían `aBloque` y `aContenido`, dos listas blancas de ocho campos
// escritas a mano, y las dos se tragaban `segundos`. El lector sí lo conocía.
// O sea que guardar una pausa desde el editor le habría borrado el piso de
// tiempo y la habría devuelto a ser tres puntos decorativos, deshaciendo en
// un guardado lo que costó una migración y un componente. Nadie lo habría
// visto: el bloque seguía ahí, solo que sin su espera.
//
// Ese es el defecto que vuelve cada vez que el mismo conocimiento se escribe
// dos veces. Ahora las dos direcciones salen de `lib/personalab/bloques.ts`,
// y un campo nuevo viaja solo.

type FilaConRev = FilaBloque & { rev: number }

function aBloque(f: FilaConRev): (Bloque & { rev: number }) | null {
  const b = desdeFila(f)
  return b ? { ...b, rev: f.rev } : null
}

// ── Lectura ─────────────────────────────────────────────────

export async function versionBorrador(experienciaId: string): Promise<string | null> {
  const { data } = await cliente()
    .from('experience_versions')
    .select('id')
    .eq('experience_id', experienciaId)
    .eq('estado', 'borrador')
    .maybeSingle()
  return data?.id ?? null
}

export async function cargarRemoto(versionId: string) {
  const { data, error } = await cliente()
    .from('blocks')
    .select('id, hinge_id, orden, tipo, audiencia, contenido, media_id, rev')
    .eq('version_id', versionId)
    .order('orden')

  if (error) throw error
  // Un tipo que no esté en el contrato se descarta en vez de llegar a medias.
  // Solo pasa si alguien agregó un valor al enum sin declararlo.
  return (data as FilaConRev[])
    .map(aBloque)
    .filter((b): b is Bloque & { rev: number } => b !== null)
}

// Qué trae un bloque recién nacido, antes de que exista en la base. Vivía en
// `almacen.ts` (el archivo que se retira con esta etapa) como `bloqueNuevo`,
// con generación de id local incluida. Aquí no genera id: `crearBloque` deja
// que la base lo asigne, y el llamador usa el que la base devuelve.
export function camposPorDefecto(tipo: TipoBloque): Partial<Bloque> {
  switch (tipo) {
    case 'nota':
      return { audiencia: 'moderador', texto: '' }
    case 'archivo':
      return { audiencia: 'moderador', nombreArchivo: '', descargable: true, pie: '' }
    case 'pausa':
    case 'divisor':
      return {}
    case 'cita':
      return { texto: '', autor: '' }
    case 'objeto':
      return { texto: '', pie: '' }
    case 'imagen':
    case 'video':
    case 'audio':
      return { pie: '' }
    default:
      return { texto: '' }
  }
}

// Recalcula el `orden` local tras mover un bloque. Pura, sin red: quien
// llama decide, comparando contra el arreglo de antes, cuáles ids cambiaron
// de verdad y solo persiste esos con `reordenarRemoto`. Para un movimiento
// de una posición (que es el único que ofrece la interfaz, con las flechas),
// siempre son exactamente dos: el que se mueve y con quien intercambia
// lugar.
export function reordenar<T extends Bloque>(bloques: T[], bisagraId: string, id: string, delta: number): T[] {
  const dentro = bloques
    .filter(b => b.bisagraId === bisagraId)
    .sort((a, b) => a.orden - b.orden)
  const i = dentro.findIndex(b => b.id === id)
  const j = i + delta
  if (i < 0 || j < 0 || j >= dentro.length) return bloques

  const copia = [...dentro]
  const [movido] = copia.splice(i, 1)
  copia.splice(j, 0, movido)
  const ordenes = new Map(copia.map((b, k) => [b.id, k + 1]))

  return bloques.map(b => (ordenes.has(b.id) ? { ...b, orden: ordenes.get(b.id)! } : b))
}

// Una nota nunca puede ser pública: es su definición, no una preferencia.
export function cambiarAudiencia(tipo: TipoBloque, audiencia: Audiencia): Audiencia {
  if (tipo === 'nota') return 'moderador'
  return audiencia
}

// ── Escritura, con concurrencia optimista ───────────────────
//
// El `eq('rev', revEsperada)` es el candado: si otra persona guardo entre
// que cargaste y que guardas, la fila ya tiene otra rev y el update no
// afecta ninguna fila. Ahi se lanza el conflicto en vez de pisar su trabajo
// en silencio, que es lo que pasa sin esto.

// LA PUERTA DE DESCARGA LEE `media.descargable`, NUNCA `blocks.contenido`.
// El checkbox "Se puede descargar" del editor solo movía el jsonb del
// bloque; la fila de `media` (lo que `GET .../medios/[id]?descargar=1` de
// verdad consulta) se fijaba una sola vez al subir y nada la volvía a
// tocar. Hallazgo de Hugo, 2026-09-15, confirmado desmarcando la casilla y
// descargando igual. Se sincroniza aquí, en el mismo punto donde el bloque
// ya se está guardando, para que no haga falta acordarse de llamarlo aparte
// cada vez que alguien mueve el checkbox.
async function sincronizarDescargable(b: Bloque) {
  if (b.tipo !== 'archivo' || !b.medioId) return
  const r = await fetch(`/api/personalab/medios/${b.medioId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descargable: b.descargable ?? false }),
  })
  if (!r.ok) {
    const { error } = await r.json().catch(() => ({ error: 'No se pudo actualizar si se puede descargar.' }))
    throw new Error(error)
  }
}

export async function guardarBloque(
  b: Bloque & { rev: number },
  versionId: string
): Promise<number> {
  const sb = cliente()
  const { data, error } = await sb
    .from('blocks')
    .update({
      orden: b.orden,
      tipo: b.tipo,
      audiencia: b.audiencia,
      contenido: aContenido(b),
      // ANTES NO SE ESCRIBÍA. Es la razón concreta por la que la compuerta
      // de publicación tenía que quedarse en 'advierte' en vez de 'impide'
      // para archivo/imagen/video/audio: no había forma de satisfacerla.
      // Con esto ya la hay, y por eso EDITOR_ESCRIBE_MEDIA_ID pasa a true
      // en el mismo commit que este cambio.
      media_id: b.medioId ?? null,
    })
    .eq('id', b.id)
    .eq('version_id', versionId)
    .eq('rev', b.rev)
    .select('rev')
    .maybeSingle()

  if (error) throw error

  if (!data) {
    const { data: actual } = await sb
      .from('blocks').select('rev').eq('id', b.id).maybeSingle()
    throw new ConflictoDeVersion(b.rev, actual?.rev ?? -1)
  }

  await sincronizarDescargable(b)

  return data.rev
}

// Sin `id` en el parámetro, a propósito: la base lo asigna, y pedirlo aquí
// solo invitaría a alguien a rellenarlo con algo que nunca se usa.
export async function crearBloque(b: Omit<Bloque, 'id'>, versionId: string) {
  const { data, error } = await cliente()
    .from('blocks')
    .insert({
      version_id: versionId,
      hinge_id: b.bisagraId,
      orden: b.orden,
      tipo: b.tipo,
      audiencia: b.audiencia,
      contenido: aContenido(b as Bloque),
      media_id: b.medioId ?? null,
    })
    .select('id, hinge_id, orden, tipo, audiencia, contenido, media_id, rev')
    .single()

  if (error) throw error
  // Aquí sí se lanza en vez de devolver null: acabamos de crear este bloque
  // con un tipo que salió del contrato, así que si vuelve sin reconocerse es
  // que la base y el contrato se separaron, y eso hay que verlo, no tragarlo.
  const creado = aBloque(data as FilaConRev)
  if (!creado) throw new Error(`La base devolvió un tipo de bloque que el contrato no conoce.`)

  await sincronizarDescargable(creado)

  return creado
}

// EL ARCHIVO QUE "REEMPLAZAR" DEJABA VIVO PARA SIEMPRE. Subir uno nuevo
// solo cambiaba a qué `media_id` apunta el bloque; el objeto viejo se
// quedaba en Storage y su fila en `media`, sin ningún bloque que lo
// referenciara y sin ninguna pantalla que lo mostrara. Hallazgo de Leo,
// 2026-09-15, reproducido subiendo dos veces seguidas y confirmando la fila
// huérfana contra la base. `Editor.tsx` llama esto DESPUÉS de guardar el
// bloque con el `medioId` nuevo, nunca antes: si el guardado falla, el
// archivo viejo se queda como estaba, en vez de perderse sin que el nuevo
// haya quedado a salvo.
export async function borrarMedio(medioId: string): Promise<void> {
  const r = await fetch(`/api/personalab/medios/${medioId}`, { method: 'DELETE' })
  if (!r.ok) {
    const { error } = await r.json().catch(() => ({ error: 'No se pudo borrar el archivo anterior.' }))
    throw new Error(error)
  }
}

export async function borrarBloque(id: string) {
  const { error } = await cliente().from('blocks').delete().eq('id', id)
  if (error) throw error
}

// Mover un bloque cambia el `orden` de él Y del que le cedió el lugar: dos
// filas, una operación para quien edita. Sin concurrencia optimista a
// propósito: si dos personas mueven bloques de la MISMA bisagra a la vez el
// peor caso es que el orden final no sea el que ninguna de las dos esperaba,
// nunca contenido perdido, y hoy el editor lo usa una persona a la vez.
// MISMO HALLAZGO QUE YA SE HABÍA CERRADO EN `reordenarSeccionesRemoto` Y EN
// `guardarSeccionRemoto`, ENCONTRADO AQUÍ SIN CERRAR EL 2026-09-29
// AUDITANDO LA CONCURRENCIA A PEDIDO DE FRANCISCO: sin `.select()`, un
// UPDATE cuya fila queda fuera del `using` de RLS (la versión dejó de ser
// el borrador vivo -- alguien publicó, o el bloque se borró mientras
// tanto) no es un error para Postgres ni para PostgREST: son cero filas
// afectadas, y la llamada vuelve como éxito. Antes de esto, reordenar
// bloques sobre una versión que acababa de morir reportaba "listo" sin
// haber movido nada.
// DEVUELVE EL `rev` NUEVO DE CADA FILA -- SIN ESTO, FRANCISCO VEÍA EL
// BANNER DE "EDICIÓN SIMULTÁNEA" EDITANDO SOLO, 2026-10-01. El trigger
// `subir_rev` (ver la migración de concurrencia optimista) sube `rev` en
// CUALQUIER UPDATE, incluido este, que solo toca `orden` -- no hacía
// falta que lo subiera "a propósito" para que el reordenamiento mismo lo
// disparara. `Editor.tsx` actualizaba `orden` en pantalla después de
// reordenar, pero nunca el `rev` local de esas filas: quedaba congelado
// en el que trajo la carga inicial. El PRÓXIMO guardado de contenido
// sobre un bloque que se acababa de mover (o de uno que cedió el lugar)
// mandaba ese `rev` viejo contra una base que ya había subido con el
// reordenamiento -- cero filas, `ConflictoDeVersion` con `revReal >= 0`,
// y el mensaje que dice "otra persona está editando" cuando la única
// persona era la misma, en la misma pestaña. Mismo defecto, mismo arreglo,
// que `reordenarSeccionesRemoto`.
export async function reordenarRemoto(
  cambios: { id: string; orden: number }[],
  versionId: string
): Promise<{ id: string; rev: number }[]> {
  const sb = cliente()
  const revisadas: { id: string; rev: number }[] = []
  for (const c of cambios) {
    const { data, error } = await sb
      .from('blocks')
      .update({ orden: c.orden })
      .eq('id', c.id)
      .eq('version_id', versionId)
      .select('id, rev')
      .maybeSingle()
    if (error) throw error
    if (!data) throw new ConflictoDeVersion(0, -1)
    revisadas.push({ id: data.id, rev: data.rev })
  }
  return revisadas
}

// ── Secciones (hinges) ───────────────────────────────────────
//
// HASTA HOY, ESTO NO EXISTÍA. Francisco lo encontró usando el editor real
// por primera vez de punta a punta (2026-09-23): no había manera de crear
// ni reordenar una sección desde la pantalla, solo bloques dentro de una
// sección ya creada. No era una regresión -- Leo lo confirmó contra el
// historial completo de `almacen.ts`, el store viejo: nunca existió. La
// base ya estaba lista (`"pl equipo gestiona"` en `hinges` ya es `for all`
// sobre la versión en borrador, `20260914_1030_hinges_por_version.sql`),
// así que esto es solo el lado del cliente, calcado del patrón que ya
// prueba `crearBloque`/`borrarBloque`/`reordenarRemoto` un nivel abajo.
//
// Se llama "Sección" en la interfaz de aquí en adelante (decisión de
// Francisco, 2026-09-23: "las bisagras deben llamarse secciones"). El
// nombre de tabla y de columna (`hinges`, `hinge_id`) se queda en inglés a
// propósito, mismo patrón que capítulo→grupo: renombrar una tabla real es
// una migración aparte, no un cambio de etiqueta.

// Recalcula el `orden` local tras mover una sección DENTRO DEL MISMO
// TIEMPO (víspera/ignición/retorno) -- las secciones de otro tiempo no
// compiten por posición con esta. Misma forma que `reordenar()` para
// bloques: solo dos filas cambian por movimiento de una posición.
export function reordenarSecciones<T extends BisagraEditable>(
  secciones: T[], tiempo: Tiempo, id: string, delta: number
): T[] {
  const dentro = secciones
    .filter(s => s.tiempo === tiempo)
    .sort((a, b) => a.orden - b.orden)
  const i = dentro.findIndex(s => s.id === id)
  const j = i + delta
  if (i < 0 || j < 0 || j >= dentro.length) return secciones

  const copia = [...dentro]
  const [movida] = copia.splice(i, 1)
  copia.splice(j, 0, movida)
  const ordenes = new Map(copia.map((s, k) => [s.id, k + 1]))

  return secciones.map(s => (ordenes.has(s.id) ? { ...s, orden: ordenes.get(s.id)! } : s))
}

// DEVUELVE EL `rev` NUEVO DE CADA FILA, MISMO HALLAZGO Y MISMO ARREGLO
// QUE `reordenarRemoto` (ver su comentario): el trigger `subir_rev` sube
// `rev` en cualquier UPDATE a `hinges`, incluido este, que solo toca
// `orden`. Sin devolverlo, `Editor.tsx` actualizaba el `orden` en
// pantalla pero dejaba el `rev` local de la sección congelado -- el
// próximo guardado de título o descripción sobre una sección recién
// movida mandaba ese `rev` viejo, chocaba contra cero filas, y Francisco
// veía "alguien más del equipo guardó un cambio... están editando al
// mismo tiempo" editando él solo (2026-10-01).
export async function reordenarSeccionesRemoto(
  cambios: { id: string; orden: number }[],
  versionId: string
): Promise<{ id: string; rev: number }[]> {
  const sb = cliente()
  const revisadas: { id: string; rev: number }[] = []
  for (const c of cambios) {
    // Mismo hallazgo que en `guardarSeccionRemoto`: sin `.select()`, mover
    // una sección sobre una versión que dejó de ser el borrador vivo
    // reportaba éxito sin haber movido nada.
    const { data, error } = await sb
      .from('hinges')
      .update({ orden: c.orden })
      .eq('id', c.id)
      .eq('version_id', versionId)
      .select('id, rev')
      .maybeSingle()
    if (error) throw error
    if (!data) throw new ConflictoDeVersion(0, -1)
    revisadas.push({ id: data.id, rev: data.rev })
  }
  return revisadas
}

// Qué trae una sección recién nacida. El `tiempo` lo decide quien crea
// (hoy siempre 'ignicion' desde el botón del riel, que es donde vive el
// contenido propio de cada experiencia digital); `orden` lo calcula quien
// llama, un lugar más allá de la última sección de ese mismo tiempo.
// Sin `rev` a propósito, igual que `crearBloque` no pide `id`: lo asigna
// la base (empieza en 1, el mismo `default` que ya usa `blocks.rev`).
export function seccionNueva(tiempo: Tiempo, orden: number): Omit<BisagraEditable, 'id' | 'rev'> {
  return {
    tiempo,
    orden,
    titulo: 'Nueva sección',
    descripcion: '',
    soporte: 'pantalla' as Soporte,
    listo: false,
  }
}

export async function crearSeccionRemoto(
  s: Omit<BisagraEditable, 'id' | 'rev'>,
  experienciaId: string,
  versionId: string
): Promise<BisagraEditable> {
  const { data, error } = await cliente()
    .from('hinges')
    .insert({
      version_id: versionId,
      experience_id: experienciaId,
      tiempo: s.tiempo,
      orden: s.orden,
      titulo: s.titulo,
      descripcion: s.descripcion || null,
      soporte: s.soporte,
      listo: s.listo,
    })
    .select('id, tiempo, orden, titulo, descripcion, soporte, duracion, listo, requiere, rev')
    .single()

  if (error) throw error
  return data as BisagraEditable
}

// Título, descripción y si está lista para publicarse -- los tres campos
// que un humano edita a mano. `tiempo`/`orden`/`soporte` no se tocan aquí:
// tiempo y soporte no cambian nunca desde esta pantalla, y orden lo maneja
// solo `reordenarSeccionesRemoto`, para no pisar un reordenamiento que
// haya corrido mientras tanto.
//
// CANDADO DE VERDAD, AGREGADO EL 2026-09-29 -- HASTA ESE DÍA, ESTO SOLO
// SE CUIDABA DE QUE LA VERSIÓN SIGUIERA VIVA, NUNCA DE QUE OTRA PERSONA
// HUBIERA EDITADO ESTA MISMA FILA. Hallazgo real, auditando la
// concurrencia a pedido de Francisco ("si yo tengo abierta mi cuenta y mi
// tía también, al mismo tiempo"): sin `eq('rev', s.rev)`, dos personas
// escribiendo el título del MISMO segmento a la vez se pisaban en
// silencio -- el segundo guardado en llegar ganaba siempre, y quien
// escribió primero nunca se enteraba de que su texto se perdió. Mismo
// candado que ya tenía `guardarBloque`, con la misma trampa ya resuelta
// ahí: un UPDATE cuya fila queda fuera del `using` de RLS (versión
// muerta) TAMBIÉN da cero filas, así que hay que distinguir las dos
// causas releyendo la fila real cuando el primer intento no encuentra
// nada -- si SÍ existe, es la otra persona editando; si no aparece ni en
// esa segunda lectura, la versión ya no es la que se creía.
export async function guardarSeccionRemoto(
  s: Pick<BisagraEditable, 'id' | 'titulo' | 'descripcion' | 'listo' | 'rev'>,
  versionId: string
): Promise<number> {
  const sb = cliente()
  const { data, error } = await sb
    .from('hinges')
    .update({
      titulo: s.titulo,
      descripcion: s.descripcion || null,
      listo: s.listo,
    })
    .eq('id', s.id)
    .eq('version_id', versionId)
    .eq('rev', s.rev)
    .select('rev')
    .maybeSingle()

  if (error) throw error

  if (!data) {
    const { data: actual } = await sb
      .from('hinges').select('rev').eq('id', s.id).maybeSingle()
    throw new ConflictoDeVersion(s.rev, actual?.rev ?? -1)
  }

  return data.rev
}

// Borrar una sección se lleva sus bloques con ella (`blocks.hinge_id`
// tiene `on delete cascade`). La confirmación de que de verdad se quiere
// perder el contenido vive en la interfaz, no aquí.
export async function borrarSeccionRemoto(id: string): Promise<void> {
  const { error } = await cliente().from('hinges').delete().eq('id', id)
  if (error) throw error
}

// ── Ciclo de publicacion ────────────────────────────────────
// Los dos van por RPC a proposito: son operaciones de varias tablas que
// tienen que ser atomicas. Hacerlas desde el cliente deja estados a medias
// si se corta la conexion entre una y otra.

export async function abrirBorrador(experienciaId: string): Promise<string> {
  const { data, error } = await cliente()
    .rpc('pl_abrir_borrador', { exp: experienciaId })
  if (error) throw error
  return data as string
}

export async function publicarVersion(versionId: string): Promise<void> {
  const { error } = await cliente()
    .rpc('pl_publicar_version', { ver: versionId })
  if (error) throw error
}

// Deshace la última publicación. Hermana de publicarVersion, misma forma:
// una RPC atómica, nunca varias escrituras sueltas desde el cliente.
export async function revertirVersion(experienciaId: string): Promise<void> {
  const { error } = await cliente()
    .rpc('pl_revertir_version', { exp: experienciaId })
  if (error) throw error
}

// ── Subida de archivos, contra las rutas del paso 7 ─────────

// Antes esto era un solo mensaje fijo ("se cortó la conexión") sin importar
// la causa real. Pedido de Francisco, 2026-09-30: "tiene que haber un
// mensaje que explique por qué... si es un video muy pesado tiene que
// mencionarlo directamente." Probado en vivo contra Storage real (no es
// una suposición de cómo se comporta la librería):
//
//   - Storage SÍ responde con un error claro cuando el objeto pesa de más:
//     { name: 'StorageApiError', statusCode: '413',
//       message: 'The object exceeded the maximum allowed size' }
//     Eso se distingue y se dice tal cual, sin inventar una cifra.
//
//   - HALLAZGO: subiendo un archivo de 100 MB -- bien debajo del límite de
//     200 MB que el bucket `personalab-medios` tiene declarado -- Storage
//     lo rechazó igual con el mismo error. Se acotó por binario (50 MB
//     pasó, 60 MB falló): el techo real que Supabase aplica hoy ronda los
//     50 MB, no los 200 declarados. Esto es casi con certeza la causa de
//     "no pude subir algunos videos": cualquier video entre ~50 y 200 MB
//     pasa el aviso de "sí cabe" (`motivoRechazo`, que lee el límite
//     DECLARADO del bucket) y después Storage lo rechaza igual. Ese límite
//     real es un ajuste de proyecto en el Dashboard de Supabase (Project
//     Settings → Storage → "Upload file size limit"), no una fila de la
//     base ni algo que este código pueda leer o subir por sí solo -- hay
//     que subirlo ahí a mano para que el techo de 200 MB sea real. Mientras
//     tanto, el mensaje de acá no promete una cifra que no se puede
//     verificar: dice que el archivo pesa de más y sugiere comprimir.
//
//   - Cualquier otro error CON respuesta de la API (`name: 'StorageApiError'`)
//     se muestra tal cual vino -- es un motivo real, no uno inventado.
//
//   - Solo cuando no hay respuesta de la API (falló la red antes de llegar)
//     es honesto decir que se cortó la conexión.
function mensajeDeErrorDeSubida(error: unknown): string {
  const e = error as { name?: string; statusCode?: string; message?: string } | null
  if (e?.statusCode === '413') {
    return 'El archivo pesa demasiado: el servidor de almacenamiento lo rechazó por tamaño. Comprímelo o divídelo en partes más pequeñas.'
  }
  if (e?.name === 'StorageApiError' && e.message) {
    return `No se pudo subir el archivo: ${e.message}`
  }
  return 'Se cortó la conexión. El archivo sigue en tu computadora, no se perdió nada.'
}

export async function subirArchivo(
  archivo: File,
  alAvanzar?: (pct: number) => void
): Promise<{ id: string; nombre: string; peso: string; url: string }> {
  // 1. Pedir la URL firmada. El limite se valida del lado del servidor y
  //    devuelve un motivo legible si no pasa.
  const r1 = await fetch('/api/personalab/medios/subir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: archivo.name, mime: archivo.type, bytes: archivo.size }),
  })
  if (!r1.ok) {
    const { error } = await r1.json().catch(() => ({ error: 'No se pudo preparar la subida.' }))
    throw new Error(error)
  }
  const { bucket, ruta, token } = await r1.json()

  alAvanzar?.(10)

  // 2. Subir directo a Storage. No pasa por el servidor de Next, que tiene
  //    limite de cuerpo y de tiempo.
  const sb = cliente()
  const { error: errorSubida } = await sb.storage
    .from(bucket)
    .uploadToSignedUrl(ruta, token, archivo)

  if (errorSubida) throw new Error(mensajeDeErrorDeSubida(errorSubida))

  alAvanzar?.(85)

  // 3. Registrar la fila solo cuando el objeto ya existe. El mime y el peso
  //    ya NO se mandan: el servidor los lee de la metadata real que Storage
  //    registró, no de lo que este código declare. Ver el comentario en
  //    registrar/route.ts (hallazgo A2 de Hugo).
  const r3 = await fetch('/api/personalab/medios/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, ruta, nombre: archivo.name }),
  })
  if (!r3.ok) {
    const { error } = await r3.json().catch(() => ({ error: 'No se pudo registrar el archivo.' }))
    throw new Error(error)
  }
  const fila = await r3.json()

  alAvanzar?.(100)

  return {
    id: fila.id,
    nombre: fila.nombre,
    peso: formatearPeso(fila.peso_bytes ?? archivo.size),
    url: `/api/personalab/medios/${fila.id}`,
  }
}

