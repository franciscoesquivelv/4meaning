import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  corrida, experiencia, capitulo, moderador, fecha,
  ESTADO_CORRIDA, ETIQUETA_TIEMPO, SOPORTE_NOTA,
} from '../../dominio'
import { Badge, Panel, Etiqueta, Vacio, th, td } from '../../ui'

// Nombres simulados del foro. En el modelo real esto sería la lista
// que el moderador carga; las personas no tienen cuenta salvo que la
// experiencia abra espacio individual.
const FORO_EJEMPLO = [
  'Alejandro Vidal', 'Bárbara Nuño', 'Carlos Iturbe', 'Daniela Sosa',
  'Emilio Cantú', 'Fernanda Ríos', 'Gonzalo Peña', 'Helena Márquez',
  'Ignacio Robles', 'Julia Sandoval', 'Karim Nasser', 'Lorena Bustos',
  'Mauricio Gil', 'Natalia Ocampo',
]

export default function CorridaPage({ params }: { params: { id: string } }) {
  const c = corrida(params.id)
  if (!c) notFound()

  const e = experiencia(c.experienciaId)!
  const cap = capitulo(c.capituloId)!
  const mod = moderador(c.moderadorId)!
  const est = ESTADO_CORRIDA[c.estado]
  const foro = FORO_EJEMPLO.slice(0, c.personasEnElForo)

  // Preparacion agrupada por fase, como el checklist de Trascendencia.
  const fases = Array.from(new Set(c.preparacion.map(p => p.fase)))
  const hechos = c.preparacion.filter(p => p.hecho).length

  const guion = e.bisagras.filter(b => b.tiempo === 'ignicion').sort((a, b) => a.orden - b.orden)
  const vispera = e.bisagras.filter(b => b.tiempo === 'vispera').sort((a, b) => a.orden - b.orden)
  const formado = mod.formadoEn.includes(e.id)

  return (
    <>
      <Link
        href="/prototipo/personalab/corridas"
        style={{ fontSize: 12.5, color: '#6F7777', textDecoration: 'none' }}
      >
        ← Corridas
      </Link>

      <div style={{ marginTop: 18, display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <h1
          style={{
            fontSize: 'clamp(1.55rem,3.3vw,2.05rem)',
            fontWeight: 200,
            letterSpacing: '-.015em',
            margin: 0,
            color: '#002B34',
          }}
        >
          {e.nombre}
        </h1>
        <Badge {...est} />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px 28px',
          flexWrap: 'wrap',
          margin: '14px 0 26px',
          paddingBottom: 18,
          borderBottom: '1px solid #E5DED4',
          fontSize: 12.5,
          color: '#6F7777',
        }}
      >
        <span>Capítulo <b style={{ color: '#14181B', fontWeight: 500 }}>{cap.nombre}</b></span>
        <span>Moderador <b style={{ color: '#14181B', fontWeight: 500 }}>{mod.nombre}</b></span>
        <span>Fecha <b style={{ color: '#14181B', fontWeight: 500 }}>{fecha(c.fecha)}</b></span>
        {c.sede && <span>Sede <b style={{ color: '#14181B', fontWeight: 500 }}>{c.sede}</b></span>}
        <span>Foro <b style={{ color: '#14181B', fontWeight: 500 }}>{c.personasEnElForo || 'sin cargar'}</b></span>
      </div>

      {!formado && (
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(122,18,32,.06)',
            border: '1px solid rgba(122,18,32,.25)',
            borderRadius: 6,
            fontSize: 13,
            color: '#7A1220',
            marginBottom: 22,
          }}
        >
          {mod.nombre} no está formado en esta experiencia. La formación es presencial y no
          tiene sustituto en video, así que esta corrida no puede confirmarse todavía.
        </div>
      )}

      {c.notas && (
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(185,115,90,.07)',
            border: '1px solid rgba(185,115,90,.26)',
            borderRadius: 6,
            fontSize: 13,
            color: '#6F7777',
            lineHeight: 1.6,
            marginBottom: 26,
            maxWidth: '72ch',
          }}
        >
          <b style={{ color: '#8F5341', fontWeight: 600 }}>Nota interna. </b>{c.notas}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(0,1fr)', gap: 22 }}>
        <div>
          {/* Preparacion */}
          <Etiqueta>Preparación · {hechos} de {c.preparacion.length}</Etiqueta>
          <Panel>
            {fases.map(f => (
              <div key={f} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 10.5,
                    letterSpacing: '.13em',
                    textTransform: 'uppercase',
                    color: '#A69C90',
                    marginBottom: 7,
                  }}
                >
                  {f}
                </div>
                {c.preparacion.filter(p => p.fase === f).map(p => (
                  <div
                    key={p.titulo}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      padding: '7px 0',
                      fontSize: 13.5,
                    }}
                  >
                    <span
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 3,
                        border: p.hecho ? '1px solid #2F5D4A' : '1px solid #D8CFC2',
                        background: p.hecho ? '#2F5D4A' : 'transparent',
                        color: '#fff',
                        fontSize: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {p.hecho ? '✓' : ''}
                    </span>
                    <span style={{ color: p.hecho ? '#6F7777' : '#14181B' }}>{p.titulo}</span>
                  </div>
                ))}
              </div>
            ))}
          </Panel>

          {/* Guion de sala */}
          <div style={{ marginTop: 26 }}>
            <Etiqueta>Guion de sala</Etiqueta>
            <Panel>
              <p style={{ margin: '0 0 14px', fontSize: 12.5, color: '#6F7777', lineHeight: 1.6 }}>
                Lo que el moderador conduce el día de la corrida. Software mudo: aquí el portal
                solo muestra el orden, no acompaña al participante.
              </p>
              {guion.length === 0 ? (
                <Vacio>Sin guion. La ignición de esta experiencia no está diseñada.</Vacio>
              ) : (
                guion.map(b => (
                  <div
                    key={b.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '26px 1fr auto',
                      gap: 12,
                      alignItems: 'start',
                      padding: '11px 0',
                      borderTop: '1px solid #EFE9E0',
                    }}
                  >
                    <span style={{ fontSize: 12, color: '#A69C90', fontVariantNumeric: 'tabular-nums' }}>
                      {String(b.orden).padStart(2, '0')}
                    </span>
                    <div>
                      <div style={{ fontSize: 13.5, color: '#002B34' }}>
                        {b.titulo}
                        {b.duracion && <span style={{ fontSize: 11.5, color: '#A69C90', marginLeft: 8 }}>{b.duracion}</span>}
                      </div>
                      {b.requiere && (
                        <div style={{ fontSize: 11.5, color: '#8F5341', marginTop: 3 }}>
                          Requiere: {b.requiere.join(' · ')}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 9.5,
                        letterSpacing: '.11em',
                        textTransform: 'uppercase',
                        color: b.listo ? '#2F5D4A' : '#8F5341',
                        whiteSpace: 'nowrap',
                      }}
                      title={SOPORTE_NOTA[b.soporte]}
                    >
                      {b.listo ? b.soporte : 'falta'}
                    </span>
                  </div>
                ))
              )}
            </Panel>
          </div>
        </div>

        <div>
          {/* El foro */}
          <Etiqueta>El foro</Etiqueta>
          <Panel>
            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#6F7777', lineHeight: 1.6 }}>
              {e.abreEspacioAlForo
                ? 'Esta experiencia admite abrir acceso individual. Hoy nadie del foro lo tiene.'
                : 'Esta experiencia no abre acceso individual. Nadie de esta lista necesita cuenta: todo pasa por el moderador.'}
            </p>
            {foro.length === 0 ? (
              <Vacio>La lista del foro todavía no se ha cargado.</Vacio>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {foro.map(n => (
                  <span
                    key={n}
                    style={{
                      fontSize: 12,
                      padding: '5px 10px',
                      background: 'rgba(0,43,52,.055)',
                      border: '1px solid rgba(0,43,52,.14)',
                      borderRadius: 20,
                      color: '#14181B',
                    }}
                  >
                    {n}
                  </span>
                ))}
              </div>
            )}
          </Panel>

          {/* Vispera */}
          <div style={{ marginTop: 24 }}>
            <Etiqueta>Víspera</Etiqueta>
            <Panel>
              {vispera.length === 0 ? (
                <Vacio>Sin víspera diseñada.</Vacio>
              ) : (
                vispera.map(b => (
                  <div key={b.id} style={{ padding: '9px 0', borderBottom: '1px solid #EFE9E0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                      <span style={{ fontSize: 13 }}>{b.titulo}</span>
                      <span
                        style={{
                          fontSize: 9.5,
                          letterSpacing: '.1em',
                          textTransform: 'uppercase',
                          color: b.listo ? '#2F5D4A' : '#8F5341',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {b.listo ? 'Listo' : 'Falta'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#6F7777', marginTop: 3, lineHeight: 1.55 }}>
                      {b.descripcion}
                    </div>
                  </div>
                ))
              )}
            </Panel>
          </div>

          {/* Retorno */}
          <div style={{ marginTop: 24 }}>
            <Etiqueta>Retorno</Etiqueta>
            <Panel>
              {c.estado !== 'corrida' ? (
                <span style={{ fontSize: 13, color: '#6F7777' }}>
                  Empieza cuando la corrida ocurra.
                </span>
              ) : (
                <>
                  <div style={{ fontSize: 15, color: '#002B34' }}>Mes {c.mesDeRetorno} de 6</div>
                  <div style={{ fontSize: 12.5, color: '#6F7777', marginTop: 6, lineHeight: 1.6 }}>
                    {c.personasEnElForo} personas acompañadas. Un solo puntero al mes,
                    sin rachas ni recordatorios de deuda.
                  </div>
                </>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </>
  )
}
