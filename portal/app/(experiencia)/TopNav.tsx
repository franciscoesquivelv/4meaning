'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// La barra del territorio del cliente. Chica a propósito: dos destinos y
// cerrar sesión. No es el back office ni la app de Trascendencia, y no
// necesita su densidad.
//
// SE ROMPÍA A 375PX, EN TODAS LAS PANTALLAS DEL ÁRBOL. Medido en vivo
// (viewport real de teléfono, no aproximado): `header.scrollWidth` 394
// contra `header.clientWidth` 375, 19px de desborde. "Cerrar sesión" quedaba
// cortado fuera del borde derecho, exigiendo scroll horizontal para
// tocarlo completo. Hallazgo de Hugo, re-verificado por Leo el 2026-09-21.
// Bajo `sm:` (640px), la navegación colapsa a un menú; "Cerrar sesión" se
// queda fuera del menú (es la acción más usada y más sensible en un
// dispositivo compartido) pero pasa de texto con relleno a un ícono con
// `min-h-toque min-w-toque` para que quepa sin desbordar.

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function salir() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const activa = (prefijo: string) =>
    pathname === prefijo || pathname.startsWith(prefijo + '/')

  const claseEntrada = (prefijo: string) =>
    `text-[14px] px-3 py-1.5 rounded-full transition-colors ${
      activa(prefijo)
        ? 'text-paper bg-dom'
        : 'text-ink hover:bg-line/60'
    }`

  const claseEntradaMenu = (prefijo: string) =>
    `flex min-h-toque items-center px-4 text-[14px] transition-colors ${
      activa(prefijo)
        ? 'text-paper bg-dom'
        : 'text-ink hover:bg-line/60'
    }`

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-line">
      <div className="h-14 flex items-center px-5 md:px-8">
        <Link href="/mis-experiencias" className="cejilla shrink-0">
          PersonaLab
        </Link>

        <nav className="ml-8 hidden sm:flex items-center gap-1">
          <Link href="/mis-experiencias" className={claseEntrada('/mis-experiencias')}>
            Mis experiencias
          </Link>
          <Link href="/cuenta" className={claseEntrada('/cuenta')}>
            Cuenta
          </Link>
        </nav>

        <button
          onClick={() => setMenuAbierto(a => !a)}
          className="sm:hidden ml-6 min-h-toque min-w-toque flex items-center justify-center text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom rounded"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            {menuAbierto ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

        <button
          onClick={salir}
          className="ml-auto hidden sm:inline text-[13px] text-gray-ui hover:text-alerta transition-colors bg-transparent border-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom rounded px-2 py-1"
        >
          Cerrar sesión
        </button>
        <button
          onClick={salir}
          className="sm:hidden ml-auto min-h-toque min-w-toque flex items-center justify-center text-gray-ui hover:text-alerta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom rounded"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </div>

      {menuAbierto && (
        <nav className="sm:hidden border-t border-line flex flex-col">
          <Link
            href="/mis-experiencias"
            className={claseEntradaMenu('/mis-experiencias')}
            onClick={() => setMenuAbierto(false)}
          >
            Mis experiencias
          </Link>
          <Link
            href="/cuenta"
            className={claseEntradaMenu('/cuenta')}
            onClick={() => setMenuAbierto(false)}
          >
            Cuenta
          </Link>
        </nav>
      )}
    </header>
  )
}
