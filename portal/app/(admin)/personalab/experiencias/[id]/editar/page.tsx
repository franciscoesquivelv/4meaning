import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cargarFichaExperiencia } from '@/lib/personalab/catalogo'
import EditarFichaClient from './EditarFichaClient'
import { TARJETA, BTN_PRIMARIO } from '../../../tokens'

export default async function EditarFichaPage({ params }: { params: { id: string } }) {
  const r = await cargarFichaExperiencia(params.id)

  if (r.estado === 'sin-acceso') notFound()

  if (r.estado === 'fallo') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-ink">No se pudo abrir la ficha</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">{r.motivo}</p>
          <Link href="/personalab/experiencias" className={`${BTN_PRIMARIO} inline-block mt-5`}>Volver</Link>
        </div>
      </div>
    )
  }

  return <EditarFichaClient experiencia={r.datos} />
}
