import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{label}</div>
      <div className="text-sm text-slate-900 leading-relaxed">{children}</div>
    </div>
  )
}

function TextField({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null
  return <Block label={label}>{String(value)}</Block>
}

interface Hijo {
  nombre?: string
  edad?: string | number
}

export default async function FormularioFamiliaPage({ params }: { params: { id: string; familyId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: family } = await supabase
    .from('families')
    .select('id, nombre_familia, nombre1, nombre2')
    .eq('id', params.familyId)
    .single()
  if (!family) notFound()

  const { data: response } = await supabase
    .from('intake_responses')
    .select('*')
    .eq('family_id', params.familyId)
    .eq('event_id', params.id)
    .maybeSingle()

  if (!response) {
    return (
      <div className="p-8 max-w-2xl">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href={`/eventos/${params.id}/formularios`} className="hover:text-slate-700 transition-colors">← Formularios</Link>
        </nav>
        <h1 className="text-xl font-bold text-slate-900 mb-4">{family.nombre_familia}</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-yellow-800 text-sm">
          Esta familia aún no ha enviado su formulario de admisión.
        </div>
      </div>
    )
  }

  const hijos: Hijo[] = Array.isArray(response.hijos) ? (response.hijos as Hijo[]) : []
  const valores: string[] = Array.isArray(response.valores) ? (response.valores as string[]).filter(Boolean) : []

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href={`/eventos/${params.id}/formularios`} className="hover:text-slate-700 transition-colors">← Formularios</Link>
      </nav>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">{family.nombre_familia}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {family.nombre1}{family.nombre2 ? ` & ${family.nombre2}` : ''}
          <span className="mx-2 text-slate-300">·</span>
          Enviado el {formatDate(response.submitted_at)}
        </p>
      </div>

      <div className="space-y-4">

        {/* Su historia */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Su historia</h2>
          </div>
          <div className="px-5">
            <TextField label="¿Cómo se conocieron?" value={response.como_se_conocieron} />
            <TextField label="Historia de su relación" value={response.historia_pareja} />
            <TextField label="Años juntos" value={response.anos_juntos} />
          </div>
        </div>

        {/* Momentos importantes */}
        {response.momentos_importantes && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Momentos que los definen</h2>
            </div>
            <div className="px-5">
              <TextField label="Momentos importantes" value={response.momentos_importantes} />
            </div>
          </div>
        )}

        {/* Valores */}
        {valores.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valores que transmiten</h2>
            </div>
            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-2">
                {valores.map((v, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-full"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Familia */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Su familia</h2>
          </div>
          <div className="px-5">
            <Block label="¿Tienen hijos?">
              {response.tienen_hijos ? 'Sí' : 'No'}
            </Block>
            {response.tienen_hijos && hijos.length > 0 && (
              <Block label={`Hijos (${hijos.length})`}>
                <div className="flex flex-wrap gap-2 mt-1">
                  {hijos.map((hijo, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg">
                      {hijo.nombre ?? 'Sin nombre'}
                      {hijo.edad ? `, ${hijo.edad} años` : ''}
                    </span>
                  ))}
                </div>
              </Block>
            )}
          </div>
        </div>

        {/* El retiro */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">El retiro</h2>
          </div>
          <div className="px-5">
            <TextField label="Legado que quieren dejar" value={response.legado} />
            <TextField label="Expectativas" value={response.expectativas} />
          </div>
        </div>

        {/* Mensaje especial */}
        {response.mensaje_especial && (
          <div className="bg-[#FEF9C3] border border-yellow-200 rounded-xl p-5">
            <div className="text-[10px] font-semibold text-yellow-700 uppercase tracking-widest mb-2">Mensaje especial para su familia</div>
            <p className="text-sm text-yellow-900 leading-relaxed italic">&ldquo;{response.mensaje_especial}&rdquo;</p>
          </div>
        )}

        {/* Logística */}
        {(response.restricciones_alimentarias || response.notas_adicionales) && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logística</h2>
            </div>
            <div className="px-5">
              <TextField label="Restricciones alimentarias" value={response.restricciones_alimentarias} />
              <TextField label="Notas adicionales" value={response.notas_adicionales} />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
