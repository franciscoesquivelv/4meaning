'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Family {
  id: string
  nombre_familia: string
  nombre1: string | null
  nombre2: string | null
}

interface EventInfo {
  nombre: string
  ciudad: string | null
  pais: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
}

interface Article {
  heading: string
  body: string
}

// ─── Templates ────────────────────────────────────────────────
const TEMPLATES = {
  participante: (family: Family | null, evento: EventInfo | null) => ({
    nombre: `Acuerdo de Participación${family ? ` — ${family.nombre_familia}` : ''}`,
    intro: `Los abajo firmantes, en plena capacidad y con pleno conocimiento, acuerdan participar en ${evento?.nombre ?? 'el evento Trascendencia'} bajo las condiciones establecidas en el presente acuerdo.`,
    articles: [
      {
        heading: 'Confidencialidad',
        body: 'Los participantes se comprometen a mantener en estricta confidencialidad todo lo compartido por otras familias durante el evento. Las historias, testimonios y experiencias personales de los demás participantes no serán divulgados a terceros bajo ninguna circunstancia.',
      },
      {
        heading: 'Participación voluntaria',
        body: 'La participación en todas las actividades del evento es completamente voluntaria. Los participantes reconocen que pueden retirarse de cualquier actividad en cualquier momento sin necesidad de justificación.',
      },
      {
        heading: 'Grabación y fotografía',
        body: 'Los participantes autorizan a Trascendencia el uso de fotografías y grabaciones realizadas durante el evento con fines internos y de documentación. No se publicará ningún material sin consentimiento previo.',
      },
      {
        heading: 'Responsabilidad personal',
        body: 'Cada participante es responsable de su bienestar emocional y físico durante el evento. Trascendencia y su equipo están disponibles para apoyo, pero la decisión de participar en cada experiencia recae en el individuo.',
      },
    ],
    meta: `Firmado en ${[evento?.ciudad, evento?.pais].filter(Boolean).join(', ') || 'el lugar del evento'} con plena conciencia y voluntad.`,
    sigs: [
      { label: family?.nombre1 ?? 'Participante 1' },
      ...(family?.nombre2 ? [{ label: family.nombre2 }] : []),
    ],
  }),

  video: (family: Family | null, evento: EventInfo | null) => ({
    nombre: `Acuerdo de Grabación y Video${family ? ` — ${family.nombre_familia}` : ''}`,
    intro: `Los abajo firmantes autorizan expresamente el uso de su imagen y voz en grabaciones realizadas durante ${evento?.nombre ?? 'el evento Trascendencia'}.`,
    articles: [
      {
        heading: 'Autorización de imagen',
        body: 'El participante autoriza expresamente a Trascendencia y a sus colaboradores el uso de fotografías, videos y grabaciones de audio en las que aparezca, obtenidas durante el desarrollo del evento.',
      },
      {
        heading: 'Uso del material',
        body: 'El material podrá ser utilizado para fines de documentación interna, materiales del evento (Storybook, recuerdos) y comunicación de Trascendencia. No será vendido ni cedido a terceros con fines comerciales.',
      },
      {
        heading: 'Derecho de revisión',
        body: 'El participante podrá solicitar la revisión del material en el que aparezca y solicitar la exclusión de fragmentos específicos, siempre que no afecte la integridad del producto final.',
      },
    ],
    meta: 'Esta autorización se otorga de manera voluntaria y sin contraprestación económica.',
    sigs: [
      { label: family?.nombre1 ?? 'Participante 1' },
      ...(family?.nombre2 ? [{ label: family.nombre2 }] : []),
    ],
  }),

  staff: (_family: Family | null, evento: EventInfo | null) => ({
    nombre: `Acuerdo de Confidencialidad — Staff${evento ? ` ${evento.nombre}` : ''}`,
    intro: 'El colaborador abajo firmante, en calidad de miembro del equipo Trascendencia, se compromete a respetar los términos establecidos en el presente acuerdo.',
    articles: [
      {
        heading: 'Confidencialidad absoluta',
        body: 'El colaborador se compromete a mantener en estricta confidencialidad toda información personal, familiar o sensible a la que tenga acceso durante su participación en el evento. Esto incluye nombres, historias, conflictos y cualquier dato compartido por los participantes.',
      },
      {
        heading: 'Conducta profesional',
        body: 'El colaborador se compromete a mantener una conducta profesional, empática y respetuosa en todo momento, priorizando el bienestar de los participantes sobre cualquier otra consideración.',
      },
      {
        heading: 'Material de trabajo',
        body: 'Cualquier material de trabajo, documentación interna o recursos del evento son propiedad exclusiva de Trascendencia y no podrán ser reproducidos, compartidos o utilizados fuera del contexto del evento.',
      },
    ],
    meta: 'Este acuerdo entra en vigor desde la firma hasta 5 años después de la celebración del evento.',
    sigs: [{ label: 'Colaborador' }, { label: 'Trascendencia' }],
  }),

  custom: () => ({
    nombre: '',
    intro: '',
    articles: [{ heading: '', body: '' }],
    meta: '',
    sigs: [{ label: '' }],
  }),
}

type TemplateKey = keyof typeof TEMPLATES

const TEMPLATE_OPTIONS: { key: TemplateKey; label: string; desc: string }[] = [
  { key: 'participante', label: 'Acuerdo de Participación', desc: 'Confidencialidad, participación voluntaria y consentimiento. El más común.' },
  { key: 'video', label: 'Autorización de Imagen y Video', desc: 'Consentimiento para fotografías y grabaciones del evento.' },
  { key: 'staff', label: 'Acuerdo de Confidencialidad Staff', desc: 'Para colaboradores y miembros del equipo.' },
  { key: 'custom', label: 'Acuerdo personalizado', desc: 'Empieza desde cero con contenido libre.' },
]

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function NuevoAcuerdoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [families, setFamilies] = useState<Family[]>([])
  const [evento, setEvento] = useState<EventInfo | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: template selection
  const [step, setStep] = useState<'template' | 'edit'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey | null>(null)

  // Form state
  const [familyId, setFamilyId] = useState('')
  const [assignedEmail, setAssignedEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [intro, setIntro] = useState('')
  const [articles, setArticles] = useState<Article[]>([{ heading: '', body: '' }])
  const [meta, setMeta] = useState('')
  const [sigs, setSigs] = useState<{ label: string }[]>([{ label: '' }])

  useEffect(() => {
    Promise.all([
      supabase.from('families').select('id, nombre_familia, nombre1, nombre2').eq('event_id', params.id).order('nombre_familia'),
      supabase.from('events').select('nombre, ciudad, pais, fecha_inicio, fecha_fin').eq('id', params.id).single(),
    ]).then(([{ data: fams }, { data: ev }]) => {
      setFamilies(fams ?? [])
      setEvento(ev)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  function applyTemplate(key: TemplateKey, fId?: string) {
    const family = families.find(f => f.id === (fId ?? familyId)) ?? null
    const tpl = TEMPLATES[key](family, evento)
    setNombre(tpl.nombre)
    setIntro(tpl.intro)
    setArticles(tpl.articles)
    setMeta(tpl.meta)
    setSigs(tpl.sigs)
    setSelectedTemplate(key)
  }

  function handleTemplateSelect(key: TemplateKey) {
    applyTemplate(key)
    setStep('edit')
  }

  function handleFamilyChange(fId: string) {
    setFamilyId(fId)
    // Update email from family1
    const family = families.find(f => f.id === fId)
    // Re-apply template to refresh names
    if (selectedTemplate) applyTemplate(selectedTemplate, fId)
    // Try to get email from family (we need email — let's fetch it)
    if (fId) {
      supabase.from('families').select('email1').eq('id', fId).single().then(({ data }) => {
        if (data?.email1) setAssignedEmail(data.email1)
      })
    }
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
      type: selectedTemplate ?? 'custom',
      status: 'sent',
      contenido: { intro, articles, meta, sigs },
      created_by: user?.id,
    })

    setSaving(false)
    if (error) { setError(error.message); return }
    router.push(`/eventos/${params.id}/acuerdos`)
  }

  // ─── Step 1: Template picker ───────────────────────────────
  if (step === 'template') {
    return (
      <div className="p-8 max-w-2xl">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href={`/eventos/${params.id}/acuerdos`} className="hover:text-slate-700 transition-colors">← Acuerdos</Link>
        </nav>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Nuevo acuerdo</h1>
          <p className="text-sm text-slate-500 mt-1">Elige una plantilla para comenzar.</p>
        </div>

        <div className="space-y-3">
          {TEMPLATE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => handleTemplateSelect(opt.key)}
              className="w-full text-left p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900 text-sm">{opt.label}</div>
                <span className="text-slate-300 group-hover:text-slate-600 transition-colors text-lg">→</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Step 2: Edit form ─────────────────────────────────────
  return (
    <div className="p-8 max-w-2xl">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <button onClick={() => setStep('template')} className="hover:text-slate-700 transition-colors">← Plantillas</button>
      </nav>

      <h1 className="text-xl font-bold text-slate-900 mb-6">
        {TEMPLATE_OPTIONS.find(t => t.key === selectedTemplate)?.label ?? 'Nuevo acuerdo'}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Asignación */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Asignación</h2>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Familia</label>
            <select
              value={familyId}
              onChange={e => handleFamilyChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="">— Sin familia (evento general) —</option>
              {families.map(f => (
                <option key={f.id} value={f.id}>{f.nombre_familia}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Email para firma</label>
            <input
              type="email"
              value={assignedEmail}
              onChange={e => setAssignedEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>
        </div>

        {/* Nombre */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Nombre del acuerdo *</label>
          <input
            required
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
          />
        </div>

        {/* Intro */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Introducción</label>
          <textarea
            value={intro}
            onChange={e => setIntro(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white resize-none"
          />
        </div>

        {/* Artículos */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Artículos</h2>
            <button
              type="button"
              onClick={() => setArticles(a => [...a, { heading: '', body: '' }])}
              className="text-xs text-slate-500 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              + Agregar artículo
            </button>
          </div>
          <div className="space-y-4">
            {articles.map((art, i) => (
              <div key={i} className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Artículo {i + 1}</span>
                  {articles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setArticles(a => a.filter((_, idx) => idx !== i))}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
                <input
                  value={art.heading}
                  onChange={e => setArticles(a => a.map((x, idx) => idx === i ? { ...x, heading: e.target.value } : x))}
                  placeholder="Título"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white mb-2"
                />
                <textarea
                  value={art.body}
                  onChange={e => setArticles(a => a.map((x, idx) => idx === i ? { ...x, body: e.target.value } : x))}
                  placeholder="Contenido del artículo..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Cierre */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Texto de cierre</label>
          <textarea
            value={meta}
            onChange={e => setMeta(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white resize-none"
          />
        </div>

        {/* Firmas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Líneas de firma</h2>
            <button
              type="button"
              onClick={() => setSigs(s => [...s, { label: '' }])}
              className="text-xs text-slate-500 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              + Agregar
            </button>
          </div>
          <div className="space-y-2">
            {sigs.map((sig, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={sig.label}
                  onChange={e => setSigs(s => s.map((x, idx) => idx === i ? { label: e.target.value } : x))}
                  placeholder={`Ej: Participante ${i + 1}`}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
                {sigs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSigs(s => s.filter((_, idx) => idx !== i))}
                    className="text-slate-300 hover:text-red-400 transition-colors text-xl leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Crear acuerdo'}
          </button>
          <Link
            href={`/eventos/${params.id}/acuerdos`}
            className="px-6 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
