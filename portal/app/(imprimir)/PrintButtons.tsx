'use client'

export function PrintButton({ label = 'Imprimir / Guardar PDF' }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: '8px 20px', background: '#111', color: '#fff',
        border: 'none', borderRadius: 8, cursor: 'pointer',
        fontFamily: 'sans-serif', fontSize: 13, fontWeight: 600,
      }}
    >
      {label}
    </button>
  )
}

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      style={{
        padding: '8px 14px', background: '#f1f5f9', color: '#475569',
        border: 'none', borderRadius: 8, cursor: 'pointer',
        fontFamily: 'sans-serif', fontSize: 13,
      }}
    >
      ← Volver
    </button>
  )
}
