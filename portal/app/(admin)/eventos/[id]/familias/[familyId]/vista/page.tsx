import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MiRetiro from '@/components/participante/MiRetiro'
import { cargarMiRetiro } from '@/lib/participante/mi-retiro'

// ── LA PREVIA DEL EQUIPO ────────────────────────────────────────
// Lo que ve esta pareja, exactamente.
//
// POR QUE EXISTE. Hasta hoy nadie del equipo podia ver la app del
// participante: con cuenta de super admin, admin o staff, el layout del
// participante te rebota al dashboard, y no habia ninguna otra puerta. Se
// estaban entregando pantallas a ciegas.
//
// Renderiza el MISMO componente que ve la pareja, no una reconstruccion.
// Esa distincion es la que importa: `eventos/[id]/preview` si reconstruye la
// vista por su cuenta, y por eso lleva meses mostrando algo que no es lo que
// hay. Aqui, si la pantalla cambia, esta previa cambia sola.
//
// Los enlaces van inertes a proposito: navegar sacaria al admin de su propia
// pantalla, y ademas esas rutas lo rebotarian.

export default async function VistaFamiliaPage({
  params,
}: {
  params: { id: string; familyId: string }
}) {
  const supabase = createClient()
  const datos = await cargarMiRetiro(supabase, { familyId: params.familyId })

  if (!datos.familia) notFound()

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <Link
        href={`/eventos/${params.id}/familias`}
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        ← Familias
      </Link>

      <div className="flex items-start justify-between gap-6 mt-4 mb-6 flex-wrap">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Lo que ve la pareja
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mt-1">
            {datos.familia.nombre_familia}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-[62ch]">
            Es la pantalla de verdad, no una reconstrucción. Si el diseño cambia, esto cambia solo.
            Los enlaces no navegan: aquí solo se mira.
          </p>
        </div>
        <Link
          href={`/eventos/${params.id}/familias/${params.familyId}/ficha`}
          className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2 whitespace-nowrap"
        >
          Ver la ficha
        </Link>
      </div>

      {/* Marco de teléfono. La app es móvil, así que enseñarla a lo ancho de
          un escritorio mentiría sobre cómo se ve. 390 es el ancho de un
          iPhone estándar. */}
      <div className="flex justify-center">
        <div className="marca-trascendencia w-[390px] rounded-[34px] border-[10px] border-slate-800 overflow-hidden shadow-2xl bg-paper">
          <div className="h-[780px] overflow-y-auto">
            <MiRetiro datos={datos} previa />
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        La barra inferior de navegación se omite en la previa.
      </p>
    </div>
  )
}
