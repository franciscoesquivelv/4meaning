'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cargar, publicar, diferencias, historial, type Publicacion } from '../../../almacen'
import { revisar, type Hallazgo } from '../../../revision'
import type { Experiencia } from '../../../dominio'
import { TARJETA, BTN_PRIMARIO, BTN_SECUNDARIO } from '../../../tokens'
import type { Bloque } from '../../../contenido'

export default function Publicar({ experiencia }: { experiencia: Experiencia }) {
  const [bloques, setBloques] = useState<Bloque[] | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [publicado, setPublicado] = useState<Publicacion | null>(null)
  const [previo, setPrevio] = useState<Publicacion[]>([])
  const [dif, setDif] = useState({ nuevos: 0, editados: 0, quitados: 0 })

  useEffect(() => {
    setBloques(cargar())
    setPrevio(historial())
    setDif(diferencias())
  }, [])

  if (!bloques) {
    return <div className="text-sm text-slate-400">Revisando…</div>
  }

  const r = revisar(experiencia, bloques)
  const impedimentos = r.hallazgos.filter(h => h.severidad === 'impide')
  const advertencias = r.hallazgos.filter(h => h.severidad === 'advierte')

  function hacerlo() {
    const hoy = new Date().toISOString().slice(0, 10)
    const entrada = publicar(bloques!, hoy)
    setPublicado(entrada)
    setConfirmando(false)
    setPrevio(historial())
  }

  if (publicado) {
    return (
      <div className="max-w-[620px]">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-6">
          <h1 className="text-xl font-semibold text-emerald-900">
            Publicada la versión {publicado.numero}
          </h1>
          <p className="text-sm text-emerald-800 mt-2 leading-relaxed">
            Desde este momento, quien entre a leer ve esto. El borrador quedó cerrado; si vuelves al
            editor, empiezas uno nuevo sobre lo que acabas de publicar.
          </p>
          <div className="flex gap-2 mt-5">
            <Link href={`/prototipo/lector/c2`} className={BTN_PRIMARIO}>
              Ver como participante
            </Link>
            <Link
              href={`/prototipo/personalab/experiencias/${experiencia.id}`}
              className={BTN_SECUNDARIO}
            >
              Volver a la experiencia
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
          href={`/prototipo/personalab/experiencias/${experiencia.id}/editor`}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← Editor
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mt-3">Publicar</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-[62ch]">
          {experiencia.nombre}. Al publicar, lo que escribiste reemplaza lo que hoy leen los
          participantes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5">
        <div className="flex flex-col gap-4">
          {/* Franja 1: lo que impide */}
          {impedimentos.length > 0 && (
            <Franja
              tono="rojo"
              titulo={`${impedimentos.length} ${impedimentos.length === 1 ? 'cosa impide' : 'cosas impiden'} publicar`}
              nota="Esto dejaría contenido roto o vacío del lado del participante."
              hallazgos={impedimentos}
              experienciaId={experiencia.id}
            />
          )}

          {/* Franja 2: lo que conviene revisar */}
          {advertencias.length > 0 && (
            <Franja
              tono="ambar"
              titulo={`${advertencias.length} ${advertencias.length === 1 ? 'cosa conviene' : 'cosas convienen'} revisar`}
              nota="No impiden publicar. Puede que sean deliberadas."
              hallazgos={advertencias}
              experienciaId={experiencia.id}
            />
          )}

          {/* Franja 3: todo bien */}
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
              <Dato k="Bloques en total" v={String(r.resumen.bloques)} />
              <Dato k="Ve el participante" v={String(r.resumen.visiblesAlParticipante)} />
              <Dato k="Solo el moderador" v={String(r.resumen.soloModerador)} />
            </dl>

            {(dif.nuevos > 0 || dif.editados > 0 || dif.quitados > 0) && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Cambios sobre lo publicado
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  {dif.nuevos > 0 && <div>{dif.nuevos} bloque{dif.nuevos > 1 ? 's' : ''} nuevo{dif.nuevos > 1 ? 's' : ''}</div>}
                  {dif.editados > 0 && <div>{dif.editados} editado{dif.editados > 1 ? 's' : ''}</div>}
                  {dif.quitados > 0 && <div>{dif.quitados} quitado{dif.quitados > 1 ? 's' : ''}</div>}
                </div>
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-slate-100">
              {!r.puedePublicar ? (
                <>
                  <button disabled className={`${BTN_PRIMARIO} w-full opacity-40 cursor-not-allowed`}>
                    Publicar
                  </button>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Corrige lo de la franja roja primero.
                  </p>
                </>
              ) : confirmando ? (
                <>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    Al publicar, {r.resumen.visiblesAlParticipante} bloques quedan visibles para quien
                    entre a leer. ¿Seguimos?
                  </p>
                  <div className="flex gap-2">
                    <button onClick={hacerlo} className={`${BTN_PRIMARIO} flex-1`}>
                      Sí, publicar
                    </button>
                    <button onClick={() => setConfirmando(false)} className={BTN_SECUNDARIO}>
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <button onClick={() => setConfirmando(true)} className={`${BTN_PRIMARIO} w-full`}>
                  Publicar
                </button>
              )}
            </div>
          </div>

          {previo.length > 0 && (
            <div className={`${TARJETA} p-5`}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Publicaciones anteriores
              </div>
              {previo.slice(0, 5).map(p => (
                <div key={p.numero} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-slate-700">Versión {p.numero}</span>
                  <span className="text-slate-400 text-xs tabular-nums">{p.fecha}</span>
                </div>
              ))}
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
                href={`/prototipo/personalab/experiencias/${experienciaId}/editor`}
                className="text-xs text-slate-500 hover:text-slate-900 whitespace-nowrap flex-shrink-0 underline underline-offset-2"
              >
                {h.bisagra}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
