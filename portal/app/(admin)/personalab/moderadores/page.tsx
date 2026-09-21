import Link from 'next/link'
import { MODERADORES, EXPERIENCIAS, ENCUENTROS, grupo } from '../dominio'
import { Titulo, Tabla, Explicativo, BotonPronto } from '../ui'
import { TD } from '../tokens'

export default function ModeradoresPage() {
  return (
    <>
      <Titulo
        sub="Quiénes tienen acceso y en qué están formados. El acceso a una experiencia se le otorga al moderador, no al foro."
        accion={<BotonPronto>+ Dar acceso</BotonPronto>}
      >
        Moderadores
      </Titulo>

      <Explicativo titulo="La formación no se sustituye con video">
        Un moderador sin formación en una experiencia no puede realizarla, aunque su grupo tenga
        licencia. La formación es presencial y no tiene versión grabada.
      </Explicativo>

      <Tabla cabeceras={['Moderador', 'Grupo', 'Formado en', 'Encuentros', 'Desde']}>
        {MODERADORES.map(m => {
          const grp = grupo(m.grupoId)!
          const suyos = ENCUENTROS.filter(c => c.moderadorId === m.id)
          return (
            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
              <td className={TD}>
                <div className="font-medium text-slate-900">{m.nombre}</div>
                <div className="text-xs text-slate-500 mt-0.5">{m.email}</div>
              </td>
              <td className={`${TD} text-slate-500`}>{grp.nombre}</td>
              <td className={TD}>
                {m.formadoEn.length === 0 ? (
                  <span className="text-xs text-amber-700">Sin formación todavía</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {m.formadoEn.map(id => {
                      const e = EXPERIENCIAS.find(x => x.id === id)!
                      return (
                        <Link
                          key={id}
                          href={`/personalab/experiencias/${id}`}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors whitespace-nowrap"
                        >
                          {e.nombre}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </td>
              <td className={`${TD} tabular-nums`}>{suyos.length}</td>
              <td className={`${TD} text-slate-500`}>{m.desde}</td>
            </tr>
          )
        })}
      </Tabla>
    </>
  )
}
