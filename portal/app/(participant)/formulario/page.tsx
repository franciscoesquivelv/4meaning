'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

interface Hijo {
  nombre: string
  edad: string
}

export default function FormularioPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const [noFamily, setNoFamily] = useState(false)

  const [form, setForm] = useState({
    como_se_conocieron: '',
    historia_pareja: '',
    anos_juntos: '',
    tienen_hijos: false,
    legado: '',
    expectativas: '',
    restricciones_alimentarias: '',
    notas_adicionales: '',
  })
  const [hijos, setHijos] = useState<Hijo[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: family } = await supabase
        .from('families')
        .select('id, event_id')
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
        .limit(1)
        .maybeSingle()

      if (!family) {
        setNoFamily(true)
        setLoading(false)
        return
      }

      setFamilyId(family.id)
      setEventId(family.event_id)

      const { data: existing } = await supabase
        .from('intake_responses')
        .select('*')
        .eq('family_id', family.id)
        .maybeSingle()

      if (existing) {
        setSubmitted(true)
      } else {
        setSubmitted(false)
      }

      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addHijo() { setHijos(h => [...h, { nombre: '', edad: '' }]) }
  function removeHijo(i: number) { setHijos(h => h.filter((_, idx) => idx !== i)) }
  function updateHijo(i: number, field: keyof Hijo, val: string) {
    setHijos(h => h.map((hijo, idx) => idx === i ? { ...hijo, [field]: val } : hijo))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!familyId || !eventId) return
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('intake_responses').upsert({
      family_id: familyId,
      event_id: eventId,
      como_se_conocieron: form.como_se_conocieron,
      historia_pareja: form.historia_pareja,
      anos_juntos: form.anos_juntos ? parseInt(form.anos_juntos) : null,
      tienen_hijos: form.tienen_hijos,
      hijos: form.tienen_hijos ? hijos : [],
      legado: form.legado,
      expectativas: form.expectativas,
      restricciones_alimentarias: form.restricciones_alimentarias || null,
      notas_adicionales: form.notas_adicionales || null,
      submitted_at: new Date().toISOString(),
      submitted_by: user?.id,
    }, { onConflict: 'family_id,event_id' })

    setSaving(false)
    if (error) { setError(error.message); return }
    setSubmitted(true)
  }

  if (loading) {
    return <div style={{ padding: 24, color: '#6b7280' }}>Cargando...</div>
  }

  if (noFamily) {
    return (
      <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Formulario de intake</h1>
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 10, padding: 20, color: '#78350f', fontSize: 14 }}>
          Tu cuenta no tiene una familia asignada. Contacta al equipo de Trascendencia.
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✓</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Formulario enviado</h1>
          <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6 }}>
            Gracias por completar su formulario de intake. El equipo de Trascendencia lo revisará antes del retiro.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Formulario de intake</h1>
        <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.5 }}>
          Este formulario nos ayuda a personalizar su experiencia en Trascendencia. Tómense el tiempo para responder con profundidad.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 12, marginBottom: 20, color: '#991b1b', fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <label style={labelStyle}>¿Cómo se conocieron?</label>
          <textarea
            value={form.como_se_conocieron}
            onChange={e => setForm(f => ({ ...f, como_se_conocieron: e.target.value }))}
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            placeholder="Cuéntenme la historia de cómo se conocieron..."
          />
        </div>

        <div>
          <label style={labelStyle}>Historia de su relación</label>
          <textarea
            value={form.historia_pareja}
            onChange={e => setForm(f => ({ ...f, historia_pareja: e.target.value }))}
            style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
            placeholder="Compartan los momentos más importantes de su historia juntos, los hitos, los retos superados..."
          />
        </div>

        <div>
          <label style={labelStyle}>Años juntos</label>
          <input
            type="number"
            min={0}
            value={form.anos_juntos}
            onChange={e => setForm(f => ({ ...f, anos_juntos: e.target.value }))}
            style={{ ...inputStyle, maxWidth: 120 }}
            placeholder="Ej: 12"
          />
        </div>

        <div>
          <label style={labelStyle}>¿Tienen hijos?</label>
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, tienen_hijos: true }))}
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                border: `2px solid ${form.tienen_hijos ? '#111' : '#d1d5db'}`,
                background: form.tienen_hijos ? '#111' : '#fff',
                color: form.tienen_hijos ? '#fff' : '#374151',
                cursor: 'pointer',
              }}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => { setForm(f => ({ ...f, tienen_hijos: false })); setHijos([]) }}
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                border: `2px solid ${!form.tienen_hijos ? '#111' : '#d1d5db'}`,
                background: !form.tienen_hijos ? '#111' : '#fff',
                color: !form.tienen_hijos ? '#fff' : '#374151',
                cursor: 'pointer',
              }}
            >
              No
            </button>
          </div>
        </div>

        {form.tienen_hijos && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Sus hijos</label>
              <button
                type="button"
                onClick={addHijo}
                style={{ padding: '4px 12px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#374151' }}
              >
                + Agregar hijo
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {hijos.map((hijo, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={hijo.nombre}
                    onChange={e => updateHijo(i, 'nombre', e.target.value)}
                    style={{ ...inputStyle, flex: 2 }}
                    placeholder="Nombre"
                  />
                  <input
                    value={hijo.edad}
                    onChange={e => updateHijo(i, 'edad', e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Edad"
                    type="number"
                    min={0}
                  />
                  <button
                    type="button"
                    onClick={() => removeHijo(i)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {hijos.length === 0 && (
                <p style={{ fontSize: 13, color: '#9ca3af' }}>Haz clic en "Agregar hijo" para registrar a sus hijos.</p>
              )}
            </div>
          </div>
        )}

        <div>
          <label style={labelStyle}>¿Qué legado quieren dejar?</label>
          <textarea
            value={form.legado}
            onChange={e => setForm(f => ({ ...f, legado: e.target.value }))}
            style={{ ...inputStyle, minHeight: 96, resize: 'vertical' }}
            placeholder="¿Qué quieren que recuerden de ustedes como pareja y familia?..."
          />
        </div>

        <div>
          <label style={labelStyle}>Expectativas para el retiro</label>
          <textarea
            value={form.expectativas}
            onChange={e => setForm(f => ({ ...f, expectativas: e.target.value }))}
            style={{ ...inputStyle, minHeight: 96, resize: 'vertical' }}
            placeholder="¿Qué esperan vivir, aprender o transformar en Trascendencia?..."
          />
        </div>

        <div>
          <label style={labelStyle}>Restricciones alimentarias</label>
          <textarea
            value={form.restricciones_alimentarias}
            onChange={e => setForm(f => ({ ...f, restricciones_alimentarias: e.target.value }))}
            style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }}
            placeholder="Alergias, intolerancias, preferencias... (dejar en blanco si no aplica)"
          />
        </div>

        <div>
          <label style={labelStyle}>Notas adicionales</label>
          <textarea
            value={form.notas_adicionales}
            onChange={e => setForm(f => ({ ...f, notas_adicionales: e.target.value }))}
            style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }}
            placeholder="Cualquier otra cosa que quieran que el equipo sepa..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '14px',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            marginTop: 8,
          }}
        >
          {saving ? 'Enviando...' : 'Enviar formulario'}
        </button>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 15,
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
  lineHeight: 1.5,
}
