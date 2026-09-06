'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { LIENZO, TARJETA, ETIQUETA, CAMPO, BOTON, ERROR, CONFIRMACION, ENLACE } from '@/lib/estilos/acceso'

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
    <div className={LIENZO}>
      {/* Marca. El lockup lleva espacio y va en la sans del sistema: Cormorant
          es la familia de las citas, nunca del chrome. */}
      <div className="text-center mb-10">
        <p className="display text-[30px] text-paper">4 Meaning</p>
        <p className="cejilla cejilla-claro mt-3">
          Portal de gestión
        </p>
      </div>

      <div className={TARJETA}>
        <h1 className="text-lg font-semibold text-paper mb-1">Elige tu contraseña</h1>
        <p className="text-xs text-paper/70 mb-6">
          Con esta entras al portal de aquí en adelante.
        </p>

        {!lista ? (
          <p className="text-sm text-paper/70">Un momento…</p>
        ) : listo ? (
          <p className={CONFIRMACION}>
            Listo. Te llevamos al portal.
          </p>
        ) : (
          <form onSubmit={guardar}>
            <label htmlFor="contrasena" className={ETIQUETA}>Nueva contraseña</label>
            <input
              id="contrasena"
              type="password"
              required
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              placeholder="Al menos 8 caracteres"
              className={CAMPO}
            />

            <label htmlFor="repetida" className={`${ETIQUETA} mt-4`}>Repítela</label>
            <input
              id="repetida"
              type="password"
              required
              value={repetida}
              onChange={e => setRepetida(e.target.value)}
              className={CAMPO}
            />

            {error && <p className={`${ERROR} mt-3`}>{error}</p>}

            <button
              type="submit"
              disabled={cargando}
              className={`${BOTON} mt-6`}
            >
              {cargando ? 'Guardando…' : 'Guardar y entrar'}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-line-dk" />

        <a
          href="/recuperar-contrasena"
          className={`${ENLACE} mt-4`}
        >
          Pedir un enlace nuevo
        </a>
      </div>
    </div>
  )
}
