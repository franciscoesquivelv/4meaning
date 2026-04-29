'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function NuevoItinerarioItemPage({ params }: { params: { id: string } }) {
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
    visibilidad: 'all',
    notas_staff: '',
    orden: '0',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('itinerary_items').insert({
      event_id: params.id,
      titulo: form.titulo,
      dia: parseInt(form.dia),
      fecha: form.fecha || null,
      hora_inicio: form.hora_inicio || null,
      hora_fin: form.hora_fin || null,
      tipo: form.tipo,
      descripcion: form.descripcion || null,
      ubicacion: form.ubicacion || null,
      responsable: form.responsable || null,
      visibilidad: form.visibilidad,
      notas_staff: form.notas_staff || null,
      orden: parseInt(form.orden),
      created_by: user?.id,
    })

    setSaving(false)
    if (error) { setError(error.message); return }
    router.push(`/eventos/${params.id}/itinerario`)
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div style={{ padding: 32, maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/eventos/${params.id}/itinerario`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← Itinerario
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 12, marginBottom: 0 }}>Nuevo item de itinerario</h1>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 12, marginBottom: 20, color: '#991b1b', fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Título *</label>
          <input required value={form.titulo} onChange={set('titulo')} style={inputStyle} placeholder="Ej: Sesión de apertura" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Día *</label>
            <input type="number" min={1} required value={form.dia} onChange={set('dia')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Fecha</label>
            <input type="date" value={form.fecha} onChange={set('fecha')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Orden</label>
            <input type="number" min={0} value={form.orden} onChange={set('orden')} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Hora inicio</label>
            <input type="time" value={form.hora_inicio} onChange={set('hora_inicio')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Hora fin</label>
            <input type="time" value={form.hora_fin} onChange={set('hora_fin')} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Tipo *</label>
            <select value={form.tipo} onChange={set('tipo')} style={inputStyle}>
              <option value="sesion">Sesión</option>
              <option value="comida">Comida</option>
              <option value="actividad">Actividad</option>
              <option value="libre">Tiempo libre</option>
              <option value="traslado">Traslado</option>
              <option value="bienvenida">Bienvenida</option>
              <option value="cierre">Cierre</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Visibilidad</label>
            <select value={form.visibilidad} onChange={set('visibilidad')} style={inputStyle}>
              <option value="all">Todos</option>
              <option value="participant">Participantes</option>
              <option value="staff_only">Solo staff</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea value={form.descripcion} onChange={set('descripcion')} style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} placeholder="Descripción del item..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Ubicación</label>
            <input value={form.ubicacion} onChange={set('ubicacion')} style={inputStyle} placeholder="Ej: Sala principal" />
          </div>
          <div>
            <label style={labelStyle}>Responsable</label>
            <input value={form.responsable} onChange={set('responsable')} style={inputStyle} placeholder="Ej: Juan Pérez" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Notas para staff</label>
          <textarea value={form.notas_staff} onChange={set('notas_staff')} style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} placeholder="Notas internas para el equipo..." />
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Guardando...' : 'Agregar item'}
          </button>
          <button type="button" onClick={() => router.push(`/eventos/${params.id}/itinerario`)} style={{ padding: '10px 24px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 4,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
}
