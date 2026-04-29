import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    draft:   { bg: '#f3f4f6', color: '#374151' },
    sent:    { bg: '#fef9c3', color: '#854d0e' },
    viewed:  { bg: '#e0f2fe', color: '#075985' },
    signed:  { bg: '#dcfce7', color: '#166534' },
    approved:{ bg: '#dcfce7', color: '#166534' },
    rejected:{ bg: '#fee2e2', color: '#991b1b' },
  }
  const s = colors[status] ?? { bg: '#f3f4f6', color: '#374151' }
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
    }}>
      {status}
    </span>
  )
}

export default async function AcuerdosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: family } = await supabase
    .from('families')
    .select('id, nombre_familia')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .maybeSingle()

  if (!family) {
    return (
      <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Acuerdos</h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>No tienes una familia asignada todavía.</p>
      </div>
    )
  }

  const { data: agreements } = await supabase
    .from('agreements')
    .select('id, nombre, type, status, signed_at')
    .eq('family_id', family.id)
    .order('created_at')

  const pending = agreements?.filter(a => !['signed', 'approved'].includes(a.status)) ?? []
  const completed = agreements?.filter(a => ['signed', 'approved'].includes(a.status)) ?? []
  const total = agreements?.length ?? 0
  const doneCount = completed.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Acuerdos</h1>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Familia {family.nombre_familia}</p>

      {/* Progress bar */}
      {total > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: '#374151', fontWeight: 500 }}>Progreso</span>
            <span style={{ color: '#6b7280' }}>{doneCount}/{total} completados</span>
          </div>
          <div style={{ background: '#e5e7eb', borderRadius: 8, height: 8, overflow: 'hidden' }}>
            <div style={{
              width: `${pct}%`,
              height: '100%',
              background: pct === 100 ? '#16a34a' : '#111',
              borderRadius: 8,
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: '#9ca3af' }}>{pct}%</div>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Por completar ({pending.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pending.map(ag => (
              <Link
                key={ag.id}
                href={`/acuerdos/${ag.id}`}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: '14px 16px',
                  textDecoration: 'none',
                  color: '#111',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{ag.nombre}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{ag.type}</div>
                </div>
                <StatusBadge status={ag.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Completados ({completed.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {completed.map(ag => (
              <Link
                key={ag.id}
                href={`/acuerdos/${ag.id}`}
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: '14px 16px',
                  textDecoration: 'none',
                  color: '#6b7280',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: '#374151' }}>{ag.nombre}</div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>{ag.type}</div>
                </div>
                <StatusBadge status={ag.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {total === 0 && (
        <p style={{ color: '#9ca3af', fontSize: 14 }}>No tienes acuerdos asignados.</p>
      )}
    </div>
  )
}
