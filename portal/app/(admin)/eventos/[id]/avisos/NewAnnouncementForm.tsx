'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function NewAnnouncementForm({ eventId }: { eventId: string }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [open, setOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [cuerpo, setCuerpo] = useState('')
  const [tipo, setTipo] = useState('info')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('announcements').insert({
      event_id: eventId,
      titulo: titulo.trim(),
      cuerpo: cuerpo.trim() || null,
      tipo,
      published: true,
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    setTitulo('')
    setCuerpo('')
    setTipo('info')
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors font-medium"
      >
        + Publicar nuevo aviso
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Nuevo aviso</h3>

      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Tipo</label>
          <div className="flex gap-2">
            {(['info', 'logistica', 'urgente'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize',
                  tipo === t
                    ? t === 'urgente' ? 'bg-red-600 text-white border-red-600'
                      : t === 'logistica' ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
                ].join(' ')}
              >
                {t === 'logistica' ? 'Logística' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Cambio de horario para la cena de mañana"
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Detalle (opcional)</label>
          <textarea
            value={cuerpo}
            onChange={e => setCuerpo(e.target.value)}
            placeholder="La cena del sábado se moverá a las 8:30pm en lugar de las 8pm..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={saving || !titulo.trim()}
          className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60"
        >
          {saving ? 'Publicando...' : 'Publicar ahora'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setTitulo(''); setCuerpo(''); setTipo('info') }}
          className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
