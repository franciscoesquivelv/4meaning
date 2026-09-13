import RenderMarkdown from './RenderMarkdown'
import { definicion, type Bloque } from '@/lib/personalab/bloques'

// EL RITMO VERTICAL VIVE EN EL CONTRATO, NO AQUÍ. Era un mapa suelto con
// una entrada por tipo y un `?? 'mt-8'` de red, o sea que un tipo nuevo
// heredaba un margen por descarte y nadie lo notaba. Ahora cada tipo declara
// el suyo junto a su definición. El de la pausa sigue siendo el mayor del
// sistema, ampliado el 2026-09-11 por Elena para que se sienta como un corte
// real y no un adorno entre párrafos.

const ROTULO = 'text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]'

export default function BloqueLector({ b }: { b: Bloque }) {
  const mt = definicion(b.tipo).margen

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
      // Dos correcciones sobre el mismo glifo, en dos días. El 11 se cambió
      // el hex a mano (#D8AC96) por su token, que era `terra-lo`. El 12,
      // midiendo, Julian se corrigió a sí mismo: `terra-lo` es la terracota
      // calibrada para FONDO OSCURO, y sobre papel da 1.78 a 1, o sea que
      // el respiro era casi invisible. Sobre papel la calibrada es
      // `terra-ui`, 4.93. El token correcto no es el que preserva el color
      // viejo, es el que preserva la intención.
      return (
        <div className={`${mt} flex items-center justify-center gap-2.5`} aria-hidden="true">
          <span className="w-1 h-1 rounded-full bg-terra-ui" />
          <span className="w-1 h-1 rounded-full bg-terra-ui" />
          <span className="w-1 h-1 rounded-full bg-terra-ui" />
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

    // ── Audio ──
    // El tipo existía en la base desde el 2026-09-11 y no tenía caso aquí,
    // así que caía en el `default: return null` que estaba justo debajo de
    // esta línea: un audio publicado se pintaba como nada. Sin error, sin
    // hueco, sin señal. Ese `default` es lo que se quitó, y por eso ahora
    // olvidar un tipo no compila.
    //
    // No lleva `download`: la voz grabada se escucha, no se colecciona. Lo
    // que sí se entrega para imprimir o llenar es el bloque `archivo`.
    case 'audio':
      return (
        <figure className={mt}>
          {b.url ? (
            <audio
              src={b.url}
              controls
              controlsList="nodownload"
              className="w-full"
            />
          ) : (
            <div className="rounded-xl bg-[#F3EEE6] border border-[#E7E1D8] px-5 py-4 flex items-center gap-3.5">
              <svg className="w-5 h-5 text-[#8F5341] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a6.5 6.5 0 006.5-6.5M12 18.5A6.5 6.5 0 015.5 12M12 18.5V22M12 2a3 3 0 013 3v7a3 3 0 11-6 0V5a3 3 0 013-3z" />
              </svg>
              <span className="text-[13px] text-[#A69C90]">sin audio todavía</span>
            </div>
          )}
          {(b.pie || b.duracion) && (
            <figcaption className="mt-2.5 text-[12.5px] leading-[1.6] font-light text-[#676E6E] flex items-center gap-3">
              {b.pie && <span>{b.pie}</span>}
              {b.duracion && <span className="tabular-nums">{b.duracion}</span>}
            </figcaption>
          )}
        </figure>
      )
  }

  // EXHAUSTIVIDAD, Y ES EL MECANISMO DE TODA LA ETAPA 1.
  //
  // Aquí había un `default: return null`. Con él, agregar un tipo de bloque
  // al contrato y olvidar pintarlo producía una pantalla en blanco silenciosa
  // en producción, que es exactamente lo que le pasó a `audio` durante dos
  // días. Sin `default`, TypeScript estrecha `b.tipo` a `never` solo si
  // TODOS los casos están cubiertos: si falta uno, esta línea no compila y el
  // mensaje nombra el tipo que falta. El olvido deja de ser posible en vez de
  // quedar prohibido por un comentario.
  const _faltaPintar: never = b.tipo
  void _faltaPintar
  return null
}
