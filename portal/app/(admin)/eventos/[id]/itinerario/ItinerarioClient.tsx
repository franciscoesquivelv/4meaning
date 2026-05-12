'use client'

import { useState } from 'react'
import Link from 'next/link'

type Item = {
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
  grupo: string | null
  notas_staff: string | null
  orden: number
}
type TeamMember = { id: string; nombre: string; rol: string }

interface Props {
  eventId: string
  eventName: string
  items: Item[]
  teamMembers: TeamMember[]
  isAdmin: boolean
}

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const fmtTime = (t: string | null) => t ? t.slice(0, 5) : ''

const TIPO_COLORS: Record<string, string> = {
  sesion: 'bg-violet-100 text-violet-700',
  taller: 'bg-purple-100 text-purple-700',
  comida: 'bg-amber-100 text-amber-700',
  actividad: 'bg-blue-100 text-blue-700',
  libre: 'bg-slate-100 text-slate-500',
  traslado: 'bg-sky-100 text-sky-700',
  logistica: 'bg-gray-100 text-gray-600',
  bienvenida: 'bg-emerald-100 text-emerald-700',
  cierre: 'bg-red-100 text-red-500',
}

function TipoBadge({ tipo }: { tipo: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${TIPO_COLORS[tipo] ?? 'bg-slate-100 text-slate-600'}`}>
      {tipo}
    </span>
  )
}

function GrupoBadge({ grupo }: { grupo: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-orange-100 text-orange-700">
      {grupo}
    </span>
  )
}

function formatDate(d: string | null) {
  if (!d) return ''
  const raw = new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
  const lower = raw.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

// ── Cascade View ────────────────────────────────────────────────────────────
function CascadeView({ items, eventId, onSelect }: { items: Item[]; eventId: string; onSelect: (item: Item) => void }) {
  const byDay: Record<number, Item[]> = {}
  for (const item of items) {
    if (!byDay[item.dia]) byDay[item.dia] = []
    byDay[item.dia].push(item)
  }

  return (
    <div>
      {Object.entries(byDay)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([dia, dayItems]) => {
          // Group by hora_inicio for side-by-side rendering
          const groups: Item[][] = []
          const seen = new Map<string | null, Item[]>()
          for (const item of dayItems) {
            const key = item.hora_inicio ?? `__no_time_${item.id}`
            if (item.hora_inicio && seen.has(item.hora_inicio)) {
              seen.get(item.hora_inicio)!.push(item)
            } else {
              const group = [item]
              seen.set(item.hora_inicio, group)
              groups.push(group)
            }
          }

          return (
            <div key={dia} className="mb-8">
              <div className="mb-3">
                <h2 className="text-sm font-bold text-slate-900">Día {dia}</h2>
                {dayItems[0]?.fecha && (
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(dayItems[0].fecha)}</p>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {groups.map((group, gi) => (
                  <div
                    key={gi}
                    className={`flex gap-0 ${gi < groups.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    {group.map((item, ii) => (
                      <div
                        key={item.id}
                        className={`flex gap-4 items-start px-4 py-3.5 text-sm flex-1 ${ii < group.length - 1 ? 'border-r border-slate-100' : ''}`}
                      >
                        {/* Time */}
                        <div className="min-w-[88px] text-xs text-slate-400 pt-0.5 flex-shrink-0">
                          {fmtTime(item.hora_inicio)}
                          {item.hora_fin ? ` – ${fmtTime(item.hora_fin)}` : ''}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <button
                              onClick={() => onSelect(item)}
                              className="font-medium text-slate-900 hover:text-violet-700 transition-colors text-left"
                            >
                              {item.titulo}
                            </button>
                            <TipoBadge tipo={item.tipo} />
                            {item.grupo && <GrupoBadge grupo={item.grupo} />}
                            {item.visibilidad === 'staff_only' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded uppercase tracking-wide">
                                STAFF
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 text-xs text-slate-500 flex-wrap">
                            {item.ubicacion && <span>📍 {item.ubicacion}</span>}
                            {item.responsable && <span>👤 {item.responsable}</span>}
                          </div>
                        </div>

                        {/* Edit */}
                        <Link
                          href={`/eventos/${eventId}/itinerario/${item.id}/editar`}
                          className="px-2.5 py-1 text-xs text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap flex-shrink-0"
                        >
                          Editar
                        </Link>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
    </div>
  )
}

// ── Column assignment for overlapping items ──────────────────────────────────
function assignColumns(items: Item[]): (Item & { col: number })[] {
  const sorted = [...items].filter(i => i.hora_inicio).sort((a, b) =>
    (a.hora_inicio!).localeCompare(b.hora_inicio!)
  )
  const colEnds: string[] = []
  return sorted.map(item => {
    const end = item.hora_fin ?? (() => {
      const totalMin = toMin(item.hora_inicio!) + 60
      const endH = Math.floor(totalMin / 60) % 24
      const endM = totalMin % 60
      return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
    })()
    let col = colEnds.findIndex(e => e <= item.hora_inicio!)
    if (col === -1) { col = colEnds.length; colEnds.push(end) } else { colEnds[col] = end }
    return { ...item, col }
  })
}

// ── Calendar View ────────────────────────────────────────────────────────────
function CalendarView({ items, eventId, onSelect }: { items: Item[]; eventId: string; onSelect: (item: Item) => void }) {
  const days = Array.from(new Set(items.map(i => i.dia))).sort((a, b) => a - b)
  const [selectedDay, setSelectedDay] = useState(days[0] ?? 1)

  const dayItems = items.filter(i => i.dia === selectedDay)
  const timedItems = dayItems.filter(i => i.hora_inicio)
  const untimedItems = dayItems.filter(i => !i.hora_inicio)
  const withCols = assignColumns(timedItems)
  const colCount = withCols.length > 0 ? Math.max(...withCols.map(i => i.col)) + 1 : 1

  // Time range
  const startHour = timedItems.length > 0
    ? Math.floor(Math.min(...timedItems.map(i => toMin(i.hora_inicio!))) / 60)
    : 7
  const endHour = timedItems.length > 0
    ? Math.ceil(Math.max(...timedItems.map(i => toMin(i.hora_fin ?? i.hora_inicio!) + 30)) / 60)
    : 22
  const clampedStart = Math.max(0, startHour - 1)
  const clampedEnd = Math.min(24, endHour + 1)

  const slots = []
  for (let h = clampedStart; h < clampedEnd; h++) {
    slots.push(h * 60)
    slots.push(h * 60 + 30)
  }

  function slotIndex(minutes: number) {
    return Math.round((minutes - clampedStart * 60) / 30) + 1
  }

  const dayItem0 = dayItems[0]

  return (
    <div>
      {/* Day tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-6">
        {days.map(day => {
          const di = items.find(i => i.dia === day)
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={[
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                selectedDay === day
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              Día {day}
              {di?.fecha && (
                <span className="ml-1.5 text-xs text-slate-400 font-normal">
                  {new Date(di.fecha + 'T12:00:00').toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {dayItem0?.fecha && (
        <p className="text-xs text-slate-500 mb-4">{formatDate(dayItem0.fecha)}</p>
      )}

      {timedItems.length === 0 && untimedItems.length === 0 ? (
        <p className="text-sm text-slate-400">Sin items este día.</p>
      ) : (
        <>
          {/* CSS Grid schedule */}
          {timedItems.length > 0 && (
            <div className="overflow-x-auto">
              <div
                className="relative bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `64px repeat(${colCount}, minmax(120px, 1fr))`,
                  gridTemplateRows: `repeat(${slots.length}, 48px)`,
                }}
              >
                {/* Time labels */}
                {slots.map((min, si) => (
                  min % 60 === 0 && (
                    <div
                      key={min}
                      className="text-xs text-slate-400 flex items-start justify-end pr-2 pt-1.5 border-r border-slate-100"
                      style={{ gridRow: si + 1, gridColumn: 1 }}
                    >
                      {String(min / 60).padStart(2, '0')}:00
                    </div>
                  )
                ))}

                {/* Horizontal grid lines */}
                {slots.map((min, si) => (
                  <div
                    key={`line-${min}`}
                    className={`border-t ${min % 60 === 0 ? 'border-slate-200' : 'border-slate-100'}`}
                    style={{ gridRow: si + 1, gridColumn: `2 / ${colCount + 2}` }}
                  />
                ))}

                {/* Items */}
                {withCols.map(item => {
                  const startMin = toMin(item.hora_inicio!)
                  const endMin = item.hora_fin
                    ? toMin(item.hora_fin)
                    : startMin + 60
                  const rowStart = slotIndex(startMin)
                  const rowEnd = slotIndex(endMin)
                  const color = TIPO_COLORS[item.tipo] ?? 'bg-slate-100 text-slate-600'

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item)}
                      className={`m-0.5 rounded-lg p-1.5 text-left overflow-hidden ${color} hover:opacity-80 transition-opacity`}
                      style={{
                        gridRow: `${rowStart} / ${rowEnd}`,
                        gridColumn: item.col + 2,
                      }}
                    >
                      <div className="text-xs font-semibold leading-tight truncate">{item.titulo}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">
                        {fmtTime(item.hora_inicio)} – {fmtTime(item.hora_fin)}
                      </div>
                      {item.grupo && (
                        <div className="text-[10px] opacity-75 truncate">{item.grupo}</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sin hora section */}
          {untimedItems.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Sin hora asignada</h3>
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {untimedItems.map((item, i) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-3 text-sm ${i < untimedItems.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <button
                      onClick={() => onSelect(item)}
                      className="font-medium text-slate-900 hover:text-violet-700 transition-colors flex-1 text-left"
                    >
                      {item.titulo}
                    </button>
                    <TipoBadge tipo={item.tipo} />
                    {item.grupo && <GrupoBadge grupo={item.grupo} />}
                    <Link
                      href={`/eventos/${eventId}/itinerario/${item.id}/editar`}
                      className="px-2.5 py-1 text-xs text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Editar
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Item Modal ───────────────────────────────────────────────────────────────
function ItemModal({ item, eventId, isAdmin, onClose }: { item: Item; eventId: string; isAdmin: boolean; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-[480px] w-full max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          ✕
        </button>

        <div className="p-6">
          {/* Title + badges */}
          <div className="mb-4 pr-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">{item.titulo}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <TipoBadge tipo={item.tipo} />
              {item.grupo && <GrupoBadge grupo={item.grupo} />}
              {item.visibilidad === 'staff_only' && (
                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded uppercase tracking-wide">STAFF</span>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-2 text-sm text-slate-600 mb-4">
            <div className="text-slate-500 text-xs">
              Día {item.dia}{item.fecha ? ` · ${formatDate(item.fecha)}` : ''}
            </div>

            {(item.hora_inicio || item.hora_fin) && (
              <div>{fmtTime(item.hora_inicio)} {item.hora_fin ? `– ${fmtTime(item.hora_fin)}` : ''}</div>
            )}

            {item.descripcion && (
              <p className="text-slate-700 whitespace-pre-wrap">{item.descripcion}</p>
            )}

            {item.ubicacion && (
              <div>📍 {item.ubicacion}</div>
            )}

            {item.responsable && (
              <div>👤 {item.responsable}</div>
            )}

            <div className="text-xs text-slate-400">
              Visibilidad: {item.visibilidad === 'all' ? 'Todos' : item.visibilidad === 'participant' ? 'Participantes' : 'Solo staff'}
            </div>
          </div>

          {/* Staff notes */}
          {isAdmin && item.notas_staff && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
              <div className="font-semibold text-xs uppercase tracking-wide text-amber-600 mb-1">Notas para staff</div>
              <p className="whitespace-pre-wrap">{item.notas_staff}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              href={`/eventos/${eventId}/itinerario/${item.id}/editar`}
              className="px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Editar
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function ItinerarioClient({ eventId, eventName, items, teamMembers: _teamMembers, isAdmin }: Props) {
  const [view, setView] = useState<'cascade' | 'calendar'>('cascade')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  return (
    <div>
      {/* View toggle */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setView('cascade')}
            className={[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              view === 'cascade' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            ☰ Lista
          </button>
          <button
            onClick={() => setView('calendar')}
            className={[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              view === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            ⏱ Horario
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-slate-400 text-sm mb-4">El itinerario está vacío.</p>
          <Link
            href={`/eventos/${eventId}/itinerario/nuevo`}
            className="px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors inline-block"
          >
            Agregar primer item
          </Link>
        </div>
      ) : view === 'cascade' ? (
        <CascadeView items={items} eventId={eventId} onSelect={setSelectedItem} />
      ) : (
        <CalendarView items={items} eventId={eventId} onSelect={setSelectedItem} />
      )}

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          eventId={eventId}
          isAdmin={isAdmin}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  )
}
