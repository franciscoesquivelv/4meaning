// Run this SQL migration before deploying:
// alter table public.families add column if not exists checked_in_at timestamptz;
// alter table public.families add column if not exists video_entregado boolean not null default false;
// alter table public.families add column if not exists video_entregado_at timestamptz;

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import CheckInButton from './CheckInButton'
import VideoEntregadoButton from './VideoEntregadoButton'

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

function StatChip({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div className="flex flex-col items-start px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[130px]">
      <span className="text-xs text-slate-500 font-medium mb-1">{label}</span>
      <span className="text-lg font-bold text-slate-900">
        {total > 0 && label !== 'Total familias' ? `${value}/${total}` : value}
      </span>
    </div>
  )
}

export default async function FamiliasPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: families } = await supabase
    .from('families')
    .select('id, nombre_familia, nombre1, nombre2, habitacion, status, fotos_nube_recibidas, checked_in_at, video_entregado, video_entregado_at')
    .eq('event_id', params.id)
    .order('nombre_familia')

  const { data: agreements } = await supabase
    .from('agreements')
    .select('id, family_id, status')
    .eq('event_id', params.id)

  const { data: intakeResponses } = await supabase
    .from('intake_responses')
    .select('family_id, restricciones_alimentarias')
    .eq('event_id', params.id)

  const familyList = families ?? []
  const agreementList = agreements ?? []
  const intakeList = intakeResponses ?? []

  // Precompute sets/maps for O(1) ready-check per family
  const intakeSet = new Set(intakeList.map(r => r.family_id))
  const agreementsByFamily = agreementList.reduce((acc, ag) => {
    if (!acc[ag.family_id]) acc[ag.family_id] = { total: 0, pending: 0 }
    acc[ag.family_id]!.total++
    if (!['signed', 'approved'].includes(ag.status)) acc[ag.family_id]!.pending++
    return acc
  }, {} as Record<string, { total: number; pending: number }>)

  function isFamilyReady(familyId: string): boolean {
    const hasIntake = intakeSet.has(familyId)
    const ag = agreementsByFamily[familyId]
    const hasAgreements = ag && ag.total > 0 && ag.pending === 0
    return hasIntake && !!hasAgreements
  }

  const enriched = familyList.map((f) => {
    const familyAgreements = agreementList.filter((a) => a.family_id === f.id)
    const agreementsTotal = familyAgreements.length
    const agreementsSigned = familyAgreements.filter((a) =>
      a.status === 'signed' || a.status === 'approved'
    ).length
    const intakeRow = intakeList.find((i) => i.family_id === f.id)
    const hasIntake = !!intakeRow
    const restricciones = intakeRow?.restricciones_alimentarias ?? null
    const isCheckedIn = f.checked_in_at != null
    return { ...f, agreementsTotal, agreementsSigned, hasIntake, restricciones, isCheckedIn }
  })

  const totalFamilias = enriched.length
  const intakeCount = enriched.filter((f) => f.hasIntake).length
  const totalAgreements = enriched.reduce((sum, f) => sum + f.agreementsTotal, 0)
  const signedAgreements = enriched.reduce((sum, f) => sum + f.agreementsSigned, 0)
  const checkInCount = enriched.filter((f) => f.isCheckedIn).length
  const videoEntregadoCount = familyList.filter((f) => f.video_entregado).length

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Familias</h1>
        <Link
          href={`/eventos/${params.id}/familias/nueva`}
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

      {!enriched.length ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-slate-400 text-sm mb-4">No hay familias registradas en este evento.</p>
          <Link
            href={`/eventos/${params.id}/familias/nueva`}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors inline-block"
          >
            Agregar primera familia
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm border-collapse">
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
              {enriched.map((f, i) => (
                <tr
                  key={f.id}
                  className={`hover:bg-slate-50 transition-colors ${i < enriched.length - 1 ? 'border-b border-slate-100' : ''}`}
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
                      eventId={params.id}
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
                      <VideoEntregadoButton familyId={f.id} eventId={params.id} />
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/eventos/${params.id}/familias/${f.id}/editar`}
                        className="text-xs text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/eventos/${params.id}/familias/${f.id}/ficha`}
                        className="text-xs text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium"
                      >
                        Ficha
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
