'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleContentBlock(
  blockId: string,
  activo: boolean,
  eventId: string,
): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('event_content_blocks')
    .update({
      activo,
      activado_at: activo ? new Date().toISOString() : null,
    })
    .eq('id', blockId)
  revalidatePath(`/eventos/${eventId}/contenido`)
}

export async function deleteContentBlock(
  blockId: string,
  eventId: string,
): Promise<void> {
  const supabase = createClient()
  await supabase.from('event_content_blocks').delete().eq('id', blockId)
  revalidatePath(`/eventos/${eventId}/contenido`)
}

export async function createContentBlock(data: {
  event_id: string
  titulo: string
  contenido?: string
  tipo: string
  orden: number
}): Promise<void> {
  const supabase = createClient()
  await supabase.from('event_content_blocks').insert(data)
  revalidatePath(`/eventos/${data.event_id}/contenido`)
}
