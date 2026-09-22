import { createServiceClient } from '@/lib/supabase/server'
import { exigirEquipo } from './medios'
import type { Resultado } from './lectura'

// ── POSICIÓN, NO PROGRESO ────────────────────────────────────────────
//
// `bookmarks` lo dice por escrito desde que existe: "no es progreso: no
// hay porcentaje ni racha, y está prohibido agregarlos". Esta pantalla no
// inventa ninguno de los dos. Lo único que muestra es la ÚLTIMA BISAGRA
// que cada quien abrió y CUÁNDO — la misma pareja de columnas que ya tiene
// la tabla, ni una más. Quien compró y nunca abrió nada aparece como "Sin
// empezar", no como "0%".
//
// Etapa 6b, migración 20260916_1600_equipo_ve_posicion.sql: hasta esa
// migración, el equipo no tenía ninguna política de lectura sobre
// `bookmarks`. Esta pantalla usa el cliente de servicio (mismo patrón que
// `compras.ts`), así que funciona con o sin esa migración aplicada; la
// migración existe para que la política de la base diga la verdad sobre
// quién puede leer esto, no para que esta pantalla funcione.

export interface ExperienciaConGente {
  id: string
  nombre: string
  personas: number
}

export interface FilaPersona {
  profileId: string
  nombre: string | null
  email: string
  titularidad: string
  posicion: { titulo: string; tiempo: string; orden: number } | null
  vistoAt: string | null
}

export interface FilaAgregado {
  etiqueta: string
  tiempo: string | null
  orden: number
  cantidad: number
}

export interface DatosProgreso {
  experiencias: ExperienciaConGente[]
  experienciaId: string | null
  experienciaNombre: string | null
  porPersona: FilaPersona[]
  agregado: FilaAgregado[]
}

function unaFila<T>(v: T[] | T | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v
}

export async function cargarProgreso(experienciaPedida?: string): Promise<Resultado<DatosProgreso>> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { estado: 'sin-acceso' }

  const service = createServiceClient()

  // Un grant por experiencia basta para que aparezca en el selector, sin
  // importar la titularidad: moderador, grupo o cliente individual todos
  // tienen una posición (o no) que dar seguimiento.
  const { data: grantsFilas, error: errGrants } = await service
    .from('grants')
    .select('profile_id, experience_id, titularidad, experiences(nombre)')
    .is('revocado_at', null)

  if (errGrants) return { estado: 'fallo', motivo: errGrants.message }

  interface FilaGrantCruda {
    profile_id: string
    experience_id: string
    titularidad: string
    experiences: { nombre: string }[] | { nombre: string } | null
  }
  const grants = (grantsFilas ?? []) as unknown as FilaGrantCruda[]

  const porExperiencia = new Map<string, { nombre: string; personas: Set<string> }>()
  for (const g of grants) {
    const nombre = unaFila(g.experiences)?.nombre ?? '(experiencia borrada)'
    const entrada = porExperiencia.get(g.experience_id) ?? { nombre, personas: new Set<string>() }
    entrada.personas.add(g.profile_id)
    porExperiencia.set(g.experience_id, entrada)
  }

  const experiencias: ExperienciaConGente[] = Array.from(porExperiencia.entries())
    .map(([id, v]) => ({ id, nombre: v.nombre, personas: v.personas.size }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  const experienciaId = experienciaPedida && porExperiencia.has(experienciaPedida)
    ? experienciaPedida
    : experiencias[0]?.id ?? null

  if (!experienciaId) {
    return {
      estado: 'ok',
      datos: { experiencias, experienciaId: null, experienciaNombre: null, porPersona: [], agregado: [] },
    }
  }

  const gruposDeEsta = grants.filter(g => g.experience_id === experienciaId)

  const profileIds = Array.from(new Set(gruposDeEsta.map(g => g.profile_id)))
  const { data: perfiles, error: errPerfiles } = await service
    .from('profiles')
    .select('id, email, full_name')
    .in('id', profileIds)
  if (errPerfiles) return { estado: 'fallo', motivo: errPerfiles.message }
  const perfilPorId = new Map((perfiles ?? []).map(p => [p.id, p]))

  const { data: marcadores, error: errMarcadores } = await service
    .from('bookmarks')
    .select('profile_id, hinge_id, visto_at')
    .eq('experience_id', experienciaId)
    .in('profile_id', profileIds)
  if (errMarcadores) return { estado: 'fallo', motivo: errMarcadores.message }

  // Sin embed: `bookmarks` tiene dos relaciones distintas hacia `hinges`
  // (una compuesta, por experiencia+bisagra, y la FK simple), y PostgREST
  // rechaza el embed directo por ambigüedad — el mismo defecto que ya
  // apareció al construir Compras con `grants`↔`profiles`. Se resuelve
  // igual: dos consultas, cruzadas a mano.
  const hingeIds = Array.from(new Set((marcadores ?? []).map(m => m.hinge_id)))
  const { data: hinges, error: errHinges } = hingeIds.length
    ? await service.from('hinges').select('id, titulo, tiempo, orden').in('id', hingeIds)
    : { data: [], error: null }
  if (errHinges) return { estado: 'fallo', motivo: errHinges.message }
  const hingePorId = new Map((hinges ?? []).map(h => [h.id, h]))

  const marcadorPorPersona = new Map((marcadores ?? []).map(m => [m.profile_id, m]))

  const porPersona: FilaPersona[] = gruposDeEsta.map(g => {
    const perfil = perfilPorId.get(g.profile_id)
    const marcador = marcadorPorPersona.get(g.profile_id)
    const hinge = marcador ? hingePorId.get(marcador.hinge_id) : undefined
    return {
      profileId: g.profile_id,
      nombre: perfil?.full_name ?? null,
      email: perfil?.email ?? '(cuenta borrada)',
      titularidad: g.titularidad,
      posicion: hinge ? { titulo: hinge.titulo, tiempo: hinge.tiempo, orden: hinge.orden } : null,
      vistoAt: marcador?.visto_at ?? null,
    }
  })

  const ORDEN_TIEMPO: Record<string, number> = { vispera: 0, ignicion: 1, retorno: 2 }
  porPersona.sort((a, b) => {
    if (!a.posicion && !b.posicion) return (a.nombre ?? a.email).localeCompare(b.nombre ?? b.email)
    if (!a.posicion) return 1
    if (!b.posicion) return -1
    const t = (ORDEN_TIEMPO[a.posicion.tiempo] ?? 9) - (ORDEN_TIEMPO[b.posicion.tiempo] ?? 9)
    return t !== 0 ? t : a.posicion.orden - b.posicion.orden
  })

  const agregadoMapa = new Map<string, FilaAgregado>()
  let sinEmpezar = 0
  for (const p of porPersona) {
    if (!p.posicion) { sinEmpezar++; continue }
    const clave = `${p.posicion.tiempo}:${p.posicion.orden}:${p.posicion.titulo}`
    const existente = agregadoMapa.get(clave)
    if (existente) existente.cantidad++
    else agregadoMapa.set(clave, {
      etiqueta: p.posicion.titulo,
      tiempo: p.posicion.tiempo,
      orden: p.posicion.orden,
      cantidad: 1,
    })
  }
  const agregado = Array.from(agregadoMapa.values()).sort((a, b) => {
    const t = (ORDEN_TIEMPO[a.tiempo ?? ''] ?? 9) - (ORDEN_TIEMPO[b.tiempo ?? ''] ?? 9)
    return t !== 0 ? t : a.orden - b.orden
  })
  if (sinEmpezar > 0) {
    agregado.push({ etiqueta: 'Sin empezar', tiempo: null, orden: 999, cantidad: sinEmpezar })
  }

  return {
    estado: 'ok',
    datos: {
      experiencias,
      experienciaId,
      experienciaNombre: porExperiencia.get(experienciaId)?.nombre ?? null,
      porPersona,
      agregado,
    },
  }
}
