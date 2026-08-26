import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import PushSubscribeButton from '@/components/PushSubscribeButton'
import HelpButton from '@/components/HelpButton'
import MiRetiro from '@/components/participante/MiRetiro'
import { cargarMiRetiro } from '@/lib/participante/mi-retiro'

const FirstTimeWelcome = dynamic(() => import('@/components/FirstTimeWelcome'), { ssr: false })

export default async function MiRetiroPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const datos = await cargarMiRetiro(supabase, { userId: user.id })
  const nombre = profile?.full_name?.split(' ')[0] ?? null

  return (
    <div>
      <FirstTimeWelcome />

      {datos.familia?.event_id && (
        <div className="fixed top-4 right-4 z-40">
          <PushSubscribeButton eventId={datos.familia.event_id} />
        </div>
      )}

      {/* Todavía sin familia vinculada. No es un error de nadie: la
          coordinadora la vincula dos a cuatro semanas antes. */}
      {!datos.familia ? (
        <div className="flex flex-col items-center justify-center text-center py-24 px-8 min-h-screen">
          <span className="w-2 h-2 rounded-full bg-terra mb-8" />
          <p className="text-[22px] font-extralight tracking-tight text-ink mb-3">
            {nombre ? `Tu cuenta está lista, ${nombre}` : 'Tu cuenta está lista'}
          </p>
          <p className="text-[14px] text-gray leading-relaxed max-w-xs mb-8">
            Tu coordinadora todavía no la ha vinculado al retiro. Suele hacerse dos a cuatro semanas
            antes. Si crees que es un error, escríbele directamente.
          </p>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="px-5 py-3 min-h-[44px] text-[14px] text-gray border border-line rounded-full hover:border-terra hover:text-ink transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      ) : (
        <MiRetiro datos={datos} />
      )}

      <HelpButton pageId="mi-retiro" />
    </div>
  )
}
