'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Bloque, TipoBloque, Audiencia } from './contenido'

// Adaptador contra Supabase. Misma forma que el de localStorage: los tipos
// no cambian y la interfaz tampoco, solo de donde salen los datos.
//
// SIN USAR TODAVIA. Se enciende con NEXT_PUBLIC_PERSONALAB_REMOTO=1, y eso
// no debe hacerse hasta que las migraciones esten aplicadas y probadas.
// Mientras tanto el editor sigue con localStorage y el prototipo funciona.

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

// La fila de la base trae nombres de columna; el prototipo trae los campos
// planos que ya usa el editor. Esta es la unica traduccion, y esta aqui
// para que no se repita en cada pantalla.
interface FilaBloque {
  id: string
  hinge_id: string
  orden: number
  tipo: TipoBloque
  audiencia: Audiencia
  contenido: Record<string, unknown>
  media_id: string | null
  rev: number
}

function aBloque(f: FilaBloque): Bloque & { rev: number; mediaId: string | null } {
  const c = f.contenido ?? {}
  return {
    id: f.id,
    bisagraId: f.hinge_id,
    orden: f.orden,
    tipo: f.tipo,
    audiencia: f.audiencia,
    rev: f.rev,
    mediaId: f.media_id,
    texto: c.texto as string | undefined,
    autor: c.autor as string | undefined,
    pie: c.pie as string | undefined,
    url: c.url as string | undefined,
    nombreArchivo: c.nombreArchivo as string | undefined,
    peso: c.peso as string | undefined,
    descargable: c.descargable as boolean | undefined,
    duracion: c.duracion as string | undefined,
  }
}

function aContenido(b: Bloque): Record<string, unknown> {
  const c: Record<string, unknown> = {}
  if (b.texto !== undefined) c.texto = b.texto
  if (b.autor !== undefined) c.autor = b.autor
  if (b.pie !== undefined) c.pie = b.pie
  if (b.url !== undefined) c.url = b.url
  if (b.nombreArchivo !== undefined) c.nombreArchivo = b.nombreArchivo
  if (b.peso !== undefined) c.peso = b.peso
  if (b.descargable !== undefined) c.descargable = b.descargable
  if (b.duracion !== undefined) c.duracion = b.duracion
  return c
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
  return (data as FilaBloque[]).map(aBloque)
}

// ── Escritura, con concurrencia optimista ───────────────────
//
// El `eq('rev', revEsperada)` es el candado: si otra persona guardo entre
// que cargaste y que guardas, la fila ya tiene otra rev y el update no
// afecta ninguna fila. Ahi se lanza el conflicto en vez de pisar su trabajo
// en silencio, que es lo que pasa sin esto.

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
  return data.rev
}

export async function crearBloque(b: Bloque, versionId: string) {
  const { data, error } = await cliente()
    .from('blocks')
    .insert({
      version_id: versionId,
      hinge_id: b.bisagraId,
      orden: b.orden,
      tipo: b.tipo,
      audiencia: b.audiencia,
      contenido: aContenido(b),
    })
    .select('id, hinge_id, orden, tipo, audiencia, contenido, media_id, rev')
    .single()

  if (error) throw error
  return aBloque(data as FilaBloque)
}

export async function borrarBloque(id: string) {
  const { error } = await cliente().from('blocks').delete().eq('id', id)
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

  // 3. Registrar la fila solo cuando el objeto ya existe.
  const r3 = await fetch('/api/personalab/medios/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bucket, ruta, nombre: archivo.name, mime: archivo.type, bytes: archivo.size,
    }),
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
    peso: `${Math.round((fila.peso_bytes ?? archivo.size) / 1024)} KB`,
    url: `/api/personalab/medios/${fila.id}`,
  }
}

// Si el adaptador remoto esta encendido. Mientras sea falso, el editor
// sigue con localStorage y el prototipo funciona sin base.
export const REMOTO_ACTIVO = process.env.NEXT_PUBLIC_PERSONALAB_REMOTO === '1'
