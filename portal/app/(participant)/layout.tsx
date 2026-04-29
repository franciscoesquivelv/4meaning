import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ParticipantNav from '@/components/participant/ParticipantNav'

export default async function ParticipantLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  // Find this user's family to get their event
  const { data: family } = await supabase
    .from('families')
    .select('id, event_id, nombre_familia, events(nombre, fecha_inicio, fecha_fin, ubicacion, ciudad)')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .maybeSingle()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar — mobile */}
      <header className="sticky top-0 z-40 bg-bg border-b border-border px-4 h-14 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold tracking-[0.28em] uppercase text-muted leading-none">
            Trascendencia
          </p>
          {family?.events && (
            <p className="text-[11px] font-semibold text-ink/80 mt-0.5 truncate max-w-[200px]">
              {(family.events as any).nombre}
            </p>
          )}
        </div>
        <span className="text-[10px] text-muted">
          {profile?.full_name?.split(' ')[0] ?? ''}
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 pb-28 max-w-xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom tab bar — mobile */}
      <ParticipantNav />
    </div>
  )
}
