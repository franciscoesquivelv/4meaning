'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

export default function LoginPage() {
  const router    = useRouter()
  const params    = useSearchParams()
  const redirectTo = params.get('redirectTo') || '/'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4 mb-10">
        <img
          src="/logo.png"
          alt="Trascendencia"
          className="h-8 w-auto opacity-90 invert"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        <p className="text-[9px] font-bold tracking-[0.28em] uppercase text-muted">
          Portal
        </p>
      </div>

      {/* Card */}
      <div className="bg-surface border border-border rounded-xl p-7">
        <h1 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted mb-6">
          Iniciar sesión
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-[11px] text-error bg-error/8 border border-error/20 rounded px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} size="md" className="w-full mt-1">
            Entrar
          </Button>
        </form>
      </div>

      <p className="text-center text-[10px] text-muted mt-6">
        ¿No tienes acceso?{' '}
        <span className="text-ink/60">Contacta al equipo de Trascendencia.</span>
      </p>
    </div>
  )
}
