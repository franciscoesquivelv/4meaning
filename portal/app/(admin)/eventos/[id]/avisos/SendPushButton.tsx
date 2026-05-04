'use client'

import { useState } from 'react'

interface Props {
  eventId: string
}

export default function SendPushButton({ eventId }: Props) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent?: number; error?: string } | null>(null)

  async function handleSend() {
    if (!title.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, title: title.trim(), body: body.trim(), url: '/avisos' }),
      })
      const json = await res.json()
      if (!res.ok) {
        setResult({ error: json.error ?? 'Error al enviar' })
      } else {
        setResult({ sent: json.sent })
        setTitle('')
        setBody('')
      }
    } catch {
      setResult({ error: 'Error de red' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Enviar notificación push</h2>
      <p className="text-sm text-slate-500 mb-4">
        Envía una notificación push a todos los participantes suscritos de este evento.
      </p>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ej: Recordatorio logística"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Cuerpo (opcional)</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={2}
            placeholder="Texto adicional de la notificación…"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 resize-none"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={loading || !title.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Enviando…' : 'Enviar push'}
        </button>
        {result && (
          <div className={`text-sm rounded-lg px-3 py-2 ${result.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {result.error ? result.error : `Push enviado a ${result.sent} suscriptor${result.sent !== 1 ? 'es' : ''}.`}
          </div>
        )}
      </div>
    </div>
  )
}
