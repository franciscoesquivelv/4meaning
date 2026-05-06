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
      {/* Left: Logo */}
      <Link href="/dashboard" className="flex items-center">
        <span className="text-sm font-semibold tracking-tight text-slate-900">4Meaning</span>
      </Link>

      {/* Center: Nav links */}
      <nav className="ml-8 flex gap-1">
        <Link href="/eventos" className={navLinkClass('/eventos')}>
          Eventos
        </Link>
        <Link href="/usuarios" className={navLinkClass('/usuarios')}>
          Usuarios
        </Link>
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
