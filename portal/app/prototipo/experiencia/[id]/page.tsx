import Link from 'next/link'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import {
  EXPERIENCIAS, MARCAS, PERSONAS,
  type Bisagra, type BloqueTiempo,
} from '../../data'
import SelectorPersona from '../../SelectorPersona'

// ── LA EXPERIENCIA POR DENTRO ───────────────────────────────────
// Estructurada en los tres tiempos de Renata, no en modulos ni
// lecciones. Cada bisagra declara que la sostiene: la sala, un
// objeto, o la pantalla. Nada de barras de progreso: el estado es
// "listo" o "falta", que es lo que un moderador necesita saber.

const SOPORTE: Record<Bisagra['soporte'], { etiqueta: string; nota: string }> = {
  sala:     { etiqueta: 'Sala',     nota: 'Ocurre entre personas. El software no entra.' },
  objeto:   { etiqueta: 'Objeto',   nota: 'Pieza física. El software la administra, no la entrega.' },
  pantalla: { etiqueta: 'Pantalla', nota: 'Vive aquí dentro.' },
}

function FilaBisagra({ b, dominante }: { b: Bisagra; dominante: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '76px 1fr auto',
        gap: 16,
        alignItems: 'start',
        padding: '15px 0',
        borderTop: '1px solid #E5DED4',
      }}
    >
      <span
        style={{
          fontSize: 9.5,
          letterSpacing: '.13em',
          textTransform: 'uppercase',
          color: '#6F7777',
          border: '1px solid #E5DED4',
          borderRadius: 3,
          padding: '3px 6px',
          textAlign: 'center',
          marginTop: 2,
        }}
        title={SOPORTE[b.soporte].nota}
      >
        {SOPORTE[b.soporte].etiqueta}
      </span>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 400, color: dominante }}>{b.titulo}</div>
        <div style={{ fontSize: 12.5, color: '#6F7777', marginTop: 3, lineHeight: 1.6 }}>
          {b.descripcion}
        </div>
      </div>
      <span
        style={{
          fontSize: 10,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          color: b.listo ? '#2F5D4A' : '#8F5341',
          marginTop: 3,
        }}
      >
        {b.listo ? 'Listo' : 'Falta'}
      </span>
    </div>
  )
}

function Bloque({ bloque, dominante, borde }: { bloque: BloqueTiempo; dominante: string; borde: string }) {
  const total = bloque.bisagras.length
  const listas = bloque.bisagras.filter(b => b.listo).length

  return (
    <section style={{ marginTop: 34 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
          paddingBottom: 10,
          borderBottom: `2px solid ${borde}`,
        }}
      >
        <h2 style={{ fontSize: '1.32rem', fontWeight: 200, margin: 0, color: dominante }}>
          {bloque.titulo}
        </h2>
        <span style={{ fontSize: 11.5, color: '#6F7777', fontVariantNumeric: 'tabular-nums' }}>
          {total === 0 ? 'Sin diseñar' : `${listas} de ${total} bisagras listas`}
        </span>
      </div>

      <p style={{ fontSize: 12.5, color: '#6F7777', margin: '11px 0 4px', lineHeight: 1.65, maxWidth: '62ch' }}>
        {bloque.papelSoftware}
      </p>

      {total === 0 ? (
        <div
          style={{
            marginTop: 12,
            padding: '18px 20px',
            border: '1px dashed #D8CFC2',
            borderRadius: 5,
            fontSize: 13,
            color: '#6F7777',
          }}
        >
          Este tiempo todavía no está diseñado. Es un hueco real, no un pendiente de captura.
        </div>
      ) : (
        <div style={{ marginTop: 6 }}>
          {bloque.bisagras.map(b => (
            <FilaBisagra key={b.titulo} b={b} dominante={dominante} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function ExperienciaPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { u?: string }
}) {
  const exp = EXPERIENCIAS[params.id]
  if (!exp) notFound()

  const personaId = searchParams.u ?? 'b'
  const persona = PERSONAS[personaId] ?? PERSONAS.b
  const acceso = persona.accesos.find(a => a.experienciaId === exp.id)
  const m = MARCAS[exp.marca]
  const esModerador = acceso?.titularidad === 'moderador'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 22px 80px' }}>
      <Link
        href={`/prototipo?u=${personaId}`}
        style={{ fontSize: 12.5, color: '#6F7777', textDecoration: 'none' }}
      >
        ← 4 Meaning
      </Link>

      <header
        style={{
          marginTop: 22,
          background: m.tinte,
          border: `1px solid ${m.borde}`,
          borderRadius: 6,
          padding: '28px 26px',
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: m.dominante,
            opacity: 0.7,
            fontWeight: 600,
          }}
        >
          {m.nombre}
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.8rem,4.5vw,2.5rem)',
            fontWeight: 200,
            letterSpacing: '-.015em',
            lineHeight: 1.05,
            margin: '12px 0 6px',
            color: m.dominante,
          }}
        >
          {exp.nombre}
        </h1>
        {exp.subtitulo && (
          <div style={{ fontSize: 14.5, color: '#6F7777' }}>{exp.subtitulo}</div>
        )}
        {exp.narrativa && (
          <p style={{ fontSize: 15, margin: '16px 0 0', fontStyle: 'italic', color: m.dominante, opacity: 0.85 }}>
            {exp.narrativa}
          </p>
        )}

        {acceso && (
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: `1px solid ${m.borde}`,
              display: 'flex',
              gap: '10px 26px',
              flexWrap: 'wrap',
              fontSize: 12.5,
            }}
          >
            <span>
              <b style={{ fontWeight: 500 }}>{acceso.estado}</b>
            </span>
            {acceso.capitulo && <span style={{ color: '#6F7777' }}>Capítulo {acceso.capitulo}</span>}
            {esModerador && (
              <span style={{ color: '#8F5341' }}>
                Tú lo conduces · {acceso.personasEnElForo} personas en el foro
              </span>
            )}
          </div>
        )}
      </header>

      {/* Titularidad: la diferencia estructural entre las dos marcas */}
      {esModerador && (
        <div
          style={{
            marginTop: 16,
            padding: '15px 18px',
            background: '#FFFFFF',
            border: '1px solid #E5DED4',
            borderRadius: 5,
            fontSize: 12.5,
            color: '#6F7777',
            lineHeight: 1.65,
          }}
        >
          El acceso es tuyo, no del foro. La gente que convoques no necesita cuenta.
          {exp.abreEspacioAlForo
            ? ' Esta experiencia sí admite abrir espacio a cada persona del foro si lo decides.'
            : ' Esta experiencia no abre espacio individual: todo pasa por ti.'}
        </div>
      )}

      {exp.bloques.map(b => (
        <Bloque key={b.tiempo} bloque={b} dominante={m.dominante} borde={m.borde} />
      ))}

      <Suspense fallback={null}>
        <SelectorPersona actual={personaId} />
      </Suspense>
    </div>
  )
}
