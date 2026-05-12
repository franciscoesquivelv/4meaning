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
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSign() {
    setState('loading')
    setErrorMessage('')

    const result = await signAgreementByToken(token, agreementId)

    if (result.error) {
      setErrorMessage(result.error)
      setState('error')
      return
    }

    setState('signed')
  }

  if (state === 'signed') {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/40 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[#F5F0E8] font-semibold text-base">Acuerdo firmado correctamente</p>
        <p className="text-[#B0A898] text-sm text-center">
          Tu firma ha sido registrada. Puedes cerrar esta ventana.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {(state === 'error' && errorMessage) && (
        <p className="text-red-400 text-sm text-center">{errorMessage}</p>
      )}
      <button
        onClick={handleSign}
        disabled={state === 'loading'}
        className="w-full py-4 bg-[#C9A96E] text-[#0C0C0C] font-semibold rounded-xl hover:bg-[#B8935D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === 'loading' ? 'Firmando...' : 'Firmar acuerdo'}
      </button>
    </div>
  )
}
