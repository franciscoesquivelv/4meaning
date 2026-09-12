import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

  // DOS FILTROS, Y LOS DOS FALLAN CERRADO.
  //
  // `modo` separa las dos entregas de una misma experiencia. Una bisagra sin
  // marcar nace en 'presencial', así que lo que falta aquí falta a la vista,
  // en vez de aparecer contenido de sala delante de quien compró solo.
  //
  // `listo` dice si esa bisagra está terminada, y hasta hoy el lector lo
  // ignoraba: se servía contenido a medias a quien tuviera acceso. Hallazgo
  // de Leo, Consejo del 2026-09-12, sobre el caso concreto de El Presente
  // como Regalo, cuyas cuatro bisagras existen con cero bloques adentro y
  // habrían salido como cuatro pantallas en blanco.
  //
  // Quien escriba contenido nuevo tiene que saber esto: una bisagra no
  // aparece en el lector hasta que alguien la marca `listo`. Escribir los
  // bloques no basta.
  const { data: bis, error: errBis } = await supabase
    .from('hinges')
    .select('id, tiempo, orden, titulo, descripcion, duracion, tramo')
    .eq('experience_id', exp.id)
    .in('modo', ['digital', 'ambos'])
    .eq('listo', true)
    .order('tiempo')
    .order('orden')

  if (errBis) return { estado: 'fallo', motivo: errBis.message }

  return {
    estado: 'ok',
    datos: { experiencia: exp as Experiencia, bisagras: (bis ?? []) as Bisagra[] },
  }
}

// DOS POSICIONES QUE SE PARECEN Y NO SON LA MISMA. Separarlas con nombre es
// el arreglo de un bug real, del 2026-09-12: por "quitar duplicación" se
// usó una sola función para las dos, y el índice terminó enseñando el
// título de una bisagra que la persona nunca había abierto. Justo lo que la
// etapa existía para esconder.
//
// DÓNDE ESTÁ PARADA: la última bisagra que abrió, que es a donde la manda
// el botón "Continuar". Es lo último que el índice puede nombrar.
export function posicionActual(iUltima: number): number {
  return iUltima >= 0 ? iUltima : 0
}

// HASTA DÓNDE PUEDE NAVEGAR: un paso más adelante, porque pulsar "Seguir"
// dentro de la bisagra en la que está la lleva ahí de todas formas. Sirve
// para el redirect de `cargarBisagra`, NUNCA para decidir qué se lista: el
// índice no nombra lo que todavía no se abrió.
export function posicionAlcanzable(iUltima: number): number {
  return posicionActual(iUltima) + (iUltima >= 0 ? 1 : 0)
}

export async function cargarBisagra(
  slug: string,
  bisagraId: string
): Promise<Resultado<{ experiencia: Experiencia; bisagra: Bisagra; bloques: Bloque[]; anterior: Bisagra | null; siguiente: Bisagra | null; primeraVez: boolean }>> {
  const base = await cargarExperiencia(slug)
  if (base.estado !== 'ok') return base

  const { experiencia, bisagras } = base.datos
  const i = bisagras.findIndex(b => b.id === bisagraId)
  if (i === -1) return { estado: 'sin-acceso' }

  // SE REVELA POR APERTURA, NO POR LOGRO. Decisión de Sora, Consejo del
  // 2026-09-11. Pedir por URL una bisagra más allá de donde se ha llegado
  // no es un error ni una falta de acceso (los dos ya tienen su propia
  // pantalla, y no es ninguna de las dos): es simplemente pedir algo que
  // todavía no toca. Se manda a seguir desde donde de verdad va, nunca con
  // un mensaje de "contenido bloqueado". Depende de que el marcador sea
  // monótono (Etapa 0, `solo_avanza_marcador()`): sin eso, releer algo
  // hacia atrás podría retroceder este límite.
  //
  // ESTO ES UX, NO UNA BARRERA DEL SERVIDOR, Y ES UNA DECISIÓN, NO UN
  // DESCUIDO. Auditoría de Hugo, mismo día: quien abre la consola del
  // navegador puede llamar el mismo `bookmarks.upsert` que ya usa
  // `MarcarVisto.tsx` con el `hinge_id` que quiera, y saltarse esto entero.
  // Francisco decidió, con el hallazgo completo sobre la mesa, dejarlo así:
  // bloquea toda navegación normal (clics, URLs), y quien lo evade a
  // propósito solo se arruina su propia sorpresa, no le quita nada a nadie
  // más. Construir la barrera real (validar cada salto contra el orden en
  // el servidor) es el mismo tipo de candado que Sora y Julian ya
  // descartaron por nombre para este producto. Si esto alguna vez necesita
  // cambiar, que sea con el mismo peso de decisión, no agregado a la
  // ligera.
  const ultima = await ultimaVista(experiencia.id)
  const iUltima = bisagras.findIndex(b => b.id === ultima)
  const iAlcanzable = posicionAlcanzable(iUltima)
  if (i > iAlcanzable) {
    redirect(`/experiencia/${slug}/${bisagras[iAlcanzable].id}`)
  }

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
      // Se acepta "20" además de 20. Hallazgo de Leo: quien escriba este
      // campo a mano en el editor de tablas de Supabase lo va a teclear como
      // texto sin darse cuenta, y exigir el tipo exacto daba cero espera,
      // cero error y cero señal. Lo que no es un número se descarta igual.
      segundos: Number.isFinite(Number(c.segundos)) ? Number(c.segundos) : undefined,
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
      // Si es la primera vez que esta persona abre ESTA bisagra. El piso de
      // tiempo de la pausa corre solo entonces; quien vuelve no se topa con
      // él otra vez (decisión de Sora: "se vuelve cerco el día que vuelva a
      // correr cuando alguien regresa").
      //
      // No hace falta ningún campo nuevo: `MarcarVisto` mueve el marcador al
      // montar la pantalla, o sea DESPUÉS de este render, así que aquí el
      // marcador todavía trae la bisagra anterior. Si la pedida está más
      // adelante que el marcador, es la primera vez.
      primeraVez: i > iUltima,
    },
  }
}

// Dónde se quedó. NO es progreso: no hay porcentaje, no hay racha, y la tabla
// lleva escrito que agregarlos está prohibido. Solo sirve para recibir a la
// persona donde la dejó en vez de devolverla al principio.
// LA POSICIÓN SE RECALCULA EN VIVO CONTRA EL CATÁLOGO ACTUAL, NUNCA SE
// GUARDA COMO UN CHECKPOINT FIJO. Auditoría de Hugo, Etapa 2: si el equipo
// borra la bisagra donde alguien se quedó (`bookmarks.hinge_id` tiene `on
// delete cascade`), esa persona vuelve a ver el índice desde cero, sin
// aviso. Si el equipo reordena bisagras de una experiencia en curso, el
// límite de "hasta dónde puede ver" puede moverse y esconder algo que ya
// había abierto. Decisión de Francisco, mismo día: no se protege en
// código. La regla es operativa, no técnica: una experiencia se termina
// ANTES de lanzarla, y si algún día hace falta editarla mientras alguien la
// está llevando, se PARA esa edición hasta que nadie esté adentro. No se
// construye una barrera para un caso que el proceso ya evita.
export async function ultimaVista(experienciaId: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('bookmarks')
    .select('hinge_id')
    .eq('experience_id', experienciaId)
    .maybeSingle()
  return data?.hinge_id ?? null
}

// Si esta persona ya vio el umbral de bienvenida de esta experiencia.
//
// Se ignora el error de la consulta a propósito, y no es un atajo: lo único
// que depende de esto es si se repite una pantalla de bienvenida. Fallar
// hacia "no la ha visto" cuando algo sale mal cuesta, como mucho, que la
// vuelva a ver una vez; fallar hacia "sí la vio" costaría escondérsela para
// siempre. El costo real está del lado seguro sin necesidad de propagar el
// error.
export async function bienvenidaVista(experienciaId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('bookmarks')
    .select('bienvenida_vista_at')
    .eq('experience_id', experienciaId)
    .maybeSingle()
  return Boolean(data?.bienvenida_vista_at)
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
