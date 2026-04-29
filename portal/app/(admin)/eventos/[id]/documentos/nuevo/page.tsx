'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Family {
  id: string
  nombre_familia: string
}

export default function NuevoDocumentoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [families, setFamilies] = useState<Family[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'general',
    visibilidad: 'participant',
    pdf_url: '',
    family_id: '',
  })

  useEffect(() => {
    supabase
      .from('families')
      .select('id, nombre_familia')
      .eq('event_id', params.id)
      .order('nombre_familia')
      .then(({ data }) => setFamilies(data ?? []))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('documents').insert({
      event_id: params.id,
      nombre: form.nombre,
      tipo: form.tipo,
      visibilidad: form.visibilidad,
      pdf_url: form.pdf_url || null,
      family_id: form.family_id || null,
      created_by: user?.id,
      contenido: {},
    })

    setSaving(false)
    if (error) { setError(error.message); return }
    router.push(`/eventos/${params.id}/documentos`)
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div style={{ padding: 32, maxWidth: 560 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/eventos/${params.id}/documentos`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← Documentos
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 12, marginBottom: 0 }}>Nuevo documento</h1>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 12, marginBottom: 20, color: '#991b1b', fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Nombre del documento *</label>
          <input required value={form.nombre} onChange={set('nombre')} style={inputStyle} placeholder="Ej: Contrato de participación" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Tipo</label>
            <select value={form.tipo} onChange={set('tipo')} style={inputStyle}>
              <option value="general">General</option>
              <option value="contrato">Contrato</option>
              <option value="informacion">Información</option>
              <option value="itinerario">Itinerario</option>
              <option value="album">Álbum</option>
              <option value="video">Video</option>
              <option value="storybook">Storybook</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Visibilidad</label>
            <select value={form.visibilidad} onChange={set('visibilidad')} style={inputStyle}>
              <option value="all">Todos</option>
              <option value="participant">Participantes</option>
              <option value="staff">Staff</option>
              <option value="admin">Solo admin</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Familia (opcional)</label>
          <select value={form.family_id} onChange={set('family_id')} style={inputStyle}>
            <option value="">— Documento del evento (sin familia) —</option>
            {families.map(f => (
              <option key={f.id} value={f.id}>{f.nombre_familia}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>URL del PDF</label>
          <input
            type="url"
            value={form.pdf_url}
            onChange={set('pdf_url')}
            style={inputStyle}
            placeholder="https://..."
          />
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Enlace directo al archivo PDF.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Guardando...' : 'Crear documento'}
          </button>
          <button type="button" onClick={() => router.push(`/eventos/${params.id}/documentos`)} style={{ padding: '10px 24px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, cursor: 'pointer' }}>
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
