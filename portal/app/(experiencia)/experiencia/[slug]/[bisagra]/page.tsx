import Link from 'next/link'
import { cargarBisagra } from '@/lib/personalab/lectura'
import BloqueLector from '@/app/(admin)/personalab/Bloques'
import SinAcceso from '../../SinAcceso'
import SinContenido from '../../SinContenido'
import Fallo from '../../Fallo'
import Escritura from '../../Escritura'
import MarcarVisto from './MarcarVisto'
import PisoDeTiempo from '../../PisoDeTiempo'

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
  if (r.estado === 'sin-contenido') return <SinContenido />

  const { experiencia, bisagra, bloques, anterior, siguiente, primeraVez } = r.datos

  // EL PISO DE TIEMPO DE ESTA BISAGRA. Manda la pausa mayor, nunca la suma:
  // es un piso mínimo de permanencia, no una cuenta acumulada (decisión de
  // Sora). Corre solo la primera vez que se abre; al volver, cero.
  const piso = primeraVez
    ? bloques.reduce((may, b) => (b.tipo === 'pausa' ? Math.max(may, b.segundos ?? 0) : may), 0)
    : 0

  // UN GESTO DE SALA NO ES AUTOMÁTICAMENTE UN GESTO DIGITAL. Falla cerrado:
  // sin marcar `aplicaDigital`, el gesto no se pinta aquí. Hallazgo de
  // Daniel, 2026-09-21 — ver el comentario en `lib/personalab/bloques.ts`.
  // Se filtra ANTES del vacío de abajo, no en el `.map`, para que una
  // bisagra que se queda sin nada después de filtrar diga "sin contenido"
  // en vez de dejar un hueco mudo entre el título y el paso siguiente.
  const bloquesDigitales = bloques.filter(b => b.tipo !== 'gesto' || b.aplicaDigital === true)

  return (
    <main className="max-w-[620px] mx-auto px-6 py-12 md:py-16">

      <MarcarVisto experienciaId={experiencia.id} bisagraId={bisagra.id} />

      <Link
        href={`/experiencia/${experiencia.slug}`}
        className="text-[13px] text-gray-ui hover:text-dom transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom rounded"
      >
        {experiencia.nombre}
      </Link>

      {/* NO HAY CEJILLA DE TIEMPO AQUÍ, A PROPÓSITO. Se probó (2026-09-21) y
          se quitó el mismo día: `bisagra.tiempo` no varía dentro de una
          experiencia como "El Presente como Regalo" (sus cuatro bisagras
          son todas 'ignicion'), así que se habría leído "IGNICIÓN" cuatro
          veces seguidas — cero información, chrome que se repite igual
          siempre. Julian y Sora coincidieron, por caminos separados, en que
          esta pantalla no puede prometer algo que el calendario no sostiene.
          El campo que sí varía y sí cumple ese rol es `tramo`, y ya se usa
          así en el índice de la experiencia (`[slug]/page.tsx`). */}
      <h1 className="display text-[30px] md:text-[40px] text-dom mt-4">
        {bisagra.titulo}
      </h1>

      {bisagra.duracion && (
        <p className="mt-2 text-[13px] text-gray-ui">{bisagra.duracion}</p>
      )}

      {/* LA CONSIGNA ES EL ÚNICO BLOQUE QUE SE COMPORTA DISTINTO AQUÍ.
          En la sala se dice en voz alta y la persona escribe en papel; el
          renderizador que ya existe la pinta así, como texto. En el producto
          digital no hay quien la diga ni papel donde responder, así que lleva
          dónde escribir. Es el mismo tipo de bloque y el mismo contenido: lo
          que cambia es la entrega, que es justo la distinción sobre la que se
          armó el modo digital. */}
      <article className="mt-10">
        {bloquesDigitales.map(b =>
          b.tipo === 'consigna' ? (
            <Escritura key={b.id} bloqueId={b.id} consigna={b.texto ?? ''} />
          ) : (
            <BloqueLector key={b.id} b={b} />
          )
        )}
      </article>

      {bloquesDigitales.length === 0 && (
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
            className="inline-flex min-h-toque items-center text-[14px] text-gray-ui hover:text-dom transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom rounded"
          >
            Anterior
          </Link>
        ) : (
          <span />
        )}

        {/* El paso adelante y su piso de tiempo. El texto de transición de
            Sora vive dentro del componente, porque ahora aparece CON el
            botón y no antes: con el piso cumplido, "lo que sigue aparece
            cuando llegues" se vuelve literalmente cierto. */}
        <PisoDeTiempo
          segundos={piso}
          bisagraId={bisagra.id}
          href={
            siguiente
              ? `/experiencia/${experiencia.slug}/${siguiente.id}`
              : `/experiencia/${experiencia.slug}/cierre`
          }
          etiqueta={siguiente ? 'Seguir' : 'Terminar'}
        />
      </nav>
    </main>
  )
}
