import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HelpButton from '@/components/HelpButton'
import { familiaVisible } from '@/lib/participante/familia'

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
  comida:     'bg-terra',
  actividad:  'bg-sky-400',
  libre:      'bg-gray',
  traslado:   'bg-slate-400',
  bienvenida: 'bg-bien',
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

export default async function ProgramaPage({
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
    .select('id, event_id')
    .eq('id', fam?.id ?? '00000000-0000-0000-0000-000000000000')
    .limit(1)
    .maybeSingle()

  if (!family) {
    return (
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-ink mb-4">Programa</h1>
        <div className="bg-white border border-line rounded-xl p-5 text-gray-ui text-sm">
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
    <div className="px-5 pt-6">
      <h1 className="text-xl font-bold text-ink mb-6">Programa</h1>

      {!items?.length ? (
        <div className="bg-white border border-line rounded-xl p-6 text-center text-gray-ui text-sm leading-relaxed">
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
                      ? 'bg-wine text-paper'
                      : 'bg-white text-gray-ui border border-line hover:border-line',
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
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg mb-4 ${today ? 'bg-terra/10 border border-terra/40' : 'bg-white border border-line'}`}>
                  <div>
                    <span className={`font-bold text-sm ${today ? 'text-terra-ui' : 'text-ink'}`}>Día {dia}</span>
                    {dayDate && (
                      <span className={`text-xs ml-2 ${today ? 'text-terra-ui' : 'text-gray-ui'}`}>
                        {formatDate(dayDate)}
                      </span>
                    )}
                  </div>
                  {today && (
                    <span className="text-[10px] font-bold text-terra-ui bg-terra/10 border border-terra/40 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      HOY
                    </span>
                  )}
                </div>

                {/* Timeline */}
                <div className="relative pl-16">
                  {/* Vertical line */}
                  <div className="absolute left-[52px] top-0 bottom-0 w-px bg-paper-2" />

                  <div className="space-y-5">
                    {(dayItems ?? []).map(item => (
                      <div key={item.id} className="relative">
                        {/* Time */}
                        <div className="absolute -left-16 top-0 text-xs text-gray-ui text-right w-12 pt-0.5 leading-tight">
                          {formatTime(item.hora_inicio)}
                        </div>

                        {/* Dot */}
                        <div className={`absolute -left-[7px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-paper z-10 ${tipoDot[item.tipo] ?? 'bg-gray'}`} />

                        {/* Content */}
                        <div className={`bg-white border rounded-xl p-4 ${today ? 'border-terra/40' : 'border-line'}`}>
                          <div className="font-semibold text-sm text-ink mb-1">{item.titulo}</div>
                          {item.hora_fin && (
                            <div className="text-xs text-gray-ui mb-1">hasta {formatTime(item.hora_fin)}</div>
                          )}
                          {item.ubicacion && (
                            <div className="text-xs text-gray-ui">📍 {item.ubicacion}</div>
                          )}
                          {item.descripcion && (
                            <div className="text-xs text-gray-ui mt-2 leading-relaxed">{item.descripcion}</div>
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
        <h2 className="text-base font-semibold text-ink mb-4">Contenido del retiro</h2>

        {activeBlocks.length === 0 ? (
          <div className="bg-white border border-line rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-ui">
              El equipo irá activando contenido durante el retiro
            </p>
          </div>
        ) : (
          <div>
            {activeBlocks.map(block => (
              <div
                key={block.id}
                className="bg-white border border-line rounded-2xl p-5 mb-4"
              >
                <div className="text-[10px] uppercase tracking-[0.15em] text-terra-ui mb-2">
                  {TIPO_LABELS[block.tipo] ?? block.tipo}
                </div>
                <h3 className="text-lg font-semibold text-ink mb-2">{block.titulo}</h3>
                {block.contenido && (
                  <p className="text-sm text-gray-ui leading-relaxed whitespace-pre-wrap">
                    {block.contenido}
                  </p>
                )}
                <div className="text-[10px] text-gray-ui mt-3">
                  Disponible desde {formatActivadoAt(block.activado_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <HelpButton pageId="programa" />
    </div>
  )
}
