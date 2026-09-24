import Link from 'next/link'
import { cargarEncuentro } from '@/lib/personalab/gestion'
import { Badge, Vacio, TarjetaLista, FilaMetricas, BotonPronto } from '../../ui'
import {
  TARJETA, BTN_SECUNDARIO, BTN_PRIMARIO, PASTILLA,
  COLOR_ESTADO, COLOR_SOPORTE, AVISO,
} from '../../tokens'

const ETIQUETA_ESTADO: Record<string, string> = {
  prospecto: 'Prospecto', confirmada: 'Confirmado', en_preparacion: 'En preparación',
  corrida: 'Realizado', cancelada: 'Cancelado',
}
const SOPORTE_NOTA: Record<string, string> = {
  sala: 'Ocurre entre personas. El software no entra.',
  objeto: 'Pieza física. El software la administra, no la entrega.',
  pantalla: 'Vive dentro del portal.',
}

const ACCIONES = [
  'Cargar lista del grupo',
  'Enviar convocatoria',
  'Imprimir guion de sala',
  'Marcar como realizado',
  'Ver el kit',
]

function fecha(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ETAPA "GESTIÓN CONECTADA A LA BASE REAL", 2026-09-24. Hasta aquí leía
// `dominio.ts`, incluida una lista de CATORCE NOMBRES INVENTADOS
// (`GRUPO_EJEMPLO`) para "El grupo" -- ni siquiera fingía ser del grupo
// real, era literal texto de relleno. Ahora esa sección usa los grants
// reales `titularidad='miembro_foro'` de este encuentro: si nadie tiene
// acceso individual todavía, dice exactamente eso, no catorce personas
// que no existen. Ver `lib/personalab/gestion.ts` para el resto.
export default async function EncuentroPage({ params }: { params: { id: string } }) {
  const r = await cargarEncuentro(params.id)

  if (r.estado === 'sin-acceso') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-ink">No encontrado</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">
            Este encuentro no existe o tu cuenta no tiene permiso de equipo.
          </p>
          <Link href="/personalab/encuentros" className={`${BTN_PRIMARIO} inline-block mt-5`}>Volver</Link>
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

  const c = r.datos
  const fases = Array.from(new Set(c.checklist.map(p => p.fase ?? 'Sin fase')))

  return (
    <>
      <Link
        href="/personalab/encuentros"
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        ← Encuentros
      </Link>

      <div className="flex items-start justify-between gap-6 mt-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{c.experienciaNombre}</h1>
          <Badge label={ETIQUETA_ESTADO[c.estado] ?? c.estado} cls={COLOR_ESTADO[c.estado] ?? COLOR_ESTADO.prospecto} />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <BotonPronto>Editar</BotonPronto>
          <BotonPronto>Modo sala</BotonPronto>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-slate-500 pb-5 mb-6 border-b border-slate-200">
        <span className="text-slate-900 font-medium">{c.grupoNombre}</span>
        <span>Moderador <b className="text-slate-900 font-medium">{c.moderadorNombre}</b></span>
        <span>Fecha <b className="text-slate-900 font-medium">{c.fecha ? fecha(c.fecha) : 'sin fecha'}</b></span>
        {c.sede && <span>Sede <b className="text-slate-900 font-medium">{c.sede}</b></span>}
      </div>

      <FilaMetricas
        items={[
          { v: String(c.personasEnElGrupo || 0), k: 'En el grupo' },
          { v: `${c.totalChecklist - c.pendientes} / ${c.totalChecklist}`, k: 'Preparación' },
          { v: String(c.guion.length), k: 'Bisagras de sala' },
          { v: c.estado === 'corrida' ? `${c.mesDeRetorno ?? 0} / 6` : 'sin retorno', k: 'Mes de retorno' },
        ]}
      />

      {!c.moderadorFormado && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <p className="text-sm text-red-700">
            <b className="font-semibold">{c.moderadorNombre} no está formado en esta experiencia.</b>{' '}
            La formación es presencial y no tiene sustituto en video, así que este encuentro no puede
            confirmarse todavía.
          </p>
          <p className="text-xs text-red-600 mt-2 leading-relaxed">
            Lo que sigue es agendar su formación con el equipo. Todavía no se agenda desde aquí:
            escríbele a quien lleve la formación y vuelve a esta pantalla cuando esté hecha.
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
          <TarjetaLista titulo={`Preparación · ${c.totalChecklist - c.pendientes} de ${c.totalChecklist}`}>
            {c.checklist.length === 0 ? (
              <div className="px-5 py-5 text-sm text-slate-500">Sin checklist todavía.</div>
            ) : (
              <div className="px-5 py-4">
                {fases.map(f => (
                  <div key={f} className="mb-4 last:mb-0">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{f}</div>
                    {c.checklist.filter(p => (p.fase ?? 'Sin fase') === f).map(p => (
                      <div key={p.id} className="flex items-center gap-3 py-1.5">
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
            )}
          </TarjetaLista>

          <TarjetaLista titulo="Guion de sala">
            <div className="px-5 py-3 border-b border-slate-100">
              <p className="text-xs text-slate-500 leading-relaxed">
                Lo que el moderador conduce el día del encuentro. Software mudo: el portal solo muestra el
                orden, no acompaña al participante.
              </p>
            </div>
            {c.guion.length === 0 ? (
              <div className="px-5 py-5 text-sm text-slate-500">
                Sin guion. La ignición de esta experiencia no está diseñada.
              </div>
            ) : (
              c.guion.map(b => (
                <div key={b.id} className="grid grid-cols-[28px_1fr_auto] gap-3 items-start px-5 py-3 border-b border-slate-100 last:border-b-0">
                  <span className="text-xs text-slate-400 tabular-nums pt-0.5">
                    {String(b.orden).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="text-sm text-slate-900">
                      {b.titulo}
                      {b.duracion && <span className="text-xs text-slate-400 ml-2">{b.duracion}</span>}
                    </div>
                    {b.requiere && b.requiere.length > 0 && (
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
            <Link
              href={`/personalab/vista/${c.id}`}
              className={`${BTN_SECUNDARIO} w-full mb-2`}
            >
              Ver como participante
            </Link>
            <Link
              href={`/personalab/vista/${c.id}?lente=moderador`}
              className={`${BTN_SECUNDARIO} w-full mb-4`}
            >
              Ver como moderador
            </Link>
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Todavía no
              </div>
              <ul className="text-sm text-slate-400 space-y-1.5">
                {ACCIONES.map(a => <li key={a}>{a}</li>)}
              </ul>
            </div>
          </div>

          <TarjetaLista titulo="El grupo">
            <div className="px-5 py-4">
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                {c.abreEspacioAlGrupo
                  ? 'Esta experiencia admite abrir acceso individual.'
                  : 'Esta experiencia no abre acceso individual. Nadie de esta lista necesita cuenta: todo pasa por el moderador.'}
              </p>
              {c.integrantes.length === 0 ? (
                <Vacio neutro>Nadie del grupo tiene acceso individual todavía.</Vacio>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {c.integrantes.map(i => (
                    <span key={i.profileId} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {i.nombre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </TarjetaLista>

          <TarjetaLista titulo="Víspera">
            {c.vispera.length === 0 ? (
              <div className="px-5 py-5 text-sm text-slate-500">Sin víspera diseñada.</div>
            ) : (
              c.vispera.map(b => (
                <div key={b.id} className="px-5 py-3 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-slate-900">{b.titulo}</span>
                    <span className={`text-xs font-medium whitespace-nowrap ${b.listo ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {b.listo ? 'Listo' : 'Falta'}
                    </span>
                  </div>
                  {b.descripcion && (
                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{b.descripcion}</div>
                  )}
                </div>
              ))
            )}
          </TarjetaLista>
        </div>
      </div>
    </>
  )
}
