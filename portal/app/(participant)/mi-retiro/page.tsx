import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export default async function MiRetiroPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'bienvenido'

  const { data: family } = await supabase
    .from('families')
    .select('id, nombre_familia, event_id, storybook_status, video_status, events(id, nombre, ubicacion, fecha_inicio, fecha_fin, ciudad, nube_url)')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .maybeSingle()

  const evento = family ? (family.events as unknown as {
    id: string
    nombre: string
    ubicacion: string | null
    fecha_inicio: string | null
    fecha_fin: string | null
    ciudad: string | null
    nube_url: string | null
  } | null) : null

  const storybookStatus = (family as unknown as { storybook_status?: string } | null)?.storybook_status ?? null
  const videoStatus = (family as unknown as { video_status?: string } | null)?.video_status ?? null

  let pendingCount = 0
  let totalCount = 0
  let intakeSubmitted = false
  let recentAnnouncements: { id: string; titulo: string; tipo: string }[] = []

  if (family) {
    const [{ data: agreements }, { data: intake }, { data: annoData }] = await Promise.all([
      supabase.from('agreements').select('id, status').eq('family_id', family.id),
      supabase.from('intake_responses').select('id').eq('family_id', family.id).maybeSingle(),
      supabase
        .from('announcements')
        .select('id, titulo, tipo')
        .eq('event_id', family.event_id)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(2),
    ])
    totalCount = agreements?.length ?? 0
    pendingCount = agreements?.filter(a => !['signed', 'approved'].includes(a.status)).length ?? 0
    intakeSubmitted = !!intake
    recentAnnouncements = annoData ?? []
  }

  const allSigned = totalCount > 0 && pendingCount === 0
  const daysUntil = getDaysUntil(evento?.fecha_inicio ?? null)
  const daysUntilEnd = getDaysUntil(evento?.fecha_fin ?? null)
  const isHappening = daysUntil !== null && daysUntilEnd !== null && daysUntil <= 0 && daysUntilEnd >= 0

  return (
    <div className="px-5 pt-6 pb-4">
      {/* No family */}
      {!family && (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
          <div className="w-12 h-12 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center mb-4 text-[#A09A8F] text-xl">
            ◎
          </div>
          <p className="text-[#F5F0E8] font-medium mb-2">Tu acceso está siendo configurado</p>
          <p className="text-[#A09A8F] text-sm leading-relaxed">
            Contacta al equipo de Trascendencia para que asignen tu familia al evento.
          </p>
        </div>
      )}

      {/* Event card */}
      {evento && (
        <div className="mb-6">
          {daysUntilEnd !== null && daysUntilEnd < 0 ? (
            /* Post-event */
            <>
              <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-5 mb-4">
                <div className="text-xs font-medium text-[#A09A8F] uppercase tracking-widest mb-2">El retiro ha concluido</div>
                <div className="text-lg font-bold text-[#F5F0E8] mb-1">{evento.nombre}</div>
                <div className="text-sm text-[#C9A96E] mt-1">¡Gracias por vivir esta experiencia!</div>
              </div>

              {/* Storybook & Video delivery status */}
              {(storybookStatus || videoStatus) && (
                <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-5 mb-4 space-y-3">
                  <div className="text-xs font-medium text-[#A09A8F] uppercase tracking-widest mb-1">Tus recuerdos</div>
                  {storybookStatus && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📖</span>
                        <span className="text-sm text-[#F5F0E8]">Storybook</span>
                      </div>
                      {storybookStatus === 'delivered' ? (
                        evento.nube_url ? (
                          <a
                            href={evento.nube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-[#C9A96E] hover:underline"
                          >
                            Ver ↗
                          </a>
                        ) : (
                          <span className="text-xs text-[#4ADE80] font-semibold">Entregado ✓</span>
                        )
                      ) : storybookStatus === 'in_progress' ? (
                        <span className="text-xs text-[#FBBF24]">En proceso…</span>
                      ) : (
                        <span className="text-xs text-[#6B7280]">Pendiente</span>
                      )}
                    </div>
                  )}
                  {videoStatus && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎬</span>
                        <span className="text-sm text-[#F5F0E8]">Video</span>
                      </div>
                      {videoStatus === 'delivered' ? (
                        evento.nube_url ? (
                          <a
                            href={evento.nube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-[#C9A96E] hover:underline"
                          >
                            Ver ↗
                          </a>
                        ) : (
                          <span className="text-xs text-[#4ADE80] font-semibold">Entregado ✓</span>
                        )
                      ) : videoStatus === 'in_progress' ? (
                        <span className="text-xs text-[#FBBF24]">En proceso…</span>
                      ) : (
                        <span className="text-xs text-[#6B7280]">Pendiente</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* La Nube link when delivered */}
              {evento.nube_url && (
                <a
                  href={evento.nube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 mb-4 bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-xl hover:border-[#C9A96E]/70 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-[#F5F0E8] text-sm mb-0.5">La Nube — Álbum del retiro</div>
                    <div className="text-xs text-[#A09A8F]">Revive los momentos del retiro</div>
                  </div>
                  <span className="text-[#C9A96E] text-base">↗</span>
                </a>
              )}
            </>
          ) : isHappening ? (
            /* Happening now */
            <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-2xl p-5 mb-4">
              <div className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-2">Ahora mismo</div>
              <div className="text-xl font-bold text-[#F5F0E8] mb-1">Estás en el retiro</div>
              <div className="text-sm text-[#A09A8F]">{evento.nombre}</div>
            </div>
          ) : daysUntil !== null && daysUntil > 0 ? (
            /* Countdown */
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-5 mb-4">
              <div className="text-xs font-medium text-[#A09A8F] uppercase tracking-widest mb-3">Cuenta regresiva</div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-5xl font-bold text-[#C9A96E] leading-none">{daysUntil}</span>
                <span className="text-lg text-[#A09A8F] font-medium">días</span>
              </div>
              <div className="text-base font-semibold text-[#F5F0E8]">{evento.nombre}</div>
              <div className="mt-3 pt-3 border-t border-[#2A2A2A] flex items-center gap-2 text-xs text-[#A09A8F]">
                {evento.ubicacion && <span>{evento.ubicacion}</span>}
                {evento.ciudad && <span>· {evento.ciudad}</span>}
              </div>
              <div className="mt-1 text-xs text-[#6B7280]">
                {formatDate(evento.fecha_inicio)} – {formatDate(evento.fecha_fin)}
              </div>
            </div>
          ) : (
            /* Default */
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-5 mb-4">
              <div className="text-xs font-medium text-[#A09A8F] uppercase tracking-widest mb-2">Tu retiro</div>
              <div className="text-lg font-bold text-[#F5F0E8] mb-1">{evento.nombre}</div>
              {evento.ubicacion && <div className="text-sm text-[#A09A8F]">{evento.ubicacion}</div>}
              <div className="mt-3 pt-3 border-t border-[#2A2A2A] text-xs text-[#6B7280]">
                {formatDate(evento.fecha_inicio)} – {formatDate(evento.fecha_fin)}
                {evento.ciudad && ` · ${evento.ciudad}`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent announcements */}
      {recentAnnouncements.length > 0 && (
        <div className="mb-4 space-y-2">
          {recentAnnouncements.map(a => (
            <Link
              key={a.id}
              href="/avisos"
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors',
                a.tipo === 'urgente'
                  ? 'bg-red-950/40 border-red-700/40 hover:border-red-600/60'
                  : a.tipo === 'logistica'
                  ? 'bg-[#C9A96E]/10 border-[#C9A96E]/30 hover:border-[#C9A96E]/60'
                  : 'bg-[#181818] border-[#2A2A2A] hover:border-[#3A3A3A]',
              ].join(' ')}
            >
              <span className="text-base shrink-0">
                {a.tipo === 'urgente' ? '🚨' : a.tipo === 'logistica' ? '📋' : '📢'}
              </span>
              <span className="text-sm font-medium text-[#F5F0E8] leading-snug flex-1 min-w-0 truncate">
                {a.titulo}
              </span>
              <span className="text-[#A09A8F] text-xs shrink-0">→</span>
            </Link>
          ))}
        </div>
      )}

      {/* Action items */}
      {family && (
        <div className="space-y-3 mb-6">
          {/* Intake form */}
          {!intakeSubmitted && (
            <Link
              href="/formulario"
              className="flex items-center justify-between p-4 bg-[#181818] border border-[#C9A96E]/40 rounded-xl hover:border-[#C9A96E] transition-colors"
            >
              <div>
                <div className="font-semibold text-[#F5F0E8] text-sm mb-0.5">Completa tu perfil</div>
                <div className="text-xs text-[#A09A8F]">Cuéntanos su historia antes del retiro</div>
              </div>
              <span className="text-[#C9A96E] text-lg">→</span>
            </Link>
          )}

          {intakeSubmitted && (
            <div className="flex items-center gap-3 p-4 bg-[#181818] border border-[#2A2A2A] rounded-xl">
              <span className="text-[#4ADE80] text-lg">✓</span>
              <div>
                <div className="font-semibold text-sm text-[#F5F0E8]">Perfil completado</div>
                <div className="text-xs text-[#A09A8F]">Gracias por completarlo</div>
              </div>
            </div>
          )}

          {/* Agreements */}
          {totalCount > 0 && (
            allSigned ? (
              <div className="flex items-center gap-3 p-4 bg-[#181818] border border-[#2A2A2A] rounded-xl">
                <span className="text-[#4ADE80] text-lg">✓</span>
                <div>
                  <div className="font-semibold text-sm text-[#F5F0E8]">Acuerdos completados</div>
                  <div className="text-xs text-[#A09A8F]">{totalCount}/{totalCount} firmados</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-[#181818] border border-[#2A2A2A] rounded-xl">
                <div>
                  <div className="font-semibold text-sm text-[#F5F0E8] mb-0.5">Acuerdos pendientes</div>
                  <div className="text-xs text-[#A09A8F]">{totalCount - pendingCount} de {totalCount} firmados</div>
                </div>
                <Link
                  href="/acuerdos"
                  className="px-3 py-1.5 bg-[#181818] border border-[#FBBF24] text-[#FBBF24] text-xs font-semibold rounded-lg hover:bg-[#FBBF24]/10 transition-colors"
                >
                  Ver ({pendingCount})
                </Link>
              </div>
            )
          )}
        </div>
      )}

      {/* La Nube CTA — only when not post-event (post-event shows it inline above) */}
      {family && evento?.nube_url && !(daysUntilEnd !== null && daysUntilEnd < 0) && (
        <a
          href={evento.nube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 mb-4 bg-[#181818] border border-[#C9A96E]/30 rounded-xl hover:border-[#C9A96E]/70 transition-colors"
        >
          <div>
            <div className="font-semibold text-[#F5F0E8] text-sm mb-0.5">La Nube — Álbum compartido</div>
            <div className="text-xs text-[#A09A8F]">Sube tus fotos del retiro al álbum del grupo</div>
          </div>
          <span className="text-[#C9A96E] text-base">↗</span>
        </a>
      )}

      {/* Quick links */}
      {family && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/programa', label: 'Programa', sub: 'Ver el itinerario', icon: '◫' },
            { href: '/documentos', label: 'Documentos', sub: 'Materiales del retiro', icon: '◻' },
            { href: '/info', label: 'Información', sub: 'Logística y contactos', icon: 'ℹ' },
            { href: '/acuerdos', label: 'Acuerdos', sub: 'Documentos legales', icon: '✍' },
            { href: '/equipo', label: 'Equipo', sub: 'Conoce al equipo', icon: '◎' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="p-4 bg-[#181818] border border-[#2A2A2A] rounded-xl hover:border-[#3A3A3A] transition-colors"
            >
              <div className="text-xl text-[#A09A8F] mb-2">{link.icon}</div>
              <div className="font-semibold text-sm text-[#F5F0E8]">{link.label}</div>
              <div className="text-xs text-[#6B7280] mt-0.5">{link.sub}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
