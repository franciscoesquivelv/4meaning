import Link from 'next/link'
import { miCuenta } from '@/lib/personalab/cuenta'
import Fallo from '../experiencia/Fallo'

// Configuración de cuenta. Chica a propósito: dos datos y un enlace.
// `/nueva-contrasena` ya funciona con la sesión activa, sin necesitar el
// enlace de recuperación por correo, así que no hace falta construir otra
// pantalla para cambiar la contraseña.

export default async function Cuenta() {
  const r = await miCuenta()

  if (r.estado === 'fallo') return <Fallo motivo={r.motivo} />
  if (r.estado === 'sin-acceso') return <Fallo motivo="sin sesión al leer la cuenta" />

  const { email, nombre } = r.datos

  return (
    <main className="max-w-[520px] mx-auto px-6 py-14 md:py-20">
      <h1 className="display text-[32px] md:text-[42px] text-dom">
        Tu cuenta
      </h1>

      <div className="mt-10 border-t border-line">
        <div className="py-5 border-b border-line">
          <div className="text-[12px] uppercase tracking-wider text-gray-ui">
            Nombre
          </div>
          <div className="mt-1 text-[16px] font-light text-ink">
            {nombre ?? 'Sin registrar'}
          </div>
        </div>

        <div className="py-5 border-b border-line">
          <div className="text-[12px] uppercase tracking-wider text-gray-ui">
            Correo
          </div>
          <div className="mt-1 text-[16px] font-light text-ink">{email}</div>
        </div>
      </div>

      <Link
        href="/nueva-contrasena"
        className="inline-flex items-center mt-8 text-[15px] text-dom underline underline-offset-4 hover:opacity-80"
      >
        Cambiar contraseña
      </Link>
    </main>
  )
}
