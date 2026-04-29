'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { loginAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending} size="md" className="w-full mt-1">
      Entrar
    </Button>
  )
}

function LoginForm() {
  const params     = useSearchParams()
  const redirectTo = params.get('redirectTo') || '/'

  const [state, formAction] = useFormState(loginAction, null)

  // Auto-focus email field
  const emailRef = useRef<HTMLInputElement>(null)
  useEffect(() => { emailRef.current?.focus() }, [])

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <img src="/logo.png" alt="Trascendencia" className="h-7 w-auto" />
        <p className="text-[8px] font-bold tracking-[0.28em] uppercase text-muted">
          Portal
        </p>
      </div>

      {/* Card */}
      <div className="bg-surface border border-border rounded-xl p-7">
        <h1 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted mb-6">
          Iniciar sesión
        </h1>

        <form action={formAction} className="flex flex-col gap-4">
          {/* Pass redirectTo through the form */}
          <input type="hidden" name="next" value={redirectTo} />

          <Input
            ref={emailRef}
            id="email"
            name="email"
            label="Correo electrónico"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
          />
          <Input
            id="password"
            name="password"
            label="Contraseña"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />

          {state?.error && (
            <p className="text-[11px] text-error bg-error/8 border border-error/20 rounded px-3 py-2">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>
      </div>

      <p className="text-center text-[10px] text-muted mt-6">
        ¿No tienes acceso?{' '}
        <span className="text-ink/60">Contacta al equipo de Trascendencia.</span>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm" />}>
      <LoginForm />
    </Suspense>
  )
}
