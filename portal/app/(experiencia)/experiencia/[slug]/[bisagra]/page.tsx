import Link from 'next/link'
import { cargarBisagra } from '@/lib/personalab/lectura'
import BloqueLector from '@/app/(admin)/personalab/Bloques'
import SinAcceso from '../../SinAcceso'
import Fallo from '../../Fallo'
import MarcarVisto from './MarcarVisto'

// Una bisagra a la vez. Es el motor de lectura del producto digital.
//
// UNA SOLA COSA EN PANTALLA, Y ESO ES EL DISEÑO. No hay barra lateral con lo
// que viene, ni contador, ni "3 de 12" en grande. Quien está en medio de esto
// no necesita saber cuánto le falta: necesita estar donde está. El recorrido
// completo vive en el índice, a un toque, para quien lo quiera.

export default async function LeerBisagra({
  params,
}: {
  params: { slug: string; bisagra: string }
}) {
  const r = await cargarBisagra(params.slug, params.bisagra)

  if (r.estado === 'fallo') return <Fallo motivo={r.motivo} />
  if (r.estado === 'sin-acceso') return <SinAcceso />

  const { experiencia, bisagra, bloques, anterior, siguiente } = r.datos

  return (
    <main className="max-w-[620px] mx-auto px-6 py-12 md:py-16">

      <MarcarVisto experienciaId={experiencia.id} bisagraId={bisagra.id} />

      <Link
        href={`/experiencia/${experiencia.slug}`}
        className="text-[13px] text-gray-ui hover:text-dom transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom rounded"
      >
        {experiencia.nombre}
      </Link>

      <h1 className="display text-[30px] md:text-[40px] text-dom mt-4">
        {bisagra.titulo}
      </h1>

      {bisagra.duracion && (
        <p className="mt-2 text-[13px] text-gray-ui">{bisagra.duracion}</p>
      )}

      <article className="mt-10">
        {bloques.map(b => (
          <BloqueLector key={b.id} b={b} />
        ))}
      </article>

      {bloques.length === 0 && (
        <p className="text-[15px] text-gray-ui">
          Esta parte todavía no tiene contenido publicado.
        </p>
      )}

      {/* El paso. Solo hacia adelante tiene peso: volver atrás siempre se
          puede, pero no es lo que la persona vino a hacer. */}
      <nav className="mt-20 pt-8 border-t border-line flex items-center justify-between gap-4">
        {anterior ? (
          <Link
            href={`/experiencia/${experiencia.slug}/${anterior.id}`}
            className="text-[14px] text-gray-ui hover:text-dom transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom rounded"
          >
            Anterior
          </Link>
        ) : (
          <span />
        )}

        {siguiente ? (
          <Link
            href={`/experiencia/${experiencia.slug}/${siguiente.id}`}
            className="inline-flex items-center px-6 py-3 rounded-full bg-dom text-paper text-[15px] font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Seguir
          </Link>
        ) : (
          <Link
            href={`/experiencia/${experiencia.slug}`}
            className="inline-flex items-center px-6 py-3 rounded-full bg-dom text-paper text-[15px] font-medium hover:opacity-90 transition-opacity"
          >
            Terminar
          </Link>
        )}
      </nav>
    </main>
  )
}
