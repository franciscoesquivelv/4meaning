import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ChecklistClient from './ChecklistClient'

export default async function ChecklistPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, pipeline_status')
    .eq('id', params.id)
    .single()

  if (!evento) notFound()

  const { data: tasks } = await supabase
    .from('event_tasks')
    .select('id, titulo, descripcion, fase, done, done_at, orden')
    .eq('event_id', params.id)
    .order('fase', { ascending: true, nullsFirst: false })
    .order('orden')
    .order('created_at')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Checklist de preparación</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {tasks?.filter(t => t.done).length ?? 0} de {tasks?.length ?? 0} tareas completadas
          </p>
        </div>
      </div>

      <ChecklistClient
        eventId={params.id}
        initialTasks={tasks ?? []}
        isAdmin={isAdmin}
      />
    </div>
  )
}
