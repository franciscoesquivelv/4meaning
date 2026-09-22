import { createServiceClient } from '@/lib/supabase/server'
import { exigirEquipo } from './medios'
import type { Resultado } from './lectura'

// ── LA BIBLIOTECA, DESDE LA BASE REAL ───────────────────────────────────
//
// Hasta aquí, `/personalab/experiencias` (lista y ficha) leía de
// `dominio.ts`: un catálogo escrito a mano que sirvió de documento de
// visión y, en su momento, de origen para el seed real (`kit_pieces` y
// `hinges` de Metamorfosis y de El Presente como Regalo son, casi palabra
// por palabra, el mismo texto que sigue viviendo en `dominio.ts`). El
// editor y el lector real ya dejaron de usar ese catálogo hace varias
// etapas; esta pantalla era la última que seguía atada a él.
//
// LO QUE ESTO CAMBIA DE VERDAD, y hay que decirlo con nombre: no todo lo
// que `dominio.ts` muestra existe todavía en la base. Verificado fila por
// fila antes de escribir este archivo:
//   - El Agradecimiento: sus bisagras SÍ son reales (12), pero su kit no
//     tiene ninguna fila todavía (`dominio.ts` describe 6 piezas que
//     nunca se migraron).
//   - Metamorfosis y El Presente como Regalo: bisagras y kit SÍ son
//     reales y coinciden con el texto de `dominio.ts`.
//   - El Nido Vacío y Propósito de Vida: sin bisagras en ninguno de los
//     dos lados. No hay nada que perder ahí.
//   - Encuentros: `dominio.ts` inventa seis, con grupos y moderadores
//     que no existen como filas reales (sus ids son literales como
//     'rodrigo' o 'anahuac'). La base real tiene UN encuentro, de verdad,
//     para El Presente como Regalo.
// Esta pantalla no rellena esos huecos con el texto del catálogo viejo:
// eso sería inventar una decisión de contenido que no es mía. Muestra lo
// que hay, honestamente, y donde no hay nada usa el mismo vacío que la
// pantalla ya sabía dibujar.

export interface ExperienciaResumen {
  id: string
  slug: string
  nombre: string
  subtitulo: string | null
  maduracion: string
  duracion: string | null
  abreEspacioAlGrupo: boolean
  bisagrasListas: number
  bisagrasTotal: number
  encuentros: number
}

function unaFila<T>(v: T[] | T | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v
}

// La versión que cuenta para un panorama administrativo: la publicada si
// existe: es lo que el catálogo ofrece hoy. Si no hay publicada, el
// borrador: es lo único que existe. Puede haber varias "retiradas": esas
// nunca son la respuesta aquí.
function versionRelevante(versiones: { id: string; estado: string }[]): string | null {
  return versiones.find(v => v.estado === 'publicada')?.id
    ?? versiones.find(v => v.estado === 'borrador')?.id
    ?? null
}

export async function listarExperiencias(): Promise<Resultado<ExperienciaResumen[]>> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { estado: 'sin-acceso' }

  const service = createServiceClient()

  const [expRes, versRes, runsRes] = await Promise.all([
    service.from('experiences')
      // La columna real sigue llamándose abre_espacio_al_foro hasta que corra
    // supabase/migrations/20260921_1900_foro_se_llama_grupo.sql -- el campo que
    // sale de aquí ya se llama como debe.
    .select('id, slug, nombre, subtitulo, maduracion, duracion, abre_espacio_al_foro')
      .order('nombre'),
    service.from('experience_versions').select('id, experience_id, estado'),
    service.from('runs').select('experience_id'),
  ])

  if (expRes.error) return { estado: 'fallo', motivo: expRes.error.message }
  if (versRes.error) return { estado: 'fallo', motivo: versRes.error.message }
  if (runsRes.error) return { estado: 'fallo', motivo: runsRes.error.message }

  const versionesPorExp = new Map<string, { id: string; estado: string }[]>()
  for (const v of versRes.data ?? []) {
    const lista = versionesPorExp.get(v.experience_id) ?? []
    lista.push({ id: v.id, estado: v.estado })
    versionesPorExp.set(v.experience_id, lista)
  }

  const versionIds = (expRes.data ?? [])
    .map(e => versionRelevante(versionesPorExp.get(e.id) ?? []))
    .filter((v): v is string => v !== null)

  const { data: hingesRes, error: errHinges } = versionIds.length
    ? await service.from('hinges').select('version_id, listo').in('version_id', versionIds)
    : { data: [], error: null }
  if (errHinges) return { estado: 'fallo', motivo: errHinges.message }

  const conteoPorVersion = new Map<string, { listas: number; total: number }>()
  for (const h of hingesRes ?? []) {
    const c = conteoPorVersion.get(h.version_id) ?? { listas: 0, total: 0 }
    c.total++
    if (h.listo) c.listas++
    conteoPorVersion.set(h.version_id, c)
  }

  const encuentrosPorExp = new Map<string, number>()
  for (const r of runsRes.data ?? []) {
    encuentrosPorExp.set(r.experience_id, (encuentrosPorExp.get(r.experience_id) ?? 0) + 1)
  }

  const experiencias: ExperienciaResumen[] = (expRes.data ?? []).map(e => {
    const versionId = versionRelevante(versionesPorExp.get(e.id) ?? [])
    const conteo = versionId ? conteoPorVersion.get(versionId) : undefined
    return {
      id: e.id,
      slug: e.slug,
      nombre: e.nombre,
      subtitulo: e.subtitulo,
      maduracion: e.maduracion,
      duracion: e.duracion,
      abreEspacioAlGrupo: e.abre_espacio_al_foro,
      bisagrasListas: conteo?.listas ?? 0,
      bisagrasTotal: conteo?.total ?? 0,
      encuentros: encuentrosPorExp.get(e.id) ?? 0,
    }
  })

  return { estado: 'ok', datos: experiencias }
}

export interface BisagraFicha {
  id: string
  tiempo: string
  orden: number
  titulo: string
  descripcion: string | null
  soporte: string
  duracion: string | null
  listo: boolean
  requiere: string[] | null
}

export interface PiezaKitFicha {
  id: string
  columna: string
  nombre: string
  detalle: string | null
  porPersona: boolean
  disponible: boolean
}

export interface EncuentroFicha {
  id: string
  grupoNombre: string
  moderadorNombre: string | null
  fecha: string | null
  estado: string
  personasEnElGrupo: number
  sede: string | null
}

export interface FichaExperiencia {
  id: string
  slug: string
  nombre: string
  subtitulo: string | null
  narrativa: string | null
  maduracion: string
  duracion: string | null
  abreEspacioAlGrupo: boolean
  notaDiseno: string | null
  bisagras: BisagraFicha[]
  kit: PiezaKitFicha[]
  encuentros: EncuentroFicha[]
}

export async function cargarFichaExperiencia(slug: string): Promise<Resultado<FichaExperiencia>> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { estado: 'sin-acceso' }

  const service = createServiceClient()

  const { data: exp, error: errExp } = await service
    .from('experiences')
    .select('id, slug, nombre, subtitulo, narrativa, duracion, maduracion, abre_espacio_al_foro, nota_diseno')
    .eq('slug', slug)
    .maybeSingle()

  if (errExp) return { estado: 'fallo', motivo: errExp.message }
  if (!exp) return { estado: 'sin-acceso' }

  const { data: versiones, error: errVers } = await service
    .from('experience_versions')
    .select('id, estado')
    .eq('experience_id', exp.id)
  if (errVers) return { estado: 'fallo', motivo: errVers.message }

  const versionId = versionRelevante(versiones ?? [])

  const [hingesRes, kitRes, runsRes] = await Promise.all([
    versionId
      ? service.from('hinges')
          .select('id, tiempo, orden, titulo, descripcion, soporte, duracion, listo, requiere')
          .eq('version_id', versionId)
          .order('tiempo').order('orden')
      : Promise.resolve({ data: [], error: null }),
    service.from('kit_pieces')
      .select('id, columna, nombre, detalle, por_persona, disponible')
      .eq('experience_id', exp.id),
    service.from('runs')
      // Misma nota: personas_en_el_foro es el nombre real de la columna hoy.
      .select('id, chapter_id, moderador_id, fecha, estado, personas_en_el_foro, sede')
      .eq('experience_id', exp.id)
      .order('fecha', { ascending: false }),
  ])

  if (hingesRes.error) return { estado: 'fallo', motivo: hingesRes.error.message }
  if (kitRes.error) return { estado: 'fallo', motivo: kitRes.error.message }
  if (runsRes.error) return { estado: 'fallo', motivo: runsRes.error.message }

  const chapterIds = Array.from(new Set((runsRes.data ?? []).map(r => r.chapter_id)))
  const moderadorIds = Array.from(new Set((runsRes.data ?? []).map(r => r.moderador_id)))

  const [chaptersRes, moderadoresRes] = await Promise.all([
    chapterIds.length
      ? service.from('chapters').select('id, nombre').in('id', chapterIds)
      : Promise.resolve({ data: [], error: null }),
    moderadorIds.length
      ? service.from('profiles').select('id, full_name, email').in('id', moderadorIds)
      : Promise.resolve({ data: [], error: null }),
  ])
  if (chaptersRes.error) return { estado: 'fallo', motivo: chaptersRes.error.message }
  if (moderadoresRes.error) return { estado: 'fallo', motivo: moderadoresRes.error.message }

  const grupoPorId = new Map((chaptersRes.data ?? []).map(c => [c.id, c.nombre]))
  const moderadorPorId = new Map((moderadoresRes.data ?? []).map(m => [m.id, m.full_name ?? m.email]))

  return {
    estado: 'ok',
    datos: {
      id: exp.id,
      slug: exp.slug,
      nombre: exp.nombre,
      subtitulo: exp.subtitulo,
      narrativa: exp.narrativa,
      maduracion: exp.maduracion,
      duracion: exp.duracion,
      abreEspacioAlGrupo: exp.abre_espacio_al_foro,
      notaDiseno: exp.nota_diseno,
      bisagras: (hingesRes.data ?? []) as BisagraFicha[],
      kit: (kitRes.data ?? []).map(k => ({
        id: k.id, columna: k.columna, nombre: k.nombre, detalle: k.detalle,
        porPersona: k.por_persona, disponible: k.disponible,
      })),
      encuentros: (runsRes.data ?? []).map(r => ({
        id: r.id,
        grupoNombre: grupoPorId.get(r.chapter_id) ?? '(grupo borrado)',
        moderadorNombre: moderadorPorId.get(r.moderador_id) ?? null,
        fecha: r.fecha,
        estado: r.estado,
        personasEnElGrupo: r.personas_en_el_foro,
        sede: r.sede,
      })),
    },
  }
}
