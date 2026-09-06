'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BARRA_WORKSPACE, ROTULO_BARRA, entradaWorkspace, PASTILLA_CURSO,
} from '@/lib/estilos/oficina'

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
    <div className={BARRA_WORKSPACE}>
      <span className={`${ROTULO_BARRA} flex-shrink-0`}>PersonaLab</span>
      {/* Que los datos son simulados tiene que decirse aqui arriba y en todo
          momento. Ahora que el workspace vive junto a Trascendencia, que si
          es real, confundir los dos sale caro.

          El par era `bg-amber-100` / `text-amber-700`, ambar de fabrica de
          Tailwind, que no esta en ninguna paleta de la marca. La pastilla de
          curso lleva `terra-ui`, que es el acento humano de 4 Meaning en su
          variante de interfaz: 4.93 sobre papel. */}
      <span
        className={`${PASTILLA_CURSO} flex-shrink-0`}
        title="El catálogo, las corridas y los moderadores son de ejemplo. Nada de esto sale de tu navegador."
      >
        Datos de ejemplo
      </span>

      <div className="relative flex-1 overflow-hidden">
        {/* El desvanecido tiene que terminar en el color de la barra. Estaba
            en `from-white`, o sea que con la barra en papel habria dejado una
            franja blanca sobre la ultima entrada. */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-paper to-transparent z-10" />
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pr-8">
          {SECCIONES.map(s => {
            const activa = s.exacto
              ? pathname === s.href
              : pathname === s.href || pathname.startsWith(s.href + '/')
            return (
              <Link
                key={s.href}
                href={s.href}
                className={`${entradaWorkspace(activa)} flex-shrink-0`}
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
