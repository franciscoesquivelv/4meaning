'use client'

import { useState } from 'react'
import { signAgreementByToken } from './actions'

type State = 'idle' | 'loading' | 'signed' | 'error'

interface Props {
  token: string
  agreementId: string
}

export default function PublicSignButton({ token, agreementId }: Props) {
  const [state, setState] = useState<State>('idle')
  const [name, setName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSign() {
    if (!name.trim()) {
      setErrorMessage('Escribe tu nombre completo para continuar.')
      return
    }
    if (!agreed) {
      setErrorMessage('Debes confirmar que leíste el acuerdo.')
      return
    }

    setState('loading')
    setErrorMessage('')

    const result = await signAgreementByToken(token, agreementId, name.trim())

    if (result.error) {
      setErrorMessage(result.error)
      setState('error')
      return
    }

    setState('signed')
  }

  if (state === 'signed') {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="w-12 h-12 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/40 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-[#C9A96E]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-[#F5F0E8] font-semibold text-sm">Acuerdo firmado</p>
          <p className="text-[#B0A898] text-xs mt-1 leading-relaxed">
            Tu firma quedó registrada. Recibirás un correo de confirmación en breve.
          </p>
        </div>
      </div>
    )
  }

  const canSubmit = name.trim().length > 0 && agreed && state !== 'loading'

  return (
    <div className="flex flex-col gap-4">

      {/* Nombre completo */}
      <div>
        <label className="block text-xs text-[#B0A898] mb-1.5">
          Nombre completo <span className="text-[#C9A96E]">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setErrorMessage('') }}
          placeholder="Escribe tu nombre tal como aparece en tu identificación"
          disabled={state === 'loading'}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-[#F5F0E8] placeholder-[#4A4541] focus:outline-none focus:border-[#C9A96E]/50 disabled:opacity-50 transition-colors"
        />
      </div>

      {/* Checkbox de aceptación */}
      <label className="flex items-start gap-3 cursor-pointer group select-none">
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => { setAgreed(e.target.checked); setErrorMessage('') }}
            disabled={state === 'loading'}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              agreed
                ? 'bg-[#C9A96E] border-[#C9A96E]'
                : 'border-white/20 bg-white/5 group-hover:border-white/40'
            }`}
          >
            {agreed && (
              <svg className="w-3 h-3 text-[#0C0C0C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs text-[#B0A898] leading-relaxed">
          He leído el contenido completo de este acuerdo y acepto sus términos de manera voluntaria y consciente.
        </span>
      </label>

      {/* Error */}
      {errorMessage && (
        <p className="text-red-400 text-xs">{errorMessage}</p>
      )}

      {/* Botón */}
      <button
        onClick={handleSign}
        disabled={!canSubmit}
        className="w-full py-4 bg-[#C9A96E] text-[#0C0C0C] font-semibold rounded-xl hover:bg-[#B8935D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm mt-1"
      >
        {state === 'loading' ? 'Registrando firma...' : 'Firmar acuerdo →'}
      </button>
    </div>
  )
}
