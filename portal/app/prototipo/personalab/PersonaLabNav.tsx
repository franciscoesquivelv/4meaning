'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Chasis de dos niveles, calcado del admin real:
//   nivel 1 = components/AdminTopNav.tsx (h-14, blanco, borde inferior)
//   nivel 2 = app/(admin)/eventos/[id]/EventSubNav.tsx (h-12, sticky top-14)
//
// Aqui el nivel 1 lleva el conmutador de marca, porque en 4 Meaning ese es
// el nivel de la casa. El nivel 2 lleva las secciones del workspace.

const SECCIONES = [
  { href: '/prototipo/personalab',              label: 'Resumen', exacto: true },
  { href: '/prototipo/personalab/experiencias', label: 'Experiencias' },
  { href: '/prototipo/personalab/corridas',     label: 'Corridas' },
  { href: '/prototipo/personalab/capitulos',    label: 'Capítulos' },
  { href: '/prototipo/personalab/moderadores',  label: 'Moderadores' },
  { href: '/prototipo/personalab/kit',          label: 'Kit' },
  { href: '/prototipo/personalab/retorno',      label: 'Retorno' },
]

function claseMarca(activa: boolean) {
  return [
    'px-3 py-2 text-sm rounded-md transition-colors',
    activa
      ? 'text-slate-900 font-medium bg-slate-100'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  ].join(' ')
}

export default function PersonaLabNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Nivel 1: la casa */}
      <header className="sticky top-0 z-50 h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6">
        <Link href="/prototipo/organizador?u=d" className="flex items-center">
          <span className="text-sm font-semibold tracking-tight text-slate-900">4Meaning</span>
        </Link>

        <nav className="ml-8 flex gap-1">
          <Link href="/dashboard" className={claseMarca(false)}>
            Trascendencia
          </Link>
          <Link href="/prototipo/personalab" className={claseMarca(true)}>
            PersonaLab
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 hidden sm:block">lucia@4meaning.life</span>
          <span className="text-xs text-slate-400">Cerrar sesión</span>
        </div>
      </header>

      {/* Nivel 2: las secciones del workspace */}
      <div className="sticky top-14 z-40 h-12 bg-white border-b border-slate-200 flex items-center px-6 gap-3">
        <span className="text-sm font-semibold text-slate-900 flex-shrink-0">PersonaLab</span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
          Workspace
        </span>

        <div className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-10" />
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pr-8">
            {SECCIONES.map(s => {
              const activa = s.exacto
                ? pathname === s.href
                : pathname === s.href || pathname.startsWith(s.href + '/')
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={[
                    'text-xs px-3 py-1.5 rounded-md whitespace-nowrap flex-shrink-0 transition-colors',
                    activa
                      ? 'text-slate-900 font-semibold bg-slate-100'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
                  ].join(' ')}
                >
                  {s.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
