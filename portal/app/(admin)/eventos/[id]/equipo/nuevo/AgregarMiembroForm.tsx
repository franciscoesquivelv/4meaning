'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

interface Props {
  eventId: string
  eventNombre: string
}

export default function AgregarMiembroForm({ eventId, eventNombre }: Props) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nombre: '',
    rol: '',
    bio_publica: '',
    notas_equipo: '',
    orden: '0',
  })

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error: err } = await supabase.from('event_team').insert({
      event_id: eventId,
      nombre: form.nombre,
      rol: form.rol,
      bio_publica: form.bio_publica || null,
      notas_equipo: form.notas_equipo || null,
      orden: parseInt(form.orden) || 0,
    })

    setSaving(false)
    if (err) { setError(err.message); return }
    router.push(`/eventos/${eventId}/equipo`)
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/eventos" className="hover:text-slate-700 transition-colors">Eventos</Link>
        <span>/</span>
        <Link href={`/eventos/${eventId}`} className="hover:text-slate-700 transition-colors">{eventNombre}</Link>
        <span>/</span>
        <Link href={`/eventos/${eventId}/equipo`} className="hover:text-slate-700 transition-colors">Equipo</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Nuevo miembro</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-900 mb-8">Agregar miembro del equipo</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
          <input
            required
            value={form.nombre}
            onChange={set('nombre')}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="Nombre completo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rol *</label>
          <input
            required
            value={form.rol}
            onChange={set('rol')}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="Ej: Conductor/a del evento, Facilitador/a de conexión"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Bio pública</label>
          <textarea
            value={form.bio_publica}
            onChange={set('bio_publica')}
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-vertical"
            placeholder="Lo que los participantes verán. Presentación, rol en el retiro..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notas del equipo</label>
          <textarea
            value={form.notas_equipo}
            onChange={set('notas_equipo')}
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-vertical"
            placeholder="Información interna: celular, restricciones, notas de logística..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Orden</label>
          <input
            type="number"
            min={0}
            value={form.orden}
            onChange={set('orden')}
            className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Agregar miembro'}
          </button>
          <Link
            href={`/eventos/${eventId}/equipo`}
            className="px-6 py-2.5 bg-white text-slate-700 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
