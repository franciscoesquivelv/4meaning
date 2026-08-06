import Link from 'next/link'
import { CORRIDAS, ESTADO_CORRIDA, experiencia, capitulo, moderador, fecha } from '../dominio'
import { Badge, Titulo, Panel, th, td } from '../ui'

export default function CorridasPage() {
  const orden = [...CORRIDAS].sort((a, b) => b.fecha.localeCompare(a.fecha))

  return (
    <>
      <Titulo sub="Cada vez que un moderador corre una experiencia con su foro. Es la unidad de operación de PersonaLab, el equivalente al evento en Trascendencia.">
        Corridas
      </Titulo>

      <Panel pad={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 780, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, paddingLeft: 20 }}>Experiencia</th>
                <th style={th}>Capítulo</th>
                <th style={th}>Moderador</th>
                <th style={th}>Fecha</th>
                <th style={th}>Foro</th>
                <th style={th}>Preparación</th>
                <th style={{ ...th, paddingRight: 20 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orden.map(c => {
                const e = experiencia(c.experienciaId)!
                const cap = capitulo(c.capituloId)!
                const mod = moderador(c.moderadorId)!
                const hechos = c.preparacion.filter(p => p.hecho).length
                const total = c.preparacion.length
                return (
                  <tr key={c.id}>
                    <td style={{ ...td, paddingLeft: 20 }}>
                      <Link
                        href={`/prototipo/personalab/corridas/${c.id}`}
                        style={{ color: '#002B34', textDecoration: 'none', fontWeight: 500 }}
                      >
                        {e.nombre}
                      </Link>
                    </td>
                    <td style={{ ...td, color: '#6F7777' }}>{cap.nombre}</td>
                    <td style={{ ...td, color: '#6F7777' }}>{mod.nombre}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{fecha(c.fecha)}</td>
                    <td style={{ ...td, fontVariantNumeric: 'tabular-nums' }}>{c.personasEnElForo || '—'}</td>
                    <td style={{ ...td, fontVariantNumeric: 'tabular-nums', color: hechos === total ? '#2F5D4A' : '#8F5341' }}>
                      {hechos} de {total}
                    </td>
                    <td style={{ ...td, paddingRight: 20 }}><Badge {...ESTADO_CORRIDA[c.estado]} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
