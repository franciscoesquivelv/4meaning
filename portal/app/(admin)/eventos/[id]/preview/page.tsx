import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentBlock = {
  id: string
  titulo: string
  contenido: string | null
  tipo: string
  activo: boolean
}

type ItineraryItem = {
  id: string
  dia: string | null
  hora_inicio: string | null
  hora_fin: string | null
  titulo: string | null
  tipo: string | null
  ubicacion: string | null
  descripcion: string | null
}

type TeamMember = {
  id: string
  nombre: string
  rol: string
  bio_publica: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<string, string> = {
  info:      'Información',
  actividad: 'Actividad',
  reflexion: 'Reflexión',
  formato:   'Formato',
}

const tipoDot: Record<string, string> = {
  sesion:     'bg-violet-400',
  comida:     'bg-[#C9A96E]',
  actividad:  'bg-sky-400',
  libre:      'bg-[#A09A8F]',
  traslado:   'bg-slate-400',
  bienvenida: 'bg-emerald-400',
  cierre:     'bg-rose-400',
  taller:     'bg-indigo-400',
  logistica:  'bg-blue-400',
}

function formatTime(t: string | null) {
  if (!t) return ''
  return t.slice(0, 5)
}

// ─── Section: Programa ────────────────────────────────────────────────────────

function ProgramaSection({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-[#F5F0E8] mb-4">Programa / Contenido</h2>
      {blocks.length === 0 ? (
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-6 text-center text-[#A09A8F] text-sm">
          Sin contenido activo todavía.
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map(block => (
            <div key={block.id} className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-5">
              <div className="text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] mb-2">
                {TIPO_LABELS[block.tipo] ?? block.tipo}
              </div>
              <h3 className="text-base font-semibold text-[#F5F0E8] mb-2">{block.titulo}</h3>
              {block.contenido && (
                <p className="text-sm text-[#B0A898] leading-relaxed whitespace-pre-wrap">
                  {block.contenido}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Section: Itinerario ──────────────────────────────────────────────────────

function ItinerarioSection({ items }: { items: ItineraryItem[] }) {
  // Group by dia
  const byDay: Record<string, ItineraryItem[]> = {}
  for (const item of items) {
    const key = item.dia ?? 'Sin día'
    if (!byDay[key]) byDay[key] = []
    byDay[key].push(item)
  }
  const days = Object.keys(byDay).sort()

  return (
    <section>
      <h2 className="text-base font-semibold text-[#F5F0E8] mb-4">Itinerario</h2>
      {days.length === 0 ? (
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-6 text-center text-[#A09A8F] text-sm">
          Sin itinerario configurado todavía.
        </div>
      ) : (
        <div className="space-y-8">
          {days.map(dia => {
            const dayItems = byDay[dia]
            return (
              <div key={dia}>
                {/* Day header */}
                <div className="bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 mb-4">
                  <span className="font-bold text-sm text-[#F5F0E8]">{dia}</span>
                </div>

                {/* Timeline */}
                <div className="relative pl-16">
                  <div className="absolute left-[52px] top-0 bottom-0 w-px bg-[#2A2A2A]" />
                  <div className="space-y-5">
                    {dayItems.map(item => (
                      <div key={item.id} className="relative">
                        {/* Time */}
                        <div className="absolute -left-16 top-0 text-xs text-[#6B7280] text-right w-12 pt-0.5 leading-tight">
                          {formatTime(item.hora_inicio)}
                        </div>
                        {/* Dot */}
                        <div className={`absolute -left-[7px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#0C0C0C] z-10 ${tipoDot[item.tipo ?? ''] ?? 'bg-[#A09A8F]'}`} />
                        {/* Card */}
                        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-4">
                          <div className="font-semibold text-sm text-[#F5F0E8] mb-1">{item.titulo}</div>
                          {item.hora_fin && (
                            <div className="text-xs text-[#6B7280] mb-1">hasta {formatTime(item.hora_fin)}</div>
                          )}
                          {item.tipo && (
                            <span className="text-[10px] uppercase tracking-wider text-[#C9A96E] font-medium">
                              {item.tipo}
                            </span>
                          )}
                          {item.ubicacion && (
                            <div className="text-xs text-[#A09A8F] mt-1">{item.ubicacion}</div>
                          )}
                          {item.descripcion && (
                            <div className="text-xs text-[#A09A8F] mt-2 leading-relaxed">{item.descripcion}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ─── Section: Equipo ──────────────────────────────────────────────────────────

function EquipoSection({ members }: { members: TeamMember[] }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-[#F5F0E8] mb-4">Equipo</h2>
      {members.length === 0 ? (
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-6 text-center text-[#A09A8F] text-sm">
          Sin miembros del equipo con bio pública todavía.
        </div>
      ) : (
        <div className="space-y-4">
          {members.map(member => (
            <div key={member.id} className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-[#F5F0E8]">{member.nombre}</div>
                  <div className="text-xs text-[#C9A96E] font-medium mt-0.5 uppercase tracking-wider">{member.rol}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#A09A8F] font-bold text-sm flex-shrink-0">
                  {member.nombre.charAt(0).toUpperCase()}
                </div>
              </div>
              <p className="text-sm text-[#A09A8F] leading-relaxed">{member.bio_publica}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PreviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()

  if (!evento) notFound()

  const [
    { data: contentBlocks },
    { data: itineraryItems },
    { data: teamMembers },
  ] = await Promise.all([
    supabase
      .from('event_content_blocks')
      .select('id, titulo, contenido, tipo, activo')
      .eq('event_id', params.id)
      .eq('activo', true)
      .order('orden', { ascending: true }),
    supabase
      .from('itinerary_items')
      .select('id, dia, hora_inicio, hora_fin, titulo, tipo, ubicacion, descripcion')
      .eq('event_id', params.id)
      .order('dia')
      .order('orden')
      .order('hora_inicio'),
    supabase
      .from('event_team')
      .select('id, nombre, rol, bio_publica')
      .eq('event_id', params.id)
      .not('bio_publica', 'is', null)
      .order('orden'),
  ])

  const blocks: ContentBlock[]  = (contentBlocks ?? []) as ContentBlock[]
  const items: ItineraryItem[]  = (itineraryItems ?? []) as ItineraryItem[]
  const members: TeamMember[]   = (teamMembers ?? []) as TeamMember[]

  return (
    <div className="bg-[#0C0C0C] min-h-screen">
      {/* Preview banner */}
      <div className="bg-amber-400 text-amber-900 px-4 py-2 flex items-center justify-between text-sm font-medium sticky top-0 z-50">
        <span>Vista del participante — {evento.nombre}</span>
        <Link
          href={`/eventos/${params.id}`}
          className="text-amber-800 hover:text-amber-900 font-semibold underline whitespace-nowrap"
        >
          Volver al admin
        </Link>
      </div>

      {/* Participant-style content */}
      <div className="max-w-sm mx-auto px-5 pt-6 pb-12 space-y-10 text-[#F5F0E8]">
        <ProgramaSection blocks={blocks} />
        <ItinerarioSection items={items} />
        <EquipoSection members={members} />
      </div>
    </div>
  )
}
