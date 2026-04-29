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

  const queLlevar = [
    'Ropa cómoda para actividades vivenciales',
    'Ropa formal para la cena de gala',
    'Zapatos cómodos para caminar',
    'Medicamentos personales',
    'Artículos de tocador básicos',
    'Documento de identidad',
    'Actitud abierta y disposición para el encuentro',
  ]

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Información del retiro</h1>

      {!family && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 10, padding: 20, color: '#78350f', fontSize: 14 }}>
          Tu cuenta no tiene una familia asignada todavía. Contacta al equipo de Trascendencia.
        </div>
      )}

      {evento && (
        <>
          {/* Event card */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Evento
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 0 }}>{evento.nombre}</h2>
            {evento.ubicacion && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#374151' }}>{evento.ubicacion}</div>
                  {(evento.ciudad || evento.pais) && (
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                      {[evento.ciudad, evento.pais].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div style={{ height: 1, background: '#f3f4f6', margin: '12px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 10, fontSize: 14 }}>
                <span style={{ color: '#9ca3af', minWidth: 80 }}>Check-in</span>
                <span style={{ color: '#374151', fontWeight: 500 }}>{formatDate(evento.fecha_inicio)}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 14 }}>
                <span style={{ color: '#9ca3af', minWidth: 80 }}>Check-out</span>
                <span style={{ color: '#374151', fontWeight: 500 }}>{formatDate(evento.fecha_fin)}</span>
              </div>
            </div>
          </div>

          {/* Staff */}
          {staff.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Equipo Trascendencia
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {staff.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{s.full_name ?? 'Sin nombre'}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize', marginTop: 2 }}>{s.role}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {s.phone && (
                        <a href={`tel:${s.phone}`} style={{ fontSize: 13, color: '#374151', textDecoration: 'none', display: 'block' }}>
                          {s.phone}
                        </a>
                      )}
                      <a href={`mailto:${s.email}`} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>
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
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Qué llevar
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {queLlevar.map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingBottom: i < queLlevar.length - 1 ? 10 : 0, marginBottom: i < queLlevar.length - 1 ? 0 : 0 }}>
              <span style={{ color: '#9ca3af', marginTop: 1, flexShrink: 0 }}>•</span>
              <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
