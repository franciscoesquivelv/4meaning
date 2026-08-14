import Link from 'next/link'
import {
  H1, SUBTITULO, ETIQUETA, TARJETA, TARJETA_PLANA,
  PASTILLA, TH, TD, VACIO, VACIO_NEUTRO, EXPLICATIVO, EXPLICATIVO_TEXTO,
  BTN_PRIMARIO, BTN_SECUNDARIO, BTN_FILA, BTN_PELIGRO, BTN_PRONTO,
} from './tokens'

export function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`${PASTILLA} ${cls}`}>{label}</span>
}

// ── Feedback de accion ──────────────────────────────────────────
//
// Un boton tiene cuatro momentos y hasta ahora solo se dibujaba uno. Estos
// dos componentes existen para que los otros tres no haya que volver a
// escribirlos en cada pantalla.

export function Girador({ claro = false }: { claro?: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 animate-spin flex-shrink-0 ${claro ? 'text-white/80' : 'text-slate-400'}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function Palomita() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={3} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

const VARIANTE = {
  primario: BTN_PRIMARIO,
  secundario: BTN_SECUNDARIO,
  fila: BTN_FILA,
  peligro: BTN_PELIGRO,
  pronto: BTN_PRONTO,
} as const

export function Boton({
  variante = 'secundario',
  cargando = false,
  listo = false,
  textoCargando,
  textoListo,
  children,
  className = '',
  ...props
}: {
  variante?: keyof typeof VARIANTE
  cargando?: boolean
  listo?: boolean
  textoCargando?: string
  textoListo?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const claro = variante === 'primario'
  // El destello de exito solo tiene sentido sobre el primario: en los demas
  // el cambio de color pesa mas que la accion que lo produjo.
  const exito = listo && variante === 'primario' ? ' !bg-emerald-600 hover:!bg-emerald-600' : ''
  return (
    <button
      {...props}
      disabled={props.disabled || cargando}
      aria-busy={cargando || undefined}
      className={`${VARIANTE[variante]} ${className}${exito}`}
    >
      {cargando && <Girador claro={claro} />}
      {listo && !cargando && <Palomita />}
      {cargando ? (textoCargando ?? children) : listo ? (textoListo ?? children) : children}
    </button>
  )
}

// Lo que todavia no se construyo. Se dice, no se finge.
export function BotonPronto({ children }: { children: React.ReactNode }) {
  return (
    <button className={BTN_PRONTO} disabled title="Todavía no está construido">
      {children}
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
        pronto
      </span>
    </button>
  )
}

// ── Esqueletos ──────────────────────────────────────────────────
//
// La forma del esqueleto tiene que ser la forma real de la pantalla. Si no
// calza con lo que llega despues, el salto se siente peor que el vacio.

export function EsqueletoEditor() {
  return (
    <div
      className="grid grid-cols-1 xl:grid-cols-[210px_minmax(0,1fr)_375px] gap-6 items-start animate-pulse"
      aria-busy="true"
      aria-label="Cargando el editor"
    >
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3, 4].map(i => <div key={i} className="h-11 bg-slate-200/70 rounded-lg" />)}
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-6 w-2/5 bg-slate-200/70 rounded" />
        <div className="h-4 w-3/5 bg-slate-100 rounded mb-3" />
        {[0, 1, 2].map(i => (
          <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="mx-auto w-[375px] h-[620px] rounded-[40px] border-4 border-slate-200 bg-slate-100" />
    </div>
  )
}

export function EsqueletoTabla({ filas = 5, columnas = 5 }: { filas?: number; columnas?: number }) {
  return (
    <div className={`${TARJETA_PLANA} animate-pulse`} aria-busy="true" aria-label="Cargando">
      {Array.from({ length: filas }).map((_, f) => (
        <div
          key={f}
          className="grid gap-5 px-5 py-4 border-b border-slate-100 last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0,1fr))` }}
        >
          {Array.from({ length: columnas }).map((_, c) => (
            <div key={c} className={`h-4 rounded bg-slate-100 ${c === 0 ? 'w-4/5' : 'w-1/2'}`} />
          ))}
        </div>
      ))}
    </div>
  )
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

// Un vacio que ES un problema lleva caja punteada y, si existe, la accion
// que lo resuelve DENTRO de la caja. Ponerla lejos es decirle a alguien que
// le falta algo y no decirle donde esta.
export function Vacio({
  children, accion, neutro = false,
}: {
  children: React.ReactNode
  accion?: React.ReactNode
  neutro?: boolean
}) {
  if (neutro) return <div className={VACIO_NEUTRO}>{children}</div>
  return (
    <div className={VACIO}>
      {children}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
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
