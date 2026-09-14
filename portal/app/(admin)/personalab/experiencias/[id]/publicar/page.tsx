import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cargarParaEditar, resumenDePublicacion } from '@/lib/personalab/editorDatos'
import Publicar from './Publicar'
import { TARJETA, BTN_PRIMARIO } from '../../../tokens'

export default async function PublicarPage({ params }: { params: { id: string } }) {
  const r = await cargarParaEditar(params.id)

  if (r.estado === 'sin-experiencia') notFound()

  if (r.estado === 'sin-permiso') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-slate-900">Sin permiso de equipo</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.motivo}</p>
          <Link href="/personalab" className={`${BTN_PRIMARIO} inline-block mt-5`}>Volver</Link>
        </div>
      </div>
    )
  }

  if (r.estado === 'fallo') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-slate-900">No se pudo abrir</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.motivo}</p>
          <Link href="/personalab" className={`${BTN_PRIMARIO} inline-block mt-5`}>Volver</Link>
        </div>
      </div>
    )
  }

  const resumenPublicacion = await resumenDePublicacion(r.datos.experiencia.id)

  return (
    <Publicar
      experiencia={r.datos.experiencia}
      bloques={r.datos.bloques}
      resumenPublicacion={resumenPublicacion}
    />
  )
}
