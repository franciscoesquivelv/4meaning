import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      email,
      full_name,
      role = 'participant',
      event_id,
      family_id,
      custom_message,
    } = body

    if (!email || !full_name) {
      return NextResponse.json({ error: 'email y full_name son requeridos' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const appUrl   = process.env.NEXT_PUBLIC_APP_URL!

    // 1. Invite user via Supabase Auth (sends invite email through Supabase)
    //    We override with our own Resend email below.
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: { full_name, role },
        redirectTo: `${appUrl}/auth/callback?next=/invite`,
      }
    )

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // 2. Log invitation in our table
    await supabase.from('invitations').insert({
      email,
      full_name,
      role,
      event_id:       event_id  ?? null,
      family_id:      family_id ?? null,
      custom_message: custom_message ?? null,
      status: 'pending',
    })

    // 3. Send branded email via Resend
    const inviteUrl = authData.user?.confirmation_sent_at
      ? `${appUrl}/invite` // User will receive the Supabase email — we send our own styled one
      : `${appUrl}/invite`

    await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to:   email,
      subject: `${full_name.split(' ')[0]}, estás invitado/a a Trascendencia`,
      html: buildInviteEmail({
        full_name,
        custom_message,
        invite_url: inviteUrl,
      }),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Invite error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

function buildInviteEmail({
  full_name,
  custom_message,
  invite_url,
}: {
  full_name: string
  custom_message?: string
  invite_url: string
}) {
  const firstName = full_name.split(' ')[0]

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación Trascendencia</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:40px auto;padding:0 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#0a0a0a;padding:32px 0 24px;text-align:center;border-bottom:1px solid #272727;">
          <tr>
            <td>
              <p style="margin:0;font-size:7px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#666;">
                TRASCENDENCIA
              </p>
            </td>
          </tr>
        </table>

        <!-- Body -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#141414;border:1px solid #272727;border-top:none;padding:36px 36px 32px;">
          <tr>
            <td>
              <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#f8f7f5;line-height:1.3;">
                ${firstName}, estás invitado/a a<br>Trascendencia.
              </p>

              ${custom_message ? `
              <p style="margin:0 0 24px;font-size:13px;color:#aaa;line-height:1.7;font-style:italic;
                border-left:2px solid #3a3a3a;padding-left:14px;">
                "${custom_message}"
              </p>
              ` : ''}

              <p style="margin:0 0 28px;font-size:13px;color:#888;line-height:1.7;">
                Hemos creado tu acceso al portal donde podrás ver la información de tu retiro,
                completar los acuerdos y comunicarte con el equipo.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f8f7f5;border-radius:6px;">
                    <a href="${invite_url}"
                      style="display:inline-block;padding:13px 28px;font-size:11px;font-weight:700;
                        letter-spacing:0.14em;text-transform:uppercase;color:#0a0a0a;text-decoration:none;">
                      Crear mi contraseña →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:10px;color:#555;line-height:1.6;">
                Este enlace expira en 7 días. Si tienes alguna dificultad,
                responde este correo y el equipo te ayudará.
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;text-align:center;">
          <tr>
            <td>
              <p style="margin:0;font-size:10px;color:#3a3a3a;">
                www.latrascendencia.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
