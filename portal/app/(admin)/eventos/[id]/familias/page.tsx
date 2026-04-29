import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    invited:   'bg-violet-100 text-violet-700',
    confirmed: 'bg-[#DBEAFE] text-[#2563EB]',
    completed: 'bg-slate-100 text-slate-500',
    pending:   'bg-[#FEF9C3] text-[#D97706]',
  }
  const labels: Record<string, string> = {
    invited: 'Invitado', confirmed: 'Confirmado', completed: 'Completado', pending: 'Pendiente',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {labels[status] ?? status}
    </span>
  )
}

export default async function FamiliasPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: families } = await supabase
    .from('families')
    .select('id, nombre_familia, nombre1, email1, nombre2, email2, habitacion, status, notas')
    .eq('event_id', params.id)
    .order('nombre_familia')

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/eventos" className="hover:text-slate-700 transition-colors">Eventos</Link>
        <span>/</span>
        <Link href={`/eventos/${params.id}`} className="hover:text-slate-700 transition-colors">{evento.nombre}</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Familias</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Familias — {evento.nombre}</h1>
        <Link
          href={`/eventos/${params.id}/familias/nueva`}
          className="px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          + Agregar familia
        </Link>
      </div>

      {!families?.length ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-slate-400 text-sm mb-4">No hay familias registradas en este evento.</p>
          <Link
            href={`/eventos/${params.id}/familias/nueva`}
            className="px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors inline-block"
          >
            Agregar primera familia
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Familia</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Persona 1</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Persona 2</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Habitación</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {families.map((f, i) => (
                <tr key={f.id} className={`hover:bg-slate-50 transition-colors ${i < families.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{f.nombre_familia}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-900">{f.nombre1}</div>
                    {f.email1 && <div className="text-xs text-slate-400 mt-0.5">{f.email1}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {f.nombre2 ? (
                      <>
                        <div className="text-slate-900">{f.nombre2}</div>
                        {f.email2 && <div className="text-xs text-slate-400 mt-0.5">{f.email2}</div>}
                      </>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{f.habitacion || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/eventos/${params.id}/familias/${f.id}/editar`}
                      className="text-xs text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium"
                    >
                      Editar
                    </Link>
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
