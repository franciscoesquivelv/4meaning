'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SetPasswordPage() {
  const router = useRouter()
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Error al guardar la contraseña. Intenta de nuevo.')
      setLoading(false)
      return
    }

    // Redirect based on role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'participant'
    if (['super_admin', 'admin', 'staff'].includes(role)) {
      router.push('/dashboard')
    } else {
      router.push('/mi-retiro')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <p className="text-[13px] font-bold tracking-[0.32em] uppercase text-ink">
            Trascendencia
          </p>
          <p className="text-[8px] font-bold tracking-[0.28em] uppercase text-muted">
            Portal
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-7">
          <h1 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted mb-1">
            Crear contraseña
          </h1>
          <p className="text-[11px] text-muted mb-6">
            Elige una contraseña para activar tu cuenta.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="password"
              label="Nueva contraseña"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Input
              id="confirm"
              label="Confirmar contraseña"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />

            {error && (
              <p className="text-[11px] text-error bg-error/8 border border-error/20 rounded px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} size="md" className="w-full mt-1">
              Activar cuenta →
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
