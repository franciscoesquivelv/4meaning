import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: Request) {
  const formData = await request.formData()
  const email    = (formData.get('email')    as string) ?? ''
  const password = (formData.get('password') as string) ?? ''
  const next     = (formData.get('next')     as string) || '/'

  const origin = new URL(request.url).origin

  // Collect cookies that Supabase sets during sign-in
  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],   // No existing cookies on this fresh request
        setAll: (list: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          list.forEach(({ name, value, options }) =>
            cookiesToSet.push({ name, value, options: options ?? {} })
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?error=credenciales_invalidas&next=${encodeURIComponent(next)}`,
      { status: 303 }
    )
  }

  // Determine destination
  let destination = '/mi-retiro'
  if (next && next !== '/') {
    destination = next
  } else {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const role = profile?.role ?? 'participant'
    if (['super_admin', 'admin', 'staff'].includes(role)) {
      destination = '/dashboard'
    }
  }

  // Build redirect response and attach session cookies
  const response = NextResponse.redirect(`${origin}${destination}`, { status: 303 })

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  })

  return response
}
