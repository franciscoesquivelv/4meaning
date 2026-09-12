import Link from 'next/link'
import { cargarExperiencia, ultimaVista, bienvenidaVista } from '@/lib/personalab/lectura'
import SinAcceso from '../SinAcceso'
import Fallo from '../Fallo'
import UmbralBienvenida from '../UmbralBienvenida'

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

  const { experiencia, bisagras } = r.datos
  const ultima = await ultimaVista(experiencia.id)
  const iUltima = bisagras.findIndex(b => b.id === ultima)
  const siguiente = iUltima >= 0 ? bisagras[iUltima] : bisagras[0]
  const vistaBienvenida = await bienvenidaVista(experiencia.id)

  return (
    <UmbralBienvenida
      experienciaId={experiencia.id}
      nombre={experiencia.nombre}
      narrativa={experiencia.narrativa}
      vistaInicial={vistaBienvenida}
    >
    <main className="max-w-[620px] mx-auto px-6 py-16 md:py-24">

      <div className="cejilla">PersonaLab</div>

      <h1 className="display text-[38px] md:text-[52px] text-dom mt-3">
        {experiencia.nombre}
      </h1>

      {experiencia.narrativa && (
        <p className="mt-6 text-[18px] md:text-[19px] leading-[1.6] font-light text-ink/90">
          {experiencia.narrativa}
        </p>
      )}

      {siguiente && (
        <Link
          href={`/experiencia/${experiencia.slug}/${siguiente.id}`}
          className="inline-flex items-center mt-10 px-6 py-3 rounded-full bg-dom text-paper text-[15px] font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          {iUltima >= 0 ? 'Continuar' : 'Empezar'}
        </Link>
      )}

      {/* Los títulos quedan a la vista siempre: la estructura del recorrido
          no se esconde. Lo que se retiene es la reseña de cada bisagra
          todavía no alcanzada, para que esto no se lea como una
          contraportada que cuenta el final. Decisión de Elena, Consejo del
          2026-09-11; el giro grande del índice (qué se lista y cuándo) sigue
          siendo de Sora y llega en la etapa siguiente. */}
      <ol className="mt-16 border-t border-line">
        {bisagras.map((b, i) => {
          const vista = iUltima >= 0 && i < iUltima
          const esSiguiente = i === (iUltima >= 0 ? iUltima : 0)
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
                    {b.titulo}
                  </span>
                  {b.descripcion && (vista || esSiguiente) && (
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
