'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/eventos', label: 'Eventos' },
]

export default function AdminNav() {
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
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: '#111',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      flexShrink: 0,
    }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #333' }}>
        <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.5px' }}>
          Trascendencia
        </span>
        <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Portal Admin</div>
      </div>

      <nav style={{ flex: 1, padding: '16px 0' }}>
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '10px 20px',
                color: active ? '#fff' : '#aaa',
                background: active ? '#222' : 'transparent',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                borderLeft: active ? '3px solid #fff' : '3px solid transparent',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #333' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '8px 0',
            background: 'transparent',
            color: '#aaa',
            border: '1px solid #333',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
