'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  eventId: string
  eventName: string
  pipelineStatus: string
}

const PIPELINE_LABELS: Record<string, { label: string; cls: string }> = {
  prospecto:      { label: 'Prospecto',      cls: 'bg-slate-100 text-slate-600' },
  confirmado:     { label: 'Confirmado',      cls: 'bg-blue-100 text-blue-700' },
  en_preparacion: { label: 'En preparación', cls: 'bg-amber-100 text-amber-700' },
  ejecutado:      { label: 'Ejecutado',       cls: 'bg-emerald-100 text-emerald-700' },
  cancelado:      { label: 'Cancelado',       cls: 'bg-red-100 text-red-500' },
}

export default function EventSubNav({ eventId, eventName, pipelineStatus }: Props) {
  const pathname = usePathname()

  const NAV_LINKS = [
    { href: `/eventos/${eventId}`,             label: 'Resumen' },
    { href: `/eventos/${eventId}/checklist`,   label: 'Checklist' },
    { href: `/eventos/${eventId}/contenido`,   label: 'Contenido' },
    { href: `/eventos/${eventId}/familias`,    label: 'Familias' },
    { href: `/eventos/${eventId}/acuerdos`,    label: 'Acuerdos' },
    { href: `/eventos/${eventId}/materiales`,  label: 'Materiales' },
    { href: `/eventos/${eventId}/equipo`,      label: 'Equipo' },
    { href: `/eventos/${eventId}/itinerario`,  label: 'Itinerario' },
    { href: `/eventos/${eventId}/avisos`,      label: 'Avisos' },
    { href: `/eventos/${eventId}/entregas`,    label: 'Entregas' },
    { href: `/eventos/${eventId}/operacion`,   label: 'Operación' },
    { href: `/eventos/${eventId}/preview`,     label: 'Preview' },
  ]

  const pipeline = PIPELINE_LABELS[pipelineStatus] ?? PIPELINE_LABELS.prospecto

  return (
    <div className="sticky top-14 z-40 h-12 bg-white border-b border-slate-200 flex items-center px-6 gap-3 overflow-x-auto">
      {/* Back link */}
      <Link
        href="/eventos"
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap flex-shrink-0"
      >
        ← Eventos
      </Link>

      {/* Separator */}
      <span className="text-slate-200">|</span>

      {/* Event name */}
      <span className="text-sm font-semibold text-slate-900 truncate max-w-[180px] flex-shrink-0">
        {eventName}
      </span>

      {/* Pipeline badge */}
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${pipeline.cls}`}>
        {pipeline.label}
      </span>

      {/* Nav links wrapper con fade right */}
      <div className="relative flex-1 overflow-hidden">
        {/* Fade overlay derecho */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-10" />

        {/* Los links scrollables */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pr-8">
          {NAV_LINKS.map(({ href, label }) => {
            const isOperacion = label === 'Operación'
            const isActive =
              href === `/eventos/${eventId}`
                ? pathname === href
                : pathname === href || pathname.startsWith(href + '/')

            let cls = 'text-xs px-3 py-1.5 rounded-md whitespace-nowrap flex-shrink-0 transition-colors '

            if (isOperacion) {
              cls += isActive
                ? 'bg-slate-900 text-white hover:bg-slate-700'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white'
            } else {
              cls += isActive
                ? 'text-slate-900 font-semibold bg-slate-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }

            return (
              <Link key={href} href={href} className={cls}>
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
