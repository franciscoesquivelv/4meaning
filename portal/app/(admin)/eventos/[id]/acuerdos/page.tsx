import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ApproveButton from './ApproveButton'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    draft:    { bg: '#f3f4f6', color: '#374151', label: 'Borrador' },
    sent:     { bg: '#fef9c3', color: '#854d0e', label: 'Enviado' },
    viewed:   { bg: '#e0f2fe', color: '#075985', label: 'Visto' },
    signed:   { bg: '#dbeafe', color: '#1e40af', label: 'Firmado' },
    approved: { bg: '#dcfce7', color: '#166534', label: 'Aprobado' },
    rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rechazado' },
  }
  const s = map[status] ?? { bg: '#f3f4f6', color: '#374151', label: status }
  return (
    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: '#f3f4f6', color: '#6b7280', textTransform: 'uppercase' }}>
      {type}
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

export default async function AcuerdosAdminPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  const Section = ({ title, items, showApprove }: { title: string; items: Agreement[]; showApprove?: boolean }) => {
    if (!items.length) return null
    return (
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          {title} ({items.length})
        </h2>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          {items.map((ag, i) => (
            <div key={ag.id} style={{
              padding: '14px 16px',
              borderBottom: i < items.length - 1 ? '1px solid #f3f4f6' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{ag.nombre}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <TypeBadge type={ag.type} />
                  {ag.families?.nombre_familia && (
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{ag.families.nombre_familia}</span>
                  )}
                </div>
              </div>
              <StatusBadge status={ag.status} />
              {showApprove && (
                <ApproveButton agreementId={ag.id} adminId={user.id} />
              )}
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/eventos/${params.id}`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← {evento.nombre}
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Acuerdos</h1>
          <Link
            href={`/eventos/${params.id}/acuerdos/nuevo`}
            style={{ padding: '8px 16px', background: '#111', color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            + Nuevo acuerdo
          </Link>
        </div>
      </div>

      {!agreements?.length ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 32, textAlign: 'center', color: '#9ca3af' }}>
          <p style={{ fontSize: 15, marginBottom: 16 }}>No hay acuerdos en este evento.</p>
          <Link
            href={`/eventos/${params.id}/acuerdos/nuevo`}
            style={{ padding: '8px 16px', background: '#111', color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            Crear primer acuerdo
          </Link>
        </div>
      ) : (
        <>
          <Section title="Pendientes de aprobacion" items={toApprove} showApprove />
          <Section title="En proceso" items={inProgress} />
          <Section title="Aprobados" items={approved} />
          <Section title="Rechazados" items={rejected} />
        </>
      )}
    </div>
  )
}
