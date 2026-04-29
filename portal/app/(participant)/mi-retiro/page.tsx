import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export default async function MiRetiroPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'bienvenido'

  const { data: family } = await supabase
    .from('families')
    .select('id, nombre_familia, event_id, events(id, nombre, ubicacion, fecha_inicio, fecha_fin, ciudad)')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .maybeSingle()

  const evento = family ? (family.events as unknown as {
    id: string
    nombre: string
    ubicacion: string | null
    fecha_inicio: string | null
    fecha_fin: string | null
    ciudad: string | null
  } | null) : null

  let pendingCount = 0
  let totalCount = 0
  let intakeSubmitted = false

  if (family) {
    const [{ data: agreements }, { data: intake }] = await Promise.all([
      supabase.from('agreements').select('id, status').eq('family_id', family.id),
      supabase.from('intake_responses').select('id').eq('family_id', family.id).maybeSingle(),
    ])
    totalCount = agreements?.length ?? 0
    pendingCount = agreements?.filter(a => !['signed', 'approved'].includes(a.status)).length ?? 0
    intakeSubmitted = !!intake
  }

  const allSigned = totalCount > 0 && pendingCount === 0
  const daysUntil = getDaysUntil(evento?.fecha_inicio ?? null)
  const daysUntilEnd = getDaysUntil(evento?.fecha_fin ?? null)
  const isHappening = daysUntil !== null && daysUntilEnd !== null && daysUntil <= 0 && daysUntilEnd >= 0

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Hola, {firstName}</h1>
        {family && (
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Familia {family.nombre_familia}</p>
        )}
      </div>

      {/* No family */}
      {!family && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 10, padding: 20, marginBottom: 24, fontSize: 14, color: '#78350f' }}>
          Tu cuenta aún no tiene una familia asignada. Contacta al equipo de Trascendencia.
        </div>
      )}

      {/* Countdown / Event status */}
      {evento && (
        <div style={{
          background: isHappening ? '#111' : '#fff',
          border: `1px solid ${isHappening ? '#111' : '#e5e7eb'}`,
          borderRadius: 14,
          padding: 20,
          marginBottom: 20,
        }}>
          {isHappening ? (
            <div style={{ color: '#fff' }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: 6 }}>
                Ahora mismo
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>¡Estás en el retiro!</div>
              <div style={{ fontSize: 14, opacity: 0.8 }}>{evento.nombre}</div>
            </div>
          ) : daysUntil !== null && daysUntil > 0 ? (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Cuenta regresiva
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{daysUntil}</span>
                <span style={{ fontSize: 16, color: '#6b7280', fontWeight: 500 }}>días</span>
              </div>
              <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{evento.nombre}</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Tu retiro</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{evento.nombre}</div>
              {evento.ubicacion && <div style={{ fontSize: 14, color: '#6b7280' }}>{evento.ubicacion}</div>}
            </div>
          )}
          {!isHappening && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f3f4f6', fontSize: 13, color: '#9ca3af' }}>
              {formatDate(evento.fecha_inicio)} – {formatDate(evento.fecha_fin)}
              {evento.ciudad && ` · ${evento.ciudad}`}
            </div>
          )}
        </div>
      )}

      {/* Action items */}
      {family && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {/* Intake form */}
          {!intakeSubmitted && (
            <Link
              href="/formulario"
              style={{
                background: '#fff',
                border: '2px solid #111',
                borderRadius: 12,
                padding: 18,
                textDecoration: 'none',
                color: '#111',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>Completa tu formulario</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>Cuéntanos su historia antes del retiro</div>
              </div>
              <span style={{ fontSize: 20 }}>→</span>
            </Link>
          )}

          {intakeSubmitted && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20, color: '#16a34a' }}>✓</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#166534' }}>Formulario enviado</div>
                <div style={{ fontSize: 13, color: '#4ade80' }}>Gracias por completarlo</div>
              </div>
            </div>
          )}

          {/* Agreements */}
          {totalCount > 0 && (
            <div style={{
              background: allSigned ? '#f0fdf4' : '#fff',
              border: `1px solid ${allSigned ? '#bbf7d0' : '#e5e7eb'}`,
              borderRadius: 12,
              padding: 18,
            }}>
              {allSigned ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20, color: '#16a34a' }}>✓</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#166534', fontSize: 14 }}>Acuerdos completados</div>
                    <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{totalCount}/{totalCount} firmados</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Acuerdos pendientes</div>
                    <div style={{ color: '#6b7280', fontSize: 13 }}>{totalCount - pendingCount} de {totalCount} firmados</div>
                  </div>
                  <Link
                    href="/acuerdos"
                    style={{ padding: '7px 14px', background: '#111', color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
                  >
                    Ver ({pendingCount})
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick links */}
      {family && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { href: '/programa', label: 'Programa', sub: 'Ver el itinerario', icon: '📅' },
            { href: '/documentos', label: 'Documentos', sub: 'Materiales del retiro', icon: '📄' },
            { href: '/info', label: 'Información', sub: 'Logística y contactos', icon: 'ℹ️' },
            { href: '/acuerdos', label: 'Acuerdos', sub: 'Documentos legales', icon: '✍️' },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: 16,
              textDecoration: 'none',
              color: '#111',
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{link.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{link.label}</div>
              <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{link.sub}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
