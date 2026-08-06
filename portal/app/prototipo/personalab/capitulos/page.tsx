import Link from 'next/link'
import { CAPITULOS, CORRIDAS, moderador, experiencia, fecha } from '../dominio'
import { Titulo, Panel, th, td } from '../ui'

export default function CapitulosPage() {
  return (
    <>
      <Titulo sub="Cada grupo que adopta y corre una experiencia con un moderador propio. Es la unidad de replicabilidad.">
        Capítulos
      </Titulo>

      <Panel pad={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, paddingLeft: 20 }}>Capítulo</th>
                <th style={th}>Ciudad</th>
                <th style={th}>Moderador</th>
                <th style={th}>Ha corrido</th>
                <th style={{ ...th, paddingRight: 20 }}>Siguiente</th>
              </tr>
            </thead>
            <tbody>
              {CAPITULOS.map(c => {
                const mod = moderador(c.moderadorId)!
                const suyas = CORRIDAS.filter(x => x.capituloId === c.id)
                const corridas = suyas.filter(x => x.estado === 'corrida')
                const siguiente = suyas
                  .filter(x => ['confirmada', 'en_preparacion', 'prospecto'].includes(x.estado))
                  .sort((a, b) => a.fecha.localeCompare(b.fecha))[0]
                return (
                  <tr key={c.id}>
                    <td style={{ ...td, paddingLeft: 20, fontWeight: 500, color: '#002B34' }}>{c.nombre}</td>
                    <td style={{ ...td, color: '#6F7777' }}>{c.ciudad}</td>
                    <td style={{ ...td, color: '#6F7777' }}>{mod.nombre}</td>
                    <td style={{ ...td, fontVariantNumeric: 'tabular-nums' }}>
                      {corridas.length === 0 ? <span style={{ color: '#8F5341' }}>nunca</span> : corridas.length}
                    </td>
                    <td style={{ ...td, paddingRight: 20 }}>
                      {siguiente ? (
                        <Link
                          href={`/prototipo/personalab/corridas/${siguiente.id}`}
                          style={{ color: '#002B34', textDecoration: 'none' }}
                        >
                          {experiencia(siguiente.experienciaId)!.nombre}
                          <span style={{ color: '#6F7777' }}> · {fecha(siguiente.fecha)}</span>
                        </Link>
                      ) : (
                        <span style={{ color: '#A69C90' }}>nada agendado</span>
                      )}
                    </td>
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
