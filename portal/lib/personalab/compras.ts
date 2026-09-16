import { createServiceClient } from '@/lib/supabase/server'
import { exigirEquipo } from './medios'
import type { Resultado } from './lectura'

// ── LO QUE EL EQUIPO NECESITA VER PARA VENDER SIN GATEWAY ───────────────
//
// `purchases` y `grants` ya existían (Etapa "modo digital", 2026-09-11) con
// su RLS de equipo puesta desde el día uno: la política "pl equipo
// gestiona" les da acceso total a quien sea staff/admin/super_admin, la
// misma que ya usan todas las demás tablas de PersonaLab. Lo que faltaba no
// era permiso, era pantalla: nada en el código leía `purchases` todavía, y
// nada convertía una compra en una cuenta con acceso. Confirmado leyendo la
// migración antes de escribir una sola línea aquí, no asumido.
//
// Por qué con `createServiceClient()` y no con el cliente de sesión, como
// `lectura.ts`/`cuenta.ts`: esas dos son PARTICIPANTE leyendo lo suyo, y ahí
// la RLS por audiencia tiene que decidir exactamente qué ve cada cual. Esta
// pantalla es EQUIPO viendo todo el negocio; el mismo patrón que ya usan las
// rutas de `medios.ts` (`exigirEquipo()` primero, cliente de servicio
// después) es el que aplica aquí.

export interface CompraFila {
  id: string
  email: string
  experienciaId: string
  experienciaNombre: string
  montoCentavos: number
  moneda: string
  proveedor: string
  referencia: string
  pagadoAt: string
  canjeadoAt: string | null
}

export interface AccesoFila {
  grantId: string
  profileId: string
  email: string
  nombre: string | null
  experienciaNombre: string
  otorgadoAt: string
}

export interface ExperienciaOpcion {
  id: string
  nombre: string
}

export interface DatosCompras {
  compras: CompraFila[]
  accesos: AccesoFila[]
  experiencias: ExperienciaOpcion[]
}

// Los embeds (`experiences(nombre)`, `profiles(...)`) se infieren como
// arreglo porque el cliente sin tipos generados no conoce la FK real. En la
// base siempre es 0 o 1 fila, igual que en `lectura.ts`/`editorDatos.ts`.
function unaFila<T>(v: T[] | T | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v
}

export async function cargarCompras(): Promise<Resultado<DatosCompras>> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { estado: 'sin-acceso' }

  const service = createServiceClient()

  const [comprasRes, grantsRes, expRes] = await Promise.all([
    service
      .from('purchases')
      .select('id, email, experience_id, monto_centavos, moneda, proveedor, referencia, pagado_at, canjeado_at, experiences(nombre)')
      .order('pagado_at', { ascending: false }),
    service
      // `grants` tiene DOS columnas que apuntan a `profiles` (`profile_id` y
      // `otorgado_por`), así que el embed simple `profiles(...)` es
      // ambiguo: PostgREST no sabe cuál usar y lo rechaza en vez de
      // adivinar. Confirmado en vivo, no en la documentación: la consulta
      // sin el hint falló con "more than one relationship was found for
      // 'grants' and 'profiles'" la primera vez que esta pantalla se probó
      // contra la base real. `!profile_id` le dice por cuál columna ir.
      .from('grants')
      .select('id, profile_id, otorgado_at, profiles!profile_id(email, full_name), experiences(nombre)')
      .eq('titularidad', 'individual')
      .is('revocado_at', null)
      .order('otorgado_at', { ascending: false }),
    service.from('experiences').select('id, nombre').order('nombre'),
  ])

  if (comprasRes.error) return { estado: 'fallo', motivo: comprasRes.error.message }
  if (grantsRes.error) return { estado: 'fallo', motivo: grantsRes.error.message }
  if (expRes.error) return { estado: 'fallo', motivo: expRes.error.message }

  interface FilaCompraCruda {
    id: string
    email: string
    experience_id: string
    monto_centavos: number
    moneda: string
    proveedor: string
    referencia: string
    pagado_at: string
    canjeado_at: string | null
    experiences: { nombre: string }[] | { nombre: string } | null
  }

  const compras: CompraFila[] = ((comprasRes.data ?? []) as unknown as FilaCompraCruda[])
    .map(f => ({
      id: f.id,
      email: f.email,
      experienciaId: f.experience_id,
      experienciaNombre: unaFila(f.experiences)?.nombre ?? '(experiencia borrada)',
      montoCentavos: f.monto_centavos,
      moneda: f.moneda,
      proveedor: f.proveedor,
      referencia: f.referencia,
      pagadoAt: f.pagado_at,
      canjeadoAt: f.canjeado_at,
    }))

  interface FilaGrantCruda {
    id: string
    profile_id: string
    otorgado_at: string
    profiles: { email: string; full_name: string | null }[] | { email: string; full_name: string | null } | null
    experiences: { nombre: string }[] | { nombre: string } | null
  }

  const accesos: AccesoFila[] = ((grantsRes.data ?? []) as unknown as FilaGrantCruda[])
    .map(f => {
      const perfil = unaFila(f.profiles)
      return {
        grantId: f.id,
        profileId: f.profile_id,
        email: perfil?.email ?? '(cuenta borrada)',
        nombre: perfil?.full_name ?? null,
        experienciaNombre: unaFila(f.experiences)?.nombre ?? '(experiencia borrada)',
        otorgadoAt: f.otorgado_at,
      }
    })

  return {
    estado: 'ok',
    datos: { compras, accesos, experiencias: expRes.data ?? [] },
  }
}
