import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import PushSubscribeButton from '@/components/PushSubscribeButton'
import HelpButton from '@/components/HelpButton'
import { estadoEntrega, ETIQUETA_ENTREGA, type EstadoEntrega } from '@/lib/entregas'

const FirstTimeWelcome = dynamic(() => import('@/components/FirstTimeWelcome'), { ssr: false })

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long' })
}

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  // Se interpreta la fecha a mediodía UTC para no cruzar el límite de día
  // según la zona horaria de quien mira.
  const target = new Date(dateStr + 'T12:00:00Z')
  const now = new Date()
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const targetUTC = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate())
  return Math.ceil((targetUTC - todayUTC) / (1000 * 60 * 60 * 24))
}

// ── El arco ─────────────────────────────────────────────────────
// Huellas, Excavaciones, Tesoros, Legado. Es la arquitectura verbal de la
// marca, no una barra de avance: dice DÓNDE VAS, no cuánto llevas.
//
// Sustituye a la cuenta regresiva como elemento dominante de la pantalla.
// Antes lo más grande de toda la fase previa era un número de 120px, así
// que lo primero que sentía alguien antes de un retiro sobre legado
// familiar era ansiedad medida en días. Los días siguen ahí, en una línea
// tranquila.
type Tramo = 'huellas' | 'excavaciones' | 'tesoros' | 'legado'
const TRAMOS: { id: Tramo; label: string }[] = [
  { id: 'huellas',      label: 'Huellas' },
  { id: 'excavaciones', label: 'Excavar' },
  { id: 'tesoros',      label: 'Tesoros' },
  { id: 'legado',       label: 'Legado' },
]

function Arco({ actual }: { actual: Tramo }) {
  const i = TRAMOS.findIndex(t => t.id === actual)
  return (
    <div className="px-6 py-5 bg-paper-2 border-b border-line">
      <div className="flex items-center">
        {TRAMOS.map((t, n) => (
          <div key={t.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-[7px] flex-1">
              <span
                className={
                  n <= i
                    ? 'w-[9px] h-[9px] rounded-full bg-wine'
                    : 'w-[9px] h-[9px] rounded-full border border-gray/50'
                }
              />
              <span
                className={`text-[9.5px] uppercase tracking-[.12em] ${
                  n === i ? 'text-wine font-semibold' : n < i ? 'text-wine/60' : 'text-gray'
                }`}
              >
                {t.label}
              </span>
            </div>
            {n < TRAMOS.length - 1 && <span className="h-px flex-1 bg-line mb-4" />}
          </div>
        ))}
      </div>
    </div>
  )
}

// Una fila de entrega. Estaba duplicada palabra por palabra para el
// Storybook y para el Video, que es parte de por qué el desajuste de
// vocabulario pasó desapercibido: había que verlo dos veces.
function EstadoEntregaFila({
  titulo, estado, url,
}: {
  titulo: string
  estado: EstadoEntrega
  url: string | null
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[15px] text-ink">{titulo}</span>
      {estado === 'entregado' ? (
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-wine hover:underline">
            Verlo ↗
          </a>
        ) : (
          <span className="text-[13px] text-wine font-medium">{ETIQUETA_ENTREGA.entregado} ✓</span>
        )
      ) : estado === 'en_produccion' ? (
        <span className="text-[13px] text-terra">{ETIQUETA_ENTREGA.en_produccion}</span>
      ) : (
        <span className="text-[13px] text-gray">{ETIQUETA_ENTREGA.pendiente}</span>
      )}
    </div>
  )
}

// Fila secundaria: peso claramente menor que la tarjeta principal, para que
// en cada pantalla haya UNA sola acción que importe.
function Fila({
  href, titulo, sub, hecho = false, externo = false,
}: {
  href: string
  titulo: string
  sub?: string
  hecho?: boolean
  externo?: boolean
}) {
  const cuerpo = (
    <>
      <div className="flex-1 min-w-0">
        <div className={`text-[15px] ${hecho ? 'text-gray' : 'text-ink'}`}>{titulo}</div>
        {sub && <div className="text-[12px] text-gray mt-0.5">{sub}</div>}
      </div>
      {hecho ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-wine/70 shrink-0">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-gray shrink-0">
          <path d={externo ? 'M7 17L17 7M8 7h9v9' : 'M9 18l6-6-6-6'} />
        </svg>
      )}
    </>
  )
  const clase =
    'flex items-center gap-3 px-4 py-3.5 min-h-[44px] bg-white border border-line rounded-[10px] transition-colors hover:border-terra/50'
  return externo ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={clase}>{cuerpo}</a>
  ) : (
    <Link href={href} className={clase}>{cuerpo}</Link>
  )
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

  const firstName = profile?.full_name?.split(' ')[0] ?? null

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

  const storybook = estadoEntrega((family as unknown as { storybook_status?: string } | null)?.storybook_status)
  const video = estadoEntrega((family as unknown as { video_status?: string } | null)?.video_status)

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
  const yaPaso = daysUntilEnd !== null && daysUntilEnd < 0

  // Dónde va la familia en el arco, según el estado real, no inventado.
  const tramo: Tramo = yaPaso
    ? (storybook === 'entregado' && video === 'entregado' ? 'legado' : 'tesoros')
    : isHappening
      ? 'excavaciones'
      : 'huellas'

  return (
    <div>
      <FirstTimeWelcome />

      {family?.event_id && (
        <div className="fixed top-4 right-4 z-40">
          <PushSubscribeButton eventId={family.event_id} />
        </div>
      )}

      {/* ── Sin familia vinculada ─────────────────────────────── */}
      {!family && (
        <div className="flex flex-col items-center justify-center text-center py-24 px-8 min-h-screen">
          <span className="w-2 h-2 rounded-full bg-terra mb-8" />
          <p className="text-[22px] font-extralight tracking-tight text-ink mb-3">
            {firstName ? `Tu cuenta está lista, ${firstName}` : 'Tu cuenta está lista'}
          </p>
          <p className="text-[14px] text-gray leading-relaxed max-w-xs mb-8">
            Tu coordinadora todavía no la ha vinculado al retiro. Suele hacerse dos a cuatro semanas
            antes. Si crees que es un error, escríbele directamente.
          </p>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="px-5 py-3 min-h-[44px] text-[14px] text-gray border border-line rounded-full hover:border-terra hover:text-ink transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      )}

      {family && (
        <>
          {/* ── Cabecera inmersiva ───────────────────────────────
              La aurora de brand.css: blobs radiales sobre el fondo
              profundo de la marca dominante, que aquí es vino. */}
          <div className="relative overflow-hidden bg-dom-deep px-6 pt-14 pb-8">
            <div className="absolute inset-[-30%] blur-[60px] pointer-events-none">
              <span className="absolute w-[300px] h-[300px] rounded-full -top-[4%] -left-[12%] opacity-90"
                    style={{ background: 'radial-gradient(circle, var(--wine-2), transparent 70%)' }} />
              <span className="absolute w-[260px] h-[260px] rounded-full -bottom-[18%] -right-[14%] opacity-50"
                    style={{ background: 'radial-gradient(circle, var(--terra), transparent 68%)' }} />
              <span className="absolute w-[220px] h-[220px] rounded-full -bottom-[22%] left-[22%] opacity-45"
                    style={{ background: 'radial-gradient(circle, var(--teal-2), transparent 70%)' }} />
              <span className="absolute w-[160px] h-[160px] rounded-full top-[8%] right-[12%] opacity-20"
                    style={{ background: 'radial-gradient(circle, var(--gold), transparent 72%)' }} />
            </div>

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <span className="cejilla">{evento?.nombre ?? 'Trascendencia'}</span>
                <form action="/auth/signout" method="POST">
                  <button type="submit" className="text-[11px] text-paper/45 hover:text-paper/80 transition-colors">
                    Salir
                  </button>
                </form>
              </div>

              <h1 className="display text-[34px] text-paper mt-4">{family.nombre_familia}</h1>

              {evento && (
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 mt-5 pt-4 border-t border-white/[.14]">
                  {(evento.ciudad || evento.ubicacion) && (
                    <>
                      <span className="text-[13px] text-paper/70">{evento.ciudad || evento.ubicacion}</span>
                      <span className="text-[13px] text-paper/30">·</span>
                    </>
                  )}
                  <span className="text-[13px] text-paper/70">
                    {formatDate(evento.fecha_inicio)}
                    {evento.fecha_fin ? ` al ${formatDate(evento.fecha_fin)}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {evento && <Arco actual={tramo} />}

          <div className="px-5 pt-6">

            {/* ── El estado del día ─────────────────────────────── */}
            {isHappening && (
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-2 h-2 rounded-full bg-terra animate-pulse" />
                <span className="text-[14px] text-ink">Estás en el retiro. Guarda el teléfono.</span>
              </div>
            )}

            {/* ── Avisos ────────────────────────────────────────── */}
            {recentAnnouncements.length > 0 && (
              <div className="flex flex-col gap-2 mb-6">
                {recentAnnouncements.map(a => (
                  <Link
                    key={a.id}
                    href="/avisos"
                    className={`flex items-center gap-3 px-4 py-3.5 min-h-[44px] rounded-[10px] border transition-colors ${
                      a.tipo === 'urgente'
                        ? 'bg-wine/[.06] border-wine/30 hover:border-wine/60'
                        : 'bg-white border-line hover:border-terra/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-[.18em] text-terra mb-0.5">
                        {a.tipo === 'urgente' ? 'Urgente' : a.tipo === 'logistica' ? 'Logística' : 'Aviso'}
                      </p>
                      <p className="text-[15px] text-ink leading-snug truncate">{a.titulo}</p>
                    </div>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-gray shrink-0">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}

            {/* ── Lo que sigue ──────────────────────────────────── */}
            {!yaPaso && (
              <div className="flex items-baseline justify-between mb-3">
                <span className="cejilla">Lo que sigue</span>
                {daysUntil !== null && daysUntil > 0 && (
                  <span className="text-[12px] text-gray">
                    {daysUntil === 1 ? 'Falta un día' : `Faltan ${daysUntil} días`}
                  </span>
                )}
              </div>
            )}

            {/* La única acción que importa, con el peso de la pantalla.
                Si no hay ninguna pendiente, no se inventa una. */}
            {!yaPaso && !intakeSubmitted && (
              <Link
                href="/formulario"
                className="relative overflow-hidden block bg-wine rounded-[10px] p-5 mb-2.5"
              >
                <span className="absolute w-[190px] h-[190px] rounded-full -top-[60px] -right-[50px] pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(185,115,90,.42), transparent 70%)' }} />
                <span className="relative block">
                  <span className="block text-[9.5px] font-semibold uppercase tracking-[.2em] text-terra-lo">
                    Antes de llegar
                  </span>
                  <span className="block text-[21px] font-light tracking-tight text-paper mt-2">
                    La historia de su familia
                  </span>
                  <span className="block text-[13.5px] text-paper/70 leading-relaxed mt-2">
                    Lo que nos cuenten aquí es de donde sale su Storybook. Tómense su tiempo.
                  </span>
                  <span className="inline-flex items-center bg-paper text-wine text-[13.5px] font-medium px-5 py-3 rounded-full min-h-[44px] mt-4">
                    Empezar
                  </span>
                </span>
              </Link>
            )}

            {!yaPaso && intakeSubmitted && totalCount > 0 && !allSigned && (
              <Link href="/acuerdos" className="relative overflow-hidden block bg-wine rounded-[10px] p-5 mb-2.5">
                <span className="absolute w-[190px] h-[190px] rounded-full -top-[60px] -right-[50px] pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(185,115,90,.42), transparent 70%)' }} />
                <span className="relative block">
                  <span className="block text-[9.5px] font-semibold uppercase tracking-[.2em] text-terra-lo">
                    Antes de llegar
                  </span>
                  <span className="block text-[21px] font-light tracking-tight text-paper mt-2">
                    {pendingCount === 1 ? 'Falta un acuerdo por firmar' : `Faltan ${pendingCount} acuerdos por firmar`}
                  </span>
                  <span className="inline-flex items-center bg-paper text-wine text-[13.5px] font-medium px-5 py-3 rounded-full min-h-[44px] mt-4">
                    Firmar
                  </span>
                </span>
              </Link>
            )}

            {/* ── Lo demás, en peso menor ───────────────────────── */}
            <div className="flex flex-col gap-2">
              {intakeSubmitted && (
                <Fila href="/formulario" titulo="La historia de su familia" sub="Ya la compartieron" hecho />
              )}
              {totalCount > 0 && allSigned && (
                <Fila href="/acuerdos" titulo="Acuerdos" sub={`${totalCount} de ${totalCount} firmados`} hecho />
              )}
              {totalCount > 0 && !allSigned && intakeSubmitted && null}

              <Fila href="/programa" titulo="El programa" sub="Lo que va a pasar cada día" />
              <Fila href="/info" titulo="Información del retiro" sub="Sede, habitación y qué llevar" />
              <Fila href="/documentos" titulo="Documentos" />
              <Fila href="/equipo" titulo="Quién los acompaña" />

              {evento?.nube_url && (
                <Fila
                  href={evento.nube_url}
                  titulo="Álbum del retiro"
                  sub={yaPaso ? 'Las fotos de esos días' : 'Sus fotos, en un solo lugar'}
                  externo
                />
              )}
            </div>

            {/* ── Los objetos que se llevan ─────────────────────── */}
            {yaPaso && (storybook || video) && (
              <div className="mt-6">
                <div className="cejilla mb-3">Lo que se llevan</div>
                <div className="bg-white border border-line rounded-[10px] px-4 py-3">
                  {storybook && <EstadoEntregaFila titulo="Storybook" estado={storybook} url={evento?.nube_url ?? null} />}
                  {video && <EstadoEntregaFila titulo="Video familiar" estado={video} url={evento?.nube_url ?? null} />}
                </div>
              </div>
            )}

          </div>
        </>
      )}

      <HelpButton pageId="mi-retiro" />
    </div>
  )
}
