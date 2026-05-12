'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
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

    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex flex-col items-center justify-center px-6">
      {/* Branding */}
      <div className="text-center mb-10">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#F5F0E8] tracking-wide">
          4Meaning
        </h1>
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#C9A96E] mt-2">
          Portal Trascendencia
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-0">
          {/* Email */}
          <label className="text-xs text-[#B0A898] mb-1.5">Correo electrónico</label>
          <input
            name="email"
            type="email"
            required
            placeholder="tu@correo.com"
            className="bg-[#0C0C0C] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E]/50 w-full transition-colors"
          />

          {/* Password */}
          <label className="text-xs text-[#B0A898] mb-1.5 mt-4">Contraseña</label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="bg-[#0C0C0C] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E]/50 w-full transition-colors"
          />

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 mt-3">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 bg-[#C9A96E] text-[#0C0C0C] font-semibold text-sm rounded-xl hover:bg-[#B8935D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 border-t border-white/10" />

        {/* Forgot password */}
        <Link
          href="/recuperar-contrasena"
          className="mt-4 block text-center text-xs text-[#B0A898] hover:text-[#C9A96E] transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </div>
  )
}
