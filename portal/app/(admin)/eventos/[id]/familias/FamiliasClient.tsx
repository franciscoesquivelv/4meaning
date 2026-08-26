'use client'

import { useState } from 'react'
import Link from 'next/link'
import CheckInButton from './CheckInButton'
import VideoEntregadoButton from './VideoEntregadoButton'

export type EnrichedFamily = {
  id: string
  nombre_familia: string
  nombre1: string | null
  nombre2: string | null
  habitacion: string | null
  status: string | null
  fotos_nube_recibidas: boolean | null
  checked_in_at: string | null
  video_entregado: boolean | null
  video_entregado_at: string | null
  agreementsTotal: number
  agreementsSigned: number
  hasIntake: boolean
  restricciones: string | null
  isCheckedIn: boolean
}

interface Props {
  eventId: string
  enriched: EnrichedFamily[]
  totalFamilias: number
  intakeCount: number
  totalAgreements: number
  signedAgreements: number
  checkInCount: number
  videoEntregadoCount: number
  readyFamilyIds: Set<string>
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    invited:   'bg-violet-100 text-violet-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-slate-100 text-slate-500',
    pending:   'bg-amber-100 text-amber-700',
  }
  const labels: Record<string, string> = {
    invited: 'Invitado', confirmed: 'Confirmado', completed: 'Completado', pending: 'Pendiente',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {labels[status] ?? status}
    </span>
  )
}

export default function FamiliasClient({
  eventId,
  enriched,
  totalFamilias,
  intakeCount,
  totalAgreements,
  signedAgreements,
  checkInCount,
  videoEntregadoCount,
  readyFamilyIds,
}: Props) {
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')

  const isFamilyReady = (familyId: string) => readyFamilyIds.has(familyId)

  const filtered = enriched.filter(f => {
    const matchQuery = !query ||
      f.nombre_familia.toLowerCase().includes(query.toLowerCase()) ||
      (f.nombre1 ?? '').toLowerCase().includes(query.toLowerCase()) ||
      (f.nombre2 ?? '').toLowerCase().includes(query.toLowerCase())

    const matchStatus =
      filterStatus === 'todos' ? true :
      filterStatus === 'lista' ? isFamilyReady(f.id) :
      filterStatus === 'pendiente' ? !isFamilyReady(f.id) :
      filterStatus === 'checked_in' ? f.isCheckedIn : true

    return matchQuery && matchStatus
  })

  const hasActiveFilters = query !== '' || filterStatus !== 'todos'

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Familias</h1>
        <Link
          href={`/eventos/${eventId}/familias/nueva`}
          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          + Agregar familia
        </Link>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex flex-col items-start px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[130px]">
          <span className="text-xs text-slate-500 font-medium mb-1">Total familias</span>
          <span className="text-lg font-bold text-slate-900">{totalFamilias}</span>
        </div>
        <div className="flex flex-col items-start px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[160px]">
          <span className="text-xs text-slate-500 font-medium mb-1">Intake completado</span>
          <span className="text-lg font-bold text-slate-900">{intakeCount}/{totalFamilias}</span>
        </div>
        <div className="flex flex-col items-start px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[170px]">
          <span className="text-xs text-slate-500 font-medium mb-1">Acuerdos firmados</span>
          <span className="text-lg font-bold text-slate-900">{signedAgreements}/{totalAgreements}</span>
        </div>
        <div className="flex flex-col items-start px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[130px]">
          <span className="text-xs text-slate-500 font-medium mb-1">Check-ins</span>
          <span className="text-lg font-bold text-slate-900">{checkInCount}/{totalFamilias}</span>
        </div>
        <div className="flex flex-col items-start px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[160px]">
          <span className="text-xs text-slate-500 font-medium mb-1">Videos entregados</span>
          <span className="text-lg font-bold text-slate-900">{videoEntregadoCount}/{totalFamilias}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Buscar familia..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white min-w-[200px]"
          />
          {hasActiveFilters && (
            <span className="ml-2 text-xs text-slate-500">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          {(['todos', 'lista', 'pendiente', 'checked_in'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filterStatus === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'todos' ? 'Todos' : f === 'lista' ? 'Listas' : f === 'pendiente' ? 'Pendientes' : 'Con check-in'}
            </button>
          ))}
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => { setQuery(''); setFilterStatus('todos') }}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {!enriched.length ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-slate-400 text-sm mb-4">No hay familias registradas en este evento.</p>
          <Link
            href={`/eventos/${eventId}/familias/nueva`}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors inline-block"
          >
            Agregar primera familia
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-slate-400 text-sm">No se encontraron familias con ese filtro.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full min-w-[600px] text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Familia</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Intake</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acuerdos</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Habitación</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dieta</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-in</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Video</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => (
                <tr
                  key={f.id}
                  className={`hover:bg-slate-50 transition-colors ${i < filtered.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  {/* Familia */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{f.nombre_familia}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {f.nombre1}{f.nombre2 ? ` · ${f.nombre2}` : ''}
                    </div>
                  </td>

                  {/* Estado (Lista / Pendiente) */}
                  <td className="px-4 py-3">
                    {isFamilyReady(f.id) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">✓ Lista</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Pendiente</span>
                    )}
                  </td>

                  {/* Intake */}
                  <td className="px-4 py-3">
                    {f.hasIntake ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        ✓ Completo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                        Pendiente
                      </span>
                    )}
                  </td>

                  {/* Acuerdos */}
                  <td className="px-4 py-3">
                    {f.agreementsTotal === 0 ? (
                      <span className="text-slate-400 text-xs">—</span>
                    ) : (
                      <span
                        className={`text-xs font-semibold ${
                          f.agreementsSigned === f.agreementsTotal
                            ? 'text-green-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {f.agreementsSigned}/{f.agreementsTotal}
                      </span>
                    )}
                  </td>

                  {/* Habitación */}
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {f.habitacion || <span className="text-slate-300">—</span>}
                  </td>

                  {/* Dieta */}
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {f.restricciones
                      ? <span title={f.restricciones}>{f.restricciones.slice(0, 20)}{f.restricciones.length > 20 ? '…' : ''}</span>
                      : <span className="text-slate-300">—</span>
                    }
                  </td>

                  {/* Check-in */}
                  <td className="px-4 py-3">
                    <CheckInButton
                      familyId={f.id}
                      checkedInAt={f.checked_in_at ?? null}
                      eventId={eventId}
                    />
                  </td>

                  {/* Video */}
                  <td className="px-4 py-3">
                    {f.video_entregado ? (
                      <div>
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          Entregado
                        </span>
                        {f.video_entregado_at && (
                          <time
                            dateTime={f.video_entregado_at}
                            className="block text-[10px] text-slate-400 mt-0.5"
                          >
                            {new Date(f.video_entregado_at).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </time>
                        )}
                      </div>
                    ) : (
                      <VideoEntregadoButton familyId={f.id} eventId={eventId} />
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/eventos/${eventId}/familias/${f.id}/editar`}
                        className="text-xs text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/eventos/${eventId}/familias/${f.id}/ficha`}
                        className="text-xs text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium"
                      >
                        Ficha
                      </Link>
                      {/* La app tal como la ve esta pareja. Hasta ahora nadie
                          del equipo podía verla: el layout del participante
                          rebota a cualquiera con rol de equipo. */}
                      <Link
                        href={`/eventos/${eventId}/familias/${f.id}/vista`}
                        className="text-xs text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium"
                      >
                        Su app
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
