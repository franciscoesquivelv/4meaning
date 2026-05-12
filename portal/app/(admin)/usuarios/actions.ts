'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, role: string): Promise<{ error: string } | void> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
    if (error) return { error: error.message }
    revalidatePath('/usuarios')
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}
