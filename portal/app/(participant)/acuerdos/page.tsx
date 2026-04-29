import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const statusLabels: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviado', viewed: 'Visto',
  signed: 'Firmado', approved: 'Aprobado', rejected: 'Rechazado',
}

export default async function AcuerdosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: family } = await supabase
    .from('families')
    .select('id, nombre_familia')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .maybeSingle()

  if (!family) {
    return (
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-[#F5F0E8] mb-4">Acuerdos</h1>
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 text-[#A09A8F] text-sm">
          No tienes una familia asignada todavía.
        </div>
      </div>
    )
  }

  const { data: agreements } = await supabase
    .from('agreements')
    .select('id, nombre, type, status, signed_at')
    .eq('family_id', family.id)
    .order('created_at')

  const pending = agreements?.filter(a => !['signed', 'approved'].includes(a.status)) ?? []
  const completed = agreements?.filter(a => ['signed', 'approved'].includes(a.status)) ?? []
  const total = agreements?.length ?? 0
  const doneCount = completed.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return (
    <div className="px-5 pt-6">
      <h1 className="text-xl font-bold text-[#F5F0E8] mb-1">Acuerdos</h1>
      <p className="text-sm text-[#A09A8F] mb-6">Familia {family.nombre_familia}</p>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-8 bg-[#181818] border border-[#2A2A2A] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-[#F5F0E8] font-medium">Progreso</span>
            <span className="text-[#A09A8F]">{doneCount}/{total} completados</span>
          </div>
          <div className="bg-[#2A2A2A] rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? '#4ADE80' : '#C9A96E',
              }}
            />
          </div>
          <div className="text-right text-xs text-[#6B7280] mt-1">{pct}%</div>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-[#A09A8F] uppercase tracking-wider mb-3">
            Por completar ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map(ag => (
              <Link
                key={ag.id}
                href={`/acuerdos/${ag.id}`}
                className="flex items-center justify-between p-4 bg-[#181818] border border-[#2A2A2A] rounded-xl hover:border-[#C9A96E]/40 transition-colors"
              >
                <div>
                  <div className="font-medium text-[#F5F0E8] text-sm">{ag.nombre}</div>
                  <div className="text-xs text-[#6B7280] mt-0.5 uppercase">{ag.type}</div>
                </div>
                <span className="text-[#C9A96E] text-lg ml-4 flex-shrink-0">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-[#A09A8F] uppercase tracking-wider mb-3">
            Completados ({completed.length})
          </h2>
          <div className="space-y-2">
            {completed.map(ag => (
              <Link
                key={ag.id}
                href={`/acuerdos/${ag.id}`}
                className="flex items-center justify-between p-4 bg-[#181818] border border-[#2A2A2A] rounded-xl opacity-70 hover:opacity-100 transition-opacity"
              >
                <div>
                  <div className="font-medium text-[#F5F0E8] text-sm">{ag.nombre}</div>
                  <div className="text-xs text-[#6B7280] mt-0.5 uppercase">{ag.type}</div>
                </div>
                <span className="text-[#4ADE80] text-lg flex-shrink-0">✓</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {total === 0 && (
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-6 text-center text-[#A09A8F] text-sm">
          No tienes acuerdos asignados aún.
        </div>
      )}
    </div>
  )
}
