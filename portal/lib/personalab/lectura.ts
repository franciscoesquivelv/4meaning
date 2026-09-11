import { createClient } from '@/lib/supabase/server'
import type { Bloque } from '@/app/(admin)/personalab/contenido'

// ── LA LECTURA ──────────────────────────────────────────────────
//
// Lo que ve quien compró una experiencia digital y la está atravesando.
//
// QUIÉN DECIDE QUÉ VE. No este archivo: la RLS. `pl_nivel_audiencia()` da
// nivel 1 a cualquier acceso vivo, y la política de `blocks` solo entrega los
// bloques cuya audiencia cabe en ese nivel, dentro de una versión publicada.
// O sea que aunque esta pantalla tuviera un error, no puede enseñar un bloque
// de moderador a quien compró solo. El filtro vive en la base.
//
// Por eso aquí no hay una sola condición de permiso escrita a mano. Si la
// consulta vuelve vacía es porque no hay acceso, y eso se dice, no se disfraza.

export interface Bisagra {
  id: string
  tiempo: string
  orden: number
  titulo: string
  descripcion: string | null
  duracion: string | null
  // Agrupación temática. Nulo cuando la experiencia no se agrupa, y entonces
  // la lista va plana. El Agradecimiento no tiene tramos; el Presente como
  // Regalo tiene cuatro.
  tramo: string | null
}

export interface Experiencia {
  id: string
  slug: string
  nombre: string
  subtitulo: string | null
  narrativa: string | null
  duracion: string | null
}

// Las tres respuestas posibles, y son tres y no dos A PROPÓSITO.
//
// Durante meses el portal confundió "falló la consulta" con "no hay nada", y
// por eso una pantalla anunció "no hay familias registradas" sobre un evento
// con cuatro, y otra le prometió a una pareja unos facilitadores que nunca
// iban a aparecer. Aquí el fallo es un estado propio desde el principio.
export type Resultado<T> =
  | { estado: 'ok'; datos: T }
  | { estado: 'sin-acceso' }
  | { estado: 'fallo'; motivo: string }

export async function cargarExperiencia(
  slug: string
): Promise<Resultado<{ experiencia: Experiencia; bisagras: Bisagra[] }>> {
  const supabase = createClient()

  const { data: exp, error: errExp } = await supabase
    .from('experiences')
    .select('id, slug, nombre, subtitulo, narrativa, duracion')
    .eq('slug', slug)
    .maybeSingle()

  if (errExp) return { estado: 'fallo', motivo: errExp.message }
  if (!exp) return { estado: 'sin-acceso' }

  // `modo` separa las dos entregas de una misma experiencia. Una bisagra sin
  // marcar nace en 'presencial', así que lo que falta aquí falta a la vista,
  // en vez de aparecer contenido de sala delante de quien compró solo.
  const { data: bis, error: errBis } = await supabase
    .from('hinges')
    .select('id, tiempo, orden, titulo, descripcion, duracion, tramo')
    .eq('experience_id', exp.id)
    .in('modo', ['digital', 'ambos'])
    .order('tiempo')
    .order('orden')

  if (errBis) return { estado: 'fallo', motivo: errBis.message }

  return {
    estado: 'ok',
    datos: { experiencia: exp as Experiencia, bisagras: (bis ?? []) as Bisagra[] },
  }
}

export async function cargarBisagra(
  slug: string,
  bisagraId: string
): Promise<Resultado<{ experiencia: Experiencia; bisagra: Bisagra; bloques: Bloque[]; anterior: Bisagra | null; siguiente: Bisagra | null }>> {
  const base = await cargarExperiencia(slug)
  if (base.estado !== 'ok') return base

  const { experiencia, bisagras } = base.datos
  const i = bisagras.findIndex(b => b.id === bisagraId)
  if (i === -1) return { estado: 'sin-acceso' }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('blocks')
    .select('id, hinge_id, orden, tipo, audiencia, contenido')
    .eq('hinge_id', bisagraId)
    .order('orden')

  if (error) return { estado: 'fallo', motivo: error.message }

  // La fila trae `contenido` como jsonb; el renderizador que ya existe espera
  // los campos planos. Esta es la única traducción y vive aquí sola.
  const bloques: Bloque[] = (data ?? []).map(f => {
    const c = (f.contenido ?? {}) as Record<string, unknown>
    return {
      id: f.id,
      bisagraId: f.hinge_id,
      orden: f.orden,
      tipo: f.tipo,
      audiencia: f.audiencia,
      texto: c.texto as string | undefined,
      autor: c.autor as string | undefined,
      pie: c.pie as string | undefined,
      url: c.url as string | undefined,
      nombreArchivo: c.nombreArchivo as string | undefined,
      peso: c.peso as string | undefined,
      descargable: c.descargable as boolean | undefined,
      duracion: c.duracion as string | undefined,
    } as Bloque
  })

  return {
    estado: 'ok',
    datos: {
      experiencia,
      bisagra: bisagras[i],
      bloques,
      anterior: i > 0 ? bisagras[i - 1] : null,
      siguiente: i < bisagras.length - 1 ? bisagras[i + 1] : null,
    },
  }
}

// Dónde se quedó. NO es progreso: no hay porcentaje, no hay racha, y la tabla
// lleva escrito que agregarlos está prohibido. Solo sirve para recibir a la
// persona donde la dejó en vez de devolverla al principio.
export async function ultimaVista(experienciaId: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('bookmarks')
    .select('hinge_id')
    .eq('experience_id', experienciaId)
    .maybeSingle()
  return data?.hinge_id ?? null
}

// Todas las consignas de una experiencia, en orden, para el cierre.
//
// El cierre necesita saber QUÉ se preguntó para poder poner cada respuesta
// debajo de su pregunta. Las respuestas no vienen de aquí: viven en el
// navegador de la persona y no existen en esta base. Esto solo trae las
// preguntas.
export async function consignasDe(
  slug: string
): Promise<Resultado<{ experiencia: Experiencia; consignas: { id: string; texto: string; bisagra: string }[] }>> {
  const base = await cargarExperiencia(slug)
  if (base.estado !== 'ok') return base

  const { experiencia, bisagras } = base.datos
  if (bisagras.length === 0) {
    return { estado: 'ok', datos: { experiencia, consignas: [] } }
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('blocks')
    .select('id, hinge_id, orden, contenido')
    .eq('tipo', 'consigna')
    .in('hinge_id', bisagras.map(b => b.id))
    .order('orden')

  if (error) return { estado: 'fallo', motivo: error.message }

  const titulo = new Map(bisagras.map(b => [b.id, b.titulo]))
  const orden = new Map(bisagras.map((b, i) => [b.id, i]))

  const consignas = (data ?? [])
    .map(f => ({
      id: f.id,
      texto: String((f.contenido as Record<string, unknown>)?.texto ?? ''),
      bisagra: titulo.get(f.hinge_id) ?? '',
      _o: (orden.get(f.hinge_id) ?? 0) * 1000 + f.orden,
    }))
    .sort((a, b) => a._o - b._o)
    .map(({ _o, ...c }) => c)

  return { estado: 'ok', datos: { experiencia, consignas } }
}
