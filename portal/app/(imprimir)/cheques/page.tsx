import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ChequesPage({
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

  const formatFecha = (iso: string | null) => {
    if (!iso) return '________'
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const cheques = [1, 2, 3]

  return (
    <>
      <style>{`
        .sheet {
          width: 216mm;
          min-height: 279mm;
          background: white;
          padding: 14mm 16mm;
          display: flex;
          flex-direction: column;
          gap: 7mm;
        }
        .cheque {
          flex: 1;
          border: 1px solid var(--terra);
          border-radius: 4px;
          padding: 7mm 9mm;
          position: relative;
          background: white;
        }
        .cheque-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 5mm;
          border-bottom: 1px solid var(--line);
          padding-bottom: 4mm;
        }
        .cheque-brand {
          font-family: Georgia, serif;
        }
        .cheque-banco {
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--terra-ui);
        }
        .cheque-familia {
          font-size: 18px;
          color: var(--ink);
          font-weight: normal;
          margin-top: 1mm;
        }
        .cheque-num {
          font-size: 11px;
          color: var(--gray-ui);
          font-family: 'Courier New', monospace;
          text-align: right;
        }
        .cheque-fecha {
          font-size: 10px;
          color: var(--gray-ui);
          font-family: Georgia, serif;
          text-align: right;
          margin-top: 2mm;
        }
        .cheque-row {
          display: flex;
          align-items: flex-end;
          gap: 6mm;
          margin-bottom: 4mm;
        }
        .cheque-label {
          font-size: 9px;
          color: var(--gray-ui);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
          font-family: Georgia, serif;
        }
        .cheque-line {
          flex: 1;
          border-bottom: 1px solid var(--line);
          min-width: 0;
          height: 16px;
        }
        .cheque-monto {
          display: flex;
          align-items: flex-end;
          gap: 2mm;
        }
        .cheque-monto-symbol {
          font-size: 14px;
          color: var(--terra-ui);
          font-family: Georgia, serif;
          padding-bottom: 1px;
        }
        .cheque-monto-line {
          width: 35mm;
          border-bottom: 1px solid var(--line);
          height: 16px;
        }
        .cheque-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 4mm;
          padding-top: 3mm;
          border-top: 1px solid var(--line);
        }
        .cheque-firma-area {
          text-align: center;
        }
        .cheque-firma-line {
          width: 42mm;
          border-bottom: 1px solid var(--line);
          margin-bottom: 2px;
          height: 14px;
        }
        .cheque-firma-label {
          font-size: 8px;
          letter-spacing: 0.1em;
          color: var(--gray-ui);
          text-transform: uppercase;
          font-family: Georgia, serif;
        }
        .cheque-trascendencia {
          font-size: 7px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--terra-ui);
          font-family: Georgia, serif;
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
          .sheet { width: 100%; min-height: 100vh; padding: 14mm 16mm; }
        }
      `}</style>

      <div className="sheet">
        {cheques.map((n) => (
          <div key={n} className="cheque">
            <div className="cheque-header">
              <div className="cheque-brand">
                <div className="cheque-banco">Banco de la Familia</div>
                <div className="cheque-familia">{familia.nombre_familia}</div>
              </div>
              <div>
                <div className="cheque-num">N° {String(n).padStart(4, '0')}</div>
                <div className="cheque-fecha">{formatFecha(evento.fecha_inicio)}</div>
              </div>
            </div>

            <div className="cheque-row">
              <span className="cheque-label">Páguese a:</span>
              <div className="cheque-line" />
            </div>

            <div className="cheque-row" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6mm', flex: 1 }}>
                <span className="cheque-label">La cantidad de:</span>
                <div className="cheque-line" />
              </div>
              <div className="cheque-monto" style={{ marginLeft: '6mm', flexShrink: 0 }}>
                <span className="cheque-monto-symbol">$</span>
                <div className="cheque-monto-line" />
              </div>
            </div>

            <div className="cheque-row">
              <span className="cheque-label">Por concepto de:</span>
              <div className="cheque-line" />
            </div>

            <div className="cheque-footer">
              <div className="cheque-trascendencia">Trascendencia</div>
              <div style={{ display: 'flex', gap: '10mm' }}>
                <div className="cheque-firma-area">
                  <div className="cheque-firma-line" />
                  <div className="cheque-firma-label">Firma</div>
                </div>
                <div className="cheque-firma-area">
                  <div className="cheque-firma-line" />
                  <div className="cheque-firma-label">Fecha</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="print-bar no-print">
        <div style={{ fontFamily: '-apple-system, sans-serif', fontSize: 13, color: 'var(--gray-ui)' }}>
          Cheques · {familia.nombre_familia}
        </div>
        <button className="print-btn" onClick={() => window.print()}>
          Imprimir / Guardar PDF
        </button>
      </div>
    </>
  )
}
