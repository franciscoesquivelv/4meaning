'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/nueva-contrasena',
    })

    setLoading(false)

    if (authError) {
      setError('Ocurrió un error. Intenta de nuevo.')
      return
    }

    setSuccess(true)
  }

  return (
    <div className="bg-[#0C0C0C] min-h-screen flex flex-col items-center justify-center px-6">
      {/* Branding */}
      <p className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#F5F0E8] tracking-wide">
        4Meaning
      </p>
      <p className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] mt-1 mb-10">
        Portal de gestión
      </p>

      {/* Card */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-lg font-semibold text-[#F5F0E8] mb-1">
          Recuperar acceso
        </h1>
        <p className="text-xs text-[#B0A898] mb-6">
          Te enviaremos un link a tu correo.
        </p>

        {success ? (
          <p className="text-sm text-[#C9A96E]">
            Revisa tu correo. Si tienes una cuenta, recibirás el link en los próximos minutos.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="block text-xs text-[#B0A898] mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full bg-[#0C0C0C] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E]/50"
            />

            {error && (
              <p className="text-sm text-red-400 mt-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3 bg-[#C9A96E] text-[#0C0C0C] font-semibold rounded-xl hover:bg-[#B8935D] transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar link'}
            </button>
          </form>
        )}

        {/* Separator */}
        <div className="mt-6 border-t border-white/10" />

        {/* Back to login */}
        <a
          href="/login"
          className="mt-4 text-center block text-xs text-[#B0A898] hover:text-[#C9A96E] transition-colors"
        >
          ← Volver al login
        </a>
      </div>
    </div>
  )
}
