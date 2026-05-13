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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
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
      // localStorage not available — don't show
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center px-4 overflow-y-auto">
      <div className="max-w-sm w-full mt-20 mb-10 bg-[#111] rounded-2xl p-8 border border-[#C9A96E]/20 shadow-2xl">
        {/* Logo / ornament */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#F5F0E8] text-center mb-3">
          Bienvenido a tu portal
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-[#B0A898] text-center leading-relaxed mb-8">
          Aquí encontrarás todo lo que necesitas para prepararte y vivir tu retiro Trascendencia.
        </p>

        {/* Feature list */}
        <ul className="space-y-4 mb-8">
          {FEATURES.map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircleIcon />
              <div>
                <span className="text-sm font-semibold text-[#F5F0E8]">{f.label}</span>
                <span className="text-sm text-[#B0A898]"> — {f.description}</span>
              </div>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <button
          onClick={handleDismiss}
          className="w-full py-4 bg-[#C9A96E] text-[#0C0C0C] font-semibold text-sm rounded-xl hover:bg-[#D4B07A] transition-colors active:scale-[0.98]"
        >
          Entendido, comenzar →
        </button>
      </div>
    </div>
  )
}
