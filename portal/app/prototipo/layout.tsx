import Link from 'next/link'
import type { Metadata } from 'next'

// El nombre de la casa, no el de la sub-marca. El layout raiz todavia
// dice "Portal Trascendencia" y eso se corrige en el Frente B.
export const metadata: Metadata = {
  title: '4 Meaning',
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
