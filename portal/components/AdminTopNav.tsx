'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { BARRA_CASA, ROTULO_BARRA, entradaCasa } from '@/lib/estilos/oficina'

interface AdminTopNavProps {
  userEmail: string
}

export default function AdminTopNav({ userEmail }: AdminTopNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const enPersonaLab = pathname === '/personalab' || pathname.startsWith('/personalab/')

  const navLinkClass = (prefix: string) =>
    entradaCasa(pathname === prefix || pathname.startsWith(prefix + '/'))

  // LA BARRA DICE EN QUE MARCA ESTAS, Y ESA ES LA CORRECCION DE FONDO.
  //
  // Medido el 2026-09-06: `.marca-personalab` estaba definida en
  // `app/marca.css:96` y aplicada CERO veces en todo el repositorio, y esta
  // barra y la de PersonaLab escribian la MISMA cadena caracter por caracter.
  // Cruzar de Trascendencia a PersonaLab no cambiaba un solo pixel de color.
  //
  // El layout de (admin) declara `marca-trascendencia` para todo el arbol.
  // Esta barra vive por encima de los dos workspaces, asi que tiene que
  // corregir la dominancia por su cuenta: dentro de PersonaLab, la entrada
  // activa se pinta teal y no vino, sin cambiar una sola clase.
  const marca = enPersonaLab ? 'marca-personalab' : ''

  return (
    <header className={`${marca} ${BARRA_CASA}`}>
      {/* Left: la casa. Lleva al selector de workspace, no al dashboard de
          Trascendencia: 4 Meaning es la capa de arriba, no una sub-marca. */}
      <Link
        href="/workspaces"
        className="flex items-center gap-2 group"
        title="Cambiar de workspace"
      >
        {/* "4 Meaning" con espacio. El login lo escribia pegado y Julian lo
            corrigio ahi el 2026-09-06; aqui seguia pegado, asi que el mismo
            lockup se escribia de dos maneras a dos clics de distancia. */}
        <span className={ROTULO_BARRA}>4 Meaning</span>
        {/* El chevron era `text-slate-300`: 1.48 sobre blanco. Es la unica
            senal de que el lockup es un boton y no un rotulo, o sea que la
            unica pista de que se puede cambiar de workspace era invisible.
            `gray-ui` da 4.93 sobre papel. */}
        <svg
          className="w-3 h-3 text-gray-ui group-hover:text-dom transition-colors"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
        </svg>
      </Link>

      {/* Center. Depende de en qué workspace estás, porque este es el nivel
          de la casa y no el de una marca: Hoy, Eventos y Usuarios son
          secciones de Trascendencia, y dentro de PersonaLab no llevan a
          ningún lado útil. Dentro de PersonaLab, este nivel sirve para volver.

          HOY VA PRIMERO, Y ESA ES LA CORRECCION. El portal SI tenia una
          pantalla que contesta "y ahora que": lee la fecha del retiro y
          cambia sola entre cuatro momentos (falta poco / esta pasando /
          acaba de terminar / no hay nada). El problema es que solo se
          enlazaba desde aqui cuando estabas DENTRO de PersonaLab. Se
          aterrizaba en ella al entrar y despues no se podia volver.

          Todo lo demas del portal es una lista: eventos, familias,
          acuerdos, materiales. Listas de cosas, ninguna de ellas ordenada
          por cuando toca. Esta es la unica entrada que empieza por el
          tiempo, asi que va primero y se ve siempre. */}
      <nav className="ml-8 flex gap-1">
        {enPersonaLab ? (
          <>
            <Link href="/hoy" className={navLinkClass('/hoy')}>
              Trascendencia
            </Link>
            <Link href="/personalab" className={navLinkClass('/personalab')}>
              PersonaLab
            </Link>
          </>
        ) : (
          <>
            <Link href="/hoy" className={navLinkClass('/hoy')}>
              Hoy
            </Link>
            <Link href="/eventos" className={navLinkClass('/eventos')}>
              Eventos
            </Link>
            <Link href="/usuarios" className={navLinkClass('/usuarios')}>
              Usuarios
            </Link>
          </>
        )}
      </nav>

      {/* Right: User info + logout.
          Los dos eran `text-slate-400`: 2.56 sobre blanco. El correo es la
          unica manera de saber con que cuenta estas mirando datos de otra
          gente, y estaba por debajo de la mitad del minimo legible. El rojo
          del hover era `red-500`, que no esta en ninguna paleta de la marca;
          `alerta` si lo esta y da 7.39 sobre papel. */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-ui hidden sm:block">{userEmail}</span>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-ui hover:text-alerta transition-colors cursor-pointer bg-transparent border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
