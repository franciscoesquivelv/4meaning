'use client'

import { useState } from 'react'
import Link from 'next/link'
import DeleteItemButton from './DeleteItemButton'

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

interface Props {
  eventId: string
  items: Item[]
  isAdmin: boolean
}

const TIPO_COLORS: Record<string, string> = {
  sesion:     'bg-violet-100 text-violet-700',
  taller:     'bg-purple-100 text-purple-700',
  comida:     'bg-amber-100 text-amber-700',
  actividad:  'bg-blue-100 text-blue-700',
  libre:      'bg-slate-100 text-slate-500',
  traslado:   'bg-sky-100 text-sky-700',
  logistica:  'bg-gray-100 text-gray-600',
  bienvenida: 'bg-emerald-100 text-emerald-700',
  cierre:     'bg-red-100 text-red-500',
}

function fmtTime(t: string | null) {
  return t ? t.slice(0, 5) : ''
}

function formatDate(d: string | null) {
  if (!d) return ''
  const raw = new Date(d + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const lower = raw.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

export default function ItinerarioList({ eventId, items, isAdmin }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Group by day
  const byDay: Record<number, Item[]> = {}
  for (const item of items) {
    if (!byDay[item.dia]) byDay[item.dia] = []
    byDay[item.dia].push(item)
  }

  return (
    <div className="space-y-8">
      {Object.entries(byDay)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([dia, dayItems]) => (
          <div key={dia}>
            {/* Day header */}
            <div className="mb-3">
              <h2 className="text-sm font-bold text-slate-900">Día {dia}</h2>
              {dayItems[0]?.fecha && (
                <p className="text-xs text-slate-500 mt-0.5">{formatDate(dayItems[0].fecha)}</p>
              )}
            </div>

            {/* Accordion list */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {dayItems.map((item, i) => {
                const isExpanded = expandedId === item.id
                const tipoCls = TIPO_COLORS[item.tipo] ?? 'bg-slate-100 text-slate-600'
                const hasDetails = !!(
                  item.descripcion ||
                  item.ubicacion ||
                  item.responsable ||
                  item.notas_staff
                )

                return (
                  <div
                    key={item.id}
                    className={i < dayItems.length - 1 ? 'border-b border-slate-100' : ''}
                  >
                    {/* Always-visible row */}
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      {/* Time */}
                      <div className="min-w-[80px] text-xs text-slate-400 flex-shrink-0">
                        {fmtTime(item.hora_inicio)}
                        {item.hora_fin ? ` – ${fmtTime(item.hora_fin)}` : ''}
                      </div>

                      {/* Expand toggle — title + tipo badge */}
                      <button
                        className="flex-1 flex items-center gap-2 text-left min-w-0"
                        onClick={() => hasDetails && setExpandedId(isExpanded ? null : item.id)}
                        disabled={!hasDetails}
                      >
                        <span className="text-sm font-medium text-slate-900 truncate">{item.titulo}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold flex-shrink-0 ${tipoCls}`}>
                          {item.tipo}
                        </span>
                        {item.grupo && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-orange-100 text-orange-700 flex-shrink-0">
                            {item.grupo}
                          </span>
                        )}
                        {item.visibilidad === 'staff_only' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded uppercase tracking-wide flex-shrink-0">
                            STAFF
                          </span>
                        )}
                        {hasDetails && (
                          <svg
                            className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>

                      {/* Actions — always visible */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Link
                          href={`/eventos/${eventId}/itinerario/${item.id}/editar`}
                          className="px-2.5 py-1 text-xs text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                        >
                          Editar
                        </Link>
                        <DeleteItemButton itemId={item.id} />
                      </div>
                    </div>

                    {/* Expandable details */}
                    {isExpanded && hasDetails && (
                      <div className="px-4 pb-4 pt-0 border-t border-slate-50 bg-slate-50/60">
                        <div className="pl-[80px] space-y-2 pt-3">
                          {item.descripcion && (
                            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                              {item.descripcion}
                            </p>
                          )}
                          {item.ubicacion && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {item.ubicacion}
                            </div>
                          )}
                          {item.responsable && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {item.responsable}
                            </div>
                          )}
                          {isAdmin && item.notas_staff && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2">
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 mb-1">
                                Notas para staff
                              </div>
                              <p className="text-xs text-amber-800 whitespace-pre-wrap">{item.notas_staff}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
    </div>
  )
}
