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
    fotos_nube_recibidas: false,
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
        fotos_nube_recibidas: data.fotos_nube_recibidas ?? false,
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
        fotos_nube_recibidas: form.fotos_nube_recibidas,
      })
      .eq('id', params.familyId)

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push(`/eventos/${params.id}/familias`)
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Cargando...</div>

  return (
    <div className="p-8 max-w-2xl">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href={`/eventos/${params.id}/familias`} className="hover:text-slate-700 transition-colors">← Familias</Link>
      </nav>

      <h1 className="text-xl font-bold text-slate-900 mb-6">Editar familia</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre familia + status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Datos generales</h2>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Nombre de familia *</label>
            <input
              required
              value={form.nombre_familia}
              onChange={e => setForm(f => ({ ...f, nombre_familia: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Habitación</label>
              <input
                value={form.habitacion}
                onChange={e => setForm(f => ({ ...f, habitacion: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                placeholder="Ej: 412"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Estado</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                <option value="invited">Invitado</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Completado</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Persona 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Persona 1</h2>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Nombre completo *</label>
            <input
              required
              value={form.nombre1}
              onChange={e => setForm(f => ({ ...f, nombre1: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Email *</label>
            <input
              required
              type="email"
              value={form.email1}
              onChange={e => setForm(f => ({ ...f, email1: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>
        </div>

        {/* Persona 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Persona 2 <span className="font-normal normal-case text-slate-400">(opcional)</span></h2>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Nombre completo</label>
            <input
              value={form.nombre2}
              onChange={e => setForm(f => ({ ...f, nombre2: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={form.email2}
              onChange={e => setForm(f => ({ ...f, email2: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>
        </div>

        {/* La Nube + Notas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logística</h2>

          {/* La Nube checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.fotos_nube_recibidas}
              onChange={e => setForm(f => ({ ...f, fotos_nube_recibidas: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <div>
              <div className="text-sm font-medium text-slate-900">Fotos de La Nube recibidas</div>
              <div className="text-xs text-slate-400">La familia ya subió sus fotos al álbum compartido</div>
            </div>
          </label>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Notas internas</label>
            <textarea
              value={form.notas}
              onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white resize-none"
              placeholder="Notas logísticas, alergias, preferencias..."
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
            href={`/eventos/${params.id}/familias`}
            className="px-6 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
