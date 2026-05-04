/*
 * SQL to run in Supabase:
 *
 * alter table public.events
 *   add column if not exists info_logistica text,
 *   add column if not exists info_que_llevar text,
 *   add column if not exists info_vestimenta text,
 *   add column if not exists info_emergencia text;
 */
'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface EventData {
  nombre: string
  capitulo: string
  ciudad: string
  pais: string
  fecha_inicio: string
  fecha_fin: string
  ubicacion: string
  n_parejas: number | null
  status: string
  pipeline_status: string
  contacto_capitulo: string
  costo_por_pareja: number | null
  primer_deposito: number | null
  notas_comerciales: string
  notas_internas: string
  nube_url: string
  info_logistica: string
  info_que_llevar: string
  info_vestimenta: string
  info_emergencia: string
}

const field = (
  label: string,
  key: keyof EventData,
  form: EventData,
  setForm: React.Dispatch<React.SetStateAction<EventData>>,
  opts?: { type?: string; placeholder?: string; required?: boolean }
) => (
  <div>
    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
      {label} {opts?.required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={opts?.type ?? 'text'}
      required={opts?.required}
      value={(form[key] as string) ?? ''}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      placeholder={opts?.placeholder}
      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
    />
  </div>
)

export default function EditarEventoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<EventData>({
    nombre: '',
    capitulo: '',
    ciudad: '',
    pais: '',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '',
    n_parejas: null,
    status: 'draft',
    pipeline_status: 'prospecto',
    contacto_capitulo: '',
    costo_por_pareja: null,
    primer_deposito: null,
    notas_comerciales: '',
    notas_internas: '',
    nube_url: '',
    info_logistica: '',
    info_que_llevar: '',
    info_vestimenta: '',
    info_emergencia: '',
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
        pipeline_status: data.pipeline_status ?? 'prospecto',
        contacto_capitulo: data.contacto_capitulo ?? '',
        costo_por_pareja: data.costo_por_pareja ?? null,
        primer_deposito: data.primer_deposito ?? null,
        notas_comerciales: data.notas_comerciales ?? '',
        notas_internas: data.notas_internas ?? '',
        nube_url: data.nube_url ?? '',
        info_logistica: data.info_logistica ?? '',
        info_que_llevar: data.info_que_llevar ?? '',
        info_vestimenta: data.info_vestimenta ?? '',
        info_emergencia: data.info_emergencia ?? '',
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
        pipeline_status: form.pipeline_status,
        contacto_capitulo: form.contacto_capitulo || null,
        costo_por_pareja: form.costo_por_pareja,
        primer_deposito: form.primer_deposito,
        notas_comerciales: form.notas_comerciales || null,
        notas_internas: form.notas_internas || null,
        nube_url: form.nube_url || null,
        info_logistica: form.info_logistica || null,
        info_que_llevar: form.info_que_llevar || null,
        info_vestimenta: form.info_vestimenta || null,
        info_emergencia: form.info_emergencia || null,
      })
      .eq('id', params.id)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push(`/eventos/${params.id}`)
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Cargando...</div>

  return (
    <div className="p-8 max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href={`/eventos/${params.id}`} className="hover:text-slate-700 transition-colors">← Volver al evento</Link>
      </nav>

      <h1 className="text-xl font-bold text-slate-900 mb-6">Editar evento</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Info básica */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Información básica</h2>
          {field('Nombre del evento', 'nombre', form, setForm, { required: true, placeholder: 'Trascendencia México 2026' })}
          <div className="grid grid-cols-2 gap-4">
            {field('Capítulo', 'capitulo', form, setForm, { placeholder: 'YPO México' })}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Pipeline</label>
              <select
                value={form.pipeline_status}
                onChange={e => setForm(f => ({ ...f, pipeline_status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                <option value="prospecto">Prospecto</option>
                <option value="confirmado">Confirmado</option>
                <option value="en_preparacion">En preparación</option>
                <option value="ejecutado">Ejecutado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('Ciudad', 'ciudad', form, setForm, { placeholder: 'Ciudad de México' })}
            {field('País', 'pais', form, setForm, { placeholder: 'México' })}
          </div>
          {field('Ubicación / Venue', 'ubicacion', form, setForm, { placeholder: 'Hotel Las Brisas' })}
          <div className="grid grid-cols-3 gap-4">
            {field('Fecha inicio', 'fecha_inicio', form, setForm, { type: 'date' })}
            {field('Fecha fin', 'fecha_fin', form, setForm, { type: 'date' })}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Nº parejas</label>
              <input
                type="number"
                min={1}
                value={form.n_parejas ?? ''}
                onChange={e => setForm(f => ({ ...f, n_parejas: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="12"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* La Nube */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">La Nube</h2>
            <p className="text-xs text-slate-400 mt-0.5">Link del álbum compartido para que las familias suban sus fotos.</p>
          </div>
          {field('URL de La Nube', 'nube_url', form, setForm, { placeholder: 'https://photos.google.com/share/...' })}
        </div>

        {/* Comercial */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Datos comerciales</h2>
          {field('Contacto del capítulo', 'contacto_capitulo', form, setForm, { placeholder: 'Nombre y email del Chair o coordinador' })}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Costo por pareja (MXN)</label>
              <input
                type="number"
                min={0}
                value={form.costo_por_pareja ?? ''}
                onChange={e => setForm(f => ({ ...f, costo_por_pareja: e.target.value ? parseFloat(e.target.value) : null }))}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Primer depósito (MXN)</label>
              <input
                type="number"
                min={0}
                value={form.primer_deposito ?? ''}
                onChange={e => setForm(f => ({ ...f, primer_deposito: e.target.value ? parseFloat(e.target.value) : null }))}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Notas comerciales</label>
            <textarea
              value={form.notas_comerciales}
              onChange={e => setForm(f => ({ ...f, notas_comerciales: e.target.value }))}
              placeholder="Condiciones especiales, historial de negociación..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white resize-none"
            />
          </div>
        </div>

        {/* Notas internas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Notas internas</h2>
          <textarea
            value={form.notas_internas}
            onChange={e => setForm(f => ({ ...f, notas_internas: e.target.value }))}
            placeholder="Notas para el equipo..."
            rows={4}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white resize-none"
          />
        </div>

        {/* Información para participantes */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Información para participantes</h2>
            <p className="text-xs text-slate-400 mt-0.5">Visible para las familias en el portal. Puedes usar saltos de línea.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Logística</label>
            <textarea
              value={form.info_logistica}
              onChange={e => setForm(f => ({ ...f, info_logistica: e.target.value }))}
              placeholder="El check-in en el hotel es a partir de las 3pm. Traslado desde aeropuerto..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Qué llevar</label>
            <textarea
              value={form.info_que_llevar}
              onChange={e => setForm(f => ({ ...f, info_que_llevar: e.target.value }))}
              placeholder="Ropa cómoda para actividades, ropa formal para cena del sábado..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Código de vestimenta</label>
            <textarea
              value={form.info_vestimenta}
              onChange={e => setForm(f => ({ ...f, info_vestimenta: e.target.value }))}
              placeholder="Viernes: casual. Sábado cena: formal. Domingo: casual cómodo."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Contacto de emergencia</label>
            <textarea
              value={form.info_emergencia}
              onChange={e => setForm(f => ({ ...f, info_emergencia: e.target.value }))}
              placeholder="Coordinadora: María López +52 55 1234 5678. Emergencias médicas: 911."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <Link
            href={`/eventos/${params.id}`}
            className="px-6 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
