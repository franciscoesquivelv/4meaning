'use server'

import { createServiceClient } from '@/lib/supabase/server'

export async function signAgreementByToken(
  token: string,
  agreementId: string
): Promise<{ success?: true; error?: string }> {
  const supabase = createServiceClient()

  // Verify that the token matches the agreement and it hasn't been signed yet
  const { data: agreement } = await supabase
    .from('agreements')
    .select('id, status, signing_token')
    .eq('id', agreementId)
    .eq('signing_token', token)
    .single()

  if (!agreement) {
    return { error: 'No se encontró el acuerdo' }
  }

  if (agreement.status === 'signed' || agreement.status === 'approved') {
    return { error: 'Este acuerdo ya fue firmado' }
  }

  const { error: updateError } = await supabase
    .from('agreements')
    .update({ status: 'signed', signed_at: new Date().toISOString() })
    .eq('id', agreementId)

  if (updateError) {
    return { error: updateError.message }
  }

  return { success: true }
}
