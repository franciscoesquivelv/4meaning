'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { BOTON } from '@/lib/estilos/acceso'

// ── EL UMBRAL DE BIENVENIDA ─────────────────────────────────────
//
// La primera pantalla que ve quien acaba de entrar a una experiencia
// digital, antes del índice. Decisión de Julian, Consejo del 2026-09-11:
// existe SIEMPRE, como paso propio, sin reemplazar el índice (que sigue
// mostrando el recorrido entero, sin esconder nada: eso no cambia aquí).
//
// Reusa la misma gramática ya probada en el umbral de acceso
// (lib/estilos/acceso.ts): lienzo oscuro, tipografía de marca, botón
// invertido. La dominancia la fija `marca-personalab` en el layout que
// envuelve todo este árbol, así que `bg-dom-deep` pinta teal aquí sin que
// haga falta declararlo.
//
// NO ES `FirstTimeWelcome.tsx`. Ese componente responde "qué puedo hacer
// aquí" (una lista de secciones, apropiado para una app que se visita
// durante semanas). Este responde "qué estoy por sentir": ninguna lista,
// solo el nombre y la narrativa de la experiencia.
//
// SE RECUERDA POR CUENTA, NO POR NAVEGADOR. `FirstTimeWelcome` usa
// `localStorage`, que es del navegador. Un producto pagado que se retoma
// desde otro teléfono no puede depender de eso, así que esto escribe en
// `bookmarks.bienvenida_vista_at`, la misma fila que ya guarda dónde se
// quedó la persona en la experiencia.

export default function UmbralBienvenida({
  experienciaId,
  nombre,
  narrativa,
  vistaInicial,
  children,
}: {
  experienciaId: string
  nombre: string
  narrativa: string | null
  vistaInicial: boolean
  children: React.ReactNode
}) {
  const [vista, setVista] = useState(vistaInicial)
  const [entrando, setEntrando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // La aparición escalonada necesita partir de opacidad 0 en el primer
  // render y subir a 100 un instante después, o no hay transición que ver.
  useEffect(() => {
    if (vista) return
    const t = setTimeout(() => setEntrando(true), 30)
    return () => clearTimeout(t)
  }, [vista])

  async function comenzar() {
    setGuardando(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('bookmarks').upsert(
          {
            profile_id: user.id,
            experience_id: experienciaId,
            bienvenida_vista_at: new Date().toISOString(),
          },
          { onConflict: 'profile_id,experience_id' }
        )
      }
    } finally {
      // Se avanza aunque el guardado falle. Volver a ver esta pantalla la
      // próxima visita cuesta un instante; quedarse atorado en ella no deja
      // entrar a nadie a algo que ya compró.
      setVista(true)
    }
  }

  if (vista) return <>{children}</>

  return (
    <div className="min-h-screen bg-dom-deep flex flex-col items-center justify-center px-6 py-12 text-center">
      <p
        className={`cejilla cejilla-claro transition-opacity duration-700 ease-marca ${entrando ? 'opacity-100' : 'opacity-0'}`}
      >
        PersonaLab
      </p>

      <h1
        className={`display text-[38px] md:text-[52px] text-paper mt-3 max-w-lg transition-opacity duration-700 ease-marca delay-150 ${entrando ? 'opacity-100' : 'opacity-0'}`}
      >
        {nombre}
      </h1>

      {narrativa && (
        <p
          className={`mt-6 text-[18px] md:text-[19px] leading-[1.6] font-light text-paper/90 max-w-md transition-opacity duration-700 ease-marca delay-300 ${entrando ? 'opacity-100' : 'opacity-0'}`}
        >
          {narrativa}
        </p>
      )}

      <button
        onClick={comenzar}
        disabled={guardando}
        className={`${BOTON} max-w-xs mt-10 transition-opacity duration-700 ease-marca delay-500 ${entrando ? 'opacity-100' : 'opacity-0'}`}
      >
        Comenzar
      </button>
    </div>
  )
}
