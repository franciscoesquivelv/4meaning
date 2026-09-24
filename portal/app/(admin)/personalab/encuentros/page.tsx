import Link from 'next/link'
import { cargarEncuentros } from '@/lib/personalab/gestion'
import { Titulo, BotonPronto } from '../ui'
import { PASTILLA, TARJETA, BTN_PRIMARIO } from '../tokens'

function fecha(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// El enum real de `runs.estado` (`pl_estado_corrida`), no el del mock
// viejo: 'confirmada'/'corrida'/'cancelada', no 'confirmado'/'realizado'/
// 'cancelado'. Ver `lib/personalab/gestion.ts`.
const COLUMNAS: { estado: string; etiqueta: string; rotulo: string }[] = [
  { estado: 'prospecto', etiqueta: 'Prospecto', rotulo: 'text-slate-500' },
  { estado: 'confirmada', etiqueta: 'Confirmado', rotulo: 'text-blue-600' },
  { estado: 'en_preparacion', etiqueta: 'En preparación', rotulo: 'text-amber-600' },
  { estado: 'corrida', etiqueta: 'Realizado', rotulo: 'text-emerald-600' },
  { estado: 'cancelada', etiqueta: 'Cancelado', rotulo: 'text-red-500' },
]

// ETAPA "GESTIÓN CONECTADA A LA BASE REAL", 2026-09-24. Hasta aquí leía
// `dominio.ts`. Ver `lib/personalab/gestion.ts` para el porqué completo.
export default async function EncuentrosPage() {
  const r = await cargarEncuentros()

  if (r.estado === 'sin-acceso') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-ink">Sin permiso de equipo</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">
            Tu cuenta no tiene permiso de equipo sobre PersonaLab.
          </p>
          <Link href="/personalab" className={`${BTN_PRIMARIO} inline-block mt-5`}>Volver</Link>
        </div>
      </div>
    )
  }
  if (r.estado === 'fallo') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-ink">No se pudo cargar</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">{r.motivo}</p>
        </div>
      </div>
    )
  }

  const encuentros = r.datos

  return (
    <>
      <Titulo
        sub="Cada vez que un moderador realiza una experiencia con su grupo. Es la unidad de operación de PersonaLab, el equivalente al evento en Trascendencia."
        accion={<BotonPronto>+ Nuevo encuentro</BotonPronto>}
      >
        Encuentros
      </Titulo>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {COLUMNAS.map(({ estado, etiqueta, rotulo }) => {
          const items = encuentros
            .filter(c => c.estado === estado)
            .sort((a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? ''))
          return (
            <div key={estado}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${rotulo}`}>
                  {etiqueta}
                </span>
                <span className="text-[11px] text-slate-400 tabular-nums">{items.length}</span>
              </div>

              {items.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-xl px-4 py-6 text-center text-xs text-slate-400">
                  Sin encuentros
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map(c => (
                    <Link
                      key={c.id}
                      href={`/personalab/encuentros/${c.id}`}
                      className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all"
                    >
                      <div className="text-sm font-semibold text-slate-900 leading-snug">{c.experienciaNombre}</div>
                      <div className="text-xs text-slate-500 mt-1">{c.grupoNombre}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{c.fecha ? fecha(c.fecha) : 'sin fecha'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{c.moderadorNombre}</div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {c.personasEnElGrupo > 0 && (
                          <span className={`${PASTILLA} bg-slate-100 text-slate-600`}>
                            {c.personasEnElGrupo} personas
                          </span>
                        )}
                        {c.pendientes > 0 && (
                          <span className={`${PASTILLA} bg-amber-100 text-amber-700`}>
                            {c.pendientes} pendiente{c.pendientes > 1 ? 's' : ''}
                          </span>
                        )}
                        {c.estado === 'corrida' && c.mesDeRetorno != null && (
                          <span className={`${PASTILLA} bg-emerald-100 text-emerald-700`}>
                            Mes {c.mesDeRetorno} de 6
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
