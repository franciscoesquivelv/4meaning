'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface LinkedUser {
  id: string
  full_name: string | null
  email: string
}

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

  // Linked users state
  const [linkedUser1, setLinkedUser1] = useState<LinkedUser | null>(null)
  const [linkedUser2, setLinkedUser2] = useState<LinkedUser | null>(null)
  const [userId1, setUserId1] = useState<string | null>(null)
  const [userId2, setUserId2] = useState<string | null>(null)

  // Link UI state per slot
  const [linkMode, setLinkMode] = useState<'1' | '2' | null>(null)
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResult, setSearchResult] = useState<LinkedUser | null | 'not_found'>()
  const [searching, setSearching] = useState(false)
  const [linking, setLinking] = useState(false)
  const [linkMsg, setLinkMsg] = useState<string | null>(null)

  const loadFamily = useCallback(async () => {
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
    setUserId1(data.user_id1 ?? null)
    setUserId2(data.user_id2 ?? null)

    // Load linked user profiles
    if (data.user_id1) {
      const { data: p } = await supabase.from('profiles').select('id, full_name, email').eq('id', data.user_id1).single()
      setLinkedUser1(p ?? null)
    } else {
      setLinkedUser1(null)
    }
    if (data.user_id2) {
      const { data: p } = await supabase.from('profiles').select('id, full_name, email').eq('id', data.user_id2).single()
      setLinkedUser2(p ?? null)
    } else {
      setLinkedUser2(null)
    }

    setLoading(false)
  }, [params.familyId, supabase])

  useEffect(() => { loadFamily() }, [loadFamily])

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
    if (error) { setError(error.message); return }
    router.push(`/eventos/${params.id}/familias`)
  }

  async function handleSearch() {
    if (!searchEmail.trim()) return
    setSearching(true)
    setSearchResult(undefined)
    const res = await fetch(`/api/admin/link-user?email=${encodeURIComponent(searchEmail.trim())}`)
    const data = await res.json()
    setSearching(false)
    setSearchResult(data.profile ?? 'not_found')
  }

  async function handleLink(userId: string | null, slot: '1' | '2') {
    setLinking(true)
    setLinkMsg(null)
    const res = await fetch('/api/admin/link-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ family_id: params.familyId, slot, user_id: userId }),
    })
    const data = await res.json()
    setLinking(false)
    if (!res.ok) { setLinkMsg(data.error ?? 'Error'); return }
    setLinkMode(null)
    setSearchEmail('')
    setSearchResult(undefined)
    await loadFamily()
  }

  async function handleInviteAndLink(slot: '1' | '2') {
    // Open invite page pre-filled — easiest to just redirect
    const email = slot === '1' ? form.email1 : form.email2
    router.push(`/usuarios/nuevo?family_id=${params.familyId}&slot=${slot}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(slot === '1' ? form.nombre1 : form.nombre2)}`)
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
        {/* Datos generales */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Datos generales</h2>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Nombre de familia *</label>
            <input required value={form.nombre_familia} onChange={e => setForm(f => ({ ...f, nombre_familia: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Habitación</label>
              <input value={form.habitacion} onChange={e => setForm(f => ({ ...f, habitacion: e.target.value }))} placeholder="412"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Estado</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
                <option value="invited">Invitado</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Completado</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Persona 1 */}
        <PersonaCard
          slot="1" label="Persona 1"
          nombre={form.nombre1} email={form.email1}
          linked={linkedUser1}
          linkMode={linkMode}
          searchEmail={searchEmail} searchResult={searchResult} searching={searching} linking={linking} linkMsg={linkMsg}
          onNombre={v => setForm(f => ({ ...f, nombre1: v }))}
          onEmail={v => setForm(f => ({ ...f, email1: v }))}
          onOpenLink={() => { setLinkMode('1'); setSearchEmail(form.email1); setSearchResult(undefined); setLinkMsg(null) }}
          onCloseLink={() => setLinkMode(null)}
          onSearchEmail={setSearchEmail}
          onSearch={handleSearch}
          onLink={(uid) => handleLink(uid, '1')}
          onUnlink={() => handleLink(null, '1')}
          onInvite={() => handleInviteAndLink('1')}
          required
        />

        {/* Persona 2 */}
        <PersonaCard
          slot="2" label="Persona 2" optional
          nombre={form.nombre2} email={form.email2}
          linked={linkedUser2}
          linkMode={linkMode}
          searchEmail={searchEmail} searchResult={searchResult} searching={searching} linking={linking} linkMsg={linkMsg}
          onNombre={v => setForm(f => ({ ...f, nombre2: v }))}
          onEmail={v => setForm(f => ({ ...f, email2: v }))}
          onOpenLink={() => { setLinkMode('2'); setSearchEmail(form.email2); setSearchResult(undefined); setLinkMsg(null) }}
          onCloseLink={() => setLinkMode(null)}
          onSearchEmail={setSearchEmail}
          onSearch={handleSearch}
          onLink={(uid) => handleLink(uid, '2')}
          onUnlink={() => handleLink(null, '2')}
          onInvite={() => handleInviteAndLink('2')}
        />

        {/* Logística */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logística</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.fotos_nube_recibidas} onChange={e => setForm(f => ({ ...f, fotos_nube_recibidas: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
            <div>
              <div className="text-sm font-medium text-slate-900">Fotos de La Nube recibidas</div>
              <div className="text-xs text-slate-400">La familia ya subió sus fotos al álbum compartido</div>
            </div>
          </label>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Notas internas</label>
            <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white resize-none"
              placeholder="Notas logísticas, alergias, preferencias..." />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <Link href={`/eventos/${params.id}/familias`}
            className="px-6 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}

// ─── PersonaCard ─────────────────────────────────────────────
interface PersonaCardProps {
  slot: '1' | '2'
  label: string
  optional?: boolean
  required?: boolean
  nombre: string
  email: string
  linked: LinkedUser | null
  linkMode: '1' | '2' | null
  searchEmail: string
  searchResult: LinkedUser | null | 'not_found' | undefined
  searching: boolean
  linking: boolean
  linkMsg: string | null
  onNombre: (v: string) => void
  onEmail: (v: string) => void
  onOpenLink: () => void
  onCloseLink: () => void
  onSearchEmail: (v: string) => void
  onSearch: () => void
  onLink: (uid: string) => void
  onUnlink: () => void
  onInvite: () => void
}

function PersonaCard({
  slot, label, optional, required: req,
  nombre, email, linked,
  linkMode, searchEmail, searchResult, searching, linking, linkMsg,
  onNombre, onEmail, onOpenLink, onCloseLink, onSearchEmail, onSearch, onLink, onUnlink, onInvite,
}: PersonaCardProps) {
  const isMySlot = linkMode === slot

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label} {optional && <span className="font-normal normal-case text-slate-400">(opcional)</span>}
        </h2>
        {/* Access status */}
        {linked ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold rounded-full">
              ✓ Con acceso
            </span>
            <button onClick={onUnlink} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
              Quitar
            </button>
          </div>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-400 text-xs font-medium rounded-full">
            Sin acceso
          </span>
        )}
      </div>

      {/* Name + email */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Nombre completo {req && '*'}</label>
        <input required={req} value={nombre} onChange={e => onNombre(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Email {req && '*'}</label>
        <input required={req} type="email" value={email} onChange={e => onEmail(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white" />
      </div>

      {/* Linked user info */}
      {linked && (
        <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
            {(linked.full_name ?? linked.email)[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">{linked.full_name ?? 'Sin nombre'}</div>
            <div className="text-xs text-slate-400 truncate">{linked.email}</div>
          </div>
        </div>
      )}

      {/* Link controls */}
      {!linked && !isMySlot && (
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onOpenLink}
            className="flex-1 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
            Vincular usuario existente
          </button>
          <button type="button" onClick={onInvite}
            className="flex-1 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors">
            Invitar y vincular
          </button>
        </div>
      )}

      {/* Search panel */}
      {isMySlot && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Buscar usuario por email</div>
          <div className="flex gap-2">
            <input
              value={searchEmail}
              onChange={e => onSearchEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onSearch())}
              placeholder="email@ejemplo.com"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
            <button type="button" onClick={onSearch} disabled={searching}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60">
              {searching ? '...' : 'Buscar'}
            </button>
          </div>

          {searchResult === 'not_found' && (
            <div className="text-xs text-slate-500">
              No encontrado. <button type="button" onClick={onInvite} className="text-slate-900 font-medium underline">Invitar este email →</button>
            </div>
          )}

          {searchResult && searchResult !== 'not_found' && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-lg">
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900">{searchResult.full_name ?? 'Sin nombre'}</div>
                <div className="text-xs text-slate-400">{searchResult.email}</div>
              </div>
              <button type="button" onClick={() => onLink(searchResult.id)} disabled={linking}
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60 flex-shrink-0 ml-3">
                {linking ? '...' : 'Vincular'}
              </button>
            </div>
          )}

          {linkMsg && <div className="text-xs text-red-500">{linkMsg}</div>}

          <button type="button" onClick={onCloseLink}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
