import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// ── PREVIA ──────────────────────────────────────────────────────
// Las nueve pantallas del participante, tal como las ve una pareja.
//
// ESTA PAGINA ERA OTRA COSA. Reconstruia el programa, el itinerario y el
// equipo por su cuenta, con su propio maquetado, asi que ensenaba algo que
// no era lo que el participante veia. Cuando la app se rediseno, esta previa
// siguio mostrando el diseno viejo, y quien vino a mirar aqui, que es donde
// tiene sentido buscar, concluyo que no habia cambiado nada.
//
// Ahora carga las RUTAS REALES dentro de un marco de telefono, con
// `?familia=`, asi que no hay ninguna copia que pueda desincronizarse. Lo
// que se ve aqui es literalmente la pantalla, con su barra inferior y todo.

const PANTALLAS = [
  { ruta: '/mi-retiro',    nombre: 'Mi retiro' },
  { ruta: '/programa',     nombre: 'Programa' },
  { ruta: '/avisos',       nombre: 'Avisos' },
  { ruta: '/acuerdos',     nombre: 'Acuerdos' },
  { ruta: '/compromisos',  nombre: 'Compromisos' },
  { ruta: '/info',         nombre: 'Información' },
  { ruta: '/documentos',   nombre: 'Documentos' },
  { ruta: '/equipo',       nombre: 'Equipo' },
  { ruta: '/formulario',   nombre: 'Formulario' },
]

export default async function PreviewPage({
  params, searchParams,
}: {
  params: { id: string }
  searchParams: { familia?: string; pantalla?: string }
}) {
  const supabase = createClient()

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .maybeSingle()

  if (!evento) notFound()

  const { data: familias } = await supabase
    .from('families')
    .select('id, nombre_familia')
    .eq('event_id', params.id)
    .order('nombre_familia')

  const lista = familias ?? []
  const familia = searchParams.familia && lista.some(f => f.id === searchParams.familia)
    ? searchParams.familia
    : lista[0]?.id

  const pantalla = PANTALLAS.find(p => p.ruta === searchParams.pantalla) ?? PANTALLAS[0]

  const enlace = (f?: string, r?: string) =>
    `/eventos/${params.id}/preview?familia=${f ?? familia}&pantalla=${encodeURIComponent(r ?? pantalla.ruta)}`

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Lo que ve la pareja
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mt-1">Previa</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-[64ch]">
          Son las pantallas de verdad, cargadas tal cual, no una reconstrucción. Si el diseño cambia,
          esto cambia solo.
        </p>
      </div>

      {lista.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-xl px-5 py-8 text-center">
          <p className="text-sm text-slate-600">Este evento todavía no tiene familias.</p>
          <p className="text-xs text-slate-400 mt-2">
            La previa muestra lo que ve una pareja, así que necesita al menos una.
          </p>
          <Link
            href={`/eventos/${params.id}/familias/nueva`}
            className="inline-flex items-center bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors mt-5"
          >
            Agregar familia
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-8 items-start">

          {/* Las nueve pantallas */}
          <nav className="flex flex-col gap-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Pantalla
            </div>
            {PANTALLAS.map(p => {
              const activa = p.ruta === pantalla.ruta
              return (
                <Link
                  key={p.ruta}
                  href={enlace(undefined, p.ruta)}
                  className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                    activa
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p.nombre}
                </Link>
              )
            })}
          </nav>

          <div>
            {/* Cada familia ve algo distinto según lo que tenga pendiente,
                así que mirar una sola no dice mucho. */}
            <div className="flex items-center gap-2 flex-wrap mb-5">
              {lista.map(f => {
                const activa = f.id === familia
                return (
                  <Link
                    key={f.id}
                    href={enlace(f.id)}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                      activa
                        ? 'bg-slate-900 text-white border-slate-900 font-medium'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {f.nombre_familia}
                  </Link>
                )
              })}
            </div>

            {/* Marco de teléfono. La app es móvil: enseñarla a lo ancho de un
                escritorio mentiría sobre cómo se ve. 390 es el ancho de un
                iPhone estándar. */}
            <div className="flex justify-center">
              <div className="w-[390px] rounded-[34px] border-[10px] border-slate-800 overflow-hidden shadow-2xl bg-white">
                <iframe
                  key={`${familia}-${pantalla.ruta}`}
                  src={`${pantalla.ruta}?familia=${familia}`}
                  title={`${pantalla.nombre}, vista de la pareja`}
                  className="w-full h-[780px] border-0 block"
                />
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4">
              Es la pantalla en vivo. Se puede navegar dentro del marco, y sale de la previa si lo
              haces.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
