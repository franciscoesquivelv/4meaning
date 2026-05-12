'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleDelayed(itemId: string, delayed: boolean, eventId: string) {
  const supabase = createClient()
  await supabase.from('itinerary_items').update({ delayed }).eq('id', itemId)
  revalidatePath(`/eventos/${eventId}/operacion`)
}
