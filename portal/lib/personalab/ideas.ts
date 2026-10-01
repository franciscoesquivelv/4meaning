import { createServiceClient } from '@/lib/supabase/server'
import { exigirEquipo } from './medios'
import type { Resultado } from './lectura'

// Cuatro estados, no dos. Pedido de Francisco, 2026-10-01, al ver la
// sección recién construida: "qué me recomiendas... la veo muy básica."
// Una idea en progreso sigue viva; una descartada se decidió activamente
// no hacerla, no se perdió -- las dos son verdades distintas de "hecha",
// mismo espíritu que ya rige `docs/PENDIENTES.md`.
export type EstadoIdea = 'abierta' | 'en_progreso' | 'hecha' | 'descartada'

export interface Idea {
  id: string
  texto: string
  autor: string
  creadaEn: string
  estado: EstadoIdea
}

// El doble cast en `perfil` es por lo mismo que ya documenta
// `editorDatos.ts` para el embed de `media`: sin tipos generados desde el
// esquema, un embed a través de una FK se infiere como arreglo aunque en
// la base real `ideas.created_by -> profiles.id` es muchos-a-uno y
// siempre llega como un solo objeto (o null, si la cuenta que la escribió
// ya no existe).
export async function cargarIdeas(): Promise<Resultado<Idea[]>> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { estado: 'sin-acceso' }

  const service = createServiceClient()
  const { data, error } = await service
    .from('ideas')
    .select('id, texto, estado, created_at, profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (error) return { estado: 'fallo', motivo: error.message }

  const ideas: Idea[] = (data ?? []).map(fila => {
    const perfil = fila.profiles as unknown as { full_name: string | null; email: string } | null
    return {
      id: fila.id as string,
      texto: fila.texto as string,
      autor: perfil?.full_name ?? perfil?.email ?? 'Alguien del equipo',
      creadaEn: fila.created_at as string,
      estado: fila.estado as EstadoIdea,
    }
  })

  return { estado: 'ok', datos: ideas }
}
