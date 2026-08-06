import Link from 'next/link'
import {
  EXPERIENCIAS, CORRIDAS, CAPITULOS, MODERADORES,
  ESTADO_CORRIDA, MADURACION, experiencia, capitulo, moderador, fecha,
} from './dominio'
import { Badge, Titulo, Panel, Etiqueta, Cifra, th, td } from './ui'

export default function ResumenPage() {
  const activas = CORRIDAS.filter(c => ['confirmada', 'en_preparacion'].includes(c.estado))
  const proximas = [...activas].sort((a, b) => a.fecha.localeCompare(b.fecha))
  const enRetorno = CORRIDAS.filter(c => c.estado === 'corrida' && (c.mesDeRetorno ?? 0) < 6)
  const personasEnRetorno = enRetorno.reduce((s, c) => s + c.personasEnElForo, 0)
  const sinDiseño = EXPERIENCIAS.filter(e => e.maduracion === 'diseño')

  // Bisagras que faltan, en todo el catalogo. Es el hueco real.
  const faltantes = EXPERIENCIAS.flatMap(e =>
    e.bisagras.filter(b => !b.listo).map(b => ({ exp: e, b }))
  )

  return (
    <>
      <Titulo sub="Lo que está corriendo, lo que viene y dónde falta diseño.">
        PersonaLab
      </Titulo>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>
        <Cifra v={String(activas.length)} k="Corridas por delante" href="/prototipo/personalab/corridas" />
        <Cifra v={String(CAPITULOS.length)} k="Capítulos" href="/prototipo/personalab/capitulos" />
        <Cifra v={String(MODERADORES.length)} k="Moderadores" href="/prototipo/personalab/moderadores" />
        <Cifra v={String(personasEnRetorno)} k="Personas en retorno" href="/prototipo/personalab/retorno" />
        <Cifra v={String(faltantes.length)} k="Bisagras sin diseñar" href="/prototipo/personalab/experiencias" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 20 }}>
        <div>
          <Etiqueta>Próximas corridas</Etiqueta>
          <Panel pad={0}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...th, paddingLeft: 20 }}>Experiencia</th>
                    <th style={th}>Capítulo</th>
                    <th style={th}>Fecha</th>
                    <th style={th}>Foro</th>
                    <th style={{ ...th, paddingRight: 20 }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {proximas.map(c => {
                    const e = experiencia(c.experienciaId)!
                    const cap = capitulo(c.capituloId)!
                    const est = ESTADO_CORRIDA[c.estado]
                    const pendientes = c.preparacion.filter(p => !p.hecho).length
                    return (
                      <tr key={c.id}>
                        <td style={{ ...td, paddingLeft: 20 }}>
                          <Link
                            href={`/prototipo/personalab/corridas/${c.id}`}
                            style={{ color: '#002B34', textDecoration: 'none', fontWeight: 500 }}
                          >
                            {e.nombre}
                          </Link>
                          {pendientes > 0 && (
                            <div style={{ fontSize: 11.5, color: '#8F5341', marginTop: 3 }}>
                              {pendientes} pendiente{pendientes > 1 ? 's' : ''} de preparación
                            </div>
                          )}
                        </td>
                        <td style={{ ...td, color: '#6F7777' }}>{cap.nombre}</td>
                        <td style={{ ...td, whiteSpace: 'nowrap' }}>{fecha(c.fecha)}</td>
                        <td style={{ ...td, fontVariantNumeric: 'tabular-nums' }}>
                          {c.personasEnElForo || '—'}
                        </td>
                        <td style={{ ...td, paddingRight: 20 }}>
                          <Badge {...est} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <div style={{ marginTop: 26 }}>
            <Etiqueta>Huecos del catálogo</Etiqueta>
            <Panel>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6F7777', lineHeight: 1.65 }}>
                Bisagras sin diseñar, agrupadas por experiencia. No es una lista de tareas de captura:
                es dónde falta trabajo de diseño antes de poder correr.
              </p>
              {EXPERIENCIAS.filter(e => e.bisagras.some(b => !b.listo)).map(e => (
                <div key={e.id} style={{ marginBottom: 14 }}>
                  <Link
                    href={`/prototipo/personalab/experiencias/${e.id}`}
                    style={{ fontSize: 13.5, fontWeight: 500, color: '#002B34', textDecoration: 'none' }}
                  >
                    {e.nombre}
                  </Link>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                    {e.bisagras.filter(b => !b.listo).map(b => (
                      <li key={b.id} style={{ fontSize: 12.5, color: '#6F7777', marginBottom: 3 }}>
                        {b.titulo}
                        <span style={{ color: '#A69C90' }}> · {b.tiempo === 'vispera' ? 'Víspera' : b.tiempo === 'ignicion' ? 'Ignición' : 'Retorno'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {sinDiseño.map(e => (
                <div key={e.id} style={{ marginBottom: 14 }}>
                  <Link
                    href={`/prototipo/personalab/experiencias/${e.id}`}
                    style={{ fontSize: 13.5, fontWeight: 500, color: '#002B34', textDecoration: 'none' }}
                  >
                    {e.nombre}
                  </Link>
                  <div style={{ fontSize: 12.5, color: '#8F5341', marginTop: 4 }}>
                    Sin ninguna bisagra. La experiencia entera está por diseñar.
                  </div>
                </div>
              ))}
            </Panel>
          </div>
        </div>

        <div>
          <Etiqueta>Catálogo</Etiqueta>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EXPERIENCIAS.map(e => {
              const mad = MADURACION[e.maduracion]
              const listas = e.bisagras.filter(b => b.listo).length
              return (
                <Link
                  key={e.id}
                  href={`/prototipo/personalab/experiencias/${e.id}`}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    background: '#FFFFFF',
                    border: '1px solid #E5DED4',
                    borderRadius: 6,
                    padding: '15px 17px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'start' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#002B34' }}>{e.nombre}</span>
                    <Badge {...mad} />
                  </div>
                  <div style={{ fontSize: 11.5, color: '#6F7777', marginTop: 7 }}>
                    {e.bisagras.length === 0
                      ? 'Sin bisagras definidas'
                      : `${listas} de ${e.bisagras.length} bisagras listas`}
                    {' · '}
                    {e.corridas === 0 ? 'nunca ha corrido' : `${e.corridas} corrida${e.corridas > 1 ? 's' : ''}`}
                  </div>
                </Link>
              )
            })}
          </div>

          <div style={{ marginTop: 26 }}>
            <Etiqueta>En retorno</Etiqueta>
            <Panel>
              {enRetorno.length === 0 ? (
                <span style={{ fontSize: 13, color: '#6F7777' }}>Nada en retorno ahora mismo.</span>
              ) : (
                enRetorno.map(c => {
                  const e = experiencia(c.experienciaId)!
                  const cap = capitulo(c.capituloId)!
                  return (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '9px 0',
                        borderBottom: '1px solid #EFE9E0',
                        fontSize: 13,
                      }}
                    >
                      <div>
                        <div>{e.nombre}</div>
                        <div style={{ fontSize: 11.5, color: '#6F7777' }}>
                          {cap.nombre} · {c.personasEnElForo} personas
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: '#6F7777', whiteSpace: 'nowrap' }}>
                        Mes {c.mesDeRetorno} de 6
                      </span>
                    </div>
                  )
                })
              )}
            </Panel>
          </div>
        </div>
      </div>
    </>
  )
}
