/*
 * SQL to run in Supabase:
 *
 * alter table public.families
 *   add column if not exists storybook_status text default 'pendiente',
 *   add column if not exists video_status text default 'pendiente',
 *   add column if not exists entrega_estimada date;
 */

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import EntregaRow from './EntregaRow'

export default async function EntregasPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre, status')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: families } = await supabase
    .from('families')
    .select('id, nombre_familia, nombre1, nombre2, email1, storybook_status, video_status, entrega_estimada')
    .eq('event_id', params.id)
    .order('nombre_familia')

  const list = families ?? []

  const sbDone = list.filter(f => f.storybook_status === 'entregado').length
  const vDone  = list.filter(f => f.video_status === 'entregado').length
  const total  = list.length

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/eventos" className="hover:text-slate-700 transition-colors">Eventos</Link>
        <span>/</span>
        <Link href={`/eventos/${params.id}`} className="hover:text-slate-700 transition-colors">{evento.nombre}</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Entregas</span>
      </nav>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Seguimiento de entregas</h1>
          <p className="text-sm text-slate-500 mt-1">Storybook y video personalizados por familia</p>
        </div>
        <div className="flex gap-4 text-sm text-slate-500">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{sbDone}/{total}</div>
            <div className="text-xs">Storybooks</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{vDone}/{total}</div>
            <div className="text-xs">Videos</div>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
          <p className="text-slate-400 text-sm">No hay familias registradas en este evento.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Familia</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Storybook</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Video</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Entrega estimada</th>
              </tr>
            </thead>
            <tbody>
              {list.map((f, i) => (
                <EntregaRow
                  key={f.id}
                  family={f}
                  isLast={i === list.length - 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
        <p className="font-medium text-slate-700 mb-1">Flujo de producción</p>
        <div className="flex items-center gap-2 flex-wrap">
          {['pendiente', 'en_produccion', 'entregado'].map((s, i) => (
            <span key={s} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-300">→</span>}
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                s === 'pendiente' ? 'bg-slate-100 text-slate-500'
                : s === 'en_produccion' ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
              }`}>
                {s === 'pendiente' ? 'Pendiente' : s === 'en_produccion' ? 'En producción' : 'Entregado'}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
