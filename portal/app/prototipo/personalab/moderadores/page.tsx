import Link from 'next/link'
import { MODERADORES, EXPERIENCIAS, CORRIDAS, capitulo } from '../dominio'
import { Titulo, Panel, th, td } from '../ui'

export default function ModeradoresPage() {
  return (
    <>
      <Titulo sub="Quiénes tienen acceso y en qué están formados. El acceso a una experiencia se le otorga al moderador, no al foro.">
        Moderadores
      </Titulo>

      <Panel pad={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, paddingLeft: 20 }}>Moderador</th>
                <th style={th}>Capítulo</th>
                <th style={th}>Formado en</th>
                <th style={th}>Corridas</th>
                <th style={{ ...th, paddingRight: 20 }}>Desde</th>
              </tr>
            </thead>
            <tbody>
              {MODERADORES.map(m => {
                const cap = capitulo(m.capituloId)!
                const suyas = CORRIDAS.filter(c => c.moderadorId === m.id)
                return (
                  <tr key={m.id}>
                    <td style={{ ...td, paddingLeft: 20 }}>
                      <div style={{ fontWeight: 500, color: '#002B34' }}>{m.nombre}</div>
                      <div style={{ fontSize: 11.5, color: '#6F7777', marginTop: 2 }}>{m.email}</div>
                    </td>
                    <td style={{ ...td, color: '#6F7777' }}>{cap.nombre}</td>
                    <td style={td}>
                      {m.formadoEn.length === 0 ? (
                        <span style={{ color: '#8F5341', fontSize: 12.5 }}>Sin formación todavía</span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {m.formadoEn.map(id => {
                            const e = EXPERIENCIAS.find(x => x.id === id)!
                            return (
                              <Link
                                key={id}
                                href={`/prototipo/personalab/experiencias/${id}`}
                                style={{
                                  fontSize: 11.5,
                                  padding: '3px 9px',
                                  borderRadius: 20,
                                  background: 'rgba(0,43,52,.07)',
                                  color: '#00404F',
                                  textDecoration: 'none',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {e.nombre}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </td>
                    <td style={{ ...td, fontVariantNumeric: 'tabular-nums' }}>{suyas.length}</td>
                    <td style={{ ...td, paddingRight: 20, color: '#6F7777' }}>{m.desde}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div
        style={{
          marginTop: 20,
          padding: '16px 18px',
          background: 'rgba(185,115,90,.07)',
          border: '1px solid rgba(185,115,90,.26)',
          borderRadius: 6,
          fontSize: 12.5,
          color: '#6F7777',
          lineHeight: 1.65,
          maxWidth: '70ch',
        }}
      >
        La formación es presencial y no tiene versión en video. Un moderador sin formación en una
        experiencia no puede correrla, aunque su capítulo tenga licencia. Claudia Merino está en
        ese caso hoy.
      </div>
    </>
  )
}
