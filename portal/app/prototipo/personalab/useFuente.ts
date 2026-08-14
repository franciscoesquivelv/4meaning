'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { REMOTO_ACTIVO } from './almacenRemoto'

// De dónde salen los datos del editor.
//
// El prototipo vive FUERA del gate de sesión a propósito, para poder verse
// sin credenciales. Pero el adaptador remoto habla con Supabase, y la RLS
// exige una sesión: sin ella, is_staff() es falso y no hay grants, así que
// no se vería ni un bloque.
//
// De ahí los tres modos. El tercero no es un error: es el estado normal de
// alguien que abrió el prototipo sin haber entrado al portal.

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
