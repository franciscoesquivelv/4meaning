'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, role: string) {
  const supabase = createClient()
  await supabase.from('profiles').update({ role }).eq('id', userId)
  revalidatePath('/usuarios')
}
