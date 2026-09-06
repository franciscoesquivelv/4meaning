// Run this SQL migration before deploying:
// alter table public.families add column if not exists checked_in_at timestamptz;

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { estaEntregado } from '@/lib/entregas'
import FamiliasClient, { type EnrichedFamily } from './FamiliasClient'

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
    // `video_status` y no `video_entregado`: es la columna que lee la pareja,
    // y hasta hoy esta pantalla leia la otra.
    .select('id, nombre_familia, nombre1, nombre2, habitacion, status, fotos_nube_recibidas, checked_in_at, video_status, video_fecha')
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

  // Build set of ready family IDs to pass to client
  const readyFamilyIds = new Set(
    familyList
      .filter(f => {
        const hasIntake = intakeSet.has(f.id)
        const ag = agreementsByFamily[f.id]
        const hasAgreements = ag && ag.total > 0 && ag.pending === 0
        return hasIntake && !!hasAgreements
      })
      .map(f => f.id)
  )

  const enriched: EnrichedFamily[] = familyList.map((f) => {
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
  const videoEntregadoCount = familyList.filter((f) => estaEntregado(f.video_status)).length

  return (
    <FamiliasClient
      eventId={params.id}
      enriched={enriched}
      totalFamilias={totalFamilias}
      intakeCount={intakeCount}
      totalAgreements={totalAgreements}
      signedAgreements={signedAgreements}
      checkInCount={checkInCount}
      videoEntregadoCount={videoEntregadoCount}
      readyFamilyIds={readyFamilyIds}
    />
  )
}
