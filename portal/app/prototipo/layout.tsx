import Link from 'next/link'
import type { Metadata } from 'next'

// El nombre de la casa, no el de la sub-marca. El layout raiz todavia
// dice "Portal Trascendencia" y eso se corrige en el Frente B.
//
// noindex en toda la rama /prototipo. No es por pudor: aqui viven el lexico
// vinculante, el modelo de dominio de las dos marcas y el hecho de que
// PersonaLab reemplaza a Thinkific. Eso es exposicion competitiva, no legal,
// y no tiene por que aparecer buscando la marca.
//
// Doble capa a proposito: robots.txt impide RASTREAR, y esta etiqueta impide
// INDEXAR. Sin la etiqueta, una pagina enlazada desde fuera puede acabar en
// el indice aunque el robot nunca la haya leido.
export const metadata: Metadata = {
  title: '4 Meaning',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
}

// Layout aislado del prototipo. No consulta Supabase a proposito:
// sirve para iterar la forma del ecosistema sin credenciales ni datos reales.

export default function PrototipoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: '#FAF8F4',
        color: '#14181B',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
        fontWeight: 300,
      }}
    >
      <div
        style={{
          background: '#002B34',
          color: '#FAF8F4',
          fontSize: 11,
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          padding: '7px 20px',
          display: 'flex',
          gap: 18,
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: '#B9735A', fontWeight: 600 }}>Prototipo</span>
        <Link href="/prototipo" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.85 }}>
          Participante
        </Link>
        <Link href="/prototipo/organizador" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.85 }}>
          Organizador
        </Link>
      </div>
      {children}
    </div>
  )
}
