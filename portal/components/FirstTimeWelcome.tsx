'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'trascendencia_welcomed_v1'

const FEATURES = [
  { label: 'Mi Retiro', description: 'la información general de tu evento' },
  { label: 'Programa', description: 'el itinerario día por día' },
  { label: 'Acuerdos', description: 'documentos que debes firmar' },
  { label: 'Formulario', description: 'cuéntanos su historia' },
]

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-terra">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

export default function FirstTimeWelcome() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const welcomed = localStorage.getItem(STORAGE_KEY)
      if (!welcomed) {
        setVisible(true)
      }
    } catch {
      // Sin localStorage no se muestra.
    }
  }, [])

  function handleDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible) return null

  // Esta hoja se abre encima de la app del participante, que desde el 26 de
  // agosto es papel. Estaba en negro, crema y el dorado que no es de la marca,
  // asi que la primera vez que alguien entraba a una app clara le saltaba una
  // hoja oscura de otra marca. Ahora es la misma superficie que hay debajo.
  return (
    <div className="fixed inset-0 z-50 bg-dom-deep/80 backdrop-blur-sm flex items-start justify-center px-4 overflow-y-auto">
      <div className="max-w-sm w-full mt-20 mb-10 bg-paper rounded-2xl p-8 border border-line shadow-2xl">
        {/* Sello */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-terra/10 border border-terra/40 flex items-center justify-center text-terra">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
            </svg>
          </div>
        </div>

        {/* Titulo. En la sans del sistema: Cormorant es la familia de las
            citas, y el titulo de una pantalla no es una cita. La jerarquia la
            da la escala y el aire, no el peso. */}
        <h1 className="display text-[28px] text-ink text-center mb-3">
          Bienvenido a tu portal
        </h1>

        {/* Bajada */}
        <p className="text-sm text-gray-ui text-center leading-relaxed mb-8">
          Aquí encontrarás todo lo que necesitas para prepararte y vivir tu retiro Trascendencia.
        </p>

        {/* Lo que hay dentro */}
        <ul className="space-y-4 mb-8">
          {FEATURES.map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircleIcon />
              <div>
                <span className="text-sm font-semibold text-ink">{f.label}</span>
                <span className="text-sm text-gray-ui">: {f.description}</span>
              </div>
            </li>
          ))}
        </ul>

        {/* Accion principal: el mismo primario que el resto de la app. */}
        <button
          onClick={handleDismiss}
          className="w-full min-h-toque py-4 bg-wine text-paper font-semibold text-sm rounded-xl hover:bg-wine/90 transition-colors active:scale-[0.98]"
        >
          Entendido, comenzar →
        </button>
      </div>
    </div>
  )
}
