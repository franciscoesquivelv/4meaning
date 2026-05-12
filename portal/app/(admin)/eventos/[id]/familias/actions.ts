'use server'

// SQL migration (run before deploying):
// alter table public.families add column if not exists video_entregado boolean not null default false;
// alter table public.families add column if not exists video_entregado_at timestamptz;

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function marcarVideoEntregado(familyId: string, eventId: string) {
  const supabase = createClient()
  await supabase
    .from('families')
    .update({ video_entregado: true, video_entregado_at: new Date().toISOString() })
    .eq('id', familyId)
  revalidatePath(`/eventos/${eventId}/familias`)
}
