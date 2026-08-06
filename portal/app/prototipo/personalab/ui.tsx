import Link from 'next/link'

export function Badge({ etiqueta, fondo, texto }: { etiqueta: string; fondo: string; texto: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 20,
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: '.04em',
        background: fondo,
        color: texto,
        whiteSpace: 'nowrap',
      }}
    >
      {etiqueta}
    </span>
  )
}

export function Titulo({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1
        style={{
          fontSize: 'clamp(1.5rem,3.2vw,2rem)',
          fontWeight: 200,
          letterSpacing: '-.015em',
          margin: 0,
          color: '#14181B',
        }}
      >
        {children}
      </h1>
      {sub && <p style={{ margin: '8px 0 0', fontSize: 13.5, color: '#6F7777', maxWidth: '62ch' }}>{sub}</p>}
    </div>
  )
}

export function Panel({ children, pad = 22 }: { children: React.ReactNode; pad?: number }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5DED4',
        borderRadius: 6,
        padding: pad,
      }}
    >
      {children}
    </div>
  )
}

export function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: '.18em',
        textTransform: 'uppercase',
        color: '#8F5341',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  )
}

export function Cifra({ v, k, href }: { v: string; k: string; href?: string }) {
  const cuerpo = (
    <>
      <div
        style={{
          fontSize: 27,
          fontWeight: 300,
          color: '#002B34',
          lineHeight: 1.05,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {v}
      </div>
      <div style={{ fontSize: 11.5, color: '#6F7777', marginTop: 4 }}>{k}</div>
    </>
  )
  const estilo: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #E5DED4',
    borderRadius: 6,
    padding: '18px 20px',
    flex: '1 1 150px',
    textDecoration: 'none',
    display: 'block',
    color: 'inherit',
  }
  return href ? <Link href={href} style={estilo}>{cuerpo}</Link> : <div style={estilo}>{cuerpo}</div>
}

export function Vacio({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: '1px dashed #D8CFC2',
        borderRadius: 6,
        padding: '22px 22px',
        fontSize: 13.5,
        color: '#6F7777',
        lineHeight: 1.65,
      }}
    >
      {children}
    </div>
  )
}

export const th: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 9.5,
  letterSpacing: '.13em',
  textTransform: 'uppercase',
  color: '#6F7777',
  fontWeight: 600,
  padding: '0 14px 10px 0',
  borderBottom: '1px solid #E5DED4',
  whiteSpace: 'nowrap',
}

export const td: React.CSSProperties = {
  padding: '13px 14px 13px 0',
  borderBottom: '1px solid #EFE9E0',
  verticalAlign: 'middle',
  fontSize: 13.5,
}
