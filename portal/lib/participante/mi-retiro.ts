import { estadoEntrega, type EstadoEntrega } from '@/lib/entregas'

// Los datos de la pantalla de entrada del participante, en un solo lugar.
//
// POR QUE ESTA AQUI Y NO DENTRO DE LA PAGINA. La misma pantalla la abren dos
// personas distintas: la pareja, resolviendo su familia desde la sesion, y el
// equipo, resolviendo una familia cualquiera desde el admin para poder ver lo
// que esa pareja ve. Si la carga vive dentro de la pagina del participante, la
// previa del equipo termina siendo una copia que se desincroniza, que es
// exactamente lo que ya paso con el preview de evento.

export type Evento = {
  id: string
  nombre: string
  ubicacion: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  ciudad: string | null
  nube_url: string | null
}

export type Aviso = { id: string; titulo: string; tipo: string }

export interface DatosMiRetiro {
  familia: { id: string; nombre_familia: string; event_id: string } | null
  evento: Evento | null
  storybook: EstadoEntrega | null
  video: EstadoEntrega | null
  acuerdosTotal: number
  acuerdosPendientes: number
  formularioEnviado: boolean
  avisos: Aviso[]
}

const VACIO: DatosMiRetiro = {
  familia: null,
  evento: null,
  storybook: null,
  video: null,
  acuerdosTotal: 0,
  acuerdosPendientes: 0,
  formularioEnviado: false,
  avisos: [],
}

type Cliente = {
  from: (t: string) => any // eslint-disable-line @typescript-eslint/no-explicit-any
}

// `filtro` decide de quien es la familia: por sesion en el lado del
// participante, por id en la previa del equipo.
export async function cargarMiRetiro(
  supabase: Cliente,
  filtro: { userId: string } | { familyId: string }
): Promise<DatosMiRetiro> {
  const base = supabase
    .from('families')
    .select('id, nombre_familia, event_id, storybook_status, video_status, events(id, nombre, ubicacion, fecha_inicio, fecha_fin, ciudad, nube_url)')

  const { data: family } = await ('userId' in filtro
    ? base.or(`user_id1.eq.${filtro.userId},user_id2.eq.${filtro.userId}`).limit(1).maybeSingle()
    : base.eq('id', filtro.familyId).maybeSingle())

  if (!family) return VACIO

  const evento = (family.events as Evento | null) ?? null

  const [{ data: acuerdos }, { data: formulario }, { data: avisos }] = await Promise.all([
    supabase.from('agreements').select('id, status').eq('family_id', family.id),
    supabase.from('intake_responses').select('id').eq('family_id', family.id).maybeSingle(),
    supabase
      .from('announcements')
      .select('id, titulo, tipo')
      .eq('event_id', family.event_id)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(2),
  ])

  return {
    familia: { id: family.id, nombre_familia: family.nombre_familia, event_id: family.event_id },
    evento,
    storybook: estadoEntrega(family.storybook_status),
    video: estadoEntrega(family.video_status),
    acuerdosTotal: acuerdos?.length ?? 0,
    acuerdosPendientes:
      acuerdos?.filter((a: { status: string }) => !['signed', 'approved'].includes(a.status)).length ?? 0,
    formularioEnviado: !!formulario,
    avisos: avisos ?? [],
  }
}

// ── Estado temporal del retiro ──────────────────────────────────

export type Tramo = 'huellas' | 'excavaciones' | 'tesoros' | 'legado'

export function diasHasta(fecha: string | null): number | null {
  if (!fecha) return null
  // Mediodía UTC para no cruzar el límite de día según la zona de quien mira.
  const objetivo = new Date(fecha + 'T12:00:00Z')
  const hoy = new Date()
  const a = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate())
  const b = Date.UTC(objetivo.getUTCFullYear(), objetivo.getUTCMonth(), objetivo.getUTCDate())
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24))
}

export function tramoDe(d: DatosMiRetiro): Tramo {
  const inicio = diasHasta(d.evento?.fecha_inicio ?? null)
  const fin = diasHasta(d.evento?.fecha_fin ?? null)
  if (fin !== null && fin < 0) {
    return d.storybook === 'entregado' && d.video === 'entregado' ? 'legado' : 'tesoros'
  }
  if (inicio !== null && fin !== null && inicio <= 0 && fin >= 0) return 'excavaciones'
  return 'huellas'
}
