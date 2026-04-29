'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function NuevaFamiliaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nombre_familia: '',
    nombre1: '',
    email1: '',
    nombre2: '',
    email2: '',
    habitacion: '',
    notas: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await supabase.from('families').insert({
      event_id: params.id,
      nombre_familia: form.nombre_familia,
      nombre1: form.nombre1,
      email1: form.email1,
      nombre2: form.nombre2 || null,
      email2: form.email2 || null,
      habitacion: form.habitacion || null,
      notas: form.notas || null,
      status: 'invited',
    })

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push(`/eventos/${params.id}/familias`)
  }

  return (
    <div style={{ padding: 32, maxWidth: 600 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/eventos/${params.id}/familias`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← Familias
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 12, marginBottom: 0 }}>Agregar familia</h1>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 12, marginBottom: 20, color: '#991b1b', fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Nombre de familia *</label>
          <input
            required
            value={form.nombre_familia}
            onChange={e => setForm(f => ({ ...f, nombre_familia: e.target.value }))}
            style={inputStyle}
            placeholder="Ej: Familia García"
          />
        </div>

        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, margin: 0 }}>
          <legend style={{ fontSize: 13, fontWeight: 600, color: '#374151', padding: '0 4px' }}>Persona 1</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre completo *</label>
              <input
                required
                value={form.nombre1}
                onChange={e => setForm(f => ({ ...f, nombre1: e.target.value }))}
                style={inputStyle}
                placeholder="Nombre y apellido"
              />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input
                required
                type="email"
                value={form.email1}
                onChange={e => setForm(f => ({ ...f, email1: e.target.value }))}
                style={inputStyle}
                placeholder="email@ejemplo.com"
              />
            </div>
          </div>
        </fieldset>

        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, margin: 0 }}>
          <legend style={{ fontSize: 13, fontWeight: 600, color: '#374151', padding: '0 4px' }}>Persona 2 (opcional)</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input
                value={form.nombre2}
                onChange={e => setForm(f => ({ ...f, nombre2: e.target.value }))}
                style={inputStyle}
                placeholder="Nombre y apellido"
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={form.email2}
                onChange={e => setForm(f => ({ ...f, email2: e.target.value }))}
                style={inputStyle}
                placeholder="email@ejemplo.com"
              />
            </div>
          </div>
        </fieldset>

        <div>
          <label style={labelStyle}>Habitación</label>
          <input
            value={form.habitacion}
            onChange={e => setForm(f => ({ ...f, habitacion: e.target.value }))}
            style={inputStyle}
            placeholder="Ej: 204"
          />
        </div>

        <div>
          <label style={labelStyle}>Notas</label>
          <textarea
            value={form.notas}
            onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
            style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
            placeholder="Notas sobre esta familia..."
          />
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: '10px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Guardando...' : 'Agregar familia'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/eventos/${params.id}/familias`)}
            style={{ padding: '10px 24px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, cursor: 'pointer' }}
          >
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
