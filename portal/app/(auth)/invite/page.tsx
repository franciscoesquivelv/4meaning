'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function InviteForm() {
  const router  = useRouter()
  const params  = useSearchParams()

  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [name,      setName]      = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [customMsg, setCustomMsg] = useState('')

  useEffect(() => {
    // Supabase passes the session via hash fragment — exchange it
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email)
        setName(session.user.user_metadata?.full_name ?? '')
        // Fetch custom message from invitations table
        supabase
          .from('invitations')
          .select('custom_message')
          .eq('email', session.user.email)
          .eq('status', 'pending')
          .maybeSingle()
          .then(({ data }) => {
            if (data?.custom_message) setCustomMsg(data.custom_message)
          })
      }
    })
  }, [])

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== password2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // Update password
    const { error: pwErr } = await supabase.auth.updateUser({
      password,
      data: { full_name: name },
    })

    if (pwErr) {
      setError(pwErr.message)
      setLoading(false)
      return
    }

    // Mark invitation as accepted
    await supabase
      .from('invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('email', userEmail)
      .eq('status', 'pending')

    router.push('/')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4 mb-10">
        <img
          src="/logo.png"
          alt="Trascendencia"
          className="h-8 w-auto"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>

      {/* Personal welcome message */}
      {customMsg && (
        <div className="bg-white/4 border border-border rounded-lg px-5 py-4 mb-5 text-[12px] text-ink/80 leading-relaxed italic">
          &ldquo;{customMsg}&rdquo;
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-7">
        <h1 className="text-[13px] font-bold text-ink mb-1">
          Bienvenido/a a Trascendencia
        </h1>
        <p className="text-[11px] text-muted mb-6">
          {userEmail ? `Accediendo como ${userEmail}. ` : ''}
          Crea tu contraseña para continuar.
        </p>

        <form onSubmit={handleSetPassword} className="flex flex-col gap-4">
          <Input
            id="name"
            label="Tu nombre"
            type="text"
            required
            placeholder="Como quieres que te llamemos"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Input
            id="password2"
            label="Confirmar contraseña"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
          />

          {error && (
            <p className="text-[11px] text-error bg-error/8 border border-error/20 rounded px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} size="md" className="w-full mt-1">
            Crear cuenta y entrar
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="text-muted text-sm">Cargando...</div>
    }>
      <InviteForm />
    </Suspense>
  )
}
