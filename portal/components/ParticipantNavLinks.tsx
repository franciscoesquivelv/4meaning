'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const PenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
)

const CheckStarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const FIJAS = [
  { href: '/mi-retiro', label: 'Inicio',   icon: HomeIcon },
  { href: '/programa',  label: 'Programa', icon: CalendarIcon },
  { href: '/avisos',    label: 'Avisos',   icon: BellIcon },
]

const FIRMAR      = { href: '/acuerdos',    label: 'Firmar',      icon: PenIcon }
const COMPROMISOS = { href: '/compromisos', label: 'Compromisos', icon: CheckStarIcon }

export default function ParticipantNavLinks({ yaPaso }: { yaPaso: boolean }) {
  const pathname = usePathname()

  const navItems = [...FIJAS, yaPaso ? COMPROMISOS : FIRMAR]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-paper/95 backdrop-blur-sm border-t border-line"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/mi-retiro' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              // 44px de alto mínimo: es el objetivo táctil por debajo del cual
              // un dedo empieza a fallar.
              className="flex flex-col items-center justify-center gap-1 relative px-4 min-h-[44px] flex-1"
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-wine rounded-full" />
              )}
              <span className={isActive ? 'text-wine' : 'text-gray-ui'}>
                <item.icon />
              </span>
              <span className={`text-[10px] tracking-wide ${isActive ? 'text-wine font-medium' : 'text-gray-ui'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
