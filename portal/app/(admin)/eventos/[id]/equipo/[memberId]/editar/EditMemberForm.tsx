'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateTeamMember } from './actions'

interface Props {
  eventId: string
  memberId: string
  initial: {
    nombre: string
    rol: string
    bio_publica: string | null
    notas_equipo: string | null
    orden: number | null
  }
}

export default function EditMemberForm({ eventId, memberId, initial }: Props) {
  const [form, setForm] = useState({
    nombre: initial.nombre,
    rol: initial.rol,
    bio_publica: initial.bio_publica ?? '',
    notas_equipo: initial.notas_equipo ?? '',
    orden: initial.orden?.toString() ?? '0',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const result = await updateTeamMember(eventId, memberId, {
      nombre: form.nombre,
      rol: form.rol,
      bio_publica: form.bio_publica || undefined,
      notas_equipo: form.notas_equipo || undefined,
      orden: parseInt(form.orden) || 0,
    })

    setSaving(false)
    if (result && 'error' in result) {
      setError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Nombre *</label>
          <input
            required
            value={form.nombre}
            onChange={set('nombre')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="Nombre completo"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Rol *</label>
          <input
            required
            value={form.rol}
            onChange={set('rol')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="Ej: Conductor/a del evento, Facilitador/a de conexión"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Bio pública</label>
          <p className="text-xs text-slate-400 mb-1">Descripción visible para los participantes</p>
          <textarea
            value={form.bio_publica}
            onChange={set('bio_publica')}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-vertical"
            placeholder="Presentación, rol en el retiro..."
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Notas del equipo</label>
          <p className="text-xs text-slate-400 mb-1">Notas internas del staff (no visibles para participantes)</p>
          <textarea
            value={form.notas_equipo}
            onChange={set('notas_equipo')}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-vertical"
            placeholder="Celular, restricciones, notas de logística..."
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Orden</label>
          <input
            type="number"
            min={0}
            value={form.orden}
            onChange={set('orden')}
            className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <Link
          href={`/eventos/${eventId}/equipo`}
          className="px-6 py-2.5 bg-white text-slate-700 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
