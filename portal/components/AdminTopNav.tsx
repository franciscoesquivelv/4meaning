'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface AdminTopNavProps {
  userEmail: string
}

export default function AdminTopNav({ userEmail }: AdminTopNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const enPersonaLab = pathname === '/personalab' || pathname.startsWith('/personalab/')

  const navLinkClass = (prefix: string) => {
    const isActive = pathname === prefix || pathname.startsWith(prefix + '/')
    return [
      'px-3 py-2 text-sm rounded-md transition-colors',
      isActive
        ? 'text-slate-900 font-medium bg-slate-100'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    ].join(' ')
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full h-14 bg-white border-b border-[#E5E7EB] z-50 flex items-center justify-between px-6">
      {/* Left: la casa. Lleva al selector de workspace, no al dashboard de
          Trascendencia: 4 Meaning es la capa de arriba, no una sub-marca. */}
      <Link
        href="/workspaces"
        className="flex items-center gap-2 group"
        title="Cambiar de workspace"
      >
        <span className="text-sm font-semibold tracking-tight text-slate-900">4Meaning</span>
        <svg
          className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
        </svg>
      </Link>

      {/* Center. Depende de en qué workspace estás, porque este es el nivel
          de la casa y no el de una marca: Eventos y Usuarios son secciones
          de Trascendencia, y dentro de PersonaLab no llevan a ningún lado
          útil. Dentro de PersonaLab, este nivel sirve para volver. */}
      <nav className="ml-8 flex gap-1">
        {enPersonaLab ? (
          <>
            <Link href="/dashboard" className={navLinkClass('/dashboard')}>
              Trascendencia
            </Link>
            <Link href="/personalab" className={navLinkClass('/personalab')}>
              PersonaLab
            </Link>
          </>
        ) : (
          <>
            <Link href="/eventos" className={navLinkClass('/eventos')}>
              Eventos
            </Link>
            <Link href="/usuarios" className={navLinkClass('/usuarios')}>
              Usuarios
            </Link>
          </>
        )}
      </nav>

      {/* Right: User info + logout */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-400 hidden sm:block">{userEmail}</span>
        <button
          onClick={handleLogout}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
