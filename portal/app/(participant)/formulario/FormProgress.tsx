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
    <div className="sticky top-14 z-30 bg-[#111111] border-b border-[#2A2A2A] px-5 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[#A09A8F]">{sections[current]}</span>
        <span className="text-xs font-medium text-[#C9A96E]">{pct}%</span>
      </div>
      <div className="h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#C9A96E] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
