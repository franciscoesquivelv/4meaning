'use server'

// SQL migration (run before deploying):
// alter table public.families add column if not exists video_entregado boolean not null default false;
// alter table public.families add column if not exists video_entregado_at timestamptz;

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function marcarVideoEntregado(familyId: string, eventId: string): Promise<{ error: string } | void> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('families')
      .update({ video_entregado: true, video_entregado_at: new Date().toISOString() })
      .eq('id', familyId)
    if (error) return { error: error.message }
    revalidatePath(`/eventos/${eventId}/familias`)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}
