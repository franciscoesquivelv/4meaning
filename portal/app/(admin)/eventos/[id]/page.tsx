import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge, agreementStatusVariant } from '@/components/ui/badge'
import { Card, CardLabel } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fmtDate, fmtDateShort, STATUS_LABELS } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createClient()
  const { data } = await supabase.from('events').select('nombre').eq('id', params.id).single()
  return { title: data?.nombre ?? 'Evento' }
}

export default async function EventoDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [{ data: event }, { data: families }, { data: agreements }, { data: itinerary }] =
    await Promise.all([
      supabase.from('events').select('*').eq('id', params.id).single(),
      supabase.from('families').select('*').eq('event_id', params.id).order('nombre_familia'),
      supabase.from('agreements').select('*').eq('event_id', params.id).order('created_at'),
      supabase.from('itinerary_items')
        .select('id, dia, hora_inicio, titulo, tipo, visibilidad, responsable')
        .eq('event_id', params.id)
        .order('dia').order('orden').order('hora_inicio')
        .limit(6),
    ])

  if (!event) notFound()

  const signedCount    = agreements?.filter(a => ['signed','approved'].includes(a.status)).length ?? 0
  const confirmedCount = families?.filter(f => f.status === 'confirmed').length ?? 0

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/eventos" className="text-[10px] text-muted hover:text-ink mb-2 inline-block">
            ← Eventos
          </Link>
          <h1 className="text-xl font-bold text-ink">{event.nombre}</h1>
          <p className="text-[11px] text-muted mt-1">
            {[event.ciudad, event.pais].filter(Boolean).join(', ')}
            {event.fecha_inicio && ` · ${fmtDate(event.fecha_inicio)}`}
            {event.fecha_fin && ` – ${fmtDate(event.fecha_fin)}`}
          </p>
        </div>
        <Badge variant={event.status === 'active' ? 'success' : 'muted'}>
          {event.status}
        </Badge>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <p className="text-[9px] text-muted uppercase tracking-wider mb-1">Familias</p>
          <p className="text-2xl font-bold">{families?.length ?? 0}</p>
          <p className="text-[10px] text-muted">{confirmedCount} confirmadas</p>
        </Card>
        <Card>
          <p className="text-[9px] text-muted uppercase tracking-wider mb-1">Acuerdos</p>
          <p className="text-2xl font-bold">{signedCount}</p>
          <p className="text-[10px] text-muted">de {agreements?.length ?? 0} firmados</p>
        </Card>
        <Card>
          <p className="text-[9px] text-muted uppercase tracking-wider mb-1">Parejas</p>
          <p className="text-2xl font-bold">{event.n_parejas ?? '—'}</p>
        </Card>
      </div>

      {/* Action links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { href: 'familias',   label: 'Familias',   count: families?.length },
          { href: 'acuerdos',   label: 'Acuerdos',   count: agreements?.length },
          { href: 'itinerario', label: 'Itinerario',  count: itinerary?.length },
          { href: 'documentos', label: 'Documentos',  count: null },
        ].map(({ href, label, count }) => (
          <Link key={href} href={`/eventos/${event.id}/${href}`}>
            <Card className="text-center py-4">
              <p className="text-[12px] font-semibold text-ink">{label}</p>
              {count != null && (
                <p className="text-[10px] text-muted mt-1">{count} registros</p>
              )}
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent agreements */}
      {agreements && agreements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted">
              Acuerdos recientes
            </p>
            <Link href={`/eventos/${event.id}/acuerdos`} className="text-[10px] text-muted hover:text-ink">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-2">
            {agreements.slice(0, 5).map((ag: any) => (
              <Card key={ag.id} className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-ink">{ag.nombre}</p>
                  <p className="text-[10px] text-muted mt-0.5 capitalize">{ag.type}</p>
                </div>
                <Badge variant={agreementStatusVariant(ag.status)}>
                  {STATUS_LABELS[ag.status] ?? ag.status}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Itinerary preview */}
      {itinerary && itinerary.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted">
              Itinerario (próximos items)
            </p>
            <Link href={`/eventos/${event.id}/itinerario`} className="text-[10px] text-muted hover:text-ink">
              Ver completo →
            </Link>
          </div>
          <div className="space-y-1.5">
            {itinerary.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 bg-surface border border-border rounded">
                <span className="text-[10px] text-muted font-mono w-10 flex-shrink-0">
                  {item.hora_inicio?.slice(0, 5) ?? '—'}
                </span>
                <span className="text-[12px] text-ink flex-1 truncate">{item.titulo}</span>
                {item.visibilidad === 'staff_only' && (
                  <Badge variant="warning">Staff</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
