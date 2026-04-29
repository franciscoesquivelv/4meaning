'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const next     = (formData.get('next') as string) || '/'

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: 'Correo o contraseña incorrectos.' }
  }

  const user = data.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'participant'

  if (next !== '/') {
    redirect(next)
  }

  if (['super_admin', 'admin', 'staff'].includes(role)) {
    redirect('/dashboard')
  }

  redirect('/mi-retiro')
}
