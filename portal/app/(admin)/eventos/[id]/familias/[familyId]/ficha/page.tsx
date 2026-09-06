import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import PrintButton from './PrintButton'

export default async function FichaFamiliaPage({
  params,
}: {
  params: { id: string; familyId: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre, fecha_inicio, fecha_fin, ciudad, pais')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: familia } = await supabase
    .from('families')
    .select(
      'id, nombre_familia, nombre1, nombre2, email1, email2, habitacion, notas, status'
    )
    .eq('id', params.familyId)
    .eq('event_id', params.id)
    .single()
  if (!familia) notFound()

  const { data: intake } = await supabase
    .from('intake_responses')
    .select(
      'como_se_conocieron, historia_pareja, anos_juntos, tienen_hijos, hijos, legado, expectativas, momentos_importantes, valores, mensaje_especial, restricciones_alimentarias, notas_adicionales, submitted_at'
    )
    .eq('family_id', params.familyId)
    .eq('event_id', params.id)
    .maybeSingle()

  const formatDate = (iso: string | null) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const hijos: { nombre: string; edad: string | number }[] = (() => {
    if (!intake?.tienen_hijos && !intake?.hijos) return []
    try {
      if (typeof intake.hijos === 'string') {
        const parsed = JSON.parse(intake.hijos)
        return Array.isArray(parsed) ? parsed : []
      }
      if (Array.isArray(intake?.hijos)) return intake.hijos
    } catch {
      // not parseable, ignore
    }
    return []
  })()

  const valores: string[] = (() => {
    if (!intake?.valores) return []
    try {
      if (typeof intake.valores === 'string') {
        const parsed = JSON.parse(intake.valores)
        return Array.isArray(parsed) ? parsed : []
      }
      if (Array.isArray(intake?.valores)) return intake.valores
    } catch {
      // not parseable, ignore
    }
    return []
  })()

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-page { padding: 0 !important; }
        }
      `}</style>

      <div className="p-8 max-w-4xl print-page">
        {/* Breadcrumb + controls */}
        <div className="no-print flex items-center justify-between mb-6">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/eventos" className="hover:text-slate-700 transition-colors">
              Eventos
            </Link>
            <span>/</span>
            <Link
              href={`/eventos/${params.id}`}
              className="hover:text-slate-700 transition-colors"
            >
              {evento.nombre}
            </Link>
            <span>/</span>
            <Link
              href={`/eventos/${params.id}/familias`}
              className="hover:text-slate-700 transition-colors"
            >
              Familias
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">{familia.nombre_familia}</span>
          </nav>
          <PrintButton />
        </div>

        {/* Intake not submitted notice */}
        {!intake && (
          <div className="no-print mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            Esta familia aún no ha enviado su formulario de ingreso. La ficha muestra
            únicamente la información básica registrada por el equipo.
          </div>
        )}

        {/* ── HEADER BLOCK ── */}
        <div className="mb-8 rounded-2xl bg-slate-900 p-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              {/* La cejilla del sistema. Escribia el color a mano y era el
                  dorado que no esta en ninguna paleta de la marca. */}
              <p className="cejilla cejilla-claro mb-1">
                Trascendencia
              </p>
              <h1 className="text-3xl font-bold leading-tight">{familia.nombre_familia}</h1>
              <p className="mt-1 text-slate-300">
                {familia.nombre1}
                {familia.nombre2 ? ` & ${familia.nombre2}` : ''}
              </p>
            </div>
            <div className="text-right text-sm text-slate-300 shrink-0">
              <p className="font-semibold text-white">{evento.nombre}</p>
              {(evento.fecha_inicio || evento.fecha_fin) && (
                <p className="mt-0.5">
                  {formatDate(evento.fecha_inicio)}
                  {evento.fecha_fin && evento.fecha_fin !== evento.fecha_inicio
                    ? ` – ${formatDate(evento.fecha_fin)}`
                    : ''}
                </p>
              )}
              {(evento.ciudad || evento.pais) && (
                <p className="mt-0.5 text-slate-400">
                  {[evento.ciudad, evento.pais].filter(Boolean).join(', ')}
                </p>
              )}
              {familia.habitacion && (
                <p className="mt-2 rounded-md bg-slate-700 px-3 py-1 font-medium text-white">
                  Habitación {familia.habitacion}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── VALORES ── */}
        {valores.length > 0 && (
          <section className="mb-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Los valores que quieren transmitir
            </p>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Sus valores</h2>
            <div className="flex flex-wrap gap-2">
              {valores.map((v) => (
                <span
                  key={v}
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white"
                >
                  {v}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── HISTORIA ── */}
        {intake && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Su historia</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {intake.como_se_conocieron && (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Cómo se conocieron
                  </p>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {intake.como_se_conocieron}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {intake.anos_juntos != null && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Años juntos
                    </p>
                    <p className="text-3xl font-bold text-slate-900">
                      {intake.anos_juntos}
                      <span className="ml-1.5 text-base font-normal text-slate-500">años</span>
                    </p>
                  </div>
                )}

                {(intake.tienen_hijos || hijos.length > 0) && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Tienen hijos
                    </p>
                    {hijos.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {hijos.map((hijo, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                          >
                            {hijo.nombre}
                            {hijo.edad ? `, ${hijo.edad} años` : ''}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700">Sí</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {intake.historia_pareja && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Su historia en sus propias palabras
                </p>
                <p className="text-sm leading-relaxed text-slate-700">{intake.historia_pareja}</p>
              </div>
            )}
          </section>
        )}

        {/* ── MOMENTOS QUE LOS DEFINEN ── */}
        {intake?.momentos_importantes && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Momentos que los definen
            </h2>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-base italic leading-relaxed text-slate-700">
                "{intake.momentos_importantes}"
              </p>
            </div>
          </section>
        )}

        {/* ── VISIÓN ── */}
        {intake && (intake.legado || intake.expectativas) && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Su visión</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {intake.legado && (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Legado que quieren dejar
                  </p>
                  <p className="text-sm leading-relaxed text-slate-700">{intake.legado}</p>
                </div>
              )}
              {intake.expectativas && (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Expectativas para el retiro
                  </p>
                  <p className="text-sm leading-relaxed text-slate-700">{intake.expectativas}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── MENSAJE ESPECIAL ── */}
        {intake?.mensaje_especial && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Mensaje especial</h2>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
                Mensaje para su familia
              </p>
              <p className="text-lg italic leading-relaxed text-amber-900">
                "{intake.mensaje_especial}"
              </p>
            </div>
          </section>
        )}

        {/* ── LOGÍSTICA ── */}
        {(intake?.restricciones_alimentarias ||
          intake?.notas_adicionales ||
          familia.notas) && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Logística
            </h2>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              {intake?.restricciones_alimentarias && (
                <div className="mb-3">
                  <span className="font-semibold text-slate-700">
                    Restricciones alimentarias:{' '}
                  </span>
                  {intake.restricciones_alimentarias}
                </div>
              )}
              {intake?.notas_adicionales && (
                <div className="mb-3">
                  <span className="font-semibold text-slate-700">Notas adicionales: </span>
                  {intake.notas_adicionales}
                </div>
              )}
              {familia.notas && (
                <div>
                  <span className="font-semibold text-slate-700">Notas internas: </span>
                  {familia.notas}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── FOOTER ── */}
        <footer className="mt-12 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
          Uso interno · Equipo Trascendencia
          {intake?.submitted_at && (
            <span className="ml-3">
              · Formulario enviado el {formatDate(intake.submitted_at)}
            </span>
          )}
        </footer>
      </div>
    </>
  )
}
