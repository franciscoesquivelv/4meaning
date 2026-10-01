import Link from 'next/link'
import { cargarIdeas } from '@/lib/personalab/ideas'
import { Titulo } from '../ui'
import { TARJETA, BTN_PRIMARIO } from '../tokens'
import IdeasClient from './IdeasClient'

// Server component: `cargarIdeas` necesita la sesión de quien pide la
// página, igual que `editor/page.tsx`. La parte interactiva (el formulario
// de agregar, los botones de borrar) vive en `IdeasClient.tsx`.

export default async function IdeasPage() {
  const r = await cargarIdeas()

  if (r.estado === 'sin-acceso') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-ink">Sin permiso de equipo</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">
            Tu cuenta no tiene permiso de equipo sobre PersonaLab.
          </p>
          <Link href="/personalab" className={`${BTN_PRIMARIO} inline-block mt-5`}>Volver</Link>
        </div>
      </div>
    )
  }

  if (r.estado === 'fallo') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-ink">No se pudieron cargar las ideas</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">{r.motivo}</p>
          <Link href="/personalab" className={`${BTN_PRIMARIO} inline-block mt-5`}>Volver</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <Titulo sub="Un lugar para anotar lo que se nos ocurre, sin que se pierda en un chat. No es una tarea ni un pendiente formal -- es la libreta del equipo.">
        Ideas
      </Titulo>
      <IdeasClient ideasIniciales={r.datos} />
    </div>
  )
}
