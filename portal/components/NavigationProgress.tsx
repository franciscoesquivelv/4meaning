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

  return (
    <>
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none">
        <div
          className="h-full"
          style={{
            width: `${progress}%`,
            transition: completing
              ? 'width 0.25s ease-out, opacity 0.15s ease-in 0.25s'
              : 'width 0.12s ease-out',
            background: 'linear-gradient(90deg, #C9A96E 0%, #E8C98A 50%, #C9A96E 100%)',
            boxShadow: '0 0 10px 1px rgba(201,169,110,0.7)',
            opacity: completing ? 0 : 1,
          }}
        />
        {/* Shimmer at the leading edge */}
        {!completing && (
          <div
            className="absolute top-0 h-full w-24 pointer-events-none"
            style={{
              left: `calc(${progress}% - 6rem)`,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,240,200,0.6) 50%, transparent 100%)',
              transition: 'left 0.12s ease-out',
            }}
          />
        )}
      </div>

      {/* Small spinner in top-right corner */}
      {!completing && (
        <div className="fixed top-3 right-4 z-[9999] pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C9A96E]/30 border-t-[#C9A96E] animate-spin" />
        </div>
      )}
    </>
  )
}
