'use client'

import { useState } from 'react'

interface Props {
  signingToken: string
}

export default function CopySigningLinkButton({ signingToken }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!signingToken) return
    const url = `${window.location.origin}/firmar/${signingToken}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!signingToken) return null

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
    >
      {copied ? '✓ Copiado' : 'Copiar link de firma'}
    </button>
  )
}
