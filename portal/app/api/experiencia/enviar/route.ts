import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

// ── EL REGALO ───────────────────────────────────────────────────
//
// Recibe lo que la persona escribió (que vive en SU navegador, no en nuestra
// base), lo compone, y se lo manda a su correo. Después no queda nada.
//
// TRES REGLAS DE SEGURIDAD QUE NO SON NEGOCIABLES:
//
// 1. SE MANDA AL CORREO DE LA SESIÓN, nunca a uno que venga en la petición.
//    Si el destinatario lo pusiera el cliente, cualquiera con una cuenta
//    podría mandar texto arbitrario a cualquier dirección firmado por
//    4 Meaning. Eso es un relé abierto y así es como una marca acaba en
//    listas de spam.
//
// 2. HAY QUE TENER ACCESO A LA EXPERIENCIA. Se comprueba con la misma RLS
//    que gobierna la lectura: si la consulta no devuelve la experiencia, no
//    hay acceso y no se manda nada.
//
// 3. NO SE PERSISTE NI SE REGISTRA EL CONTENIDO. Ni en una tabla, ni en los
//    registros del servidor. Lo que se escribe en los registros es que se
//    mandó, a quién y de qué experiencia. Nunca qué decía.
//
// Lo que sí sale de aquí: el texto viaja a Resend, que es quien entrega el
// correo. "No se guarda" es cierto; "nadie lo ve nunca" no lo sería, y por
// eso no se dice en ninguna pantalla.

export const runtime = 'nodejs'

interface Respuesta {
  consigna: string
  texto: string
  tramo?: string
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: 'sin-sesion' }, { status: 401 })
  }

  let cuerpo: { slug?: string; respuestas?: Respuesta[] }
  try {
    cuerpo = await req.json()
  } catch {
    return NextResponse.json({ error: 'peticion-invalida' }, { status: 400 })
  }

  const { slug, respuestas } = cuerpo
  if (!slug || !Array.isArray(respuestas) || respuestas.length === 0) {
    return NextResponse.json({ error: 'nada-que-enviar' }, { status: 400 })
  }

  // Regla 2. La RLS decide, no este código.
  const { data: exp, error } = await supabase
    .from('experiences')
    .select('nombre')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('[enviar] falló la consulta de experiencia:', error.message)
    return NextResponse.json({ error: 'fallo' }, { status: 500 })
  }
  if (!exp) {
    return NextResponse.json({ error: 'sin-acceso' }, { status: 403 })
  }

  const clave = process.env.RESEND_API_KEY
  if (!clave) {
    // 503, no 500: esto no es un fallo inesperado, es una pieza que
    // todavía no se conectó (docs/PROTOCOLO-CORREO.md, sección 3). El
    // 500 genérico mezclaba esto con un error real de la consulta de
    // arriba, y en los registros de Vercel se veían idénticos. El
    // participante ve el mismo aviso de siempre (Cierre.tsx no
    // distingue por código), pero quien revise los registros ya no
    // tiene que adivinar cuál de las dos cosas pasó.
    console.error('[enviar] RESEND_API_KEY no está configurada — ver docs/PROTOCOLO-CORREO.md sección 3')
    return NextResponse.json({ error: 'no-configurado' }, { status: 503 })
  }

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Sus propias palabras, compuestas. Sin interpretación y sin que nadie le
  // diga lo que significan: decidido el 2026-09-10, y es lo coherente con el
  // marco de tratar a la persona como quién y no como caso.
  const piezas = respuestas
    .filter(r => r.texto?.trim())
    .map(r => `
      <div style="margin:0 0 40px;">
        <p style="margin:0 0 10px;font-size:13px;line-height:1.5;color:#6C665F;">${esc(r.consigna)}</p>
        <p style="margin:0;font-size:17px;line-height:1.7;color:#171310;white-space:pre-wrap;">${esc(r.texto.trim())}</p>
      </div>`)
    .join('')

  if (!piezas) {
    return NextResponse.json({ error: 'nada-que-enviar' }, { status: 400 })
  }

  const resend = new Resend(clave)

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'PersonaLab <noreply@trascendencia.mx>',
      to: user.email,
      subject: `Lo que escribiste en ${exp.nombre}`,
      html: `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F6EEE3;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#965640;">PersonaLab</p>
    <h1 style="margin:12px 0 0;font-size:30px;font-weight:200;letter-spacing:-0.025em;color:#002B34;">${esc(exp.nombre)}</h1>
    <p style="margin:20px 0 44px;font-size:16px;line-height:1.6;font-weight:300;color:#171310;">
      Esto es lo que escribiste. Es tuyo y no lo guardamos en ninguna parte:
      este correo es la única copia.
    </p>
    ${piezas}
    <p style="margin:44px 0 0;padding-top:20px;border-top:1px solid #E2D5C4;font-size:13px;line-height:1.6;color:#6C665F;">
      Guarda este correo. Si cierras la pestaña de la experiencia, lo que
      escribiste se borra de tu navegador.
    </p>
  </div>
</body></html>`,
    })
  } catch (e) {
    // Regla 3: se registra que falló, no qué decía.
    console.error('[enviar] Resend rechazó el envío:', (e as Error).message)
    return NextResponse.json({ error: 'fallo' }, { status: 502 })
  }

  console.log(`[enviar] ok · ${slug} · ${respuestas.length} respuestas`)
  return NextResponse.json({ ok: true, correo: user.email })
}
