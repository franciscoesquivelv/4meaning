/**
 * One-time script to create / promote the first admin user.
 * Run: node scripts/setup-admin.mjs
 */

import { createClient } from '@supabase/supabase-js'

// ── Config ───────────────────────────────────────────────────
const SUPABASE_URL      = 'https://kebafesmkrvvfvmbhain.supabase.co'
const SERVICE_ROLE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlYmFmZXNta3J2dmZ2bWJoYWluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ2NjI3NCwiZXhwIjoyMDkzMDQyMjc0fQ.wPTvXcPEoSjnB_pQF8rFUyBD18HZSIxmCeBAw7r6XPM'

// ── Change these ──────────────────────────────────────────────
const ADMIN_EMAIL     = 'f.esquivelviteri@gmail.com'      // ← your email
const ADMIN_PASSWORD  = 'Trascendencia2026@'              // ← change after first login
const ADMIN_FULLNAME  = 'Francisco Esquivel'              // ← your name
// ─────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log('🔍 Buscando usuario...')

  // List users and find by email
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) { console.error('Error listando usuarios:', listErr); process.exit(1) }

  let user = users.find(u => u.email === ADMIN_EMAIL)

  if (user) {
    console.log(`✅ Usuario encontrado: ${user.id}`)

    // Update password + confirm email
    const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
      password:      ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_FULLNAME },
    })
    if (updateErr) { console.error('Error actualizando usuario:', updateErr); process.exit(1) }
    console.log('🔐 Contraseña actualizada')

  } else {
    console.log('👤 Usuario no existe, creando...')

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email:         ADMIN_EMAIL,
      password:      ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_FULLNAME, role: 'super_admin' },
    })
    if (createErr) { console.error('Error creando usuario:', createErr); process.exit(1) }
    user = created.user
    console.log(`✅ Usuario creado: ${user.id}`)
  }

  // Upsert profile with super_admin role
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      id:        user.id,
      email:     ADMIN_EMAIL,
      full_name: ADMIN_FULLNAME,
      role:      'super_admin',
    }, { onConflict: 'id' })

  if (profileErr) { console.error('Error en profile:', profileErr); process.exit(1) }
  console.log('⭐ Rol super_admin asignado')
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✨ Listo. Entra con:`)
  console.log(`   Email:      ${ADMIN_EMAIL}`)
  console.log(`   Contraseña: ${ADMIN_PASSWORD}`)
  console.log(`   URL:        https://4meaning.vercel.app/login`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
