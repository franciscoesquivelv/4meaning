import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge, agreementStatusVariant } from '@/components/ui/badge'
import { STATUS_LABELS } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mis Acuerdos' }

export default async function AcuerdosParticipantePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: family } = await supabase
    .from('families')
    .select('id')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .maybeSingle()

  const { data: agreements } = await supabase
    .from('agreements')
    .select('id, nombre, type, status, signed_at, approved_at')
    .eq('family_id', family?.id ?? '')
    .order('status')
    .order('created_at')

  const pending  = agreements?.filter(a => !['signed','approved'].includes(a.status)) ?? []
  const done     = agreements?.filter(a => ['signed','approved'].includes(a.status))  ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Acuerdos</h1>
        <p className="text-[11px] text-muted mt-1">
          {done.length} de {agreements?.length ?? 0} completados
        </p>
      </div>

      {/* Progress bar */}
      {agreements && agreements.length > 0 && (
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-500"
            style={{ width: `${(done.length / agreements.length) * 100}%` }}
          />
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted mb-3">
            Por completar
          </p>
          <div className="space-y-2">
            {pending.map(ag => (
              <Link key={ag.id} href={`/acuerdos/${ag.id}`}>
                <Card className="flex items-center justify-between active:bg-surface2">
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{ag.nombre}</p>
                    <p className="text-[10px] text-muted mt-0.5 capitalize">{ag.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={agreementStatusVariant(ag.status)}>
                      {STATUS_LABELS[ag.status] ?? ag.status}
                    </Badge>
                    <span className="text-muted text-[16px]">→</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted mb-3">
            Completados
          </p>
          <div className="space-y-2">
            {done.map(ag => (
              <Link key={ag.id} href={`/acuerdos/${ag.id}`}>
                <Card className="flex items-center justify-between opacity-70">
                  <div>
                    <p className="text-[12px] font-semibold text-ink">{ag.nombre}</p>
                    <p className="text-[10px] text-muted mt-0.5 capitalize">{ag.type}</p>
                  </div>
                  <Badge variant={agreementStatusVariant(ag.status)}>
                    {STATUS_LABELS[ag.status] ?? ag.status}
                  </Badge>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {agreements?.length === 0 && (
        <Card>
          <p className="text-[12px] text-muted text-center py-8">
            No hay acuerdos asignados aún.
          </p>
        </Card>
      )}
    </div>
  )
}
