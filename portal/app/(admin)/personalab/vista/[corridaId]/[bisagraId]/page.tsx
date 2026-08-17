import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  corrida, experiencia, ETIQUETA_TIEMPO,
} from '../../../dominio'
import { bloquesDe, tieneContenido } from '../../../contenido'
import BloqueLector from '../../../Bloques'

export default function BisagraPage({
  params, searchParams,
}: {
  params: { corridaId: string; bisagraId: string }
  searchParams: { lente?: string }
}) {
  const c = corrida(params.corridaId)
  if (!c) notFound()
  const e = experiencia(c.experienciaId)!
  const bi = e.bisagras.find(b => b.id === params.bisagraId)
  if (!bi) notFound()

  const esModerador = searchParams.lente === 'moderador'
  const q = esModerador ? '?lente=moderador' : ''
  const bloques = bloquesDe(bi.id, esModerador ? 2 : 1)

  // Recorrido: solo entre bisagras que tienen contenido escrito.
  const ruta = e.bisagras
    .filter(b => tieneContenido(b.id))
    .sort((a, b) => {
      const orden = { vispera: 0, ignicion: 1, retorno: 2 }
      return orden[a.tiempo] - orden[b.tiempo] || a.orden - b.orden
    })
  const i = ruta.findIndex(b => b.id === bi.id)
  const anterior = i > 0 ? ruta[i - 1] : null
  const siguiente = i >= 0 && i < ruta.length - 1 ? ruta[i + 1] : null
  const cambiaTiempo = siguiente && siguiente.tiempo !== bi.tiempo

  return (
    <>
      {/* Barra de salida. No es navegacion, es la puerta. */}
      <div className="sticky top-0 z-40 bg-[#FAF8F4]/90 backdrop-blur-sm border-b border-[#E7E1D8]">
        <div className="max-w-[620px] mx-auto px-6 md:px-0 h-12 flex items-center justify-between gap-4">
          <Link
            href={`/personalab/vista/${c.id}${q}`}
            className="text-[12.5px] font-light text-[#676E6E] hover:text-[#002B34] transition-colors"
          >
            ← {e.nombre}
          </Link>
          {esModerador && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4B6B72]">
              Vista de moderador
            </span>
          )}
        </div>
      </div>

      <article className="px-6 md:px-0 pb-24">
        <div className="max-w-[620px] mx-auto">
          <header className="pt-10 md:pt-16">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
              {ETIQUETA_TIEMPO[bi.tiempo]}
            </div>
            <h1 className="mt-4 text-[28px] md:text-[36px] leading-[1.12] md:leading-[1.1] font-extralight tracking-[-0.025em] text-[#002B34] text-balance">
              {bi.titulo}
            </h1>
            {bi.descripcion && (
              <p className="mt-5 text-[19px] md:text-[21px] leading-[1.6] font-light tracking-[-0.005em] text-[#002B34]/85 max-w-[46ch]">
                {bi.descripcion}
              </p>
            )}
            {esModerador && bi.requiere && bi.requiere.length > 0 && (
              <div className="mt-6 text-[12.5px] font-light text-[#676E6E]">
                Requiere: {bi.requiere.join(' · ')}
                {bi.duracion && <> · {bi.duracion}</>}
              </div>
            )}
          </header>

          <div className="mt-10 md:mt-12">
            {bloques.length === 0 ? (
              <p className="text-[17px] font-light text-[#676E6E] leading-[1.75]">
                Esta bisagra todavía no tiene contenido escrito.
              </p>
            ) : (
              bloques.map(b => <BloqueLector key={b.id} b={b} />)
            )}
          </div>

          {/* Pie: el paso siguiente, no una barra de navegacion */}
          <footer className="mt-[88px] md:mt-[120px] pt-8 border-t border-[#E7E1D8]">
            {siguiente ? (
              <Link href={`/personalab/vista/${c.id}/${siguiente.id}${q}`} className="group block">
                {cambiaTiempo && (
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8F5341] mb-3">
                    {ETIQUETA_TIEMPO[siguiente.tiempo]}
                  </div>
                )}
                <div className="text-[12.5px] font-light text-[#676E6E]">Sigue</div>
                <div className="mt-1.5 text-[24px] md:text-[28px] leading-[1.2] font-extralight tracking-[-0.02em] text-[#002B34] group-hover:text-[#8F5341] transition-colors text-balance">
                  {siguiente.titulo}
                </div>
              </Link>
            ) : (
              <div>
                <div className="text-[12.5px] font-light text-[#676E6E]">Hasta aquí</div>
                <p className="mt-2 text-[19px] md:text-[21px] leading-[1.55] font-light text-[#002B34] max-w-[42ch]">
                  Lo que sigue no está en esta pantalla.
                </p>
              </div>
            )}

            {anterior && (
              <div className="mt-10">
                <Link
                  href={`/personalab/vista/${c.id}/${anterior.id}${q}`}
                  className="text-[12.5px] font-light text-[#676E6E] hover:text-[#002B34] transition-colors"
                >
                  ← {anterior.titulo}
                </Link>
              </div>
            )}
          </footer>
        </div>
      </article>
    </>
  )
}
