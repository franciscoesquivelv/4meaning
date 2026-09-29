import Link from 'next/link'
import { EXPERIENCIAS, COLUMNA_KIT, type ColumnaKit } from '../dominio'
import { Titulo, Tabla, Etiqueta } from '../ui'
import { TD, TARJETA } from '../tokens'

const COLUMNAS: ColumnaKit[] = ['objeto', 'humano', 'administrativo']

export default function KitPage() {
  const todas = EXPERIENCIAS.flatMap(e => e.kit.map(p => ({ exp: e, p })))

  return (
    <>
      <Titulo sub="La frontera de qué se replica en software y qué no. El kit es físico y humano; el software lo administra, no lo entrega.">
        Kit y fronteras
      </Titulo>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {COLUMNAS.map(col => {
          const c = COLUMNA_KIT[col]
          const piezas = todas.filter(x => x.p.columna === col)
          const faltan = piezas.filter(x => !x.p.disponible).length
          return (
            <div key={col} className={`${TARJETA} p-5`}>
              <div className="text-sm font-semibold text-ink">{c.titulo}</div>
              <p className="text-xs text-terra-ui mt-1.5 leading-relaxed">{c.regla}</p>
              <div className="text-xs text-gray-ui mt-3 tabular-nums">
                {piezas.length} pieza{piezas.length === 1 ? '' : 's'}
                {faltan > 0 && <span className="text-terra-ui"> · {faltan} sin resolver</span>}
              </div>
            </div>
          )
        })}
      </div>

      <Etiqueta>Todas las piezas</Etiqueta>
      <Tabla cabeceras={['Pieza', 'Columna', 'Experiencia', 'Por persona', 'Estado']}>
        {todas.map(({ exp, p }) => (
          <tr key={p.id} className="hover:bg-paper-2 transition-colors">
            <td className={TD}>
              <div className="font-medium text-ink">{p.nombre}</div>
              <div className="text-xs text-gray-ui mt-0.5 max-w-[48ch]">{p.detalle}</div>
            </td>
            <td className={`${TD} text-gray-ui`}>{COLUMNA_KIT[p.columna].titulo}</td>
            <td className={TD}>
              <Link
                href={`/personalab/experiencias/${exp.id}`}
                className="text-ink hover:underline"
              >
                {exp.nombre}
              </Link>
            </td>
            <td className={`${TD} text-gray-ui`}>{p.porPersona ? 'Sí' : ''}</td>
            <td className={TD}>
              <span className={`text-xs font-medium ${p.disponible ? 'text-bien' : 'text-terra-ui'}`}>
                {p.disponible ? 'Listo' : 'Falta'}
              </span>
            </td>
          </tr>
        ))}
      </Tabla>
    </>
  )
}
