import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { fmtDateShort } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Documentos' }

const TIPO_LABELS: Record<string, string> = {
  itinerario:       'Itinerario',
  material_familia: 'Material de tu retiro',
  storybook:        'Storybook',
  info_preliminar:  'Información',
  custom:           'Documento',
}

export default async function DocumentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: family } = await supabase
    .from('families')
    .select('id, event_id')
    .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
    .maybeSingle()

  const { data: documents } = await supabase
    .from('documents')
    .select('id, tipo, nombre, pdf_url, created_at')
    .or(`event_id.eq.${family?.event_id ?? ''},family_id.eq.${family?.id ?? ''}`)
    .in('visibilidad', ['participant', 'all'])
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink">Documentos</h1>
        <p className="text-[11px] text-muted mt-1">Material de tu retiro.</p>
      </div>

      {documents?.length === 0 && (
        <Card>
          <p className="text-[12px] text-muted text-center py-10">
            Aún no hay documentos disponibles.
          </p>
        </Card>
      )}

      <div className="space-y-2">
        {documents?.map(doc => (
          <a
            key={doc.id}
            href={doc.pdf_url ?? '#'}
            target={doc.pdf_url ? '_blank' : undefined}
            rel="noopener noreferrer"
            className={doc.pdf_url ? '' : 'pointer-events-none'}
          >
            <Card className={`flex items-center justify-between ${!doc.pdf_url ? 'opacity-50' : ''}`}>
              <div>
                <p className="text-[12px] font-semibold text-ink">{doc.nombre}</p>
                <p className="text-[10px] text-muted mt-0.5">
                  {TIPO_LABELS[doc.tipo] ?? doc.tipo} · {fmtDateShort(doc.created_at.split('T')[0])}
                </p>
              </div>
              {doc.pdf_url ? (
                <span className="text-[10px] text-muted">↓ PDF</span>
              ) : (
                <span className="text-[9px] text-muted uppercase tracking-wider">Próximamente</span>
              )}
            </Card>
          </a>
        ))}
      </div>
    </div>
  )
}
