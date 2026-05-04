import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import DeleteTeamMemberButton from './DeleteTeamMemberButton'

export default async function EquipoPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: members } = await supabase
    .from('event_team')
    .select('id, nombre, rol, bio_publica, notas_equipo, orden')
    .eq('event_id', params.id)
    .order('orden')

  const truncate = (s: string | null, n: number) =>
    s ? (s.length > n ? s.slice(0, n) + '…' : s) : '—'

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/eventos" className="hover:text-slate-700 transition-colors">Eventos</Link>
        <span>/</span>
        <Link href={`/eventos/${params.id}`} className="hover:text-slate-700 transition-colors">{evento.nombre}</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Equipo</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Equipo — {evento.nombre}</h1>
        <Link
          href={`/eventos/${params.id}/equipo/nuevo`}
          className="px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          + Agregar miembro
        </Link>
      </div>

      {!members?.length ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-slate-400 text-sm mb-4">No hay miembros en el equipo todavía.</p>
          <Link
            href={`/eventos/${params.id}/equipo/nuevo`}
            className="px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors inline-block"
          >
            Agregar primer miembro
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Bio pública</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Notas equipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.id} className={i < members.length - 1 ? 'border-b border-slate-100' : ''}>
                  <td className="px-4 py-3 font-medium text-slate-900">{m.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">{m.rol}</td>
                  <td className="px-4 py-3 text-slate-500">{truncate(m.bio_publica, 60)}</td>
                  <td className="px-4 py-3 text-slate-500">{truncate(m.notas_equipo, 60)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/eventos/${params.id}/equipo/${m.id}/editar`}
                        className="px-2.5 py-1 text-xs text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Editar
                      </Link>
                      <DeleteTeamMemberButton memberId={m.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
