'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// ── EL PISO DE TIEMPO ───────────────────────────────────────────
//
// EL HALLAZGO QUE LO ORIGINA, de Elena, Consejo del 2026-09-11: "no falta
// misterio, falta fricción sensorial. La sala tiene tiempo real (doce
// minutos para una lista, treinta segundos de silencio que el moderador
// sostiene sin rescatar a nadie); la pantalla no tiene nada que resista el
// dedo." Y la prueba de que el diseño ya lo sabía: el bloque `pausa` existe
// desde el principio para encarnar un respiro, y hasta hoy eran tres puntos
// decorativos sin ningún tiempo detrás.
//
// NO ES UNA ESPERA, ES UN PISO. El reloj corre desde que se abre la
// bisagra, no desde que la pausa aparece en pantalla (decisión de Sora,
// medida): quien lee de verdad llega al final con el piso ya cumplido y no
// se topa nunca con esto. Solo lo ve quien bajó de golpe. Con varias pausas
// en una bisagra manda la mayor, jamás la suma: es un piso, no una cuenta.
//
// CORRE UNA SOLA VEZ POR BISAGRA. Quien vuelve no lo vuelve a encontrar; eso
// lo decide el servidor con el marcador que ya existe, y por eso aquí llega
// como `segundos: 0`.
//
// LA SALIDA NO ES NEGOCIABLE, y es de Elena: "si la única forma de avanzar
// es esperar sin remedio, dejó de ser ritmo y se volvió cerco". Está desde
// el primer instante, nunca aparece a mitad de la espera: una salida que se
// revela después es una espera que primero se impuso y luego se negoció.
//
// LO QUE NO SE HACE, y está prohibido agregarlo: número, cuenta regresiva,
// barra que se llena (es un `progress` dibujado, y el léxico de esta casa lo
// prohíbe por nombre), candado, y el verbo "desbloquear". Tampoco se guarda
// quién se saltó la espera: un registro de eso es un dato de conducta que
// alguien termina convirtiendo en métrica.

const CEILING = 30 // Techo de Sora. El silencio más largo que la formación
// de la casa enseña a sostener. Un contenido que pida más está mal escrito,
// no mal configurado.

export default function PisoDeTiempo({
  segundos,
  href,
  etiqueta,
}: {
  segundos: number
  href: string
  etiqueta: string
}) {
  const piso = Math.min(CEILING, Math.max(0, Math.round(segundos)))
  const [esperando, setEsperando] = useState(piso > 0)

  useEffect(() => {
    if (!esperando) return
    const t = setTimeout(() => setEsperando(false), piso * 1000)
    return () => clearTimeout(t)
  }, [esperando, piso])

  // Mientras corre el piso NO hay botón, ni siquiera apagado. Es la quita de
  // Sora sobre la forma que se había propuesto: un control visible que no
  // responde es una mentira de estado. Hay una frase, el respiro, y la
  // salida.
  if (esperando) {
    return (
      <span className="flex flex-col items-end gap-2">
        <span className="flex items-center gap-4">
          <span
            className="flex items-center gap-2.5 animate-respiro motion-reduce:animate-none"
            aria-hidden="true"
          >
            <span className="w-1 h-1 rounded-full bg-terra-ui" />
            <span className="w-1 h-1 rounded-full bg-terra-ui" />
            <span className="w-1 h-1 rounded-full bg-terra-ui" />
          </span>
          <span className="text-[15px] font-light text-dom">
            Quédate aquí un momento.
          </span>
        </span>
        <Link
          href={href}
          className="inline-flex min-h-toque items-center text-[13px] text-gray-ui hover:text-dom transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom rounded"
        >
          Seguir sin esperar
        </Link>
      </span>
    )
  }

  return (
    <span className="flex flex-col items-end gap-2">
      {/* La frase de transición de Sora ya no se pinta siempre: aparece con
          el botón, y con el piso cumplido se vuelve literalmente cierta. */}
      <span className="text-[12px] text-gray-ui">
        Esto ya quedó hecho. Lo que sigue, aparece cuando llegues.
      </span>
      <Link
        href={href}
        className="inline-flex items-center px-6 py-3 rounded-full bg-dom text-paper text-[15px] font-medium border border-dom hover:opacity-90 transition-opacity duration-700 ease-marca focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        {etiqueta}
      </Link>
    </span>
  )
}
