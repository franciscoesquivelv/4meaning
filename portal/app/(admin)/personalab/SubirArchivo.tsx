'use client'

import { useState } from 'react'
import { familiaDe, type TipoBloque, type FamiliaMedio } from '@/lib/personalab/bloques'
import { subirArchivo } from './almacenRemoto'
import { BTN_FILA, BTN_PELIGRO } from './tokens'

// SUBIDA REAL, ETAPA 3. Hasta hoy este componente no mandaba nada a ningún
// lado: `URL.createObjectURL` fingía el archivo y se perdía al recargar.
// Ahora usa `subirArchivo()` de `almacenRemoto.ts`, que ya estaba escrita y
// bien hecha (URL firmada, sube directo a Storage, registra la fila), solo
// que nunca se había llamado desde ningún componente real.
//
// Lo que se retiró junto con la simulación: el botón "Ver el estado de
// error" existía para poder diseñar la pantalla de fallo sin esperar a que
// fallara de verdad. Ahora sí puede fallar de verdad (la red, el bucket, el
// servidor), así que un botón que finge un fallo al lado de una subida real
// confunde más de lo que ayuda: alguien podría creer que prueba algo.
//
// Seis estados, porque los cinco felices no son el problema: el que hay que
// poder ver y diseñar es el que falla.

type Estado = 'vacio' | 'eligiendo' | 'subiendo' | 'listo' | 'fallido'

// QUÉ EXTENSIONES OFRECE EL SELECTOR, derivado de la familia que el tipo de
// bloque declara en el contrato.
//
// Esto es lo que el selector del navegador SUGIERE, no una garantía: la
// validación de verdad vive en el servidor y en el bucket, que es donde
// tiene que estar.
const ACEPTA_POR_FAMILIA: Record<FamiliaMedio, string> = {
  documento: 'application/pdf',
  imagen: 'image/*',
  video: 'video/mp4,video/quicktime',
  audio: 'audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/webm',
}

// Cómo se nombra el archivo de cada familia cuando se le pide a una persona.
const QUE_ELIGE: Record<FamiliaMedio, string> = {
  documento: 'el PDF',
  imagen: 'la imagen',
  video: 'el video',
  audio: 'el audio',
}

function aceptaDe(tipo: TipoBloque): string | undefined {
  const familia = familiaDe(tipo)
  return familia ? ACEPTA_POR_FAMILIA[familia] : undefined
}

function pesoLegible(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function SubirArchivo({
  tipo, nombre, url, onListo, onQuitar,
}: {
  tipo: TipoBloque
  nombre?: string
  url?: string
  onListo: (datos: { nombreArchivo: string; peso: string; url: string; medioId: string }) => void
  onQuitar: () => void
}) {
  const [estado, setEstado] = useState<Estado>(nombre || url ? 'listo' : 'vacio')
  const [avance, setAvance] = useState(0)
  const [motivo, setMotivo] = useState('')
  const [pendiente, setPendiente] = useState<File | null>(null)

  function elegir() {
    const entrada = document.createElement('input')
    entrada.type = 'file'
    const acepta = aceptaDe(tipo)
    if (acepta) entrada.accept = acepta
    entrada.onchange = () => {
      const f = entrada.files?.[0]
      if (f) subir(f)
    }
    entrada.click()
  }

  async function subir(f: File) {
    setPendiente(f)
    setEstado('subiendo')
    setAvance(0)
    try {
      const resultado = await subirArchivo(f, pct => setAvance(pct))
      onListo({
        nombreArchivo: resultado.nombre,
        peso: resultado.peso,
        url: resultado.url,
        medioId: resultado.id,
      })
      setEstado('listo')
    } catch (e) {
      setMotivo(e instanceof Error ? e.message : 'Falló del lado nuestro, no del tuyo. Vuelve a intentar en un minuto.')
      setEstado('fallido')
    }
  }

  function reintentar() {
    if (!pendiente) {
      setEstado('vacio')
      return
    }
    subir(pendiente)
  }

  return (
    <div>
      {estado === 'vacio' && (
        <div className="border border-dashed border-slate-300 rounded-lg px-4 py-6 text-center">
          <p className="text-sm text-slate-500">
            Elige {QUE_ELIGE[familiaDe(tipo) ?? 'documento']} que va en este bloque.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <button onClick={elegir} className={BTN_FILA}>
              Elegir archivo
            </button>
          </div>
        </div>
      )}

      {estado === 'subiendo' && (
        <div className="border border-slate-200 rounded-lg px-4 py-3.5">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-sm text-slate-700 truncate">{pendiente?.name}</span>
            <span className="text-xs text-slate-400 tabular-nums flex-shrink-0" role="status" aria-live="polite">
              {avance < 1 ? 'Preparando' : `Subiendo, ${Math.round(avance)} %`}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-800 rounded-full transition-[width] duration-200 ease-out"
              style={{ width: `${Math.max(avance, 4)}%` }}
            />
          </div>
        </div>
      )}

      {estado === 'fallido' && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-700">
                No se pudo subir {pendiente?.name}
              </p>
              <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{motivo}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Antes tenía una clase suelta a mano, único control nuevo
                  de esta etapa sin focus-visible. Hallazgo de Julián. */}
              <button onClick={reintentar} className={BTN_PELIGRO}>
                Reintentar
              </button>
              <button onClick={() => { setEstado('vacio'); setPendiente(null) }} className={`${BTN_FILA} bg-white`}>
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {estado === 'listo' && (
        <div className="border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-3">
          {tipo === 'imagen' && url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="w-14 h-10 object-cover rounded flex-shrink-0" />
          ) : (
            <span className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                {tipo === 'video' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                ) : tipo === 'audio' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a6.5 6.5 0 006.5-6.5M12 18.5A6.5 6.5 0 015.5 12M12 18.5V22M12 2a3 3 0 013 3v7a3 3 0 11-6 0V5a3 3 0 013-3z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" />
                )}
              </svg>
            </span>
          )}
          <span className="text-sm text-slate-700 truncate flex-1 min-w-0">{nombre ?? 'archivo'}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={elegir} className={BTN_FILA}>Reemplazar</button>
            <button
              onClick={() => { setEstado('vacio'); setPendiente(null); onQuitar() }}
              className={BTN_FILA}
            >
              Quitar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
