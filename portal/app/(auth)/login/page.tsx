'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/mi-retiro'

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }

    window.location.href = redirectTo
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email"
          className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
          Correo electrónico <span className="text-ink/40">*</span>
        </label>
        <input
          id="email" name="email" type="email"
          required autoComplete="email" placeholder="tu@correo.com"
          className="w-full bg-surface2 border border-border rounded px-3 py-2.5
            text-ink text-[13px] placeholder:text-border-hi
            outline-none focus:border-border-hi transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password"
          className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
          Contraseña <span className="text-ink/40">*</span>
        </label>
        <input
          id="password" name="password" type="password"
          required autoComplete="current-password" placeholder="••••••••"
          className="w-full bg-surface2 border border-border rounded px-3 py-2.5
            text-ink text-[13px] placeholder:text-border-hi
            outline-none focus:border-border-hi transition-colors"
        />
      </div>

      {error && (
        <p className="text-[11px] text-error bg-error/8 border border-error/20
          rounded px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-1 bg-ink text-bg text-[11px] font-bold uppercase
          tracking-[0.14em] py-3 rounded-lg hover:bg-ink/90 transition-colors
          cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}

export default function LoginPage() {
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

        <Suspense fallback={
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-10 bg-surface2 rounded" />
            <div className="h-10 bg-surface2 rounded" />
            <div className="h-10 bg-ink/10 rounded-lg mt-1" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>

      <p className="text-center text-[10px] text-muted mt-6">
        ¿No tienes acceso?{' '}
        <span className="text-ink/60">Contacta al equipo de Trascendencia.</span>
      </p>
    </div>
  )
}
