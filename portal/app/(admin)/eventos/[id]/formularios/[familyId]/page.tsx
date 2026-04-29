import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

function Field({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, color: '#111', lineHeight: 1.6 }}>
        {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value)}
      </div>
    </div>
  )
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

interface Hijo {
  nombre?: string
  edad?: string | number
}

export default async function FormularioFamiliaPage({ params }: { params: { id: string; familyId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: evento } = await supabase
    .from('events')
    .select('id, nombre')
    .eq('id', params.id)
    .single()
  if (!evento) notFound()

  const { data: family } = await supabase
    .from('families')
    .select('id, nombre_familia, nombre1, nombre2')
    .eq('id', params.familyId)
    .single()
  if (!family) notFound()

  const { data: response } = await supabase
    .from('intake_responses')
    .select('*')
    .eq('family_id', params.familyId)
    .eq('event_id', params.id)
    .maybeSingle()

  if (!response) {
    return (
      <div style={{ padding: 32, maxWidth: 680 }}>
        <Link href={`/eventos/${params.id}/formularios`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← Formularios
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 12, marginBottom: 16 }}>{family.nombre_familia}</h1>
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 10, padding: 20, color: '#78350f', fontSize: 14 }}>
          Esta familia aún no ha enviado su formulario de intake.
        </div>
      </div>
    )
  }

  const hijos: Hijo[] = Array.isArray(response.hijos) ? (response.hijos as Hijo[]) : []

  return (
    <div style={{ padding: 32, maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <Link href={`/eventos/${params.id}/formularios`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← Formularios
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 12, marginBottom: 4 }}>{family.nombre_familia}</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
          {family.nombre1}{family.nombre2 ? ` & ${family.nombre2}` : ''} · Enviado el {formatDate(response.submitted_at)}
        </p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28 }}>
        <Field label="¿Cómo se conocieron?" value={response.como_se_conocieron} />
        <Field label="Historia de su relación" value={response.historia_pareja} />
        <Field label="Años juntos" value={response.anos_juntos} />
        <Field label="¿Tienen hijos?" value={response.tienen_hijos} />

        {response.tienen_hijos && hijos.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Hijos
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {hijos.map((hijo, i) => (
                <div key={i} style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 14, color: '#374151' }}>
                  {hijo.nombre ?? 'Sin nombre'} — {hijo.edad ? `${hijo.edad} años` : 'edad no especificada'}
                </div>
              ))}
            </div>
          </div>
        )}

        <Field label="Legado que quieren dejar" value={response.legado} />
        <Field label="Expectativas para el retiro" value={response.expectativas} />
        <Field label="Restricciones alimentarias" value={response.restricciones_alimentarias} />
        <Field label="Notas adicionales" value={response.notas_adicionales} />
      </div>
    </div>
  )
}
