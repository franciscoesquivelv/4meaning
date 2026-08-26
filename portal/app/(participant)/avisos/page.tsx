import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { familiaVisible } from '@/lib/participante/familia'

function tipoStyle(tipo: string) {
  const map: Record<string, { bar: string; badge: string; label: string }> = {
    info:      { bar: 'border-l-blue-500',  badge: 'bg-blue-500/20 text-blue-300',   label: 'Info' },
    urgente:   { bar: 'border-l-red-500',   badge: 'bg-red-500/20 text-red-300',     label: 'Urgente' },
    logistica: { bar: 'border-l-terra', badge: 'bg-terra/10 text-terra-ui', label: 'Logística' },
  }
  return map[tipo] ?? { bar: 'border-l-line', badge: 'bg-paper-2 text-gray-ui', label: tipo }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })
}

export default async function AvisosParticipantPage({
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
    .select('event_id')
    .eq('id', fam?.id ?? '00000000-0000-0000-0000-000000000000')
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
      <h1 className="text-xl font-bold text-ink mb-1">Avisos</h1>
      <p className="text-sm text-gray-ui mb-6">Comunicados del equipo de Trascendencia</p>

      {!family && (
        <div className="text-center py-16 text-gray-ui text-sm">
          Tu cuenta aún no está vinculada a un retiro.
        </div>
      )}

      {family && announcements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-white border border-line flex items-center justify-center mb-4 text-2xl text-gray-ui">
            📢
          </div>
          <p className="text-gray-ui text-sm leading-relaxed max-w-xs">
            Aquí recibirás comunicados importantes del equipo Trascendencia antes y durante el retiro. Activa las notificaciones para no perderte nada.
          </p>
        </div>
      )}

      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map(a => {
            const style = tipoStyle(a.tipo)
            return (
              <div
                key={a.id}
                className={`bg-white border-l-4 ${style.bar} border border-line rounded-xl p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                    {style.label}
                  </span>
                  <span className="text-xs text-gray-ui">{formatDate(a.created_at)}</span>
                </div>
                <p className="font-semibold text-ink text-sm leading-snug">{a.titulo}</p>
                {a.cuerpo && (
                  <p className="mt-2 text-sm text-gray-ui leading-relaxed whitespace-pre-wrap">{a.cuerpo}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
