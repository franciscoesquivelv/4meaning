import Link from 'next/link'
import {
  H1, SUBTITULO, ETIQUETA, TARJETA, TARJETA_PLANA,
  PASTILLA, TH, TD, VACIO, EXPLICATIVO, EXPLICATIVO_TEXTO,
} from './tokens'

export function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`${PASTILLA} ${cls}`}>{label}</span>
}

export function Titulo({
  children, sub, accion,
}: {
  children: React.ReactNode
  sub?: string
  accion?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-6 mb-6">
      <div>
        <h1 className={H1}>{children}</h1>
        {sub && <p className={`${SUBTITULO} max-w-[68ch]`}>{sub}</p>}
      </div>
      {accion && <div className="flex-shrink-0">{accion}</div>}
    </div>
  )
}

export function Etiqueta({ children }: { children: React.ReactNode }) {
  return <div className={`${ETIQUETA} mb-3`}>{children}</div>
}

export function Panel({ children, plano = false }: { children: React.ReactNode; plano?: boolean }) {
  return <div className={plano ? TARJETA_PLANA : `${TARJETA} p-5`}>{children}</div>
}

// La fila de metricas del detalle de evento: una sola caja con divisores
// verticales, no tarjetas sueltas. Ver VISTO-EN-VIVO.md seccion 5.
export function FilaMetricas({ items }: { items: { v: string; k: string; href?: string }[] }) {
  return (
    <div className={`${TARJETA} grid mb-8`} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }}>
      {items.map((it, i) => {
        const cuerpo = (
          <>
            <div className="text-[28px] leading-none font-medium text-slate-900 tabular-nums">{it.v}</div>
            <div className="text-xs text-slate-500 mt-1.5">{it.k}</div>
          </>
        )
        const clase = `px-5 py-4 ${i > 0 ? 'border-l border-slate-200' : ''}`
        return it.href ? (
          <Link key={it.k} href={it.href} className={`${clase} hover:bg-slate-50 transition-colors`}>
            {cuerpo}
          </Link>
        ) : (
          <div key={it.k} className={clase}>{cuerpo}</div>
        )
      })}
    </div>
  )
}

// Tarjeta con encabezado y enlace a la derecha, como "Familias · Ver todas →"
export function TarjetaLista({
  titulo, verTodo, children,
}: {
  titulo: string
  verTodo?: { href: string; label: string }
  children: React.ReactNode
}) {
  return (
    <div className={TARJETA_PLANA}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">{titulo}</h2>
        {verTodo && (
          <Link href={verTodo.href} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            {verTodo.label} →
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

export function Fila({
  titulo, sub, derecha, href,
}: {
  titulo: string
  sub?: string
  derecha?: React.ReactNode
  href?: string
}) {
  const cuerpo = (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-100 last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-900 truncate">{titulo}</div>
        {sub && <div className="text-xs text-slate-500 mt-0.5 truncate">{sub}</div>}
      </div>
      {derecha && <div className="flex-shrink-0">{derecha}</div>}
    </div>
  )
  return href ? (
    <Link href={href} className="block hover:bg-slate-50 transition-colors">{cuerpo}</Link>
  ) : (
    cuerpo
  )
}

export function Vacio({ children }: { children: React.ReactNode }) {
  return <div className={VACIO}>{children}</div>
}

// Caja explicativa azul, como la de Contenido progresivo.
export function Explicativo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className={`${EXPLICATIVO} mb-6`}>
      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 16v-4M12 8h.01" />
      </svg>
      <div>
        <p className="text-sm font-semibold text-blue-900 mb-1">{titulo}</p>
        <p className={EXPLICATIVO_TEXTO}>{children}</p>
      </div>
    </div>
  )
}

export function Tabla({ cabeceras, children }: { cabeceras: string[]; children: React.ReactNode }) {
  return (
    <div className={TARJETA_PLANA}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>{cabeceras.map(c => <th key={c} className={TH}>{c}</th>)}</tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}

export { TD as td, TH as th }
