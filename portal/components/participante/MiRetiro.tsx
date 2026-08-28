import Link from 'next/link'
import { ETIQUETA_ENTREGA, type EstadoEntrega } from '@/lib/entregas'
import { diasHasta, tramoDe, type DatosMiRetiro, type Tramo } from '@/lib/participante/mi-retiro'

// La pantalla de entrada del participante. Vive aquí, y no dentro de su
// página, porque la abren dos personas: la pareja y el equipo desde la previa
// del admin. Una sola fuente, así que lo que ve el equipo es lo que hay.

function fecha(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long' })
}

// ── El arco ─────────────────────────────────────────────────────
// Huellas, Excavaciones, Tesoros, Legado. Es la arquitectura verbal de la
// marca, no una barra de avance: dice DÓNDE VAS, no cuánto llevas.
//
// Sustituye a la cuenta regresiva como elemento dominante. Antes lo más
// grande de toda la fase previa era un número de 120px, así que lo primero
// que sentía alguien antes de un retiro sobre legado familiar era ansiedad
// medida en días.
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
              <span className={n <= i ? 'w-[9px] h-[9px] rounded-full bg-wine' : 'w-[9px] h-[9px] rounded-full border border-gray/50'} />
              <span className={`text-[9.5px] uppercase tracking-[.12em] ${n === i ? 'text-wine font-semibold' : n < i ? 'text-wine/60' : 'text-gray-ui'}`}>
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

function FilaEntrega({ titulo, estado, url }: { titulo: string; estado: EstadoEntrega; url: string | null }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[15px] text-ink">{titulo}</span>
      {estado === 'entregado' ? (
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-wine hover:underline">Verlo ↗</a>
        ) : (
          <span className="text-[13px] text-wine font-medium">{ETIQUETA_ENTREGA.entregado} ✓</span>
        )
      ) : estado === 'en_produccion' ? (
        <span className="text-[13px] text-terra-ui">{ETIQUETA_ENTREGA.en_produccion}</span>
      ) : (
        <span className="text-[13px] text-gray-ui">{ETIQUETA_ENTREGA.pendiente}</span>
      )}
    </div>
  )
}

// Peso claramente menor que la tarjeta principal, para que en cada pantalla
// haya UNA sola acción que importe.
function Fila({
  href, titulo, sub, hecho = false, externo = false, inerte = false,
}: {
  href: string
  titulo: string
  sub?: string
  hecho?: boolean
  externo?: boolean
  inerte?: boolean
}) {
  const cuerpo = (
    <>
      <div className="flex-1 min-w-0">
        <div className={`text-[15px] ${hecho ? 'text-gray-ui' : 'text-ink'}`}>{titulo}</div>
        {sub && <div className="text-[12px] text-gray-ui mt-0.5">{sub}</div>}
      </div>
      {hecho ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-wine/70 shrink-0">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-gray-ui shrink-0">
          <path d={externo ? 'M7 17L17 7M8 7h9v9' : 'M9 18l6-6-6-6'} />
        </svg>
      )}
    </>
  )
  const clase = 'flex items-center gap-3 px-4 py-3.5 min-h-[44px] bg-white border border-line rounded-[10px] transition-colors hover:border-terra/50'
  // En la previa del equipo, los enlaces no navegan: sacarían al admin de su
  // propia pantalla.
  if (inerte) return <div className={clase}>{cuerpo}</div>
  return externo
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={clase}>{cuerpo}</a>
    : <Link href={href} className={clase}>{cuerpo}</Link>
}

export default function MiRetiro({ datos, previa = false }: { datos: DatosMiRetiro; previa?: boolean }) {
  const { familia, evento, storybook, video, acuerdosTotal, acuerdosPendientes, formularioEnviado, avisos } = datos

  if (!familia) return null

  const firmados = acuerdosTotal > 0 && acuerdosPendientes === 0
  const inicio = diasHasta(evento?.fecha_inicio ?? null)
  const fin = diasHasta(evento?.fecha_fin ?? null)
  const enCurso = inicio !== null && fin !== null && inicio <= 0 && fin >= 0
  const yaPaso = fin !== null && fin < 0
  const tramo = tramoDe(datos)

  const Contenedor = previa ? 'div' : 'div'

  return (
    <Contenedor>
      {/* ── Cabecera inmersiva ─────────────────────────────────
          La aurora de brand.css: blobs radiales sobre el fondo profundo de
          la marca dominante, que aquí es vino. */}
      <div className="relative overflow-hidden bg-dom-deep px-6 pt-14 pb-8">
        <div className="absolute inset-[-30%] blur-[60px] pointer-events-none">
          <span className="absolute w-[300px] h-[300px] rounded-full -top-[4%] -left-[12%] opacity-90" style={{ background: 'radial-gradient(circle, var(--wine-2), transparent 70%)' }} />
          <span className="absolute w-[260px] h-[260px] rounded-full -bottom-[18%] -right-[14%] opacity-50" style={{ background: 'radial-gradient(circle, var(--terra), transparent 68%)' }} />
          <span className="absolute w-[220px] h-[220px] rounded-full -bottom-[22%] left-[22%] opacity-45" style={{ background: 'radial-gradient(circle, var(--teal-2), transparent 70%)' }} />
          <span className="absolute w-[160px] h-[160px] rounded-full top-[8%] right-[12%] opacity-20" style={{ background: 'radial-gradient(circle, var(--gold), transparent 72%)' }} />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <span className="cejilla cejilla-claro">{evento?.nombre ?? 'Trascendencia'}</span>
            {!previa && (
              <form action="/auth/signout" method="POST">
                <button type="submit" className="text-[11px] text-paper/45 hover:text-paper/80 transition-colors">Salir</button>
              </form>
            )}
          </div>

          <h1 className="display text-[34px] text-paper mt-4">{familia.nombre_familia}</h1>

          {evento && (
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 mt-5 pt-4 border-t border-white/[.14]">
              {(evento.ciudad || evento.ubicacion) && (
                <>
                  <span className="text-[13px] text-paper/70">{evento.ciudad || evento.ubicacion}</span>
                  <span className="text-[13px] text-paper/30">·</span>
                </>
              )}
              <span className="text-[13px] text-paper/70">
                {fecha(evento.fecha_inicio)}{evento.fecha_fin ? ` al ${fecha(evento.fecha_fin)}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {evento && <Arco actual={tramo} />}

      <div className="px-5 pt-6 pb-8">

        {enCurso && (
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-terra animate-pulse" />
            <span className="text-[14px] text-ink">Están en el retiro. Guarden el teléfono.</span>
          </div>
        )}

        {avisos.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            {avisos.map(a => (
              <Fila
                key={a.id}
                href="/avisos"
                inerte={previa}
                titulo={a.titulo}
                sub={a.tipo === 'urgente' ? 'Urgente' : a.tipo === 'logistica' ? 'Logística' : 'Aviso'}
              />
            ))}
          </div>
        )}

        {!yaPaso && (
          <div className="flex items-baseline justify-between mb-3">
            <span className="cejilla">Lo que sigue</span>
            {inicio !== null && inicio > 0 && (
              <span className="text-[12px] text-gray-ui">{inicio === 1 ? 'Falta un día' : `Faltan ${inicio} días`}</span>
            )}
          </div>
        )}

        {/* La única acción que importa, con el peso de la pantalla. Si no hay
            ninguna pendiente, NO se inventa una. */}
        {!yaPaso && !formularioEnviado && (
          <TarjetaPrincipal
            href="/formulario"
            inerte={previa}
            cejilla="Antes de llegar"
            titulo="La historia de su familia"
            texto="Lo que nos cuenten aquí es de donde sale su Storybook. Tómense su tiempo."
            boton="Empezar"
          />
        )}

        {!yaPaso && formularioEnviado && acuerdosTotal > 0 && !firmados && (
          <TarjetaPrincipal
            href="/acuerdos"
            inerte={previa}
            cejilla="Antes de llegar"
            titulo={acuerdosPendientes === 1 ? 'Falta un acuerdo por firmar' : `Faltan ${acuerdosPendientes} acuerdos por firmar`}
            boton="Firmar"
          />
        )}

        <div className="flex flex-col gap-2">
          {formularioEnviado && <Fila href="/formulario" inerte={previa} titulo="La historia de su familia" sub="Ya la compartieron" hecho />}
          {acuerdosTotal > 0 && firmados && <Fila href="/acuerdos" inerte={previa} titulo="Acuerdos" sub={`${acuerdosTotal} de ${acuerdosTotal} firmados`} hecho />}

          <Fila href="/programa" inerte={previa} titulo="El programa" sub="Lo que va a pasar cada día" />
          <Fila href="/info" inerte={previa} titulo="Información del retiro" sub="Sede, habitación y qué llevar" />
          <Fila href="/documentos" inerte={previa} titulo="Documentos" />
          <Fila href="/equipo" inerte={previa} titulo="Quién los acompaña" />

          {evento?.nube_url && (
            <Fila
              href={evento.nube_url}
              inerte={previa}
              externo
              titulo="Álbum del retiro"
              sub={yaPaso ? 'Las fotos de esos días' : 'Sus fotos, en un solo lugar'}
            />
          )}
        </div>

        {yaPaso && (storybook || video) && (
          <div className="mt-6">
            <div className="cejilla mb-3">Lo que se llevan</div>
            <div className="bg-white border border-line rounded-[10px] px-4 py-3">
              {storybook && <FilaEntrega titulo="Storybook" estado={storybook} url={evento?.nube_url ?? null} />}
              {video && <FilaEntrega titulo="Video familiar" estado={video} url={evento?.nube_url ?? null} />}
            </div>
          </div>
        )}
      </div>
    </Contenedor>
  )
}

function TarjetaPrincipal({
  href, cejilla, titulo, texto, boton, inerte,
}: {
  href: string
  cejilla: string
  titulo: string
  texto?: string
  boton: string
  inerte: boolean
}) {
  const cuerpo = (
    <>
      <span className="absolute w-[190px] h-[190px] rounded-full -top-[60px] -right-[50px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(185,115,90,.42), transparent 70%)' }} />
      <span className="relative block">
        <span className="block text-[9.5px] font-semibold uppercase tracking-[.2em] text-terra-lo">{cejilla}</span>
        <span className="block text-[21px] font-light tracking-tight text-paper mt-2">{titulo}</span>
        {texto && <span className="block text-[13.5px] text-paper/70 leading-relaxed mt-2">{texto}</span>}
        <span className="inline-flex items-center bg-paper text-wine text-[13.5px] font-medium px-5 py-3 rounded-full min-h-[44px] mt-4">{boton}</span>
      </span>
    </>
  )
  const clase = 'relative overflow-hidden block bg-wine rounded-[10px] p-5 mb-2.5'
  if (inerte) return <div className={clase}>{cuerpo}</div>
  return <Link href={href} className={clase}>{cuerpo}</Link>
}
