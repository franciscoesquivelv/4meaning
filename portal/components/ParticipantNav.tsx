'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/mi-retiro', label: 'Inicio',   icon: '⌂' },
  { href: '/avisos',    label: 'Avisos',   icon: '📢' },
  { href: '/programa',  label: 'Programa', icon: '◫' },
  { href: '/acuerdos',  label: 'Firmar',   icon: '✍' },
  { href: '/info',      label: 'Info',     icon: 'ℹ' },
]

export default function ParticipantNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-[#2A2A2A] flex z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 68 }}
    >
      {navItems.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'relative flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors',
              active ? 'text-[#C9A96E]' : 'text-[#6B7280] hover:text-[#9CA3AF]',
            ].join(' ')}
          >
            {active && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#C9A96E] rounded-full" />
            )}
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
