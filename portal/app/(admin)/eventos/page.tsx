import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fmtDateShort } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Eventos' }

const STATUS_LABEL: Record<string, string> = {
  draft:     'Borrador',
  active:    'Activo',
  completed: 'Completado',
  archived:  'Archivado',
}
const STATUS_VARIANT: Record<string, 'muted'|'info'|'success'|'default'> = {
  draft:     'muted',
  active:    'success',
  completed: 'info',
  archived:  'muted',
}

export default async function EventosPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('id, nombre, capitulo, ciudad, pais, fecha_inicio, fecha_fin, status, n_parejas')
    .order('fecha_inicio', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-ink">Eventos</h1>
          <p className="text-[11px] text-muted mt-1">{events?.length ?? 0} registrados</p>
        </div>
        <Link href="/eventos/nuevo">
          <Button size="sm">+ Nuevo evento</Button>
        </Link>
      </div>

      <div className="space-y-2">
        {events?.map(ev => (
          <Link key={ev.id} href={`/eventos/${ev.id}`}>
            <Card className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-ink truncate">{ev.nombre}</p>
                <p className="text-[10px] text-muted mt-0.5">
                  {[ev.ciudad, ev.pais].filter(Boolean).join(', ')}
                  {ev.fecha_inicio && ` · ${fmtDateShort(ev.fecha_inicio)}`}
                  {ev.fecha_fin && ` – ${fmtDateShort(ev.fecha_fin)}`}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {ev.n_parejas && (
                  <span className="hidden sm:block text-[10px] text-muted">
                    {ev.n_parejas} parejas
                  </span>
                )}
                <Badge variant={STATUS_VARIANT[ev.status] ?? 'muted'}>
                  {STATUS_LABEL[ev.status] ?? ev.status}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}

        {events?.length === 0 && (
          <Card>
            <p className="text-[12px] text-muted text-center py-8">
              Aún no hay eventos registrados.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
