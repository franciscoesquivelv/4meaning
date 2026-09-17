'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import CompletarSesion from '@/components/CompletarSesion'
import CampoContrasena from '@/components/CampoContrasena'
import { LIENZO, TARJETA, ETIQUETA, CAMPO, BOTON, ERROR, ENLACE } from '@/lib/estilos/acceso'

// A DÓNDE VUELVE DESPUÉS DE ENTRAR. Antes esta pantalla mandaba siempre a
// `/`, sin mirar de dónde venía quien inició sesión. Eso rompía cualquier
// intento de "inicia sesión y seguimos con tu compra": el enlace prometía
// continuar y la persona aterrizaba en su casa de siempre, sin rastro de lo
// que estaba haciendo. Es el bloqueo que dejó escrito
// docs/DISENO-REGISTRO-PERSONALAB.md en su sección 2.
//
// SOLO RUTAS INTERNAS, nunca una URL completa. `next=https://otro-sitio.com`
// convertiría este formulario en un redirector abierto: alguien manda un
// enlace de phishing con la forma `app.4meaning.life/login?next=...` y, tras
// un login real y legítimo, la víctima aterriza en un sitio ajeno confiando
// en que salió de aquí.
//
// CORREGIDO EL 2026-09-11. La primera versión bloqueaba con reglas de texto
// (`startsWith('//')`, `includes('://')`) y Hugo la rompió con ejecución
// real, no en teoría: `/\evil.com` no empieza con `//` ni lleva `://`, pasa
// esas reglas, y el navegador lo normaliza a `//evil.com`, salto de origen,
// porque trata la barra invertida igual que la barra normal dentro de un
// esquema especial. Y una tabulación codificada (`%09`) llega ya decodificada
// a esta función por `useSearchParams()`, así que `/\t/evil.com` también
// colaba: el navegador descarta tabs y saltos de línea al normalizar.
//
// La corrección no agrega una regla más a la lista: dejar de adivinar.
// `new URL()` resuelve `next` con el MISMO parser que el navegador va a usar
// para navegar de verdad, así que cualquier normalización (barras invertidas,
// tabs, lo que sea) ya ocurrió antes de comparar. Solo se compara el origen
// resultante contra el propio.
function destinoSeguro(next: string | null): string {
  if (!next) return '/'
  try {
    const url = new URL(next, window.location.origin)
    if (url.origin !== window.location.origin) return '/'
    return url.pathname + url.search + url.hash
  } catch {
    return '/'
  }
}

function LoginForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const params = useSearchParams()

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

    window.location.href = destinoSeguro(params.get('next'))
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
          <CampoContrasena
            id="password"
            name="password"
            required
            placeholder="••••••••"
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

// `useSearchParams` exige un limite de Suspense alrededor en el App Router,
// o el build falla. El lienzo vacio de reserva no llega a mostrarse nunca en
// uso real, porque esta pantalla no trae datos que tarden: es la primera
// pintura antes de que React lea el `next` de la URL, milisegundos.
export default function LoginPage() {
  return (
    <Suspense fallback={<div className={LIENZO} />}>
      <LoginForm />
    </Suspense>
  )
}
