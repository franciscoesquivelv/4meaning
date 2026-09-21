import Link from 'next/link'
import { GRUPOS, ENCUENTROS, moderador, experiencia, fecha } from '../dominio'
import { Titulo, Tabla, BotonPronto } from '../ui'
import { TD } from '../tokens'

export default function GruposPage() {
  return (
    <>
      <Titulo
        sub="Cada grupo que adopta y realiza una experiencia con un moderador propio. Es la unidad de replicabilidad."
        accion={<BotonPronto>+ Nuevo grupo</BotonPronto>}
      >
        Grupos
      </Titulo>

      <Tabla cabeceras={['Grupo', 'Ciudad', 'Moderador', 'Realizados', 'Siguiente']}>
        {GRUPOS.map(c => {
          const mod = moderador(c.moderadorId)!
          const suyos = ENCUENTROS.filter(x => x.grupoId === c.id)
          const realizados = suyos.filter(x => x.estado === 'realizado')
          const siguiente = suyos
            .filter(x => ['confirmado', 'en_preparacion', 'prospecto'].includes(x.estado))
            .sort((a, b) => a.fecha.localeCompare(b.fecha))[0]
          return (
            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
              <td className={`${TD} font-medium text-slate-900`}>{c.nombre}</td>
              <td className={`${TD} text-slate-500`}>{c.ciudad}</td>
              <td className={`${TD} text-slate-500`}>{mod.nombre}</td>
              <td className={`${TD} tabular-nums`}>
                {realizados.length === 0 ? <span className="text-amber-700">nunca</span> : realizados.length}
              </td>
              <td className={TD}>
                {siguiente ? (
                  <Link
                    href={`/personalab/encuentros/${siguiente.id}`}
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
