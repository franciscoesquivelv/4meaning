import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// Se configura dentro del handler, no al importar el modulo: web-push lanza
// excepcion si la clave viene vacia, y hacerlo arriba tumbaba el build entero
// en cualquier entorno sin las variables VAPID (todos menos produccion).
function configurarVapid(): boolean {
  const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privada = process.env.VAPID_PRIVATE_KEY
  if (!publica || !privada) return false
  webpush.setVapidDetails(
    'mailto:' + (process.env.VAPID_EMAIL ?? 'admin@trascendencia.com'),
    publica,
    privada
  )
  return true
}

export async function POST(req: NextRequest) {
  if (!configurarVapid()) {
    return NextResponse.json(
      { error: 'Las notificaciones no están configuradas en este entorno.' },
      { status: 503 }
    )
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['super_admin', 'admin', 'staff'].includes(profile?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { eventId, title, body, url } = await req.json()
  if (!eventId || !title) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('event_id', eventId)

  if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 })

  const payload = JSON.stringify({ title, body: body ?? '', url: url ?? '/mi-retiro' })
  let sent = 0
  const errors: string[] = []

  await Promise.allSettled(
    subs.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription as webpush.PushSubscription, payload)
        sent++
      } catch (e) {
        errors.push(String(e))
      }
    })
  )

  return NextResponse.json({ ok: true, sent, errors: errors.length > 0 ? errors : undefined })
}
