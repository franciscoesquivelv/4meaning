import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  experiencia, MADURACION, CORRIDAS, capitulo, fecha,
  ETIQUETA_TIEMPO, PAPEL_SOFTWARE, SOPORTE_NOTA, COLUMNA_KIT, ESTADO_CORRIDA,
  type Tiempo, type ColumnaKit, type Bisagra,
} from '../../dominio'
import { Badge, Panel, Etiqueta, Vacio, TarjetaLista, Fila, BotonPronto } from '../../ui'
import {
  TARJETA, BTN_PRIMARIO, BTN_SECUNDARIO, PASTILLA,
  COLOR_MADURACION, COLOR_ESTADO, COLOR_SOPORTE, AVISO,
} from '../../tokens'

const TIEMPOS: Tiempo[] = ['vispera', 'ignicion', 'retorno']
const COLUMNAS: ColumnaKit[] = ['objeto', 'humano', 'administrativo']

function FilaBisagra({ b }: { b: Bisagra }) {
  return (
    <div className="grid grid-cols-[28px_76px_1fr_auto] gap-4 items-start px-5 py-3.5 border-b border-slate-100 last:border-b-0">
      <span className="text-xs text-slate-400 tabular-nums pt-0.5">
        {String(b.orden).padStart(2, '0')}
      </span>
      <span className={`${PASTILLA} ${COLOR_SOPORTE[b.soporte]} text-center`} title={SOPORTE_NOTA[b.soporte]}>
        {b.soporte}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-900">
          {b.titulo}
          {b.duracion && <span className="text-xs text-slate-400 font-normal ml-2">{b.duracion}</span>}
        </div>
        <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{b.descripcion}</div>
        {b.requiere && b.requiere.length > 0 && (
          <div className="text-xs text-amber-700 mt-1.5">Requiere: {b.requiere.join(' · ')}</div>
        )}
      </div>
      <span className={`text-xs font-medium whitespace-nowrap pt-0.5 ${b.listo ? 'text-emerald-700' : 'text-amber-700'}`}>
        {b.listo ? 'Listo' : 'Falta'}
      </span>
    </div>
  )
}

export default function ExperienciaPage({ params }: { params: { id: string } }) {
  const e = experiencia(params.id)
  if (!e) notFound()

  const corridas = CORRIDAS.filter(c => c.experienciaId === e.id)
  const listas = e.bisagras.filter(b => b.listo).length

  return (
    <>
      <Link
        href="/prototipo/personalab/experiencias"
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        ← Experiencias
      </Link>

      <div className="flex items-start justify-between gap-6 mt-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{e.nombre}</h1>
            <Badge label={MADURACION[e.maduracion].etiqueta} cls={COLOR_MADURACION[e.maduracion]} />
          </div>
          {e.subtitulo && <p className="text-sm text-slate-500 mt-1">{e.subtitulo}</p>}
          {e.narrativa && <p className="text-base text-slate-700 italic mt-3">{e.narrativa}</p>}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <BotonPronto>Editar ficha</BotonPronto>
          <Link href={`/prototipo/personalab/experiencias/${e.id}/editor`} className={BTN_PRIMARIO}>
            Abrir editor
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-slate-500 pb-5 mb-6 border-b border-slate-200">
        <span>Duración <b className="text-slate-900 font-medium">{e.duracion}</b></span>
        <span>Ha corrido <b className="text-slate-900 font-medium">{e.corridas === 0 ? 'nunca' : `${e.corridas} vez${e.corridas > 1 ? 'ces' : ''}`}</b></span>
        <span>Espacio al foro <b className="text-slate-900 font-medium">{e.abreEspacioAlForo ? 'sí' : 'no'}</b></span>
        <span>Bisagras <b className="text-slate-900 font-medium tabular-nums">{listas} de {e.bisagras.length}</b></span>
      </div>

      {e.notaDiseño && (
        <div className={`${AVISO} mb-8`}>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">Nota de diseño</div>
          <p className="text-sm text-slate-700 leading-relaxed">{e.notaDiseño}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5">
        <div className="flex flex-col gap-5">
          <Etiqueta>El diseño</Etiqueta>
          {e.bisagras.length === 0 ? (
            <Vacio
              accion={
                <Link
                  href={`/prototipo/personalab/experiencias/${e.id}/editor`}
                  className={BTN_SECUNDARIO}
                >
                  Abrir editor
                </Link>
              }
            >
              Esta experiencia no tiene ninguna bisagra definida. No es que falte capturarla: es que no
              está diseñada. Mientras siga así, no se puede correr ni licenciar a un capítulo.
            </Vacio>
          ) : (
            TIEMPOS.map(t => {
              const bs = e.bisagras.filter(b => b.tiempo === t).sort((a, b) => a.orden - b.orden)
              const ok = bs.filter(b => b.listo).length
              return (
                <div key={t} className={TARJETA + ' overflow-hidden'}>
                  <div className="px-5 py-3.5 border-b border-slate-100">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-semibold text-slate-900">{ETIQUETA_TIEMPO[t]}</h2>
                      <span className="text-xs text-slate-400 tabular-nums">
                        {bs.length === 0 ? 'Sin bisagras' : `${ok} de ${bs.length} listas`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{PAPEL_SOFTWARE[t]}</p>
                  </div>
                  {bs.length === 0 ? (
                    <div className="px-5 py-5 text-sm text-slate-500">Este tiempo no está diseñado.</div>
                  ) : (
                    bs.map(b => <FilaBisagra key={b.id} b={b} />)
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <Etiqueta>Kit de replicabilidad</Etiqueta>
            {e.kit.length === 0 ? (
              <Vacio>Sin kit definido.</Vacio>
            ) : (
              <div className="flex flex-col gap-3">
                {COLUMNAS.map(col => {
                  const piezas = e.kit.filter(p => p.columna === col)
                  const c = COLUMNA_KIT[col]
                  return (
                    <div key={col} className={`${TARJETA} p-4`}>
                      <div className="text-sm font-semibold text-slate-900">{c.titulo}</div>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">{c.regla}</p>
                      <div className="mt-3">
                        {piezas.length === 0 && (
                          <span className="text-xs text-slate-400">Nada todavía.</span>
                        )}
                        {piezas.map(p => (
                          <div key={p.id} className="py-2 border-t border-slate-100">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm text-slate-700">{p.nombre}</span>
                              <span className={`text-xs font-medium whitespace-nowrap ${p.disponible ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {p.disponible ? 'Listo' : 'Falta'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                              {p.detalle}
                              {p.porPersona && <span className="text-slate-400"> · por persona</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <TarjetaLista titulo="Corridas">
            {corridas.length === 0 ? (
              <div className="px-5 py-5 text-sm text-slate-500">Nunca se ha corrido.</div>
            ) : (
              corridas.map(c => (
                <Fila
                  key={c.id}
                  href={`/prototipo/personalab/corridas/${c.id}`}
                  titulo={capitulo(c.capituloId)!.nombre}
                  sub={`${fecha(c.fecha)} · ${c.personasEnElForo || 'sin'} personas`}
                  derecha={<Badge label={ESTADO_CORRIDA[c.estado].etiqueta} cls={COLOR_ESTADO[c.estado]} />}
                />
              ))
            )}
          </TarjetaLista>
        </div>
      </div>
    </>
  )
}
