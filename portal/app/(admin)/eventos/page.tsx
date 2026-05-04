import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function PipelineBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    prospecto:       'bg-slate-100 text-slate-600',
    confirmado:      'bg-blue-100 text-blue-700',
    en_preparacion:  'bg-amber-100 text-amber-700',
    ejecutado:       'bg-emerald-100 text-emerald-700',
    cancelado:       'bg-red-100 text-red-500',
  }
  const labels: Record<string, string> = {
    prospecto:      'Prospecto',
    confirmado:     'Confirmado',
    en_preparacion: 'En preparación',
    ejecutado:      'Ejecutado',
    cancelado:      'Cancelado',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function EventosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: eventos } = await supabase
    .from('events')
    .select('id, nombre, ciudad, pais, fecha_inicio, fecha_fin, n_parejas, status, pipeline_status, capitulo')
    .order('fecha_inicio', { ascending: false })

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Eventos</h1>
        <Link
          href="/eventos/nuevo"
          className="px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          + Nuevo evento
        </Link>
      </div>

      {!eventos?.length ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-slate-400 text-sm mb-4">No hay eventos registrados.</p>
          <Link
            href="/eventos/nuevo"
            className="px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors inline-block"
          >
            Crear primer evento
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Capítulo / Ciudad</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fechas</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Parejas</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pipeline</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((ev, i) => (
                <tr key={ev.id} className={`hover:bg-slate-50 transition-colors ${i < eventos.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/eventos/${ev.id}`}
                      className="font-medium text-slate-900 hover:text-slate-600 transition-colors"
                    >
                      {ev.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    <div>{ev.capitulo || '—'}</div>
                    {ev.ciudad && <div className="text-xs text-slate-400">{ev.ciudad}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(ev.fecha_inicio)} – {formatDate(ev.fecha_fin)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{ev.n_parejas ?? 0}</td>
                  <td className="px-4 py-3"><PipelineBadge status={ev.pipeline_status ?? 'prospecto'} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/eventos/${ev.id}`} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
