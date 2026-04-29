import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) {
    redirect('/mi-retiro')
  }

  return (
    <div className="flex min-h-screen">
      <div className="fixed top-0 left-0 h-full z-30">
        <AdminNav userEmail={user.email} />
      </div>
      <main className="ml-[240px] flex-1 bg-slate-50 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
