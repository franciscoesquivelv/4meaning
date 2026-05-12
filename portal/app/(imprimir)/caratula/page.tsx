import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CaratulaPage({
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
    supabase.from('events').select('nombre, ciudad, pais, fecha_inicio, fecha_fin').eq('id', event_id).single(),
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
    if (!iso) return null
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const fechaInicio = formatFecha(evento.fecha_inicio)
  const fechaFin = formatFecha(evento.fecha_fin)
  const fechaTexto = fechaInicio && fechaFin
    ? `${fechaInicio} – ${fechaFin}`
    : fechaInicio ?? ''

  const personas = [familia.nombre1, familia.nombre2].filter(Boolean) as string[]

  return (
    <>
      <style>{`
        .page {
          width: 216mm;
          height: 279mm;
          background: #0C0C0C;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20mm;
          position: relative;
          overflow: hidden;
        }
        /* Corner accents */
        .corner {
          position: absolute;
          width: 14mm;
          height: 14mm;
          border-color: #C9A96E;
          border-style: solid;
        }
        .corner-tl { top: 10mm; left: 10mm; border-width: 1px 0 0 1px; }
        .corner-tr { top: 10mm; right: 10mm; border-width: 1px 1px 0 0; }
        .corner-bl { bottom: 10mm; left: 10mm; border-width: 0 0 1px 1px; }
        .corner-br { bottom: 10mm; right: 10mm; border-width: 0 1px 1px 0; }

        .brand {
          font-family: Georgia, serif;
          font-size: 8px;
          letter-spacing: 0.55em;
          text-transform: uppercase;
          color: #C9A96E;
          text-align: center;
          margin-bottom: 10mm;
        }
        .gold-line {
          width: 40mm;
          height: 1px;
          background: #C9A96E;
          margin: 0 auto;
        }
        .apellido {
          font-family: Georgia, serif;
          font-size: 42px;
          font-weight: normal;
          color: #F5F0E8;
          text-align: center;
          letter-spacing: 0.06em;
          margin: 8mm 0 3mm;
          line-height: 1.1;
        }
        .personas {
          font-family: Georgia, serif;
          font-size: 12px;
          color: #8a8274;
          text-align: center;
          letter-spacing: 0.15em;
          margin-bottom: 10mm;
        }
        .evento-nombre {
          font-family: Georgia, serif;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #C9A96E;
          text-align: center;
          margin-top: 8mm;
          margin-bottom: 2mm;
        }
        .evento-detalle {
          font-family: Georgia, serif;
          font-size: 9px;
          color: #5a5449;
          text-align: center;
          letter-spacing: 0.08em;
        }

        .print-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: white;
          border-top: 1px solid #e5e7eb;
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
          body { background: #0C0C0C !important; }
          .page { width: 100vw; height: 100vh; }
        }
      `}</style>

      <div className="page">
        {/* Corner accents */}
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        <div className="brand">Trascendencia</div>
        <div className="gold-line" />

        <div className="apellido">{familia.nombre_familia}</div>

        {personas.length > 0 && (
          <div className="personas">
            {personas.join('  ·  ')}
          </div>
        )}

        <div className="gold-line" />

        <div className="evento-nombre">{evento.nombre}</div>
        <div className="evento-detalle">
          {[fechaTexto, evento.ciudad, evento.pais].filter(Boolean).join('  ·  ')}
        </div>
      </div>

      <div className="print-bar no-print">
        <div style={{ fontFamily: '-apple-system, sans-serif', fontSize: 13, color: '#6b7280' }}>
          Carátula del álbum — {familia.nombre_familia}
        </div>
        <button className="print-btn" onClick={() => window.print()}>
          Imprimir / Guardar PDF
        </button>
      </div>
    </>
  )
}
