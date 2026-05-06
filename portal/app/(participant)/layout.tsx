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

  if (!['participant', 'super_admin', 'admin', 'staff'].includes(profile.role)) {
    redirect('/login')
  }

  if (['super_admin', 'admin', 'staff'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const { data: family } = await supabase
    .from('families')
    .select('nombre_familia, event_id, events(nombre)')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .maybeSingle()

  return (
    <div className="bg-[#0C0C0C] min-h-screen text-[#F5F0E8]">
      <main className="max-w-lg mx-auto pb-24">
        {children}
      </main>
      <ParticipantNav />
    </div>
  )
}
