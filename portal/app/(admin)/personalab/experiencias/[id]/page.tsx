import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cargarFichaExperiencia } from '@/lib/personalab/catalogo'
import { Badge, Etiqueta, Vacio, TarjetaLista, Fila } from '../../ui'
import { TARJETA, BTN_PRIMARIO, BTN_SECUNDARIO, PASTILLA, AVISO } from '../../tokens'
import { TONO } from '@/lib/estilos/oficina'

// ETAPA "SECCIÓN DE EXPERIENCIAS". Antes leía `dominio.ts`. Ver
// `lib/personalab/catalogo.ts` para el detalle exacto de qué tan real es
// cada sección de esta ficha (bisagras, kit, encuentros).

const ETIQUETA_TIEMPO: Record<string, string> = {
  vispera: 'Víspera', ignicion: 'Ignición', retorno: 'Retorno',
}
const PAPEL_SOFTWARE: Record<string, string> = {
  vispera: 'El software es protagonista. Es el tiempo que hoy no existe en ningún lado.',
  ignicion: 'Software mudo. Solo modo sala para el moderador.',
  retorno: 'El software es indispensable, no cómodo.',
}
const SOPORTE_NOTA: Record<string, string> = {
  sala: 'Ocurre entre personas. El software no entra.',
  objeto: 'Pieza física. El software la administra, no la entrega.',
  pantalla: 'Vive dentro del portal.',
}
const TONO_SOPORTE: Record<string, string> = {
  sala: TONO.curso, objeto: TONO.marca, pantalla: 'border-sec/45 text-sec',
}
const ETIQUETA_MADURACION: Record<string, string> = {
  diseno: 'En diseño', piloto: 'En piloto', lista: 'Lista', retirada: 'Retirada',
}
const TONO_MADURACION: Record<string, string> = {
  diseno: TONO.curso, piloto: TONO.marca, lista: TONO.bien, retirada: TONO.neutro,
}
const COLUMNA_KIT: Record<string, { titulo: string; regla: string }> = {
  objeto: { titulo: 'Objeto físico', regla: 'Nunca digital, nunca descargable, nunca sustituible por PDF.' },
  humano: { titulo: 'Pieza humana', regla: 'Solo se transmite en formación presencial. Jamás por video.' },
  administrativo: { titulo: 'Capa administrativa', regla: 'Aquí sí, software. Inventario, versiones, fechas, accesos.' },
}
// Las claves son las del enum real de la base (`pl_estado_corrida`), que
// no se tocan aquí -- renombrarlas es una migración aparte, no un cambio
// de etiqueta. Lo que sí cambia es lo que se muestra.
const ETIQUETA_ESTADO_ENCUENTRO: Record<string, string> = {
  prospecto: 'Prospecto', confirmada: 'Confirmado', en_preparacion: 'En preparación',
  corrida: 'Realizado', cancelada: 'Cancelado',
}
const TONO_ESTADO_ENCUENTRO: Record<string, string> = {
  prospecto: TONO.neutro, confirmada: TONO.marca, en_preparacion: TONO.curso,
  corrida: TONO.bien, cancelada: TONO.alerta,
}
const TIEMPOS = ['vispera', 'ignicion', 'retorno']
const COLUMNAS = ['objeto', 'humano', 'administrativo']

function formatoFecha(iso: string | null) {
  if (!iso) return 'sin fecha'
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function ExperienciaPage({ params }: { params: { id: string } }) {
  const r = await cargarFichaExperiencia(params.id)

  if (r.estado === 'sin-acceso') notFound()

  if (r.estado === 'fallo') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-ink">No se pudo abrir esta experiencia</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">{r.motivo}</p>
          <Link href="/personalab/experiencias" className={`${BTN_PRIMARIO} inline-block mt-5`}>Volver</Link>
        </div>
      </div>
    )
  }

  const e = r.datos
  const listas = e.bisagras.filter(b => b.listo).length

  return (
    <>
      <Link href="/personalab/experiencias" className="text-xs text-gray-ui hover:text-ink transition-colors">
        ← Experiencias
      </Link>

      <div className="flex items-start justify-between gap-6 mt-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{e.nombre}</h1>
            <Badge label={ETIQUETA_MADURACION[e.maduracion] ?? e.maduracion} cls={TONO_MADURACION[e.maduracion] ?? TONO.neutro} />
          </div>
          {e.subtitulo && <p className="text-sm text-gray-ui mt-1">{e.subtitulo}</p>}
          {e.narrativa && <p className="text-base text-ink italic mt-3">{e.narrativa}</p>}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/personalab/experiencias/${e.slug}/editar`} className={BTN_SECUNDARIO}>
            Editar ficha
          </Link>
          <Link href={`/personalab/experiencias/${e.slug}/editor`} className={BTN_PRIMARIO}>
            Abrir editor
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-gray-ui pb-5 mb-6 border-b border-line">
        <span>Duración <b className="text-ink font-medium">{e.duracion ?? 'Por definir'}</b></span>
        <span>Se ha realizado <b className="text-ink font-medium">{e.encuentros.length === 0 ? 'nunca' : `${e.encuentros.length} ${e.encuentros.length === 1 ? 'vez' : 'veces'}`}</b></span>
        <span>Espacio al foro <b className="text-ink font-medium">{e.abreEspacioAlForo ? 'sí' : 'no'}</b></span>
        <span>Bisagras <b className="text-ink font-medium tabular-nums">{listas} de {e.bisagras.length}</b></span>
      </div>

      {e.notaDiseno && (
        <div className={`${AVISO} mb-8`}>
          <div className="text-xs font-semibold uppercase tracking-wider text-terra-ui mb-1">Nota de diseño</div>
          <p className="text-sm text-ink leading-relaxed">{e.notaDiseno}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5">
        <div className="flex flex-col gap-5">
          <Etiqueta>El diseño</Etiqueta>
          {e.bisagras.length === 0 ? (
            <Vacio
              accion={
                <Link href={`/personalab/experiencias/${e.slug}/editor`} className={BTN_SECUNDARIO}>
                  Abrir editor
                </Link>
              }
            >
              Esta experiencia no tiene ninguna bisagra definida todavía. No es que falte capturarla: es que
              no está diseñada. Mientras siga así, no se puede correr ni licenciar a un capítulo.
            </Vacio>
          ) : (
            TIEMPOS.map(t => {
              const bs = e.bisagras.filter(b => b.tiempo === t).sort((a, b) => a.orden - b.orden)
              const ok = bs.filter(b => b.listo).length
              return (
                <div key={t} className={`${TARJETA} overflow-hidden`}>
                  <div className="px-5 py-3.5 border-b border-line">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-semibold text-ink">{ETIQUETA_TIEMPO[t]}</h2>
                      <span className="text-xs text-gray-ui tabular-nums">
                        {bs.length === 0 ? 'Sin bisagras' : `${ok} de ${bs.length} listas`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-ui mt-1 leading-relaxed">{PAPEL_SOFTWARE[t]}</p>
                  </div>
                  {bs.length === 0 ? (
                    <div className="px-5 py-5 text-sm text-gray-ui">Este tiempo no está diseñado.</div>
                  ) : (
                    bs.map(b => (
                      <div key={b.id} className="grid grid-cols-[28px_76px_1fr_auto] gap-4 items-start px-5 py-3.5 border-b border-line last:border-b-0">
                        <span className="text-xs text-gray-ui tabular-nums pt-0.5">{String(b.orden).padStart(2, '0')}</span>
                        <span className={`${PASTILLA} ${TONO_SOPORTE[b.soporte] ?? TONO.neutro} text-center`} title={SOPORTE_NOTA[b.soporte]}>
                          {b.soporte}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-ink">
                            {b.titulo}
                            {b.duracion && <span className="text-xs text-gray-ui font-normal ml-2">{b.duracion}</span>}
                          </div>
                          {b.descripcion && <div className="text-xs text-gray-ui mt-0.5 leading-relaxed">{b.descripcion}</div>}
                          {b.requiere && b.requiere.length > 0 && (
                            <div className="text-xs text-terra-ui mt-1.5">Requiere: {b.requiere.join(' · ')}</div>
                          )}
                        </div>
                        <span className={`text-xs font-medium whitespace-nowrap pt-0.5 ${b.listo ? 'text-bien' : 'text-terra-ui'}`}>
                          {b.listo ? 'Listo' : 'Falta'}
                        </span>
                      </div>
                    ))
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
              <Vacio neutro>Sin kit definido todavía.</Vacio>
            ) : (
              <div className="flex flex-col gap-3">
                {COLUMNAS.map(col => {
                  const piezas = e.kit.filter(p => p.columna === col)
                  const c = COLUMNA_KIT[col]
                  return (
                    <div key={col} className={`${TARJETA} p-4`}>
                      <div className="text-sm font-semibold text-ink">{c.titulo}</div>
                      <p className="text-xs text-terra-ui mt-1 leading-relaxed">{c.regla}</p>
                      <div className="mt-3">
                        {piezas.length === 0 && <span className="text-xs text-gray-ui">Nada todavía.</span>}
                        {piezas.map(p => (
                          <div key={p.id} className="py-2 border-t border-line">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm text-ink">{p.nombre}</span>
                              <span className={`text-xs font-medium whitespace-nowrap ${p.disponible ? 'text-bien' : 'text-terra-ui'}`}>
                                {p.disponible ? 'Listo' : 'Falta'}
                              </span>
                            </div>
                            {p.detalle && (
                              <div className="text-xs text-gray-ui mt-0.5 leading-relaxed">
                                {p.detalle}
                                {p.porPersona && <span className="text-gray-ui"> · por persona</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <TarjetaLista titulo="Encuentros">
            {e.encuentros.length === 0 ? (
              <div className="px-5 py-5 text-sm text-gray-ui">Nunca se ha realizado.</div>
            ) : (
              e.encuentros.map(c => (
                <Fila
                  key={c.id}
                  titulo={c.grupoNombre}
                  sub={`${formatoFecha(c.fecha)} · ${c.personasEnElForo || 'sin'} personas${c.moderadorNombre ? ` · ${c.moderadorNombre}` : ''}`}
                  derecha={<Badge label={ETIQUETA_ESTADO_ENCUENTRO[c.estado] ?? c.estado} cls={TONO_ESTADO_ENCUENTRO[c.estado] ?? TONO.neutro} />}
                />
              ))
            )}
          </TarjetaLista>
        </div>
      </div>
    </>
  )
}
