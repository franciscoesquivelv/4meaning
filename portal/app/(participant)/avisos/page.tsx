import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function tipoStyle(tipo: string) {
  const map: Record<string, { bar: string; badge: string; label: string }> = {
    info:      { bar: 'border-l-blue-500',  badge: 'bg-blue-500/20 text-blue-300',   label: 'Info' },
    urgente:   { bar: 'border-l-red-500',   badge: 'bg-red-500/20 text-red-300',     label: 'Urgente' },
    logistica: { bar: 'border-l-[#C9A96E]', badge: 'bg-[#C9A96E]/20 text-[#C9A96E]', label: 'Logística' },
  }
  return map[tipo] ?? { bar: 'border-l-[#2A2A2A]', badge: 'bg-[#2A2A2A] text-[#A09A8F]', label: tipo }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })
}

export default async function AvisosParticipantPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: family } = await supabase
    .from('families')
    .select('event_id')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .limit(1)
    .maybeSingle()

  const announcements = family
    ? (await supabase
        .from('announcements')
        .select('id, titulo, cuerpo, tipo, created_at')
        .eq('event_id', family.event_id)
        .eq('published', true)
        .order('created_at', { ascending: false })
      ).data ?? []
    : []

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-bold text-[#F5F0E8] mb-1">Avisos</h1>
      <p className="text-sm text-[#A09A8F] mb-6">Comunicados del equipo de Trascendencia</p>

      {!family && (
        <div className="text-center py-16 text-[#6B7280] text-sm">
          Tu cuenta aún no está vinculada a un retiro.
        </div>
      )}

      {family && announcements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center mb-4 text-2xl text-[#A09A8F]">
            📢
          </div>
          <p className="text-[#A09A8F] text-sm">No hay avisos por el momento.</p>
          <p className="text-[#6B7280] text-xs mt-1">Revisa más tarde.</p>
        </div>
      )}

      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map(a => {
            const style = tipoStyle(a.tipo)
            return (
              <div
                key={a.id}
                className={`bg-[#181818] border-l-4 ${style.bar} border border-[#2A2A2A] rounded-xl p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                    {style.label}
                  </span>
                  <span className="text-xs text-[#6B7280]">{formatDate(a.created_at)}</span>
                </div>
                <p className="font-semibold text-[#F5F0E8] text-sm leading-snug">{a.titulo}</p>
                {a.cuerpo && (
                  <p className="mt-2 text-sm text-[#A09A8F] leading-relaxed whitespace-pre-wrap">{a.cuerpo}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
