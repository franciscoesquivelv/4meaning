import Link from 'next/link'
import { cargarExperiencia, ultimaVista, bienvenidaVista, posicionActual } from '@/lib/personalab/lectura'
import SinAcceso from '../SinAcceso'
import SinContenido from '../SinContenido'
import Fallo from '../Fallo'
import UmbralBienvenida from '../UmbralBienvenida'
import AtmosferaLectura from '../AtmosferaLectura'

// El índice de la experiencia. Lo primero que ve quien acaba de entrar, y lo
// que ve cada vez que vuelve.
//
// NO HAY BARRA DE AVANCE Y NO ES UN OLVIDO. El léxico de esta casa prohíbe
// por nombre `progress`, `completion_pct`, `streak` y `rank`. Lo único que se
// guarda es cuál fue la última bisagra abierta, y aquí sirve para una cosa:
// que el botón diga "Continuar" en vez de devolver a alguien al principio de
// algo que ya empezó.

export default async function IndiceExperiencia({ params }: { params: { slug: string } }) {
  const r = await cargarExperiencia(params.slug)

  if (r.estado === 'fallo') return <Fallo motivo={r.motivo} />
  if (r.estado === 'sin-acceso') return <SinAcceso />
  if (r.estado === 'sin-contenido') return <SinContenido />

  const { experiencia, bisagras } = r.datos
  const ultima = await ultimaVista(experiencia.id)
  const iUltima = bisagras.findIndex(b => b.id === ultima)
  // El botón "Continuar" y la última fila que el índice nombra son, por
  // definición, la misma bisagra. Esto lo reescribía a mano en el mismo
  // archivo que ya importa la función sesenta líneas más abajo (hallazgo de
  // Leo, re-auditoría del 2026-09-12): dos copias de la misma regla que
  // hasta hoy coincidían por casualidad, que es exactamente como nació el
  // bug que esta re-auditoría vino a revisar.
  const siguiente = bisagras[posicionActual(iUltima)]
  const vistaBienvenida = await bienvenidaVista(experiencia.id)

  return (
    <UmbralBienvenida
      experienciaId={experiencia.id}
      nombre={experiencia.nombre}
      narrativa={experiencia.narrativa}
      vistaInicial={vistaBienvenida}
    >
    <AtmosferaLectura />
    <main className="relative bg-paper max-w-[620px] mx-auto px-6 py-16 md:py-24">

      <div className="cejilla">PersonaLab</div>

      <h1 className="display text-[38px] md:text-[52px] text-dom mt-3">
        {experiencia.nombre}
      </h1>

      {experiencia.narrativa && (
        <p className="mt-6 text-[18px] md:text-[19px] leading-[1.6] font-light text-ink/90">
          {experiencia.narrativa}
        </p>
      )}

      {/* La línea de honestidad. Se dice una vez, siempre el mismo número
          (el total real, calculado del mismo arreglo que ya se carga, nunca
          uno inventado), y nunca como cuenta regresiva: eso sería un
          contador de "cuánto falta" disfrazado de dato neutral. Decisión de
          Sora, Consejo del 2026-09-11. */}
      <p className="mt-6 text-[13px] text-gray-ui">
        Son {bisagras.length} pasos.
      </p>

      {siguiente && (
        <Link
          href={`/experiencia/${experiencia.slug}/${siguiente.id}`}
          className="inline-flex items-center mt-6 px-6 py-3 rounded-full bg-dom text-paper text-[15px] font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          {iUltima >= 0 ? 'Continuar' : 'Empezar'}
        </Link>
      )}

      {/* EL GIRO GRANDE. Hasta hoy decía: "la lista completa, a la vista.
          No se esconde lo que viene: quien compró esto ya sabe que lo
          compró entero, y ocultarle el recorrido sería tratarlo como a un
          alumno al que se le dosifica." Esa decisión era correcta para el
          problema de entonces. Cambió el problema: Francisco pidió que la
          experiencia deje de enseñarse entera de un vistazo. Sora, la misma
          autora de la decisión vieja, la revisó con el encargo nuevo sobre
          la mesa y decidió lo contrario: "se revela por apertura, no por
          logro" (Consejo del 2026-09-11). No es un descuido pisando la
          decisión anterior: es la misma jueza, fallando otra vez.

          Se listan solo dos cosas: lo ya recorrido (con su "Visto", que ya
          existe abajo y no cambia) y el título, sin reseña, de la única
          bisagra que sigue. Nada de filas vacías o candados por lo que
          falta ("6 más, bloqueadas"): eso sería un contador de progreso
          disfrazado de lista, el mismo léxico que este proyecto ya prohíbe
          por nombre. */}
      <ol className="mt-10 border-t border-line">
        {bisagras.slice(0, posicionActual(iUltima) + 1).map((b, i) => {
          const vista = iUltima >= 0 && i < iUltima
          const esSiguiente = i === posicionActual(iUltima)
          // El rótulo del tramo aparece solo cuando empieza uno nuevo, así que
          // una experiencia sin tramos (El Agradecimiento) sale plana y una
          // con tramos (El Presente como Regalo) sale agrupada, con la misma
          // lista y sin dos componentes distintos que después divergen.
          const abreTramo = b.tramo && b.tramo !== bisagras[i - 1]?.tramo
          return (
            <li key={b.id} className="border-b border-line">
              {abreTramo && (
                <div className="cejilla pt-7 pb-1">{b.tramo}</div>
              )}
              <Link
                href={`/experiencia/${experiencia.slug}/${b.id}`}
                className="flex items-baseline gap-5 py-5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom rounded"
              >
                <span className="font-mono text-[12px] text-gray-ui tabular-nums shrink-0 w-6">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-light text-ink group-hover:text-dom transition-colors">
                    {/* "Ahora toca: ", solo el título, sin reseña. Decisión
                        de Sora: certeza de dónde se para, cero spoiler de
                        qué encuentra ahí. Hallazgo de Leo: la reseña se
                        seguía mostrando aquí porque la condición vieja
                        (`vista || esSiguiente`) quedó obsoleta en cuanto el
                        recorte de arriba hizo que "no vista" y "esSiguiente"
                        fueran siempre la misma fila. */}
                    {esSiguiente ? `Ahora toca: ${b.titulo}` : b.titulo}
                  </span>
                  {b.descripcion && vista && (
                    <span className="block text-[14px] text-gray-ui mt-1 leading-snug">
                      {b.descripcion}
                    </span>
                  )}
                </span>
                {vista && (
                  <span className="text-[11px] uppercase tracking-wider text-gray-ui shrink-0">
                    Visto
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ol>

      {bisagras.length === 0 && (
        <p className="mt-12 text-[15px] text-gray-ui">
          Esta experiencia todavía no tiene contenido publicado para leer en línea.
        </p>
      )}
    </main>
    </UmbralBienvenida>
  )
}
