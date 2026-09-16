'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { exigirEquipo } from '@/lib/personalab/medios'
import { resolverCuentaPorCorreo, otorgarAccesoExperiencia, asegurarPerfilIndividual } from '@/lib/personalab/acceso'

export interface EntradaCompra {
  email: string
  experienceId: string
  montoCentavos: number
  moneda: string
  referencia: string
  pagadoAt: string
}

// EL LIBRO A MANO, NO LA PASARELA. `purchases` está pensada para un webhook
// de pago que todavía no existe: hasta entonces, quien cobra (hoy, a mano,
// por transferencia o efectivo) es quien deja aquí la constancia. No hay
// nada que valide contra un banco ni contra Stripe; es honestamente lo que
// dice ser, un registro manual.
export async function registrarCompra(input: EntradaCompra): Promise<{ error: string } | { ok: true }> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { error: guardia.error }

  const email = input.email.trim().toLowerCase()
  if (!email) return { error: 'Falta el correo de quien compró.' }
  if (!input.experienceId) return { error: 'Falta elegir la experiencia.' }
  if (!Number.isFinite(input.montoCentavos) || input.montoCentavos < 0) {
    return { error: 'El monto no es un número válido.' }
  }
  if (!input.pagadoAt) return { error: 'Falta la fecha en que se pagó.' }

  // `referencia` es parte de la restricción única (proveedor, referencia).
  // Si quien registra no escribió una (por ejemplo, efectivo sin recibo),
  // se genera una para no chocar contra la siguiente compra manual.
  const referencia = input.referencia.trim() || `manual-${Date.now()}`
  const moneda = (input.moneda.trim() || 'USD').toUpperCase()

  const service = createServiceClient()
  const { error } = await service.from('purchases').insert({
    email,
    experience_id: input.experienceId,
    proveedor: 'manual',
    referencia,
    monto_centavos: Math.round(input.montoCentavos),
    moneda,
    pagado_at: new Date(input.pagadoAt).toISOString(),
  })

  if (error) {
    const duplicada = error.code === '23505' // unique (proveedor, referencia)
    return {
      error: duplicada
        ? 'Ya hay una compra manual con esa misma referencia. Escribe una distinta.'
        : error.message,
    }
  }

  revalidatePath('/personalab/compras')
  return { ok: true }
}

// EL CANJE: DE "ALGUIEN PAGÓ" A "ALGUIEN PUEDE ENTRAR". Reutiliza la misma
// lógica de cuenta y de grant que `/api/admin/invite` (lib/personalab/acceso.ts),
// que ya existía escrita a mano para probar este mismo recorrido antes de
// que hubiera un cobro real detrás. Este es el otro disparador que ese
// código esperaba desde que se escribió.
export async function canjearCompra(purchaseId: string): Promise<{ error: string } | { ok: true; correoEnviado: boolean }> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { error: guardia.error }

  const service = createServiceClient()
  const { data: compra, error: errCompra } = await service
    .from('purchases')
    .select('id, email, experience_id, canjeado_at')
    .eq('id', purchaseId)
    .maybeSingle()

  if (errCompra) return { error: errCompra.message }
  if (!compra) return { error: 'No se encontró esa compra.' }
  if (compra.canjeado_at) return { error: 'Esta compra ya se había canjeado antes.' }

  const cuenta = await resolverCuentaPorCorreo(compra.email, null)
  if (cuenta.estado === 'fallo') return { error: cuenta.motivo }

  const perfil = await asegurarPerfilIndividual({ userId: cuenta.userId, email: compra.email })
  if (perfil.estado === 'fallo') {
    return { error: `La cuenta se resolvió, pero no se pudo escribir su perfil: ${perfil.motivo}` }
  }

  const grant = await otorgarAccesoExperiencia({
    profileId: cuenta.userId,
    experienceId: compra.experience_id,
    otorgadoPor: guardia.user!.id,
  })
  if (grant.estado === 'fallo') {
    return { error: `La cuenta se resolvió, pero no se pudo dar el acceso: ${grant.motivo}` }
  }

  const { error: errUpdate } = await service
    .from('purchases')
    .update({
      canjeado_at: new Date().toISOString(),
      profile_id: cuenta.userId,
      grant_id: grant.grantId,
    })
    .eq('id', purchaseId)

  if (errUpdate) {
    // El acceso YA se dio: no se deshace por esto. Se avisa para que alguien
    // arregle a mano la fila de `purchases`, que es solo el libro contable,
    // no la puerta de acceso.
    return { error: `Se dio el acceso, pero no se pudo marcar la compra como canjeada: ${errUpdate.message}` }
  }

  revalidatePath('/personalab/compras')
  return { ok: true, correoEnviado: cuenta.correoEnviado }
}
