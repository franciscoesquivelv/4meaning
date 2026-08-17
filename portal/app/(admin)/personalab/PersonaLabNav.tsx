'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// SOLO EL NIVEL 2. Antes este archivo dibujaba tambien una barra superior
// propia, con un correo escrito a mano y un "Cerrar sesion" que no cerraba
// nada: el workspace vivia fuera del portal y tenia que fingir el chasis.
//
// Ahora vive dentro de (admin), asi que el nivel 1 lo pone AdminTopNav, con
// la sesion de verdad. Esta barra es hermana de EventSubNav.tsx: misma
// altura, mismo sticky top-14, mismo borde.

const SECCIONES = [
  { href: '/personalab',              label: 'Resumen', exacto: true },
  { href: '/personalab/experiencias', label: 'Experiencias' },
  { href: '/personalab/corridas',     label: 'Corridas' },
  { href: '/personalab/capitulos',    label: 'Capítulos' },
  { href: '/personalab/moderadores',  label: 'Moderadores' },
  { href: '/personalab/kit',          label: 'Kit' },
  { href: '/personalab/retorno',      label: 'Retorno' },
]

export default function PersonaLabNav() {
  const pathname = usePathname()

  return (
    <div className="sticky top-14 z-40 h-12 bg-white border-b border-slate-200 flex items-center px-6 gap-3">
      <span className="text-sm font-semibold text-slate-900 flex-shrink-0">PersonaLab</span>
      {/* Que los datos son simulados tiene que decirse aqui arriba y en todo
          momento. Ahora que el workspace vive junto a Trascendencia, que si
          es real, confundir los dos sale caro. */}
      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0"
        title="El catálogo, las corridas y los moderadores son de ejemplo. Nada de esto sale de tu navegador."
      >
        Datos de ejemplo
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
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/25',
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
  )
}
