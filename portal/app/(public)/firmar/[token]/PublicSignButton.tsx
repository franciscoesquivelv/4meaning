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
        <div className="w-12 h-12 rounded-full bg-terra/10 border border-terra/40 flex items-center justify-center text-terra-ui">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-ink font-semibold text-sm">Acuerdo firmado</p>
          <p className="text-gray-ui text-xs mt-1 leading-relaxed">
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
        <label htmlFor="nombre-firma" className="block text-xs text-gray-ui mb-1.5">
          Nombre completo <span className="text-alerta">*</span>
        </label>
        <input
          id="nombre-firma"
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setErrorMessage('') }}
          placeholder="Escribe tu nombre tal como aparece en tu identificación"
          disabled={state === 'loading'}
          className="w-full min-h-toque px-4 py-3 bg-white border border-line rounded-xl text-sm text-ink placeholder-gray-ui focus:outline-none focus:border-wine disabled:opacity-50 transition-colors"
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
                ? 'bg-wine border-wine'
                : 'border-line bg-white group-hover:border-terra'
            }`}
          >
            {agreed && (
              <svg className="w-3 h-3 text-paper" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-ui leading-relaxed">
          He leído el contenido completo de este acuerdo y acepto sus términos de manera voluntaria y consciente.
        </span>
      </label>

      {/* Error */}
      {errorMessage && (
        <p className="text-alerta text-xs">{errorMessage}</p>
      )}

      {/* Botón */}
      <button
        onClick={handleSign}
        disabled={!canSubmit}
        className="w-full min-h-toque py-4 bg-wine text-paper font-semibold rounded-xl hover:bg-wine/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm mt-1"
      >
        {state === 'loading' ? 'Registrando firma...' : 'Firmar acuerdo →'}
      </button>
    </div>
  )
}
