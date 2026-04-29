'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Article {
  heading: string
  body: string
}

interface SigLine {
  label: string
}

interface Family {
  id: string
  nombre_familia: string
}

export default function NuevoAcuerdoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [families, setFamilies] = useState<Family[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nombre, setNombre] = useState('')
  const [type, setType] = useState('participante')
  const [familyId, setFamilyId] = useState('')
  const [assignedEmail, setAssignedEmail] = useState('')
  const [intro, setIntro] = useState('')
  const [articles, setArticles] = useState<Article[]>([{ heading: '', body: '' }])
  const [meta, setMeta] = useState('')
  const [sigs, setSigs] = useState<SigLine[]>([{ label: '' }])

  useEffect(() => {
    supabase
      .from('families')
      .select('id, nombre_familia')
      .eq('event_id', params.id)
      .order('nombre_familia')
      .then(({ data }) => setFamilies(data ?? []))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  function addArticle() { setArticles(a => [...a, { heading: '', body: '' }]) }
  function removeArticle(i: number) { setArticles(a => a.filter((_, idx) => idx !== i)) }
  function updateArticle(i: number, field: keyof Article, val: string) {
    setArticles(a => a.map((art, idx) => idx === i ? { ...art, [field]: val } : art))
  }

  function addSig() { setSigs(s => [...s, { label: '' }]) }
  function removeSig(i: number) { setSigs(s => s.filter((_, idx) => idx !== i)) }
  function updateSig(i: number, val: string) {
    setSigs(s => s.map((sig, idx) => idx === i ? { label: val } : sig))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('agreements').insert({
      event_id: params.id,
      family_id: familyId || null,
      assigned_email: assignedEmail || null,
      nombre,
      type,
      status: 'sent',
      contenido: { intro, articles, meta, sigs },
      created_by: user?.id,
    })

    setSaving(false)
    if (error) { setError(error.message); return }
    router.push(`/eventos/${params.id}/acuerdos`)
  }

  return (
    <div style={{ padding: 32, maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/eventos/${params.id}/acuerdos`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← Acuerdos
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 12, marginBottom: 0 }}>Nuevo acuerdo</h1>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 12, marginBottom: 20, color: '#991b1b', fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Nombre del acuerdo *</label>
            <input required value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} placeholder="Ej: Acuerdo de participación" />
          </div>
          <div>
            <label style={labelStyle}>Tipo *</label>
            <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
              <option value="participante">Participante</option>
              <option value="evento">Evento</option>
              <option value="video">Video</option>
              <option value="storybook">Storybook</option>
              <option value="fotografo">Fotógrafo</option>
              <option value="staff">Staff</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Familia</label>
            <select value={familyId} onChange={e => setFamilyId(e.target.value)} style={inputStyle}>
              <option value="">— Sin familia asignada —</option>
              {families.map(f => (
                <option key={f.id} value={f.id}>{f.nombre_familia}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Email asignado</label>
            <input type="email" value={assignedEmail} onChange={e => setAssignedEmail(e.target.value)} style={inputStyle} placeholder="email@ejemplo.com" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Introducción</label>
          <textarea
            value={intro}
            onChange={e => setIntro(e.target.value)}
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            placeholder="Texto de introducción del acuerdo..."
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Artículos</label>
            <button type="button" onClick={addArticle} style={smallBtnStyle}>+ Agregar artículo</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {articles.map((art, i) => (
              <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Artículo {i + 1}</span>
                  {articles.length > 1 && (
                    <button type="button" onClick={() => removeArticle(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>
                      Eliminar
                    </button>
                  )}
                </div>
                <input
                  value={art.heading}
                  onChange={e => updateArticle(i, 'heading', e.target.value)}
                  style={{ ...inputStyle, marginBottom: 8 }}
                  placeholder="Título del artículo"
                />
                <textarea
                  value={art.body}
                  onChange={e => updateArticle(i, 'body', e.target.value)}
                  style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                  placeholder="Contenido del artículo..."
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Cierre / texto final</label>
          <textarea
            value={meta}
            onChange={e => setMeta(e.target.value)}
            style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }}
            placeholder="Texto de cierre del acuerdo..."
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Líneas de firma</label>
            <button type="button" onClick={addSig} style={smallBtnStyle}>+ Agregar firma</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sigs.map((sig, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  value={sig.label}
                  onChange={e => updateSig(i, e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder={`Ej: Participante ${i + 1}`}
                />
                {sigs.length > 1 && (
                  <button type="button" onClick={() => removeSig(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Guardando...' : 'Crear acuerdo'}
          </button>
          <button type="button" onClick={() => router.push(`/eventos/${params.id}/acuerdos`)} style={{ padding: '10px 24px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, cursor: 'pointer' }}>
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

const smallBtnStyle: React.CSSProperties = {
  padding: '4px 12px',
  background: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 12,
  cursor: 'pointer',
  color: '#374151',
}
