'use client'

import { useState } from 'react'
import Link from 'next/link'
import { publicarVersion, revertirVersion } from '../../../almacenRemoto'
import { revisar, type Hallazgo } from '../../../revision'
import { TARJETA, BTN_PRIMARIO, BTN_SECUNDARIO } from '../../../tokens'
import { Boton } from '../../../ui'
import type { Bloque } from '@/lib/personalab/bloques'
import type { ExperienciaEditable, VersionPublicada } from '@/lib/personalab/editorDatos'

// ETAPA 3. Antes: `cargar()`/`publicar()` de `almacen.ts`, contra
// localStorage. Ahora: los datos llegan ya resueltos del servidor (mismo
// borrador que ve el editor, por la misma `cargarParaEditar`), y publicar
// llama a `pl_abrir_borrador` → `pl_publicar_version` de verdad, la RPC
// atómica que ya existía escrita y sin usar desde la Etapa 2.
//
// LA CAJA "CAMBIOS SOBRE LO PUBLICADO" YA NO EMPAREJA BLOQUE POR BLOQUE. Ver
// el comentario largo en `editorDatos.ts`, `resumenDePublicacion`: con ids
// nuevos en cada borrador, un diff por id mentiría. Se cuenta, no se
// empareja.

const MINIMO_PERCEPTIBLE = 400

export default function Publicar({
  experiencia, bloques, resumenPublicacion,
}: {
  experiencia: ExperienciaEditable
  bloques: Bloque[]
  resumenPublicacion: { bloquesEnBorrador: number; bloquesEnPublicada: number; historial: VersionPublicada[] }
}) {
  const [confirmando, setConfirmando] = useState(false)
  const [publicando, setPublicando] = useState(false)
  const [fallo, setFallo] = useState<string | null>(null)
  const [publicado, setPublicado] = useState(false)
  const [confirmandoRevertir, setConfirmandoRevertir] = useState(false)
  const [revirtiendo, setRevirtiendo] = useState(false)
  const [falloRevertir, setFalloRevertir] = useState<string | null>(null)
  const [revertido, setRevertido] = useState(false)

  // Solo tiene sentido si hay a dónde volver: la publicada de hoy, más al
  // menos una retirada antes que ella.
  const puedeRevertir = resumenPublicacion.historial.length >= 2

  async function deshacer() {
    setRevirtiendo(true)
    setFalloRevertir(null)
    try {
      await revertirVersion(experiencia.id)
      setRevertido(true)
      setConfirmandoRevertir(false)
    } catch (e) {
      setFalloRevertir(e instanceof Error ? e.message : 'Falló sin motivo claro.')
    } finally {
      setRevirtiendo(false)
    }
  }

  const r = revisar(experiencia, bloques)
  const impedimentos = r.hallazgos.filter(h => h.severidad === 'impide')
  const advertencias = r.hallazgos.filter(h => h.severidad === 'advierte')

  async function hacerlo() {
    setPublicando(true)
    setFallo(null)
    const inicio = Date.now()
    try {
      await publicarVersion(experiencia.versionId)
      const resto = MINIMO_PERCEPTIBLE - (Date.now() - inicio)
      if (resto > 0) await new Promise(res => setTimeout(res, resto))
      setPublicado(true)
      setConfirmando(false)
    } catch (e) {
      setFallo(e instanceof Error ? e.message : 'Falló sin motivo claro.')
    } finally {
      setPublicando(false)
    }
  }

  // Pantalla completa, igual que "publicado" abajo, y no un mensaje
  // pequeño dentro de la tarjeta de historial. Esa tarjeta viene de una
  // prop cargada una vez al abrir la pantalla (`resumenPublicacion`): tras
  // deshacer, sigue mostrando la lista de ANTES, porque nada la vuelve a
  // pedir al servidor. En vez de parchear esa lista para que mienta menos,
  // se reemplaza toda la vista, que es lo que "publicar" ya hacía y es
  // consistente. Hallazgo de Julián.
  if (revertido) {
    return (
      <div className="max-w-[620px]">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-6">
          <h1 className="text-xl font-semibold text-amber-900">Deshecho</h1>
          <p className="text-sm text-amber-800 mt-2 leading-relaxed">
            La versión anterior a la de hoy volvió a ser la publicada. Quien entre a leer desde
            ahora ve esa. Quien ya estaba leyendo la que acabas de retirar la sigue viendo hasta
            que termine: tampoco aquí se le mueve el piso a mitad de camino.
          </p>
          <div className="flex gap-2 mt-5">
            <Link href={`/personalab/experiencias/${experiencia.id}/editor`} className={BTN_PRIMARIO}>
              Volver al editor
            </Link>
            <Link href="/personalab/experiencias" className={BTN_SECUNDARIO}>
              Volver
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (publicado) {
    return (
      <div className="max-w-[620px]">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-6">
          <h1 className="text-xl font-semibold text-emerald-900">Publicado</h1>
          <p className="text-sm text-emerald-800 mt-2 leading-relaxed">
            Desde ahora, quien entre a leer ve esto. Quien ya estaba leyendo la versión anterior la
            sigue viendo hasta que termine: no se le mueve el piso a mitad de camino. Si vuelves al
            editor, empiezas un borrador nuevo, encima de lo que acabas de publicar.
          </p>
          <div className="flex gap-2 mt-5">
            <Link href={`/experiencia/${experiencia.slug}`} target="_blank" className={BTN_PRIMARIO}>
              Ver como participante
            </Link>
            <Link href="/personalab/experiencias" className={BTN_SECUNDARIO}>
              Volver
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href={`/personalab/experiencias/${experiencia.id}/editor`}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← Editor
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mt-3">Publicar</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-[62ch]">
          {experiencia.nombre}. Al publicar, lo que escribiste reemplaza lo que hoy leen quienes
          empiecen de nuevo. Quien ya está leyendo termina la versión con la que empezó.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5">
        <div className="flex flex-col gap-4">
          {impedimentos.length > 0 && (
            <Franja
              tono="rojo"
              titulo={`${impedimentos.length} ${impedimentos.length === 1 ? 'cosa impide' : 'cosas impiden'} publicar`}
              nota="Esto dejaría contenido roto o vacío del lado del participante."
              hallazgos={impedimentos}
              experienciaId={experiencia.id}
            />
          )}

          {advertencias.length > 0 && (
            <Franja
              tono="ambar"
              titulo={`${advertencias.length} ${advertencias.length === 1 ? 'cosa conviene' : 'cosas convienen'} revisar`}
              nota="No impiden publicar. Puede que sean deliberadas."
              hallazgos={advertencias}
              experienciaId={experiencia.id}
            />
          )}

          {r.hallazgos.length === 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
              <p className="text-sm font-semibold text-emerald-900">No encontré nada que corregir.</p>
              <p className="text-sm text-emerald-800 mt-1">
                Revisé bloques vacíos, citas sin autor, objetos sin instrucción, archivos sin subir y
                bisagras que el participante vería en blanco.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className={`${TARJETA} p-5`}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Qué se va a publicar
            </div>
            <dl className="space-y-2.5 text-sm">
              <Dato k="Bisagras con contenido" v={`${r.resumen.bisagrasConContenido} de ${r.resumen.bisagrasTotales}`} />
              <Dato k="Bloques en el borrador" v={String(r.resumen.bloques)} />
              <Dato k="Ve el participante" v={String(r.resumen.visiblesAlParticipante)} />
              <Dato k="Solo el moderador" v={String(r.resumen.soloModerador)} />
            </dl>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Frente a lo publicado hoy
              </div>
              {resumenPublicacion.bloquesEnPublicada === 0 ? (
                <p className="text-sm text-slate-400">
                  Nada publicado todavía. Esta sería la primera versión.
                </p>
              ) : (
                <p className="text-sm text-slate-600">
                  Lo publicado hoy tiene {resumenPublicacion.bloquesEnPublicada} bloque
                  {resumenPublicacion.bloquesEnPublicada === 1 ? '' : 's'}. Este borrador tiene{' '}
                  {resumenPublicacion.bloquesEnBorrador}.
                </p>
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100">
              {fallo ? (
                <>
                  <p className="text-sm font-semibold text-red-700">No se pudo publicar</p>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Tu borrador está intacto y nadie ha visto los cambios. {fallo}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Boton
                      variante="primario"
                      onClick={hacerlo}
                      cargando={publicando}
                      textoCargando="Publicando"
                      className="flex-1"
                    >
                      Reintentar
                    </Boton>
                    <Link
                      href={`/personalab/experiencias/${experiencia.id}/editor`}
                      className={BTN_SECUNDARIO}
                    >
                      Volver al editor
                    </Link>
                  </div>
                </>
              ) : !r.puedePublicar ? (
                <>
                  <Boton variante="primario" disabled className="w-full">Publicar</Boton>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Resuelve primero {impedimentos.length === 1 ? 'la cosa' : `las ${impedimentos.length} cosas`} de
                    arriba. Cada una dejaría una pantalla rota o en blanco para el participante.
                  </p>
                </>
              ) : confirmando ? (
                <>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    Al publicar, {r.resumen.visiblesAlParticipante} bloques quedan visibles para el
                    participante y {r.resumen.soloModerador} solo para el moderador.
                    {resumenPublicacion.bloquesEnPublicada > 0 && ' Reemplaza lo que hay publicado desde este momento, para quien empiece de nuevo.'}
                  </p>
                  <div className="flex gap-2">
                    <Boton
                      variante="primario"
                      onClick={hacerlo}
                      cargando={publicando}
                      textoCargando="Publicando"
                      className="flex-1"
                    >
                      Sí, publicar
                    </Boton>
                    <Boton variante="secundario" onClick={() => setConfirmando(false)} disabled={publicando}>
                      Cancelar
                    </Boton>
                  </div>
                </>
              ) : (
                <Boton variante="primario" onClick={() => setConfirmando(true)} className="w-full">
                  Publicar
                </Boton>
              )}
            </div>
          </div>

          {resumenPublicacion.historial.length > 0 && (
            <div className={`${TARJETA} p-5`}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Publicaciones anteriores
              </div>
              {resumenPublicacion.historial.slice(0, 5).map(p => (
                <div key={p.numero} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-slate-700">Versión {p.numero}</span>
                  <span className="text-slate-400 text-xs tabular-nums">{p.fecha}</span>
                </div>
              ))}

              {/* Deshacer la última publicación. Existe porque Hugo marcó,
                  antes de que el editor escribiera de verdad, que publicar
                  sin forma de volver atrás era un bloqueo: un clic sin
                  vuelta atrás. */}
              {puedeRevertir && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  {revertido ? (
                    <p className="text-sm text-emerald-700">
                      Deshecho. Quien empiece de nuevo ve la versión anterior.
                    </p>
                  ) : falloRevertir ? (
                    <>
                      <p className="text-xs text-red-600 mb-2">{falloRevertir}</p>
                      <button onClick={deshacer} className="text-xs font-medium text-red-700 underline underline-offset-2">
                        Reintentar
                      </button>
                    </>
                  ) : confirmandoRevertir ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-amber-900 leading-relaxed mb-2">
                        Vuelve a publicarse la versión anterior a la de hoy. Quien empiece de nuevo la
                        va a ver a ella, no a la de hoy.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={deshacer}
                          disabled={revirtiendo}
                          className="text-xs font-medium text-amber-900 bg-white border border-amber-300 rounded px-2 py-1 hover:bg-amber-100 disabled:opacity-60"
                        >
                          {revirtiendo ? 'Deshaciendo…' : 'Sí, deshacer'}
                        </button>
                        <button
                          onClick={() => setConfirmandoRevertir(false)}
                          disabled={revirtiendo}
                          className="text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmandoRevertir(true)}
                      className="text-xs text-slate-500 hover:text-red-600 underline underline-offset-2"
                    >
                      Deshacer la última publicación
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-slate-900 font-medium tabular-nums">{v}</dd>
    </div>
  )
}

function Franja({
  tono, titulo, nota, hallazgos, experienciaId,
}: {
  tono: 'rojo' | 'ambar'
  titulo: string
  nota: string
  hallazgos: Hallazgo[]
  experienciaId: string
}) {
  const c =
    tono === 'rojo'
      ? { caja: 'bg-red-50 border-red-200', titulo: 'text-red-900', nota: 'text-red-700', linea: 'border-red-100' }
      : { caja: 'bg-amber-50 border-amber-200', titulo: 'text-amber-900', nota: 'text-amber-700', linea: 'border-amber-100' }

  return (
    <div className={`${c.caja} border rounded-xl overflow-hidden`}>
      <div className="px-5 py-4">
        <p className={`text-sm font-semibold ${c.titulo}`}>{titulo}</p>
        <p className={`text-xs ${c.nota} mt-0.5`}>{nota}</p>
      </div>
      <div className="bg-white/60">
        {hallazgos.map((h, i) => (
          <div key={i} className={`px-5 py-3 border-t ${c.linea}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-slate-900">{h.que}</p>
                <p className="text-xs text-slate-500 mt-0.5">{h.comoSeArregla}</p>
              </div>
              <Link
                href={`/personalab/experiencias/${experienciaId}/editor?bisagra=${h.bisagraId}`}
                className="text-xs text-slate-500 hover:text-slate-900 whitespace-nowrap flex-shrink-0 underline underline-offset-2"
              >
                Ir a {h.bisagra}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
