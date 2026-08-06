import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { PERSONAS, MARCAS, ETIQUETA_TIEMPO, type Acceso } from './data'
import SelectorPersona from './SelectorPersona'

// ── EL VESTIBULO ────────────────────────────────────────────────
// Reglas de forma acordadas en el Consejo #002:
//  · No es un selector de marcas. Es un vestibulo con contenido:
//    las tarjetas informan estado, no ofrecen marcas.
//  · El logo de la linea va como firma inferior, nunca como boton.
//  · Puerta unica: con un solo acceso el vestibulo se atraviesa en
//    segundos y jamas se muestra un catalogo con candados.
//  · Segundo cruce: la casa se vuelve habitable con dos experiencias.
//  · El vestibulo nombra a quien invito.
//  · La casa se presenta como pregunta, no como marca.

function Tarjeta({ acceso, unico, personaId }: { acceso: Acceso; unico: boolean; personaId: string }) {
  const m = MARCAS[acceso.marca]
  const esModerador = acceso.titularidad === 'moderador'

  return (
    <Link
      href={`/prototipo/experiencia/${acceso.experienciaId}?u=${personaId}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        background: m.tinte,
        border: `1px solid ${m.borde}`,
        borderRadius: 6,
        padding: unico ? '30px 28px 22px' : '24px 24px 18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: m.dominante,
            opacity: 0.75,
            fontWeight: 600,
          }}
        >
          {ETIQUETA_TIEMPO[acceso.tiempo]}
        </span>
        {esModerador && (
          <span
            style={{
              fontSize: 9.5,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: '#8F5341',
              border: '1px solid rgba(185,115,90,.45)',
              borderRadius: 3,
              padding: '2px 7px',
            }}
          >
            Tú lo conduces
          </span>
        )}
      </div>

      <h2
        style={{
          fontSize: unico ? 'clamp(1.7rem,4.5vw,2.3rem)' : '1.3rem',
          fontWeight: 200,
          letterSpacing: '-.01em',
          lineHeight: 1.1,
          margin: '0 0 10px',
          color: m.dominante,
        }}
      >
        {acceso.experienciaId === 'trascendencia' ? 'Trascendencia' : null}
        {acceso.experienciaId === 'metamorfosis' ? 'Metamorfosis y Metanoia' : null}
        {acceso.experienciaId === 'presente-regalo' ? 'El Presente como Regalo' : null}
      </h2>

      <div style={{ fontSize: 15, marginBottom: 4 }}>{acceso.estado}</div>
      <div style={{ fontSize: 13, color: '#6F7777' }}>
        {acceso.detalle}
        {acceso.personasEnElForo ? ` · ${acceso.personasEnElForo} personas` : ''}
      </div>

      {acceso.invitadoPor && (
        <div style={{ fontSize: 12.5, color: '#6F7777', marginTop: 12, fontStyle: 'italic' }}>
          {acceso.invitadoPor}
        </div>
      )}

      {/* Firma inferior de la linea. Nunca es boton. */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 14,
          borderTop: `1px solid ${m.borde}`,
          fontSize: 10,
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          color: m.dominante,
          opacity: 0.6,
        }}
      >
        {m.nombre}
      </div>
    </Link>
  )
}

function Vestibulo({ personaId }: { personaId: string }) {
  const persona = PERSONAS[personaId] ?? PERSONAS.a
  const accesos = persona.accesos
  const unico = accesos.length === 1
  const habitable = accesos.length >= 2   // regla del segundo cruce

  return (
    <div style={{ maxWidth: 660, margin: '0 auto', padding: '44px 22px 80px' }}>
      {/* La casa: lockup real, nunca el nombre escrito como texto */}
      <header style={{ marginBottom: unico ? 30 : 40 }}>
        <Image
          src="/4m-logo.png"
          alt="4 Meaning"
          width={150}
          height={30}
          style={{ height: 26, width: 'auto', objectFit: 'contain' }}
          priority
        />
        <p
          style={{
            fontSize: 14,
            color: '#6F7777',
            margin: '18px 0 0',
            maxWidth: '42ch',
            lineHeight: 1.6,
          }}
        >
          {habitable
            ? `Hola ${persona.nombre.split(' ')[0]}. Esto es lo que tienes abierto ahora mismo.`
            : `Hola ${persona.nombre.split(' ')[0]}.`}
        </p>
      </header>

      {accesos.length === 0 && (
        <div
          style={{
            border: '1px solid #E5DED4',
            borderRadius: 6,
            padding: '28px 26px',
            background: '#FFFFFF',
          }}
        >
          <p style={{ margin: 0, fontSize: 15 }}>
            Todavía no hay ninguna experiencia abierta a tu nombre.
          </p>
          <p style={{ margin: '10px 0 0', fontSize: 13.5, color: '#6F7777' }}>
            {persona.operaEn
              ? 'Tu cuenta es de equipo. El panel de organizador está en la pestaña de arriba.'
              : 'Cuando tu coordinadora abra tu acceso, aparecerá aquí.'}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {accesos.map(a => (
          <Tarjeta key={a.id} acceso={a} unico={unico} personaId={personaId} />
        ))}
      </div>

      {/* La casa se presenta como pregunta, no como marca.
          Y solo cuando ya hay algo que sostenerla. */}
      {accesos.length > 0 && (
        <p
          style={{
            marginTop: 30,
            fontSize: 13,
            color: '#6F7777',
            lineHeight: 1.7,
            maxWidth: '46ch',
          }}
        >
          {habitable
            ? 'Trascendencia y PersonaLab son dos formas de la misma búsqueda. Las dos viven aquí.'
            : 'Esto que vas a vivir tiene una casa. Ya la conocerás.'}
        </p>
      )}

      <Suspense fallback={null}>
        <SelectorPersona actual={personaId} />
      </Suspense>
    </div>
  )
}

export default function PrototipoPage({
  searchParams,
}: {
  searchParams: { u?: string }
}) {
  return <Vestibulo personaId={searchParams.u ?? 'b'} />
}
