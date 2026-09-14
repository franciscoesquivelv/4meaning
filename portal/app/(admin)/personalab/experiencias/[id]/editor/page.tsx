import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cargarParaEditar } from '@/lib/personalab/editorDatos'
import Editor from './Editor'
import { TARJETA, BTN_PRIMARIO } from '../../../tokens'

// ETAPA 3. Antes: `experiencia(params.id)` sacaba TODO de `dominio.ts`, el
// catálogo escrito a mano, incluida la lista de bisagras. Ahora ese id de
// ruta es el slug real de la experiencia, y todo sale de la base: la
// experiencia, su borrador (se abre uno si no existe), sus bisagras y sus
// bloques.
//
// Server component, no client: `cargarParaEditar` necesita la sesión de
// quien pide la página, y eso solo está disponible del lado del servidor
// sin pasar por otro viaje de red.

export default async function EditorPage({ params }: { params: { id: string } }) {
  const r = await cargarParaEditar(params.id)

  if (r.estado === 'sin-experiencia') notFound()

  if (r.estado === 'sin-permiso') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-slate-900">Sin permiso de equipo</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.motivo}</p>
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
          <h1 className="text-lg font-semibold text-slate-900">No se pudo abrir el editor</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.motivo}</p>
          <Link href="/personalab" className={`${BTN_PRIMARIO} inline-block mt-5`}>
            Volver
          </Link>
        </div>
      </div>
    )
  }

  return <Editor experiencia={r.datos.experiencia} bloquesIniciales={r.datos.bloques} />
}
