import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HelpButton from '@/components/HelpButton'
import PantallaSinConvertir from '@/components/PantallaSinConvertir'

type ContentBlock = {
  id: string
  titulo: string
  contenido: string | null
  tipo: string
  activo: boolean
  activado_at: string | null
}

const TIPO_LABELS: Record<string, string> = {
  info:       'Información',
  actividad:  'Actividad',
  reflexion:  'Reflexión',
  formato:    'Formato',
}

function formatActivadoAt(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const tipoDot: Record<string, string> = {
  sesion:     'bg-violet-400',
  comida:     'bg-[#C9A96E]',
  actividad:  'bg-sky-400',
  libre:      'bg-[#A09A8F]',
  traslado:   'bg-slate-400',
  bienvenida: 'bg-emerald-400',
  cierre:     'bg-rose-400',
}

function formatTime(t: string | null) {
  if (!t) return ''
  return t.slice(0, 5)
}

function formatDate(d: string | null) {
  if (!d) return ''
  const raw = new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
  const lower = raw.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
}

interface ItineraryItem {
  id: string
  dia: number
  fecha: string | null
  hora_inicio: string | null
  hora_fin: string | null
  titulo: string
  descripcion: string | null
  tipo: string
  ubicacion: string | null
}

export default async function ProgramaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: family } = await supabase
    .from('families')
    .select('id, event_id')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .maybeSingle()

  if (!family) {
    return (
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-[#F5F0E8] mb-4">Programa</h1>
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 text-[#A09A8F] text-sm">
          Tu cuenta no tiene una familia asignada todavía.
        </div>
      </div>
    )
  }

  const { data: items } = await supabase
    .from('itinerary_items')
    .select('id, dia, fecha, hora_inicio, hora_fin, titulo, descripcion, tipo, ubicacion')
    .eq('event_id', family.event_id)
    .in('visibilidad', ['all', 'participant'])
    .order('dia')
    .order('orden')
    .order('hora_inicio')

  const { data: contentBlocks } = await supabase
    .from('event_content_blocks')
    .select('id, titulo, contenido, tipo, activo, activado_at')
    .eq('event_id', family.event_id)
    .eq('activo', true)
    .order('orden', { ascending: true })

  const activeBlocks: ContentBlock[] = contentBlocks ?? []

  const byDay: Record<number, ItineraryItem[]> = {}
  for (const item of (items ?? []) as ItineraryItem[]) {
    if (!byDay[item.dia]) byDay[item.dia] = []
    byDay[item.dia].push(item)
  }

  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b)
  const todayDia = days.find(dia => {
    const dayItems = byDay[dia]
    return dayItems && dayItems[0]?.fecha && isToday(dayItems[0].fecha)
  })

  return (
    <PantallaSinConvertir>
    <div className="px-5 pt-6">
      <h1 className="text-xl font-bold text-[#F5F0E8] mb-6">Programa</h1>

      {!items?.length ? (
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-6 text-center text-[#A09A8F] text-sm leading-relaxed">
          El programa del retiro estará disponible aquí aproximadamente 7 días antes de la fecha de inicio. Mientras tanto, revisa la sección de Información para los detalles de llegada.
        </div>
      ) : (
        <>
          {/* Day selector tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
            {days.map(dia => {
              const isActive = dia === (todayDia ?? days[0])
              return (
                <a
                  key={dia}
                  href={`#dia-${dia}`}
                  className={[
                    'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
                    isActive
                      ? 'bg-[#C9A96E] text-[#0C0C0C]'
                      : 'bg-[#181818] text-[#A09A8F] border border-[#2A2A2A] hover:border-[#3A3A3A]',
                  ].join(' ')}
                >
                  Día {dia}
                </a>
              )
            })}
          </div>

          {/* Days */}
          {days.map(dia => {
            const dayItems = byDay[dia]
            const dayDate = dayItems?.[0]?.fecha ?? null
            const today = dia === todayDia

            return (
              <div key={dia} id={`dia-${dia}`} className="mb-8">
                {/* Day header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg mb-4 ${today ? 'bg-[#C9A96E]/10 border border-[#C9A96E]/20' : 'bg-[#181818] border border-[#2A2A2A]'}`}>
                  <div>
                    <span className={`font-bold text-sm ${today ? 'text-[#C9A96E]' : 'text-[#F5F0E8]'}`}>Día {dia}</span>
                    {dayDate && (
                      <span className={`text-xs ml-2 ${today ? 'text-[#C9A96E]/70' : 'text-[#A09A8F]'}`}>
                        {formatDate(dayDate)}
                      </span>
                    )}
                  </div>
                  {today && (
                    <span className="text-[10px] font-bold text-[#C9A96E] bg-[#C9A96E]/10 border border-[#C9A96E]/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      HOY
                    </span>
                  )}
                </div>

                {/* Timeline */}
                <div className="relative pl-16">
                  {/* Vertical line */}
                  <div className="absolute left-[52px] top-0 bottom-0 w-px bg-[#2A2A2A]" />

                  <div className="space-y-5">
                    {(dayItems ?? []).map(item => (
                      <div key={item.id} className="relative">
                        {/* Time */}
                        <div className="absolute -left-16 top-0 text-xs text-[#6B7280] text-right w-12 pt-0.5 leading-tight">
                          {formatTime(item.hora_inicio)}
                        </div>

                        {/* Dot */}
                        <div className={`absolute -left-[7px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#0C0C0C] z-10 ${tipoDot[item.tipo] ?? 'bg-[#A09A8F]'}`} />

                        {/* Content */}
                        <div className={`bg-[#181818] border rounded-xl p-4 ${today ? 'border-[#C9A96E]/20' : 'border-[#2A2A2A]'}`}>
                          <div className="font-semibold text-sm text-[#F5F0E8] mb-1">{item.titulo}</div>
                          {item.hora_fin && (
                            <div className="text-xs text-[#6B7280] mb-1">hasta {formatTime(item.hora_fin)}</div>
                          )}
                          {item.ubicacion && (
                            <div className="text-xs text-[#A09A8F]">📍 {item.ubicacion}</div>
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
          <script dangerouslySetInnerHTML={{ __html: `
  document.addEventListener('DOMContentLoaded', function() {
    var day = ${todayDia ?? days[0] ?? 1};
    var el = document.getElementById('dia-' + day);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var tab = document.querySelector('a[href="#dia-' + day + '"]');
    if (tab) tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
`}} />
        </>
      )}

      {/* Content blocks section */}
      <div className="mt-10 mb-6">
        <h2 className="text-base font-semibold text-[#F5F0E8] mb-4">Contenido del retiro</h2>

        {activeBlocks.length === 0 ? (
          <div className="bg-[#181818] border border-white/5 rounded-2xl p-5 text-center">
            <p className="text-sm text-[#4A4540]">
              El equipo irá activando contenido durante el retiro
            </p>
          </div>
        ) : (
          <div>
            {activeBlocks.map(block => (
              <div
                key={block.id}
                className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-5 mb-4"
              >
                <div className="text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] mb-2">
                  {TIPO_LABELS[block.tipo] ?? block.tipo}
                </div>
                <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">{block.titulo}</h3>
                {block.contenido && (
                  <p className="text-sm text-[#B0A898] leading-relaxed whitespace-pre-wrap">
                    {block.contenido}
                  </p>
                )}
                <div className="text-[10px] text-white/20 mt-3">
                  Disponible desde {formatActivadoAt(block.activado_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <HelpButton pageId="programa" />
    </div>
    </PantallaSinConvertir>
  )
}
