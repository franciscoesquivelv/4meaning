import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge, agreementStatusVariant } from '@/components/ui/badge'
import { fmtDate, STATUS_LABELS } from '@/lib/utils'
import { MapPin, Calendar, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi Retiro' }

export default async function MiRetiroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Find family and event
  const { data: family } = await supabase
    .from('families')
    .select(`
      id, event_id, nombre_familia, nombre1, nombre2, habitacion,
      events(id, nombre, capitulo, ciudad, pais, fecha_inicio, fecha_fin, ubicacion)
    `)
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .maybeSingle()

  // Agreements for this family
  const { data: agreements } = await supabase
    .from('agreements')
    .select('id, nombre, type, status')
    .eq('family_id', family?.id ?? '')
    .order('created_at')

  const pendingAgreements = agreements?.filter(a => !['signed','approved'].includes(a.status)) ?? []
  const event = (family as any)?.events

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Hola'

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="pt-2">
        <p className="text-[9px] font-bold tracking-[0.28em] uppercase text-muted mb-1">
          Bienvenido/a
        </p>
        <h1 className="text-2xl font-bold text-ink leading-tight">
          {firstName}.
        </h1>
        {family?.nombre_familia && (
          <p className="text-[12px] text-muted mt-1">{family.nombre_familia}</p>
        )}
      </div>

      {/* Event card */}
      {event ? (
        <Card>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted mb-3">
            Tu retiro
          </p>
          <p className="text-[15px] font-bold text-ink mb-3">{event.nombre}</p>
          <div className="space-y-2">
            {event.ubicacion && (
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <MapPin size={13} className="flex-shrink-0" />
                <span>{event.ubicacion}{event.ciudad ? `, ${event.ciudad}` : ''}</span>
              </div>
            )}
            {event.fecha_inicio && (
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <Calendar size={13} className="flex-shrink-0" />
                <span>
                  {fmtDate(event.fecha_inicio)}
                  {event.fecha_fin && ` — ${fmtDate(event.fecha_fin)}`}
                </span>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-[12px] text-muted text-center py-4">
            Aún no estás asignado a un evento. Contacta al equipo de Trascendencia.
          </p>
        </Card>
      )}

      {/* Pending agreements — CTA */}
      {pendingAgreements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-warning">
              Acuerdos pendientes
            </p>
            <span className="bg-warning/10 text-warning text-[9px] font-bold px-2 py-0.5 rounded-full">
              {pendingAgreements.length}
            </span>
          </div>
          <div className="space-y-2">
            {pendingAgreements.map(ag => (
              <Link key={ag.id} href={`/acuerdos/${ag.id}`}>
                <Card className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-ink">{ag.nombre}</p>
                  <Badge variant={agreementStatusVariant(ag.status)}>
                    {STATUS_LABELS[ag.status] ?? ag.status}
                  </Badge>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All good */}
      {agreements && agreements.length > 0 && pendingAgreements.length === 0 && (
        <Card className="flex items-center gap-3">
          <CheckCircle size={18} className="text-success flex-shrink-0" />
          <p className="text-[12px] text-ink">
            Todos tus acuerdos están firmados. ¡Listo!
          </p>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/itinerario">
          <Card className="text-center py-5">
            <p className="text-[20px] mb-1">📅</p>
            <p className="text-[11px] font-semibold text-ink">Itinerario</p>
          </Card>
        </Link>
        <Link href="/documentos">
          <Card className="text-center py-5">
            <p className="text-[20px] mb-1">📄</p>
            <p className="text-[11px] font-semibold text-ink">Documentos</p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
