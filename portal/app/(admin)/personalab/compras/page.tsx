import Link from 'next/link'
import { cargarCompras } from '@/lib/personalab/compras'
import ComprasClient from './ComprasClient'
import { TARJETA, BTN_PRIMARIO } from '../tokens'

// Server component: `cargarCompras` necesita la sesión de quien pide la
// página (para `exigirEquipo()`), igual que `editor/page.tsx`.

export default async function ComprasPage() {
  const r = await cargarCompras()

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
          <h1 className="text-lg font-semibold text-ink">No se pudo abrir Compras</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">{r.motivo}</p>
          <Link href="/personalab" className={`${BTN_PRIMARIO} inline-block mt-5`}>
            Volver
          </Link>
        </div>
      </div>
    )
  }

  return <ComprasClient datos={r.datos} />
}
