import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GafetesPage({
  searchParams,
}: {
  searchParams: { event_id?: string; family_id?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { event_id, family_id } = searchParams
  if (!event_id || !family_id) {
    return <div style={{ padding: 32, color: '#666' }}>Faltan parámetros: event_id y family_id requeridos.</div>
  }

  const [{ data: evento }, { data: familia }, { data: profile }] = await Promise.all([
    supabase.from('events').select('nombre, ciudad, fecha_inicio').eq('id', event_id).single(),
    supabase.from('families').select('nombre_familia, nombre1, nombre2, user_id1, user_id2').eq('id', family_id).eq('event_id', event_id).single(),
    supabase.from('profiles').select('role').eq('id', user.id).single(),
  ])

  if (!evento || !familia) {
    return <div style={{ padding: 32, color: '#666' }}>Datos no encontrados.</div>
  }

  const isStaff = ['super_admin', 'admin', 'staff'].includes(profile?.role ?? '')
  if (!isStaff && familia.user_id1 !== user.id && familia.user_id2 !== user.id) {
    return <div style={{ padding: 24, fontFamily: 'sans-serif' }}>Acceso no autorizado.</div>
  }

  const personas = [familia.nombre1, familia.nombre2].filter(Boolean) as string[]

  const formatFecha = (iso: string | null) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <>
      <style>{`
        .sheet {
          width: 216mm;
          min-height: 279mm;
          background: white;
          display: flex;
          flex-direction: column;
          padding: 12mm;
          gap: 8mm;
        }
        .badge {
          flex: 1;
          background: var(--dom-deep);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16mm 20mm;
          position: relative;
          overflow: hidden;
        }
        .badge::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--terra);
        }
        .badge::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: var(--terra);
        }
        .badge-brand {
          font-family: Georgia, serif;
          font-size: 9px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--terra-lo);
          margin-bottom: 8mm;
        }
        .badge-name {
          font-family: Georgia, serif;
          font-size: 38px;
          font-weight: normal;
          color: var(--paper);
          text-align: center;
          line-height: 1.1;
          margin-bottom: 4mm;
        }
        .badge-apellido {
          font-family: Georgia, serif;
          font-size: 14px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--terra-lo);
          text-align: center;
          margin-bottom: 6mm;
        }
        .badge-divider {
          width: 32px;
          height: 1px;
          background: var(--terra);
          margin-bottom: 6mm;
        }
        .badge-evento {
          font-family: Georgia, serif;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: color-mix(in srgb, var(--paper) 55%, transparent);
          text-align: center;
        }
        .print-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: white;
          border-top: 1px solid var(--line);
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: -apple-system, sans-serif;
          z-index: 100;
        }
        .print-btn {
          padding: 8px 20px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }
        @media print {
          .print-bar { display: none !important; }
          .sheet {
            width: 100%;
            min-height: 100vh;
            padding: 12mm;
          }
        }
      `}</style>

      <div className="sheet">
        {personas.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
            Sin nombres registrados para esta familia.
          </p>
        ) : (
          personas.map((nombre, i) => (
            <div key={i} className="badge">
              <div className="badge-brand">Trascendencia</div>
              <div className="badge-name">{nombre}</div>
              <div className="badge-apellido">{familia.nombre_familia}</div>
              <div className="badge-divider" />
              <div className="badge-evento">
                {evento.nombre}
                {evento.ciudad ? ` · ${evento.ciudad}` : ''}
                {evento.fecha_inicio ? ` · ${formatFecha(evento.fecha_inicio)}` : ''}
              </div>
            </div>
          ))
        )}

        {/* Si solo hay 1 persona, agregar espacio vacío para mantener layout */}
        {personas.length === 1 && (
          <div className="badge" style={{ background: 'var(--paper-2)', border: '1px dashed var(--line)' }}>
            <div style={{ color: '#ccc', fontSize: 11, fontFamily: 'Georgia, serif', letterSpacing: '0.1em' }}>
              Segunda persona sin nombre registrado
            </div>
          </div>
        )}
      </div>

      <div className="print-bar no-print">
        <div style={{ fontFamily: '-apple-system, sans-serif', fontSize: 13, color: 'var(--gray-ui)' }}>
          Gafetes · {familia.nombre_familia}
        </div>
        <button className="print-btn" onClick={() => window.print()}>
          Imprimir / Guardar PDF
        </button>
      </div>

      <script dangerouslySetInnerHTML={{ __html: '' }} />
    </>
  )
}
