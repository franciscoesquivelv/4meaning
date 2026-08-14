import Link from 'next/link'
import { EXPERIENCIAS, MADURACION, CORRIDAS } from '../dominio'
import { Badge, Titulo, Tabla, Explicativo, BotonPronto } from '../ui'
import { TD, COLOR_MADURACION } from '../tokens'

export default function ExperienciasPage() {
  return (
    <>
      <Titulo
        sub="La biblioteca. Cada experiencia es un diseño, no un contenedor de lecciones: vive en tres tiempos y se sostiene en bisagras."
        accion={<BotonPronto>+ Nueva experiencia</BotonPronto>}
      >
        Experiencias
      </Titulo>

      <Explicativo titulo="¿A quién se le otorga el acceso?">
        Siempre al <b>moderador</b>, que compra para su foro. La columna de espacio al foro dice si esa
        experiencia además admite abrir acceso individual a cada persona. Se decide experiencia por
        experiencia, no como regla general.
      </Explicativo>

      <Tabla cabeceras={['Experiencia', 'Estado', 'Duración', 'Bisagras', 'Corridas', 'Espacio al foro']}>
        {EXPERIENCIAS.map(e => {
          const listas = e.bisagras.filter(b => b.listo).length
          const reales = CORRIDAS.filter(c => c.experienciaId === e.id && c.estado === 'corrida').length
          return (
            <tr key={e.id} className="hover:bg-slate-50 transition-colors">
              <td className={TD}>
                <Link
                  href={`/prototipo/personalab/experiencias/${e.id}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {e.nombre}
                </Link>
                {e.subtitulo && <div className="text-xs text-slate-500 mt-0.5">{e.subtitulo}</div>}
              </td>
              <td className={TD}>
                <Badge label={MADURACION[e.maduracion].etiqueta} cls={COLOR_MADURACION[e.maduracion]} />
              </td>
              <td className={`${TD} text-slate-500`}>{e.duracion}</td>
              <td className={`${TD} tabular-nums`}>
                {e.bisagras.length === 0 ? (
                  <span className="text-amber-700">ninguna</span>
                ) : (
                  <>
                    {listas} de {e.bisagras.length}
                    {listas < e.bisagras.length && (
                      <span className="text-amber-700"> · faltan {e.bisagras.length - listas}</span>
                    )}
                  </>
                )}
              </td>
              <td className={`${TD} tabular-nums`}>
                {reales === 0 ? <span className="text-amber-700">nunca</span> : reales}
              </td>
              <td className={`${TD} text-slate-500`}>
                {e.abreEspacioAlForo ? 'Sí, si el moderador lo abre' : 'No, todo pasa por el moderador'}
              </td>
            </tr>
          )
        })}
      </Tabla>
    </>
  )
}
