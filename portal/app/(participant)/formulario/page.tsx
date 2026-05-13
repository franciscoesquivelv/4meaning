'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import HelpButton from '@/components/HelpButton'

const FORM_SECTIONS = [
  'Su historia',
  'Momentos que los definen',
  'Sus valores',
  'Su familia',
  'El retiro',
  'Mensaje para sus hijos',
  'Logística',
]

const TOTAL_STEPS = FORM_SECTIONS.length

interface Hijo {
  nombre: string
  edad: string
}

const INPUT = "w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[#F5F0E8] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#C9A96E] transition-colors resize-y"
const LABEL = "block text-sm font-medium text-[#F5F0E8] mb-2"

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
  const [currentStep, setCurrentStep] = useState(1)
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    como_se_conocieron: '',
    historia_pareja: '',
    anos_juntos: '',
    tienen_hijos: false,
    legado: '',
    expectativas: '',
    momentos_importantes: '',
    mensaje_especial: '',
    restricciones_alimentarias: '',
    notas_adicionales: '',
  })
  const [hijos, setHijos] = useState<Hijo[]>([])
  const [valores, setValores] = useState<string[]>(['', '', '', '', ''])

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

  function validateStep(step: number): Record<string, string> {
    const errs: Record<string, string> = {}
    if (step === 1) {
      if (!form.como_se_conocieron.trim()) errs.como_se_conocieron = 'Este campo es requerido'
      if (!form.historia_pareja.trim()) errs.historia_pareja = 'Este campo es requerido'
    }
    if (step === 5) {
      if (!form.legado.trim()) errs.legado = 'Este campo es requerido'
      if (!form.expectativas.trim()) errs.expectativas = 'Este campo es requerido'
    }
    return errs
  }

  function handleNext() {
    const errs = validateStep(currentStep)
    if (Object.keys(errs).length > 0) {
      setStepErrors(errs)
      return
    }
    setStepErrors({})
    setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS))
  }

  function handlePrev() {
    setStepErrors({})
    setCurrentStep(s => Math.max(s - 1, 1))
  }

  async function handleSubmit() {
    const errs = validateStep(currentStep)
    if (Object.keys(errs).length > 0) {
      setStepErrors(errs)
      return
    }
    setStepErrors({})

    if (!familyId || !eventId) return
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const valoresFiltrados = valores.filter(v => v.trim() !== '')

    const { error: saveError } = await supabase.from('intake_responses').upsert({
      family_id: familyId,
      event_id: eventId,
      como_se_conocieron: form.como_se_conocieron,
      historia_pareja: form.historia_pareja,
      anos_juntos: form.anos_juntos ? parseInt(form.anos_juntos) : null,
      tienen_hijos: form.tienen_hijos,
      hijos: form.tienen_hijos ? hijos : [],
      legado: form.legado,
      expectativas: form.expectativas,
      momentos_importantes: form.momentos_importantes || null,
      mensaje_especial: form.mensaje_especial || null,
      valores: valoresFiltrados,
      restricciones_alimentarias: form.restricciones_alimentarias || null,
      notas_adicionales: form.notas_adicionales || null,
      submitted_at: new Date().toISOString(),
      submitted_by: user?.id,
    }, { onConflict: 'family_id,event_id' })

    setSaving(false)
    if (saveError) { setError(saveError.message); return }
    setSubmitted(true)
  }

  if (loading) return <div className="px-5 pt-6 text-[#A09A8F] text-sm">Cargando...</div>

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
        <h1 className="text-xl font-bold text-[#F5F0E8] mb-3">Perfil completado ✓</h1>
        <p className="text-sm text-[#A09A8F] leading-relaxed max-w-xs mx-auto">
          Gracias por completarlo. El equipo de Trascendencia lo revisará antes del retiro.
        </p>
      </div>
    )
  }

  const progressPct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div className="pb-10 bg-[#0C0C0C] min-h-screen">
      {/* Progress bar */}
      <div className="h-1 bg-[#2A2A2A] w-full sticky top-0 z-10">
        <div
          className="h-full bg-[#C9A96E] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="px-5 pt-6 max-w-lg mx-auto">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30">
            Paso {currentStep} de {TOTAL_STEPS}
          </span>
          <span className="text-xs text-[#6B7280]">{FORM_SECTIONS[currentStep - 1]}</span>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 mb-6">
          {FORM_SECTIONS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i + 1 <= currentStep ? '#C9A96E' : '#2A2A2A',
              }}
            />
          ))}
        </div>

        {/* Section title */}
        <h2
          className="text-2xl font-bold text-[#F5F0E8] mb-6"
          style={{ fontFamily: 'Cormorant, Georgia, serif' }}
        >
          {FORM_SECTIONS[currentStep - 1]}
        </h2>

        {/* Global error */}
        {error && (
          <div className="bg-[#FEE2E2]/10 border border-[#DC2626]/30 rounded-xl p-4 mb-6 text-[#DC2626] text-sm">
            {error}
          </div>
        )}

        {/* ── Step 1: Su historia ── */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <label className={LABEL}>¿Cómo se conocieron? <span className="text-[#DC2626]">*</span></label>
              <textarea
                value={form.como_se_conocieron}
                onChange={e => { setForm(f => ({ ...f, como_se_conocieron: e.target.value })); setStepErrors(s => ({ ...s, como_se_conocieron: '' })) }}
                className={`${INPUT} min-h-[80px]`}
                placeholder="Cuéntenme la historia de cómo se conocieron..."
              />
              {stepErrors.como_se_conocieron && (
                <p className="text-xs text-[#DC2626] mt-1">{stepErrors.como_se_conocieron}</p>
              )}
            </div>

            <div>
              <label className={LABEL}>Historia de su relación <span className="text-[#DC2626]">*</span></label>
              <textarea
                value={form.historia_pareja}
                onChange={e => { setForm(f => ({ ...f, historia_pareja: e.target.value })); setStepErrors(s => ({ ...s, historia_pareja: '' })) }}
                className={`${INPUT} min-h-[120px]`}
                placeholder="Los momentos más importantes de su historia juntos..."
              />
              {stepErrors.historia_pareja && (
                <p className="text-xs text-[#DC2626] mt-1">{stepErrors.historia_pareja}</p>
              )}
            </div>

            <div>
              <label className={LABEL}>Años juntos</label>
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
        )}

        {/* ── Step 2: Momentos que los definen ── */}
        {currentStep === 2 && (
          <div>
            <label className={LABEL}>¿Cuáles son los momentos más importantes que han vivido como familia?</label>
            <p className="text-xs text-[#6B7280] mb-2">
              Nacimientos, logros, crisis superadas, viajes, pérdidas, cambios de vida... Los momentos que los han moldeado.
            </p>
            <textarea
              value={form.momentos_importantes}
              onChange={e => setForm(f => ({ ...f, momentos_importantes: e.target.value }))}
              className={`${INPUT} min-h-[120px]`}
              placeholder="Compártenos los momentos más significativos de su historia juntos..."
            />
          </div>
        )}

        {/* ── Step 3: Sus valores ── */}
        {currentStep === 3 && (
          <div>
            <label className={LABEL}>¿Qué valores quieren transmitir a su familia?</label>
            <p className="text-xs text-[#6B7280] mb-3">
              Escribe hasta 5 valores que guían su vida y quieren que sus hijos y generaciones futuras hereden.
            </p>
            <div className="space-y-2">
              {valores.map((v, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-[#6B7280] w-4 text-right flex-shrink-0">{i + 1}</span>
                  <input
                    value={v}
                    onChange={e => setValores(vals => vals.map((x, idx) => idx === i ? e.target.value : x))}
                    className="flex-1 px-4 py-2.5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[#F5F0E8] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#C9A96E] transition-colors"
                    placeholder={['Fe, familia, integridad...', 'Amor, servicio...', 'Resiliencia...', 'Gratitud...', 'Legado...'][i]}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: Su familia ── */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <label className={LABEL}>¿Tienen hijos?</label>
              <div className="flex gap-3">
                {[{ val: true, label: 'Sí' }, { val: false, label: 'No' }].map(opt => (
                  <button
                    key={String(opt.val)}
                    type="button"
                    onClick={() => { setForm(f => ({ ...f, tienen_hijos: opt.val })); if (!opt.val) setHijos([]) }}
                    className={[
                      'px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer',
                      form.tienen_hijos === opt.val
                        ? 'bg-[#C9A96E] border-[#C9A96E] text-[#0C0C0C]'
                        : 'bg-[#1E1E1E] border-[#2A2A2A] text-[#A09A8F] hover:border-[#3A3A3A]',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {form.tienen_hijos && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={LABEL} style={{ marginBottom: 0 }}>Sus hijos</label>
                  <button
                    type="button"
                    onClick={() => setHijos(h => [...h, { nombre: '', edad: '' }])}
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
                        onChange={e => setHijos(h => h.map((x, idx) => idx === i ? { ...x, nombre: e.target.value } : x))}
                        className="flex-[2] px-3 py-2.5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[#F5F0E8] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#C9A96E] transition-colors"
                        placeholder="Nombre"
                      />
                      <input
                        value={hijo.edad}
                        onChange={e => setHijos(h => h.map((x, idx) => idx === i ? { ...x, edad: e.target.value } : x))}
                        className="flex-1 px-3 py-2.5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[#F5F0E8] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#C9A96E] transition-colors"
                        placeholder="Edad"
                        type="number"
                        min={0}
                      />
                      <button
                        type="button"
                        onClick={() => setHijos(h => h.filter((_, idx) => idx !== i))}
                        className="text-[#DC2626] text-xl leading-none px-1 py-1 cursor-pointer bg-transparent border-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {hijos.length === 0 && (
                    <p className="text-xs text-[#6B7280]">Agrega a sus hijos para que podamos mencionarlos en sus materiales.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 5: El retiro ── */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div>
              <label className={LABEL}>¿Qué legado quieren dejar? <span className="text-[#DC2626]">*</span></label>
              <textarea
                value={form.legado}
                onChange={e => { setForm(f => ({ ...f, legado: e.target.value })); setStepErrors(s => ({ ...s, legado: '' })) }}
                className={`${INPUT} min-h-[96px]`}
                placeholder="¿Qué quieren que recuerden de ustedes como pareja y familia?..."
              />
              {stepErrors.legado && (
                <p className="text-xs text-[#DC2626] mt-1">{stepErrors.legado}</p>
              )}
            </div>

            <div>
              <label className={LABEL}>Expectativas para el retiro <span className="text-[#DC2626]">*</span></label>
              <textarea
                value={form.expectativas}
                onChange={e => { setForm(f => ({ ...f, expectativas: e.target.value })); setStepErrors(s => ({ ...s, expectativas: '' })) }}
                className={`${INPUT} min-h-[96px]`}
                placeholder="¿Qué esperan vivir, aprender o transformar en Trascendencia?..."
              />
              {stepErrors.expectativas && (
                <p className="text-xs text-[#DC2626] mt-1">{stepErrors.expectativas}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 6: Mensaje para sus hijos ── */}
        {currentStep === 6 && (
          <div>
            <label className={LABEL}>¿Qué mensaje quieren dejarle a su familia?</label>
            <p className="text-xs text-[#6B7280] mb-2">
              Este mensaje puede aparecer en su material personalizado del retiro.
            </p>
            <textarea
              value={form.mensaje_especial}
              onChange={e => setForm(f => ({ ...f, mensaje_especial: e.target.value }))}
              className={`${INPUT} min-h-[120px]`}
              placeholder="Escríbanlo desde el corazón..."
            />
          </div>
        )}

        {/* ── Step 7: Logística ── */}
        {currentStep === 7 && (
          <div className="space-y-5">
            <div>
              <label className={LABEL}>Restricciones alimentarias</label>
              <textarea
                value={form.restricciones_alimentarias}
                onChange={e => setForm(f => ({ ...f, restricciones_alimentarias: e.target.value }))}
                className={`${INPUT} min-h-[60px]`}
                placeholder="Alergias, intolerancias, preferencias... (dejar en blanco si no aplica)"
              />
            </div>

            <div>
              <label className={LABEL}>Notas adicionales</label>
              <textarea
                value={form.notas_adicionales}
                onChange={e => setForm(f => ({ ...f, notas_adicionales: e.target.value }))}
                className={`${INPUT} min-h-[64px]`}
                placeholder="Cualquier otra cosa que quieran que el equipo sepa..."
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-3 text-[#A09A8F] text-sm border border-[#2A2A2A] rounded-xl hover:border-[#3A3A3A] transition-colors"
            >
              ← Anterior
            </button>
          )}

          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3 bg-[#C9A96E] text-[#0C0C0C] font-semibold text-sm rounded-xl hover:bg-[#D4B07A] transition-colors disabled:opacity-50"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-3 bg-[#C9A96E] text-[#0C0C0C] font-semibold text-sm rounded-xl hover:bg-[#D4B07A] transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>

      <HelpButton pageId="formulario" />
    </div>
  )
}
