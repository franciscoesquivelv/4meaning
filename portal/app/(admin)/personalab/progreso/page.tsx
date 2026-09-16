import Link from 'next/link'
import { cargarProgreso } from '@/lib/personalab/progreso'
import ProgresoClient from './ProgresoClient'
import { TARJETA, BTN_PRIMARIO } from '../tokens'

// Server component: `cargarProgreso` necesita la sesión de quien pide la
// página (para `exigirEquipo()`), igual que Compras y el editor.

export default async function ProgresoPage({
  searchParams,
}: {
  searchParams: { experiencia?: string }
}) {
  const r = await cargarProgreso(searchParams.experiencia)

  if (r.estado === 'sin-acceso') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-ink">Sin permiso de equipo</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">
            Tu cuenta no tiene permiso de equipo sobre PersonaLab.
          </p>
          <Link href="/personalab" className={`${BTN_PRIMARIO} inline-block mt-5`}>
            Volver
          </Link>
        </div>
      </div>
    )
  }

  if (r.estado === 'fallo') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-ink">No se pudo abrir Progreso</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">{r.motivo}</p>
          <Link href="/personalab" className={`${BTN_PRIMARIO} inline-block mt-5`}>
            Volver
          </Link>
        </div>
      </div>
    )
  }

  return <ProgresoClient datos={r.datos} />
}
