import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ApproveButton from './ApproveButton'

function StatusBadge({ status }: { status: string }) {
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {labels[status] ?? status}
    </span>
  )
}

interface Agreement {
  id: string
  nombre: string
  type: string
  status: string
  signed_at: string | null
  approved_at: string | null
  families: { nombre_familia: string } | null
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

export default async function AcuerdosAdminPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const userId = user.id

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: agreements } = await supabase
    .from('agreements')
    .select('id, nombre, type, status, signed_at, approved_at, families(nombre_familia)')
    .eq('event_id', params.id)
    .order('created_at', { ascending: false })

  const toApprove = (agreements as Agreement[] | null)?.filter(a => a.status === 'signed') ?? []
  const inProgress = (agreements as Agreement[] | null)?.filter(a => ['draft', 'sent', 'viewed'].includes(a.status)) ?? []
  const approved = (agreements as Agreement[] | null)?.filter(a => a.status === 'approved') ?? []
  const rejected = (agreements as Agreement[] | null)?.filter(a => a.status === 'rejected') ?? []

  function Section({
    title,
    items,
    showApprove,
    highlight,
  }: {
    title: string
    items: Agreement[]
    showApprove?: boolean
    highlight?: boolean
  }) {
    if (!items.length) return null
    return (
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {title} <span className="text-slate-400">({items.length})</span>
        </h2>
        <div className={`bg-white border rounded-xl shadow-sm overflow-hidden ${highlight ? 'border-yellow-300' : 'border-slate-200'}`}>
          {items.map((ag, i) => (
            <div
              key={ag.id}
              className={[
                'flex items-center gap-4 px-4 py-3.5 text-sm',
                highlight ? 'border-l-4 border-[#D97706]' : '',
                i < items.length - 1 ? 'border-b border-slate-100' : '',
              ].join(' ')}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 truncate">{ag.nombre}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                    {ag.type}
                  </span>
                  {ag.families?.nombre_familia && (
                    <span className="text-xs text-slate-400">{ag.families.nombre_familia}</span>
                  )}
                  {ag.signed_at && (
                    <span className="text-xs text-slate-400">· {formatDate(ag.signed_at)}</span>
                  )}
                </div>
              </div>
              <StatusBadge status={ag.status} />
              {showApprove && (
                <ApproveButton agreementId={ag.id} adminId={userId} />
              )}
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/eventos" className="hover:text-slate-700 transition-colors">Eventos</Link>
        <span>/</span>
        <Link href={`/eventos/${params.id}`} className="hover:text-slate-700 transition-colors">{evento.nombre}</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Acuerdos</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Acuerdos</h1>
        <Link
          href={`/eventos/${params.id}/acuerdos/nuevo`}
          className="px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          + Nuevo acuerdo
        </Link>
      </div>

      {!agreements?.length ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-slate-400 text-sm mb-4">No hay acuerdos en este evento.</p>
          <Link
            href={`/eventos/${params.id}/acuerdos/nuevo`}
            className="px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors inline-block"
          >
            Crear primer acuerdo
          </Link>
        </div>
      ) : (
        <>
          <Section title="Pendientes de aprobación" items={toApprove} showApprove highlight />
          <Section title="En proceso" items={inProgress} />
          <Section title="Aprobados" items={approved} />
          <Section title="Rechazados" items={rejected} />
        </>
      )}
    </div>
  )
}
