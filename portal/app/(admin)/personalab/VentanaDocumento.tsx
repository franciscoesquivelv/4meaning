'use client'

import { useEffect, useRef, useState } from 'react'
import { BTN_FILA, BTN_SECUNDARIO } from './tokens'

// VISTA PREVIA DEL DOCUMENTO SUBIDO, EN UNA VENTANA EMERGENTE. Pedido de
// Francisco, 2026-10-06: "que los archivos, desde el editor, en los bloques,
// puedan dar la opción de ver un preview en ventana emergente del documento
// subido. Es como para tener un último control de que está el documento
// correcto."
//
// `<dialog>` NATIVO CON `showModal()`, NO UN DIV CON `fixed`. La primera
// versión era un div con trampa de foco escrita a mano, y probándola en vivo
// el Tab se escapaba al editor de atrás: cuando el foco entra al visor de PDF
// (un iframe), las teclas que se pulsan ahí adentro no llegan al documento
// padre, así que el manejador que cerraba el ciclo nunca se enteraba. El
// `<dialog>` modal vuelve inerte todo lo de atrás por sí solo, restaura el
// foco al botón que lo abrió, y cierra con Escape sin código nuestro.
//
// POR QUÉ `fetch` A UN BLOB Y NO `<iframe src="/api/personalab/medios/…">`.
// La ruta responde 307 a una URL firmada de Storage. Si responde 404, el
// iframe pintaría el JSON crudo `{"error":"No encontrado."}` dentro de la
// ventana, y quien revisa no sabría si el documento está mal o si falló algo;
// con `fetch` el error se ve como error y se puede reintentar.
//
// EL 404 DE LOS PRIMEROS SEGUNDOS NO ES UN ERROR. `pl_puede_ver_medio`
// (`20260914_1430_previsualizar_medio_en_borrador.sql`) solo deja ver un
// medio que ya está LIGADO a un bloque guardado. Justo después de subir, el
// archivo existe pero el bloque se guarda ~700 ms más tarde (el debounce del
// editor), así que un clic inmediato en "Ver" recibe 404 por un instante.
// Reintentar unos segundos antes de rendirse es lo honesto: el documento SÍ
// está, solo todavía no está ligado. Después de eso sí se dice que falló.

type Estado =
  | { fase: 'cargando' }
  | { fase: 'listo'; url: string }
  | { fase: 'error'; motivo: string }

const REINTENTOS = 4
const ESPERA_MS = 900

export default function VentanaDocumento({
  medioId, nombre, onCerrar,
}: {
  medioId: string
  nombre?: string
  onCerrar: () => void
}) {
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })
  const [intento, setIntento] = useState(0)
  const dialogo = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialogo.current
    if (!d) return
    if (!d.open) d.showModal()
    const desborde = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = desborde
      if (d.open) d.close()
    }
  }, [])

  useEffect(() => {
    let vivo = true
    let urlLocal: string | null = null
    setEstado({ fase: 'cargando' })

    async function cargar() {
      for (let i = 0; i <= REINTENTOS; i++) {
        try {
          const r = await fetch(`/api/personalab/medios/${medioId}`)
          if (r.ok) {
            const blob = await r.blob()
            if (!vivo) return
            urlLocal = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
            setEstado({ fase: 'listo', url: urlLocal })
            return
          }
          if (r.status !== 404) {
            if (vivo) setEstado({ fase: 'error', motivo: 'No se pudo abrir el archivo. Intenta de nuevo.' })
            return
          }
        } catch {
          if (vivo) setEstado({ fase: 'error', motivo: 'No se pudo abrir el archivo. Revisa tu conexión e intenta de nuevo.' })
          return
        }
        if (i < REINTENTOS) await new Promise(res => setTimeout(res, ESPERA_MS))
        if (!vivo) return
      }
      if (vivo) {
        setEstado({
          fase: 'error',
          motivo: 'El archivo todavía no está guardado en el bloque. Espera un momento a que diga "Guardado" y vuelve a intentar.',
        })
      }
    }

    cargar()
    return () => {
      vivo = false
      if (urlLocal) URL.revokeObjectURL(urlLocal)
    }
  }, [medioId, intento])

  return (
    <dialog
      ref={dialogo}
      aria-label={`Vista previa de ${nombre ?? 'el documento'}`}
      // `open`: en desarrollo, React monta, desmonta y vuelve a montar el
      // efecto; el `close()` del desmontaje de prueba dispara este evento
      // DESPUÉS de que el diálogo ya se volvió a abrir, y sin esta guarda
      // cerraba la ventana recién abierta.
      onClose={e => { if (!e.currentTarget.open) onCerrar() }}
      onClick={e => { if (e.target === e.currentTarget) onCerrar() }}
      className="p-0 bg-transparent text-ink w-[min(960px,calc(100vw-2rem))] h-[min(90vh,calc(100vh-2rem))] max-w-none max-h-none backdrop:bg-ink/60"
    >
      <div className="bg-paper border border-line rounded-[10px] shadow-xl w-full h-full flex flex-col overflow-hidden">
        {/* `flex-wrap` + base de 12rem: a 375px el rótulo caía a cuatro líneas y
            el nombre del archivo se cortaba a "guion-de…" porque los dos
            botones se llevaban el ancho. Medido en vivo. Ahora los botones
            bajan a su propia línea cuando no caben. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 border-b border-line flex-shrink-0">
          <div className="min-w-0 flex-1 basis-48">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terra-ui">
              Vista previa del documento
            </div>
            <div className="text-sm text-ink truncate">{nombre ?? 'archivo'}</div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {estado.fase === 'listo' && (
              <a
                href={estado.url}
                target="_blank"
                rel="noopener noreferrer"
                className={BTN_FILA}
              >
                Abrir en otra pestaña
              </a>
            )}
            <button type="button" autoFocus onClick={onCerrar} className={BTN_SECUNDARIO}>
              Cerrar
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-paper-2">
          {estado.fase === 'cargando' && (
            <div className="h-full flex items-center justify-center" role="status" aria-live="polite">
              <span className="text-sm text-gray-ui">Abriendo el documento…</span>
            </div>
          )}
          {estado.fase === 'error' && (
            <div className="h-full flex flex-col items-center justify-center gap-4 px-8 text-center" role="alert">
              <p className="text-sm text-ink max-w-[46ch] leading-relaxed">{estado.motivo}</p>
              <button type="button" onClick={() => setIntento(n => n + 1)} className={BTN_SECUNDARIO}>
                Reintentar
              </button>
            </div>
          )}
          {estado.fase === 'listo' && (
            <iframe
              src={estado.url}
              title={`Vista previa de ${nombre ?? 'el documento'}`}
              className="w-full h-full block"
            />
          )}
        </div>
      </div>
    </dialog>
  )
}
