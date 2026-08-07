import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  corrida, experiencia, capitulo, moderador, fecha, ETIQUETA_TIEMPO,
  type Tiempo,
} from '../../personalab/dominio'
import { tieneContenido } from '../../personalab/contenido'

const TIEMPOS: Tiempo[] = ['vispera', 'ignicion', 'retorno']

export default function PortadaPage({
  params, searchParams,
}: {
  params: { corridaId: string }
  searchParams: { lente?: string }
}) {
  const c = corrida(params.corridaId)
  if (!c) notFound()

  const e = experiencia(c.experienciaId)!
  const cap = capitulo(c.capituloId)!
  const mod = moderador(c.moderadorId)!
  const esModerador = searchParams.lente === 'moderador'
  const q = esModerador ? '?lente=moderador' : ''

  const conContenido = e.bisagras.filter(b => tieneContenido(b.id))

  return (
    <>
      {/* Portada: fondo profundo, la unica pieza oscura del lector */}
      <header className="bg-[#002B34] px-6 md:px-10 pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="max-w-[620px] mx-auto">
          <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#D8AC96]">
            PersonaLab
          </div>
          <h1 className="mt-6 text-[40px] md:text-[68px] leading-none font-extralight tracking-[-0.03em] text-white text-balance">
            {e.nombre}
          </h1>
          {e.narrativa && (
            <p className="mt-7 text-[19px] md:text-[21px] leading-[1.6] font-light text-white/75 max-w-[42ch]">
              {e.narrativa}
            </p>
          )}
          <div className="mt-10 pt-6 border-t border-white/15 flex flex-wrap gap-x-8 gap-y-2 text-[12.5px] font-light text-white/60">
            <span>{cap.nombre}</span>
            <span>{fecha(c.fecha)}</span>
            {esModerador && <span>Conduce {mod.nombre}</span>}
          </div>
        </div>
      </header>

      {/* Hoja de ruta */}
      <main className="px-6 md:px-10 py-14 md:py-20">
        <div className="max-w-[620px] mx-auto">
          {esModerador && (
            <div className="mb-10 bg-[#EFF3F4] border border-[#D5DEE0] rounded-xl px-5 py-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4B6B72]">
                Estás viendo como moderador
              </div>
              <p className="mt-1.5 text-[14px] leading-[1.6] font-light text-[#14181B]">
                Ves las notas de sala y los archivos que el foro no ve.{' '}
                <Link href={`/prototipo/lector/${c.id}`} className="underline underline-offset-2">
                  Ver como participante
                </Link>
              </p>
            </div>
          )}

          {TIEMPOS.map(t => {
            const bs = conContenido.filter(b => b.tiempo === t).sort((a, b) => a.orden - b.orden)
            if (bs.length === 0) return null
            return (
              <section key={t} className="mb-12 last:mb-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
                  {ETIQUETA_TIEMPO[t]}
                </div>
                <div className="mt-4">
                  {bs.map(b => (
                    <Link
                      key={b.id}
                      href={`/prototipo/lector/${c.id}/${b.id}${q}`}
                      className="group block py-4 border-b border-[#E7E1D8] first:border-t"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-[19px] md:text-[21px] font-light text-[#002B34] group-hover:text-[#8F5341] transition-colors">
                          {b.titulo}
                        </span>
                        {b.duracion && (
                          <span className="text-[12.5px] font-light text-[#676E6E] flex-shrink-0 tabular-nums">
                            {b.duracion}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}

          {conContenido.length === 0 && (
            <p className="text-[17px] font-light text-[#676E6E] leading-[1.75]">
              Esta experiencia todavía no tiene contenido escrito.
            </p>
          )}

          {!esModerador && (
            <div className="mt-16 pt-8 border-t border-[#E7E1D8]">
              <Link
                href={`/prototipo/lector/${c.id}?lente=moderador`}
                className="text-[12.5px] font-light text-[#676E6E] hover:text-[#8F5341] transition-colors"
              >
                Ver como moderador →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
