'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Family {
  id: string
  nombre_familia: string
  nombre1: string | null
  nombre2: string | null
  user_id1: string | null
  user_id2: string | null
}

export default function InvitarUsuarioPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [families, setFamilies] = useState<Family[]>([])
  const [eventId, setEventId] = useState<string | null>(null)

  // Read URL params (prefill from family editor)
  const [form, setForm] = useState(() => {
    if (typeof window === 'undefined') return { email: '', full_name: '', role: 'participant', family_id: '', slot: '1' }
    const p = new URLSearchParams(window.location.search)
    return {
      email: p.get('email') ?? '',
      full_name: p.get('name') ?? '',
      role: 'participant',
      family_id: p.get('family_id') ?? '',
      slot: p.get('slot') ?? '1',
    }
  })

  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Load active/draft event families
    async function load() {
      const { data: event } = await supabase
        .from('events')
        .select('id')
        .in('status', ['active', 'draft'])
        .order('fecha_inicio', { ascending: false })
        .limit(1)
        .single()

      if (!event) return
      setEventId(event.id)

      const { data: fams } = await supabase
        .from('families')
        .select('id, nombre_familia, nombre1, nombre2, user_id1, user_id2')
        .eq('event_id', event.id)
        .order('nombre_familia')

      setFamilies(fams ?? [])
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedFamily = families.find(f => f.id === form.family_id)

  // Auto-select slot based on which slots are free
  useEffect(() => {
    if (!selectedFamily) return
    if (!selectedFamily.user_id1) setForm(f => ({ ...f, slot: '1' }))
    else if (!selectedFamily.user_id2) setForm(f => ({ ...f, slot: '2' }))
  }, [selectedFamily])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(null)

    const res = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email.trim().toLowerCase(),
        full_name: form.full_name.trim() || null,
        role: form.role,
        family_id: form.family_id || null,
        slot: form.slot,
      }),
    })

    const data = await res.json()
    setSending(false)

    if (!res.ok) {
      setError(data.error ?? 'Error al invitar usuario')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="p-8 max-w-lg text-center">
        <div className="w-14 h-14 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto mb-4 text-2xl text-[#16A34A]">✓</div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Invitación enviada</h1>
        <p className="text-sm text-slate-500 mb-6">
          {form.full_name || form.email} recibirá un email con un enlace para acceder al portal.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setSuccess(false); setForm({ email: '', full_name: '', role: 'participant', family_id: '', slot: '1' }) }}
            className="px-5 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
          >
            Invitar otro
          </button>
          <Link href="/usuarios" className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors">
            Ver usuarios
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-lg">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/usuarios" className="hover:text-slate-700 transition-colors">← Usuarios</Link>
      </nav>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Invitar usuario</h1>
        <p className="text-sm text-slate-500 mt-1">
          Se enviará un email con un enlace de acceso al portal.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Datos personales */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Datos del usuario</h2>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="nombre@email.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Nombre completo</label>
            <input
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Ej: María González"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Rol</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="participant">Participante</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Asignar a familia */}
        {form.role === 'participant' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Asignar a familia</h2>
              <p className="text-xs text-slate-400 mt-0.5">Opcional: puedes vincularlo después desde la familia.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Familia</label>
              <select
                value={form.family_id}
                onChange={e => setForm(f => ({ ...f, family_id: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                <option value="">Sin asignar por ahora</option>
                {families.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nombre_familia}
                    {f.user_id1 && f.user_id2 ? ' (completa)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedFamily && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Posición</label>
                <div className="flex gap-3">
                  {[
                    { val: '1', label: selectedFamily.nombre1 || 'Persona 1', taken: !!selectedFamily.user_id1 },
                    { val: '2', label: selectedFamily.nombre2 || 'Persona 2', taken: !!selectedFamily.user_id2 },
                  ].map(slot => (
                    <button
                      key={slot.val}
                      type="button"
                      disabled={slot.taken}
                      onClick={() => setForm(f => ({ ...f, slot: slot.val }))}
                      className={[
                        'flex-1 px-3 py-2.5 rounded-lg text-sm border transition-colors text-left',
                        slot.taken
                          ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                          : form.slot === slot.val
                          ? 'bg-slate-900 border-slate-900 text-white font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400',
                      ].join(' ')}
                    >
                      <div className="font-medium truncate">{slot.label}</div>
                      <div className="text-[10px] mt-0.5 opacity-70">{slot.taken ? 'Ya tiene acceso' : 'Disponible'}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-60"
        >
          {sending ? 'Enviando invitación...' : 'Enviar invitación'}
        </button>
      </form>
    </div>
  )
}
