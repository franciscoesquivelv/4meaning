import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
  staff: 'Staff',
  participant: 'Participante',
}

const ROLE_STYLES: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  admin:       'bg-[#DBEAFE] text-[#2563EB]',
  staff:       'bg-[#DCFCE7] text-[#16A34A]',
  participant: 'bg-slate-100 text-slate-600',
}

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  family_name: string | null
  event_name: string | null
}

export default async function UsuariosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all profiles with their linked family (if any)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })

  // For each profile, check if linked to a family
  const { data: families } = await supabase
    .from('families')
    .select('id, nombre_familia, user_id1, user_id2, events(nombre)')

  const profilesWithFamily: Profile[] = (profiles ?? []).map(p => {
    const fam = families?.find(f => f.user_id1 === p.id || f.user_id2 === p.id)
    const ev = fam?.events as unknown as { nombre: string } | null
    return {
      ...p,
      family_name: fam?.nombre_familia ?? null,
      event_name: ev?.nombre ?? null,
    }
  })

  const byRole = {
    admin: profilesWithFamily.filter(p => ['super_admin', 'admin', 'staff'].includes(p.role)),
    participant: profilesWithFamily.filter(p => p.role === 'participant'),
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500 mt-1">{profilesWithFamily.length} usuarios registrados</p>
        </div>
        <Link
          href="/usuarios/nuevo"
          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
        >
          + Invitar usuario
        </Link>
      </div>

      {/* Team */}
      {byRole.admin.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Equipo ({byRole.admin.length})
          </h2>
          <UserTable users={byRole.admin} />
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
          <UserTable users={byRole.participant} showFamily />
        )}
      </section>
    </div>
  )
}

function UserTable({ users, showFamily = false }: { users: Profile[]; showFamily?: boolean }) {
  const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super admin', admin: 'Admin', staff: 'Staff', participant: 'Participante',
  }
  const ROLE_STYLES: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-700',
    admin: 'bg-[#DBEAFE] text-[#2563EB]',
    staff: 'bg-[#DCFCE7] text-[#16A34A]',
    participant: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
            {showFamily && (
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Familia / Evento</th>
            )}
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
              <td className="px-4 py-3 text-slate-500">{u.email}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_STYLES[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                  {ROLE_LABELS[u.role] ?? u.role}
                </span>
              </td>
              {showFamily && (
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
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
