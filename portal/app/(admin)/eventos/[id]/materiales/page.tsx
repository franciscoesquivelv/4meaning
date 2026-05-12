import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function MaterialesPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre, ciudad, pais, fecha_inicio')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: families } = await supabase
    .from('families')
    .select('id, nombre_familia, nombre1, nombre2')
    .eq('event_id', params.id)
    .order('nombre_familia')

  const base = (tipo: string, familyId: string) =>
    `/imprimir/${tipo}?event_id=${params.id}&family_id=${familyId}`

  return (
    <div className="p-8 max-w-5xl">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/eventos" className="hover:text-slate-700 transition-colors">Eventos</Link>
        <span>/</span>
        <Link href={`/eventos/${params.id}`} className="hover:text-slate-700 transition-colors truncate max-w-xs">
          {evento.nombre}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Materiales</span>
      </nav>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Generador de materiales</h1>
          <p className="text-sm text-slate-500 mt-1">
            Abre cada documento en una nueva pestaña → imprime o guarda como PDF.
          </p>
        </div>
        {/* Agenda — nivel evento */}
        <div className="flex gap-2">
          <a
            href={`/imprimir/agenda?event_id=${params.id}&modo=participantes`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Agenda participantes
          </a>
          <a
            href={`/imprimir/agenda?event_id=${params.id}&modo=equipo`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Agenda equipo
          </a>
        </div>
      </div>

      {/* Leyenda de documentos */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            tipo: 'gafetes',
            label: 'Gafetes de nombre',
            desc: '2 gafetes · 1 por persona',
          },
          {
            tipo: 'cheques',
            label: 'Cheques personalizados',
            desc: '3 cheques · 1 hoja carta',
          },
          {
            tipo: 'caratula',
            label: 'Carátula del álbum',
            desc: '1 página · tamaño carta',
          },
        ].map(doc => (
          <div key={doc.tipo} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">{doc.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{doc.desc}</div>
          </div>
        ))}
      </div>

      {/* Tabla de familias */}
      {!families?.length ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
          <p className="text-slate-400 text-sm">Sin familias registradas en este evento.</p>
          <Link
            href={`/eventos/${params.id}/familias/nueva`}
            className="inline-block mt-4 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            + Agregar familia
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Familia</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Personas</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Gafetes</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Cheques</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Carátula</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Todo</th>
              </tr>
            </thead>
            <tbody>
              {families.map((f, i) => (
                <tr
                  key={f.id}
                  className={`hover:bg-slate-50 transition-colors ${i < families.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{f.nombre_familia}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {[f.nombre1, f.nombre2].filter(Boolean).join(' · ') || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <a
                      href={base('gafetes', f.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors text-xs font-medium"
                      title="Generar gafetes"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v2a4 4 0 0 0 8 0V4"/></svg>
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <a
                      href={base('cheques', f.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors text-xs font-medium"
                      title="Generar cheques"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <a
                      href={base('caratula', f.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors text-xs font-medium"
                      title="Generar carátula"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5"/></svg>
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {['gafetes', 'cheques', 'caratula'].map(tipo => (
                        <a
                          key={tipo}
                          href={base(tipo, f.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-slate-500 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
                        >
                          {tipo.slice(0, 3)}
                        </a>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {families && families.length > 0 && (
        <p className="text-xs text-slate-400 mt-3 text-center">
          {families.length} {families.length === 1 ? 'familia' : 'familias'} · cada documento abre en nueva pestaña listo para imprimir
        </p>
      )}
    </div>
  )
}
