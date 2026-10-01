import { createServiceClient } from '@/lib/supabase/server'
import { exigirEquipo } from './medios'
import type { Resultado } from './lectura'

export interface Idea {
  id: string
  texto: string
  autor: string
  creadaEn: string
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
    .select('id, texto, created_at, profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (error) return { estado: 'fallo', motivo: error.message }

  const ideas: Idea[] = (data ?? []).map(fila => {
    const perfil = fila.profiles as unknown as { full_name: string | null; email: string } | null
    return {
      id: fila.id as string,
      texto: fila.texto as string,
      autor: perfil?.full_name ?? perfil?.email ?? 'Alguien del equipo',
      creadaEn: fila.created_at as string,
    }
  })

  return { estado: 'ok', datos: ideas }
}
