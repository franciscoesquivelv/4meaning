import React from 'react'

// Markdown restringido a diez capacidades, sin HTML crudo.
// Se descarto dangerouslySetInnerHTML a proposito: al parsear a nodos de
// React, el mismo contenido se puede pintar en dos tonos (lector claro y
// panel de edicion) con un solo componente y dos mapas de clase. Eso es lo
// que evita que el render se implemente dos veces y diverja en silencio,
// que es lo que ya paso con el contenido de acuerdos en el portal real.

type Tono = 'lectura' | 'compacto'

const CLASES: Record<Tono, { p: string; h2: string; h3: string; fuerte: string; enfasis: string }> = {
  lectura: {
    p: 'text-[17px] md:text-[18px] leading-[1.75] md:leading-[1.8] font-light text-[#14181B] mt-6 md:mt-7 first:mt-0',
    h2: 'text-[24px] md:text-[30px] leading-[1.2] md:leading-[1.15] font-extralight tracking-[-0.02em] text-[#002B34] mt-14 md:mt-[72px] first:mt-0',
    h3: 'text-[17px] md:text-[18px] leading-[1.35] font-medium text-[#14181B] mt-8 md:mt-10 first:mt-0',
    fuerte: 'font-medium text-[#002B34]',
    enfasis: 'italic',
  },
  compacto: {
    p: 'text-sm leading-relaxed text-slate-700 mt-3 first:mt-0',
    h2: 'text-base font-semibold text-slate-900 mt-5 first:mt-0',
    h3: 'text-sm font-semibold text-slate-900 mt-4 first:mt-0',
    fuerte: 'font-semibold text-slate-900',
    enfasis: 'italic',
  },
}

// Marcas en linea: **fuerte** y *enfasis*. Nada mas.
function enLinea(texto: string, c: (typeof CLASES)['lectura'], clave: string): React.ReactNode[] {
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

export default function RenderMarkdown({
  texto, tono = 'lectura',
}: {
  texto: string
  tono?: Tono
}) {
  const c = CLASES[tono]
  const parrafos = texto.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)

  return (
    <>
      {parrafos.map((p, i) => {
        if (p.startsWith('### ')) {
          return <h3 key={i} className={c.h3}>{enLinea(p.slice(4), c, `h3${i}`)}</h3>
        }
        if (p.startsWith('## ')) {
          return <h2 key={i} className={c.h2}>{enLinea(p.slice(3), c, `h2${i}`)}</h2>
        }
        return (
          <p key={i} className={c.p}>
            {p.split('\n').map((linea, j, arr) => (
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
