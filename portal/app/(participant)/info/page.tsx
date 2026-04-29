import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function roleLabel(role: string) {
  const map: Record<string, string> = {
    staff: 'Staff',
    admin: 'Administrador',
    super_admin: 'Coordinador',
  }
  return map[role] ?? role
}

interface Profile {
  full_name: string | null
  email: string
  phone: string | null
  role: string
}

export default async function InfoPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: family } = await supabase
    .from('families')
    .select('id, event_id, habitacion')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .maybeSingle()

  let evento: {
    nombre: string
    ciudad: string | null
    pais: string | null
    ubicacion: string | null
    fecha_inicio: string | null
    fecha_fin: string | null
    info_logistica: string | null
    info_que_llevar: string | null
    info_vestimenta: string | null
    info_emergencia: string | null
  } | null = null

  let staff: Profile[] = []

  if (family?.event_id) {
    const { data: ev } = await supabase
      .from('events')
      .select(
        'nombre, ciudad, pais, ubicacion, fecha_inicio, fecha_fin, info_logistica, info_que_llevar, info_vestimenta, info_emergencia'
      )
      .eq('id', family.event_id)
      .single()
    evento = ev

    const { data: staffProfiles } = await supabase
      .from('profiles')
      .select('full_name, email, phone, role')
      .in('role', ['staff', 'admin', 'super_admin'])
    staff = (staffProfiles ?? []) as Profile[]
  }

  const hasInfo =
    evento?.info_logistica ||
    evento?.info_que_llevar ||
    evento?.info_vestimenta ||
    evento?.info_emergencia

  return (
    <div className="px-5 pt-6 pb-10 bg-[#0C0C0C] min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#F5F0E8]">Información</h1>
        {family?.habitacion && (
          <p className="text-xs text-[#C9A96E] mt-1 font-medium tracking-wide">
            Habitación {family.habitacion}
          </p>
        )}
      </div>

      {!family && (
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 text-[#A09A8F] text-sm">
          Tu cuenta no tiene una familia asignada todavía. Contacta al equipo de Trascendencia.
        </div>
      )}

      {evento && (
        <>
          {/* Event card */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 mb-4">
            <div className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-3">
              Evento
            </div>
            <h2 className="text-lg font-bold text-[#F5F0E8] mb-3">{evento.nombre}</h2>

            {evento.ubicacion && (
              <div className="mb-3">
                <div className="text-sm font-medium text-[#F5F0E8]">{evento.ubicacion}</div>
                {(evento.ciudad || evento.pais) && (
                  <div className="text-xs text-[#A09A8F] mt-0.5">
                    {[evento.ciudad, evento.pais].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-[#2A2A2A] pt-3 space-y-2">
              <div className="flex gap-4 text-sm">
                <span className="text-[#6B7280] w-20 flex-shrink-0">Llegada</span>
                <span className="text-[#F5F0E8] font-medium capitalize">
                  {formatDate(evento.fecha_inicio)}
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-[#6B7280] w-20 flex-shrink-0">Salida</span>
                <span className="text-[#F5F0E8] font-medium capitalize">
                  {formatDate(evento.fecha_fin)}
                </span>
              </div>
            </div>
          </div>

          {/* No info yet */}
          {!hasInfo && (
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 mb-4 text-[#A09A8F] text-sm text-center">
              La información del evento estará disponible próximamente.
            </div>
          )}

          {/* Logística */}
          {evento.info_logistica && (
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 mb-4">
              <div className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-3">
                Logística
              </div>
              <p className="text-sm text-[#F5F0E8] leading-relaxed whitespace-pre-wrap">
                {evento.info_logistica}
              </p>
            </div>
          )}

          {/* Qué llevar */}
          {evento.info_que_llevar && (
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 mb-4">
              <div className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-3">
                Qué llevar
              </div>
              <p className="text-sm text-[#F5F0E8] leading-relaxed whitespace-pre-wrap">
                {evento.info_que_llevar}
              </p>
            </div>
          )}

          {/* Vestimenta */}
          {evento.info_vestimenta && (
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 mb-4">
              <div className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-3">
                Código de vestimenta
              </div>
              <p className="text-sm text-[#F5F0E8] leading-relaxed whitespace-pre-wrap">
                {evento.info_vestimenta}
              </p>
            </div>
          )}

          {/* Emergencias */}
          {evento.info_emergencia && (
            <div className="bg-[#C9A96E]/5 border border-[#C9A96E]/20 rounded-xl p-5 mb-4">
              <div className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-3">
                Emergencias y contactos
              </div>
              <p className="text-sm text-[#F5F0E8] leading-relaxed whitespace-pre-wrap">
                {evento.info_emergencia}
              </p>
            </div>
          )}

          {/* Equipo Trascendencia */}
          {staff.length > 0 && (
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 mb-4">
              <div className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-4">
                Equipo Trascendencia
              </div>
              <div className="space-y-4">
                {staff.map((s, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-[#F5F0E8]">
                        {s.full_name ?? 'Sin nombre'}
                      </div>
                      <div className="text-xs text-[#A09A8F] mt-0.5">{roleLabel(s.role)}</div>
                    </div>
                    <div className="text-right">
                      {s.phone && (
                        <a
                          href={`tel:${s.phone}`}
                          className="text-sm text-[#C9A96E] block hover:opacity-80 transition-opacity"
                        >
                          {s.phone}
                        </a>
                      )}
                      <a
                        href={`mailto:${s.email}`}
                        className="text-xs text-[#6B7280] hover:text-[#A09A8F] transition-colors"
                      >
                        {s.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
