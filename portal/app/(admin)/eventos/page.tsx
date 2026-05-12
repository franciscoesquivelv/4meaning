import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

type Evento = {
  id: string
  nombre: string
  ciudad: string | null
  pais: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  pipeline_status: string | null
  n_parejas: number | null
  families?: [{ count: number }]
}

const PIPELINE_COLUMNS: { key: string; label: string; headerCls: string }[] = [
  { key: 'prospecto',      label: 'Prospecto',      headerCls: 'text-slate-600' },
  { key: 'confirmado',     label: 'Confirmado',      headerCls: 'text-blue-700' },
  { key: 'en_preparacion', label: 'En preparación', headerCls: 'text-amber-700' },
  { key: 'ejecutado',      label: 'Ejecutado',       headerCls: 'text-emerald-700' },
  { key: 'cancelado',      label: 'Cancelado',       headerCls: 'text-red-500' },
]

export default async function EventosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: eventos } = await supabase
    .from('events')
    .select('id, nombre, ciudad, pais, fecha_inicio, fecha_fin, pipeline_status, n_parejas, families(count)')
    .order('fecha_inicio', { ascending: false })

  const grouped = PIPELINE_COLUMNS.reduce<Record<string, Evento[]>>((acc, col) => {
    acc[col.key] = (eventos ?? []).filter(
      ev => (ev.pipeline_status ?? 'prospecto') === col.key
    ) as Evento[]
    return acc
  }, {})

  return (
    <div className="p-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PIPELINE_COLUMNS.map(col => {
            const items = grouped[col.key] ?? []
            return (
              <div key={col.key} className="flex flex-col gap-3">
                {/* Column header */}
                <div className="flex items-center gap-2 px-1">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${col.headerCls}`}>
                    {col.label}
                  </span>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                {items.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-xl">
                    <p className="text-slate-400 text-xs text-center py-6">Sin eventos</p>
                  </div>
                ) : (
                  items.map(ev => {
                    const familyCount = (ev as Evento).families?.[0]?.count ?? 0
                    return (
                    <Link
                      key={ev.id}
                      href={`/eventos/${ev.id}`}
                      className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer block${col.key === 'cancelado' ? ' opacity-60' : ''}`}
                    >
                      <div className="font-semibold text-slate-900 text-sm leading-tight mb-1.5">
                        {ev.nombre}
                      </div>
                      {(ev.ciudad || ev.pais) && (
                        <div className="text-xs text-slate-500 mb-1">
                          {[ev.ciudad, ev.pais].filter(Boolean).join(', ')}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 mb-2">
                        {formatDate(ev.fecha_inicio)} – {formatDate(ev.fecha_fin)}
                      </div>
                      {familyCount > 0 ? (
                        <div className="text-[10px] font-medium text-slate-500 bg-slate-50 rounded-md px-2 py-1 inline-block">
                          {familyCount} {familyCount !== 1 ? 'familias' : 'familia'}
                        </div>
                      ) : ev.n_parejas != null && ev.n_parejas > 0 ? (
                        <div className="text-[10px] font-medium text-slate-500 bg-slate-50 rounded-md px-2 py-1 inline-block">
                          {ev.n_parejas} parejas
                        </div>
                      ) : null}
                    </Link>
                    )
                  })
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
