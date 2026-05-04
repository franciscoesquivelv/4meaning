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
    pipeline_status: 'prospecto',
    contacto_capitulo: '',
    costo_por_pareja: '',
    primer_deposito: '',
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
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
        pipeline_status: form.pipeline_status || 'prospecto',
        contacto_capitulo: form.contacto_capitulo || null,
        costo_por_pareja: form.costo_por_pareja ? parseFloat(form.costo_por_pareja) : null,
        primer_deposito: form.primer_deposito ? parseFloat(form.primer_deposito) : null,
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

        {/* Pipeline y comercial */}
        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />
        <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
          Pipeline comercial
        </p>

        <div>
          <label style={labelStyle}>Estado del pipeline</label>
          <select
            name="pipeline_status"
            value={form.pipeline_status}
            onChange={handleChange}
            style={{ ...inputStyle, background: '#fff' }}
          >
            <option value="prospecto">Prospecto</option>
            <option value="confirmado">Confirmado</option>
            <option value="en_preparacion">En preparación</option>
            <option value="ejecutado">Ejecutado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Contacto del capítulo</label>
          <input
            name="contacto_capitulo"
            value={form.contacto_capitulo}
            onChange={handleChange}
            placeholder="Nombre y email del Chair o coordinador"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Costo por pareja (MXN)</label>
            <input
              name="costo_por_pareja"
              type="number"
              min="0"
              value={form.costo_por_pareja}
              onChange={handleChange}
              placeholder="0"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Primer depósito (MXN)</label>
            <input
              name="primer_deposito"
              type="number"
              min="0"
              value={form.primer_deposito}
              onChange={handleChange}
              placeholder="0"
              style={inputStyle}
            />
          </div>
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
