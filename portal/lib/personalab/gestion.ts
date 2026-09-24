import { createServiceClient } from '@/lib/supabase/server'
import { exigirEquipo } from './medios'
import type { Resultado } from './lectura'

// ── LA GESTIÓN DE PERSONALAB, DESDE LA BASE REAL ────────────────────────
//
// HASTA HOY, "Resumen", "Grupos", "Moderadores", "Encuentros" y "Retorno"
// leían enteros de `dominio.ts`: `GRUPOS`, `MODERADORES`, `ENCUENTROS` son
// arreglos escritos a mano, nunca conectados a `chapters`/`runs`/
// `chapter_moderators`. Los enlaces lo delataban -- llevaban a
// `/personalab/encuentros/c1`, no a un UUID real. Encontrado el
// 2026-09-24 porque Francisco pidió limpiar los datos de prueba de la
// base y, después de borrarlos, las pantallas seguían mostrando "Grupo
// Anáhuac" y "Rodrigo Lemus": no podían haber cambiado, porque nunca
// leyeron la base para empezar.
//
// Mismo patrón que ya prueban `compras.ts` y `catalogo.ts`:
// `exigirEquipo()` primero, `createServiceClient()` después (esto es
// EQUIPO viendo todo el negocio, no un participante viendo lo suyo), y
// `Resultado<T>` como forma de salida.
//
// LOS TRES DESAJUSTES QUE dominio.ts TENÍA CONTRA EL ENUM REAL, y que
// esta reescritura corrige en vez de heredar:
//   - `runs.estado` real es 'prospecto'|'confirmada'|'en_preparacion'|
//     'corrida'|'cancelada'. El mock decía 'confirmado'/'realizado'/
//     'cancelado' -- ya no existen como valores reales.
//   - `chapter_moderators` es TABLA N:N (un grupo puede tener varios
//     moderadores, un moderador varios grupos). El mock modelaba
//     `Moderador.grupoId` como uno solo. Aquí se listan todos.
//   - "Mes de retorno" no es un campo del encuentro: es el mes más alto
//     con un toque REAL registrado en `returns.mes` (con `occurred_at`
//     no nulo) para ese encuentro. Hoy `returns` está vacía, así que
//     todo el módulo de Retorno sale honesto: "nada en curso todavía",
//     no un número inventado.

function unaFila<T>(v: T[] | T | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v
}

function nombrePerfil(p: { full_name: string | null; email: string } | null): string {
  if (!p) return '(cuenta borrada)'
  return p.full_name ?? p.email
}

// La versión que cuenta para un panorama administrativo: la publicada si
// existe, si no el borrador. Mismo criterio que `catalogo.ts`, copiado a
// propósito en vez de importado -- ver la nota en `cargarHuecos` abajo.
function versionRelevante(versiones: { id: string; estado: string }[]): string | null {
  return versiones.find(v => v.estado === 'publicada')?.id
    ?? versiones.find(v => v.estado === 'borrador')?.id
    ?? null
}

// ── Tipos compartidos entre pantallas ────────────────────────────

export interface RunResuelto {
  id: string
  experienciaId: string
  experienciaNombre: string
  experienciaSlug: string
  grupoId: string
  grupoNombre: string
  moderadorId: string
  moderadorNombre: string
  fecha: string | null
  estado: string
  personasEnElGrupo: number
  sede: string | null
  notas: string | null
  pendientes: number
  totalChecklist: number
  mesDeRetorno: number | null
}

// Carga todos los runs con nombre de experiencia/grupo/moderador ya
// resueltos, y el conteo de checklist pendiente. Es la base que
// Resumen, Grupos, Moderadores, Encuentros y Retorno reusan -- una sola
// consulta ancha en vez de repetirla cinco veces con formas distintas.
async function cargarRunsResueltos(service: ReturnType<typeof createServiceClient>): Promise<
  { datos: RunResuelto[] } | { error: string }
> {
  const [runsRes, checklistRes, returnsRes] = await Promise.all([
    service
      .from('runs')
      .select('id, experience_id, chapter_id, moderador_id, fecha, estado, personas_en_el_grupo, sede, notas, experiences(nombre, slug), chapters(nombre), profiles!moderador_id(full_name, email)')
      .order('fecha', { ascending: true }),
    service.from('run_checklist').select('run_id, hecho'),
    service.from('returns').select('run_id, mes, occurred_at'),
  ])

  if (runsRes.error) return { error: runsRes.error.message }
  if (checklistRes.error) return { error: checklistRes.error.message }
  if (returnsRes.error) return { error: returnsRes.error.message }

  const checklistPorRun = new Map<string, { pendientes: number; total: number }>()
  for (const c of checklistRes.data ?? []) {
    const acc = checklistPorRun.get(c.run_id) ?? { pendientes: 0, total: 0 }
    acc.total++
    if (!c.hecho) acc.pendientes++
    checklistPorRun.set(c.run_id, acc)
  }

  const mesMaxPorRun = new Map<string, number>()
  for (const r of returnsRes.data ?? []) {
    if (!r.occurred_at) continue
    mesMaxPorRun.set(r.run_id, Math.max(mesMaxPorRun.get(r.run_id) ?? 0, r.mes))
  }

  interface FilaRunCruda {
    id: string
    experience_id: string
    chapter_id: string
    moderador_id: string
    fecha: string | null
    estado: string
    personas_en_el_grupo: number
    sede: string | null
    notas: string | null
    experiences: { nombre: string; slug: string }[] | { nombre: string; slug: string } | null
    chapters: { nombre: string }[] | { nombre: string } | null
    profiles: { full_name: string | null; email: string }[] | { full_name: string | null; email: string } | null
  }

  const datos: RunResuelto[] = ((runsRes.data ?? []) as unknown as FilaRunCruda[]).map(r => {
    const exp = unaFila(r.experiences)
    const grp = unaFila(r.chapters)
    const mod = unaFila(r.profiles)
    const check = checklistPorRun.get(r.id) ?? { pendientes: 0, total: 0 }
    return {
      id: r.id,
      experienciaId: r.experience_id,
      experienciaNombre: exp?.nombre ?? '(experiencia borrada)',
      experienciaSlug: exp?.slug ?? '',
      grupoId: r.chapter_id,
      grupoNombre: grp?.nombre ?? '(grupo borrado)',
      moderadorId: r.moderador_id,
      moderadorNombre: nombrePerfil(mod),
      fecha: r.fecha,
      estado: r.estado,
      personasEnElGrupo: r.personas_en_el_grupo,
      sede: r.sede,
      notas: r.notas,
      pendientes: check.pendientes,
      totalChecklist: check.total,
      mesDeRetorno: mesMaxPorRun.get(r.id) ?? null,
    }
  })

  return { datos }
}

// ── Resumen ─────────────────────────────────────────────────────

export interface HuecoCatalogo {
  experienciaId: string
  experienciaSlug: string
  experienciaNombre: string
  bisagrasFaltantes: string[]
  sinDiseño: boolean
}

export interface CatalogoFila {
  id: string
  slug: string
  nombre: string
  maduracion: string
  bisagrasListas: number
  bisagrasTotal: number
  encuentros: number
}

export interface DatosResumen {
  encuentrosPorDelante: number
  gruposTotal: number
  moderadoresTotal: number
  personasEnRetorno: number
  proximos: RunResuelto[]
  huecos: HuecoCatalogo[]
  catalogo: CatalogoFila[]
  enRetorno: RunResuelto[]
}

export async function cargarResumen(): Promise<Resultado<DatosResumen>> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { estado: 'sin-acceso' }

  const service = createServiceClient()

  const [runsR, chaptersRes, cmRes, expRes, versRes] = await Promise.all([
    cargarRunsResueltos(service),
    service.from('chapters').select('id', { count: 'exact', head: true }),
    service.from('chapter_moderators').select('profile_id'),
    service.from('experiences').select('id, slug, nombre, maduracion'),
    service.from('experience_versions').select('id, experience_id, estado'),
  ])

  if ('error' in runsR) return { estado: 'fallo', motivo: runsR.error }
  if (chaptersRes.error) return { estado: 'fallo', motivo: chaptersRes.error.message }
  if (cmRes.error) return { estado: 'fallo', motivo: cmRes.error.message }
  if (expRes.error) return { estado: 'fallo', motivo: expRes.error.message }
  if (versRes.error) return { estado: 'fallo', motivo: versRes.error.message }

  const runs = runsR.datos
  const activos = runs.filter(r => ['confirmada', 'en_preparacion'].includes(r.estado))
  const proximos = [...activos].sort((a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? ''))
  const enRetorno = runs.filter(r => r.estado === 'corrida' && (r.mesDeRetorno ?? 0) < 6)
  const personasEnRetorno = enRetorno.reduce((s, r) => s + r.personasEnElGrupo, 0)
  const moderadoresTotal = new Set((cmRes.data ?? []).map(m => m.profile_id)).size

  const versionesPorExp = new Map<string, { id: string; estado: string }[]>()
  for (const v of versRes.data ?? []) {
    const lista = versionesPorExp.get(v.experience_id) ?? []
    lista.push({ id: v.id, estado: v.estado })
    versionesPorExp.set(v.experience_id, lista)
  }
  const versionIds = (expRes.data ?? [])
    .map(e => versionRelevante(versionesPorExp.get(e.id) ?? []))
    .filter((v): v is string => v !== null)

  const { data: hingesData, error: errHinges } = versionIds.length
    ? await service.from('hinges').select('version_id, titulo, listo').in('version_id', versionIds)
    : { data: [], error: null }
  if (errHinges) return { estado: 'fallo', motivo: errHinges.message }

  const hingesPorVersion = new Map<string, { titulo: string; listo: boolean }[]>()
  for (const h of hingesData ?? []) {
    const l = hingesPorVersion.get(h.version_id) ?? []
    l.push({ titulo: h.titulo, listo: h.listo })
    hingesPorVersion.set(h.version_id, l)
  }

  const encuentrosPorExp = new Map<string, number>()
  for (const r of runs) encuentrosPorExp.set(r.experienciaId, (encuentrosPorExp.get(r.experienciaId) ?? 0) + 1)

  const catalogo: CatalogoFila[] = (expRes.data ?? []).map(e => {
    const versionId = versionRelevante(versionesPorExp.get(e.id) ?? [])
    const bisagras = versionId ? (hingesPorVersion.get(versionId) ?? []) : []
    return {
      id: e.id,
      slug: e.slug,
      nombre: e.nombre,
      maduracion: e.maduracion,
      bisagrasListas: bisagras.filter(b => b.listo).length,
      bisagrasTotal: bisagras.length,
      encuentros: encuentrosPorExp.get(e.id) ?? 0,
    }
  })

  const huecos: HuecoCatalogo[] = (expRes.data ?? [])
    .map(e => {
      const versionId = versionRelevante(versionesPorExp.get(e.id) ?? [])
      const bisagras = versionId ? (hingesPorVersion.get(versionId) ?? []) : []
      return {
        experienciaId: e.id,
        experienciaSlug: e.slug,
        experienciaNombre: e.nombre,
        bisagrasFaltantes: bisagras.filter(b => !b.listo).map(b => b.titulo),
        sinDiseño: bisagras.length === 0,
      }
    })
    .filter(h => h.bisagrasFaltantes.length > 0 || h.sinDiseño)

  return {
    estado: 'ok',
    datos: {
      encuentrosPorDelante: activos.length,
      gruposTotal: chaptersRes.count ?? 0,
      moderadoresTotal,
      personasEnRetorno,
      proximos,
      huecos,
      catalogo,
      enRetorno,
    },
  }
}

// ── Grupos ──────────────────────────────────────────────────────

export interface GrupoFila {
  id: string
  nombre: string
  ciudad: string | null
  pais: string | null
  moderadores: { id: string; nombre: string }[]
  realizados: number
  siguiente: RunResuelto | null
}

export async function cargarGrupos(): Promise<Resultado<GrupoFila[]>> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { estado: 'sin-acceso' }

  const service = createServiceClient()

  const [chaptersRes, cmRes, runsR] = await Promise.all([
    service.from('chapters').select('id, nombre, ciudad, pais').order('nombre'),
    service.from('chapter_moderators').select('chapter_id, profiles!profile_id(id, full_name, email)'),
    cargarRunsResueltos(service),
  ])

  if (chaptersRes.error) return { estado: 'fallo', motivo: chaptersRes.error.message }
  if (cmRes.error) return { estado: 'fallo', motivo: cmRes.error.message }
  if ('error' in runsR) return { estado: 'fallo', motivo: runsR.error }

  interface FilaCMCruda {
    chapter_id: string
    profiles: { id: string; full_name: string | null; email: string }[] | { id: string; full_name: string | null; email: string } | null
  }
  const moderadoresPorGrupo = new Map<string, { id: string; nombre: string }[]>()
  for (const cm of (cmRes.data ?? []) as unknown as FilaCMCruda[]) {
    const p = unaFila(cm.profiles)
    if (!p) continue
    const lista = moderadoresPorGrupo.get(cm.chapter_id) ?? []
    lista.push({ id: p.id, nombre: nombrePerfil(p) })
    moderadoresPorGrupo.set(cm.chapter_id, lista)
  }

  const datos: GrupoFila[] = (chaptersRes.data ?? []).map(c => {
    const suyos = runsR.datos.filter(r => r.grupoId === c.id)
    const realizados = suyos.filter(r => r.estado === 'corrida')
    const siguiente = suyos
      .filter(r => ['prospecto', 'confirmada', 'en_preparacion'].includes(r.estado))
      .sort((a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? ''))[0] ?? null
    return {
      id: c.id,
      nombre: c.nombre,
      ciudad: c.ciudad,
      pais: c.pais,
      moderadores: moderadoresPorGrupo.get(c.id) ?? [],
      realizados: realizados.length,
      siguiente,
    }
  })

  return { estado: 'ok', datos }
}

// ── Moderadores ─────────────────────────────────────────────────

export interface ModeradorFila {
  id: string
  nombre: string
  email: string
  grupos: { id: string; nombre: string }[]
  formadoEn: { experienciaId: string; experienciaSlug: string; experienciaNombre: string }[]
  encuentros: number
  desde: string
}

export async function cargarModeradores(): Promise<Resultado<ModeradorFila[]>> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { estado: 'sin-acceso' }

  const service = createServiceClient()

  const [cmRes, trainingRes, runsR] = await Promise.all([
    service.from('chapter_moderators').select('profile_id, desde, chapters(id, nombre), profiles!profile_id(id, full_name, email)'),
    service.from('moderator_training').select('profile_id, experiences(id, slug, nombre)'),
    cargarRunsResueltos(service),
  ])

  if (cmRes.error) return { estado: 'fallo', motivo: cmRes.error.message }
  if (trainingRes.error) return { estado: 'fallo', motivo: trainingRes.error.message }
  if ('error' in runsR) return { estado: 'fallo', motivo: runsR.error }

  interface FilaCMCruda {
    profile_id: string
    desde: string
    chapters: { id: string; nombre: string }[] | { id: string; nombre: string } | null
    profiles: { id: string; full_name: string | null; email: string }[] | { id: string; full_name: string | null; email: string } | null
  }
  interface FilaTrainingCruda {
    profile_id: string
    experiences: { id: string; slug: string; nombre: string }[] | { id: string; slug: string; nombre: string } | null
  }

  const porPerfil = new Map<string, ModeradorFila>()

  for (const cm of (cmRes.data ?? []) as unknown as FilaCMCruda[]) {
    const p = unaFila(cm.profiles)
    const grp = unaFila(cm.chapters)
    if (!p) continue
    const existente = porPerfil.get(p.id)
    if (existente) {
      if (grp) existente.grupos.push({ id: grp.id, nombre: grp.nombre })
      if (cm.desde < existente.desde) existente.desde = cm.desde
    } else {
      porPerfil.set(p.id, {
        id: p.id,
        nombre: nombrePerfil(p),
        email: p.email,
        grupos: grp ? [{ id: grp.id, nombre: grp.nombre }] : [],
        formadoEn: [],
        encuentros: 0,
        desde: cm.desde,
      })
    }
  }

  for (const t of (trainingRes.data ?? []) as unknown as FilaTrainingCruda[]) {
    const m = porPerfil.get(t.profile_id)
    const e = unaFila(t.experiences)
    if (!m || !e) continue
    m.formadoEn.push({ experienciaId: e.id, experienciaSlug: e.slug, experienciaNombre: e.nombre })
  }

  for (const r of runsR.datos) {
    const m = porPerfil.get(r.moderadorId)
    if (m) m.encuentros++
  }

  const datos = Array.from(porPerfil.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
  return { estado: 'ok', datos }
}

// ── Encuentros ──────────────────────────────────────────────────

export async function cargarEncuentros(): Promise<Resultado<RunResuelto[]>> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { estado: 'sin-acceso' }
  const service = createServiceClient()
  const r = await cargarRunsResueltos(service)
  if ('error' in r) return { estado: 'fallo', motivo: r.error }
  return { estado: 'ok', datos: r.datos }
}

export interface ItemChecklist {
  id: string
  fase: string | null
  titulo: string
  hecho: boolean
}

export interface BisagraGuion {
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

export interface IntegranteGrupo {
  profileId: string
  nombre: string
}

export interface DatosEncuentro extends RunResuelto {
  checklist: ItemChecklist[]
  guion: BisagraGuion[]
  vispera: BisagraGuion[]
  moderadorFormado: boolean
  integrantes: IntegranteGrupo[]
  abreEspacioAlGrupo: boolean
}

export async function cargarEncuentro(id: string): Promise<Resultado<DatosEncuentro>> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { estado: 'sin-acceso' }
  const service = createServiceClient()

  const { data: run, error: errRun } = await service
    .from('runs')
    .select('id, experience_id, version_id, chapter_id, moderador_id, fecha, estado, personas_en_el_grupo, sede, notas, experiences(nombre, slug, abre_espacio_al_grupo), chapters(nombre), profiles!moderador_id(full_name, email)')
    .eq('id', id)
    .maybeSingle()
  if (errRun) return { estado: 'fallo', motivo: errRun.message }
  if (!run) return { estado: 'sin-acceso' }

  interface FilaRunCruda {
    id: string
    experience_id: string
    version_id: string | null
    chapter_id: string
    moderador_id: string
    fecha: string | null
    estado: string
    personas_en_el_grupo: number
    sede: string | null
    notas: string | null
    experiences: { nombre: string; slug: string; abre_espacio_al_grupo: boolean }[] | { nombre: string; slug: string; abre_espacio_al_grupo: boolean } | null
    chapters: { nombre: string }[] | { nombre: string } | null
    profiles: { full_name: string | null; email: string }[] | { full_name: string | null; email: string } | null
  }
  const f = run as unknown as FilaRunCruda
  const exp = unaFila(f.experiences)
  const grp = unaFila(f.chapters)
  const mod = unaFila(f.profiles)

  // El guion de sala se ancla a la MISMA versión que este encuentro corrió
  // (`runs.version_id`), no a la versión relevante de hoy: lo que el
  // moderador condujo ese día no cambia si la experiencia se rediseña
  // después. Si el encuentro es un prospecto sin versión asignada
  // todavía, cae a la versión relevante actual como mejor estimado.
  let versionId = f.version_id
  if (!versionId) {
    const { data: versiones } = await service
      .from('experience_versions').select('id, estado').eq('experience_id', f.experience_id)
    versionId = versionRelevante(versiones ?? [])
  }

  const [checklistRes, hingesRes, trainingRes, integrantesRes, returnsRes] = await Promise.all([
    service.from('run_checklist').select('id, fase, titulo, hecho, orden').eq('run_id', id).order('orden'),
    versionId
      ? service.from('hinges').select('id, tiempo, orden, titulo, descripcion, soporte, duracion, listo, requiere').eq('version_id', versionId).order('orden')
      : Promise.resolve({ data: [], error: null }),
    service.from('moderator_training').select('profile_id').eq('experience_id', f.experience_id).eq('profile_id', f.moderador_id),
    service.from('grants').select('profile_id, profiles!profile_id(full_name, email)').eq('run_id', id).eq('titularidad', 'miembro_foro').is('revocado_at', null),
    service.from('returns').select('mes, occurred_at').eq('run_id', id),
  ])
  if (checklistRes.error) return { estado: 'fallo', motivo: checklistRes.error.message }
  if (hingesRes.error) return { estado: 'fallo', motivo: hingesRes.error.message }
  if (trainingRes.error) return { estado: 'fallo', motivo: trainingRes.error.message }
  if (integrantesRes.error) return { estado: 'fallo', motivo: integrantesRes.error.message }
  if (returnsRes.error) return { estado: 'fallo', motivo: returnsRes.error.message }

  const bisagras = (hingesRes.data ?? []) as BisagraGuion[]
  const checklist = (checklistRes.data ?? []) as ItemChecklist[]

  interface FilaIntegranteCruda {
    profile_id: string
    profiles: { full_name: string | null; email: string }[] | { full_name: string | null; email: string } | null
  }
  const integrantes: IntegranteGrupo[] = ((integrantesRes.data ?? []) as unknown as FilaIntegranteCruda[])
    .map(i => ({ profileId: i.profile_id, nombre: nombrePerfil(unaFila(i.profiles)) }))

  const mesDeRetorno = (returnsRes.data ?? [])
    .filter(r => r.occurred_at)
    .reduce((max, r) => Math.max(max, r.mes), 0) || null

  return {
    estado: 'ok',
    datos: {
      id: f.id,
      experienciaId: f.experience_id,
      experienciaNombre: exp?.nombre ?? '(experiencia borrada)',
      experienciaSlug: exp?.slug ?? '',
      grupoId: f.chapter_id,
      grupoNombre: grp?.nombre ?? '(grupo borrado)',
      moderadorId: f.moderador_id,
      moderadorNombre: nombrePerfil(mod),
      fecha: f.fecha,
      estado: f.estado,
      personasEnElGrupo: f.personas_en_el_grupo,
      sede: f.sede,
      notas: f.notas,
      pendientes: checklist.filter(c => !c.hecho).length,
      totalChecklist: checklist.length,
      mesDeRetorno,
      checklist,
      guion: bisagras.filter(b => b.tiempo === 'ignicion').sort((a, b) => a.orden - b.orden),
      vispera: bisagras.filter(b => b.tiempo === 'vispera').sort((a, b) => a.orden - b.orden),
      moderadorFormado: (trainingRes.data ?? []).length > 0,
      integrantes,
      abreEspacioAlGrupo: exp?.abre_espacio_al_grupo ?? false,
    },
  }
}

// ── Retorno ─────────────────────────────────────────────────────

export async function cargarRetorno(): Promise<Resultado<RunResuelto[]>> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { estado: 'sin-acceso' }
  const service = createServiceClient()
  const r = await cargarRunsResueltos(service)
  if ('error' in r) return { estado: 'fallo', motivo: r.error }
  const enCurso = r.datos
    .filter(run => run.estado === 'corrida' && (run.mesDeRetorno ?? 0) < 6)
    .sort((a, b) => (b.mesDeRetorno ?? 0) - (a.mesDeRetorno ?? 0))
  return { estado: 'ok', datos: enCurso }
}
