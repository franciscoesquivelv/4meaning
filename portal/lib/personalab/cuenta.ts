import { createClient } from '@/lib/supabase/server'
import type { Resultado } from './lectura'

// ── LA CUENTA DEL CLIENTE ────────────────────────────────────────
//
// Lo que ve un cliente de PersonaLab sobre sí mismo: qué compró y quién es.
//
// El mismo principio que en la lectura: la RLS decide qué grants existen
// para este usuario, no una condición escrita aquí. `grants` solo deja leer
// la fila propia (`profile_id = auth.uid()`), y `experiences` solo se ve si
// hay un grant vivo que la cubra. Verificado contra la política, no supuesto.

export interface MiExperiencia {
  slug: string
  nombre: string
  subtitulo: string | null
  duracion: string | null
  otorgadoAt: string
}

export async function misExperiencias(): Promise<Resultado<MiExperiencia[]>> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('grants')
    .select('otorgado_at, experiences(slug, nombre, subtitulo, duracion)')
    .is('revocado_at', null)
    .order('otorgado_at', { ascending: false })

  if (error) return { estado: 'fallo', motivo: error.message }

  interface Fila {
    otorgado_at: string
    // Supabase tipa la relación embebida como arreglo cuando no conoce la FK
    // por los tipos generados; aquí es siempre 0 o 1 fila.
    experiences: { slug: string; nombre: string; subtitulo: string | null; duracion: string | null }[] | { slug: string; nombre: string; subtitulo: string | null; duracion: string | null } | null
  }

  const lista: MiExperiencia[] = (data as unknown as Fila[] ?? [])
    .map(g => ({
      exp: Array.isArray(g.experiences) ? g.experiences[0] : g.experiences,
      otorgadoAt: g.otorgado_at,
    }))
    // El join puede venir vacío si el grant apunta a algo que ya no existe.
    // Se descarta en silencio: no es un fallo, es una fila huérfana.
    .filter((g): g is { exp: NonNullable<typeof g.exp>; otorgadoAt: string } => !!g.exp)
    .map(g => ({
      slug: g.exp.slug,
      nombre: g.exp.nombre,
      subtitulo: g.exp.subtitulo,
      duracion: g.exp.duracion,
      otorgadoAt: g.otorgadoAt,
    }))

  return { estado: 'ok', datos: lista }
}

export interface MiCuenta {
  email: string
  nombre: string | null
}

export async function miCuenta(): Promise<Resultado<MiCuenta>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { estado: 'sin-acceso' }

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (error) return { estado: 'fallo', motivo: error.message }

  return {
    estado: 'ok',
    datos: { email: user.email ?? '', nombre: data?.full_name ?? null },
  }
}
