'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateEvento(eventId: string, data: Record<string, unknown>) {
  const supabase = createClient()
  await supabase.from('events').update(data).eq('id', eventId)
  revalidatePath(`/eventos/${eventId}`)
  revalidatePath(`/eventos/${eventId}/editar`)
  redirect(`/eventos/${eventId}`)
}
