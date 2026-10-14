'use client'

import { useEffect, useRef, useState } from 'react'
import { leerVideoExterno, miniaturaYoutube, NOMBRE_PROVEEDOR, type ProveedorVideo } from '@/lib/personalab/videoExterno'
import { BTN_FILA } from './tokens'

// EL ENLACE DE YOUTUBE O VIMEO, A LA VISTA Y COMPROBADO. Pedido de Francisco,
// 2026-10-14. Antes era un campo escondido debajo de "Subir archivo", que
// solo aparecía si no había archivo, sin ninguna señal de si el enlace servía:
// un enlace mal pegado se guardaba tal cual y el participante recibía un
// reproductor negro y muerto.
//
// AL PEGAR, SE COMPRUEBA Y SE MUESTRA: miniatura, título y autor, igual que
// la ventana que enseña el PDF subido: un último control de que es el video
// correcto. Los tres casos que dejan al participante con un reproductor roto
// (no existe o es privado, su dueño no permite incrustarlo, el enlace no es
// de YouTube ni de Vimeo) se dicen aquí, antes de publicar.
//
// EL BLOQUE SOLO CAMBIA CUANDO EL ENLACE SE CONFIRMA. Mientras se escribe, o
// si lo pegado no sirve, el campo es un borrador y el bloque conserva el
// último enlace bueno: nunca se pierde un enlace que funcionaba por un dedo
// a medio teclear. Lo que se guarda es siempre la forma canónica
// (`urlCanonica`), sea cual sea la que se pegó.

type Motivo = 'no-reconocido' | 'no-existe' | 'no-incrustable' | 'sin-respuesta'

type Estado =
  | { fase: 'vacio' }
  | { fase: 'validando' }
  | {
      fase: 'ok'
      proveedor: ProveedorVideo
      titulo: string | null
      autor: string | null
      miniatura: string | null
      inicio: number | null
    }
  | { fase: 'error'; motivo: Motivo; proveedor: ProveedorVideo | null }

const DEMORA_MS = 600

function tiempo(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const seg = s % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
    : `${m}:${String(seg).padStart(2, '0')}`
}

function mensaje(motivo: Motivo, proveedor: ProveedorVideo | null): string {
  switch (motivo) {
    case 'no-reconocido':
      return 'No es un enlace de YouTube ni de Vimeo.'
    case 'no-existe':
      return 'No encontramos ese video. Puede estar borrado o ser privado.'
    case 'no-incrustable':
      return proveedor === 'vimeo'
        ? 'Vimeo no deja verlo desde aquí. Revisa la privacidad del video en Vimeo.'
        : 'YouTube no deja verlo desde aquí. En YouTube Studio, activa "Permitir inserción" en ese video.'
    case 'sin-respuesta':
      return 'No pudimos comprobar el video ahora. Intenta de nuevo en un momento.'
  }
}

export default function EnlaceVideo({
  url, onCambio, claseInput, claseEtiqueta,
}: {
  url?: string
  onCambio: (url: string | undefined) => void
  claseInput: string
  claseEtiqueta: string
}) {
  const [texto, setTexto] = useState(url ?? '')
  const [estado, setEstado] = useState<Estado>(url ? { fase: 'validando' } : { fase: 'vacio' })
  // El último enlace que el bloque tiene (o que este campo le dio). Distingue
  // un cambio que vino de aquí de uno que vino de fuera (deshacer).
  const ultima = useRef<string | undefined>(url)
  const peticion = useRef(0)
  const reloj = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function validar(valor: string, emitir: boolean) {
    const limpio = valor.trim()
    const id = ++peticion.current

    if (!limpio) {
      setEstado({ fase: 'vacio' })
      if (emitir && ultima.current !== undefined) {
        ultima.current = undefined
        onCambio(undefined)
      }
      return
    }

    const video = leerVideoExterno(limpio)
    if (!video) {
      setEstado({ fase: 'error', motivo: 'no-reconocido', proveedor: null })
      return
    }

    setEstado({ fase: 'validando' })
    let datos: Record<string, unknown> | null = null
    try {
      const r = await fetch(`/api/personalab/video/info?url=${encodeURIComponent(limpio)}`)
      if (r.ok) datos = await r.json()
    } catch {
      datos = null
    }
    if (id !== peticion.current) return // llegó tarde: ya se escribió otra cosa

    if (!datos) {
      setEstado({ fase: 'error', motivo: 'sin-respuesta', proveedor: video.proveedor })
      return
    }

    // Si la plataforma no contestó a tiempo, el enlace NO se guarda: no se
    // sabe si sirve. Se dice y se ofrece reintentar; es mejor que guardar un
    // enlace sin comprobar y descubrir el reproductor roto al publicar.
    if (datos.ok !== true) {
      setEstado({ fase: 'error', motivo: datos.motivo as Motivo, proveedor: video.proveedor })
      return
    }

    const canonica = datos.canonica as string
    setEstado({
      fase: 'ok',
      proveedor: datos.proveedor as ProveedorVideo,
      titulo: (datos.titulo as string | null) ?? null,
      autor: (datos.autor as string | null) ?? null,
      miniatura: (datos.miniatura as string | null) ?? (video.proveedor === 'youtube' ? miniaturaYoutube(video.id) : null),
      inicio: (datos.inicio as number | null) ?? null,
    })
    if (emitir && canonica !== ultima.current) {
      ultima.current = canonica
      onCambio(canonica)
    }
  }

  // Al abrir el editor con un enlace ya guardado, se muestra su tarjeta sin
  // volver a escribirlo en el bloque.
  useEffect(() => {
    if (url) validar(url, false)
    return () => { if (reloj.current) clearTimeout(reloj.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Un cambio que viene de fuera (deshacer, por ejemplo) se refleja aquí.
  useEffect(() => {
    if (url === ultima.current) return
    ultima.current = url
    setTexto(url ?? '')
    validar(url ?? '', false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  function alEscribir(e: React.ChangeEvent<HTMLInputElement>) {
    const valor = e.target.value
    setTexto(valor)
    if (reloj.current) clearTimeout(reloj.current)
    // Pegar es una decisión completa: se comprueba de inmediato. Teclear
    // espera a que la persona se detenga.
    const pegado = (e.nativeEvent as InputEvent).inputType === 'insertFromPaste'
    reloj.current = setTimeout(() => validar(valor, true), pegado ? 0 : DEMORA_MS)
  }

  function quitar() {
    if (reloj.current) clearTimeout(reloj.current)
    setTexto('')
    validar('', true)
  }

  return (
    <div>
      <label className={claseEtiqueta} htmlFor="enlace-video">Enlace de YouTube o Vimeo</label>
      <input
        id="enlace-video"
        value={texto}
        onChange={alEscribir}
        placeholder="Pega el enlace aquí"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        aria-invalid={estado.fase === 'error'}
        className={claseInput}
      />

      {estado.fase === 'validando' && (
        <p className="mt-2 text-xs text-gray-ui" role="status">Comprobando el video…</p>
      )}

      {estado.fase === 'error' && (
        <p className="mt-2 text-xs text-alerta leading-relaxed" role="alert">
          {mensaje(estado.motivo, estado.proveedor)}
          {url ? ' Se mantiene el enlace guardado.' : ''}
          {estado.motivo === 'sin-respuesta' && (
            <>
              {' '}
              <button
                type="button"
                onClick={() => validar(texto, true)}
                className="underline underline-offset-2 hover:text-ink transition-colors"
              >
                Reintentar
              </button>
            </>
          )}
        </p>
      )}

      {estado.fase === 'ok' && (
        // `flex-wrap`: a 375px el título se cortaba a ~60px ("Me at the…")
        // porque miniatura y botón se llevaban el ancho; el botón baja de
        // línea. Medido en vivo (mismo defecto que tenía la tarjeta del
        // archivo, P-034).
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 bg-white border border-line rounded-[10px] p-2.5">
          {estado.miniatura ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={estado.miniatura} alt="" className="w-24 aspect-video object-cover rounded-md flex-shrink-0 bg-paper-2" />
          ) : (
            <span className="w-24 aspect-video rounded-md flex-shrink-0 bg-paper-2" />
          )}
          <div className="min-w-[8rem] flex-1">
            <div className="text-sm text-ink truncate">{estado.titulo ?? `Video de ${NOMBRE_PROVEEDOR[estado.proveedor]}`}</div>
            <div className="text-xs text-gray-ui truncate">
              {NOMBRE_PROVEEDOR[estado.proveedor]}
              {estado.autor ? ` · ${estado.autor}` : ''}
              {estado.inicio ? ` · desde ${tiempo(estado.inicio)}` : ''}
            </div>
          </div>
          <button type="button" onClick={quitar} className={`${BTN_FILA} flex-shrink-0 ml-auto`}>Quitar</button>
        </div>
      )}
    </div>
  )
}
