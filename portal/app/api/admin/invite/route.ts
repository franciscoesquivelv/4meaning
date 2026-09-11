import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Verify the requester is admin/super_admin
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

  const body = await request.json()
  const { email, full_name, role = 'participant', family_id, slot, experience_id } = body

  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

  const service = createServiceClient()

  // 1. Create or invite user via Supabase Auth admin
  //    inviteUserByEmail sends a magic link email automatically
  const { data: inviteData, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
    data: { full_name },
  })

  if (inviteError) {
    // If user already exists, just fetch them
    if (!inviteError.message.includes('already registered')) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 })
    }
  }

  // 2. Escribir el perfil con el rol correcto, revisando el error.
  //
  // ANTES: dos escrituras seguidas al mismo perfil, un upsert y despues un
  // update con los mismos datos, y ninguna de las dos miraba `error`. El
  // update era ademas puro trabajo repetido: cuando `userId` viene de una
  // invitacion nueva, el upsert ya dejo el rol correcto, y repetirlo con la
  // misma informacion no cambia nada salvo gastar una consulta sin revisar.
  //
  // Y las dos sin revisar `error` era el incidente documentado en
  // docs/INCIDENTE-ROL-INDIVIDUAL.md: si `profiles.role` rechaza el valor
  // (por ejemplo, antes de que existiera la migracion que acepta
  // 'individual'), la ruta seguia respondiendo `{ok:true}` con el perfil sin
  // el rol pedido. Ahora, si cualquiera de las dos escrituras falla, la ruta
  // lo dice, no lo esconde.
  const userId = inviteData?.user?.id
  let resolvedUserId = userId

  if (userId) {
    const { error: perfilError } = await service
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: full_name ?? null,
        role,
      }, { onConflict: 'id' })

    if (perfilError) {
      return NextResponse.json(
        { error: `La cuenta se creó, pero no se pudo escribir su perfil: ${perfilError.message}` },
        { status: 500 }
      )
    }
  } else {
    // El usuario ya existía en auth.users (inviteError decía "already
    // registered"). Se busca por correo y se actualiza el rol ahí.
    const { data: { users } } = await service.auth.admin.listUsers()
    const existingUser = users.find(u => u.email === email)
    resolvedUserId = existingUser?.id

    if (resolvedUserId) {
      const { error: perfilError } = await service
        .from('profiles')
        .update({ role, full_name: full_name ?? undefined })
        .eq('id', resolvedUserId)

      if (perfilError) {
        return NextResponse.json(
          { error: `No se pudo actualizar el perfil existente: ${perfilError.message}` },
          { status: 500 }
        )
      }
    }
  }

  // 3. Link to family if specified
  if (resolvedUserId && family_id && slot) {
    const col = slot === '1' ? 'user_id1' : 'user_id2'
    await service
      .from('families')
      .update({ [col]: resolvedUserId })
      .eq('id', family_id)
  }

  // 4. Dar acceso a una experiencia de PersonaLab, si se pidió.
  //
  // Es el mismo par de pasos (crear cuenta, crear grant) que va a hacer el
  // webhook de pago cuando exista: crea la cuenta, y le da acceso a lo que
  // compró. Construirlo aquí primero, a mano, es lo que hace que conectar el
  // pago después sea llamar esta misma lógica desde otro disparador, no
  // inventarla de cero.
  if (resolvedUserId && experience_id) {
    // NO SE HACE CON `upsert` + `onConflict`. La restricción única de
    // `grants` es `(profile_id, experience_id, run_id)`, y `run_id` va nulo
    // aquí porque esto no es una corrida. En Postgres dos NULL no cuentan
    // como iguales para una restricción única corriente, así que el
    // `onConflict` nunca dispara sobre estas filas: cada invitación repetida
    // crearía OTRO grant en vez de reactivar el que ya existe, y esa
    // duplicación se vería como la misma experiencia dos veces en "Mis
    // experiencias". Se busca a mano y se decide.
    const { data: existente } = await service
      .from('grants')
      .select('id, revocado_at')
      .eq('profile_id', resolvedUserId)
      .eq('experience_id', experience_id)
      .is('run_id', null)
      .maybeSingle()

    const { error: grantError } = existente
      ? await service
          .from('grants')
          .update({ revocado_at: null, otorgado_por: user.id, otorgado_at: new Date().toISOString() })
          .eq('id', existente.id)
      : await service
          .from('grants')
          .insert({
            profile_id: resolvedUserId,
            experience_id,
            titularidad: 'individual',
            otorgado_por: user.id,
          })

    if (grantError) {
      // La cuenta ya se creó; no se deshace por esto. Se informa y el grant
      // se puede dar a mano después.
      return NextResponse.json({
        ok: true,
        userId: resolvedUserId,
        avisoGrant: grantError.message,
      })
    }
  }

  return NextResponse.json({ ok: true, userId: resolvedUserId })
}
