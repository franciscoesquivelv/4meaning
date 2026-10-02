import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cargarParaEditar } from '@/lib/personalab/editorDatos'
import { NIVEL } from '@/lib/personalab/bloques'
import BloqueLector from '../../../Bloques'
import { ETIQUETA_TIEMPO, type Tiempo } from '../../../dominio'
import { TARJETA, BTN_PRIMARIO, BTN_SECUNDARIO } from '../../../tokens'

// Pedido de Francisco, 2026-10-01: "antes de abrir el editor, pongamos un
// preview mode y se abra en la pantalla como se vería en desktop el
// contenido que está hasta el momento." Esto es DISTINTO de la vista
// previa que ya existe DENTRO del editor (`Editor.tsx`, el selector
// "En celular/En computadora"): esa vive adentro, un segmento a la vez, y
// requiere haber abierto ya el editor pesado. Esta es la misma pieza de
// render (`BloqueLector`, el mismo marco de escritorio sin bisel) pero
// sirve TODOS los segmentos de un tirón, desde la ficha de la
// experiencia, sin entrar al editor.
//
// `cargarParaEditar` es la misma función que ya usa `editor/page.tsx`: ya
// trae TODOS los segmentos y TODOS los bloques del borrador, no solo el
// activo, así que no hace falta una consulta nueva.
//
// Sin selector celular/computadora, a propósito: Francisco pidió "cómo se
// vería en desktop", nada más. Agregar el toggle que nadie pidió es una
// pantalla a medias, no una completa.
//
// Mismo techo que la vista previa del editor (`NIVEL[b.audiencia] <= 2`,
// `Editor.tsx:991`): lo exclusivo de equipo se queda fuera siempre, pero
// lo exclusivo de moderador SÍ se muestra -- esta pantalla es para
// quien edita, no para el participante, mismo criterio que ya está
// probado ahí.
//
// SIN TOPE DE ANCHO, DESDE EL 2026-10-01. Tenía `max-w-[620px]` (la
// misma cifra que el lector real, calibrada por Julian, P-013) -- ahí
// era deliberado, un techo de longitud de línea. Aquí Francisco lo vio
// como un defecto: "se ve el contenido demasiado delgado, como si
// estuviese hecho para mobile... quites ese pre-set". Se quitó, igual
// que en `Editor.tsx` (la misma vista previa, vista desde adentro del
// editor). El lector real que de verdad usa el participante NO se tocó
// -- sigue en 620px; ensanchar ESE es una decisión más grande, que
// Francisco no pidió todavía.
const TIEMPOS: Tiempo[] = ['vispera', 'ignicion', 'retorno']

export default async function VistaPreviaPage({ params }: { params: { id: string } }) {
  const r = await cargarParaEditar(params.id)

  if (r.estado === 'sin-experiencia') notFound()

  if (r.estado === 'sin-permiso' || r.estado === 'fallo') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-ink">No se pudo abrir la vista previa</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">{r.motivo}</p>
          <Link href={`/personalab/experiencias/${params.id}`} className={`${BTN_PRIMARIO} inline-block mt-5`}>
            Volver
          </Link>
        </div>
      </div>
    )
  }

  const { experiencia, bloques } = r.datos
  const segmentos = experiencia.bisagras.slice().sort((a, b) => {
    if (a.tiempo !== b.tiempo) return TIEMPOS.indexOf(a.tiempo) - TIEMPOS.indexOf(b.tiempo)
    return a.orden - b.orden
  })

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <Link
          href={`/personalab/experiencias/${experiencia.slug}`}
          className="text-xs text-gray-ui hover:text-ink transition-colors"
        >
          ← {experiencia.nombre}
        </Link>
        <Link href={`/personalab/experiencias/${experiencia.slug}/editor`} className={BTN_PRIMARIO}>
          Abrir editor
        </Link>
      </div>

      <h1 className="text-xl font-semibold tracking-tight text-ink mb-1">Vista previa</h1>
      <p className="text-sm text-gray-ui mb-6 max-w-[70ch]">
        Cómo se ve en escritorio el borrador, tal como está ahora mismo. No es lo que el
        participante ve: eso cambia solo cuando publiques.
      </p>

      {segmentos.length === 0 ? (
        <div className={`${TARJETA} p-8 text-center`}>
          <p className="text-sm text-gray-ui">Esta experiencia todavía no tiene ningún segmento.</p>
          <Link href={`/personalab/experiencias/${experiencia.slug}/editor`} className={`${BTN_SECUNDARIO} inline-block mt-4`}>
            Abrir editor
          </Link>
        </div>
      ) : (
        <div className="bg-paper border border-line rounded-[10px] overflow-hidden">
          <div className="text-center pt-4">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-terra-ui bg-paper-2 px-2 py-0.5 rounded-full">
              Vista previa
            </span>
          </div>
          <div className="px-8 md:px-10 pt-6 pb-10">
            {segmentos.map((s, i) => {
              const delSegmento = bloques.filter(b => b.bisagraId === s.id).sort((a, b) => a.orden - b.orden)
              const visibles = delSegmento.filter(b => NIVEL[b.audiencia] <= 2)
              return (
                <section key={s.id} className={i > 0 ? 'mt-14 pt-14 border-t border-line' : ''}>
                  <header>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terra-ui">
                      {ETIQUETA_TIEMPO[s.tiempo]}
                    </div>
                    <h2 className="mt-3 text-[26px] leading-[1.12] font-extralight tracking-[-0.025em] text-dom">
                      {s.titulo}
                    </h2>
                    {s.descripcion && (
                      <p className="mt-2 text-[13px] leading-[1.5] text-gray-ui italic border-l-2 border-line pl-3">
                        {s.descripcion}
                      </p>
                    )}
                  </header>
                  <div className="mt-8">
                    {visibles.length === 0 ? (
                      <p className="text-[15px] font-light text-gray-ui leading-relaxed">
                        {delSegmento.length === 0
                          ? 'Este segmento todavía no tiene nada escrito.'
                          : 'Todo lo que hay en este segmento está marcado como exclusivo de equipo.'}
                      </p>
                    ) : (
                      visibles.map(b => <BloqueLector key={b.id} b={b} />)
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
