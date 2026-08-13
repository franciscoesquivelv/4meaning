'use client'

import { useRef, useState } from 'react'
import type { TipoBloque } from './contenido'
import { BTN_FILA } from './tokens'

// Subida simulada. El archivo NO sale del navegador: se usa
// URL.createObjectURL para poder verlo, y se pierde al recargar. La pantalla
// lo dice en vez de fingir que hay un bucket detras.
//
// Seis estados, porque los cinco felices no son el problema: el que hay que
// poder ver y disenar es el que falla.

type Estado = 'vacio' | 'eligiendo' | 'subiendo' | 'listo' | 'fallido'

const ACEPTA: Record<string, string> = {
  archivo: 'application/pdf',
  imagen: 'image/*',
  video: 'video/mp4,video/quicktime',
}

const MOTIVOS = [
  'Se cortó la conexión al 62 por ciento. El archivo sigue en tu computadora, no se perdió nada.',
  'Pesa 240 MB y el máximo son 200. Comprímelo o divídelo en dos.',
  'El PDF tiene contraseña. Quítasela y vuelve a subirlo.',
  'Falló del lado nuestro, no del tuyo. Vuelve a intentar en un minuto.',
]

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
  onListo: (datos: { nombreArchivo: string; peso: string; url: string }) => void
  onQuitar: () => void
}) {
  const [estado, setEstado] = useState<Estado>(nombre || url ? 'listo' : 'vacio')
  const [avance, setAvance] = useState(0)
  const [motivo, setMotivo] = useState('')
  const [pendiente, setPendiente] = useState<File | null>(null)
  const entrada = useRef<HTMLInputElement>(null)
  const forzarFallo = useRef(false)

  function elegir(fallar: boolean) {
    forzarFallo.current = fallar
    entrada.current?.click()
  }

  function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setPendiente(f)
    setEstado('subiendo')
    setAvance(0)

    const debeFallar = forzarFallo.current
    let pct = 0
    const reloj = setInterval(() => {
      pct += Math.random() * 18 + 7
      if (debeFallar && pct >= 62) {
        clearInterval(reloj)
        setMotivo(MOTIVOS[Math.floor(Math.random() * MOTIVOS.length)])
        setEstado('fallido')
        return
      }
      if (pct >= 100) {
        clearInterval(reloj)
        setAvance(100)
        const objeto = URL.createObjectURL(f)
        onListo({ nombreArchivo: f.name, peso: pesoLegible(f.size), url: objeto })
        setEstado('listo')
        return
      }
      setAvance(Math.min(pct, 99))
    }, 260)
  }

  function reintentar() {
    if (!pendiente) {
      setEstado('vacio')
      return
    }
    forzarFallo.current = false
    setEstado('subiendo')
    setAvance(0)
    let pct = 0
    const reloj = setInterval(() => {
      pct += Math.random() * 20 + 10
      if (pct >= 100) {
        clearInterval(reloj)
        const objeto = URL.createObjectURL(pendiente)
        onListo({ nombreArchivo: pendiente.name, peso: pesoLegible(pendiente.size), url: objeto })
        setEstado('listo')
        return
      }
      setAvance(Math.min(pct, 99))
    }, 220)
  }

  return (
    <div>
      <input
        ref={entrada}
        type="file"
        accept={ACEPTA[tipo] ?? '*/*'}
        onChange={alElegir}
        className="hidden"
      />

      {estado === 'vacio' && (
        <div className="border border-dashed border-slate-300 rounded-lg px-4 py-6 text-center">
          <p className="text-sm text-slate-500">
            {tipo === 'archivo' ? 'Ningún PDF todavía.' : tipo === 'video' ? 'Ningún video todavía.' : 'Ninguna imagen todavía.'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <button onClick={() => elegir(false)} className={BTN_FILA}>
              Elegir archivo
            </button>
            <button
              onClick={() => elegir(true)}
              className={`${BTN_FILA} text-slate-400`}
              title="Demostración: fuerza un fallo para poder ver ese estado"
            >
              Simular fallo
            </button>
          </div>
        </div>
      )}

      {estado === 'subiendo' && (
        <div className="border border-slate-200 rounded-lg px-4 py-3.5">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-sm text-slate-700 truncate">{pendiente?.name}</span>
            <span className="text-xs text-slate-400 tabular-nums flex-shrink-0">
              {Math.round(avance)} %
            </span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-800 transition-[width] duration-200"
              style={{ width: `${avance}%` }}
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
              <button
                onClick={reintentar}
                className="text-xs font-medium text-red-700 border border-red-300 bg-white px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors"
              >
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
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" />
                )}
              </svg>
            </span>
          )}
          <span className="text-sm text-slate-700 truncate flex-1 min-w-0">{nombre ?? 'archivo'}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={() => elegir(false)} className={BTN_FILA}>Reemplazar</button>
            <button
              onClick={() => { setEstado('vacio'); setPendiente(null); onQuitar() }}
              className={BTN_FILA}
            >
              Quitar
            </button>
          </div>
        </div>
      )}

      <p className="text-[11px] text-amber-700 mt-2 leading-relaxed">
        Prototipo: el archivo no se sube a ningún lado y se pierde al recargar.
      </p>
    </div>
  )
}
