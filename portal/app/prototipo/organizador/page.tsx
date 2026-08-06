import Image from 'next/image'
import { Suspense } from 'react'
import { PERSONAS, MARCAS, RESUMEN_MARCA, type Marca } from '../data'
import SelectorPersona from '../SelectorPersona'

// ── PANEL DE ORGANIZADOR ────────────────────────────────────────
// Aqui el selector SI va, y es alivio y no friccion: quien opera
// varias marcas necesita elegir. Lo que ve depende de su rol por
// marca; el super admin ve las dos, el staff de marca ve la suya.

function PanelMarca({ marca }: { marca: Marca }) {
  const m = MARCAS[marca]
  // Trascendencia ya tiene su workspace construido en el portal real.
  const destino = marca === 'personalab' ? '/prototipo/personalab' : '#'
  return (
    <a
      href={destino}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        background: m.tinte,
        border: `1px solid ${m.borde}`,
        borderRadius: 6,
        padding: '26px 26px 22px',
        flex: '1 1 280px',
      }}
    >
      <h2
        style={{
          fontSize: '1.45rem',
          fontWeight: 200,
          letterSpacing: '-.01em',
          margin: '0 0 18px',
          color: m.dominante,
        }}
      >
        {m.nombre}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px' }}>
        {RESUMEN_MARCA[marca].map(x => (
          <div key={x.k}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 300,
                color: m.dominante,
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1.1,
              }}
            >
              {x.v}
            </div>
            <div style={{ fontSize: 11.5, color: '#6F7777', marginTop: 2 }}>{x.k}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 20,
          paddingTop: 14,
          borderTop: `1px solid ${m.borde}`,
          fontSize: 11,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: m.dominante,
          opacity: 0.7,
        }}
      >
        Entrar al workspace
      </div>
    </a>
  )
}

function Organizador({ personaId }: { personaId: string }) {
  const persona = PERSONAS[personaId] ?? PERSONAS.d
  const marcas = persona.operaEn ?? []

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '44px 22px 80px' }}>
      <header style={{ marginBottom: 34 }}>
        <Image
          src="/4m-logo.png"
          alt="4 Meaning"
          width={150}
          height={30}
          style={{ height: 26, width: 'auto', objectFit: 'contain' }}
          priority
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            flexWrap: 'wrap',
            marginTop: 18,
          }}
        >
          <span style={{ fontSize: 15 }}>{persona.nombre}</span>
          <span
            style={{
              fontSize: 10,
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              color: '#8F5341',
              border: '1px solid rgba(185,115,90,.4)',
              borderRadius: 3,
              padding: '3px 8px',
            }}
          >
            {persona.superAdmin ? 'Super admin' : `Equipo · ${marcas.map(x => MARCAS[x].nombre).join(', ')}`}
          </span>
        </div>
      </header>

      {marcas.length === 0 ? (
        <div
          style={{
            border: '1px solid #E5DED4',
            borderRadius: 6,
            padding: '28px 26px',
            background: '#FFFFFF',
          }}
        >
          <p style={{ margin: 0, fontSize: 15 }}>Esta cuenta no opera ninguna marca.</p>
          <p style={{ margin: '10px 0 0', fontSize: 13.5, color: '#6F7777' }}>
            Es una cuenta de participante. Su vista está en la pestaña de arriba.
          </p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13.5, color: '#6F7777', margin: '0 0 20px', maxWidth: '52ch' }}>
            {marcas.length > 1
              ? 'Operas dos marcas. Elige dónde vas a trabajar.'
              : 'Tu acceso está limitado a una marca.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {marcas.map(m => (
              <PanelMarca key={m} marca={m} />
            ))}
          </div>
        </>
      )}

      <Suspense fallback={null}>
        <SelectorPersona actual={personaId} />
      </Suspense>
    </div>
  )
}

export default function OrganizadorPage({
  searchParams,
}: {
  searchParams: { u?: string }
}) {
  return <Organizador personaId={searchParams.u ?? 'd'} />
}
