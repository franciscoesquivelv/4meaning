import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { desdeFila, type Bloque, type FilaBloque } from '@/lib/personalab/bloques'

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
  // A qué versión está anclada esta lectura. Ver `versionAnclada` para el
  // porqué: no siempre es "la publicada".
  versionId: string
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

// UN CUARTO ESTADO, PERO SOLO PARA QUIEN LEE COMO PARTICIPANTE.
//
// `Resultado<T>` lo usan también `compras.ts`, `progreso.ts`, `catalogo.ts`
// y `cuenta.ts` para sus propias consultas de administrador, que nunca
// producen este caso: ensanchar el tipo compartido les habría exigido a
// todas esas pantallas manejar una rama que no les puede pasar, puro ruido.
// `ResultadoLectura<T>` es el tipo de las tres funciones de este archivo que
// sí lo necesitan (`cargarExperiencia`, `cargarBisagra`, `consignasDe`).
//
// 'sin-contenido' SE SEPARÓ DE 'sin-acceso' EL 2026-09-21. Las dos vivían en
// la misma rama de `cargarExperiencia` (`!versionId`), y "no hay nada que
// publicar todavía" y "esta cuenta no compró esto" son verdades distintas
// que `SinAcceso.tsx` mezclaba: su texto ("puede que hayas entrado con un
// correo distinto... escríbenos y lo resolvemos") le decía a un comprador
// real, sin nada mal, que quizás se equivocó de cuenta. Hallazgo de Hugo.
// Es seguro separarlas SIN una consulta aparte a `grants`: `experiences`
// tiene su propia RLS ("pl lectura con acceso", `pl_nivel_audiencia(id) > 0`),
// así que si `cargarExperiencia` llega más allá de encontrar la fila de
// `experiences`, quien pregunta YA tiene un grant vivo. Lo que falta ahí no
// es acceso, es contenido.
export type ResultadoLectura<T> = Resultado<T> | { estado: 'sin-contenido' }

// A QUÉ VERSIÓN SE ANCLA ESTA LECTURA, Y NO SIEMPRE ES "LA PUBLICADA".
//
// ETAPA 2. Antes, hinges no tenía versión: solo existía "la" bisagra de una
// experiencia, y publicar de nuevo mientras alguien la leía le movía el
// piso sin aviso. Ahora cada bisagra pertenece a una versión, y la regla es:
//
//   SI YA HAY UN MARCADOR, esa es su versión, y se queda ahí. La bisagra
//   donde se quedó pertenece a una versión concreta; se lee esa hasta que
//   termine, aunque el equipo publique una nueva mientras tanto. Quien
//   estaba a la mitad no se entera de la republicación.
//
//   SI NO HAY MARCADOR (primera vez), la publicada de hoy se vuelve su
//   ancla desde el primer bloque que abra, vía el primer `MarcarVisto`.
//
// Con esto, la vieja regla operativa de más abajo ("si hay que editar
// mientras alguien la lleva, se para") deja de ser la única defensa: sigue
// siendo la práctica correcta del día a día, pero ya no es lo único que
// evita que a alguien se le desaparezca el suelo. La RLS (`pl_puede_ver_
// version`) hace cumplir esto mismo del lado de la base: una versión
// retirada solo se puede leer si el marcador de quien pregunta apunta ahí.
async function versionAnclada(experienceId: string): Promise<string | null> {
  const supabase = createClient()

  const { data: marcador } = await supabase
    .from('bookmarks')
    .select('hinge_id')
    .eq('experience_id', experienceId)
    .maybeSingle()

  if (marcador?.hinge_id) {
    const { data: h } = await supabase
      .from('hinges')
      .select('version_id')
      .eq('id', marcador.hinge_id)
      .maybeSingle()
    if (h?.version_id) return h.version_id
  }

  const { data: pub } = await supabase
    .from('experience_versions')
    .select('id')
    .eq('experience_id', experienceId)
    .eq('estado', 'publicada')
    .maybeSingle()

  return pub?.id ?? null
}

export async function cargarExperiencia(
  slug: string
): Promise<ResultadoLectura<{ experiencia: Experiencia; bisagras: Bisagra[] }>> {
  const supabase = createClient()

  const { data: exp, error: errExp } = await supabase
    .from('experiences')
    .select('id, slug, nombre, subtitulo, narrativa, duracion')
    .eq('slug', slug)
    .maybeSingle()

  if (errExp) return { estado: 'fallo', motivo: errExp.message }
  if (!exp) return { estado: 'sin-acceso' }

  // Sin versión que leer (nunca se publicó nada, y tampoco hay marcador
  // previo). Llegar hasta aquí ya cruzó la RLS de `experiences`, que exige
  // un grant vivo (`pl_nivel_audiencia(id) > 0`) — así que esta cuenta SÍ
  // compró esto. Lo que falta no es acceso, es contenido.
  const versionId = await versionAnclada(exp.id)
  if (!versionId) return { estado: 'sin-contenido' }

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
    .eq('version_id', versionId)
    .in('modo', ['digital', 'ambos'])
    .eq('listo', true)
    .order('tiempo')
    .order('orden')

  if (errBis) return { estado: 'fallo', motivo: errBis.message }

  return {
    estado: 'ok',
    datos: {
      experiencia: { ...exp, versionId } as Experiencia,
      bisagras: (bis ?? []) as Bisagra[],
    },
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
): Promise<ResultadoLectura<{ experiencia: Experiencia; bisagra: Bisagra; bloques: (Bloque & { respuestaGuardada?: string })[]; anterior: Bisagra | null; siguiente: Bisagra | null; primeraVez: boolean }>> {
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
  // Filtrado por versión, no solo por bisagra. ETAPA 2 cierra el pendiente
  // que Daniel dejó escrito aquí: sin este filtro, el día que exista un
  // borrador esta misma bisagra devolvería los bloques duplicados (los del
  // borrador y los de lo publicado) para quien fuera del equipo.
  // `experiencia.versionId` ya viene resuelto por `versionAnclada`.
  const { data, error } = await supabase
    .from('blocks')
    .select('id, hinge_id, orden, tipo, audiencia, contenido, media_id, media(nombre, peso_bytes)')
    .eq('hinge_id', bisagraId)
    .eq('version_id', experiencia.versionId)
    .order('orden')

  if (error) return { estado: 'fallo', motivo: error.message }

  // LA TRADUCCIÓN YA NO VIVE AQUÍ. Aquí decía "esta es la única traducción y
  // vive aquí sola", y era falso desde el día que se escribió: `almacenRemoto`
  // tenía la otra, y ya diferían, porque esta conocía `segundos` y aquella no.
  // Guardar una pausa desde el editor le habría borrado el piso de tiempo.
  // Ahora las dos direcciones salen del contrato de bloque, y agregar un campo
  // no exige acordarse de dos sitios.
  //
  // `desdeFila` devuelve null si el tipo no está en el contrato, que solo pasa
  // si alguien agregó un valor al enum sin declararlo. Se descarta el bloque
  // en vez de pintar un hueco que nadie sabe leer.
  // El doble cast es porque este cliente no genera tipos desde el esquema:
  // sin eso, un embed a-uno como `media(...)` se infiere como arreglo. Ya
  // se verificó contra la base real (Etapa 5) que `media` llega como un
  // solo objeto, nunca un arreglo -- `blocks.media_id` apunta a una sola
  // fila.
  const bloques: (Bloque & { respuestaGuardada?: string })[] = (data ?? [])
    .map(f => desdeFila(f as unknown as FilaBloque))
    .filter((b): b is Bloque => b !== null)

  // LO YA ESCRITO, CUANDO LA CONSIGNA LO GUARDA. Solo se consulta si hace
  // falta (alguna consigna de esta bisagra tiene `guarda: true`): el resto
  // de las bisagras, que son la mayoría, no pagan una consulta de más.
  // `createClient()` es la sesión de la propia persona, así que la RLS de
  // `responses` (`profile_id = auth.uid()`) ya hace el filtro: no hace
  // falta repetirlo aquí.
  const idsConGuardado = bloques.filter(b => b.tipo === 'consigna' && b.guarda).map(b => b.id)
  if (idsConGuardado.length > 0) {
    const { data: guardadas } = await supabase
      .from('responses')
      .select('block_id, texto')
      .in('block_id', idsConGuardado)
    const porBloque = new Map((guardadas ?? []).map(r => [r.block_id, r.texto as string]))
    for (const b of bloques) {
      const g = porBloque.get(b.id)
      if (g !== undefined) b.respuestaGuardada = g
    }
  }

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
// LA POSICIÓN SE RECALCULA EN VIVO CONTRA EL CATÁLOGO DE SU VERSIÓN
// ANCLADA, no contra "lo que esté publicado ahora mismo". Este comentario
// decía, hasta la Etapa 2 del editor (2026-09-13), que reordenar o publicar
// de nuevo mientras alguien lee "no se protege en código", y que la única
// defensa era operativa: parar toda edición mientras hubiera alguien
// adentro. Eso dejó de ser del todo cierto.
//
// Con `hinges` versionada y `versionAnclada()` (en `cargarExperiencia`)
// atando la lectura a la versión donde está el marcador, el caso que
// preocupaba (el equipo reordena o publica de nuevo con alguien a la mitad)
// ya no mueve nada debajo de esa persona: sigue leyendo exactamente el
// catálogo, el orden y el contenido de SU versión hasta que termina, sin
// enterarse de que se publicó una nueva. La RLS lo hace cumplir
// (`pl_puede_ver_version`): una versión retirada solo se puede leer si el
// marcador de quien pregunta apunta ahí.
//
// LO QUE SIGUE SIN PROTECCIÓN TÉCNICA, y es un caso mucho más angosto: que
// alguien del equipo borre a mano, por fuera del ciclo de borrador y
// publicación, la fila histórica de una bisagra que una versión retirada
// todavía necesita (`bookmarks.hinge_id` tiene `on delete cascade`). El
// flujo normal nunca hace esto: abrir un borrador COPIA bisagras con ids
// nuevos, nunca borra las viejas. Ese caso sigue siendo operativo, no
// técnico, y la regla de Francisco sigue en pie para él: no se construye
// una barrera para un borrado manual que el proceso normal no produce.
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
// debajo de su pregunta. LAS RESPUESTAS NO SIEMPRE VIENEN DE AQUÍ: para una
// consigna con `guarda: false` (la mayoría, hasta hoy la única forma que
// existía) siguen viviendo solo en el navegador de la persona, y esta
// función no las conoce. Para una consigna con `guarda: true`
// (2026-09-22, decisión de Francisco del 13-sep construida) el valor SÍ
// viaja desde aquí, ya guardado en `responses` -- `Cierre.tsx` las junta
// con las que le llegan de `sessionStorage` para las que no se guardan.
export async function consignasDe(
  slug: string
): Promise<ResultadoLectura<{
  experiencia: Experiencia
  consignas: { id: string; texto: string; bisagra: string; guarda: boolean; respuestaGuardada?: string }[]
  // SI DE VERDAD LLEGÓ AL FINAL. `Cierre.tsx` decía "Terminaste [experiencia]"
  // con la única condición de no haber escrito nada, sin mirar nunca si la
  // persona recorrió las bisagras. Reproducido en vivo por Hugo: entrar por
  // URL directa a `/cierre` habiendo visitado 3 de 11 bisagras pintaba
  // "Terminaste" en letra grande. Es la misma regla que ya protege el índice
  // y `cargarBisagra` (revelar por apertura, nunca afirmar de más): el
  // marcador tiene que estar en la última bisagra real, no en cualquiera.
  completo: boolean
}>> {
  const base = await cargarExperiencia(slug)
  if (base.estado !== 'ok') return base

  const { experiencia, bisagras } = base.datos
  if (bisagras.length === 0) {
    return { estado: 'ok', datos: { experiencia, consignas: [], completo: false } }
  }

  const ultima = await ultimaVista(experiencia.id)
  const iUltima = bisagras.findIndex(b => b.id === ultima)
  const completo = iUltima === bisagras.length - 1

  const supabase = createClient()
  // Mismo filtro por versión, y por la misma razón que en `cargarBisagra`:
  // sin él, esta consulta duplicaría preguntas el día que exista un
  // borrador. Y hay una segunda razón, propia del cierre: sin este filtro,
  // alguien que terminó de leer después de una republicación vería el texto
  // NUEVO de una pregunta al lado de la respuesta que escribió cuando la
  // pregunta decía otra cosa. Con el filtro, el cierre lee exactamente las
  // consignas de la versión que esa persona atravesó.
  const { data, error } = await supabase
    .from('blocks')
    .select('id, hinge_id, orden, contenido')
    .eq('tipo', 'consigna')
    .eq('version_id', experiencia.versionId)
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
      guarda: (f.contenido as Record<string, unknown>)?.guarda === true,
      _o: (orden.get(f.hinge_id) ?? 0) * 1000 + f.orden,
    }))
    .sort((a, b) => a._o - b._o)
    .map(({ _o, ...c }) => c)

  const idsConGuardado = consignas.filter(c => c.guarda).map(c => c.id)
  if (idsConGuardado.length > 0) {
    const { data: guardadas } = await supabase
      .from('responses')
      .select('block_id, texto')
      .in('block_id', idsConGuardado)
    const porBloque = new Map((guardadas ?? []).map(r => [r.block_id, r.texto as string]))
    for (const c of consignas) {
      const g = porBloque.get(c.id)
      if (g !== undefined) (c as typeof c & { respuestaGuardada?: string }).respuestaGuardada = g
    }
  }

  return { estado: 'ok', datos: { experiencia, consignas, completo } }
}
