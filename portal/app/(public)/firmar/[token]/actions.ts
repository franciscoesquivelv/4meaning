'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

interface AgreementForSigning {
  id: string
  status: string
  signing_token: string | null
  nombre: string
  assigned_email: string | null
  families: { nombre_familia: string } | null
  events: { nombre: string } | null
}

export async function signAgreementByToken(
  token: string,
  agreementId: string,
  signerName: string
): Promise<{ success?: true; error?: string }> {
  if (!signerName.trim()) return { error: 'El nombre es requerido' }

  const supabase = createServiceClient()

  const { data: agreement } = await supabase
    .from('agreements')
    .select('id, status, signing_token, nombre, assigned_email, families(nombre_familia), events(nombre)')
    .eq('id', agreementId)
    .eq('signing_token', token)
    .single()

  if (!agreement) return { error: 'No se encontró el acuerdo' }

  const ag = agreement as unknown as AgreementForSigning

  if (ag.status === 'signed' || ag.status === 'approved') {
    return { error: 'Este acuerdo ya fue firmado' }
  }

  // Capture forensic metadata from request headers
  const headersList = headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'desconocido'
  const ua = headersList.get('user-agent') ?? 'desconocido'

  const signedAt = new Date().toISOString()

  const { error: updateError } = await supabase
    .from('agreements')
    .update({
      status: 'signed',
      signed_at: signedAt,
      signed_name: signerName,
      signed_ip: ip,
      signed_user_agent: ua,
    })
    .eq('id', agreementId)

  if (updateError) return { error: updateError.message }

  // Send confirmation email — requires RESEND_API_KEY env var
  // If not configured, the signature is already saved and this silently skips
  await sendConfirmationEmail({
    signerName,
    agreementNombre: ag.nombre,
    familyNombre: (ag.families as { nombre_familia: string } | null)?.nombre_familia ?? null,
    eventNombre: (ag.events as { nombre: string } | null)?.nombre ?? null,
    assignedEmail: ag.assigned_email,
    signedAt: new Date(signedAt),
  }).catch(() => { /* Signature saved; email failure is non-blocking */ })

  return { success: true }
}

async function sendConfirmationEmail({
  signerName,
  agreementNombre,
  familyNombre,
  eventNombre,
  assignedEmail,
  signedAt,
}: {
  signerName: string
  agreementNombre: string
  familyNombre: string | null
  eventNombre: string | null
  assignedEmail: string | null
  signedAt: Date
}) {
  if (!process.env.RESEND_API_KEY || !assignedEmail) return

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const fecha = signedAt.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Mexico_City',
  })

  const familyRow = familyNombre
    ? `<tr><td style="color:#B0A898;padding:6px 0;width:130px;">Familia</td><td style="color:#F5F0E8;">${familyNombre}</td></tr>`
    : ''
  const eventRow = eventNombre
    ? `<tr><td style="color:#B0A898;padding:6px 0;">Evento</td><td style="color:#F5F0E8;">${eventNombre}</td></tr>`
    : ''

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'Trascendencia <noreply@trascendencia.mx>',
    to: assignedEmail,
    subject: `Firma registrada — ${agreementNombre}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Georgia,serif;background:#0C0C0C;color:#F5F0E8;margin:0;padding:0;">
  <div style="max-width:520px;margin:40px auto;padding:0 20px;">
    <div style="text-align:center;margin-bottom:28px;">
      <p style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A96E;margin:0;">Trascendencia</p>
    </div>
    <div style="background:#1A1A1A;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:48px;height:48px;border-radius:50%;background:rgba(201,169,110,0.1);border:1px solid rgba(201,169,110,0.3);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#C9A96E;font-size:22px;line-height:1;">✓</span>
        </div>
        <h1 style="font-size:18px;font-weight:600;color:#F5F0E8;margin:0 0 4px;">Acuerdo firmado</h1>
        <p style="font-size:13px;color:#B0A898;margin:0;">Este correo es tu comprobante de firma.</p>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;">
        <table style="width:100%;font-size:13px;border-collapse:collapse;">
          <tr><td style="color:#B0A898;padding:6px 0;width:130px;">Acuerdo</td><td style="color:#F5F0E8;font-weight:500;">${agreementNombre}</td></tr>
          ${familyRow}
          ${eventRow}
          <tr><td style="color:#B0A898;padding:6px 0;">Firmado por</td><td style="color:#F5F0E8;">${signerName}</td></tr>
          <tr><td style="color:#B0A898;padding:6px 0;">Fecha</td><td style="color:#F5F0E8;">${fecha}</td></tr>
        </table>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#4A4541;margin-top:24px;">
      Generado automáticamente por el portal Trascendencia. Conserva este correo como constancia.
    </p>
  </div>
</body>
</html>`,
  })
}
