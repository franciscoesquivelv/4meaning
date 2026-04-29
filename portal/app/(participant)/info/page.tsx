import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

interface Profile {
  full_name: string | null
  email: string
  phone: string | null
  role: string
}

const queLlevar = [
  'Ropa cómoda para actividades vivenciales',
  'Ropa formal para la cena de gala',
  'Zapatos cómodos para caminar',
  'Medicamentos personales',
  'Artículos de tocador básicos',
  'Documento de identidad',
  'Actitud abierta y disposición para el encuentro',
]

export default async function InfoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: family } = await supabase
    .from('families')
    .select('id, event_id')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .maybeSingle()

  let evento = null
  let staff: Profile[] = []

  if (family) {
    const { data: ev } = await supabase
      .from('events')
      .select('nombre, ciudad, pais, ubicacion, fecha_inicio, fecha_fin')
      .eq('id', family.event_id)
      .single()
    evento = ev

    const { data: staffProfiles } = await supabase
      .from('profiles')
      .select('full_name, email, phone, role')
      .in('role', ['staff', 'admin', 'super_admin'])
    staff = (staffProfiles ?? []) as Profile[]
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-bold text-[#F5F0E8] mb-6">Información del retiro</h1>

      {!family && (
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 text-[#A09A8F] text-sm">
          Tu cuenta no tiene una familia asignada todavía. Contacta al equipo de Trascendencia.
        </div>
      )}

      {evento && (
        <>
          {/* Event card */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 mb-4">
            <div className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-3">Evento</div>
            <h2 className="text-lg font-bold text-[#F5F0E8] mb-3">{evento.nombre}</h2>

            {evento.ubicacion && (
              <div className="flex items-start gap-2 mb-3">
                <span className="text-sm mt-0.5 flex-shrink-0">📍</span>
                <div>
                  <div className="text-sm font-medium text-[#F5F0E8]">{evento.ubicacion}</div>
                  {(evento.ciudad || evento.pais) && (
                    <div className="text-xs text-[#A09A8F] mt-0.5">
                      {[evento.ciudad, evento.pais].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-[#2A2A2A] pt-3 space-y-2">
              <div className="flex gap-4 text-sm">
                <span className="text-[#6B7280] w-20 flex-shrink-0">Check-in</span>
                <span className="text-[#F5F0E8] font-medium capitalize">{formatDate(evento.fecha_inicio)}</span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-[#6B7280] w-20 flex-shrink-0">Check-out</span>
                <span className="text-[#F5F0E8] font-medium capitalize">{formatDate(evento.fecha_fin)}</span>
              </div>
            </div>
          </div>

          {/* Staff */}
          {staff.length > 0 && (
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 mb-4">
              <div className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-4">Equipo Trascendencia</div>
              <div className="space-y-4">
                {staff.map((s, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-[#F5F0E8]">{s.full_name ?? 'Sin nombre'}</div>
                      <div className="text-xs text-[#A09A8F] capitalize mt-0.5">{s.role}</div>
                    </div>
                    <div className="text-right">
                      {s.phone && (
                        <a href={`tel:${s.phone}`} className="text-sm text-[#C9A96E] block hover:opacity-80 transition-opacity">
                          {s.phone}
                        </a>
                      )}
                      <a href={`mailto:${s.email}`} className="text-xs text-[#6B7280] hover:text-[#A09A8F] transition-colors">
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

      {/* Qué llevar */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5">
        <div className="text-xs font-semibold text-[#C9A96E] uppercase tracking-widest mb-4">Qué llevar</div>
        <ul className="space-y-3">
          {queLlevar.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] flex-shrink-0 mt-1.5" />
              <span className="text-sm text-[#F5F0E8] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
