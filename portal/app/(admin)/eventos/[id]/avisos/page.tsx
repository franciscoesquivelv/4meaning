/*
 * SQL to run in Supabase before deploying:
 *
 * create table if not exists public.announcements (
 *   id uuid primary key default gen_random_uuid(),
 *   event_id uuid references public.events(id) on delete cascade not null,
 *   titulo text not null,
 *   cuerpo text,
 *   tipo text not null default 'info',
 *   published boolean not null default true,
 *   created_at timestamptz default now()
 * );
 * alter table public.announcements enable row level security;
 * create policy "staff can manage announcements"
 *   on public.announcements for all
 *   using (is_staff()) with check (is_staff());
 * create policy "participants can read published"
 *   on public.announcements for select
 *   using (published = true);
 */

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import NewAnnouncementForm from './NewAnnouncementForm'
import DeleteAnnouncementButton from './DeleteAnnouncementButton'
import SendPushButton from './SendPushButton'

function tipoLabel(tipo: string) {
  const map: Record<string, { label: string; cls: string }> = {
    info:      { label: 'Info',      cls: 'bg-blue-100 text-blue-700' },
    urgente:   { label: 'Urgente',   cls: 'bg-red-100 text-red-700' },
    logistica: { label: 'Logística', cls: 'bg-amber-100 text-amber-700' },
  }
  return map[tipo] ?? { label: tipo, cls: 'bg-slate-100 text-slate-600' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function AvisosAdminPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, titulo, cuerpo, tipo, published, created_at')
    .eq('event_id', params.id)
    .order('created_at', { ascending: false })

  const list = announcements ?? []

  return (
    <div className="p-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/eventos" className="hover:text-slate-700 transition-colors">Eventos</Link>
        <span>/</span>
        <Link href={`/eventos/${params.id}`} className="hover:text-slate-700 transition-colors">{evento.nombre}</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Avisos</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Avisos para participantes</h1>
          <p className="text-sm text-slate-500 mt-1">Los participantes los ven en su portal al instante.</p>
        </div>
        <span className="text-sm text-slate-400">{list.length} aviso{list.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Create form */}
      <NewAnnouncementForm eventId={params.id} />

      {/* Push notifications */}
      <SendPushButton eventId={params.id} />

      {/* List */}
      {list.length === 0 ? (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
          <p className="text-slate-400 text-sm">No hay avisos publicados aún.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {list.map(a => {
            const { label, cls } = tipoLabel(a.tipo)
            return (
              <div
                key={a.id}
                className={`bg-white border rounded-xl p-5 shadow-sm ${!a.published ? 'opacity-60' : 'border-slate-200'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
                        {label}
                      </span>
                      {!a.published && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                          Oculto
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{formatDate(a.created_at)}</span>
                    </div>
                    <p className="font-semibold text-slate-900">{a.titulo}</p>
                    {a.cuerpo && (
                      <p className="mt-1 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{a.cuerpo}</p>
                    )}
                  </div>
                  <DeleteAnnouncementButton announcementId={a.id} eventId={params.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
