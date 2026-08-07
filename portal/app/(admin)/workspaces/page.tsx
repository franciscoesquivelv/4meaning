import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Panel de la casa: desde aqui se entra a cualquiera de los dos workspaces.
// Vive dentro del grupo (admin), asi que ya queda protegido por su layout,
// que exige rol super_admin, admin o staff.
//
// Nota de alcance: hoy el rol es un campo unico y global en profiles, asi
// que no existe todavia "staff solo de PersonaLab". Mientras eso llega en
// el frente de identidad, super_admin ve las dos marcas y el resto ve
// Trascendencia, que es la que esta en produccion.

interface Marca {
  id: string
  nombre: string
  descripcion: string
  estado: string
  href: string
  color: string
  tinte: string
  borde: string
  listo: boolean
}

const MARCAS: Marca[] = [
  {
    id: 'trascendencia',
    nombre: 'Trascendencia',
    descripcion: 'Retiros familiares. Eventos, familias, acuerdos, itinerario y operación del día.',
    estado: 'En producción',
    href: '/dashboard',
    color: '#4C0F18',
    tinte: 'rgba(76,15,24,0.05)',
    borde: 'rgba(76,15,24,0.22)',
    listo: true,
  },
  {
    id: 'personalab',
    nombre: 'PersonaLab',
    descripcion: 'Experiencias para foros. Catálogo, corridas, capítulos, moderadores y kit.',
    estado: 'Prototipo',
    href: '/prototipo/personalab',
    color: '#002B34',
    tinte: 'rgba(0,43,52,0.05)',
    borde: 'rgba(0,43,52,0.20)',
    listo: false,
  },
]

export default async function WorkspacesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const esSuper = profile?.role === 'super_admin'
  const visibles = esSuper ? MARCAS : MARCAS.filter(m => m.id === 'trascendencia')
  const nombre = profile?.full_name?.split(' ')[0]

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="mb-10">
        <p className="text-sm text-slate-500">
          {nombre ? `Hola, ${nombre}.` : 'Hola.'}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mt-1">
          ¿Dónde vas a trabajar?
        </h1>
        {esSuper && (
          <p className="text-sm text-slate-500 mt-2">
            Tu cuenta opera las dos marcas.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibles.map(m => (
          <Link
            key={m.id}
            href={m.href}
            className="block rounded-xl p-6 transition-all hover:shadow-md"
            style={{ background: m.tinte, border: `1px solid ${m.borde}` }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="text-xl font-semibold tracking-tight" style={{ color: m.color }}>
                {m.nombre}
              </h2>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                  m.listo ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {m.estado}
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{m.descripcion}</p>
            <div
              className="mt-5 pt-4 text-xs font-medium"
              style={{ borderTop: `1px solid ${m.borde}`, color: m.color }}
            >
              Entrar →
            </div>
          </Link>
        ))}
      </div>

      {!esSuper && (
        <p className="text-xs text-slate-400 mt-8 leading-relaxed max-w-[60ch]">
          Si necesitas acceso a PersonaLab, pídeselo a un super admin. Los permisos por marca todavía no
          están seccionados: hoy el rol es global y se está trabajando en separarlo.
        </p>
      )}
    </div>
  )
}
