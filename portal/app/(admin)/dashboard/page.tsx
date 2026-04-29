import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-600',
    active:    'bg-[#DCFCE7] text-[#16A34A]',
    completed: 'bg-[#DBEAFE] text-[#2563EB]',
    archived:  'bg-slate-100 text-slate-500',
  }
  const labels: Record<string, string> = {
    draft: 'Borrador', active: 'Activo', completed: 'Completado', archived: 'Archivado',
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

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check for active event — redirect there if it exists
  const { data: activeEvent } = await supabase
    .from('events')
    .select('id')
    .eq('status', 'active')
    .order('fecha_inicio', { ascending: false })
    .limit(1)
    .single()

  if (activeEvent) {
    redirect(`/eventos/${activeEvent.id}`)
  }

  // No active event — check for drafts
  const { data: draftEvent } = await supabase
    .from('events')
    .select('id')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (draftEvent) {
    redirect(`/eventos/${draftEvent.id}`)
  }

  // No events at all — show empty state
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Admin'

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-900">Hola, {firstName}</h1>
        <p className="text-slate-500 text-sm mt-1">No hay ningún evento activo todavía.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
          ✦
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Crea tu primer evento</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
          Empieza registrando el evento para gestionar familias, acuerdos e itinerario desde aquí.
        </p>
        <Link
          href="/eventos/nuevo"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
        >
          + Crear evento
        </Link>
      </div>

      {/* Recent archived */}
      <RecentEvents supabase={supabase} />
    </div>
  )
}

async function RecentEvents({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const { data: recent } = await supabase
    .from('events')
    .select('id, nombre, ciudad, pais, fecha_inicio, fecha_fin, status')
    .in('status', ['completed', 'archived'])
    .order('fecha_fin', { ascending: false })
    .limit(5)

  if (!recent?.length) return null

  return (
    <div className="mt-8">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Eventos anteriores</h3>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {recent.map((ev, i) => (
          <Link
            key={ev.id}
            href={`/eventos/${ev.id}`}
            className={`flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${i < recent.length - 1 ? 'border-b border-slate-100' : ''}`}
          >
            <div>
              <div className="font-medium text-slate-900">{ev.nombre}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {[ev.ciudad, ev.pais].filter(Boolean).join(', ')} · {formatDate(ev.fecha_inicio)}
              </div>
            </div>
            <StatusBadge status={ev.status} />
          </Link>
        ))}
      </div>
    </div>
  )
}
