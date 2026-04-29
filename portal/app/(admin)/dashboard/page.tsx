import { createClient } from '@/lib/supabase/server'
import { Card, CardLabel, Stat } from '@/components/ui/card'
import { Badge, agreementStatusVariant } from '@/components/ui/badge'
import { fmtDateShort } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()

  // Active events
  const { data: events } = await supabase
    .from('events')
    .select('id, nombre, capitulo, fecha_inicio, fecha_fin, status, n_parejas')
    .in('status', ['draft', 'active'])
    .order('fecha_inicio', { ascending: true })

  // Agreements pending approval
  const { data: pendingAgreements } = await supabase
    .from('agreements')
    .select('id, nombre, type, status, signed_at, families(nombre_familia), events(nombre)')
    .eq('status', 'signed')
    .order('signed_at', { ascending: false })
    .limit(8)

  // Stats
  const { count: totalFamilies }  = await supabase.from('families').select('*', { count: 'exact', head: true })
  const { count: totalAgreements } = await supabase.from('agreements').select('*', { count: 'exact', head: true })
  const { count: signedAgreements } = await supabase.from('agreements').select('*', { count: 'exact', head: true }).eq('status', 'signed')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-bold text-ink">Dashboard</h1>
        <p className="text-[11px] text-muted mt-1">Vista general del portal.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <Stat label="Familias" value={totalFamilies ?? 0} sub="en total" />
        </Card>
        <Card>
          <Stat label="Acuerdos firmados" value={signedAgreements ?? 0} sub={`de ${totalAgreements ?? 0} en total`} />
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <Stat label="Eventos activos" value={events?.length ?? 0} />
        </Card>
      </div>

      {/* Active events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted">
            Eventos activos
          </p>
          <Link href="/eventos" className="text-[10px] text-muted hover:text-ink transition-colors">
            Ver todos →
          </Link>
        </div>
        <div className="space-y-2">
          {events?.length === 0 && (
            <Card>
              <p className="text-[12px] text-muted text-center py-4">
                No hay eventos activos.{' '}
                <Link href="/eventos/nuevo" className="text-ink/60 hover:text-ink underline underline-offset-2">
                  Crear uno
                </Link>
              </p>
            </Card>
          )}
          {events?.map(ev => (
            <Link key={ev.id} href={`/eventos/${ev.id}`}>
              <Card className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-ink">{ev.nombre}</p>
                  <p className="text-[10px] text-muted mt-0.5">
                    {ev.capitulo} · {fmtDateShort(ev.fecha_inicio)}
                    {ev.fecha_fin && ` – ${fmtDateShort(ev.fecha_fin)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {ev.n_parejas && (
                    <span className="text-[10px] text-muted">{ev.n_parejas} parejas</span>
                  )}
                  <Badge variant={ev.status === 'active' ? 'success' : 'muted'}>
                    {ev.status === 'active' ? 'Activo' : 'Borrador'}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Pending approvals */}
      {pendingAgreements && pendingAgreements.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted mb-3">
            Acuerdos pendientes de aprobación ({pendingAgreements.length})
          </p>
          <div className="space-y-2">
            {pendingAgreements.map((ag: any) => (
              <Card key={ag.id} className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-ink">{ag.nombre}</p>
                  <p className="text-[10px] text-muted mt-0.5">
                    {ag.families?.nombre_familia ?? '—'} · {ag.events?.nombre ?? '—'}
                  </p>
                </div>
                <Badge variant={agreementStatusVariant(ag.status)}>
                  Firmado
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
