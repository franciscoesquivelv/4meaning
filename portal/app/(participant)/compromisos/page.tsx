import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompromisosClient from './CompromisosClient'
import HelpButton from '@/components/HelpButton'
import { familiaVisible } from '@/lib/participante/familia'

function LockIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--terra)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export default async function CompromisosPage({
  searchParams,
}: {
  searchParams: { familia?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const fam = await familiaVisible(searchParams?.familia)

  const { data: family } = await supabase
    .from('families')
    .select('id, event_id, nombre_familia, nombre1, nombre2')
    .eq('id', fam?.id ?? '00000000-0000-0000-0000-000000000000')
    .limit(1)
    .maybeSingle()

  if (!family) {
    return (
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-ink mb-4">Compromisos</h1>
        <div className="bg-white border border-line rounded-2xl p-5 text-gray-ui text-sm">
          Tu cuenta no tiene una familia asignada todavía.
        </div>
      </div>
    )
  }

  const { data: event } = await supabase
    .from('events')
    .select('id, nombre, fecha_fin')
    .eq('id', family.event_id)
    .maybeSingle()

  const isPostEvent = event?.fecha_fin
    ? new Date(event.fecha_fin) < new Date()
    : false

  const { data: rawCompromisos } = isPostEvent
    ? await supabase
        .from('compromisos')
        .select('id, texto, categoria, completado, completado_at, orden')
        .eq('family_id', family.id)
        .eq('event_id', family.event_id)
        .order('orden')
        .order('created_at')
    : { data: null }

  const compromisos = (rawCompromisos ?? []) as Array<{
    id: string
    texto: string
    categoria: 'relacion' | 'personal' | 'familia' | 'general'
    completado: boolean
    completado_at: string | null
    orden: number
  }>

  const total = compromisos.length
  const done = compromisos.filter(c => c.completado).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  // Pre-event / during event teaser
  if (!isPostEvent) {
    return (
      <div className="px-5 pt-6">
        <div className="text-[11px] font-semibold tracking-[0.15em] text-terra-ui uppercase mb-3">
          Después del retiro
        </div>
        <h1 className="font-extralight tracking-tight text-4xl font-light text-ink leading-tight mb-2">
          Compromisos 90 días
        </h1>
        <p className="text-sm text-gray-ui mb-10">
          Los acuerdos que tomaron juntos siguen vivos aquí.
        </p>

        <div className="bg-white border border-line rounded-2xl p-8 flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 rounded-full bg-terra/10 border border-terra/40 flex items-center justify-center">
            <LockIcon />
          </div>
          <div>
            <p className="text-base font-semibold text-ink mb-2">
              Disponible al terminar el retiro
            </p>
            <p className="text-sm text-gray-ui leading-relaxed max-w-xs">
              Esta sección se desbloqueará cuando el retiro haya concluido. Aquí podrán registrar y dar seguimiento a los compromisos que hicieron juntos.
            </p>
          </div>
          {event?.fecha_fin && (
            <div className="bg-paper border border-line rounded-xl px-4 py-2 text-xs text-gray-ui">
              Se desbloquea el{' '}
              <span className="text-terra-ui">
                {new Date(event.fecha_fin).toLocaleDateString('es-MX', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
          )}
        </div>

        <HelpButton pageId="compromisos" />
      </div>
    )
  }

  // Post-event full UI
  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <div className="text-[11px] font-semibold tracking-[0.15em] text-terra-ui uppercase mb-3">
        Después del retiro
      </div>
      <h1 className="font-extralight tracking-tight text-4xl font-light text-ink leading-tight mb-2">
        Compromisos 90 días
      </h1>
      <p className="text-sm text-gray-ui mb-6">
        Los acuerdos que tomaron juntos siguen vivos aquí.
      </p>

      {/* Progress stats */}
      {total > 0 && (
        <div className="bg-white border border-line rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-ink font-medium">
              {done} de {total} completados
            </span>
            <span className="text-xs text-gray-ui">{pct}%</span>
          </div>
          <div className="bg-paper-2 rounded-full h-1 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? 'var(--bien)' : 'var(--terra)',
              }}
            />
          </div>
        </div>
      )}

      <CompromisosClient
        compromisos={compromisos}
        familyId={family.id}
        eventId={family.event_id}
      />

      <HelpButton pageId="compromisos" />
    </div>
  )
}
