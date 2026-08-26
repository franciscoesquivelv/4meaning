import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MiRetiro from '@/components/participante/MiRetiro'
import { cargarMiRetiro } from '@/lib/participante/mi-retiro'

// ── PREVIA ──────────────────────────────────────────────────────
// Lo que ve una pareja, de verdad.
//
// ESTA PAGINA ERA OTRA COSA. Reconstruia el programa, el itinerario y el
// equipo por su cuenta, con su propio maquetado, asi que ensenaba algo que
// no era lo que el participante veia. Cuando la app del participante se
// rediseno, esta previa siguio mostrando el diseno viejo, y quien vino a
// mirar aqui, que es donde tiene sentido buscar, concluyo que no habia
// cambiado nada.
//
// Ahora renderiza el MISMO componente que abre la pareja. Si el diseno
// cambia, esto cambia solo, y una previa que se desincroniza deja de ser
// posible por construccion.
//
// Las demas pantallas (programa, avisos, acuerdos) se van sumando aqui
// conforme se convierten a los tokens de marca.

export default async function PreviewPage({
  params, searchParams,
}: {
  params: { id: string }
  searchParams: { familia?: string }
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
  const elegida = searchParams.familia && lista.some(f => f.id === searchParams.familia)
    ? searchParams.familia
    : lista[0]?.id

  const datos = elegida ? await cargarMiRetiro(supabase, { familyId: elegida }) : null

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Lo que ve la pareja
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mt-1">Previa</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-[64ch]">
          Es la pantalla de verdad, no una reconstrucción. Si el diseño cambia, esto cambia solo.
          Los enlaces no navegan: aquí solo se mira.
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
        <>
          {/* Selector. Cada familia ve algo distinto según lo que tenga
              pendiente, así que mirar una sola no dice mucho. */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {lista.map(f => {
              const activa = f.id === elegida
              return (
                <Link
                  key={f.id}
                  href={`/eventos/${params.id}/preview?familia=${f.id}`}
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

          {/* Marco de teléfono. La app es móvil, así que enseñarla a lo ancho
              de un escritorio mentiría sobre cómo se ve. 390 es el ancho de
              un iPhone estándar. */}
          <div className="flex justify-center">
            <div className="marca-trascendencia w-[390px] rounded-[34px] border-[10px] border-slate-800 overflow-hidden shadow-2xl bg-paper">
              <div className="h-[780px] overflow-y-auto">
                {datos && <MiRetiro datos={datos} previa />}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            La barra inferior de navegación se omite. Las demás pantallas se suman aquí conforme se
            convierten.
          </p>
        </>
      )}
    </div>
  )
}
