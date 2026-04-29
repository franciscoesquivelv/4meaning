'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface EventData {
  id: string
  nombre: string
  capitulo: string | null
  ciudad: string | null
  pais: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  ubicacion: string | null
  n_parejas: number | null
  status: string
  notas_internas: string | null
}

export default function EditarEventoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<EventData, 'id'>>({
    nombre: '',
    capitulo: '',
    ciudad: '',
    pais: '',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '',
    n_parejas: null,
    status: 'draft',
    notas_internas: '',
  })

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', params.id)
        .single()
      if (error || !data) {
        setError('Evento no encontrado')
        setLoading(false)
        return
      }
      setForm({
        nombre: data.nombre ?? '',
        capitulo: data.capitulo ?? '',
        ciudad: data.ciudad ?? '',
        pais: data.pais ?? '',
        fecha_inicio: data.fecha_inicio ? data.fecha_inicio.slice(0, 10) : '',
        fecha_fin: data.fecha_fin ? data.fecha_fin.slice(0, 10) : '',
        ubicacion: data.ubicacion ?? '',
        n_parejas: data.n_parejas ?? null,
        status: data.status ?? 'draft',
        notas_internas: data.notas_internas ?? '',
      })
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('events')
      .update({
        nombre: form.nombre,
        capitulo: form.capitulo || null,
        ciudad: form.ciudad || null,
        pais: form.pais || null,
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
        ubicacion: form.ubicacion || null,
        n_parejas: form.n_parejas,
        status: form.status,
        notas_internas: form.notas_internas || null,
      })
      .eq('id', params.id)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push(`/eventos/${params.id}`)
  }

  if (loading) return <div style={{ padding: 32, color: '#6b7280' }}>Cargando...</div>

  return (
    <div style={{ padding: 32, maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => router.push(`/eventos/${params.id}`)}
          style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14, padding: 0, marginBottom: 12 }}
        >
          ← Volver al evento
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Editar evento</h1>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 12, marginBottom: 20, color: '#991b1b', fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Nombre del evento *</label>
          <input
            required
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            style={inputStyle}
            placeholder="Ej: Trascendencia México 2025"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Capítulo YPO</label>
            <input
              value={form.capitulo ?? ''}
              onChange={e => setForm(f => ({ ...f, capitulo: e.target.value }))}
              style={inputStyle}
              placeholder="Ej: YPO México"
            />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              style={inputStyle}
            >
              <option value="draft">Draft</option>
              <option value="active">Activo</option>
              <option value="completed">Completado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Ciudad</label>
            <input
              value={form.ciudad ?? ''}
              onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))}
              style={inputStyle}
              placeholder="Ej: Ciudad de México"
            />
          </div>
          <div>
            <label style={labelStyle}>País</label>
            <input
              value={form.pais ?? ''}
              onChange={e => setForm(f => ({ ...f, pais: e.target.value }))}
              style={inputStyle}
              placeholder="Ej: México"
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Ubicación / venue</label>
          <input
            value={form.ubicacion ?? ''}
            onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
            style={inputStyle}
            placeholder="Ej: Hotel Las Brisas"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Fecha inicio</label>
            <input
              type="date"
              value={form.fecha_inicio ?? ''}
              onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Fecha fin</label>
            <input
              type="date"
              value={form.fecha_fin ?? ''}
              onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Número de parejas</label>
          <input
            type="number"
            min={1}
            value={form.n_parejas ?? ''}
            onChange={e => setForm(f => ({ ...f, n_parejas: e.target.value ? parseInt(e.target.value) : null }))}
            style={inputStyle}
            placeholder="Ej: 12"
          />
        </div>

        <div>
          <label style={labelStyle}>Notas internas</label>
          <textarea
            value={form.notas_internas ?? ''}
            onChange={e => setForm(f => ({ ...f, notas_internas: e.target.value }))}
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            placeholder="Notas para el equipo interno..."
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
            onClick={() => router.push(`/eventos/${params.id}`)}
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
