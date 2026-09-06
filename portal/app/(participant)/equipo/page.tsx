import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HelpButton from '@/components/HelpButton'
import { familiaVisible } from '@/lib/participante/familia'

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

export default async function EquipoPage({
  searchParams,
}: {
  searchParams: { familia?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const fam = await familiaVisible(searchParams?.familia)

  const { data: family } = await supabase
    .from('families')
    .select('id, event_id')
    .eq('id', fam?.id ?? '00000000-0000-0000-0000-000000000000')
    .limit(1)
    .maybeSingle()

  let teamMembers: { id: string; nombre: string; rol: string; bio_publica: string }[] = []
  let fallo = false

  if (family?.event_id) {
    // SIN `foto_url`. Esta consulta la pedia y la columna no existe en la
    // base, asi que fallaba SIEMPRE, en todos los eventos, desde que se
    // escribio. Y el error se descartaba, asi que la pantalla caia en su
    // mensaje de "todavia no" y le prometia a la pareja que sus facilitadores
    // apareceran aqui pronto. No iban a aparecer nunca.
    //
    // No se agrega la columna: NINGUNA pantalla del equipo puede llenarla.
    // El admin lee y escribe `nombre, rol, bio_publica, notas_equipo, orden`
    // y no tiene manera de subir una foto. Una columna que nadie puede
    // llenar solo hace que el esquema prometa algo que el producto no tiene.
    // Si las fotos del equipo se quieren de verdad, es una pieza completa:
    // columna, subida en el admin, y almacenamiento. Queda dicho, no hecho.
    const { data, error } = await supabase
      .from('event_team')
      .select('id, nombre, rol, bio_publica')
      .eq('event_id', family.event_id)
      .not('bio_publica', 'is', null)
      .order('orden')
    fallo = !!error
    teamMembers = (data ?? []) as typeof teamMembers
  }

  return (
    <div className="px-5 pt-6 pb-10">
      <h1 className="text-xl font-bold text-ink mb-6">Equipo</h1>
      {!family && (
        <div className="bg-white border border-line rounded-xl p-5 text-gray-ui text-sm">
          Tu cuenta no tiene una familia asignada todavía.
        </div>
      )}
      {/* La promesa solo se hace cuando el sistema la puede cumplir. Si la
          consulta fallo, esta pantalla no sabe si hay equipo o no, y decir
          "estaran disponibles pronto" seria comprometer a 4 Meaning con algo
          que nadie verifico. */}
      {family && fallo && (
        <div className="bg-white border border-line rounded-xl p-6 text-center text-gray-ui text-sm leading-relaxed">
          No pudimos cargar el equipo del retiro en este momento. Vuelve a
          intentarlo en un rato.
        </div>
      )}
      {family && !fallo && !teamMembers.length && (
        <div className="bg-white border border-line rounded-xl p-6 text-center text-gray-ui text-sm leading-relaxed">
          Conocerás a los facilitadores del retiro unos días antes del evento. Sus presentaciones y experiencias estarán disponibles aquí pronto.
        </div>
      )}
      {teamMembers.length > 0 && (
        <div className="space-y-4">
          {teamMembers.map((member, index) => (
            <div key={member.id} className="bg-white border border-line rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-ink">{member.nombre}</div>
                  <div className="text-xs text-terra-ui font-medium mt-0.5 uppercase tracking-wider">{member.rol}</div>
                </div>
                {/* La inicial, y solo la inicial. Aqui habia una rama que
                    pintaba `member.foto_url` cuando existiera, y no existio
                    nunca: ni la columna en la base ni una pantalla del admin
                    que la pudiera llenar. Codigo que no corrio jamas. */}
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <div className={`w-full h-full flex items-center justify-center font-bold text-lg rounded-full ${avatarColor(member.nombre, index)}`}>
                    {member.nombre.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-ui leading-relaxed">{member.bio_publica}</p>
            </div>
          ))}
        </div>
      )}

      <HelpButton pageId="equipo" />
    </div>
  )
}
