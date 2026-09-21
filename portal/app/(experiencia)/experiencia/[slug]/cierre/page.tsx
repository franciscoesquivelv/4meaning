import { consignasDe } from '@/lib/personalab/lectura'
import SinAcceso from '../../SinAcceso'
import SinContenido from '../../SinContenido'
import Fallo from '../../Fallo'
import Cierre from './Cierre'

// El final del recorrido. El servidor trae las preguntas; las respuestas las
// pone el navegador, porque es el único sitio donde existen.

export default async function PaginaCierre({ params }: { params: { slug: string } }) {
  const r = await consignasDe(params.slug)

  if (r.estado === 'fallo') return <Fallo motivo={r.motivo} />
  if (r.estado === 'sin-acceso') return <SinAcceso />
  if (r.estado === 'sin-contenido') return <SinContenido />

  const { experiencia, consignas, completo } = r.datos

  return (
    <main className="max-w-[620px] mx-auto px-6 py-16 md:py-24">
      <div className="cejilla">PersonaLab</div>
      <Cierre
        slug={experiencia.slug}
        nombre={experiencia.nombre}
        consignas={consignas}
        completo={completo}
      />
    </main>
  )
}
