import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import EventStatusButton from './EventStatusButton'

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
    .select('*, contacto_capitulo, costo_por_pareja, primer_deposito, notas_comerciales')
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

  const statusBadge: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-500',
    active:    'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    archived:  'bg-slate-100 text-slate-400',
  }
  const statusLabel: Record<string, string> = {
    draft: 'Borrador', active: 'Activo', completed: 'Completado', archived: 'Archivado',
  }
  const currentStatus: string = evento.status ?? 'draft'

  return (
    <div className="px-8 pt-6 pb-12 max-w-7xl">
      {/* Subheader — location, dates, edit */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 flex-wrap text-sm text-slate-400">
          {(evento.ciudad || evento.pais) && (
            <span>{[evento.ciudad, evento.pais].filter(Boolean).join(', ')}</span>
          )}
          {(evento.ciudad || evento.pais) && <span>·</span>}
          <span>{formatDate(evento.fecha_inicio)} – {formatDate(evento.fecha_fin)}</span>
          {evento.ubicacion && <><span>·</span><span>{evento.ubicacion}</span></>}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[currentStatus] ?? 'bg-slate-100 text-slate-500'}`}
          >
            {statusLabel[currentStatus] ?? currentStatus}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <EventStatusButton eventId={params.id} currentStatus={currentStatus} />
          <Link
            href={`/eventos/${params.id}/editar`}
            title="Editar nombre, fechas, ubicación y detalles del evento"
            className="px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Editar
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden mb-8">
        {[
          { label: 'Familias',  value: familiesCount },
          { label: 'Acuerdos', value: agreementsCount },
          { label: 'Firmados', value: signedCount },
          { label: 'Tareas',   value: `${tasksDone ?? 0} / ${tasksTotal ?? 0}` },
        ].map(s => (
          <div key={s.label} className="bg-white px-6 py-4">
            <div className="text-2xl font-semibold text-slate-900 tabular-nums">{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two column content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
        <div className="col-span-1 space-y-4">
          {/* Quick actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-3">Acciones</p>
            <div className="space-y-1.5">
              <Link
                href={`/eventos/${params.id}/operacion`}
                title="Panel de operación en tiempo real durante el retiro"
                className="block w-full px-3 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors text-center"
              >
                Modo operación
              </Link>
              <Link
                href={`/eventos/${params.id}/preview`}
                title="Previsualizar el portal tal como lo ve un participante"
                className="block w-full px-3 py-2 text-sm text-slate-600 border border-slate-100 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Ver como participante
              </Link>
              {[
                { href: `/eventos/${params.id}/familias/nueva`,  label: 'Nueva familia',       title: 'Registrar una nueva familia participante en este evento' },
                { href: `/eventos/${params.id}/acuerdos/nuevo`,  label: 'Nuevo acuerdo',       title: 'Crear un acuerdo de confidencialidad o participación' },
                { href: `/eventos/${params.id}/itinerario/nuevo`,label: 'Agregar actividad',   title: 'Agregar una sesión o actividad al itinerario del retiro' },
                { href: `/eventos/${params.id}/avisos`,          label: 'Publicar aviso',      title: 'Enviar un aviso o mensaje a todos los participantes' },
                { href: `/eventos/${params.id}/materiales`,      label: 'Imprimir materiales', title: 'Generar e imprimir materiales para el retiro' },
                { href: `/eventos/${params.id}/entregas`,        label: 'Ver entregas',        title: 'Gestionar el estado de storybook y video para cada familia' },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  title={action.title}
                  className="block w-full px-3 py-2 text-sm text-slate-600 border border-slate-100 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
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
              {evento.contacto_capitulo && (
                <div>
                  <dt className="text-xs text-slate-400">Contacto capítulo</dt>
                  <dd className="font-medium text-slate-900 text-sm">{evento.contacto_capitulo}</dd>
                </div>
              )}
              {(evento.costo_por_pareja != null && evento.costo_por_pareja > 0) && (
                <div>
                  <dt className="text-xs text-slate-400">Costo por pareja</dt>
                  <dd className="font-medium text-slate-900">
                    ${evento.costo_por_pareja.toLocaleString('es-MX')} MXN
                  </dd>
                </div>
              )}
              {(evento.primer_deposito != null && evento.primer_deposito > 0) && (
                <div>
                  <dt className="text-xs text-slate-400">Primer depósito</dt>
                  <dd className="font-medium text-slate-900">
                    ${evento.primer_deposito.toLocaleString('es-MX')} MXN
                  </dd>
                </div>
              )}
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

          {/* Notas comerciales */}
          {evento.notas_comerciales && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Notas comerciales</div>
              <p className="text-sm text-blue-800 leading-relaxed">{evento.notas_comerciales}</p>
            </div>
          )}

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
