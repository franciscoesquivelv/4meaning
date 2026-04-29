'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  Wrench,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/eventos',      label: 'Eventos',     icon: CalendarDays },
  { href: '/equipo',       label: 'Equipo',      icon: Users },
  { href: '/herramientas', label: 'Herramientas',icon: Wrench },
]

interface AdminNavProps {
  profile: {
    role: string
    full_name: string | null
    email: string
  }
}

export default function AdminNav({ profile }: AdminNavProps) {
  const pathname   = usePathname()
  const router     = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <p className="text-[8px] font-bold tracking-[0.3em] uppercase text-muted mb-0.5">
          Trascendencia
        </p>
        <p className="text-[10px] font-semibold text-ink/70">Portal Admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded text-[11px] font-medium transition-colors',
                active
                  ? 'bg-ink text-bg'
                  : 'text-muted hover:text-ink hover:bg-white/5'
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-border">
        <div className="px-3 mb-3">
          <p className="text-[11px] font-semibold text-ink truncate">
            {profile.full_name ?? profile.email}
          </p>
          <p className="text-[9px] text-muted uppercase tracking-wider mt-0.5">
            {profile.role.replace('_', ' ')}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded w-full text-[11px] font-medium text-muted hover:text-error hover:bg-error/8 transition-colors"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 fixed left-0 top-0 bottom-0 bg-surface border-r border-border z-40">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border h-14 flex items-center justify-between px-4">
        <p className="text-[9px] font-bold tracking-[0.28em] uppercase text-muted">
          Trascendencia Admin
        </p>
        <button
          onClick={() => setOpen(!open)}
          className="text-muted hover:text-ink transition-colors p-1"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-surface border-r border-border flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <NavContent />
          </aside>
        </div>
      )}

      {/* Mobile spacer */}
      <div className="md:hidden h-14" />
    </>
  )
}
