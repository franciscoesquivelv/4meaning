'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// La barra del territorio del cliente. Chica a propósito: dos destinos y
// cerrar sesión. No es el back office ni la app de Trascendencia, y no
// necesita su densidad.

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()

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

  return (
    <header className="sticky top-0 z-40 h-14 bg-paper/90 backdrop-blur border-b border-line flex items-center px-5 md:px-8">
      <Link href="/mis-experiencias" className="cejilla shrink-0">
        PersonaLab
      </Link>

      <nav className="ml-8 flex items-center gap-1">
        <Link href="/mis-experiencias" className={claseEntrada('/mis-experiencias')}>
          Mis experiencias
        </Link>
        <Link href="/cuenta" className={claseEntrada('/cuenta')}>
          Cuenta
        </Link>
      </nav>

      <button
        onClick={salir}
        className="ml-auto text-[13px] text-gray-ui hover:text-alerta transition-colors bg-transparent border-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom rounded px-2 py-1"
      >
        Cerrar sesión
      </button>
    </header>
  )
}
