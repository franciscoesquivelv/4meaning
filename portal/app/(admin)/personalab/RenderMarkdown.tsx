import React from 'react'

// Markdown restringido a unas pocas capacidades, sin HTML crudo.
// Se descarto dangerouslySetInnerHTML a proposito: al parsear a nodos de
// React, el mismo contenido se puede pintar en dos tonos (lector claro y
// panel de edicion) con un solo componente y dos mapas de clase. Eso es lo
// que evita que el render se implemente dos veces y diverja en silencio,
// que es lo que ya paso con el contenido de acuerdos en el portal real.

type Tono = 'lectura' | 'compacto'

interface ClasesTono {
  p: string
  h2: string
  h3: string
  fuerte: string
  enfasis: string
  lista: string
}

const CLASES: Record<Tono, ClasesTono> = {
  lectura: {
    p: 'text-[17px] md:text-[18px] leading-[1.75] md:leading-[1.8] font-light text-[#14181B] mt-6 md:mt-7 first:mt-0',
    h2: 'text-[24px] md:text-[30px] leading-[1.2] md:leading-[1.15] font-extralight tracking-[-0.02em] text-[#002B34] mt-14 md:mt-[72px] first:mt-0',
    h3: 'text-[17px] md:text-[18px] leading-[1.35] font-medium text-[#14181B] mt-8 md:mt-10 first:mt-0',
    fuerte: 'font-medium text-[#002B34]',
    enfasis: 'italic',
    lista: 'text-[17px] md:text-[18px] leading-[1.75] md:leading-[1.8] font-light text-[#14181B] mt-6 md:mt-7 first:mt-0 pl-5 space-y-1.5',
  },
  compacto: {
    p: 'text-sm leading-relaxed text-slate-700 mt-3 first:mt-0',
    h2: 'text-base font-semibold text-slate-900 mt-5 first:mt-0',
    h3: 'text-sm font-semibold text-slate-900 mt-4 first:mt-0',
    fuerte: 'font-semibold text-slate-900',
    enfasis: 'italic',
    lista: 'text-sm leading-relaxed text-slate-700 mt-3 first:mt-0 pl-5 space-y-1',
  },
}

// Marcas en linea: **fuerte** y *enfasis*. Nada mas.
function enLinea(texto: string, c: { fuerte: string; enfasis: string }, clave: string): React.ReactNode[] {
  const salida: React.ReactNode[] = []
  const patron = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  let ultimo = 0
  let m: RegExpExecArray | null
  let i = 0

  while ((m = patron.exec(texto)) !== null) {
    if (m.index > ultimo) salida.push(texto.slice(ultimo, m.index))
    const t = m[0]
    if (t.startsWith('**')) {
      salida.push(<strong key={`${clave}-f${i}`} className={c.fuerte}>{t.slice(2, -2)}</strong>)
    } else {
      salida.push(<em key={`${clave}-e${i}`} className={c.enfasis}>{t.slice(1, -1)}</em>)
    }
    ultimo = m.index + t.length
    i++
  }
  if (ultimo < texto.length) salida.push(texto.slice(ultimo))
  return salida
}

// `Enfasis` SIGUE EXISTIENDO para lo que de verdad es una sola línea --
// `autor` de una cita, `pie` de una imagen/objeto/archivo: una leyenda no
// necesita párrafos ni viñetas, y envolverla en los mismos elementos de
// bloque que un párrafo sería la decoración contraria, complejidad que
// nadie pidió. Para el CONTENIDO PRINCIPAL de cita/instrucción/a
// mano/aviso/nota/objeto, usar `RenderMarkdown` (ver más abajo): ESOS
// campos sí reciben varias líneas de verdad, como lo prueba el contenido
// real de "El Presente como Regalo".
export function Enfasis({
  texto, claseFuerte = 'font-medium', claseEnfasis = 'italic',
}: {
  texto: string
  claseFuerte?: string
  claseEnfasis?: string
}) {
  return <>{enLinea(texto, { fuerte: claseFuerte, enfasis: claseEnfasis }, 'en')}</>
}

// UNA LÍNEA ES UN ÍTEM DE LISTA SI EMPIEZA CON "- "/"* " (viñeta) O
// "1." (numerada). El punto es OPCIONAL si hay un espacio después del
// número -- VERIFICADO EN VIVO contra el contenido real de "El Presente
// como Regalo" ("El folder blanco"), que tiene las tres variantes en la
// MISMA lista: "1. rojo" (punto y espacio), "2.verde" (punto sin
// espacio) y "4 cafe" (sin punto -- probablemente una errata de quien
// escribió, no una cuarta sintaxis a propósito). La primera versión de
// este patrón exigía el punto siempre; "4 cafe" no matcheaba, rompía la
// uniformidad del bloque, y la lista completa cayó de vuelta a párrafo
// corrido -- el mismo defecto que se estaba corrigiendo, encontrado
// probando contra el contenido real y no inventado. Exigir el punto O
// un espacio (no los dos) es lo que tolera una lista escrita a mano con
// una línea inconsistente sin dejar de distinguir una lista real de una
// oración cualquiera que por casualidad empieza con un número.
//
// El número en sí no importa para decidir el orden visual -- HTML ya
// renumera un `<ol>` solo, así que "1, 2, 4, 5" (un salto real en ese
// mismo contenido) se ve 1,2,3,4 sin que haga falta corregir el texto a
// mano.
const PATRON_VIÑETA = /^[-*]\s+(.*)$/
const PATRON_NUMERADA = /^\d+(?:[.)]\s*|\s+)(.*)$/

type Linea = { texto: string; tipo: 'viñeta' | 'numerada' | null }

function partirLineas(bloque: string): Linea[] {
  return bloque.split('\n').map(linea => {
    const viñeta = linea.match(PATRON_VIÑETA)
    if (viñeta) return { texto: viñeta[1], tipo: 'viñeta' as const }
    const numerada = linea.match(PATRON_NUMERADA)
    if (numerada) return { texto: numerada[1], tipo: 'numerada' as const }
    return { texto: linea, tipo: null }
  })
}

// BUG REAL, REPORTADO POR FRANCISCO, 2026-10-01: una instrucción real de
// "El Presente como Regalo" ("El folder blanco") tenía "6 Temas en los
// que se mide el amor" seguido de una lista numerada 1-6 escrita a mano
// en el texto -- el propio contenido se guardó con una nota de quien lo
// escribió: "(Insertar formato, mientras tanto lo pongo tipo texto)".
// `consigna` (ahora "Instrucción") pintaba su `texto` con `Enfasis`
// crudo dentro de un solo `<p>`: sin separación de párrafos, sin
// saltos de línea, sin viñetas. El salto `\n` se colapsa en HTML sin
// `white-space:pre-wrap`, así que la lista completa se leía como una
// sola oración corrida. Mismo defecto, confirmado leyendo el contenido
// real, en los bloques `gesto` de esa misma sección -- preguntas
// separadas por un solo `\n` que también se corrían juntas.
//
// La corrección no es un parche para "consigna" nada más: es que
// cita/instrucción/a mano/aviso/nota/objeto usen el MISMO parser que ya
// prueba "Texto" en vez de un camino aparte y más pobre -- "para que
// ese tipo de errores no sucedan" (pedido textual de Francisco) significa
// un solo motor de texto, no seis con capacidades distintas que nadie
// recuerda. `encabezados={false}` para estos seis: no se quita la
// capacidad por completo, un h2/h3 real no tenía sentido dentro de una
// instrucción de un párrafo (razón original de Leo, 2026-09-23, que
// sigue siendo válida) -- lo que sí hacía falta, y no existía, eran
// párrafos, saltos de línea reales y listas.
export default function RenderMarkdown({
  texto, tono = 'lectura', encabezados = true, clases,
}: {
  texto: string
  tono?: Tono
  encabezados?: boolean
  clases?: Partial<ClasesTono>
}) {
  const c = { ...CLASES[tono], ...clases }
  const bloques = texto.split(/\n{2,}/).map(b => b.trim()).filter(Boolean)

  return (
    <>
      {bloques.map((bloque, i) => {
        if (encabezados && bloque.startsWith('### ')) {
          return <h3 key={i} className={c.h3}>{enLinea(bloque.slice(4), c, `h3${i}`)}</h3>
        }
        if (encabezados && bloque.startsWith('## ')) {
          return <h2 key={i} className={c.h2}>{enLinea(bloque.slice(3), c, `h2${i}`)}</h2>
        }

        const lineas = partirLineas(bloque).filter(l => l.texto.trim() || l.tipo)
        const tipos = new Set(lineas.map(l => l.tipo))

        // TODO el bloque es lista, de un solo tipo, Y DE DOS LÍNEAS PARA
        // ARRIBA -- si viene mezclado (una viñeta junto a una línea
        // normal) se trata como párrafo de siempre: adivinar la intención
        // de una mezcla es peor que pintarla tal cual se escribió.
        //
        // BUG REAL, ENCONTRADO EN EL MISMO CONTENIDO REAL que probó la
        // lista: el título "6 Temas en los que se mide el amor" es su
        // propia línea suelta (separada por línea en blanco de la lista
        // de verdad que sigue) y YA MATCHEABA el patrón numerado suelto
        // ("6" + espacio) -- se pintaba como una lista de un solo ítem,
        // "1. Temas en los que se mide el amor", perdiendo el "6" real.
        // Una lista de un solo renglón no es una lista, es una oración
        // que por casualidad empieza con un número -- exigir dos líneas
        // como mínimo es lo que distingue las dos sin perder la lista de
        // verdad, que siempre tiene más de un ítem.
        if (lineas.length >= 2 && tipos.size === 1 && (tipos.has('viñeta') || tipos.has('numerada'))) {
          const Lista = tipos.has('numerada') ? 'ol' : 'ul'
          return (
            <Lista
              key={i}
              className={`${c.lista} ${tipos.has('numerada') ? 'list-decimal' : 'list-disc'}`}
            >
              {lineas.map((l, j) => (
                <li key={j}>{enLinea(l.texto, c, `li${i}-${j}`)}</li>
              ))}
            </Lista>
          )
        }

        return (
          <p key={i} className={c.p}>
            {bloque.split('\n').map((linea, j, arr) => (
              <React.Fragment key={j}>
                {enLinea(linea, c, `p${i}-${j}`)}
                {j < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        )
      })}
    </>
  )
}
