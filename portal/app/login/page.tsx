'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import CompletarSesion from '@/components/CompletarSesion'
import { LIENZO, TARJETA, ETIQUETA, CAMPO, BOTON, ERROR, ENLACE } from '@/lib/estilos/acceso'

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

  // El umbral es la portada, y una portada de Trascendencia es vino profundo:
  // es el hero del sitio real, no una decision de esta pantalla. El cuerpo de
  // la app aterriza en papel, igual que el sitio pasa del hero al texto.
  //
  // Antes esta pantalla era negro con crema y el dorado fantasma, tres colores
  // que no estan en ninguna paleta de 4 Meaning, y escribia el
  // nombre de la casa en Cormorant, que en el sistema de marca es la familia
  // de las citas y nunca del chrome.
  return (
    <div className={LIENZO}>
      {/* Marca */}
      <div className="text-center mb-10">
        {/* El lockup lleva espacio: la casa se llama 4 Meaning. Y va en la
            sans del sistema, con la jerarquia por escala y aire que pide la
            marca, no por negritas. Contraste medido: 15.96 a 1. */}
        <h1 className="display text-[34px] text-paper">4 Meaning</h1>
        <p className="cejilla cejilla-claro mt-3">
          Portal Trascendencia
        </p>
      </div>

      {/* Recoge la sesion cuando se llega desde un enlace de correo.
          Sin esto, los tokens del fragmento se perdian y el magic link
          rebotaba de vuelta a esta misma pantalla. */}
      <CompletarSesion />

      {/* Tarjeta. Vino sobre vino profundo es la misma elevacion que el sitio
          usa entre el hero y el bloque de las tres preguntas. */}
      <div className={TARJETA}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-0">
          {/* Correo */}
          <label htmlFor="email" className={ETIQUETA}>Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu@correo.com"
            className={CAMPO}
          />

          {/* Contraseña */}
          <label htmlFor="password" className={`${ETIQUETA} mt-4`}>Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className={CAMPO}
          />

          {/* Error. Enmarcado y no como texto rojo suelto: sobre vino profundo
              no hay ningun rojo de la paleta que sea legible como texto, y el
              vino de alerta si lo es como fondo. Contraste 7.39 a 1. */}
          {error && (
            <p className={`${ERROR} mt-4`}>{error}</p>
          )}

          {/* Accion principal. Sobre fondo vino el primario no puede ser vino,
              asi que se invierte a papel. La terracota queda para el acento,
              que es su dosis en el sistema. Contraste 15.96 a 1. */}
          <button
            type="submit"
            disabled={loading}
            className={`${BOTON} mt-6`}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Filete */}
        <div className="mt-6 border-t border-line-dk" />

        {/* Recuperar acceso */}
        <Link
          href="/recuperar-contrasena"
          className={`${ENLACE} mt-4`}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </div>
  )
}
