'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleContentBlock(
  blockId: string,
  activo: boolean,
  eventId: string,
): Promise<{ error: string } | void> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('event_content_blocks')
      .update({
        activo,
        activado_at: activo ? new Date().toISOString() : null,
      })
      .eq('id', blockId)
    if (error) return { error: error.message }
    revalidatePath(`/eventos/${eventId}/contenido`)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function deleteContentBlock(
  blockId: string,
  eventId: string,
): Promise<{ error: string } | void> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('event_content_blocks').delete().eq('id', blockId)
    if (error) return { error: error.message }
    revalidatePath(`/eventos/${eventId}/contenido`)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function createContentBlock(data: {
  event_id: string
  titulo: string
  contenido?: string
  tipo: string
  orden: number
}): Promise<{ error: string } | void> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('event_content_blocks').insert(data)
    if (error) return { error: error.message }
    revalidatePath(`/eventos/${data.event_id}/contenido`)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}
