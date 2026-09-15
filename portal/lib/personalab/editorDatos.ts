import { createClient } from '@/lib/supabase/server'
import { desdeFila, type Bloque, type FilaBloque } from '@/lib/personalab/bloques'
import type { Tiempo, Soporte } from '@/app/(admin)/personalab/dominio'

// ── LO QUE EL EDITOR NECESITA PARA ABRIR, DEL LADO DEL SERVIDOR ─────────
//
// Hasta la Etapa 3, el editor sacaba su experiencia y su lista de bisagras
// de `dominio.ts`, un catálogo escrito a mano, mientras el lector las sacaba
// de la base real. Dos listas, y nada las mantenía iguales: Leo y Daniel lo
// señalaron desde la Etapa 1. Este archivo es la contraparte de
// `lectura.ts`, pero para quien EDITA en vez de quien LEE: mismo criterio de
// `Resultado<T>`, misma disciplina de no adivinar.
//
// LA DIFERENCIA DE FONDO CON `lectura.ts`: el lector se ancla a una versión
// (publicada o retirada+anclada). El editor SIEMPRE trabaja sobre el
// borrador, y si no existe uno, lo abre. `pl_abrir_borrador` es idempotente
// (si ya hay uno, lo devuelve tal cual), así que llamarlo en cada carga de
// la pantalla es seguro: no crea un borrador nuevo cada vez que alguien abre
// el editor.

export interface BisagraEditable {
  id: string
  tiempo: Tiempo
  orden: number
  titulo: string
  descripcion: string
  soporte: Soporte
  duracion?: string
  listo: boolean
  requiere?: string[]
}

export interface ExperienciaEditable {
  id: string
  slug: string
  nombre: string
  versionId: string
  bisagras: BisagraEditable[]
}

// El editor necesita `rev` para el candado de concurrencia optimista de
// `guardarBloque` (`almacenRemoto.ts`), que ya existía escrito y sin usar.
// El lector (`lectura.ts`) no lo necesita porque nunca escribe.
export type BloqueEditable = Bloque & { rev: number }

export type ResultadoEditor =
  | { estado: 'ok'; datos: { experiencia: ExperienciaEditable; bloques: BloqueEditable[] } }
  | { estado: 'sin-experiencia' }
  | { estado: 'sin-permiso'; motivo: string }
  | { estado: 'fallo'; motivo: string }

export async function cargarParaEditar(slug: string): Promise<ResultadoEditor> {
  const supabase = createClient()

  const { data: exp, error: errExp } = await supabase
    .from('experiences')
    .select('id, slug, nombre')
    .eq('slug', slug)
    .maybeSingle()

  if (errExp) return { estado: 'fallo', motivo: errExp.message }
  if (!exp) return { estado: 'sin-experiencia' }

  // `pl_abrir_borrador` ya exige `pl_es_equipo()` adentro y falla con
  // errcode 42501 si quien pregunta no es del equipo. Ese código es el
  // único que distinguimos: cualquier otro error es un fallo genérico, no
  // un problema de permisos.
  const { data: versionId, error: errAbrir } = await supabase
    .rpc('pl_abrir_borrador', { exp: exp.id })

  if (errAbrir) {
    if (errAbrir.code === '42501') {
      return { estado: 'sin-permiso', motivo: 'Tu cuenta no tiene permiso de equipo sobre PersonaLab.' }
    }
    return { estado: 'fallo', motivo: errAbrir.message }
  }
  if (!versionId) return { estado: 'fallo', motivo: 'El borrador no devolvió un id de versión.' }

  const { data: bis, error: errBis } = await supabase
    .from('hinges')
    .select('id, tiempo, orden, titulo, descripcion, soporte, duracion, listo, requiere')
    .eq('version_id', versionId)
    .order('tiempo')
    .order('orden')

  if (errBis) return { estado: 'fallo', motivo: errBis.message }

  const { data: filas, error: errBloques } = await supabase
    .from('blocks')
    .select('id, hinge_id, orden, tipo, audiencia, contenido, media_id, rev, media(nombre, peso_bytes)')
    .eq('version_id', versionId)
    .order('orden')

  if (errBloques) return { estado: 'fallo', motivo: errBloques.message }

  // Mismo criterio que el lector: un tipo que el contrato no reconoce se
  // descarta en vez de llegar a medias. Solo pasa si alguien agregó un
  // valor al enum sin declararlo en `lib/personalab/bloques.ts`.
  // El doble cast es por lo mismo que en `lectura.ts`: sin tipos generados
  // desde el esquema, el embed `media(...)` se infiere como arreglo aunque
  // en la base real siempre llega como un solo objeto.
  const bloques: BloqueEditable[] = (filas ?? [])
    .map(f => {
      const b = desdeFila(f as unknown as FilaBloque)
      return b ? { ...b, rev: (f as { rev: number }).rev } : null
    })
    .filter((b): b is BloqueEditable => b !== null)

  return {
    estado: 'ok',
    datos: {
      experiencia: {
        id: exp.id,
        slug: exp.slug,
        nombre: exp.nombre,
        versionId,
        bisagras: (bis ?? []) as BisagraEditable[],
      },
      bloques,
    },
  }
}

// ── Lo que necesita la pantalla de publicar, además de lo de arriba ────

export interface VersionPublicada {
  numero: number
  fecha: string
}

// LA COMPARACIÓN "NUEVOS/EDITADOS/QUITADOS" NO SOBREVIVIÓ A ESTA ETAPA, Y ES
// A PROPÓSITO. Con localStorage, borrador y publicado compartían el mismo
// espacio de ids, así que comparar por id decía de verdad "esto es lo mismo,
// cambiado" contra "esto es nuevo". Con la base real, `pl_abrir_borrador`
// copia bisagras Y bloques con IDS NUEVOS cada vez (para que una versión
// retirada nunca pierda a quien sigue anclado a ella, ver la Etapa 2). El
// borrador y lo publicado no comparten ids desde el día uno: no hay forma
// honesta de decir "este bloque de aquí es el mismo que aquel de allá,
// editado" sin adivinar. Mentir con un diff que parece preciso es peor que
// no tenerlo, así que esta función solo cuenta, no empareja.
export async function resumenDePublicacion(experienceId: string): Promise<{
  bloquesEnBorrador: number
  bloquesEnPublicada: number
  historial: VersionPublicada[]
}> {
  const supabase = createClient()

  const { data: versiones } = await supabase
    .from('experience_versions')
    .select('id, numero, estado, publicada_at')
    .eq('experience_id', experienceId)
    .order('numero', { ascending: false })

  const todas = versiones ?? []
  const publicadaHoy = todas.find(v => v.estado === 'publicada')
  const borrador = todas.find(v => v.estado === 'borrador')

  const [{ count: enBorrador }, { count: enPublicada }] = await Promise.all([
    borrador
      ? supabase.from('blocks').select('id', { count: 'exact', head: true }).eq('version_id', borrador.id)
      : Promise.resolve({ count: 0 }),
    publicadaHoy
      ? supabase.from('blocks').select('id', { count: 'exact', head: true }).eq('version_id', publicadaHoy.id)
      : Promise.resolve({ count: 0 }),
  ])

  return {
    bloquesEnBorrador: enBorrador ?? 0,
    bloquesEnPublicada: enPublicada ?? 0,
    historial: todas
      .filter(v => v.estado !== 'borrador' && v.publicada_at)
      .map(v => ({ numero: v.numero, fecha: (v.publicada_at as string).slice(0, 10) })),
  }
}
