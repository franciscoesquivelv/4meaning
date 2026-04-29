import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ParticipantNav from '@/components/ParticipantNav'

export default async function ParticipantLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Staff/admin can also access participant views (e.g. for impersonation / preview)
  if (!['participant', 'super_admin', 'admin', 'staff'].includes(profile.role)) {
    redirect('/login')
  }

  // Redirect non-participants who shouldn't be here back to admin dashboard
  if (['super_admin', 'admin', 'staff'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Try to get family / event for header
  const { data: family } = await supabase
    .from('families')
    .select('nombre_familia, event_id, events(nombre)')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .single()

  const firstName = profile.full_name?.split(' ')[0] ?? ''
  const eventName = family ? (family.events as unknown as { nombre: string } | null)?.nombre : null

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 20px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 40,
      }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Trascendencia</span>
        <div style={{ textAlign: 'right' }}>
          {eventName && <div style={{ fontSize: 12, color: '#6b7280' }}>{eventName}</div>}
          {firstName && <div style={{ fontSize: 13, fontWeight: 500 }}>{firstName}</div>}
        </div>
      </header>

      {/* Content with bottom padding for nav */}
      <main style={{ paddingBottom: 72 }}>
        {children}
      </main>

      <ParticipantNav />
    </div>
  )
}
