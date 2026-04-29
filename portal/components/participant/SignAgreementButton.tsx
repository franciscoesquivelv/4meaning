'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function SignAgreementButton({ agreementId }: { agreementId: string }) {
  const [loading,   setLoading]   = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()

  async function handleSign() {
    if (!confirmed) {
      setConfirmed(true)
      return
    }

    setLoading(true)
    const supabase = createClient()

    await supabase
      .from('agreements')
      .update({
        status:            'signed',
        signed_at:         new Date().toISOString(),
        signed_user_agent: navigator.userAgent,
      })
      .eq('id', agreementId)

    // Also mark as "viewed" step if not already done
    router.refresh()
    setLoading(false)
  }

  if (!confirmed) {
    return (
      <Button
        onClick={handleSign}
        size="lg"
        className="w-full"
      >
        Revisar y firmar
      </Button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-warning/8 border border-warning/20 rounded-lg px-4 py-3">
        <p className="text-[11px] text-warning font-semibold mb-1">¿Confirmar firma?</p>
        <p className="text-[10px] text-warning/70 leading-relaxed">
          Al confirmar, registramos tu aceptación de este acuerdo de forma permanente.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" size="md" onClick={() => setConfirmed(false)}>
          Cancelar
        </Button>
        <Button size="md" loading={loading} onClick={handleSign} className="w-full">
          Sí, confirmo
        </Button>
      </div>
    </div>
  )
}
