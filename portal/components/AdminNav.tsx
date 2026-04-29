'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

interface AdminNavProps {
  userEmail?: string
  activeEventId?: string
  activeEventName?: string
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
        active
          ? 'text-white bg-white/5 border-l-2 border-white'
          : 'text-[#9CA3AF] border-l-2 border-transparent hover:text-white hover:bg-white/5',
      ].join(' ')}
    >
      <span className={active ? 'font-medium' : ''}>{label}</span>
    </Link>
  )
}

export default function AdminNav({ userEmail, activeEventId, activeEventName }: AdminNavProps) {
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

  // Detect event ID from current path
  const eventMatch = pathname.match(/^\/eventos\/([^/]+)/)
  const currentEventId = eventMatch ? eventMatch[1] : activeEventId
  const isOnEvent = !!currentEventId && currentEventId !== 'nuevo'

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <aside className="w-[240px] min-h-screen bg-[#111111] flex flex-col flex-shrink-0 border-r border-[#1F2937]">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#1F2937]">
        <Link href="/dashboard" className="block">
          <Image
            src="/logo-wht.png"
            alt="Trascendencia"
            width={140}
            height={36}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>
        <div className="text-[#6B7280] text-xs mt-2">Portal de gestión</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        <NavLink href="/dashboard" label="Dashboard" active={pathname === '/dashboard'} />

        {/* Event sections — shown when on an event */}
        {isOnEvent && currentEventId && (
          <>
            <div className="px-5 pt-4 pb-1.5">
              <div className="text-[10px] font-semibold text-[#4B5563] uppercase tracking-widest truncate">
                {activeEventName ?? 'Evento actual'}
              </div>
            </div>
            <NavLink
              href={`/eventos/${currentEventId}`}
              label="Resumen"
              active={pathname === `/eventos/${currentEventId}`}
            />
            <NavLink
              href={`/eventos/${currentEventId}/familias`}
              label="Familias"
              active={isActive(`/eventos/${currentEventId}/familias`)}
            />
            <NavLink
              href={`/eventos/${currentEventId}/acuerdos`}
              label="Acuerdos"
              active={isActive(`/eventos/${currentEventId}/acuerdos`)}
            />
            <NavLink
              href={`/eventos/${currentEventId}/itinerario`}
              label="Itinerario"
              active={isActive(`/eventos/${currentEventId}/itinerario`)}
            />
            <NavLink
              href={`/eventos/${currentEventId}/documentos`}
              label="Documentos"
              active={isActive(`/eventos/${currentEventId}/documentos`)}
            />
            <NavLink
              href={`/eventos/${currentEventId}/formularios`}
              label="Formularios"
              active={isActive(`/eventos/${currentEventId}/formularios`)}
            />
          </>
        )}

        {/* Spacer */}
        <div className="mt-4 border-t border-[#1F2937] pt-4">
          <NavLink href="/eventos" label="Todos los eventos" active={pathname === '/eventos'} />
          <NavLink href="/eventos/nuevo" label="+ Nuevo evento" active={pathname === '/eventos/nuevo'} />
        </div>
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
