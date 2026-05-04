import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import CheckInButton from '../familias/CheckInButton'

function formatTime(time: string | null) {
  if (!time) return ''
  return time.slice(0, 5)
}

function tipoBadge(tipo: string) {
  const map: Record<string, string> = {
    sesion:      'bg-violet-100 text-violet-700',
    comida:      'bg-amber-100 text-amber-700',
    actividad:   'bg-green-100 text-green-700',
    libre:       'bg-slate-100 text-slate-500',
    logistica:   'bg-blue-100 text-blue-700',
  }
  return map[tipo] ?? 'bg-slate-100 text-slate-600'
}

function formatDayDate(dia: string | null) {
  if (!dia) return ''
  return new Date(dia + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export default async function OperacionPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre, fecha_inicio, fecha_fin')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  // Determine today's date for filtering itinerary
  const today = new Date().toISOString().slice(0, 10)

  const [
    { data: families },
    { data: allItems },
    { data: announcements },
  ] = await Promise.all([
    supabase
      .from('families')
      .select('id, nombre_familia, nombre1, nombre2, habitacion, status, checked_in_at, notas')
      .eq('event_id', params.id)
      .order('nombre_familia'),
    supabase
      .from('itinerary_items')
      .select('id, dia, hora_inicio, hora_fin, titulo, tipo, ubicacion, descripcion')
      .eq('event_id', params.id)
      .order('dia')
      .order('orden')
      .order('hora_inicio'),
    supabase
      .from('announcements')
      .select('id, titulo, tipo, created_at')
      .eq('event_id', params.id)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const familyList = families ?? []
  const itemsList  = allItems ?? []
  const annoList   = announcements ?? []

  const checkedInCount = familyList.filter(f => f.checked_in_at != null).length

  // Group itinerary by day
  const days = Array.from(new Set(itemsList.map(i => i.dia).filter(Boolean))) as string[]
  const groupedByDay = days.map(dia => ({
    dia,
    items: itemsList.filter(i => i.dia === dia),
  }))

  // Today's items
  const todayItems = itemsList.filter(i => i.dia === today)
  const showToday = todayItems.length > 0

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/eventos" className="hover:text-slate-700 transition-colors">Eventos</Link>
        <span>/</span>
        <Link href={`/eventos/${params.id}`} className="hover:text-slate-700 transition-colors">{evento.nombre}</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Operación</span>
      </nav>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modo operación</h1>
          <p className="text-sm text-slate-500 mt-1">{evento.nombre} · Vista para facilitadores</p>
        </div>
        <Link
          href={`/eventos/${params.id}/avisos`}
          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
        >
          + Publicar aviso
        </Link>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex flex-col items-start px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <span className="text-xs text-slate-500 font-medium mb-1">Check-in</span>
          <span className="text-lg font-bold text-slate-900">
            {checkedInCount}/{familyList.length}
            {checkedInCount === familyList.length && familyList.length > 0 && (
              <span className="ml-2 text-sm font-normal text-green-600">✓ Todos</span>
            )}
          </span>
        </div>
        <div className="flex flex-col items-start px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <span className="text-xs text-slate-500 font-medium mb-1">Avisos publicados</span>
          <span className="text-lg font-bold text-slate-900">{annoList.length}</span>
        </div>
        {showToday && (
          <div className="flex flex-col items-start px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-xs text-slate-500 font-medium mb-1">Actividades hoy</span>
            <span className="text-lg font-bold text-slate-900">{todayItems.length}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: Check-in + Families */}
        <div className="col-span-3 space-y-6">
          {/* Check-in table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Check-in de familias</h2>
              <Link
                href={`/eventos/${params.id}/familias`}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Ver detalle →
              </Link>
            </div>
            {familyList.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">Sin familias.</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {familyList.map((f, i) => (
                    <tr
                      key={f.id}
                      className={`${i < familyList.length - 1 ? 'border-b border-slate-100' : ''} ${f.checked_in_at ? 'bg-green-50/50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{f.nombre_familia}</div>
                        <div className="text-xs text-slate-400">
                          {f.nombre1}{f.nombre2 ? ` · ${f.nombre2}` : ''}
                          {f.habitacion ? ` · Hab. ${f.habitacion}` : ''}
                        </div>
                        {f.notas && (
                          <div className="text-xs text-amber-700 mt-0.5 bg-amber-50 px-2 py-0.5 rounded inline-block">
                            {f.notas}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <CheckInButton
                          familyId={f.id}
                          checkedInAt={f.checked_in_at ?? null}
                          eventId={params.id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Families not checked in — quick alerts */}
          {familyList.some(f => !f.checked_in_at) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                Pendientes de llegar
              </p>
              <div className="flex flex-wrap gap-2">
                {familyList.filter(f => !f.checked_in_at).map(f => (
                  <span
                    key={f.id}
                    className="px-3 py-1 bg-white border border-amber-200 text-amber-800 text-xs rounded-full font-medium"
                  >
                    {f.nombre_familia}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Today's program + Announcements */}
        <div className="col-span-2 space-y-5">
          {/* Avisos recientes */}
          {annoList.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">Avisos recientes</h2>
                <Link
                  href={`/eventos/${params.id}/avisos`}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {annoList.slice(0, 3).map(a => (
                  <div key={a.id} className="px-4 py-3">
                    <p className="text-xs font-semibold text-slate-900">{a.titulo}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(a.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's itinerary */}
          {showToday && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">Hoy</h2>
                <span className="text-xs text-slate-400 capitalize">{formatDayDate(today)}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {todayItems.map(item => (
                  <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                    <div className="text-xs text-slate-400 font-mono shrink-0 pt-0.5">
                      {formatTime(item.hora_inicio)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-900">{item.titulo}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tipoBadge(item.tipo ?? '')}`}>
                          {item.tipo}
                        </span>
                      </div>
                      {item.ubicacion && (
                        <p className="text-xs text-slate-400 mt-0.5">{item.ubicacion}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full program condensed */}
          {!showToday && groupedByDay.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">Programa completo</h2>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {groupedByDay.map(({ dia, items }) => (
                  <div key={dia} className="px-4 py-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      {formatDayDate(dia)}
                    </p>
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-2 text-xs text-slate-700 mb-1">
                        <span className="font-mono text-slate-400 shrink-0">{formatTime(item.hora_inicio)}</span>
                        <span>{item.titulo}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fichas rápidas */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Fichas de familias</h2>
            <div className="space-y-1.5">
              {familyList.slice(0, 8).map(f => (
                <Link
                  key={f.id}
                  href={`/eventos/${params.id}/familias/${f.id}/ficha`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm group"
                >
                  <span className="text-slate-700 font-medium group-hover:text-slate-900">{f.nombre_familia}</span>
                  <span className="text-slate-300 group-hover:text-slate-500 text-xs">Ver →</span>
                </Link>
              ))}
              {familyList.length > 8 && (
                <Link
                  href={`/eventos/${params.id}/familias`}
                  className="block text-center text-xs text-slate-400 hover:text-slate-600 pt-1 transition-colors"
                >
                  + {familyList.length - 8} más
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
