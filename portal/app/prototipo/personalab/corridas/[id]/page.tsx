import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  corrida, experiencia, capitulo, moderador, fecha,
  ESTADO_CORRIDA, SOPORTE_NOTA,
} from '../../dominio'
import { Badge, Etiqueta, Panel, Vacio, TarjetaLista, FilaMetricas } from '../../ui'
import {
  TARJETA, BTN_PRIMARIO, BTN_SECUNDARIO, PASTILLA,
  COLOR_ESTADO, COLOR_SOPORTE, AVISO,
} from '../../tokens'

const FORO_EJEMPLO = [
  'Alejandro Vidal', 'Bárbara Nuño', 'Carlos Iturbe', 'Daniela Sosa',
  'Emilio Cantú', 'Fernanda Ríos', 'Gonzalo Peña', 'Helena Márquez',
  'Ignacio Robles', 'Julia Sandoval', 'Karim Nasser', 'Lorena Bustos',
  'Mauricio Gil', 'Natalia Ocampo',
]

const ACCIONES = [
  'Cargar lista del foro',
  'Enviar convocatoria',
  'Imprimir guion de sala',
  'Marcar como corrida',
  'Ver el kit',
]

export default function CorridaPage({ params }: { params: { id: string } }) {
  const c = corrida(params.id)
  if (!c) notFound()

  const e = experiencia(c.experienciaId)!
  const cap = capitulo(c.capituloId)!
  const mod = moderador(c.moderadorId)!
  const foro = FORO_EJEMPLO.slice(0, c.personasEnElForo)
  const fases = Array.from(new Set(c.preparacion.map(p => p.fase)))
  const hechos = c.preparacion.filter(p => p.hecho).length
  const guion = e.bisagras.filter(b => b.tiempo === 'ignicion').sort((a, b) => a.orden - b.orden)
  const vispera = e.bisagras.filter(b => b.tiempo === 'vispera').sort((a, b) => a.orden - b.orden)
  const formado = mod.formadoEn.includes(e.id)

  return (
    <>
      <Link
        href="/prototipo/personalab/corridas"
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        ← Corridas
      </Link>

      <div className="flex items-start justify-between gap-6 mt-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{e.nombre}</h1>
          <Badge label={ESTADO_CORRIDA[c.estado].etiqueta} cls={COLOR_ESTADO[c.estado]} />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button className={BTN_SECUNDARIO}>Editar</button>
          <button className={BTN_PRIMARIO}>Modo sala</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-slate-500 pb-5 mb-6 border-b border-slate-200">
        <span>Capítulo <b className="text-slate-900 font-medium">{cap.nombre}</b></span>
        <span>Moderador <b className="text-slate-900 font-medium">{mod.nombre}</b></span>
        <span>Fecha <b className="text-slate-900 font-medium">{fecha(c.fecha)}</b></span>
        {c.sede && <span>Sede <b className="text-slate-900 font-medium">{c.sede}</b></span>}
      </div>

      <FilaMetricas
        items={[
          { v: String(c.personasEnElForo || 0), k: 'En el foro' },
          { v: `${hechos} / ${c.preparacion.length}`, k: 'Preparación' },
          { v: String(guion.length), k: 'Bisagras de sala' },
          { v: c.estado === 'corrida' ? `${c.mesDeRetorno} / 6` : '—', k: 'Mes de retorno' },
        ]}
      />

      {!formado && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <p className="text-sm text-red-700">
            <b className="font-semibold">{mod.nombre} no está formado en esta experiencia.</b>{' '}
            La formación es presencial y no tiene sustituto en video, así que esta corrida no puede
            confirmarse todavía.
          </p>
        </div>
      )}

      {c.notas && (
        <div className={`${AVISO} mb-6`}>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">Nota interna</div>
          <p className="text-sm text-slate-700 leading-relaxed">{c.notas}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-5">
        <div className="flex flex-col gap-5">
          <TarjetaLista titulo={`Preparación · ${hechos} de ${c.preparacion.length}`}>
            <div className="px-5 py-4">
              {fases.map(f => (
                <div key={f} className="mb-4 last:mb-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{f}</div>
                  {c.preparacion.filter(p => p.fase === f).map(p => (
                    <div key={p.titulo} className="flex items-center gap-3 py-1.5">
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                          p.hecho ? 'bg-emerald-600' : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {p.hecho && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className={`text-sm ${p.hecho ? 'text-slate-400' : 'text-slate-700'}`}>{p.titulo}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </TarjetaLista>

          <TarjetaLista titulo="Guion de sala">
            <div className="px-5 py-3 border-b border-slate-100">
              <p className="text-xs text-slate-500 leading-relaxed">
                Lo que el moderador conduce el día de la corrida. Software mudo: el portal solo muestra el
                orden, no acompaña al participante.
              </p>
            </div>
            {guion.length === 0 ? (
              <div className="px-5 py-5 text-sm text-slate-500">
                Sin guion. La ignición de esta experiencia no está diseñada.
              </div>
            ) : (
              guion.map(b => (
                <div key={b.id} className="grid grid-cols-[28px_1fr_auto] gap-3 items-start px-5 py-3 border-b border-slate-100 last:border-b-0">
                  <span className="text-xs text-slate-400 tabular-nums pt-0.5">
                    {String(b.orden).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="text-sm text-slate-900">
                      {b.titulo}
                      {b.duracion && <span className="text-xs text-slate-400 ml-2">{b.duracion}</span>}
                    </div>
                    {b.requiere && (
                      <div className="text-xs text-amber-700 mt-0.5">Requiere: {b.requiere.join(' · ')}</div>
                    )}
                  </div>
                  <span
                    className={`${PASTILLA} ${b.listo ? COLOR_SOPORTE[b.soporte] : 'bg-amber-100 text-amber-700'}`}
                    title={SOPORTE_NOTA[b.soporte]}
                  >
                    {b.listo ? b.soporte : 'falta'}
                  </span>
                </div>
              ))
            )}
          </TarjetaLista>
        </div>

        <div className="flex flex-col gap-5">
          <div className={`${TARJETA} p-5`}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Acciones</div>
            <Link href={`/prototipo/lector/${c.id}`} className={`${BTN_PRIMARIO} w-full block text-center mb-2`}>
              Ver como participante
            </Link>
            <Link
              href={`/prototipo/lector/${c.id}?lente=moderador`}
              className={`${BTN_SECUNDARIO} w-full block text-left mb-2`}
            >
              Ver como moderador
            </Link>
            <div className="flex flex-col gap-2">
              {ACCIONES.map(a => (
                <button key={a} className={`${BTN_SECUNDARIO} w-full text-left`}>{a}</button>
              ))}
            </div>
          </div>

          <TarjetaLista titulo="El foro">
            <div className="px-5 py-4">
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                {e.abreEspacioAlForo
                  ? 'Esta experiencia admite abrir acceso individual. Hoy nadie del foro lo tiene.'
                  : 'Esta experiencia no abre acceso individual. Nadie de esta lista necesita cuenta: todo pasa por el moderador.'}
              </p>
              {foro.length === 0 ? (
                <Vacio>La lista del foro todavía no se ha cargado.</Vacio>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {foro.map(n => (
                    <span key={n} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {n}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </TarjetaLista>

          <TarjetaLista titulo="Víspera">
            {vispera.length === 0 ? (
              <div className="px-5 py-5 text-sm text-slate-500">Sin víspera diseñada.</div>
            ) : (
              vispera.map(b => (
                <div key={b.id} className="px-5 py-3 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-slate-900">{b.titulo}</span>
                    <span className={`text-xs font-medium whitespace-nowrap ${b.listo ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {b.listo ? 'Listo' : 'Falta'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{b.descripcion}</div>
                </div>
              ))
            )}
          </TarjetaLista>
        </div>
      </div>
    </>
  )
}
