/*
 * SQL to run in Supabase:
 *
 * alter table public.events
 *   add column if not exists info_logistica text,
 *   add column if not exists info_que_llevar text,
 *   add column if not exists info_vestimenta text,
 *   add column if not exists info_emergencia text;
 */

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EditarEventoForm from './EditarEventoForm'

export default async function EditarEventoPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!evento) notFound()

  return <EditarEventoForm evento={evento} eventId={params.id} />
}
