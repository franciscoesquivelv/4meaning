import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options ?? {})
          )
        },
      },
    }
  )

  // Refresh session — IMPORTANT: do not remove
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Helper: build a redirect that preserves session cookies
  function redirectWithCookies(url: URL) {
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(cookie => {
      res.cookies.set(cookie.name, cookie.value, cookie)
    })
    return res
  }

  // ── Public routes (no auth needed) ──────────────────────
  const publicRoutes = ['/login', '/invite', '/auth/callback', '/auth/confirm', '/api/auth']
  const isPublic = publicRoutes.some(r => pathname.startsWith(r))

  // ── Unauthenticated → login ──────────────────────────────
  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return redirectWithCookies(loginUrl)
  }

  // ── Authenticated on login page → redirect to portal ────
  if (user && pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'participant'
    const dest = request.nextUrl.clone()

    if (['super_admin', 'admin', 'staff'].includes(role)) {
      dest.pathname = '/dashboard'
    } else {
      dest.pathname = '/mi-retiro'
    }

    return redirectWithCookies(dest)
  }

  // ── Role-based route protection ──────────────────────────
  const adminPaths = ['/dashboard', '/eventos', '/equipo', '/herramientas']
  const needsAdmin = user && adminPaths.some(p => pathname.startsWith(p))

  if (needsAdmin) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'participant'

    if (!['super_admin', 'admin', 'staff'].includes(role)) {
      const dest = request.nextUrl.clone()
      dest.pathname = '/mi-retiro'
      return redirectWithCookies(dest)
    }
  }

  return supabaseResponse
}
