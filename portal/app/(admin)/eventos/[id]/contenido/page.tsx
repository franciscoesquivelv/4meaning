/*
 * SQL to run in Supabase before deploying:
 *
 * create table if not exists public.event_content_blocks (
 *   id uuid primary key default gen_random_uuid(),
 *   event_id uuid references public.events(id) on delete cascade not null,
 *   titulo text not null,
 *   contenido text,
 *   tipo text not null default 'info',  -- 'info' | 'actividad' | 'reflexion' | 'formato'
 *   activo boolean not null default false,
 *   orden int not null default 0,
 *   activado_at timestamptz,
 *   created_at timestamptz default now()
 * );
 * alter table public.event_content_blocks enable row level security;
 * create policy "staff can manage content blocks"
 *   on public.event_content_blocks for all
 *   using (true) with check (true);
 */

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ToggleBlockButton from './ToggleBlockButton'
import DeleteBlockButton from './DeleteBlockButton'
import NewBlockForm from './NewBlockForm'

type ContentBlock = {
  id: string
  titulo: string
  contenido: string | null
  tipo: string
  activo: boolean
  orden: number
  activado_at: string | null
  created_at: string
}

const TIPO_LABELS: Record<string, { label: string; cls: string }> = {
  info:       { label: 'Información', cls: 'bg-blue-100 text-blue-700' },
  actividad:  { label: 'Actividad',   cls: 'bg-violet-100 text-violet-700' },
  reflexion:  { label: 'Reflexión',   cls: 'bg-amber-100 text-amber-700' },
  formato:    { label: 'Formato',     cls: 'bg-slate-100 text-slate-600' },
}

function tipoLabel(tipo: string) {
  return TIPO_LABELS[tipo] ?? { label: tipo, cls: 'bg-slate-100 text-slate-600' }
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function ContenidoAdminPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: blocks } = await supabase
    .from('event_content_blocks')
    .select('id, titulo, contenido, tipo, activo, orden, activado_at, created_at')
    .eq('event_id', params.id)
    .order('orden', { ascending: true })

  const list: ContentBlock[] = blocks ?? []
  const activeCount = list.filter(b => b.activo).length

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Contenido progresivo
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Activa bloques en tiempo real durante el retiro. Los participantes los ven al instante.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {list.length > 0 && (
            <span className="text-sm text-slate-400">
              {activeCount} activo{activeCount !== 1 ? 's' : ''} · {list.length} total
            </span>
          )}
          <NewBlockForm eventId={params.id} nextOrden={list.length + 1} />
        </div>
      </div>

      {/* Empty state */}
      {list.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-slate-400 text-sm mb-1">
            No hay bloques de contenido todavía.
          </p>
          <p className="text-xs text-slate-300">
            Crea el primer bloque con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_7rem_10rem_6rem] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="text-center">#</span>
            <span>Título</span>
            <span>Tipo</span>
            <span>Activado</span>
            <span>Estado</span>
          </div>

          {/* Rows */}
          {list.map((block, i) => {
            const { label, cls } = tipoLabel(block.tipo)
            return (
              <div
                key={block.id}
                className={`grid grid-cols-[3rem_1fr_7rem_10rem_6rem] gap-4 px-5 py-4 items-center ${
                  i < list.length - 1 ? 'border-b border-slate-100' : ''
                } ${block.activo ? 'bg-emerald-50/40' : ''}`}
              >
                {/* Orden */}
                <span className="text-sm text-slate-400 text-center font-mono">
                  {block.orden}
                </span>

                {/* Título + contenido preview + acciones */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {block.titulo}
                  </p>
                  {block.contenido && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {block.contenido}
                    </p>
                  )}
                  {/* Delete inline — small link style */}
                  <div className="mt-1">
                    <DeleteBlockButton blockId={block.id} eventId={params.id} />
                  </div>
                </div>

                {/* Tipo */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold self-start mt-0.5 ${cls}`}
                >
                  {label}
                </span>

                {/* Activado at */}
                <span className="text-xs text-slate-400 self-start mt-1">
                  {block.activo
                    ? formatDate(block.activado_at)
                    : <span className="text-slate-300">—</span>}
                </span>

                {/* Toggle */}
                <div className="self-start mt-0.5">
                  <ToggleBlockButton
                    blockId={block.id}
                    activo={block.activo}
                    eventId={params.id}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
