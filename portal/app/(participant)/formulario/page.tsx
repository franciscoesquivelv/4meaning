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

      setSubmitted(!!existing)
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
    return (
      <div className="px-5 pt-6 text-[#A09A8F] text-sm">Cargando...</div>
    )
  }

  if (noFamily) {
    return (
      <div className="px-5 pt-6">
        <h1 className="text-xl font-bold text-[#F5F0E8] mb-4">Formulario de intake</h1>
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 text-[#A09A8F] text-sm">
          Tu cuenta no tiene una familia asignada. Contacta al equipo de Trascendencia.
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="px-5 pt-6 text-center py-16">
        <div className="text-5xl text-[#4ADE80] mb-4">✓</div>
        <h1 className="text-xl font-bold text-[#F5F0E8] mb-3">Formulario enviado</h1>
        <p className="text-sm text-[#A09A8F] leading-relaxed max-w-xs mx-auto">
          Gracias por completar su formulario de intake. El equipo de Trascendencia lo revisará antes del retiro.
        </p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#F5F0E8] mb-2">Formulario de intake</h1>
        <p className="text-sm text-[#A09A8F] leading-relaxed">
          Este formulario nos ayuda a personalizar su experiencia en Trascendencia. Tómense el tiempo para responder con profundidad.
        </p>
      </div>

      {error && (
        <div className="bg-[#FEE2E2]/10 border border-[#DC2626]/30 rounded-xl p-4 mb-6 text-[#DC2626] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Historia */}
        <div>
          <h2 className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-4">Su historia</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#F5F0E8] mb-2">¿Cómo se conocieron?</label>
              <textarea
                value={form.como_se_conocieron}
                onChange={e => setForm(f => ({ ...f, como_se_conocieron: e.target.value }))}
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[#F5F0E8] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#C9A96E] transition-colors resize-y min-h-[80px]"
                placeholder="Cuéntenme la historia de cómo se conocieron..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F5F0E8] mb-2">Historia de su relación</label>
              <textarea
                value={form.historia_pareja}
                onChange={e => setForm(f => ({ ...f, historia_pareja: e.target.value }))}
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[#F5F0E8] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#C9A96E] transition-colors resize-y min-h-[120px]"
                placeholder="Compartan los momentos más importantes de su historia juntos..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F5F0E8] mb-2">Años juntos</label>
              <input
                type="number"
                min={0}
                value={form.anos_juntos}
                onChange={e => setForm(f => ({ ...f, anos_juntos: e.target.value }))}
                className="px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[#F5F0E8] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#C9A96E] transition-colors w-32"
                placeholder="Ej: 12"
              />
            </div>
          </div>
        </div>

        {/* Section: Familia */}
        <div>
          <h2 className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-4">Su familia</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#F5F0E8] mb-3">¿Tienen hijos?</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tienen_hijos: true }))}
                  className={[
                    'px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer',
                    form.tienen_hijos
                      ? 'bg-[#C9A96E] border-[#C9A96E] text-[#0C0C0C]'
                      : 'bg-[#1E1E1E] border-[#2A2A2A] text-[#A09A8F] hover:border-[#3A3A3A]',
                  ].join(' ')}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => { setForm(f => ({ ...f, tienen_hijos: false })); setHijos([]) }}
                  className={[
                    'px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer',
                    !form.tienen_hijos
                      ? 'bg-[#C9A96E] border-[#C9A96E] text-[#0C0C0C]'
                      : 'bg-[#1E1E1E] border-[#2A2A2A] text-[#A09A8F] hover:border-[#3A3A3A]',
                  ].join(' ')}
                >
                  No
                </button>
              </div>
            </div>

            {form.tienen_hijos && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-[#F5F0E8]">Sus hijos</label>
                  <button
                    type="button"
                    onClick={addHijo}
                    className="text-xs text-[#C9A96E] border border-[#C9A96E]/30 px-3 py-1.5 rounded-lg hover:bg-[#C9A96E]/10 transition-colors cursor-pointer bg-transparent"
                  >
                    + Agregar hijo
                  </button>
                </div>
                <div className="space-y-2">
                  {hijos.map((hijo, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={hijo.nombre}
                        onChange={e => updateHijo(i, 'nombre', e.target.value)}
                        className="flex-[2] px-3 py-2.5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[#F5F0E8] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#C9A96E] transition-colors"
                        placeholder="Nombre"
                      />
                      <input
                        value={hijo.edad}
                        onChange={e => updateHijo(i, 'edad', e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[#F5F0E8] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#C9A96E] transition-colors"
                        placeholder="Edad"
                        type="number"
                        min={0}
                      />
                      <button
                        type="button"
                        onClick={() => removeHijo(i)}
                        className="text-[#DC2626] text-xl leading-none px-1 py-1 cursor-pointer bg-transparent border-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {hijos.length === 0 && (
                    <p className="text-xs text-[#6B7280]">Haz clic en &ldquo;Agregar hijo&rdquo; para registrar a sus hijos.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section: Retiro */}
        <div>
          <h2 className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-4">El retiro</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#F5F0E8] mb-2">¿Qué legado quieren dejar?</label>
              <textarea
                value={form.legado}
                onChange={e => setForm(f => ({ ...f, legado: e.target.value }))}
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[#F5F0E8] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#C9A96E] transition-colors resize-y min-h-[96px]"
                placeholder="¿Qué quieren que recuerden de ustedes como pareja y familia?..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F5F0E8] mb-2">Expectativas para el retiro</label>
              <textarea
                value={form.expectativas}
                onChange={e => setForm(f => ({ ...f, expectativas: e.target.value }))}
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[#F5F0E8] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#C9A96E] transition-colors resize-y min-h-[96px]"
                placeholder="¿Qué esperan vivir, aprender o transformar en Trascendencia?..."
              />
            </div>
          </div>
        </div>

        {/* Section: Otros */}
        <div>
          <h2 className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-4">Otros</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#F5F0E8] mb-2">Restricciones alimentarias</label>
              <textarea
                value={form.restricciones_alimentarias}
                onChange={e => setForm(f => ({ ...f, restricciones_alimentarias: e.target.value }))}
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[#F5F0E8] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#C9A96E] transition-colors resize-y min-h-[60px]"
                placeholder="Alergias, intolerancias, preferencias... (dejar en blanco si no aplica)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F5F0E8] mb-2">Notas adicionales</label>
              <textarea
                value={form.notas_adicionales}
                onChange={e => setForm(f => ({ ...f, notas_adicionales: e.target.value }))}
                className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[#F5F0E8] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#C9A96E] transition-colors resize-y min-h-[64px]"
                placeholder="Cualquier otra cosa que quieran que el equipo sepa..."
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={[
            'w-full py-4 bg-[#C9A96E] text-[#0C0C0C] font-semibold text-base rounded-xl transition-opacity',
            saving ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer',
          ].join(' ')}
        >
          {saving ? 'Enviando...' : 'Enviar formulario'}
        </button>
      </form>
    </div>
  )
}
