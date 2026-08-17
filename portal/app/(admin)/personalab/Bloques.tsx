import RenderMarkdown from './RenderMarkdown'
import type { Bloque } from './contenido'

// Ritmo vertical de la especificacion, seccion 5.3. Base 4px.
const MT: Record<string, string> = {
  texto:    '',                    // el propio markdown pone su margen
  cita:     'mt-10 md:mt-[52px]',
  imagen:   'mt-9 md:mt-12',
  video:    'mt-9 md:mt-12',
  archivo:  'mt-8 md:mt-10',
  objeto:   'mt-8 md:mt-10',
  consigna: 'mt-8 md:mt-10',
  aviso:    'mt-8 md:mt-10',
  nota:     'mt-8 md:mt-10',
  gesto:    'mt-8 md:mt-10',
  pausa:    'my-16 md:my-20',
}

const ROTULO = 'text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]'

export default function BloqueLector({ b }: { b: Bloque }) {
  const mt = MT[b.tipo] ?? 'mt-8'

  switch (b.tipo) {
    case 'texto':
      return (
        <div className={mt}>
          <RenderMarkdown texto={b.texto ?? ''} />
        </div>
      )

    case 'cita':
      return (
        <figure className={mt}>
          <blockquote className="text-[21px] md:text-[26px] leading-[1.5] md:leading-[1.45] font-extralight tracking-[-0.015em] text-[#002B34] border-l-2 border-[#D8AC96] pl-5 md:pl-7">
            {b.texto}
          </blockquote>
          {b.autor && (
            <figcaption className="mt-3 pl-5 md:pl-7 text-[12.5px] font-light text-[#676E6E]">
              {b.autor}
            </figcaption>
          )}
        </figure>
      )

    case 'consigna':
      return (
        <div className={`${mt} border-t border-b border-[#E7E1D8] py-6 md:py-7`}>
          <div className={ROTULO}>Consigna</div>
          <p className="mt-3 text-[19px] md:text-[21px] leading-[1.55] font-light text-[#002B34]">
            {b.texto}
          </p>
        </div>
      )

    case 'gesto':
      return (
        <div className={`${mt} flex gap-3.5 items-start`}>
          {/* Pluma: lo escrito a mano no se sube ni se transcribe */}
          <svg className="w-4 h-4 text-[#8F5341] mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <p className="text-[15px] leading-[1.7] font-light text-[#676E6E] italic">{b.texto}</p>
        </div>
      )

    case 'aviso':
      return (
        <div className={`${mt} bg-[#F3EEE6] border-l-[3px] border-[#B9735A] rounded-r-lg px-5 py-4`}>
          <p className="text-[15px] md:text-[16px] leading-[1.65] font-light text-[#14181B]">{b.texto}</p>
        </div>
      )

    case 'objeto':
      return (
        <div className={`${mt} border border-[#E7E1D8] rounded-xl px-5 py-5 bg-white/50`}>
          <div className={ROTULO}>En la mano</div>
          <p className="mt-2.5 text-[17px] md:text-[18px] font-light text-[#002B34]">{b.texto}</p>
          {b.pie && (
            <p className="mt-2 text-[12.5px] leading-[1.6] font-light text-[#676E6E]">{b.pie}</p>
          )}
        </div>
      )

    case 'pausa':
      return (
        <div className={`${mt} flex items-center justify-center gap-2.5`} aria-hidden="true">
          <span className="w-1 h-1 rounded-full bg-[#D8AC96]" />
          <span className="w-1 h-1 rounded-full bg-[#D8AC96]" />
          <span className="w-1 h-1 rounded-full bg-[#D8AC96]" />
        </div>
      )

    // ── Solo moderador ──
    case 'nota':
      return (
        <div className={`${mt} bg-[#EFF3F4] border border-[#D5DEE0] rounded-xl px-5 py-4`}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4B6B72]">
            Para ti, no para el foro
          </div>
          <p className="mt-2 text-[15px] leading-[1.65] font-light text-[#14181B]">{b.texto}</p>
        </div>
      )

    case 'archivo':
      return (
        <div className={`${mt} border border-[#E7E1D8] rounded-xl px-5 py-4 bg-white flex items-center gap-4`}>
          <svg className="w-5 h-5 text-[#8F5341] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
          </svg>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-light text-[#002B34] truncate">{b.nombreArchivo}</div>
            {b.pie && <div className="text-[12.5px] font-light text-[#676E6E] mt-0.5">{b.pie}</div>}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {b.peso && <span className="text-[12px] text-[#676E6E] tabular-nums">{b.peso}</span>}
            {b.descargable && (
              <span className="text-[12px] font-medium text-[#8F5341] border border-[#E0CFC4] rounded-lg px-3 py-1.5">
                Descargar
              </span>
            )}
          </div>
        </div>
      )

    case 'imagen':
      return (
        <figure className={mt}>
          {b.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.url} alt={b.pie ?? ''} className="rounded-xl w-full object-cover" />
          ) : (
            <div className="rounded-xl bg-[#EFE9E0] aspect-[3/2] flex items-center justify-center">
              <span className="text-[12px] text-[#A69C90]">sin imagen</span>
            </div>
          )}
          {b.pie && (
            <figcaption className="mt-2.5 text-[12.5px] leading-[1.6] font-light text-[#676E6E]">
              {b.pie}
            </figcaption>
          )}
        </figure>
      )

    case 'video':
      return (
        <figure className={mt}>
          {b.url ? (
            <video src={b.url} controls className="rounded-xl w-full bg-[#1A2426]" />
          ) : (
            <div className="rounded-xl bg-[#1A2426] aspect-video flex items-center justify-center relative">
              <span className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              {b.duracion && (
                <span className="absolute bottom-2 right-2 text-[10px] font-medium text-white bg-black/70 px-1.5 py-0.5 rounded tabular-nums">
                  {b.duracion}
                </span>
              )}
            </div>
          )}
          {b.pie && (
            <figcaption className="mt-2.5 text-[12.5px] leading-[1.6] font-light text-[#676E6E]">
              {b.pie}
            </figcaption>
          )}
        </figure>
      )

    default:
      return null
  }
}
