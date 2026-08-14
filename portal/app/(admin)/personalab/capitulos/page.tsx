import Link from 'next/link'
import { CAPITULOS, CORRIDAS, moderador, experiencia, fecha } from '../dominio'
import { Titulo, Tabla, BotonPronto } from '../ui'
import { TD } from '../tokens'

export default function CapitulosPage() {
  return (
    <>
      <Titulo
        sub="Cada grupo que adopta y corre una experiencia con un moderador propio. Es la unidad de replicabilidad."
        accion={<BotonPronto>+ Nuevo capítulo</BotonPronto>}
      >
        Capítulos
      </Titulo>

      <Tabla cabeceras={['Capítulo', 'Ciudad', 'Moderador', 'Ha corrido', 'Siguiente']}>
        {CAPITULOS.map(c => {
          const mod = moderador(c.moderadorId)!
          const suyas = CORRIDAS.filter(x => x.capituloId === c.id)
          const corridas = suyas.filter(x => x.estado === 'corrida')
          const siguiente = suyas
            .filter(x => ['confirmada', 'en_preparacion', 'prospecto'].includes(x.estado))
            .sort((a, b) => a.fecha.localeCompare(b.fecha))[0]
          return (
            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
              <td className={`${TD} font-medium text-slate-900`}>{c.nombre}</td>
              <td className={`${TD} text-slate-500`}>{c.ciudad}</td>
              <td className={`${TD} text-slate-500`}>{mod.nombre}</td>
              <td className={`${TD} tabular-nums`}>
                {corridas.length === 0 ? <span className="text-amber-700">nunca</span> : corridas.length}
              </td>
              <td className={TD}>
                {siguiente ? (
                  <Link
                    href={`/personalab/corridas/${siguiente.id}`}
                    className="text-slate-900 hover:underline"
                  >
                    {experiencia(siguiente.experienciaId)!.nombre}
                    <span className="text-slate-400"> · {fecha(siguiente.fecha)}</span>
                  </Link>
                ) : (
                  <span className="text-slate-400">nada agendado</span>
                )}
              </td>
            </tr>
          )
        })}
      </Tabla>
    </>
  )
}
