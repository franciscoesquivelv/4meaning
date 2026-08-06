'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

// Barra lateral del workspace. Dominancia teal, que es la que
// BRAND.md le asigna a PersonaLab.

const SECCIONES = [
  { grupo: null, items: [{ href: '/prototipo/personalab', label: 'Resumen', exacto: true }] },
  {
    grupo: 'Catálogo',
    items: [
      { href: '/prototipo/personalab/experiencias', label: 'Experiencias' },
      { href: '/prototipo/personalab/kit', label: 'Kit y fronteras' },
    ],
  },
  {
    grupo: 'Operación',
    items: [
      { href: '/prototipo/personalab/corridas', label: 'Corridas' },
      { href: '/prototipo/personalab/capitulos', label: 'Capítulos' },
      { href: '/prototipo/personalab/moderadores', label: 'Moderadores' },
    ],
  },
  {
    grupo: 'Después',
    items: [{ href: '/prototipo/personalab/retorno', label: 'Retorno' }],
  },
]

export default function WorkspaceNav() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: 218,
        flexShrink: 0,
        background: '#002B34',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '20px 18px', borderBottom: '1px solid rgba(255,255,255,.11)' }}>
        <Link href="/prototipo/organizador?u=d" style={{ display: 'block', textDecoration: 'none' }}>
          <Image
            src="/4m-logo-wht.png"
            alt="4 Meaning"
            width={120}
            height={22}
            style={{ height: 17, width: 'auto', objectFit: 'contain', opacity: 0.75 }}
          />
        </Link>
        <div
          style={{
            marginTop: 12,
            fontSize: 15,
            fontWeight: 300,
            color: '#F2EFE9',
            letterSpacing: '-.005em',
          }}
        >
          PersonaLab
        </div>
        <div style={{ fontSize: 10.5, color: '#8FB0B6', marginTop: 2 }}>Workspace</div>
      </div>

      <nav style={{ flex: 1, padding: '14px 0' }}>
        {SECCIONES.map((s, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            {s.grupo && (
              <div
                style={{
                  padding: '10px 18px 5px',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '.19em',
                  textTransform: 'uppercase',
                  color: 'rgba(143,176,182,.62)',
                }}
              >
                {s.grupo}
              </div>
            )}
            {s.items.map(it => {
              const activo = 'exacto' in it && it.exacto
                ? pathname === it.href
                : pathname === it.href || pathname.startsWith(it.href + '/')
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  style={{
                    display: 'block',
                    padding: '8px 18px',
                    fontSize: 13,
                    textDecoration: 'none',
                    color: activo ? '#FFFFFF' : '#A8C3C8',
                    background: activo ? 'rgba(255,255,255,.07)' : 'transparent',
                    borderLeft: activo ? '2px solid #B9735A' : '2px solid transparent',
                    fontWeight: activo ? 500 : 300,
                  }}
                >
                  {it.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,.11)' }}>
        <div style={{ fontSize: 11, color: '#8FB0B6' }}>Lucía Ferrer</div>
        <div style={{ fontSize: 10, color: 'rgba(143,176,182,.7)', marginTop: 2 }}>Equipo PersonaLab</div>
      </div>
    </aside>
  )
}
