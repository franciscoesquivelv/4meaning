import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-600',
    active:    'bg-[#DCFCE7] text-[#16A34A]',
    completed: 'bg-[#DBEAFE] text-[#2563EB]',
    archived:  'bg-slate-100 text-slate-500',
    signed:    'bg-[#FEF9C3] text-[#D97706]',
    approved:  'bg-[#DCFCE7] text-[#16A34A]',
  }
  const labels: Record<string, string> = {
    draft: 'Borrador', active: 'Activo', completed: 'Completado',
    archived: 'Archivado', signed: 'Firmado', approved: 'Aprobado',
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

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function getTodayStr() {
  return new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const [
    { count: eventsCount },
    { count: familiesCount },
    { count: pendingAgreementsCount },
    { data: activeEvents },
    { data: pendingAgreements },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).in('status', ['draft', 'active']),
    supabase.from('families').select('*', { count: 'exact', head: true }),
    supabase.from('agreements').select('*', { count: 'exact', head: true }).eq('status', 'signed'),
    supabase
      .from('events')
      .select('id, nombre, ciudad, pais, fecha_inicio, fecha_fin, n_parejas, status')
      .in('status', ['draft', 'active'])
      .order('fecha_inicio', { ascending: false }),
    supabase
      .from('agreements')
      .select('id, nombre, type, status, signed_at, families(nombre_familia)')
      .eq('status', 'signed')
      .order('signed_at', { ascending: false })
      .limit(10),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'Admin'

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-slate-500 text-sm mt-1 capitalize">{getTodayStr()}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Eventos activos', value: eventsCount ?? 0 },
          { label: 'Familias totales', value: familiesCount ?? 0 },
          { label: 'Acuerdos por aprobar', value: pendingAgreementsCount ?? 0 },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Active Events */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Eventos activos</h2>
        {!activeEvents?.length ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-400 text-sm">Sin eventos activos.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ubicación</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fechas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Parejas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {activeEvents.map((ev, i) => (
                  <tr key={ev.id} className={`hover:bg-slate-50 transition-colors ${i < activeEvents.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <td className="px-4 py-3">
                      <Link href={`/eventos/${ev.id}`} className="font-medium text-slate-900 hover:text-slate-600 transition-colors">
                        {ev.nombre}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {[ev.ciudad, ev.pais].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(ev.fecha_inicio)} – {formatDate(ev.fecha_fin)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{ev.n_parejas ?? 0}</td>
                    <td className="px-4 py-3"><StatusBadge status={ev.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pending Agreements */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Pendientes de aprobación</h2>
        {!pendingAgreements?.length ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-400 text-sm">Sin acuerdos pendientes. Todo al día.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Familia</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acuerdo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Firmado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pendingAgreements.map((ag, i) => {
                  const family = ag.families as unknown as { nombre_familia: string } | null
                  return (
                    <tr key={ag.id} className={`hover:bg-slate-50 transition-colors ${i < pendingAgreements.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <td className="px-4 py-3 font-medium text-slate-900">{family?.nombre_familia ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{ag.nombre}</td>
                      <td className="px-4 py-3 text-slate-500">{ag.signed_at ? formatDate(ag.signed_at) : '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-400">Ver →</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
