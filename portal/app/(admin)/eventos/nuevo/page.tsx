'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 4,
  display: 'block',
}

export default function NuevoEventoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nombre: '',
    capitulo: '',
    ciudad: '',
    pais: 'México',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '',
    n_parejas: '',
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: insertError } = await supabase
      .from('events')
      .insert({
        nombre: form.nombre,
        capitulo: form.capitulo || null,
        ciudad: form.ciudad || null,
        pais: form.pais || 'México',
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
        ubicacion: form.ubicacion || null,
        n_parejas: form.n_parejas ? parseInt(form.n_parejas) : 0,
      })
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/eventos/${data.id}`)
  }

  return (
    <div style={{ padding: 32, maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Nuevo evento</h1>
      <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 14 }}>Crea un nuevo retiro o evento.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={labelStyle}>Nombre *</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            placeholder="Ej: Trascendencia Primavera 2026"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Capítulo</label>
          <input
            name="capitulo"
            value={form.capitulo}
            onChange={handleChange}
            placeholder="Ej: Guadalajara"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Ciudad</label>
            <input
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              placeholder="Ej: Puerto Vallarta"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>País</label>
            <input
              name="pais"
              value={form.pais}
              onChange={handleChange}
              placeholder="México"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Fecha inicio</label>
            <input
              name="fecha_inicio"
              type="date"
              value={form.fecha_inicio}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Fecha fin</label>
            <input
              name="fecha_fin"
              type="date"
              value={form.fecha_fin}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Ubicación / Venue</label>
          <input
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            placeholder="Ej: Hotel Barceló Puerto Vallarta"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Número de parejas</label>
          <input
            name="n_parejas"
            type="number"
            min="0"
            value={form.n_parejas}
            onChange={handleChange}
            placeholder="0"
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ color: '#dc2626', fontSize: 13, background: '#fef2f2', padding: '8px 12px', borderRadius: 6 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creando...' : 'Crear evento'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '10px 24px',
              background: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
