import { createClient } from '@/lib/supabase/server'

const EQUIPO = ['super_admin', 'admin', 'staff']

// De quién es la familia que esta pantalla debe mostrar.
//
// Casi siempre es la del usuario que entró. La excepción es la PREVIA del
// equipo: alguien del equipo abre `?familia=<id>` para ver exactamente lo
// que ve esa pareja, que hasta ahora era imposible.
//
// LA GUARDA IMPORTA. El override solo lo puede usar el equipo. Un
// participante que escriba `?familia=` de otra familia en la barra de
// direcciones ve la suya, no la ajena: el parámetro se ignora en silencio,
// sin explicarle que existe.
export async function familiaVisible(
  familiaPedida?: string
): Promise<{ id: string; previa: boolean } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  if (familiaPedida) {
    const { data: perfil } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (perfil && EQUIPO.includes(perfil.role)) {
      return { id: familiaPedida, previa: true }
    }
  }

  const { data: propia } = await supabase
    .from('families')
    .select('id')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .maybeSingle()

  return propia ? { id: propia.id, previa: false } : null
}
