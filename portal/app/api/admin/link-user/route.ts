import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// GET /api/admin/link-user?email=... — search profile by email
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const email = request.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (!profile) return NextResponse.json({ profile: null })
  return NextResponse.json({ profile })
}

// POST /api/admin/link-user — link/unlink user to family slot
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const service = createServiceClient()
  const body = await request.json()
  const { family_id, slot, user_id } = body // user_id = null to unlink

  if (!family_id || !slot) return NextResponse.json({ error: 'Parámetros incompletos' }, { status: 400 })

  const col = slot === '1' ? 'user_id1' : 'user_id2'
  const { error } = await service
    .from('families')
    .update({ [col]: user_id ?? null })
    .eq('id', family_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
