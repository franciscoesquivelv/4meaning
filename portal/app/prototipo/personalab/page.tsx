import Link from 'next/link'
import {
  EXPERIENCIAS, CORRIDAS, CAPITULOS, MODERADORES,
  ESTADO_CORRIDA, MADURACION, experiencia, capitulo, fecha,
} from './dominio'
import { Badge, Titulo, Etiqueta, FilaMetricas, TarjetaLista, Fila, Panel } from './ui'
import { AVISO, COLOR_ESTADO, COLOR_MADURACION } from './tokens'

export default function ResumenPage() {
  const activas = CORRIDAS.filter(c => ['confirmada', 'en_preparacion'].includes(c.estado))
  const proximas = [...activas].sort((a, b) => a.fecha.localeCompare(b.fecha))
  const enRetorno = CORRIDAS.filter(c => c.estado === 'corrida' && (c.mesDeRetorno ?? 0) < 6)
  const personasEnRetorno = enRetorno.reduce((s, c) => s + c.personasEnElForo, 0)
  const faltantes = EXPERIENCIAS.flatMap(e => e.bisagras.filter(b => !b.listo))
  const sinDiseño = EXPERIENCIAS.filter(e => e.bisagras.length === 0)

  // Lo que hay que atender antes de la proxima corrida, al estilo del
  // dashboard de Trascendencia: alertas con borde izquierdo ambar.
  const alertas = [
    ...proximas
      .filter(c => c.preparacion.some(p => !p.hecho))
      .map(c => {
        const n = c.preparacion.filter(p => !p.hecho).length
        return {
          titulo: `${n} pendiente${n > 1 ? 's' : ''} de preparación`,
          sub: `${experiencia(c.experienciaId)!.nombre} · ${capitulo(c.capituloId)!.nombre}`,
          href: `/prototipo/personalab/corridas/${c.id}`,
          accion: 'Ver corrida',
        }
      }),
    ...(faltantes.length
      ? [{
          titulo: `${faltantes.length} bisagras sin diseñar`,
          sub: 'No es captura pendiente: falta trabajo de diseño antes de poder correr',
          href: '/prototipo/personalab/experiencias',
          accion: 'Ver experiencias',
        }]
      : []),
  ]

  return (
    <>
      <Titulo sub="Lo que está corriendo, lo que viene y dónde falta diseño.">PersonaLab</Titulo>

      <FilaMetricas
        items={[
          { v: String(activas.length), k: 'Corridas por delante', href: '/prototipo/personalab/corridas' },
          { v: String(CAPITULOS.length), k: 'Capítulos', href: '/prototipo/personalab/capitulos' },
          { v: String(MODERADORES.length), k: 'Moderadores', href: '/prototipo/personalab/moderadores' },
          { v: String(personasEnRetorno), k: 'Personas en retorno', href: '/prototipo/personalab/retorno' },
        ]}
      />

      {alertas.length > 0 && (
        <div className="mb-8">
          <Etiqueta>Pendiente antes de la próxima corrida</Etiqueta>
          <div className="flex flex-col gap-2">
            {alertas.map(a => (
              <div key={a.titulo + a.sub} className={`${AVISO} flex items-center justify-between gap-4`}>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{a.titulo}</div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{a.sub}</div>
                </div>
                <Link
                  href={a.href}
                  className="bg-white border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  {a.accion}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-5">
        <div className="flex flex-col gap-5">
          <TarjetaLista titulo="Próximas corridas" verTodo={{ href: '/prototipo/personalab/corridas', label: 'Ver todas' }}>
            {proximas.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-500">Nada agendado.</div>
            ) : (
              proximas.map(c => {
                const e = experiencia(c.experienciaId)!
                const cap = capitulo(c.capituloId)!
                return (
                  <Fila
                    key={c.id}
                    href={`/prototipo/personalab/corridas/${c.id}`}
                    titulo={e.nombre}
                    sub={`${cap.nombre} · ${fecha(c.fecha)} · ${c.personasEnElForo || 'sin'} personas`}
                    derecha={<Badge label={ESTADO_CORRIDA[c.estado].etiqueta} cls={COLOR_ESTADO[c.estado]} />}
                  />
                )
              })
            )}
          </TarjetaLista>

          <TarjetaLista titulo="Huecos del catálogo" verTodo={{ href: '/prototipo/personalab/experiencias', label: 'Ver todas' }}>
            {EXPERIENCIAS.filter(e => e.bisagras.some(b => !b.listo)).map(e => (
              <Fila
                key={e.id}
                href={`/prototipo/personalab/experiencias/${e.id}`}
                titulo={e.nombre}
                sub={e.bisagras.filter(b => !b.listo).map(b => b.titulo).join(' · ')}
                derecha={
                  <span className="text-xs text-amber-700 tabular-nums whitespace-nowrap">
                    faltan {e.bisagras.filter(b => !b.listo).length}
                  </span>
                }
              />
            ))}
            {sinDiseño.map(e => (
              <Fila
                key={e.id}
                href={`/prototipo/personalab/experiencias/${e.id}`}
                titulo={e.nombre}
                sub="Sin ninguna bisagra. La experiencia entera está por diseñar."
                derecha={<span className="text-xs text-amber-700 whitespace-nowrap">sin diseño</span>}
              />
            ))}
          </TarjetaLista>
        </div>

        <div className="flex flex-col gap-5">
          <TarjetaLista titulo="Catálogo" verTodo={{ href: '/prototipo/personalab/experiencias', label: 'Ver todas' }}>
            {EXPERIENCIAS.map(e => {
              const listas = e.bisagras.filter(b => b.listo).length
              return (
                <Fila
                  key={e.id}
                  href={`/prototipo/personalab/experiencias/${e.id}`}
                  titulo={e.nombre}
                  sub={
                    (e.bisagras.length === 0 ? 'Sin bisagras' : `${listas} de ${e.bisagras.length} bisagras listas`) +
                    ' · ' + (e.corridas === 0 ? 'nunca ha corrido' : `${e.corridas} corrida${e.corridas > 1 ? 's' : ''}`)
                  }
                  derecha={<Badge label={MADURACION[e.maduracion].etiqueta} cls={COLOR_MADURACION[e.maduracion]} />}
                />
              )
            })}
          </TarjetaLista>

          <TarjetaLista titulo="En retorno" verTodo={{ href: '/prototipo/personalab/retorno', label: 'Ver todo' }}>
            {enRetorno.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-500">Nada en retorno ahora mismo.</div>
            ) : (
              enRetorno.map(c => (
                <Fila
                  key={c.id}
                  href={`/prototipo/personalab/corridas/${c.id}`}
                  titulo={experiencia(c.experienciaId)!.nombre}
                  sub={`${capitulo(c.capituloId)!.nombre} · ${c.personasEnElForo} personas`}
                  derecha={
                    <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
                      Mes {c.mesDeRetorno} de 6
                    </span>
                  }
                />
              ))
            )}
          </TarjetaLista>
        </div>
      </div>
    </>
  )
}
