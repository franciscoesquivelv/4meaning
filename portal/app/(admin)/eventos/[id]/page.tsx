import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
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

function FamiliaStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    invited:   'bg-violet-100 text-violet-700',
    confirmed: 'bg-[#DBEAFE] text-[#2563EB]',
    completed: 'bg-slate-100 text-slate-500',
    pending:   'bg-[#FEF9C3] text-[#D97706]',
  }
  const labels: Record<string, string> = {
    invited: 'Invitado', confirmed: 'Confirmado', completed: 'Completado', pending: 'Pendiente',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function AgreementStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft:    'bg-slate-100 text-slate-600',
    sent:     'bg-[#FEF9C3] text-[#D97706]',
    viewed:   'bg-[#DBEAFE] text-[#2563EB]',
    signed:   'bg-[#FEF9C3] text-[#D97706]',
    approved: 'bg-[#DCFCE7] text-[#16A34A]',
    rejected: 'bg-[#FEE2E2] text-[#DC2626]',
  }
  const labels: Record<string, string> = {
    draft: 'Borrador', sent: 'Enviado', viewed: 'Visto',
    signed: 'Firmado', approved: 'Aprobado', rejected: 'Rechazado',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function EventoDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!evento) notFound()

  const [
    { data: families },
    { data: agreements },
    { data: itinerary },
    { data: documents },
    { data: responses },
  ] = await Promise.all([
    supabase.from('families').select('id, nombre_familia, habitacion, status').eq('event_id', params.id).order('nombre_familia'),
    supabase.from('agreements').select('id, nombre, type, status, signed_at').eq('event_id', params.id).order('created_at', { ascending: false }),
    supabase.from('itinerary_items').select('id, dia, hora_inicio, hora_fin, titulo, tipo, ubicacion').eq('event_id', params.id).order('dia').order('orden').order('hora_inicio').limit(6),
    supabase.from('documents').select('id').eq('event_id', params.id),
    supabase.from('intake_responses').select('id, family_id').eq('event_id', params.id),
  ])

  const familiesCount = families?.length ?? 0
  const agreementsCount = agreements?.length ?? 0
  const itineraryCountRes = await supabase.from('itinerary_items').select('id', { count: 'exact', head: true }).eq('event_id', params.id)
  const itineraryCount = itineraryCountRes.count ?? 0
  const documentsCount = documents?.length ?? 0
  const formulariosCount = responses?.length ?? 0
  const signedCount = agreements?.filter(a => ['signed', 'approved'].includes(a.status)).length ?? 0

  const [
    { count: avisosCount },
    { count: tasksTotal },
    { count: tasksDone },
  ] = await Promise.all([
    supabase.from('announcements').select('id', { count: 'exact', head: true }).eq('event_id', params.id).eq('published', true),
    supabase.from('event_tasks').select('id', { count: 'exact', head: true }).eq('event_id', params.id),
    supabase.from('event_tasks').select('id', { count: 'exact', head: true }).eq('event_id', params.id).eq('done', true),
  ])

  const tabs = [
    { href: `/eventos/${params.id}/checklist`,  label: '✓ Checklist',  count: tasksTotal ?? 0 },
    { href: `/eventos/${params.id}/familias`,   label: 'Familias',     count: familiesCount },
    { href: `/eventos/${params.id}/materiales`, label: '🖨 Materiales', count: null },
    { href: `/eventos/${params.id}/equipo`,     label: 'Equipo',       count: null },
    { href: `/eventos/${params.id}/acuerdos`,   label: 'Acuerdos',     count: agreementsCount },
    { href: `/eventos/${params.id}/itinerario`, label: 'Itinerario',   count: itineraryCount },
    { href: `/eventos/${params.id}/documentos`, label: 'Documentos',   count: documentsCount },
    { href: `/eventos/${params.id}/formularios`,label: 'Formularios',  count: formulariosCount },
    { href: `/eventos/${params.id}/avisos`,     label: 'Avisos',       count: avisosCount ?? 0 },
    { href: `/eventos/${params.id}/operacion`,  label: '⚡ Operación',  count: null },
  ]

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/eventos" className="hover:text-slate-700 transition-colors">Eventos</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate">{evento.nombre}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{evento.nombre}</h1>
          <div className="flex items-center gap-3 flex-wrap text-sm text-slate-500">
            {(evento.ciudad || evento.pais) && (
              <span>{[evento.ciudad, evento.pais].filter(Boolean).join(', ')}</span>
            )}
            <span>{formatDate(evento.fecha_inicio)} – {formatDate(evento.fecha_fin)}</span>
            {evento.ubicacion && <span>{evento.ubicacion}</span>}
            <PipelineBadge status={evento.pipeline_status ?? 'prospecto'} />
          </div>
        </div>
        <Link
          href={`/eventos/${params.id}/editar`}
          className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          Editar
        </Link>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 py-3 px-4 bg-white border border-slate-200 rounded-xl mb-6 text-sm shadow-sm">
        {[
          { label: 'Familias', value: familiesCount },
          { label: 'Acuerdos', value: agreementsCount },
          { label: 'Firmados', value: signedCount },
          { label: 'Tareas', value: `${tasksDone ?? 0}/${tasksTotal ?? 0}` },
        ].map((s, i) => (
          <div key={s.label} className={`flex items-center gap-2 ${i > 0 ? 'pl-6 border-l border-slate-200' : ''}`}>
            <span className="text-lg font-bold text-slate-900">{s.value}</span>
            <span className="text-slate-500 text-xs">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Horizontal tab nav */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-6 overflow-x-auto scrollbar-none">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:text-slate-900 transition-colors border-b-2 border-transparent hover:border-slate-300 -mb-px whitespace-nowrap flex-shrink-0"
          >
            {tab.label}
            {tab.count !== null && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Two column content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: main content */}
        <div className="col-span-2 space-y-6">
          {/* Families preview */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Familias</h3>
              <Link href={`/eventos/${params.id}/familias`} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                Ver todas →
              </Link>
            </div>
            {!families?.length ? (
              <div className="px-4 py-6 text-center text-slate-400 text-sm">Sin familias registradas.</div>
            ) : (
              families.slice(0, 5).map((f, i) => (
                <div key={f.id} className={`flex items-center justify-between px-4 py-3 text-sm ${i < Math.min(families.length, 5) - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div>
                    <div className="font-medium text-slate-900">{f.nombre_familia}</div>
                    {f.habitacion && <div className="text-xs text-slate-400 mt-0.5">Hab. {f.habitacion}</div>}
                  </div>
                  <FamiliaStatusBadge status={f.status} />
                </div>
              ))
            )}
          </div>

          {/* Agreements preview */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Acuerdos</h3>
              <Link href={`/eventos/${params.id}/acuerdos`} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                Ver todos →
              </Link>
            </div>
            {!agreements?.length ? (
              <div className="px-4 py-6 text-center text-slate-400 text-sm">Sin acuerdos registrados.</div>
            ) : (
              agreements.slice(0, 5).map((ag, i) => (
                <div key={ag.id} className={`flex items-center justify-between px-4 py-3 text-sm ${i < Math.min(agreements.length, 5) - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div>
                    <div className="font-medium text-slate-900">{ag.nombre}</div>
                    <div className="text-xs text-slate-400 mt-0.5 uppercase">{ag.type}</div>
                  </div>
                  <AgreementStatusBadge status={ag.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Acciones rápidas</h3>
            <div className="space-y-2">
              <Link
                href={`/eventos/${params.id}/operacion`}
                className="block w-full px-3 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors text-center"
              >
                ⚡ Modo operación
              </Link>
              {[
                { href: `/eventos/${params.id}/checklist`,       label: '✓ Checklist' },
                { href: `/eventos/${params.id}/materiales`,      label: '🖨 Materiales' },
                { href: `/eventos/${params.id}/familias/nueva`,  label: '+ Nueva familia' },
                { href: `/eventos/${params.id}/acuerdos/nuevo`,  label: '+ Nuevo acuerdo' },
                { href: `/eventos/${params.id}/itinerario/nuevo`,label: '+ Item itinerario' },
                { href: `/eventos/${params.id}/avisos`,          label: '+ Publicar aviso' },
                { href: `/eventos/${params.id}/entregas`,        label: '📦 Entregas' },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="block w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors text-center"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Event details */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Detalles</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Parejas</dt>
                <dd className="font-medium text-slate-900">{evento.n_parejas ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Pipeline</dt>
                <dd className="mt-0.5"><PipelineBadge status={evento.pipeline_status ?? 'prospecto'} /></dd>
              </div>
            </dl>
          </div>

          {/* La Nube */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">La Nube</h3>
            {evento.nube_url ? (
              <a
                href={evento.nube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline break-all"
              >
                Abrir álbum →
              </a>
            ) : (
              <p className="text-xs text-slate-400">Sin enlace configurado.</p>
            )}
            <Link
              href={`/eventos/${params.id}/editar`}
              className="block mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              {evento.nube_url ? 'Cambiar enlace' : '+ Agregar enlace'}
            </Link>
          </div>

          {/* Notas internas */}
          {evento.notas_internas && (
            <div className="bg-[#FEF9C3] border border-yellow-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mb-2">Notas internas</div>
              <p className="text-sm text-yellow-800 leading-relaxed">{evento.notas_internas}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
