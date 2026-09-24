'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { LIENZO, TARJETA, ETIQUETA, CAMPO, BOTON, ERROR, CONFIRMACION, ENLACE } from '@/lib/estilos/acceso'

// LA CAUSA REAL DE "Email link is invalid or has expired" QUE VIO PATRICIA:
// `redirectTo` se armaba con `window.location.origin`, que en local es
// `localhost:3000` -- si el correo se manda desde una sesión de desarrollo,
// el link que le llega a quien lo recibe apunta a una URL que solo existe
// en la máquina de quien lo mandó. Auditoría de Daniel y Hugo, 2026-09-23
// (P-015): este es el ÚNICO lugar del repo que usa `redirectTo` (el otro
// correo de Auth, `inviteUserByEmail`, no lo necesita), así que arreglarlo
// aquí cierra el bug completo, sin depender de que `NEXT_PUBLIC_APP_URL` en
// Vercel tenga el valor correcto (hoy no lo tiene: apunta al dominio viejo
// de Vercel, no a app.4meaning.life -- Daniel lo confirmó contra el
// entorno real. Corregir esa variable es aparte, config de la cuenta, no
// código). `NODE_ENV` sí es fiable: Next.js lo reemplaza en build, no
// depende de ningún valor que alguien pueda dejar mal puesto.
const DOMINIO_PRODUCCION = 'https://app.4meaning.life'

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

    const origen = process.env.NODE_ENV === 'production' ? DOMINIO_PRODUCCION : window.location.origin
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: origen + '/nueva-contrasena',
    })

    setLoading(false)

    if (authError) {
      // Se muestra el motivo real PARA LAS CAUSAS QUE SE RECONOCEN. El
      // `else` de abajo YA NO muestra `authError.message` crudo: Hugo
      // encontró (auditoría P-015, 2026-09-23) que cualquier error no
      // previsto por las dos reglas de arriba se mostraba tal cual a
      // cualquier visitante anónimo -- el texto interno de Supabase, sin
      // pasar por nadie del equipo, para quien sea que lo dispare.
      const m = authError.message ?? ''
      if (/only request this after|rate limit|too many/i.test(m)) {
        // "Espera un minuto" MINIMIZA la espera real. El cupo de correos
        // de autenticación es de 2 POR HORA PARA TODO EL PROYECTO (no por
        // cuenta), compartido con las invitaciones de staff -- Daniel lo
        // confirmó en vivo contra el entorno real. Un minuto es lo que
        // tarda el cupo de MENSAJES POR SEGUNDO, no el de recuperar
        // contraseña; decir "un minuto" aquí es la misma clase de mensaje
        // que no explica lo que de verdad pasa.
        setError('Ya se enviaron los correos que el proyecto permite por ahora. Puede tardar hasta una hora en poder reenviarse; si es urgente, avisa al equipo.')
      } else if (/redirect|not allowed|invalid/i.test(m)) {
        setError('La dirección de retorno no está autorizada en el proyecto. Avisa al equipo.')
      } else {
        setError('Ocurrió un error y no se pudo enviar el correo. Intenta de nuevo o avisa al equipo.')
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
