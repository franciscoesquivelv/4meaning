import type { Metadata } from 'next'
// Este arbol declara su propio <html>, asi que NO hereda el layout raiz ni
// globals.css. Esa es la razon de fondo por la que las seis piezas impresas
// escribian cada color a mano: no tenian acceso a un solo token de marca.
// marca.css trae la paleta y las clases del sistema sin arrastrar el reset de
// Tailwind, que aqui si estorbaria.
import '../marca.css'

export const metadata: Metadata = {
  title: 'Trascendencia · Materiales',
}

export default function ImprimirLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="marca-trascendencia">
      <head>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          /* La familia sigue siendo la serif generica con la que se compusieron
             estas piezas. NO es del sistema de marca (la sans es Avenir Next,
             y en web el stack de Helvetica Neue, en var(--sans)), pero
             cambiarla mueve los saltos de linea de seis piezas que se imprimen
             en papel, y eso no se decide sin ver una prueba impresa. Queda
             anotado como trabajo aparte. */
          body { background: var(--paper-2); font-family: Georgia, 'Times New Roman', serif; }
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
            @page { margin: 0; size: letter portrait; }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
