'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// Destino del correo de recuperacion. Esta ruta faltaba: el flujo mandaba
// a /nueva-contrasena y ahi no habia nada, asi que todo el que pedia
// recuperar su acceso aterrizaba en un 404.

export default function NuevaContrasenaPage() {
  const router = useRouter()
  const [lista, setLista] = useState(false)
  const [contrasena, setContrasena] = useState('')
  const [repetida, setRepetida] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Supabase entrega la sesion de recuperacion de dos formas segun el flujo:
  // como `code` en la query (PKCE) o como tokens en el fragmento de la URL.
  // Se cubren las dos para que el link del correo funcione en ambos casos.
  useEffect(() => {
    async function establecerSesion() {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')

      if (code) {
        const { error: e } = await supabase.auth.exchangeCodeForSession(code)
        if (e) setError('El enlace ya expiró o se usó antes. Pide uno nuevo.')
        setLista(true)
        return
      }

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const access_token = hash.get('access_token')
      const refresh_token = hash.get('refresh_token')

      if (access_token && refresh_token) {
        const { error: e } = await supabase.auth.setSession({ access_token, refresh_token })
        if (e) setError('El enlace ya expiró o se usó antes. Pide uno nuevo.')
        setLista(true)
        return
      }

      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        setError('Abre esta página desde el enlace que te llegó por correo.')
      }
      setLista(true)
    }

    establecerSesion()
    // El cliente de Supabase se crea una vez por render y no cambia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (contrasena.length < 8) {
      setError('La contraseña necesita al menos 8 caracteres.')
      return
    }
    if (contrasena !== repetida) {
      setError('Las dos contraseñas no coinciden.')
      return
    }

    setCargando(true)
    const { error: e2 } = await supabase.auth.updateUser({ password: contrasena })
    setCargando(false)

    if (e2) {
      setError('No se pudo guardar. Pide un enlace nuevo e inténtalo otra vez.')
      return
    }

    setListo(true)
    setTimeout(() => router.push('/'), 1600)
  }

  return (
    <div className="bg-[#0C0C0C] min-h-screen flex flex-col items-center justify-center px-6">
      <p className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#F5F0E8] tracking-wide">
        4Meaning
      </p>
      <p className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] mt-1 mb-10">
        Portal de gestión
      </p>

      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-lg font-semibold text-[#F5F0E8] mb-1">Elige tu contraseña</h1>
        <p className="text-xs text-[#B0A898] mb-6">
          Con esta entras al portal de aquí en adelante.
        </p>

        {!lista ? (
          <p className="text-sm text-[#B0A898]">Un momento…</p>
        ) : listo ? (
          <p className="text-sm text-[#C9A96E]">
            Listo. Te llevamos al portal.
          </p>
        ) : (
          <form onSubmit={guardar}>
            <label className="block text-xs text-[#B0A898] mb-1.5">Nueva contraseña</label>
            <input
              type="password"
              required
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              placeholder="Al menos 8 caracteres"
              className="w-full bg-[#0C0C0C] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E]/50"
            />

            <label className="block text-xs text-[#B0A898] mt-4 mb-1.5">Repítela</label>
            <input
              type="password"
              required
              value={repetida}
              onChange={e => setRepetida(e.target.value)}
              className="w-full bg-[#0C0C0C] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E]/50"
            />

            {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

            <button
              type="submit"
              disabled={cargando}
              className="mt-6 w-full py-3 bg-[#C9A96E] text-[#0C0C0C] font-semibold rounded-xl hover:bg-[#B8935D] transition-colors disabled:opacity-50"
            >
              {cargando ? 'Guardando…' : 'Guardar y entrar'}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-white/10" />

        <a
          href="/recuperar-contrasena"
          className="mt-4 text-center block text-xs text-[#B0A898] hover:text-[#C9A96E] transition-colors"
        >
          Pedir un enlace nuevo
        </a>
      </div>
    </div>
  )
}
