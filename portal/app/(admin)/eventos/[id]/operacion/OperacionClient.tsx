'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import CheckInButton from '../familias/CheckInButton'
import { toggleDelayed } from './actions'

// ─── Types ────────────────────────────────────────────────────────────────────

type Rol = 'facilitador' | 'coordinador' | 'director'

interface ItineraryItem {
  id: string
  dia: string | null
  hora_inicio: string | null
  hora_fin: string | null
  titulo: string | null
  tipo: string | null
  ubicacion: string | null
  descripcion: string | null
  delayed: boolean | null
}

interface Family {
  id: string
  nombre_familia: string | null
  nombre1: string | null
  nombre2: string | null
  habitacion: string | null
  status: string | null
  checked_in_at: string | null
  notas: string | null
}

interface Announcement {
  id: string
  titulo: string | null
  tipo: string | null
  created_at: string
}

interface Props {
  evento: { id: string; nombre: string; fecha_inicio: string | null; fecha_fin: string | null }
  families: Family[]
  items: ItineraryItem[]
  announcements: Announcement[]
  today: string
  suggestedRole: Rol | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(time: string | null): string {
  if (!time) return '--:--'
  return time.slice(0, 5)
}


function tipoBadgeClass(tipo: string | null): string {
  const map: Record<string, string> = {
    sesion:    'bg-violet-100 text-violet-700',
    taller:    'bg-indigo-100 text-indigo-700',
    comida:    'bg-amber-100 text-amber-700',
    actividad: 'bg-green-100 text-green-700',
    libre:     'bg-slate-100 text-slate-500',
    logistica: 'bg-blue-100 text-blue-700',
  }
  return map[tipo ?? ''] ?? 'bg-slate-100 text-slate-600'
}

/**
 * Returns the itinerary item currently active based on wall-clock time.
 * Compares hora_inicio / hora_fin (HH:MM:SS strings) against current HH:MM.
 */
function getCurrentItem(items: ItineraryItem[], today: string): ItineraryItem | null {
  const nowHHMM = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const todayItems = items.filter(i => String(i.dia) === today)
  return (
    todayItems.find(i => {
      const start = i.hora_inicio?.slice(0, 5) ?? '00:00'
      const end   = i.hora_fin?.slice(0, 5)   ?? '23:59'
      return nowHHMM >= start && nowHHMM < end
    }) ?? null
  )
}

function getNextItems(items: ItineraryItem[], today: string, count: number): ItineraryItem[] {
  const nowHHMM = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
  return items
    .filter(i => String(i.dia) === today && (i.hora_inicio?.slice(0, 5) ?? '00:00') > nowHHMM)
    .slice(0, count)
}

function getNextImportantSession(items: ItineraryItem[], today: string): ItineraryItem | null {
  const nowHHMM = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
  return (
    items.find(i =>
      String(i.dia) === today &&
      (i.tipo === 'sesion' || i.tipo === 'taller') &&
      (i.hora_inicio?.slice(0, 5) ?? '00:00') > nowHHMM
    ) ?? null
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroNow({ item }: { item: ItineraryItem | null }) {
  const label = item ? 'Ahora mismo' : 'Próxima actividad'
  return (
    <div className="rounded-2xl bg-[#0C0C0C] text-white p-8 mb-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{label}</p>
      {item ? (
        <>
          <h2 className="text-2xl font-semibold leading-tight mb-2">{item.titulo}</h2>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-slate-300 text-sm font-mono">
              {formatTime(item.hora_inicio)} – {formatTime(item.hora_fin)}
            </span>
            {item.tipo && (
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${tipoBadgeClass(item.tipo)}`}>
                {item.tipo}
              </span>
            )}
          </div>
          {item.ubicacion && (
            <p className="text-xs text-slate-500 mt-2">{item.ubicacion}</p>
          )}
        </>
      ) : (
        <p className="text-slate-500 text-sm">No hay actividades programadas para hoy.</p>
      )}
    </div>
  )
}

function NextItemsCard({ items }: { items: ItineraryItem[] }) {
  if (items.length === 0) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-3 border-b border-slate-100">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">A continuación</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map(item => (
          <div key={item.id} className="px-5 py-3 flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400 shrink-0 w-10">{formatTime(item.hora_inicio)}</span>
            <span className="text-sm font-semibold text-slate-900 flex-1 truncate">{item.titulo}</span>
            {item.tipo && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${tipoBadgeClass(item.tipo)}`}>
                {item.tipo}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CheckInCounter({ checked, total }: { checked: number; total: number }) {
  const all = total > 0 && checked === total
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-5 py-4 flex items-center justify-between mb-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Check-in familias</p>
        <p className="text-2xl font-bold text-slate-900">
          {checked}
          <span className="text-sm font-normal text-slate-400 ml-1">/ {total}</span>
        </p>
      </div>
      {all ? (
        <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          Todos llegaron
        </span>
      ) : (
        <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
          {total - checked} pendientes
        </span>
      )}
    </div>
  )
}

// ─── Vista Facilitador ────────────────────────────────────────────────────────

function VistaFacilitador({
  items, families, announcements, today, eventId,
}: {
  items: ItineraryItem[]
  families: Family[]
  announcements: Announcement[]
  today: string
  eventId: string
}) {
  const current = getCurrentItem(items, today) ?? getNextItems(items, today, 1)[0] ?? null
  const next    = getNextItems(items, today, 3)
  const checked = families.filter(f => f.checked_in_at != null).length

  return (
    <div>
      <HeroNow item={current} />
      <NextItemsCard items={next} />
      <CheckInCounter checked={checked} total={families.length} />

      {announcements.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avisos recientes</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {announcements.slice(0, 3).map(a => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <span className="text-sm text-slate-900">{a.titulo}</span>
                <span className="text-xs text-slate-400">
                  {new Date(a.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        href={`/eventos/${eventId}/avisos`}
        className="flex items-center justify-center w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
      >
        + Publicar aviso
      </Link>
    </div>
  )
}

// ─── Vista Coordinador ────────────────────────────────────────────────────────

function VistaCoordinador({
  items, families, announcements, today, eventId,
}: {
  items: ItineraryItem[]
  families: Family[]
  announcements: Announcement[]
  today: string
  eventId: string
}) {
  const current = getCurrentItem(items, today) ?? getNextItems(items, today, 1)[0] ?? null
  const pending  = families.filter(f => !f.checked_in_at)
  const arrived  = families.filter(f => f.checked_in_at != null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main: Check-in table */}
      <div className="lg:col-span-2 space-y-4">
        {/* Pending top */}
        {pending.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-3">
              Pendientes de llegar — {pending.length}
            </p>
            <div className="space-y-2">
              {pending.map(f => (
                <div key={f.id} className="flex items-center justify-between bg-white border border-amber-200 rounded-lg px-4 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{f.nombre_familia}</p>
                    <p className="text-xs text-slate-400">
                      {f.nombre1}{f.nombre2 ? ` · ${f.nombre2}` : ''}
                      {f.habitacion ? ` · Hab. ${f.habitacion}` : ''}
                    </p>
                    {f.notas && (
                      <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded mt-1 inline-block">
                        {f.notas}
                      </span>
                    )}
                  </div>
                  <CheckInButton familyId={f.id} checkedInAt={f.checked_in_at} eventId={eventId} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Arrived */}
        {arrived.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Familias registradas</h3>
              <span className="text-xs text-slate-400">{arrived.length} familias</span>
            </div>
            <div className="divide-y divide-slate-100">
              {arrived.map(f => (
                <div key={f.id} className="px-5 py-3 flex items-center justify-between bg-green-50/30">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{f.nombre_familia}</p>
                    <p className="text-xs text-slate-400">
                      {f.nombre1}{f.nombre2 ? ` · ${f.nombre2}` : ''}
                      {f.habitacion ? ` · Hab. ${f.habitacion}` : ''}
                    </p>
                  </div>
                  <CheckInButton familyId={f.id} checkedInAt={f.checked_in_at} eventId={eventId} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Current activity compact */}
        <div className="rounded-xl bg-[#0C0C0C] text-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            {current ? 'Ahora mismo' : 'Sin actividad activa'}
          </p>
          {current ? (
            <>
              <p className="text-base font-semibold leading-snug mb-1">{current.titulo}</p>
              <p className="text-xs font-mono text-slate-400">
                {formatTime(current.hora_inicio)} – {formatTime(current.hora_fin)}
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-500">—</p>
          )}
        </div>

        {/* Recent announcements */}
        {announcements.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avisos recientes</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {announcements.slice(0, 4).map(a => (
                <div key={a.id} className="px-4 py-2.5">
                  <p className="text-xs font-semibold text-slate-900">{a.titulo}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(a.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          href={`/eventos/${eventId}/avisos`}
          className="flex items-center justify-center w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
        >
          + Publicar aviso
        </Link>
      </div>
    </div>
  )
}

// ─── Vista Director de Foto ───────────────────────────────────────────────────

function DelayToggleButton({
  item,
  eventId,
}: {
  item: ItineraryItem
  eventId: string
}) {
  const [isPending, startTransition] = useTransition()
  const isDelayed = item.delayed ?? false

  function handleToggle() {
    startTransition(async () => {
      await toggleDelayed(item.id, !isDelayed, eventId)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all disabled:opacity-50 ${
        isDelayed
          ? 'bg-red-100 border-red-300 text-red-700'
          : 'bg-transparent border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
      }`}
    >
      {isPending ? '…' : isDelayed ? 'ATRASADO' : 'Atrasado'}
    </button>
  )
}

function VistaDirector({
  items, today, eventId,
}: {
  items: ItineraryItem[]
  today: string
  eventId: string
}) {
  const todayItems      = items.filter(i => String(i.dia) === today)
  const nextImportant   = getNextImportantSession(items, today)
  const nowHHMM = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })

  return (
    <div>
      {/* Next important session hero */}
      {nextImportant && (
        <div className="rounded-2xl bg-[#0C0C0C] text-white p-8 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Siguiente sesión importante</p>
          <h2 className="text-2xl font-semibold leading-tight mb-2">{nextImportant.titulo}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-slate-300 text-sm font-mono">
              {formatTime(nextImportant.hora_inicio)} – {formatTime(nextImportant.hora_fin)}
            </span>
            {nextImportant.tipo && (
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${tipoBadgeClass(nextImportant.tipo)}`}>
                {nextImportant.tipo}
              </span>
            )}
          </div>
          {nextImportant.descripcion && (
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">{nextImportant.descripcion}</p>
          )}
        </div>
      )}

      {/* Full day itinerary */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Programa del día</h3>
        </div>
        {todayItems.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">
            No hay actividades para hoy.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayItems.map(item => {
              const isDelayed  = item.delayed ?? false
              const isPast     = (item.hora_fin?.slice(0, 5) ?? '23:59') < nowHHMM
              const isActive   = (item.hora_inicio?.slice(0, 5) ?? '00:00') <= nowHHMM &&
                                 (item.hora_fin?.slice(0, 5)   ?? '23:59') >  nowHHMM

              return (
                <div
                  key={item.id}
                  className={`px-5 py-4 flex items-start gap-4 transition-colors ${
                    isDelayed
                      ? 'border-l-4 border-amber-400 bg-amber-50/30'
                      : isActive
                      ? 'bg-slate-50'
                      : ''
                  }`}
                >
                  {/* Time column */}
                  <div className="shrink-0 w-14 pt-0.5">
                    <p className={`text-xs font-mono ${isPast ? 'text-slate-300' : 'text-slate-500'}`}>
                      {formatTime(item.hora_inicio)}
                    </p>
                    <p className={`text-[10px] font-mono ${isPast ? 'text-slate-200' : 'text-slate-300'}`}>
                      {formatTime(item.hora_fin)}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-sm font-semibold ${isPast ? 'text-slate-400' : 'text-slate-900'}`}>
                        {item.titulo}
                      </span>
                      {isDelayed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 uppercase tracking-wide">
                          Atrasado
                        </span>
                      )}
                      {isActive && !isDelayed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white uppercase tracking-wide">
                          Ahora
                        </span>
                      )}
                    </div>
                    {item.tipo && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tipoBadgeClass(item.tipo)}`}>
                        {item.tipo}
                      </span>
                    )}
                    {item.ubicacion && (
                      <p className="text-[11px] text-slate-400 mt-1">{item.ubicacion}</p>
                    )}
                  </div>

                  {/* Delay toggle */}
                  <div className="shrink-0 pt-0.5">
                    <DelayToggleButton item={item} eventId={eventId} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main client component ─────────────────────────────────────────────────────

export default function OperacionClient({ evento, families, items, announcements, today, suggestedRole }: Props) {
  const eventId = evento.id
  const [rol, setRol] = useState<Rol>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`op_role_${eventId}`) as Rol | null
      if (saved && ['facilitador', 'coordinador', 'director'].includes(saved)) return saved
    }
    return suggestedRole ?? 'facilitador'
  })

  // Sync from localStorage on mount (handles SSR mismatch)
  useEffect(() => {
    const saved = localStorage.getItem(`op_role_${eventId}`) as Rol | null
    if (saved && ['facilitador', 'coordinador', 'director'].includes(saved)) {
      setRol(saved)
    }
  }, [eventId])

  function changeRol(newRol: Rol) {
    setRol(newRol)
    localStorage.setItem(`op_role_${eventId}`, newRol)
  }

  const roles: { key: Rol; label: string }[] = [
    { key: 'facilitador', label: 'Facilitador' },
    { key: 'coordinador', label: 'Coordinador' },
    { key: 'director',    label: 'Director de Foto' },
  ]

  return (
    <div className="pt-6 px-8 max-w-5xl">
      {/* Role selector */}
      <div className="flex items-center gap-2 mb-8">
        {roles.map(r => (
          <button
            key={r.key}
            onClick={() => changeRol(r.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              rol === r.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 bg-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Role views with fade transition */}
      <div className="transition-opacity duration-200">
        {rol === 'facilitador' && (
          <VistaFacilitador
            items={items}
            families={families}
            announcements={announcements}
            today={today}
            eventId={evento.id}
          />
        )}
        {rol === 'coordinador' && (
          <VistaCoordinador
            items={items}
            families={families}
            announcements={announcements}
            today={today}
            eventId={evento.id}
          />
        )}
        {rol === 'director' && (
          <VistaDirector
            items={items}
            today={today}
            eventId={evento.id}
          />
        )}
      </div>
    </div>
  )
}
