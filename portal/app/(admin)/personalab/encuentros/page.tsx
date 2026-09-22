import Link from 'next/link'
import {
  ENCUENTROS, ESTADO_ENCUENTRO, experiencia, grupo, moderador, fecha,
  type EstadoEncuentro,
} from '../dominio'
import { Titulo, BotonPronto } from '../ui'
import { PASTILLA } from '../tokens'

// Tablero por estado de pipeline, calcado del listado de eventos del admin
// real. Antes era una tabla, que es justo lo que no se parecia.

const COLUMNAS: { estado: EstadoEncuentro; rotulo: string }[] = [
  { estado: 'prospecto', rotulo: 'text-slate-500' },
  { estado: 'confirmado', rotulo: 'text-blue-600' },
  { estado: 'en_preparacion', rotulo: 'text-amber-600' },
  { estado: 'realizado', rotulo: 'text-emerald-600' },
  { estado: 'cancelado', rotulo: 'text-red-500' },
].map(c => ({ estado: c.estado as EstadoEncuentro, rotulo: c.rotulo }))

export default function EncuentrosPage() {
  return (
    <>
      <Titulo
        sub="Cada vez que un moderador realiza una experiencia con su grupo. Es la unidad de operación de PersonaLab, el equivalente al evento en Trascendencia."
        accion={<BotonPronto>+ Nuevo encuentro</BotonPronto>}
      >
        Encuentros
      </Titulo>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {COLUMNAS.map(({ estado, rotulo }) => {
          const items = ENCUENTROS
            .filter(c => c.estado === estado)
            .sort((a, b) => a.fecha.localeCompare(b.fecha))
          return (
            <div key={estado}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${rotulo}`}>
                  {ESTADO_ENCUENTRO[estado].etiqueta}
                </span>
                <span className="text-[11px] text-slate-400 tabular-nums">{items.length}</span>
              </div>

              {items.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-xl px-4 py-6 text-center text-xs text-slate-400">
                  Sin encuentros
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map(c => {
                    const e = experiencia(c.experienciaId)!
                    const grp = grupo(c.grupoId)!
                    const mod = moderador(c.moderadorId)!
                    const pendientes = c.preparacion.filter(p => !p.hecho).length
                    return (
                      <Link
                        key={c.id}
                        href={`/personalab/encuentros/${c.id}`}
                        className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all"
                      >
                        <div className="text-sm font-semibold text-slate-900 leading-snug">{e.nombre}</div>
                        <div className="text-xs text-slate-500 mt-1">{grp.nombre}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{fecha(c.fecha)}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{mod.nombre}</div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          {c.personasEnElGrupo > 0 && (
                            <span className={`${PASTILLA} bg-slate-100 text-slate-600`}>
                              {c.personasEnElGrupo} personas
                            </span>
                          )}
                          {pendientes > 0 && (
                            <span className={`${PASTILLA} bg-amber-100 text-amber-700`}>
                              {pendientes} pendiente{pendientes > 1 ? 's' : ''}
                            </span>
                          )}
                          {c.estado === 'realizado' && c.mesDeRetorno != null && (
                            <span className={`${PASTILLA} bg-emerald-100 text-emerald-700`}>
                              Mes {c.mesDeRetorno} de 6
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
