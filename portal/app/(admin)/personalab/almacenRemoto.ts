'use client'

import { createBrowserClient } from '@supabase/ssr'
import {
  desdeFila, aContenido, formatearPeso,
  type Bloque, type TipoBloque, type Audiencia, type FilaBloque,
} from '@/lib/personalab/bloques'

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
export async function reordenarRemoto(
  cambios: { id: string; orden: number }[],
  versionId: string
): Promise<void> {
  const sb = cliente()
  for (const c of cambios) {
    const { error } = await sb
      .from('blocks')
      .update({ orden: c.orden })
      .eq('id', c.id)
      .eq('version_id', versionId)
    if (error) throw error
  }
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

  if (errorSubida) throw new Error('Se cortó la conexión. El archivo sigue en tu computadora, no se perdió nada.')

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

