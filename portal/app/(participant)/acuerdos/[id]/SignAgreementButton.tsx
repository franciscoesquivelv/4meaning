'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function SignAgreementButton({ agreementId }: { agreementId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSign() {
    setLoading(true)
    setError('')

    const { error: updateError } = await supabase
      .from('agreements')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
        signed_user_agent: navigator.userAgent,
      })
      .eq('id', agreementId)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.refresh()
  }

  if (confirming) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        padding: '20px 24px',
      }}>
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>¿Confirmar firma?</p>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
          Al firmar, confirmas que has leído y aceptas los términos de este acuerdo.
        </p>
        {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleSign}
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Firmando...' : 'Sí, firmar'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={() => setConfirming(true)}
        style={{
          padding: '12px 32px',
          background: '#111',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          width: '100%',
        }}
      >
        Firmar acuerdo
      </button>
      <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>
        Al presionar firmar, aceptas los términos de este acuerdo.
      </p>
    </div>
  )
}
