'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completing, setCompleting] = useState(false)

  const prevPathname = useRef(pathname)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function startProgress() {
    // Clear any existing timers
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (completeTimer.current) clearTimeout(completeTimer.current)
    if (hideTimer.current) clearTimeout(hideTimer.current)

    setCompleting(false)
    setVisible(true)
    setProgress(8)

    // Simulate realistic progress: fast start, slows down near 85%
    let p = 8
    intervalRef.current = setInterval(() => {
      if (p < 30) p += 12
      else if (p < 60) p += 6
      else if (p < 80) p += 2
      else if (p < 88) p += 0.5
      else clearInterval(intervalRef.current!)
      setProgress(Math.min(p, 88))
    }, 120)
  }

  function completeProgress() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setCompleting(true)
    setProgress(100)
    hideTimer.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
      setCompleting(false)
    }, 400)
  }

  // Intercept all internal link clicks
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Skip: external, hash-only, same page, target _blank, javascript:
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('javascript') ||
        anchor.getAttribute('target') === '_blank' ||
        href === pathname
      ) return

      startProgress()
    }

    // Also intercept form submits that cause navigation
    function handleSubmit(e: SubmitEvent) {
      const form = e.target as HTMLFormElement
      if (form.method?.toLowerCase() !== 'get') startProgress()
    }

    document.addEventListener('click', handleClick, true)
    document.addEventListener('submit', handleSubmit, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('submit', handleSubmit, true)
    }
  }, [pathname])

  // Complete when pathname changes (navigation done)
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      completeProgress()
    }
  }, [pathname])

  if (!visible) return null

  // Esta barra cruza TODAS las pantallas del portal, asi que es el cromo mas
  // repetido que hay. Estaba pintada con el dorado que no es de la marca, su
  // aclarado y un halo del mismo tono: tres colores inventados en el elemento
  // que mas veces se ve.
  //
  // Va en terracota, que es el acento humano del sistema y el unico que no
  // depende de la dominancia: la misma barra sirve en Trascendencia y en
  // PersonaLab sin cambiar de color a media navegacion. El comportamiento
  // (cuando aparece y como avanza) no se toca: eso es de Sora.
  return (
    <>
      {/* Barra superior */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none">
        <div
          className="h-full"
          style={{
            width: `${progress}%`,
            transition: completing
              ? 'width 0.25s ease-out, opacity 0.15s ease-in 0.25s'
              : 'width 0.12s ease-out',
            background:
              'linear-gradient(90deg, var(--terra) 0%, var(--terra-lo) 50%, var(--terra) 100%)',
            boxShadow: '0 0 10px 1px color-mix(in srgb, var(--terra) 55%, transparent)',
            opacity: completing ? 0 : 1,
          }}
        />
        {/* Destello en la punta */}
        {!completing && (
          <div
            className="absolute top-0 h-full w-24 pointer-events-none"
            style={{
              left: `calc(${progress}% - 6rem)`,
              background:
                'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--terra-lo) 60%, transparent) 50%, transparent 100%)',
              transition: 'left 0.12s ease-out',
            }}
          />
        )}
      </div>

      {/* Girador en la esquina */}
      {!completing && (
        <div className="fixed top-3 right-4 z-[9999] pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-terra/30 border-t-terra animate-spin" />
        </div>
      )}
    </>
  )
}
