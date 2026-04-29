'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: string
  comingSoon?: boolean
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '▣' },
  { href: '/eventos', label: 'Eventos', icon: '◫' },
  { href: '/equipo', label: 'Equipo', icon: '◈', comingSoon: true },
]

interface AdminNavProps {
  userEmail?: string
}

export default function AdminNav({ userEmail }: AdminNavProps) {
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

  return (
    <aside className="w-[240px] min-h-screen bg-[#111111] flex flex-col flex-shrink-0 border-r border-[#1F2937]">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-[#1F2937]">
        <div className="text-white font-semibold text-base tracking-tight">Trascendencia</div>
        <div className="text-[#6B7280] text-xs mt-0.5">Portal de gestión</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          if (item.comingSoon) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 px-5 py-2.5 text-sm text-[#374151] cursor-default"
              >
                <span className="text-base w-5 text-center opacity-40">{item.icon}</span>
                <span className="opacity-40">{item.label}</span>
                <span className="ml-auto text-[10px] text-[#374151] opacity-50 font-medium uppercase tracking-wider">pronto</span>
              </div>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
                active
                  ? 'text-white bg-white/5 border-l-2 border-white'
                  : 'text-[#9CA3AF] border-l-2 border-transparent hover:text-white hover:bg-white/5',
              ].join(' ')}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className={active ? 'font-medium' : ''}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-5 py-4 border-t border-[#1F2937]">
        {userEmail && (
          <div className="text-[#6B7280] text-xs mb-3 truncate">{userEmail}</div>
        )}
        <button
          onClick={handleLogout}
          className="w-full py-2 text-sm text-[#9CA3AF] border border-[#374151] rounded-lg hover:text-white hover:border-[#6B7280] transition-colors cursor-pointer bg-transparent"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
