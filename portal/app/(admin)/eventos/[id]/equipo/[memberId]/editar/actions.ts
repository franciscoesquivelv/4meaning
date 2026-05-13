'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateTeamMember(
  eventId: string,
  memberId: string,
  data: { nombre: string; rol: string; bio_publica?: string; notas_equipo?: string; orden?: number }
): Promise<{ error: string } | void> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('event_team')
      .update(data)
      .eq('id', memberId)
      .eq('event_id', eventId)
    if (error) return { error: error.message }
    revalidatePath(`/eventos/${eventId}/equipo`)
    redirect(`/eventos/${eventId}/equipo`)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}
