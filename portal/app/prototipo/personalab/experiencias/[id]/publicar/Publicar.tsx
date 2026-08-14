'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cargar, publicar, diferencias, historial, type Publicacion } from '../../../almacen'
import { revisar, type Hallazgo } from '../../../revision'
import { CORRIDAS } from '../../../dominio'
import type { Experiencia } from '../../../dominio'
import { TARJETA, BTN_PRIMARIO, BTN_SECUNDARIO } from '../../../tokens'
import { Boton, Girador } from '../../../ui'
import type { Bloque } from '../../../contenido'

// Piso perceptible, igual que en el editor: sin esto el botón termina antes
// de que el ojo registre que empezó, y parece no haber respondido.
const MINIMO_PERCEPTIBLE = 400

export default function Publicar({ experiencia }: { experiencia: Experiencia }) {
  const [bloques, setBloques] = useState<Bloque[] | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [publicando, setPublicando] = useState(false)
  const [fallo, setFallo] = useState(false)
  const [publicado, setPublicado] = useState<Publicacion | null>(null)
  const [previo, setPrevio] = useState<Publicacion[]>([])
  const [dif, setDif] = useState({ nuevos: 0, editados: 0, quitados: 0 })

  useEffect(() => {
    setBloques(cargar(experiencia.id))
    setPrevio(historial(experiencia.id))
    setDif(diferencias(experiencia.id))
  }, [experiencia.id])

  if (!bloques) {
    return (
      <div className="text-sm text-slate-400 flex items-center gap-2">
        <Girador />
        Revisando lo que escribiste
      </div>
    )
  }

  const r = revisar(experiencia, bloques)
  const impedimentos = r.hallazgos.filter(h => h.severidad === 'impide')
  const advertencias = r.hallazgos.filter(h => h.severidad === 'advierte')
  // La primera corrida de esta experiencia. Antes este enlace apuntaba a c2
  // fijo en el código: publicaras lo que publicaras, te llevaba a esa.
  const corrida = CORRIDAS.find(c => c.experienciaId === experiencia.id)

  // Sin este try/catch, si el guardado fallaba (cuota llena, ventana
  // privada) el botón no hacía absolutamente nada visible y el autor lo
  // presionaba otra vez, y otra.
  async function hacerlo() {
    setPublicando(true)
    setFallo(false)
    const inicio = Date.now()
    try {
      const hoy = new Date().toISOString().slice(0, 10)
      const entrada = publicar(experiencia.id, bloques!, hoy)
      const resto = MINIMO_PERCEPTIBLE - (Date.now() - inicio)
      if (resto > 0) await new Promise(res => setTimeout(res, resto))
      setPublicado(entrada)
      setConfirmando(false)
      setPrevio(historial(experiencia.id))
    } catch {
      setFallo(true)
    } finally {
      setPublicando(false)
    }
  }

  if (publicado) {
    return (
      <div className="max-w-[620px]">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-6">
          <h1 className="text-xl font-semibold text-emerald-900">
            Versión {publicado.numero} publicada
          </h1>
          <p className="text-sm text-emerald-800 mt-2 leading-relaxed">
            Desde ahora, quien entre a leer ve esto. El borrador quedó cerrado. Si vuelves al editor
            empiezas uno nuevo, encima de lo que acabas de publicar.
          </p>
          <div className="flex gap-2 mt-5">
            {corrida && (
              <Link href={`/prototipo/lector/${corrida.id}`} className={BTN_PRIMARIO}>
                Ver como participante
              </Link>
            )}
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

            {/* Esta caja se ocultaba entera cuando no había diferencias, así
                que publicar algo idéntico a lo publicado se veía igual que
                publicar veinte cambios. El silencio se lee como confirmación. */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Cambios sobre lo publicado
              </div>
              {dif.nuevos === 0 && dif.editados === 0 && dif.quitados === 0 ? (
                <p className="text-sm text-slate-400">
                  Ninguno. Esto es idéntico a lo que ya está publicado.
                </p>
              ) : (
                <div className="text-sm text-slate-600 space-y-1">
                  {dif.nuevos > 0 && <div>{dif.nuevos} bloque{dif.nuevos > 1 ? 's' : ''} nuevo{dif.nuevos > 1 ? 's' : ''}</div>}
                  {dif.editados > 0 && <div>{dif.editados} editado{dif.editados > 1 ? 's' : ''}</div>}
                  {dif.quitados > 0 && <div>{dif.quitados} quitado{dif.quitados > 1 ? 's' : ''}</div>}
                </div>
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100">
              {fallo ? (
                <>
                  <p className="text-sm font-semibold text-red-700">No se pudo publicar</p>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Tu borrador está intacto y nadie ha visto los cambios. Vuelve a intentar; si falla
                    otra vez, avisa antes de seguir editando.
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
                      href={`/prototipo/personalab/experiencias/${experiencia.id}/editor`}
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
                    Al publicar, {r.resumen.visiblesAlParticipante} bloques quedan visibles para el foro
                    y {r.resumen.soloModerador} solo para el moderador. Reemplaza
                    {previo[0] ? ` la versión ${previo[0].numero}` : ' lo que hay publicado'} desde este
                    momento.
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
              {/* El enlace lleva a LA bisagra del hallazgo, no al editor
                  genérico. Antes el autor aterrizaba en la primera y tenía
                  que buscar a mano lo que el sistema acababa de señalarle. */}
              <Link
                href={`/prototipo/personalab/experiencias/${experienciaId}/editor?bisagra=${h.bisagraId}`}
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
