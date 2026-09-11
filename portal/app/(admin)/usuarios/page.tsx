import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EditRoleSelect from './EditRoleSelect'
import { todosLosUsuariosDeAuth } from '@/lib/supabase/usuariosAuth'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  family_name: string | null
  event_name: string | null
  // Nunca ha entrado con esa cuenta. Viene de `auth.users.last_sign_in_at`,
  // no de una columna propia: no hace falta duplicar el dato.
  //
  // NO ES "no registrado". La cuenta existe desde que se creó. Lo único
  // cierto que se puede decir es que nadie ha iniciado sesión todavía. Con
  // la confirmación de correo apagada (decisión del 2026-09-11), no hay
  // ningún estado intermedio real que mostrar aquí: una cuenta autoservicio
  // queda activa en el instante en que se crea. Esto es lo único honesto
  // que queda para decirle al equipo "esta cuenta existe y nadie la ha
  // usado todavía", y aplica a cualquier rol, no solo a los clientes de
  // PersonaLab: una invitación de staff que nadie aceptó se ve igual.
  nunca_ha_entrado: boolean
}

function UserTable({ users }: { users: Profile[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Familia / Evento</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr
              key={u.id}
              className={`hover:bg-slate-50 transition-colors ${i < users.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <td className="px-4 py-3 font-medium text-slate-900">
                {u.full_name ?? <span className="text-slate-400 font-normal">Sin nombre</span>}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {u.email}
                {u.nunca_ha_entrado && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 border border-amber-200">
                    Nunca ha iniciado sesión
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <EditRoleSelect userId={u.id} currentRole={u.role} />
              </td>
              <td className="px-4 py-3">
                {u.family_name ? (
                  <div>
                    <div className="text-slate-900 font-medium">{u.family_name}</div>
                    {u.event_name && <div className="text-xs text-slate-400 mt-0.5">{u.event_name}</div>}
                  </div>
                ) : (
                  <span className="text-slate-300 text-xs">Sin familia asignada</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function UsuariosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })

  // Fetch all families with their linked event
  const { data: families } = await supabase
    .from('families')
    .select('id, nombre_familia, user_id1, user_id2, events(nombre)')

  // `last_sign_in_at` vive en `auth.users`, no en `profiles`, y esa tabla no
  // se lee con el cliente normal: hace falta la clave de servicio.
  //
  // NO SE CONFÍA SOLO EN QUE EL LAYOUT DE (admin) YA VERIFICÓ EL ROL. Hugo
  // lo probó con ejecución real en la Etapa 5: Next.js arranca el cuerpo de
  // esta página y el chequeo del layout en paralelo, no uno después del
  // otro. Hoy el layout gana la carrera porque su camino es más corto, pero
  // eso es un accidente de qué tan rápidas son las consultas de cada uno,
  // no una garantía del framework. Un cambio futuro en esta misma página
  // (agregar una consulta antes de esta línea, paralelizar con Promise.all)
  // podría alterar esa carrera sin que nada lo avise. Por eso esta pantalla
  // verifica su propio permiso antes de tocar la clave de servicio, en vez
  // de heredarlo del padre.
  const { data: perfilPropio } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!perfilPropio || !['super_admin', 'admin', 'staff'].includes(perfilPropio.role)) {
    redirect('/login')
  }

  // Reemplaza la llamada directa a `listUsers()`, que sin paginar solo veía
  // los primeros 50: quien sí inició sesión, con el id fuera de esos 50, se
  // habría visto con el badge falso "Nunca ha iniciado sesión". Hallazgo de
  // Hugo, Etapa 5.
  const authUsers = await todosLosUsuariosDeAuth()
  const ultimoIngreso = new Map(authUsers.map(u => [u.id, u.last_sign_in_at]))

  const profilesWithFamily: Profile[] = (profiles ?? []).map(p => {
    const fam = families?.find(f => f.user_id1 === p.id || f.user_id2 === p.id)
    const ev = fam?.events as unknown as { nombre: string } | null
    return {
      ...p,
      family_name: fam?.nombre_familia ?? null,
      event_name: ev?.nombre ?? null,
      nunca_ha_entrado: !ultimoIngreso.get(p.id),
    }
  })

  const byRole = {
    team: profilesWithFamily.filter(p => ['super_admin', 'admin', 'staff'].includes(p.role)),
    participant: profilesWithFamily.filter(p => p.role === 'participant'),
    // Grupo nuevo, 2026-09-11. Antes 'individual' no caía en ningún grupo y
    // esas filas no aparecían en ninguna parte de esta pantalla, aunque la
    // cuenta existiera. Ver docs/INCIDENTE-ROL-INDIVIDUAL.md.
    individual: profilesWithFamily.filter(p => p.role === 'individual'),
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500 mt-1">{profilesWithFamily.length} {profilesWithFamily.length === 1 ? 'usuario registrado' : 'usuarios registrados'}</p>
        </div>
        <Link
          href="/usuarios/nuevo"
          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
        >
          + Invitar usuario
        </Link>
      </div>

      {/* Team */}
      {byRole.team.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Equipo ({byRole.team.length})
          </h2>
          <UserTable users={byRole.team} />
        </section>
      )}

      {/* Clientes de PersonaLab */}
      {byRole.individual.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Clientes PersonaLab ({byRole.individual.length})
          </h2>
          <UserTable users={byRole.individual} />
        </section>
      )}

      {/* Participants */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Participantes ({byRole.participant.length})
        </h2>
        {byRole.participant.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm shadow-sm">
            Sin participantes invitados aún.
          </div>
        ) : (
          <UserTable users={byRole.participant} />
        )}
      </section>
    </div>
  )
}
