'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { PERSONAS, ORDEN_PERSONAS } from './data'

// Interruptor del prototipo: permite ver el mismo portal desde las
// distintas personas del ecosistema sin tener que autenticarse.
export default function SelectorPersona({ actual }: { actual: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function cambiar(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('u', id)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div
      style={{
        borderTop: '1px solid #E5DED4',
        marginTop: 56,
        paddingTop: 20,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: '.22em',
          textTransform: 'uppercase',
          color: '#8F5341',
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        Ver el portal como
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ORDEN_PERSONAS.map(id => {
          const p = PERSONAS[id]
          const activo = id === actual
          return (
            <button
              key={id}
              onClick={() => cambiar(id)}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                border: activo ? '1px solid #B9735A' : '1px solid #E5DED4',
                background: activo ? 'rgba(185,115,90,.08)' : '#FFFFFF',
                borderRadius: 4,
                padding: '10px 14px',
                fontFamily: 'inherit',
                fontSize: 12.5,
                color: '#14181B',
                lineHeight: 1.5,
                flex: '1 1 210px',
              }}
            >
              <span style={{ fontWeight: 500, display: 'block' }}>{p.nombre}</span>
              <span style={{ color: '#6F7777', fontSize: 11.5 }}>{p.descripcion}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
