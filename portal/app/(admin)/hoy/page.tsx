import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { estaEntregado } from '@/lib/entregas'

function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateShort(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

function daysFrom(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Alert card ─────────────────────────────────────────────────────────────

function AlertCard({
  title,
  description,
  href,
  linkLabel,
  color = 'amber',
}: {
  title: string
  description?: string
  href: string
  linkLabel: string
  color?: 'amber' | 'red' | 'slate'
}) {
  const borderColor =
    color === 'red' ? 'border-red-400' : color === 'slate' ? 'border-slate-300' : 'border-amber-400'
  const bgColor =
    color === 'red' ? 'bg-red-50' : color === 'slate' ? 'bg-slate-50' : 'bg-amber-50'

  return (
    <div className={`flex items-start gap-4 border-l-4 ${borderColor} ${bgColor} rounded-r-xl px-5 py-4 shadow-sm`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <Link
        href={href}
        className="shrink-0 text-xs font-medium text-slate-700 border border-slate-300 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
      >
        {linkLabel}
      </Link>
    </div>
  )
}

function SuccessCard({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 border-l-4 border-emerald-400 bg-emerald-50 rounded-r-xl px-5 py-4 shadow-sm">
      <svg className="w-5 h-5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <p className="text-sm font-semibold text-emerald-800">{title}</p>
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-slate-900 mb-2">No hay eventos próximos</h2>
      <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
        Crea un nuevo evento para empezar a gestionar familias, acuerdos e itinerario.
      </p>
      <Link
        href="/eventos/nuevo"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
      >
        + Crear evento
      </Link>
    </div>
  )
}

// ─── Recent events ────────────────────────────────────────────────────────────

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
            <span className="text-xs text-slate-400">{formatDate(ev.fecha_fin)}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Admin'

  // Load upcoming/recent events (within 60-day window either direction)
  const { data: events } = await supabase
    .from('events')
    .select('id, nombre, ciudad, pais, fecha_inicio, fecha_fin, status')
    .in('status', ['draft', 'active', 'completed'])
    .order('fecha_inicio', { ascending: false })
    .limit(10)

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // Find the most relevant event
  const upcoming = events?.find((e) => {
    const start = new Date(e.fecha_inicio)
    const diff = daysFrom(e.fecha_inicio)
    return diff >= 0 && diff <= 30
  })

  const inProgress = events?.find((e) => {
    const start = new Date(e.fecha_inicio)
    const end = new Date(e.fecha_fin)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return now >= start && now <= end
  })

  const recentlyEnded = events?.find((e) => {
    if (e.status !== 'completed' && e.status !== 'active') return false
    if (!e.fecha_fin) return false
    const end = new Date(e.fecha_fin)
    end.setHours(0, 0, 0, 0)
    const diff = Math.round((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 && diff <= 30
  })

  // ── Scenario B: Event in progress ─────────────────────────────────────────
  if (inProgress) {
    const { data: families } = await supabase
      .from('families')
      .select('id, checked_in_at')
      .eq('event_id', inProgress.id)

    const { data: announcements } = await supabase
      .from('announcements')
      .select('id, titulo, created_at')
      .eq('event_id', inProgress.id)
      .order('created_at', { ascending: false })
      .limit(3)

    const totalFamilias = families?.length ?? 0
    const checkedIn = families?.filter((f) => f.checked_in_at != null).length ?? 0

    return (
      <div className="max-w-2xl mx-auto px-8 pt-8">
        <p className="text-sm text-slate-500 mb-2">Hola, {firstName}</p>

        {/* Banner */}
        <div className="bg-slate-900 text-white rounded-2xl px-6 py-5 mb-6 flex items-center justify-between gap-4 shadow-md">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Retiro en curso</p>
            <h1 className="text-xl font-bold leading-tight">{inProgress.nombre}</h1>
            {inProgress.ciudad && (
              <p className="text-sm text-slate-400 mt-1">{inProgress.ciudad}{inProgress.pais ? `, ${inProgress.pais}` : ''}</p>
            )}
          </div>
          <Link
            href={`/eventos/${inProgress.id}/operacion`}
            className="shrink-0 bg-white text-slate-900 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Ver operación
          </Link>
        </div>

        {/* Check-in summary */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm mb-4">
          <p className="text-xs text-slate-500 font-medium mb-1">Check-in familias</p>
          <p className="text-2xl font-bold text-slate-900">
            {checkedIn}<span className="text-base font-normal text-slate-400">/{totalFamilias}</span>
          </p>
          <Link href={`/eventos/${inProgress.id}/familias`} className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 mt-1 inline-block">
            Ver todas las familias
          </Link>
        </div>

        {/* Announcements */}
        {announcements && announcements.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avisos recientes</h3>
            </div>
            {announcements.map((a, i) => (
              <div key={a.id} className={`px-5 py-3 text-sm ${i < announcements.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <p className="font-medium text-slate-900">{a.titulo}</p>
                <time className="text-xs text-slate-400" dateTime={a.created_at}>
                  {formatDate(a.created_at)}
                </time>
              </div>
            ))}
          </div>
        )}

        <RecentEvents supabase={supabase} />
      </div>
    )
  }

  // ── Scenario C: Post-event (ended < 30 days ago) ──────────────────────────
  if (recentlyEnded) {
    const daysAgo = Math.round(
      (now.getTime() - new Date(recentlyEnded.fecha_fin).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
    )

    const { data: families } = await supabase
      .from('families')
      // `video_status` y no `video_entregado`. Eran dos columnas distintas:
      // esta pantalla leia una y la pareja leia la otra, asi que el panel
      // podia decir "entregado" mientras la app de la familia decia
      // "Pendiente". Ahora las dos leen la misma.
      .select('id, nombre_familia, nombre1, nombre2, video_status, video_fecha')
      .eq('event_id', recentlyEnded.id)
      .order('nombre_familia')

    const familyList = families ?? []
    const pendingVideo = familyList.filter((f) => !estaEntregado(f.video_status))
    const deliveredCount = familyList.length - pendingVideo.length

    return (
      <div className="max-w-2xl mx-auto px-8 pt-8">
        <p className="text-sm text-slate-500 mb-2">Hola, {firstName}</p>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{recentlyEnded.nombre}</h1>
          <p className="text-sm text-slate-500 mt-1">
            El retiro terminó hace {daysAgo} {daysAgo === 1 ? 'día' : 'días'} ·{' '}
            <time dateTime={recentlyEnded.fecha_fin}>{formatDate(recentlyEnded.fecha_fin)}</time>
          </p>
        </div>

        {/* Video delivery section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Entrega de video</h2>
              <p className="text-xs text-slate-500 mt-0.5">{deliveredCount}/{familyList.length} familias con video entregado</p>
            </div>
            <Link
              href={`/eventos/${recentlyEnded.id}/familias`}
              className="text-xs font-medium text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Ver todas
            </Link>
          </div>

          {pendingVideo.length === 0 ? (
            <div className="px-5 py-4 flex items-center gap-2 text-emerald-700">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Todos los videos han sido entregados</span>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pendingVideo.slice(0, 8).map((f) => (
                <li key={f.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{f.nombre_familia}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {f.nombre1}{f.nombre2 ? ` · ${f.nombre2}` : ''}
                    </p>
                  </div>
                  <Link
                    href={`/eventos/${recentlyEnded.id}/familias`}
                    className="text-xs text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Marcar entregado
                  </Link>
                </li>
              ))}
              {pendingVideo.length > 8 && (
                <li className="px-5 py-3 text-xs text-slate-400">
                  + {pendingVideo.length - 8} más. <Link href={`/eventos/${recentlyEnded.id}/familias`} className="underline underline-offset-2">Ver todas</Link>
                </li>
              )}
            </ul>
          )}
        </div>

        <RecentEvents supabase={supabase} />
      </div>
    )
  }

  // ── Scenario A: Upcoming event (< 30 days away) ───────────────────────────
  if (upcoming) {
    const daysLeft = daysFrom(upcoming.fecha_inicio)

    // Load checklist data for this event
    const [
      { data: families },
      { data: agreements },
      { data: itinerary },
      { data: checklist },
    ] = await Promise.all([
      supabase
        .from('families')
        .select('id, status')
        .eq('event_id', upcoming.id),
      supabase
        .from('agreements')
        .select('id, status')
        .eq('event_id', upcoming.id),
      supabase
        .from('itinerary_items')
        .select('id')
        .eq('event_id', upcoming.id)
        .limit(1),
      supabase
        .from('checklist_items')
        .select('id, completed')
        .eq('event_id', upcoming.id),
    ])

    const familyList = families ?? []
    const agreementList = agreements ?? []
    const checklistList = checklist ?? []

    const unconfirmedCount = familyList.filter((f) => f.status !== 'confirmed').length
    const pendingAgreements = agreementList.filter((a) => !['signed', 'approved'].includes(a.status)).length
    const itineraryEmpty = !itinerary || itinerary.length === 0
    const pendingChecklist = checklistList.filter((c) => !c.completed).length
    const hasIssues = unconfirmedCount > 0 || pendingAgreements > 0 || itineraryEmpty || pendingChecklist > 0

    return (
      <div className="max-w-2xl mx-auto px-8 pt-8">
        <p className="text-sm text-slate-500 mb-2">Hola, {firstName}</p>

        {/* Event header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-900">{upcoming.nombre}</h1>
            <span className="shrink-0 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full mt-1">
              {daysLeft === 0 ? 'Hoy' : daysLeft === 1 ? 'Mañana' : `${daysLeft} días`}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {upcoming.ciudad && <>{upcoming.ciudad}{upcoming.pais ? `, ${upcoming.pais}` : ''} · </>}
            <time dateTime={upcoming.fecha_inicio}>{formatDate(upcoming.fecha_inicio)}</time>
            {upcoming.fecha_fin && upcoming.fecha_fin !== upcoming.fecha_inicio && (
              <> - <time dateTime={upcoming.fecha_fin}>{formatDate(upcoming.fecha_fin)}</time></>
            )}
          </p>
        </div>

        {/* Action items */}
        <div className="mb-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pendiente antes del retiro</h2>
          <div className="flex flex-col gap-3">
            {unconfirmedCount > 0 && (
              <AlertCard
                title={`${unconfirmedCount} ${unconfirmedCount === 1 ? 'familia no ha confirmado' : 'familias no han confirmado'}`}
                description="Revisar estado de confirmación antes del retiro"
                href={`/eventos/${upcoming.id}/familias`}
                linkLabel="Ver familias"
              />
            )}
            {pendingAgreements > 0 && (
              <AlertCard
                title={`${pendingAgreements} ${pendingAgreements === 1 ? 'acuerdo pendiente' : 'acuerdos pendientes'} de firma`}
                description="Los acuerdos deben estar firmados antes del evento"
                href={`/eventos/${upcoming.id}/acuerdos`}
                linkLabel="Ver acuerdos"
              />
            )}
            {itineraryEmpty && (
              <AlertCard
                title="El itinerario no está creado"
                description="Agrega las actividades del retiro al itinerario"
                href={`/eventos/${upcoming.id}/itinerario`}
                linkLabel="Crear itinerario"
                color="slate"
              />
            )}
            {pendingChecklist > 0 && (
              <AlertCard
                title={`${pendingChecklist} ${pendingChecklist === 1 ? 'tarea pendiente' : 'tareas pendientes'} en el checklist`}
                href={`/eventos/${upcoming.id}/checklist`}
                linkLabel="Ver checklist"
                color="slate"
              />
            )}
            {!hasIssues && (
              <SuccessCard title="Todo listo para el retiro" />
            )}
          </div>
        </div>

        <div className="mt-4 mb-8">
          <Link
            href={`/eventos/${upcoming.id}`}
            className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2"
          >
            Ver evento completo
          </Link>
        </div>

        <RecentEvents supabase={supabase} />
      </div>
    )
  }

  // ── Scenario D: No relevant event ─────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-8 pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hola, {firstName}</h1>
        <p className="text-slate-500 text-sm mt-1">No hay ningún evento próximo.</p>
      </div>
      <EmptyState />
      <RecentEvents supabase={supabase} />
    </div>
  )
}
