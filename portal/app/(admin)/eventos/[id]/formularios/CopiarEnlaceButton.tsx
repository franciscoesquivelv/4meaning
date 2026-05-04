'use client'
import { useState } from 'react'

export default function CopiarEnlaceButton() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}/formulario`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
    >
      {copied ? '✓ Copiado' : 'Copiar enlace'}
    </button>
  )
}
