'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { retiroTerminado } from '@/lib/participante/tiempo'

// ── LA BARRA DEL EVENTO ─────────────────────────────────────────
//
// ANTES: doce destinos en una fila plana, con DOS `overflow-x-auto` y un
// degradado de desvanecido encima. Ese degradado es la confesion: el propio
// codigo sabia que no cabian. Lo que se caia del borde derecho era Operacion,
// que es justo la pantalla que se necesita con gente en la sala. Y habia dos
// secciones vivas, Formularios y Documentos, sin una sola entrada aqui: solo
// se llegaba a ellas desde ellas mismas.
//
// AHORA: cinco entradas ordenadas por el tiempo del evento, que es la unica
// secuencia que contesta "y ahora que hago". Se lee de izquierda a derecha
// como se vive un retiro:
//
//   Resumen . Parejas . Preparacion . La sala . Entregas
//
// Los dos MODOS no son secciones y por eso no viven dentro de ningun grupo:
// van a la derecha, separados. "Modo operacion" es lo que se abre con la
// gente enfrente, asi que conserva el unico control de peso alto de la barra.
// "Ver como la pareja" es lo que ve la pareja, no lo que hace el equipo:
// meterlo entre las secciones de trabajo era decirle al equipo que es una
// tarea suya, y no lo es.
//
// La agrupacion no se invento aqui. Ya estaba escrita en el repositorio y se
// habia tirado: `components/AdminNav.tsx` agrupaba estos mismos destinos en
// Preparacion / Contenido / Ejecucion desde el 2026-04-29, en un componente
// que ningun archivo importaba. Ese archivo se borro y su agrupacion revive
// aqui, corregida: el eje ya no es el tipo de trabajo, es el momento.
//
// REGLA QUE ESTA BARRA NO PUEDE VOLVER A ROMPER: si necesita
// `overflow-x-auto`, no cabe, y si no cabe hay que quitar, no hacer scroll.

const PIPELINE_LABELS: Record<string, { label: string; cls: string }> = {
  prospecto:      { label: 'Prospecto',      cls: 'bg-slate-100 text-slate-600' },
  confirmado:     { label: 'Confirmado',      cls: 'bg-blue-100 text-blue-700' },
  en_preparacion: { label: 'En preparación', cls: 'bg-amber-100 text-amber-700' },
  ejecutado:      { label: 'Ejecutado',       cls: 'bg-emerald-100 text-emerald-700' },
  cancelado:      { label: 'Cancelado',       cls: 'bg-red-100 text-red-500' },
}

type Destino = { href: string; label: string; nota: string }
type Grupo = { id: string; label: string; destinos: Destino[] }

interface Props {
  eventId: string
  eventName: string
  pipelineStatus: string
  fechaFin: string | null
}

export default function EventSubNav({ eventId, eventName, pipelineStatus, fechaFin }: Props) {
  const pathname = usePathname()
  const [abierto, setAbierto] = useState<string | null>(null)
  const barra = useRef<HTMLDivElement>(null)

  // El menu abierto se cierra al navegar. Sin esto queda flotando sobre la
  // pantalla nueva y tapa lo primero que la persona vino a leer.
  useEffect(() => { setAbierto(null) }, [pathname])

  useEffect(() => {
    if (!abierto) return
    function fuera(e: MouseEvent) {
      if (barra.current && !barra.current.contains(e.target as Node)) setAbierto(null)
    }
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') setAbierto(null)
    }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', escape)
    }
  }, [abierto])

  const base = `/eventos/${eventId}`

  const GRUPOS: Grupo[] = [
    {
      id: 'parejas',
      label: 'Parejas',
      destinos: [
        { href: `${base}/familias`,    label: 'Familias',    nota: 'Quiénes vienen, con quién y en qué habitación' },
        { href: `${base}/acuerdos`,    label: 'Acuerdos',    nota: 'Lo que cada pareja tiene que firmar' },
        { href: `${base}/formularios`, label: 'Formularios', nota: 'La historia que cada familia nos contó' },
      ],
    },
    {
      id: 'preparacion',
      label: 'Preparación',
      destinos: [
        { href: `${base}/checklist`,   label: 'Checklist',   nota: 'Lo que falta por hacer, fase por fase' },
        { href: `${base}/equipo`,      label: 'Equipo',      nota: 'Quién acompaña este retiro' },
        { href: `${base}/materiales`,  label: 'Materiales',  nota: 'Lo que se imprime y se lleva' },
        { href: `${base}/documentos`,  label: 'Documentos',  nota: 'Archivos que la pareja abre desde su app' },
      ],
    },
    {
      id: 'sala',
      label: 'La sala',
      destinos: [
        { href: `${base}/itinerario`,  label: 'Itinerario',  nota: 'Qué pasa cada día y a qué hora' },
        { href: `${base}/contenido`,   label: 'Contenido',   nota: 'Los bloques que se activan durante el retiro' },
        { href: `${base}/avisos`,      label: 'Avisos',      nota: 'Lo que se le anuncia al grupo' },
      ],
    },
  ]

  // ENTREGAS SOLO CUANDO YA HAY ALGO QUE ENTREGAR. Antes del retiro la
  // pantalla existe pero no tiene materia: son doce filas en "Pendiente"
  // sobre un Storybook que nadie ha empezado. Sigue alcanzable desde el
  // panel de Acciones del Resumen para quien necesite fijar fechas antes.
  const yaPaso = retiroTerminado(fechaFin) || pipelineStatus === 'ejecutado'

  const pipeline = PIPELINE_LABELS[pipelineStatus] ?? PIPELINE_LABELS.prospecto

  const esActivo = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const claseEntrada = (activo: boolean) =>
    'text-xs px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ' +
    (activo
      ? 'text-slate-900 font-semibold bg-slate-100'
      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')

  return (
    <div
      ref={barra}
      className="sticky top-14 z-40 h-12 bg-white border-b border-slate-200 flex items-center px-6 gap-3"
    >
      {/* El nombre del evento. El enlace de vuelta a Eventos salio de aqui:
          la barra de arriba ya lo tiene, y era el mismo destino dos veces. */}
      <span className="text-sm font-semibold text-slate-900 truncate max-w-[180px] flex-shrink-0">
        {eventName}
      </span>

      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${pipeline.cls}`}>
        {pipeline.label}
      </span>

      <nav className="flex items-center gap-1 ml-2">
        <Link href={base} className={claseEntrada(pathname === base)}>
          Resumen
        </Link>

        {GRUPOS.map(grupo => {
          const grupoActivo = grupo.destinos.some(d => esActivo(d.href))
          const estaAbierto = abierto === grupo.id
          return (
            <div key={grupo.id} className="relative">
              <button
                type="button"
                onClick={() => setAbierto(estaAbierto ? null : grupo.id)}
                aria-haspopup="menu"
                aria-expanded={estaAbierto}
                className={claseEntrada(grupoActivo || estaAbierto) + ' inline-flex items-center gap-1 cursor-pointer border-none bg-transparent'}
              >
                {grupo.label}
                <span className="text-[8px] opacity-50">▾</span>
              </button>

              {estaAbierto && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5"
                >
                  {grupo.destinos.map(d => (
                    <Link
                      key={d.href}
                      href={d.href}
                      role="menuitem"
                      className={`block px-3 py-2 rounded-lg mx-1.5 transition-colors ${
                        esActivo(d.href) ? 'bg-slate-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-sm text-slate-900">{d.label}</span>
                      <span className="block text-xs text-slate-400 mt-0.5">{d.nota}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {yaPaso && (
          <Link href={`${base}/entregas`} className={claseEntrada(esActivo(`${base}/entregas`))}>
            Entregas
          </Link>
        )}
      </nav>

      {/* Los dos modos. No son secciones: son maneras de mirar el mismo
          evento, y por eso viven separados de los grupos. */}
      <div className="ml-auto flex items-center gap-2 flex-shrink-0">
        <Link
          href={`${base}/preview`}
          title="La app tal como la ve la pareja"
          className={
            'text-xs px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ' +
            (esActivo(`${base}/preview`)
              ? 'text-slate-900 font-semibold bg-slate-100'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
          }
        >
          Ver como la pareja
        </Link>
        <Link
          href={`${base}/operacion`}
          title="Panel en vivo durante el retiro"
          className={
            'text-xs px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ' +
            (esActivo(`${base}/operacion`)
              ? 'bg-slate-900 text-white hover:bg-slate-700'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white')
          }
        >
          Modo operación
        </Link>
      </div>
    </div>
  )
}
