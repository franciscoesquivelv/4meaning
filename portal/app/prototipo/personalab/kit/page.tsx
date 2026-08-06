import Link from 'next/link'
import { EXPERIENCIAS, COLUMNA_KIT, type ColumnaKit } from '../dominio'
import { Titulo, Panel, Etiqueta, th, td } from '../ui'

const COLUMNAS: ColumnaKit[] = ['objeto', 'humano', 'administrativo']

export default function KitPage() {
  const todas = EXPERIENCIAS.flatMap(e => e.kit.map(p => ({ exp: e, p })))

  return (
    <>
      <Titulo sub="La frontera de qué se replica en software y qué no. El kit es físico y humano; el software lo administra, no lo entrega.">
        Kit y fronteras
      </Titulo>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 14, marginBottom: 30 }}>
        {COLUMNAS.map(col => {
          const c = COLUMNA_KIT[col]
          const piezas = todas.filter(x => x.p.columna === col)
          const faltan = piezas.filter(x => !x.p.disponible).length
          return (
            <div
              key={col}
              style={{
                background: col === 'administrativo' ? 'rgba(0,43,52,.05)' : '#FFFFFF',
                border: `1px solid ${col === 'administrativo' ? 'rgba(0,43,52,.22)' : '#E5DED4'}`,
                borderRadius: 6,
                padding: '20px 20px',
              }}
            >
              <div style={{ fontSize: 14.5, fontWeight: 500, color: '#002B34' }}>{c.titulo}</div>
              <div style={{ fontSize: 12, color: '#8F5341', marginTop: 6, lineHeight: 1.55 }}>{c.regla}</div>
              <div style={{ fontSize: 12, color: '#6F7777', marginTop: 14 }}>
                {piezas.length} pieza{piezas.length === 1 ? '' : 's'}
                {faltan > 0 && <span style={{ color: '#8F5341' }}> · {faltan} sin resolver</span>}
              </div>
            </div>
          )
        })}
      </div>

      <Etiqueta>Todas las piezas</Etiqueta>
      <Panel pad={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 780, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, paddingLeft: 20 }}>Pieza</th>
                <th style={th}>Columna</th>
                <th style={th}>Experiencia</th>
                <th style={th}>Por persona</th>
                <th style={{ ...th, paddingRight: 20 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {todas.map(({ exp, p }) => (
                <tr key={p.id}>
                  <td style={{ ...td, paddingLeft: 20 }}>
                    <div style={{ fontWeight: 500, color: '#002B34' }}>{p.nombre}</div>
                    <div style={{ fontSize: 11.5, color: '#6F7777', marginTop: 2, maxWidth: '48ch' }}>{p.detalle}</div>
                  </td>
                  <td style={{ ...td, color: '#6F7777' }}>{COLUMNA_KIT[p.columna].titulo}</td>
                  <td style={td}>
                    <Link
                      href={`/prototipo/personalab/experiencias/${exp.id}`}
                      style={{ color: '#002B34', textDecoration: 'none' }}
                    >
                      {exp.nombre}
                    </Link>
                  </td>
                  <td style={{ ...td, color: '#6F7777' }}>{p.porPersona ? 'Sí' : '—'}</td>
                  <td style={{ ...td, paddingRight: 20 }}>
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: '.11em',
                        textTransform: 'uppercase',
                        color: p.disponible ? '#2F5D4A' : '#8F5341',
                      }}
                    >
                      {p.disponible ? 'Listo' : 'Falta'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
