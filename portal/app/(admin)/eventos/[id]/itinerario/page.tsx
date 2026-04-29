import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import DeleteItemButton from './DeleteItemButton'

const tipoColors: Record<string, string> = {
  sesion:     'bg-violet-100 text-violet-700',
  comida:     'bg-[#FEF9C3] text-[#D97706]',
  actividad:  'bg-[#DBEAFE] text-[#2563EB]',
  libre:      'bg-slate-100 text-slate-500',
  traslado:   'bg-sky-100 text-sky-700',
  bienvenida: 'bg-[#DCFCE7] text-[#16A34A]',
  cierre:     'bg-[#FEE2E2] text-[#DC2626]',
}

function TipoBadge({ tipo }: { tipo: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${tipoColors[tipo] ?? 'bg-slate-100 text-slate-600'}`}>
      {tipo}
    </span>
  )
}

function formatTime(t: string | null) {
  if (!t) return ''
  return t.slice(0, 5)
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
}

interface ItineraryItem {
  id: string
  dia: number
  fecha: string | null
  hora_inicio: string | null
  hora_fin: string | null
  titulo: string
  descripcion: string | null
  tipo: string
  visibilidad: string
  ubicacion: string | null
  responsable: string | null
}

export default async function ItinerarioAdminPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: items } = await supabase
    .from('itinerary_items')
    .select('id, dia, fecha, hora_inicio, hora_fin, titulo, descripcion, tipo, visibilidad, ubicacion, responsable')
    .eq('event_id', params.id)
    .order('dia')
    .order('orden')
    .order('hora_inicio')

  const byDay: Record<number, ItineraryItem[]> = {}
  for (const item of (items ?? []) as ItineraryItem[]) {
    if (!byDay[item.dia]) byDay[item.dia] = []
    byDay[item.dia].push(item)
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/eventos" className="hover:text-slate-700 transition-colors">Eventos</Link>
        <span>/</span>
        <Link href={`/eventos/${params.id}`} className="hover:text-slate-700 transition-colors">{evento.nombre}</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Itinerario</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Itinerario</h1>
        <Link
          href={`/eventos/${params.id}/itinerario/nuevo`}
          className="px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          + Agregar item
        </Link>
      </div>

      {!items?.length ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-slate-400 text-sm mb-4">El itinerario está vacío.</p>
          <Link
            href={`/eventos/${params.id}/itinerario/nuevo`}
            className="px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors inline-block"
          >
            Agregar primer item
          </Link>
        </div>
      ) : (
        Object.entries(byDay).map(([dia, dayItems]) => (
          <div key={dia} className="mb-8">
            {/* Day header */}
            <div className="mb-3">
              <h2 className="text-sm font-bold text-slate-900">Día {dia}</h2>
              {dayItems[0]?.fecha && (
                <p className="text-xs text-slate-500 mt-0.5 capitalize">{formatDate(dayItems[0].fecha)}</p>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {dayItems.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex gap-4 items-start px-4 py-3.5 text-sm ${i < dayItems.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  {/* Time */}
                  <div className="min-w-[88px] text-xs text-slate-400 pt-0.5 flex-shrink-0">
                    {formatTime(item.hora_inicio)}
                    {item.hora_fin ? ` – ${formatTime(item.hora_fin)}` : ''}
                  </div>

                  {/* Dot */}
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${tipoColors[item.tipo] ? 'bg-current' : 'bg-slate-300'}`}
                    style={{ color: 'inherit' }}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-slate-900">{item.titulo}</span>
                      <TipoBadge tipo={item.tipo} />
                      {item.visibilidad === 'staff_only' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-[#FEF9C3] text-[#D97706] rounded uppercase tracking-wide">
                          STAFF
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500 flex-wrap">
                      {item.ubicacion && <span>📍 {item.ubicacion}</span>}
                      {item.responsable && <span>👤 {item.responsable}</span>}
                    </div>
                  </div>

                  <DeleteItemButton itemId={item.id} />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
