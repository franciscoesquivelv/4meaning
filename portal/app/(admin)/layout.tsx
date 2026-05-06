import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminTopNav from '@/components/AdminTopNav'

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
    <>
      <AdminTopNav userEmail={user.email ?? ''} />
      <main className="pt-14 bg-slate-50 min-h-screen overflow-y-auto">
        {children}
      </main>
    </>
  )
}
