'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

type TeamMember = { id: string; nombre: string; rol: string }

interface Props {
  eventId: string
  teamMembers: TeamMember[]
}

export default function NuevoItemForm({ eventId, teamMembers }: Props) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    titulo: '',
    dia: '1',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    tipo: 'sesion',
    descripcion: '',
    ubicacion: '',
    responsable: '',
    responsable_custom: '',
    visibilidad: 'all',
    notas_staff: '',
    grupo: '',
  })

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const responsable = form.responsable === '__custom__'
      ? form.responsable_custom || null
      : form.responsable || null

    const { error: err } = await supabase.from('itinerary_items').insert({
      event_id: eventId,
      titulo: form.titulo,
      dia: parseInt(form.dia),
      fecha: form.fecha || null,
      hora_inicio: form.hora_inicio || null,
      hora_fin: form.hora_fin || null,
      tipo: form.tipo,
      descripcion: form.descripcion || null,
      ubicacion: form.ubicacion || null,
      responsable,
      visibilidad: form.visibilidad,
      notas_staff: form.notas_staff || null,
      grupo: form.grupo || null,
      created_by: user?.id,
    })

    setSaving(false)
    if (err) { setError(err.message); return }
    router.push(`/eventos/${eventId}/itinerario`)
  }

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10'
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/eventos/${eventId}/itinerario`}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Itinerario
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-3">Nuevo item de itinerario</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelCls}>Título *</label>
          <input required value={form.titulo} onChange={set('titulo')} className={inputCls} placeholder="Ej: Sesión de apertura" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Día *</label>
            <input type="number" min={1} required value={form.dia} onChange={set('dia')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Fecha</label>
            <input type="date" value={form.fecha} onChange={set('fecha')} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Hora inicio</label>
            <input type="time" value={form.hora_inicio} onChange={set('hora_inicio')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Hora fin</label>
            <input type="time" value={form.hora_fin} onChange={set('hora_fin')} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Tipo *</label>
            <select value={form.tipo} onChange={set('tipo')} className={inputCls}>
              <option value="sesion">Sesión</option>
              <option value="taller">Taller / Dinámica</option>
              <option value="actividad">Actividad</option>
              <option value="comida">Comida</option>
              <option value="libre">Tiempo libre</option>
              <option value="traslado">Traslado</option>
              <option value="logistica">Logística</option>
              <option value="bienvenida">Bienvenida</option>
              <option value="cierre">Cierre</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Visibilidad</label>
            <select value={form.visibilidad} onChange={set('visibilidad')} className={inputCls}>
              <option value="all">Todos</option>
              <option value="participant">Participantes</option>
              <option value="staff_only">Solo staff</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Grupo</label>
          <input
            value={form.grupo}
            onChange={set('grupo')}
            className={inputCls}
            placeholder="Dejar vacío = todos los grupos. Ej: Grupo A"
          />
        </div>

        <div>
          <label className={labelCls}>Descripción</label>
          <textarea value={form.descripcion} onChange={set('descripcion')} rows={3} className={`${inputCls} resize-vertical`} placeholder="Descripción del item..." />
        </div>

        <div>
          <label className={labelCls}>Ubicación</label>
          <input value={form.ubicacion} onChange={set('ubicacion')} className={inputCls} placeholder="Ej: Sala principal" />
        </div>

        <div>
          <label className={labelCls}>Responsable</label>
          <select value={form.responsable} onChange={set('responsable')} className={inputCls}>
            <option value="">— Sin asignar —</option>
            {teamMembers.map(m => (
              <option key={m.id} value={m.nombre}>{m.nombre} — {m.rol}</option>
            ))}
            <option value="__custom__">Otro (escribir)</option>
          </select>
          {form.responsable === '__custom__' && (
            <input
              value={form.responsable_custom}
              onChange={set('responsable_custom')}
              className={`${inputCls} mt-2`}
              placeholder="Nombre del responsable"
            />
          )}
        </div>

        <div>
          <label className={labelCls}>Notas para staff</label>
          <textarea value={form.notas_staff} onChange={set('notas_staff')} rows={2} className={`${inputCls} resize-vertical`} placeholder="Notas internas para el equipo..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Agregar item'}
          </button>
          <Link
            href={`/eventos/${eventId}/itinerario`}
            className="px-6 py-2.5 bg-white text-slate-700 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
