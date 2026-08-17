'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

// Recoge la sesion que llega por enlace de correo y que hasta ahora se perdia.
//
// Supabase entrega la sesion de dos formas segun el flujo:
//   1. Flujo implicito: los tokens vienen en el FRAGMENTO (#access_token=...).
//      El fragmento nunca viaja al servidor, asi que un componente de servidor
//      no puede verlo. Por eso un magic link terminaba rebotando al login.
//      El fragmento SI sobrevive a un redirect 307, de modo que sigue presente
//      cuando el navegador aterriza aqui.
//   2. Flujo PKCE: llega ?code= en la query, y ese si lo puede canjear el
//      route handler de /auth/callback, que es quien puede escribir cookies.
//
// Este componente se monta en la pantalla de login, que es justamente donde
// caen los dos casos cuando algo sale mal.

export default function CompletarSesion() {
  const [estado, setEstado] = useState<'inactivo' | 'entrando' | 'error'>('inactivo')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const url = new URL(window.location.href)

    // Caso PKCE: lo resuelve el route handler, que si puede sellar cookies.
    const code = url.searchParams.get('code')
    if (code) {
      setEstado('entrando')
      window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}`)
      return
    }

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))

    // Supabase reporta sus fallos tambien en el fragmento.
    const errorDescripcion = hash.get('error_description') ?? url.searchParams.get('error_description')
    if (errorDescripcion) {
      setEstado('error')
      setMensaje(decodeURIComponent(errorDescripcion.replace(/\+/g, ' ')))
      return
    }

    const access_token = hash.get('access_token')
    const refresh_token = hash.get('refresh_token')
    if (!access_token || !refresh_token) return

    // Si el enlace es de recuperacion, la persona va a elegir contrasena.
    const tipo = hash.get('type')

    setEstado('entrando')

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) {
          setEstado('error')
          setMensaje('El enlace ya expiró o se usó antes. Pide uno nuevo.')
          return
        }
        // Se limpia el fragmento para que los tokens no queden en el historial.
        window.history.replaceState(null, '', window.location.pathname)
        window.location.replace(tipo === 'recovery' ? '/nueva-contrasena' : '/')
      })
      .catch(() => {
        setEstado('error')
        setMensaje('No se pudo completar el acceso. Pide un enlace nuevo.')
      })
  }, [])

  if (estado === 'inactivo') return null

  return (
    <div className="w-full max-w-sm mb-4">
      {estado === 'entrando' ? (
        <p className="text-sm text-[#C9A96E] text-center">Entrando…</p>
      ) : (
        <p className="text-sm text-red-400 text-center">{mensaje}</p>
      )}
    </div>
  )
}
