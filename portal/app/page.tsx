import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // TODO: redirect based on role once roles are set up
  return (
    <div style={{ padding: 40 }}>
      <h1>Bienvenido</h1>
      <p>Sesión activa: {user.email}</p>
    </div>
  )
}
