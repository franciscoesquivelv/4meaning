'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { LIENZO, TARJETA, ETIQUETA, CAMPO, BOTON, ERROR, CONFIRMACION, ENLACE } from '@/lib/estilos/acceso'

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
      // Se muestra el motivo real. El mensaje generico anterior escondia
      // causas accionables como el limite de frecuencia o una URL de
      // redireccion que no esta en la lista blanca del proyecto.
      const m = authError.message ?? ''
      if (/only request this after|rate limit|too many/i.test(m)) {
        setError('Ya se envió un correo hace un momento. Espera un minuto y vuelve a intentar.')
      } else if (/redirect|not allowed|invalid/i.test(m)) {
        setError('La dirección de retorno no está autorizada en el proyecto. Avisa al equipo.')
      } else {
        setError(m || 'Ocurrió un error. Intenta de nuevo.')
      }
      return
    }

    setSuccess(true)
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

      {/* Tarjeta */}
      <div className={TARJETA}>
        <h1 className="text-lg font-semibold text-paper mb-1">
          Recuperar acceso
        </h1>
        <p className="text-xs text-paper/70 mb-6">
          Te enviaremos un link a tu correo.
        </p>

        {success ? (
          <p className={CONFIRMACION}>
            Revisa tu correo. Si tienes una cuenta, recibirás el link en los próximos minutos.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className={ETIQUETA}>
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className={CAMPO}
            />

            {error && (
              <p className={`${ERROR} mt-3`}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`${BOTON} mt-6`}
            >
              {loading ? 'Enviando...' : 'Enviar link'}
            </button>
          </form>
        )}

        {/* Filete */}
        <div className="mt-6 border-t border-line-dk" />

        {/* Volver */}
        <a
          href="/login"
          className={`${ENLACE} mt-4`}
        >
          ← Volver al login
        </a>
      </div>
    </div>
  )
}
