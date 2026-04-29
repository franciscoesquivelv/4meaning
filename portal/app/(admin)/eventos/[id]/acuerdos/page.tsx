import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge, agreementStatusVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { STATUS_LABELS, AGREEMENT_TYPE_LABELS, fmtDate } from '@/lib/utils'
import ApproveButton from '@/components/admin/ApproveButton'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Acuerdos' }

export default async function AcuerdosPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()

  if (!event) notFound()

  const { data: agreements } = await supabase
    .from('agreements')
    .select(`
      id, type, nombre, status, signed_at, approved_at, notas_admin,
      families(nombre_familia),
      approved_profile:profiles!agreements_approved_by_fkey(full_name)
    `)
    .eq('event_id', params.id)
    .order('status')
    .order('created_at')

  const grouped = {
    signed:   agreements?.filter(a => a.status === 'signed')   ?? [],
    approved: agreements?.filter(a => a.status === 'approved') ?? [],
    others:   agreements?.filter(a => !['signed','approved'].includes(a.status)) ?? [],
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/eventos/${params.id}`} className="text-[10px] text-muted hover:text-ink mb-2 inline-block">
          ← {event.nombre}
        </Link>
        <h1 className="text-lg font-bold text-ink">Acuerdos</h1>
        <p className="text-[11px] text-muted mt-1">{agreements?.length ?? 0} en total</p>
      </div>

      {/* Pending approval — most urgent */}
      {grouped.signed.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-warning mb-3">
            Pendientes de aprobar ({grouped.signed.length})
          </p>
          <div className="space-y-2">
            {grouped.signed.map((ag: any) => (
              <Card key={ag.id} className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink">{ag.nombre}</p>
                  <p className="text-[10px] text-muted mt-0.5">
                    {ag.families?.nombre_familia ?? '—'} · {AGREEMENT_TYPE_LABELS[ag.type] ?? ag.type}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">
                    Firmado {ag.signed_at ? fmtDate(ag.signed_at.split('T')[0]) : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="warning">Firmado</Badge>
                  <ApproveButton agreementId={ag.id} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Approved */}
      {grouped.approved.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted mb-3">
            Aprobados ({grouped.approved.length})
          </p>
          <div className="space-y-2">
            {grouped.approved.map((ag: any) => (
              <Card key={ag.id} className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-ink">{ag.nombre}</p>
                  <p className="text-[10px] text-muted">{ag.families?.nombre_familia ?? '—'}</p>
                </div>
                <Badge variant="success">Aprobado</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Others (draft, sent, viewed) */}
      {grouped.others.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted mb-3">
            En proceso ({grouped.others.length})
          </p>
          <div className="space-y-2">
            {grouped.others.map((ag: any) => (
              <Card key={ag.id} className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-ink">{ag.nombre}</p>
                  <p className="text-[10px] text-muted">{ag.families?.nombre_familia ?? '—'}</p>
                </div>
                <Badge variant={agreementStatusVariant(ag.status)}>
                  {STATUS_LABELS[ag.status] ?? ag.status}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {agreements?.length === 0 && (
        <Card>
          <p className="text-[12px] text-muted text-center py-8">No hay acuerdos para este evento.</p>
        </Card>
      )}
    </div>
  )
}
