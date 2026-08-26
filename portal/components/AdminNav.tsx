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
      {/* Capa 4 Meaning: la casa por encima de la sub-marca.
          Permite volver al vestíbulo y cruzar al otro workspace. */}
      <div className="px-5 py-3 border-b border-[#1F2937] flex items-center justify-between gap-2">
        <Link href="/prototipo/organizador?u=d" className="block shrink-0">
          <Image
            src="/4m-logo-wht.png"
            alt="4 Meaning"
            width={110}
            height={16}
            className="h-3.5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
          />
        </Link>
        <Link
          href="/personalab"
          className="text-[10px] tracking-widest uppercase text-[#6B7280] hover:text-[#B9735A] transition-colors whitespace-nowrap"
        >
          PersonaLab →
        </Link>
      </div>

      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#1F2937]">
        <Link href="/hoy" className="block">
          <Image
            src="/logo.png"
            alt="Trascendencia"
            width={160}
            height={20}
            className="h-5 w-auto object-contain"
            priority
          />
        </Link>
        <div className="text-[#6B7280] text-xs mt-2">Portal de gestión</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        <NavLink href="/hoy" label="Hoy" active={pathname === '/hoy'} />

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

            {/* Preparación */}
            <div className="px-5 pt-3 pb-1">
              <div className="text-[9px] font-semibold text-[#374151] uppercase tracking-widest">
                Preparación
              </div>
            </div>
            <NavLink
              href={`/eventos/${currentEventId}/checklist`}
              label="Checklist"
              active={isActive(`/eventos/${currentEventId}/checklist`)}
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
              href={`/eventos/${currentEventId}/formularios`}
              label="Formularios"
              active={isActive(`/eventos/${currentEventId}/formularios`)}
            />
            <NavLink
              href={`/eventos/${currentEventId}/materiales`}
              label="Materiales"
              active={isActive(`/eventos/${currentEventId}/materiales`)}
            />
            <NavLink
              href={`/eventos/${currentEventId}/equipo`}
              label="Equipo"
              active={isActive(`/eventos/${currentEventId}/equipo`)}
            />

            {/* Contenido */}
            <div className="px-5 pt-3 pb-1">
              <div className="text-[9px] font-semibold text-[#374151] uppercase tracking-widest">
                Contenido
              </div>
            </div>
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
              href={`/eventos/${currentEventId}/avisos`}
              label="Avisos"
              active={isActive(`/eventos/${currentEventId}/avisos`)}
            />

            {/* Ejecución */}
            <div className="px-5 pt-3 pb-1">
              <div className="text-[9px] font-semibold text-[#374151] uppercase tracking-widest">
                Ejecución
              </div>
            </div>
            <NavLink
              href={`/eventos/${currentEventId}/operacion`}
              label="Operación"
              active={isActive(`/eventos/${currentEventId}/operacion`)}
            />
            <NavLink
              href={`/eventos/${currentEventId}/entregas`}
              label="Entregas"
              active={isActive(`/eventos/${currentEventId}/entregas`)}
            />
          </>
        )}

        {/* Admin */}
        <div className="mt-4 border-t border-[#1F2937] pt-4">
          <div className="px-5 pb-1">
            <div className="text-[9px] font-semibold text-[#374151] uppercase tracking-widest">
              Admin
            </div>
          </div>
          <NavLink href="/usuarios" label="Usuarios" active={pathname === '/usuarios' || pathname.startsWith('/usuarios/')} />
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
