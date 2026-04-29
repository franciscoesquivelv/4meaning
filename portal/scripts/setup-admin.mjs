/**
 * One-time script to create / promote the first admin user.
 * Run: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/setup-admin.mjs
 *
 * Or with a .env.local file in the portal directory:
 * Run from portal/: node -r dotenv/config scripts/setup-admin.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL     || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required')
  process.exit(1)
}

// ── Change these ──────────────────────────────────────────────
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'f.esquivelviteri@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Trascendencia2026@'
const ADMIN_FULLNAME = process.env.ADMIN_FULLNAME || 'Francisco Esquivel'
// ─────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log('🔍 Buscando usuario...')

  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) { console.error('Error:', listErr); process.exit(1) }

  let user = users.find(u => u.email === ADMIN_EMAIL)

  if (user) {
    console.log(`✅ Usuario encontrado: ${user.id}`)
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: ADMIN_PASSWORD, email_confirm: true,
      user_metadata: { full_name: ADMIN_FULLNAME },
    })
    if (error) { console.error('Error:', error); process.exit(1) }
    console.log('🔐 Contraseña actualizada')
  } else {
    console.log('👤 Creando usuario...')
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL, password: ADMIN_PASSWORD, email_confirm: true,
      user_metadata: { full_name: ADMIN_FULLNAME, role: 'super_admin' },
    })
    if (error) { console.error('Error:', error); process.exit(1) }
    user = created.user
    console.log(`✅ Usuario creado: ${user.id}`)
  }

  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: user.id, email: ADMIN_EMAIL, full_name: ADMIN_FULLNAME, role: 'super_admin',
  }, { onConflict: 'id' })

  if (profileErr) { console.error('Error en profile:', profileErr); process.exit(1) }

  console.log('⭐ Rol super_admin asignado')
  console.log(`✨ Listo → https://4meaning.vercel.app/login`)
}

main()
