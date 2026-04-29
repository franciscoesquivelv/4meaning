// Root redirect — middleware handles auth routing,
// this page is only hit if middleware passes through.
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'participant'

  if (['super_admin', 'admin', 'staff'].includes(role)) {
    redirect('/dashboard')
  } else {
    redirect('/mi-retiro')
  }
}
