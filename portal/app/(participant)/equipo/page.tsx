import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HelpButton from '@/components/HelpButton'

const AVATAR_COLORS = [
  'bg-violet-900/60 text-violet-300',
  'bg-amber-900/60 text-amber-300',
  'bg-emerald-900/60 text-emerald-300',
  'bg-sky-900/60 text-sky-300',
  'bg-rose-900/60 text-rose-300',
]

function avatarColor(name: string, index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

export default async function EquipoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: family } = await supabase
    .from('families')
    .select('id, event_id')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .maybeSingle()

  let teamMembers: { id: string; nombre: string; rol: string; bio_publica: string; foto_url: string | null }[] = []

  if (family?.event_id) {
    const { data } = await supabase
      .from('event_team')
      .select('id, nombre, rol, bio_publica, foto_url')
      .eq('event_id', family.event_id)
      .not('bio_publica', 'is', null)
      .order('orden')
    teamMembers = (data ?? []) as typeof teamMembers
  }

  return (
    <div className="px-5 pt-6 pb-10">
      <h1 className="text-xl font-bold text-[#F5F0E8] mb-6">Equipo</h1>
      {!family && (
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 text-[#A09A8F] text-sm">
          Tu cuenta no tiene una familia asignada todavía.
        </div>
      )}
      {family && !teamMembers.length && (
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-6 text-center text-[#A09A8F] text-sm leading-relaxed">
          Conocerás a los facilitadores del retiro unos días antes del evento. Sus presentaciones y experiencias estarán disponibles aquí pronto.
        </div>
      )}
      {teamMembers.length > 0 && (
        <div className="space-y-4">
          {teamMembers.map((member, index) => (
            <div key={member.id} className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-[#F5F0E8]">{member.nombre}</div>
                  <div className="text-xs text-[#C9A96E] font-medium mt-0.5 uppercase tracking-wider">{member.rol}</div>
                </div>
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {member.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.foto_url}
                      alt={member.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center font-bold text-lg rounded-full ${avatarColor(member.nombre, index)}`}>
                      {member.nombre.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-[#A09A8F] leading-relaxed">{member.bio_publica}</p>
            </div>
          ))}
        </div>
      )}

      <HelpButton pageId="equipo" />
    </div>
  )
}
