import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompromisosClient from './CompromisosClient'
import HelpButton from '@/components/HelpButton'
import { familiaVisible } from '@/lib/participante/familia'
import { retiroTerminado } from '@/lib/participante/tiempo'

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

  // EL DEFECTO QUE VIVIA AQUI. Era `new Date(event.fecha_fin) < new Date()`,
  // y `fecha_fin` es una columna `date`: "2026-03-15" se parsea como
  // medianoche UTC, o sea las 18:00 del 14 en la sede. Esta seccion se abria
  // la tarde del dia anterior al cierre, con la pareja todavia en la sala, y
  // les decia que el retiro habia concluido. `retiroTerminado` cierra el dia
  // donde de verdad se cierra.
  const isPostEvent = retiroTerminado(event?.fecha_fin)

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

  // ANTES DEL RETIRO ESTA SECCION YA NO ES UNA PUERTA CERRADA.
  //
  // Aqui vivia un candado: un icono de cerradura dentro de un circulo, el
  // titulo "Disponible al terminar el retiro" y un parrafo explicando que se
  // desbloquearia. Toda esa ceremonia le contaba a la pareja lo que NO puede
  // hacer, en una pestaña que ademas estaba en su barra inferior todo el
  // tiempo previo. El candado se fue con la pestaña: Compromisos entra a la
  // barra cuando el retiro termina (`components/ParticipantNav.tsx`), asi que
  // nadie llega aqui navegando antes de tiempo.
  //
  // Lo que queda es una nota corta y cierta, para quien llegue por un enlace
  // guardado o desde la previa del equipo. Dice que va a haber, no que esta
  // prohibido.
  if (!isPostEvent) {
    return (
      <div className="px-5 pt-6">
        <div className="text-[11px] font-semibold tracking-[0.15em] text-terra-ui uppercase mb-3">
          Después del retiro
        </div>
        <h1 className="font-extralight tracking-tight text-4xl font-light text-ink leading-tight mb-2">
          Compromisos 90 días
        </h1>
        <p className="text-sm text-gray-ui leading-relaxed">
          Aquí van a vivir los acuerdos que tomen juntos durante el retiro.
          {event?.fecha_fin && (
            <>
              {' '}Esta sección se abre el{' '}
              <span className="text-terra-ui">
                {new Date(event.fecha_fin + 'T12:00:00Z').toLocaleDateString('es-MX', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  timeZone: 'UTC',
                })}
              </span>
              , cuando termine.
            </>
          )}
        </p>

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
