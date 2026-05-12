'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateEvento(eventId: string, data: Record<string, unknown>): Promise<{ error: string } | void> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('events').update(data).eq('id', eventId)
    if (error) return { error: error.message }
    revalidatePath(`/eventos/${eventId}`)
    revalidatePath(`/eventos/${eventId}/editar`)
    redirect(`/eventos/${eventId}`)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}
