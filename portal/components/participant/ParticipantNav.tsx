'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, FileSignature, Clock, FolderOpen, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TABS = [
  { href: '/mi-retiro',   label: 'Inicio',      icon: Home },
  { href: '/acuerdos',    label: 'Acuerdos',    icon: FileSignature },
  { href: '/itinerario',  label: 'Itinerario',  icon: Clock },
  { href: '/documentos',  label: 'Documentos',  icon: FolderOpen },
]

export default function ParticipantNav() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border pb-safe">
      <div className="flex items-stretch max-w-xl mx-auto">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[9px] font-semibold uppercase tracking-wider transition-colors',
                active ? 'text-ink' : 'text-muted hover:text-ink/60'
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex-none flex flex-col items-center justify-center gap-1 px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-muted hover:text-error transition-colors"
        >
          <LogOut size={18} strokeWidth={1.8} />
          Salir
        </button>
      </div>
    </nav>
  )
}
