'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

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

    // Hard navigation so the server reads the fresh session cookie
    window.location.href = '/'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 320 }}>
        <h1 style={{ marginBottom: 24, fontSize: 20, fontWeight: 600 }}>Iniciar sesión</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            name="email" type="email" required placeholder="Correo electrónico"
            style={{ padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }}
          />
          <input
            name="password" type="password" required placeholder="Contraseña"
            style={{ padding: '10px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }}
          />
          {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
          <button
            type="submit" disabled={loading}
            style={{ padding: '10px 12px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
