import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ChecklistClient from './ChecklistClient'

export default async function ChecklistPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre, pipeline_status')
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
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/eventos" className="hover:text-slate-700 transition-colors">Eventos</Link>
        <span>/</span>
        <Link href={`/eventos/${params.id}`} className="hover:text-slate-700 transition-colors truncate max-w-xs">
          {evento.nombre}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Checklist</span>
      </nav>

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
