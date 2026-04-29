import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const code       = searchParams.get('code')
  const tokenHash  = searchParams.get('token_hash')
  const type       = searchParams.get('type') as 'invite' | 'recovery' | 'signup' | null
  const next       = searchParams.get('next') ?? '/'
  const error      = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`)
  }

  const supabase = await createClient()

  // ── Invite / magic-link / recovery flow (token_hash) ──
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })

    if (!error) {
      // For invites → send to set-password page
      const dest = type === 'invite' ? '/invite/set-password' : next
      return NextResponse.redirect(`${origin}${dest}`)
    }

    return NextResponse.redirect(`${origin}/login?error=link_invalido`)
  }

  // ── PKCE code flow ──────────────────────────────────────
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link_invalido`)
}
