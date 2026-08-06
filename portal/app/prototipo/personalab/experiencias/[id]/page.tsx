import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  experiencia, MADURACION, CORRIDAS, capitulo, fecha,
  ETIQUETA_TIEMPO, PAPEL_SOFTWARE, SOPORTE_NOTA, COLUMNA_KIT,
  ESTADO_CORRIDA,
  type Tiempo, type ColumnaKit, type Bisagra,
} from '../../dominio'
import { Badge, Panel, Etiqueta, Vacio } from '../../ui'

const TIEMPOS: Tiempo[] = ['vispera', 'ignicion', 'retorno']
const COLUMNAS: ColumnaKit[] = ['objeto', 'humano', 'administrativo']

function FilaBisagra({ b }: { b: Bisagra }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '30px 78px 1fr auto',
        gap: 14,
        alignItems: 'start',
        padding: '14px 0',
        borderTop: '1px solid #EFE9E0',
      }}
    >
      <span style={{ fontSize: 12, color: '#A69C90', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
        {String(b.orden).padStart(2, '0')}
      </span>
      <span
        title={SOPORTE_NOTA[b.soporte]}
        style={{
          fontSize: 9.5,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: b.soporte === 'sala' ? '#8F5341' : '#6F7777',
          border: `1px solid ${b.soporte === 'sala' ? 'rgba(185,115,90,.4)' : '#E5DED4'}`,
          borderRadius: 3,
          padding: '3px 6px',
          textAlign: 'center',
          marginTop: 1,
        }}
      >
        {b.soporte}
      </span>
      <div>
        <div style={{ fontSize: 14, color: '#002B34', fontWeight: 400 }}>
          {b.titulo}
          {b.duracion && (
            <span style={{ fontSize: 11.5, color: '#A69C90', marginLeft: 9 }}>{b.duracion}</span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: '#6F7777', marginTop: 3, lineHeight: 1.6 }}>
          {b.descripcion}
        </div>
        {b.requiere && b.requiere.length > 0 && (
          <div style={{ fontSize: 11.5, color: '#8F5341', marginTop: 6 }}>
            Requiere: {b.requiere.join(' · ')}
          </div>
        )}
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

export default function ExperienciaPage({ params }: { params: { id: string } }) {
  const e = experiencia(params.id)
  if (!e) notFound()

  const corridas = CORRIDAS.filter(c => c.experienciaId === e.id)

  return (
    <>
      <Link
        href="/prototipo/personalab/experiencias"
        style={{ fontSize: 12.5, color: '#6F7777', textDecoration: 'none' }}
      >
        ← Experiencias
      </Link>

      <div style={{ marginTop: 18, marginBottom: 8, display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <h1
          style={{
            fontSize: 'clamp(1.6rem,3.4vw,2.15rem)',
            fontWeight: 200,
            letterSpacing: '-.015em',
            margin: 0,
            color: '#002B34',
          }}
        >
          {e.nombre}
        </h1>
        <Badge {...MADURACION[e.maduracion]} />
      </div>
      {e.subtitulo && <div style={{ fontSize: 14.5, color: '#6F7777' }}>{e.subtitulo}</div>}
      {e.narrativa && (
        <p style={{ fontSize: 15.5, fontStyle: 'italic', color: '#002B34', margin: '14px 0 0' }}>
          {e.narrativa}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: '10px 30px',
          flexWrap: 'wrap',
          margin: '20px 0 26px',
          paddingTop: 16,
          borderTop: '1px solid #E5DED4',
          fontSize: 12.5,
          color: '#6F7777',
        }}
      >
        <span>Duración <b style={{ color: '#14181B', fontWeight: 500 }}>{e.duracion}</b></span>
        <span>Ha corrido <b style={{ color: '#14181B', fontWeight: 500 }}>{e.corridas === 0 ? 'nunca' : `${e.corridas} vez${e.corridas > 1 ? 'ces' : ''}`}</b></span>
        <span>Espacio al foro <b style={{ color: '#14181B', fontWeight: 500 }}>{e.abreEspacioAlForo ? 'sí' : 'no'}</b></span>
      </div>

      {e.notaDiseño && (
        <div
          style={{
            padding: '15px 18px',
            background: 'rgba(185,115,90,.07)',
            border: '1px solid rgba(185,115,90,.26)',
            borderRadius: 6,
            fontSize: 13,
            color: '#6F7777',
            lineHeight: 1.65,
            marginBottom: 28,
            maxWidth: '72ch',
          }}
        >
          <b style={{ color: '#8F5341', fontWeight: 600 }}>Nota de diseño. </b>
          {e.notaDiseño}
        </div>
      )}

      {/* ── Los tres tiempos ── */}
      <Etiqueta>El diseño</Etiqueta>
      {e.bisagras.length === 0 ? (
        <Vacio>
          Esta experiencia no tiene ninguna bisagra definida. No es que falte capturarla:
          es que no está diseñada. Mientras siga así, no se puede correr ni licenciar a un capítulo.
        </Vacio>
      ) : (
        TIEMPOS.map(t => {
          const bs = e.bisagras.filter(b => b.tiempo === t).sort((a, b) => a.orden - b.orden)
          const listas = bs.filter(b => b.listo).length
          return (
            <div key={t} style={{ marginBottom: 26 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 14,
                  flexWrap: 'wrap',
                  paddingBottom: 9,
                  borderBottom: '2px solid rgba(0,43,52,.22)',
                }}
              >
                <h2 style={{ fontSize: '1.2rem', fontWeight: 200, margin: 0, color: '#002B34' }}>
                  {ETIQUETA_TIEMPO[t]}
                </h2>
                <span style={{ fontSize: 11.5, color: '#6F7777', fontVariantNumeric: 'tabular-nums' }}>
                  {bs.length === 0 ? 'Sin bisagras' : `${listas} de ${bs.length} listas`}
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: '#6F7777', margin: '10px 0 0', lineHeight: 1.6, maxWidth: '64ch' }}>
                {PAPEL_SOFTWARE[t]}
              </p>
              {bs.length === 0 ? (
                <div style={{ marginTop: 12 }}>
                  <Vacio>Este tiempo no está diseñado.</Vacio>
                </div>
              ) : (
                <div style={{ marginTop: 4 }}>
                  {bs.map(b => <FilaBisagra key={b.id} b={b} />)}
                </div>
              )}
            </div>
          )
        })
      )}

      {/* ── Kit ── */}
      <div style={{ marginTop: 36 }}>
        <Etiqueta>Kit de replicabilidad</Etiqueta>
        {e.kit.length === 0 ? (
          <Vacio>Sin kit definido.</Vacio>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
            {COLUMNAS.map(col => {
              const piezas = e.kit.filter(p => p.columna === col)
              const c = COLUMNA_KIT[col]
              return (
                <div
                  key={col}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5DED4',
                    borderRadius: 6,
                    padding: '18px 18px',
                  }}
                >
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: '#002B34' }}>{c.titulo}</div>
                  <div style={{ fontSize: 11.5, color: '#8F5341', marginTop: 5, lineHeight: 1.55 }}>
                    {c.regla}
                  </div>
                  <div style={{ marginTop: 14 }}>
                    {piezas.length === 0 && (
                      <span style={{ fontSize: 12.5, color: '#A69C90' }}>Nada todavía.</span>
                    )}
                    {piezas.map(p => (
                      <div key={p.id} style={{ padding: '9px 0', borderTop: '1px solid #EFE9E0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontSize: 13 }}>{p.nombre}</span>
                          <span
                            style={{
                              fontSize: 9.5,
                              letterSpacing: '.1em',
                              textTransform: 'uppercase',
                              color: p.disponible ? '#2F5D4A' : '#8F5341',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {p.disponible ? 'Listo' : 'Falta'}
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, color: '#6F7777', marginTop: 3, lineHeight: 1.55 }}>
                          {p.detalle}
                          {p.porPersona && <span style={{ color: '#A69C90' }}> · por persona</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Corridas de esta experiencia ── */}
      <div style={{ marginTop: 36 }}>
        <Etiqueta>Corridas</Etiqueta>
        <Panel>
          {corridas.length === 0 ? (
            <span style={{ fontSize: 13, color: '#6F7777' }}>Nunca se ha corrido.</span>
          ) : (
            corridas.map(c => {
              const cap = capitulo(c.capituloId)!
              return (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 14,
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #EFE9E0',
                  }}
                >
                  <div>
                    <Link
                      href={`/prototipo/personalab/corridas/${c.id}`}
                      style={{ fontSize: 13.5, color: '#002B34', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {cap.nombre}
                    </Link>
                    <div style={{ fontSize: 11.5, color: '#6F7777' }}>
                      {fecha(c.fecha)} · {c.personasEnElForo || 'sin'} personas
                    </div>
                  </div>
                  <Badge {...ESTADO_CORRIDA[c.estado]} />
                </div>
              )
            })
          )}
        </Panel>
      </div>
    </>
  )
}
