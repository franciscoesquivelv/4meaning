'use client'

import { useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

// ── DONDE SE ESCRIBE ────────────────────────────────────────────
//
// Una consigna con su espacio para responder. En la sala la consigna se dice
// en voz alta y la persona escribe en papel; en pantalla lleva dónde.
//
// DOS COMPORTAMIENTOS, UNO POR CONSIGNA, NUNCA UNA REGLA GLOBAL. Decisión de
// Francisco, 2026-09-13 (memoria de proyecto `presente-regalo-digital.md`,
// decisión 2): quien crea el contenido decide, consigna por consigna
// (`Bloque.guarda`, `lib/personalab/bloques.ts`), si lo que se escribe ahí
// se guarda de verdad o vive solo en la pestaña. Hasta el 2026-09-22 este
// componente solo sabía hacer lo segundo -- la regla del 2026-09-10, nunca
// actualizada -- y el texto de abajo se lo prometía a todo el mundo por
// igual, aunque la decisión que lo reemplazó tenía nueve días.
//
// `guarda: false` (el default, falla cerrado): SIN CAMBIOS de comportamiento
// respecto a como era antes. `sessionStorage`, se pierde al cerrar la
// pestaña, la promesa de siempre.
//
// `guarda: true`: se guarda en `public.responses`
// (`20260922_1200_respuestas_guardadas.sql`), con la sesión de la propia
// persona (`createBrowserClient`, igual que `MarcarVisto.tsx`) para que sea
// la RLS de la base, no el cliente, quien decida qué fila le pertenece a
// quién. La promesa cambia con el comportamiento: "se guarda, es tuyo, no
// lo leemos, lo puedes borrar cuando quieras" -- y existe un botón real de
// borrar, porque prometer borrado sin poder borrar es la mentira que Sora
// marcó como la única que este producto no puede permitirse.

const PREFIJO = 'pl.escritura.'
const DEMORA_GUARDADO = 700

type EstadoGuardado = 'ocioso' | 'guardando' | 'guardado' | 'error'

function cliente() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default function Escritura({
  bloqueId,
  consigna,
  guarda = false,
  valorInicial,
}: {
  bloqueId: string
  consigna: string
  guarda?: boolean
  // Solo tiene sentido cuando `guarda` es true: lo que ya estaba escrito,
  // leído por el servidor antes de pintar (`lib/personalab/lectura.ts`),
  // para que la primera vista ya muestre lo guardado sin depender de un
  // segundo viaje al cliente.
  valorInicial?: string | null
}) {
  const [texto, setTexto] = useState('')
  const [listo, setListo] = useState(false)
  const [estadoGuardado, setEstadoGuardado] = useState<EstadoGuardado>('ocioso')
  const area = useRef<HTMLTextAreaElement>(null)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Se lee una vez, al montar. Antes de eso el textarea va vacío y sin
  // habilitar, para que nadie empiece a escribir sobre algo que está a punto
  // de ser reemplazado por lo que ya había.
  useEffect(() => {
    if (guarda) {
      setTexto(valorInicial ?? '')
      setListo(true)
      return
    }
    try {
      setTexto(sessionStorage.getItem(PREFIJO + bloqueId) ?? '')
    } catch {
      // Navegador con el almacenamiento bloqueado. Se escribe igual, solo que
      // no sobrevive a cambiar de pantalla. Mejor eso que no dejar escribir.
    }
    setListo(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloqueId])

  // Crece con lo que se escribe. Una caja de tamaño fijo con barra de scroll
  // le dice a alguien cuánto se espera que escriba, y aquí no se espera una
  // cantidad.
  useEffect(() => {
    const el = area.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [texto])

  // Limpia el temporizador pendiente si la pantalla se va a mitad del
  // debounce, para no escribir sobre un componente que ya no existe.
  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [])

  async function persistir(v: string) {
    const supabase = cliente()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const limpio = v.trim()
    if (!limpio) {
      // Vacío también se guarda como "nada" -- se borra la fila, igual que
      // `sessionStorage.removeItem` en el otro modo. No se deja una fila con
      // texto vacío ocupando un lugar que ya no representa nada escrito.
      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('profile_id', user.id)
        .eq('block_id', bloqueId)
      setEstadoGuardado(error ? 'error' : 'ocioso')
      return
    }

    const { error } = await supabase.from('responses').upsert(
      {
        profile_id: user.id,
        block_id: bloqueId,
        texto: limpio,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,block_id' }
    )
    setEstadoGuardado(error ? 'error' : 'guardado')
  }

  function escribir(v: string) {
    setTexto(v)

    if (guarda) {
      setEstadoGuardado('guardando')
      if (temporizador.current) clearTimeout(temporizador.current)
      temporizador.current = setTimeout(() => persistir(v), DEMORA_GUARDADO)
      return
    }

    try {
      if (v.trim()) sessionStorage.setItem(PREFIJO + bloqueId, v)
      else sessionStorage.removeItem(PREFIJO + bloqueId)
    } catch { /* ver arriba */ }
  }

  async function borrar() {
    setTexto('')
    setEstadoGuardado('guardando')
    if (temporizador.current) clearTimeout(temporizador.current)
    const supabase = cliente()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('responses')
      .delete()
      .eq('profile_id', user.id)
      .eq('block_id', bloqueId)
    setEstadoGuardado(error ? 'error' : 'ocioso')
  }

  return (
    <div className="mt-8 md:mt-10 border-t border-b border-line py-6 md:py-7">
      <div className="cejilla">Consigna</div>

      <p className="mt-3 text-[19px] md:text-[21px] leading-[1.55] font-light text-dom">
        {consigna}
      </p>

      <textarea
        ref={area}
        value={texto}
        onChange={e => escribir(e.target.value)}
        disabled={!listo}
        rows={4}
        placeholder="Escribe aquí. O no: también se puede seguir sin escribir."
        aria-label="Tu respuesta"
        className="mt-5 w-full resize-none bg-transparent border-0 border-b border-line focus:border-dom outline-none text-[17px] leading-[1.7] font-light text-ink placeholder:text-gray-ui/70 pb-2 transition-colors"
      />

      {guarda ? (
        <div className="mt-3 flex items-center justify-between gap-4">
          {/* El permiso de no escribir, dicho en el sitio donde se ejerce.
              Sora lo dejó escrito para la sala: el permiso de quedarse en la
              superficie hay que ofrecerlo A MITAD y no solo en la entrada, y
              sin el cuerpo del facilitador que lo modele, aquí tiene que ir
              por escrito. Parar también es haber terminado. */}
          <p className="text-[13px] leading-[1.5] text-gray-ui">
            {estadoGuardado === 'error'
              ? 'No se pudo guardar. Sigue en esta pantalla, vamos a intentarlo de nuevo.'
              : 'Esto se guarda. Es tuyo, no lo leemos, y lo puedes borrar cuando quieras.'}
          </p>
          {texto.trim() && (
            <button
              type="button"
              onClick={borrar}
              className="flex-shrink-0 text-[12.5px] text-gray-ui hover:text-alerta underline underline-offset-2 transition-colors"
            >
              Borrar lo escrito
            </button>
          )}
        </div>
      ) : (
        <p className="mt-3 text-[13px] leading-[1.5] text-gray-ui">
          Lo que escribas se queda en tu navegador. No lo guardamos, no lo
          leemos, y al final vas a poder pedir que te lo mandemos a tu correo.
        </p>
      )}
    </div>
  )
}
