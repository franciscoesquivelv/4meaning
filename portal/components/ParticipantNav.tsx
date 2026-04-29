'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const navItems = [
  { href: '/mi-retiro', label: 'Inicio' },
  { href: '/acuerdos', label: 'Acuerdos' },
  { href: '/itinerario', label: 'Itinerario' },
  { href: '/documentos', label: 'Documentos' },
]

export default function ParticipantNav() {
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
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      zIndex: 50,
    }}>
      {navItems.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 4px',
              fontSize: 12,
              fontWeight: active ? 700 : 400,
              color: active ? '#111' : '#9ca3af',
              textDecoration: 'none',
              borderTop: active ? '2px solid #111' : '2px solid transparent',
            }}
          >
            {item.label}
          </Link>
        )
      })}
      <button
        onClick={handleLogout}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 4px',
          fontSize: 12,
          fontWeight: 400,
          color: '#9ca3af',
          background: 'transparent',
          border: 'none',
          borderTop: '2px solid transparent',
          cursor: 'pointer',
        }}
      >
        Salir
      </button>
    </nav>
  )
}
