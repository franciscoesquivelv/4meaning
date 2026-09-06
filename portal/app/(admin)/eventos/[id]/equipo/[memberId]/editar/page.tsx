import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import EditMemberForm from './EditMemberForm'

export default async function EditarMiembroPage({
  params,
}: {
  params: { id: string; memberId: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: miembro } = await supabase
    .from('event_team')
    .select('id, nombre, rol, bio_publica, notas_equipo, orden')
    .eq('id', params.memberId)
    .eq('event_id', params.id)
    .single()
  if (!miembro) notFound()

  // El fondo de pagina lo pone el chasis, en `app/(admin)/layout.tsx`. Esta
  // era la UNICA de las 90 pantallas de (admin) que declaraba el suyo propio,
  // asi que al pasar el suelo a la superficie de marca se quedaba como un
  // parche gris azulado de pantalla completa en medio de un portal en papel
  // calido. Se quita la clase, no se sustituye: el suelo se decide en un solo
  // sitio. Lo de adentro no se toco.
  return (
    <div className="p-8 max-w-2xl min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/eventos" className="hover:text-slate-700 transition-colors">
          Eventos
        </Link>
        <span>/</span>
        <Link href={`/eventos/${params.id}`} className="hover:text-slate-700 transition-colors">
          {evento.nombre}
        </Link>
        <span>/</span>
        <Link
          href={`/eventos/${params.id}/equipo`}
          className="hover:text-slate-700 transition-colors"
        >
          Equipo
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Editar miembro</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-900 mb-8">Editar miembro del equipo</h1>

      <EditMemberForm
        eventId={params.id}
        memberId={params.memberId}
        initial={{
          nombre: miembro.nombre,
          rol: miembro.rol,
          bio_publica: miembro.bio_publica,
          notas_equipo: miembro.notas_equipo,
          orden: miembro.orden,
        }}
      />
    </div>
  )
}
