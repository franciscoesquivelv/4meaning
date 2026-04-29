import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
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

  // Get family (gracefully handle no family)
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

  // Get agreements if family exists
  let pendingCount = 0
  let totalCount = 0
  if (family) {
    const { data: agreements } = await supabase
      .from('agreements')
      .select('id, status')
      .eq('family_id', family.id)

    totalCount = agreements?.length ?? 0
    pendingCount = agreements?.filter(a => !['signed', 'approved'].includes(a.status)).length ?? 0
  }

  const allSigned = totalCount > 0 && pendingCount === 0

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Hola, {firstName}</h1>
        {family && (
          <p style={{ color: '#6b7280', fontSize: 15 }}>Familia {family.nombre_familia}</p>
        )}
      </div>

      {/* No family assigned */}
      {!family && (
        <div style={{
          background: '#fef9c3',
          border: '1px solid #fde68a',
          borderRadius: 10,
          padding: 20,
          marginBottom: 24,
          fontSize: 14,
          color: '#78350f',
        }}>
          Tu cuenta aún no tiene una familia asignada. Contacta al equipo de Trascendencia.
        </div>
      )}

      {/* Event Card */}
      {evento && (
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Tu retiro
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{evento.nombre}</div>
          {evento.ubicacion && <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>{evento.ubicacion}</div>}
          {evento.ciudad && <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>{evento.ciudad}</div>}
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            {formatDate(evento.fecha_inicio)} – {formatDate(evento.fecha_fin)}
          </div>
        </div>
      )}

      {/* Agreements status */}
      {family && totalCount > 0 && (
        <div style={{
          background: allSigned ? '#f0fdf4' : '#fff',
          border: `1px solid ${allSigned ? '#bbf7d0' : '#e5e7eb'}`,
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}>
          {allSigned ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 20 }}>✓</div>
              <div>
                <div style={{ fontWeight: 600, color: '#166534', fontSize: 14 }}>Acuerdos completados</div>
                <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
                  Has firmado todos tus acuerdos ({totalCount}/{totalCount})
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Acuerdos pendientes</span>
                <span style={{
                  background: '#fef9c3',
                  color: '#854d0e',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
                </span>
              </div>
              <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 12 }}>
                {totalCount - pendingCount} de {totalCount} acuerdos firmados.
              </p>
              <Link
                href="/acuerdos"
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  background: '#111',
                  color: '#fff',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Ver acuerdos
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      {family && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Link href="/itinerario" style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: '16px',
            textDecoration: 'none',
            color: '#111',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>📅</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Itinerario</div>
            <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>Ver el programa</div>
          </Link>
          <Link href="/documentos" style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: '16px',
            textDecoration: 'none',
            color: '#111',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>📄</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Documentos</div>
            <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>Materiales del retiro</div>
          </Link>
        </div>
      )}
    </div>
  )
}
