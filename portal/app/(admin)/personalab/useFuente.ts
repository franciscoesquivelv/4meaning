'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { REMOTO_ACTIVO } from './almacenRemoto'

// De dónde salen los datos del editor.
//
// El workspace ya vive dentro del portal, así que el layout garantiza que
// hay sesión y que es de alguien del equipo. El tercer modo dejó de ser el
// estado normal de quien abrió una maqueta sin credenciales, y pasó a ser
// lo que siempre debió ser: una sesión que venció mientras trabajabas.
//
// Se queda porque eso sí pasa, y porque la RLS no perdona: sin sesión,
// is_staff() es falso y el editor no vería ni un bloque.

export type Fuente =
  | { modo: 'cargando' }
  | { modo: 'local' }                          // localStorage, sin base
  | { modo: 'remoto'; email: string }          // Supabase, con sesión
  | { modo: 'sin-sesion' }                     // remoto encendido, sin entrar

export function useFuente(): Fuente {
  const [fuente, setFuente] = useState<Fuente>(
    REMOTO_ACTIVO ? { modo: 'cargando' } : { modo: 'local' }
  )

  useEffect(() => {
    if (!REMOTO_ACTIVO) return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // getUser() no tiene tiempo límite propio. Si Supabase no responde, el
    // editor se queda en "Comprobando tu sesión" para siempre. Ocho segundos
    // y se decide, en vez de dejar a alguien mirando un esqueleto.
    let resuelto = false
    const reloj = setTimeout(() => {
      if (!resuelto) setFuente({ modo: 'sin-sesion' })
    }, 8000)

    supabase.auth.getUser().then(({ data }) => {
      resuelto = true
      clearTimeout(reloj)
      if (data.user) setFuente({ modo: 'remoto', email: data.user.email ?? '' })
      else setFuente({ modo: 'sin-sesion' })
    }).catch(() => {
      resuelto = true
      clearTimeout(reloj)
      setFuente({ modo: 'sin-sesion' })
    })

    return () => clearTimeout(reloj)
  }, [])

  return fuente
}
