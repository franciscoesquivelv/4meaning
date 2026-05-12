'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleDelayed(itemId: string, delayed: boolean, eventId: string): Promise<{ error: string } | void> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('itinerary_items').update({ delayed }).eq('id', itemId)
    if (error) return { error: error.message }
    revalidatePath(`/eventos/${eventId}/operacion`)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}
