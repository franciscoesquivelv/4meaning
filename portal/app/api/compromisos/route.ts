import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST: create new compromiso
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { family_id, event_id, texto, categoria } = body

  // Verify user owns this family
  const { data: family } = await supabase.from('families')
    .select('id').eq('id', family_id)
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .maybeSingle()
  if (!family) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase.from('compromisos')
    .insert({ family_id, event_id, texto, categoria })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

// PATCH: toggle completado
export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, completado } = body

  // Get compromiso and verify ownership
  const { data: comp } = await supabase.from('compromisos')
    .select('family_id, families(user_id1, user_id2)')
    .eq('id', id).maybeSingle()

  const famRaw = comp?.families as unknown
  const fam = Array.isArray(famRaw)
    ? (famRaw[0] as { user_id1: string; user_id2: string } | undefined) ?? null
    : (famRaw as { user_id1: string; user_id2: string } | null)
  if (!fam || (fam.user_id1 !== user.id && fam.user_id2 !== user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase.from('compromisos')
    .update({ completado, completado_at: completado ? new Date().toISOString() : null })
    .eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
