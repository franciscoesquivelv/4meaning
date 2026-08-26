'use client'
import { useEffect, useState } from 'react'

export default function FormProgress({ sections }: { sections: string[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      // Detectar sección visible por data-section attribute
      const els = document.querySelectorAll('[data-section]')
      let found = 0
      els.forEach((el, i) => {
        const rect = el.getBoundingClientRect()
        if (rect.top <= 120) found = i
      })
      setCurrent(found)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const pct = Math.round(((current + 1) / sections.length) * 100)

  return (
    <div className="sticky top-14 z-30 bg-paper border-b border-line px-5 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray">{sections[current]}</span>
        <span className="text-xs font-medium text-terra">{pct}%</span>
      </div>
      <div className="h-1 bg-paper-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-wine rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
