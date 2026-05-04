import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import ParticipantNav from '@/components/ParticipantNav'
import PushSubscribeButton from '@/components/PushSubscribeButton'

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

  const firstName = profile.full_name?.split(' ')[0] ?? ''
  const eventName = family ? (family.events as unknown as { nombre: string } | null)?.nombre : null

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#F5F0E8]">
      {/* Header */}
      <header className="sticky top-0 bg-[#111111] border-b border-[#2A2A2A] h-14 flex items-center justify-between px-5 z-40">
        <Image src="/logo.png" alt="Trascendencia" width={130} height={16} className="h-4 w-auto object-contain" priority />
        <div className="flex items-center gap-3">
          <PushSubscribeButton eventId={family?.event_id ?? undefined} />
          <div className="text-right">
            {eventName && <div className="text-xs text-[#A09A8F]">{eventName}</div>}
            {firstName && <div className="text-sm font-medium text-[#F5F0E8]">{firstName}</div>}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pb-20 max-w-lg mx-auto">
        {children}
      </main>

      <ParticipantNav />
    </div>
  )
}
