import Link from 'next/link'
import { EXPERIENCIAS, MADURACION, CORRIDAS } from '../dominio'
import { Badge, Titulo, Panel, th, td } from '../ui'

export default function ExperienciasPage() {
  return (
    <>
      <Titulo sub="La biblioteca. Cada experiencia es un diseño, no un contenedor de lecciones: vive en tres tiempos y se sostiene en bisagras.">
        Experiencias
      </Titulo>

      <Panel pad={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, paddingLeft: 20 }}>Experiencia</th>
                <th style={th}>Estado</th>
                <th style={th}>Duración</th>
                <th style={th}>Bisagras</th>
                <th style={th}>Corridas</th>
                <th style={{ ...th, paddingRight: 20 }}>Espacio al foro</th>
              </tr>
            </thead>
            <tbody>
              {EXPERIENCIAS.map(e => {
                const listas = e.bisagras.filter(b => b.listo).length
                const corridasReales = CORRIDAS.filter(c => c.experienciaId === e.id && c.estado === 'corrida').length
                return (
                  <tr key={e.id}>
                    <td style={{ ...td, paddingLeft: 20 }}>
                      <Link
                        href={`/prototipo/personalab/experiencias/${e.id}`}
                        style={{ color: '#002B34', textDecoration: 'none', fontWeight: 500 }}
                      >
                        {e.nombre}
                      </Link>
                      {e.subtitulo && (
                        <div style={{ fontSize: 11.5, color: '#6F7777', marginTop: 2 }}>{e.subtitulo}</div>
                      )}
                    </td>
                    <td style={td}><Badge {...MADURACION[e.maduracion]} /></td>
                    <td style={{ ...td, color: '#6F7777' }}>{e.duracion}</td>
                    <td style={{ ...td, fontVariantNumeric: 'tabular-nums' }}>
                      {e.bisagras.length === 0 ? (
                        <span style={{ color: '#8F5341' }}>ninguna</span>
                      ) : (
                        <>
                          {listas} de {e.bisagras.length}
                          {listas < e.bisagras.length && (
                            <span style={{ color: '#8F5341' }}> · faltan {e.bisagras.length - listas}</span>
                          )}
                        </>
                      )}
                    </td>
                    <td style={{ ...td, fontVariantNumeric: 'tabular-nums' }}>
                      {corridasReales === 0 ? <span style={{ color: '#8F5341' }}>nunca</span> : corridasReales}
                    </td>
                    <td style={{ ...td, paddingRight: 20, color: '#6F7777' }}>
                      {e.abreEspacioAlForo ? 'Sí, si el moderador lo abre' : 'No, todo pasa por el moderador'}
                    </td>
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
        El acceso a una experiencia siempre se le otorga al <b style={{ color: '#14181B', fontWeight: 500 }}>moderador</b>,
        que compra para su foro. La columna de espacio al foro dice si esa experiencia además admite abrir
        acceso individual a cada persona. Se decide experiencia por experiencia, no como regla general.
      </div>
    </>
  )
}
