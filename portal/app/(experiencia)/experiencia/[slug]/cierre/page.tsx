import { consignasDe } from '@/lib/personalab/lectura'
import SinAcceso from '../../SinAcceso'
import SinContenido from '../../SinContenido'
import Fallo from '../../Fallo'
import Cierre from './Cierre'
import AtmosferaLectura from '../../AtmosferaLectura'

// El final del recorrido. El servidor trae las preguntas; las respuestas las
// pone el navegador, porque es el único sitio donde existen.

export default async function PaginaCierre({ params }: { params: { slug: string } }) {
  const r = await consignasDe(params.slug)

  if (r.estado === 'fallo') return <Fallo motivo={r.motivo} />
  if (r.estado === 'sin-acceso') return <SinAcceso />
  if (r.estado === 'sin-contenido') return <SinContenido />

  const { experiencia, consignas, completo } = r.datos

  // El cierre es, de punta a punta, la revisión de lo que se escribió en
  // cada consigna -- no hay una sola pantalla de cierre sin al menos una.
  // Mismo estado "pesoMayor" que la bisagra individual, misma razón: menos
  // color, no más, para no competir con lo que la persona está releyendo.
  const pesoMayor = consignas.length > 0

  return (
    <>
    <AtmosferaLectura pesoMayor={pesoMayor} />
    <main className="relative bg-paper max-w-[620px] mx-auto px-6 py-16 md:py-24">
      <div className="cejilla">PersonaLab</div>
      <Cierre
        slug={experiencia.slug}
        nombre={experiencia.nombre}
        consignas={consignas}
        completo={completo}
      />
    </main>
    </>
  )
}
