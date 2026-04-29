'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function EditarFamiliaPage({ params }: { params: { id: string; familyId: string } }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(true)
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
    status: 'invited',
  })

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .eq('id', params.familyId)
        .single()
      if (error || !data) {
        setError('Familia no encontrada')
        setLoading(false)
        return
      }
      setForm({
        nombre_familia: data.nombre_familia ?? '',
        nombre1: data.nombre1 ?? '',
        email1: data.email1 ?? '',
        nombre2: data.nombre2 ?? '',
        email2: data.email2 ?? '',
        habitacion: data.habitacion ?? '',
        notas: data.notas ?? '',
        status: data.status ?? 'invited',
      })
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.familyId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from('families')
      .update({
        nombre_familia: form.nombre_familia,
        nombre1: form.nombre1,
        email1: form.email1,
        nombre2: form.nombre2 || null,
        email2: form.email2 || null,
        habitacion: form.habitacion || null,
        notas: form.notas || null,
        status: form.status,
      })
      .eq('id', params.familyId)

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push(`/eventos/${params.id}/familias`)
  }

  if (loading) return <div style={{ padding: 32, color: '#6b7280' }}>Cargando...</div>

  return (
    <div style={{ padding: 32, maxWidth: 600 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/eventos/${params.id}/familias`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← Familias
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 12, marginBottom: 0 }}>Editar familia</h1>
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
          />
        </div>

        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, margin: 0 }}>
          <legend style={{ fontSize: 13, fontWeight: 600, color: '#374151', padding: '0 4px' }}>Persona 1</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre completo *</label>
              <input required value={form.nombre1} onChange={e => setForm(f => ({ ...f, nombre1: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input required type="email" value={form.email1} onChange={e => setForm(f => ({ ...f, email1: e.target.value }))} style={inputStyle} />
            </div>
          </div>
        </fieldset>

        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, margin: 0 }}>
          <legend style={{ fontSize: 13, fontWeight: 600, color: '#374151', padding: '0 4px' }}>Persona 2 (opcional)</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input value={form.nombre2} onChange={e => setForm(f => ({ ...f, nombre2: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.email2} onChange={e => setForm(f => ({ ...f, email2: e.target.value }))} style={inputStyle} />
            </div>
          </div>
        </fieldset>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Habitación</label>
            <input value={form.habitacion} onChange={e => setForm(f => ({ ...f, habitacion: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
              <option value="invited">Invitado</option>
              <option value="confirmed">Confirmado</option>
              <option value="completed">Completado</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Notas</label>
          <textarea
            value={form.notas}
            onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
            style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: '10px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
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
