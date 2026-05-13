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
                  <span className="font-bold text-sm text-[#F5F0E8]">Día {dia}</span>
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
    <div className="bg-slate-900 min-h-screen">
      {/* Admin banner */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-sm font-semibold text-white">
              Vista previa del portal — {evento.nombre}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Así ve el participante su portal en el celular
            </p>
          </div>
          <Link
            href={`/eventos/${params.id}`}
            className="text-xs text-slate-300 border border-slate-600 rounded-lg px-3 py-1.5 hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            Volver al admin
          </Link>
        </div>
      </div>

      {/* Phone mockup frame */}
      <div className="flex justify-center py-8">
        <div className="relative mx-auto" style={{ width: '375px' }}>
          {/* Phone shell */}
          <div
            className="relative bg-[#0C0C0C] rounded-[40px] shadow-2xl border-4 border-[#2A2A2A] overflow-hidden"
            style={{ minHeight: '780px' }}
          >
            {/* Status bar */}
            <div className="flex justify-between items-center px-6 pt-3 pb-1 relative z-10">
              <span className="text-white text-xs font-medium">9:41</span>
              <div className="flex items-center gap-1.5">
                {/* Signal bars */}
                <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                  <rect x="0" y="8" width="3" height="4" rx="0.5" fill="white"/>
                  <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="white"/>
                  <rect x="9" y="2" width="3" height="10" rx="0.5" fill="white"/>
                  <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="white" fillOpacity="0.4"/>
                </svg>
                {/* WiFi */}
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <path d="M8 9.5C8.83 9.5 9.5 10.17 9.5 11S8.83 12.5 8 12.5 6.5 11.83 6.5 11 7.17 9.5 8 9.5z" fill="white"/>
                  <path d="M8 6C9.9 6 11.6 6.8 12.8 8.1L11.7 9.2C10.8 8.2 9.5 7.5 8 7.5S5.2 8.2 4.3 9.2L3.2 8.1C4.4 6.8 6.1 6 8 6z" fill="white"/>
                  <path d="M8 2.5C10.9 2.5 13.5 3.7 15.4 5.6L14.3 6.7C12.7 5.1 10.5 4 8 4S3.3 5.1 1.7 6.7L0.6 5.6C2.5 3.7 5.1 2.5 8 2.5z" fill="white" fillOpacity="0.6"/>
                </svg>
                {/* Battery */}
                <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
                  <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="white" strokeOpacity="0.35"/>
                  <rect x="1.5" y="1.5" width="17" height="9" rx="1.5" fill="white"/>
                  <path d="M23 4v4a2 2 0 000-4z" fill="white" fillOpacity="0.4"/>
                </svg>
              </div>
            </div>

            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-20" />

            {/* Scrollable content */}
            <div className="overflow-y-auto" style={{ height: '720px', paddingBottom: '80px' }}>
              <div className="px-5 pt-4 space-y-8">
                <ProgramaSection blocks={blocks} />
                <ItinerarioSection items={items} />
                <EquipoSection members={members} />
              </div>
            </div>

            {/* Bottom nav mockup */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#111] border-t border-[#2A2A2A] flex justify-around py-3 px-4">
              {['Mi Retiro', 'Programa', 'Acuerdos', 'Equipo'].map(label => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="w-4 h-4 bg-[#3A3A3A] rounded-sm" />
                  <span className="text-[9px] text-[#6B7280]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
