import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PushSubscribeButton from '@/components/PushSubscribeButton'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  // Interpret date as noon UTC to avoid timezone boundary issues
  const target = new Date(dateStr + 'T12:00:00Z')
  const now = new Date()
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const targetUTC = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate())
  return Math.ceil((targetUTC - todayUTC) / (1000 * 60 * 60 * 24))
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
    <div>
      {/* Cerrar sesión */}
      <div className="flex justify-end px-6 pt-4">
        <form action="/auth/signout" method="POST">
          <button type="submit" className="text-xs text-[#4B5563] hover:text-[#A09A8F] transition-colors">
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* PushSubscribeButton flotante */}
      {family?.event_id && (
        <div className="fixed top-4 right-4 z-40">
          <PushSubscribeButton eventId={family.event_id} />
        </div>
      )}

      {/* No family */}
      {!family && (
        <div className="flex flex-col items-center justify-center text-center py-24 px-8">
          <div className="w-2 h-2 rounded-full bg-[#C9A96E] mx-auto mb-8" />
          <p className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#F5F0E8] mb-3">
            Tu acceso está siendo configurado
          </p>
          <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs">
            Contacta al equipo de Trascendencia para que asignen tu familia al evento.
          </p>
        </div>
      )}

      {/* Hero header — only when family exists */}
      {family && evento && (
        <div className="px-6 pt-12 pb-8">
          {/* Event indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9A96E]">
              {evento.nombre}
            </span>
          </div>

          {/* Family name — serif, grande */}
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl font-light text-[#F5F0E8] leading-tight mb-1">
            {family.nombre_familia}
          </h1>

          {/* Location */}
          <p className="text-sm text-[#6B7280] mt-2">
            {[evento.ciudad, null].filter(Boolean).join(' · ') || evento.ubicacion || ''}
          </p>
        </div>
      )}

      {/* Family without event */}
      {family && !evento && (
        <div className="px-6 pt-12 pb-8">
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl font-light text-[#F5F0E8] leading-tight">
            {family.nombre_familia}
          </h1>
        </div>
      )}

      {/* Event state blocks */}
      {evento && (
        <>
          {daysUntilEnd !== null && daysUntilEnd < 0 ? (
            /* Post-event */
            <div className="px-6 mb-8">
              <div className="border-y border-white/5 py-8 text-center mb-6">
                <p className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#F5F0E8] mb-1">
                  El retiro ha concluido
                </p>
                <p className="font-[family-name:var(--font-cormorant)] text-lg italic text-[#C9A96E]">
                  ¡Gracias por vivir esta experiencia!
                </p>
              </div>

              {/* Storybook & Video delivery status */}
              {(storybookStatus || videoStatus) && (
                <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-5 mb-4 space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] mb-3">Tus recuerdos</p>
                  {storybookStatus && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#F5F0E8]">Storybook</span>
                      {storybookStatus === 'delivered' ? (
                        evento.nube_url ? (
                          <a
                            href={evento.nube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#C9A96E] hover:underline"
                          >
                            Ver ↗
                          </a>
                        ) : (
                          <span className="text-xs text-emerald-400">Entregado ✓</span>
                        )
                      ) : storybookStatus === 'in_progress' ? (
                        <span className="text-xs text-amber-400">En proceso…</span>
                      ) : (
                        <span className="text-xs text-[#6B7280]">Pendiente</span>
                      )}
                    </div>
                  )}
                  {videoStatus && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#F5F0E8]">Video</span>
                      {videoStatus === 'delivered' ? (
                        evento.nube_url ? (
                          <a
                            href={evento.nube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#C9A96E] hover:underline"
                          >
                            Ver ↗
                          </a>
                        ) : (
                          <span className="text-xs text-emerald-400">Entregado ✓</span>
                        )
                      ) : videoStatus === 'in_progress' ? (
                        <span className="text-xs text-amber-400">En proceso…</span>
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
                  className="flex items-center justify-between p-5 bg-[#1A1A1A] border border-[#C9A96E]/30 rounded-2xl hover:border-[#C9A96E]/60 transition-colors"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] mb-1">La Nube</p>
                    <p className="font-[family-name:var(--font-cormorant)] text-xl font-light text-[#F5F0E8]">
                      Álbum del retiro
                    </p>
                    <p className="text-sm text-[#6B7280] mt-0.5">Revive los momentos del retiro</p>
                  </div>
                  <span className="text-[#C9A96E] text-lg">↗</span>
                </a>
              )}
            </div>
          ) : isHappening ? (
            /* Happening now */
            <div className="px-6 py-8 text-center mb-8">
              <div className="w-3 h-3 rounded-full bg-emerald-400 mx-auto mb-4 animate-pulse" />
              <p className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#F5F0E8]">
                Estás en el retiro
              </p>
              <p className="text-sm text-[#6B7280] mt-1">Vive cada momento presente</p>
            </div>
          ) : daysUntil !== null && daysUntil > 0 ? (
            /* Countdown */
            <div className="mx-6 py-8 text-center border-y border-white/5 rounded-2xl bg-white/[0.02] mb-8">
              <div className="font-[family-name:var(--font-cormorant)] text-[96px] sm:text-[120px] font-light text-[#F5F0E8] leading-none">
                {daysUntil}
              </div>
              <p className="font-[family-name:var(--font-cormorant)] text-lg italic text-[#A09A8F] mt-2">
                días para tu retiro
              </p>
              <p className="text-xs text-[#6B7280] mt-3 uppercase tracking-widest">
                {formatDate(evento.fecha_inicio)} — {formatDate(evento.fecha_fin)}
              </p>
            </div>
          ) : (
            /* Default — event exists but no countdown logic applies */
            <div className="mx-6 py-8 text-center border-y border-white/5 rounded-2xl bg-white/[0.02] mb-8">
              <p className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#F5F0E8]">
                {evento.nombre}
              </p>
              {(evento.ubicacion || evento.ciudad) && (
                <p className="text-sm text-[#6B7280] mt-2">
                  {[evento.ubicacion, evento.ciudad].filter(Boolean).join(' · ')}
                </p>
              )}
              <p className="text-xs text-[#6B7280] mt-3 uppercase tracking-widest">
                {formatDate(evento.fecha_inicio)} — {formatDate(evento.fecha_fin)}
              </p>
            </div>
          )}
        </>
      )}

      {/* Recent announcements */}
      {recentAnnouncements.length > 0 && (
        <div className="px-6 mb-6 space-y-2">
          {recentAnnouncements.map(a => (
            <Link
              key={a.id}
              href="/avisos"
              className={[
                'flex items-center gap-3 px-5 py-4 rounded-2xl border transition-colors',
                a.tipo === 'urgente'
                  ? 'bg-red-950/30 border-red-700/30 hover:border-red-600/50'
                  : a.tipo === 'logistica'
                  ? 'bg-[#C9A96E]/5 border-[#C9A96E]/20 hover:border-[#C9A96E]/40'
                  : 'bg-[#1A1A1A] border-white/10 hover:border-white/20',
              ].join(' ')}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#6B7280] mb-0.5">
                  {a.tipo === 'urgente' ? 'Urgente' : a.tipo === 'logistica' ? 'Logística' : 'Aviso'}
                </p>
                <p className="text-sm text-[#F5F0E8] leading-snug truncate">
                  {a.titulo}
                </p>
              </div>
              <span className="text-[#4B5563] text-xs shrink-0">→</span>
            </Link>
          ))}
        </div>
      )}

      {/* Action items — sequential */}
      {family && (
        <div className="px-6 mb-6 space-y-3">
          {/* Paso 1 — Formulario */}
          {!intakeSubmitted ? (
            <Link
              href="/formulario"
              className="flex items-start justify-between p-5 bg-[#1A1A1A] border border-[#C9A96E]/30 rounded-2xl hover:border-[#C9A96E]/60 transition-colors"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] mb-1">Paso 1</p>
                <p className="font-[family-name:var(--font-cormorant)] text-xl font-light text-[#F5F0E8]">
                  Completa tu perfil
                </p>
                <p className="text-sm text-[#6B7280] mt-1">Cuéntanos la historia de su familia</p>
              </div>
              <svg className="text-[#C9A96E] mt-1 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          ) : (
            <div className="flex items-center gap-3 p-5 bg-[#1A1A1A] border border-white/10 rounded-2xl opacity-50">
              <svg className="text-emerald-400 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div>
                <p className="font-[family-name:var(--font-cormorant)] text-lg font-light text-[#F5F0E8]">Perfil completado</p>
                <p className="text-sm text-[#6B7280]">Gracias por compartir su historia</p>
              </div>
            </div>
          )}

          {/* Paso 2 — Acuerdos */}
          {totalCount > 0 && (
            allSigned ? (
              <div className="flex items-center gap-3 p-5 bg-[#1A1A1A] border border-white/10 rounded-2xl opacity-50">
                <svg className="text-emerald-400 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <div>
                  <p className="font-[family-name:var(--font-cormorant)] text-lg font-light text-[#F5F0E8]">Acuerdos firmados</p>
                  <p className="text-sm text-[#6B7280]">{totalCount}/{totalCount} completados</p>
                </div>
              </div>
            ) : (
              <Link
                href="/acuerdos"
                className={`flex items-start justify-between p-5 bg-[#1A1A1A] rounded-2xl transition-colors ${intakeSubmitted ? 'border border-[#C9A96E]/30 hover:border-[#C9A96E]/60' : 'border border-white/10 opacity-60 pointer-events-none'}`}
              >
                <div>
                  <p className={`text-[10px] uppercase tracking-[0.15em] mb-1 ${intakeSubmitted ? 'text-[#C9A96E]' : 'text-[#6B7280]'}`}>Paso 2</p>
                  <p className="font-[family-name:var(--font-cormorant)] text-xl font-light text-[#F5F0E8]">
                    Firma los acuerdos
                  </p>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''} de {totalCount}
                  </p>
                </div>
                {intakeSubmitted && (
                  <svg className="text-[#C9A96E] mt-1 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                )}
              </Link>
            )
          )}

          {/* Todo listo */}
          {intakeSubmitted && allSigned && totalCount > 0 && (
            <div className="flex items-center gap-3 p-5 bg-[#0A2A1A]/60 border border-emerald-400/20 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <div>
                <p className="font-[family-name:var(--font-cormorant)] text-lg font-light text-[#F5F0E8]">
                  Todo listo para el retiro
                </p>
                <p className="text-sm text-[#6B7280]">Perfil y acuerdos completados</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* La Nube CTA — only when not post-event */}
      {family && evento?.nube_url && !(daysUntilEnd !== null && daysUntilEnd < 0) && (
        <div className="px-6 mb-6">
          <a
            href={evento.nube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-5 bg-[#1A1A1A] border border-[#C9A96E]/20 rounded-2xl hover:border-[#C9A96E]/50 transition-colors"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] mb-1">La Nube</p>
              <p className="font-[family-name:var(--font-cormorant)] text-xl font-light text-[#F5F0E8]">
                Álbum compartido
              </p>
              <p className="text-sm text-[#6B7280] mt-0.5">Sube tus fotos del retiro al álbum del grupo</p>
            </div>
            <span className="text-[#C9A96E] text-lg">↗</span>
          </a>
        </div>
      )}

      {/* Secondary links — editorial list style */}
      {family && (
        <div className="px-6 pb-8">
          <div className="border-t border-white/10 pt-6 space-y-1">
            {[
              { href: '/info',       label: 'Información del retiro' },
              { href: '/documentos', label: 'Documentos' },
              { href: '/equipo',     label: 'Conoce al equipo' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between py-3 text-sm text-[#A09A8F] hover:text-[#F5F0E8] transition-colors"
              >
                <span>{link.label}</span>
                <span className="text-[#4B5563]">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
