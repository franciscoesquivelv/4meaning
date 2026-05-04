import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { event_id?: string; modo?: 'equipo' | 'participantes' }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { event_id, modo = 'participantes' } = searchParams
  if (!event_id) {
    return <div style={{ padding: 32, color: '#666' }}>Falta parámetro: event_id requerido.</div>
  }

  const [{ data: evento }, { data: items }] = await Promise.all([
    supabase.from('events').select('nombre, ciudad, pais, fecha_inicio, fecha_fin, capitulo').eq('id', event_id).single(),
    supabase.from('itinerary_items')
      .select('dia, fecha, hora_inicio, hora_fin, titulo, descripcion, tipo, visibilidad, ubicacion, responsable, notas_staff')
      .eq('event_id', event_id)
      .order('dia').order('orden').order('hora_inicio'),
  ])

  if (!evento) {
    return <div style={{ padding: 32, color: '#666' }}>Evento no encontrado.</div>
  }

  const esEquipo = modo === 'equipo'

  // Filter: equipo ve todo, participantes solo ven participant/all
  const visibleItems = (items ?? []).filter(item =>
    esEquipo || ['participant', 'all'].includes(item.visibilidad)
  )

  // Group by día
  const byDia: Record<number, typeof visibleItems> = {}
  for (const item of visibleItems) {
    const d = item.dia ?? 1
    if (!byDia[d]) byDia[d] = []
    byDia[d].push(item)
  }
  const dias = Object.keys(byDia).map(Number).sort()

  const formatHora = (t: string | null) => {
    if (!t) return ''
    return t.slice(0, 5)
  }

  const formatFechaDia = (iso: string | null, dia: number) => {
    if (!iso) return `Día ${dia}`
    return new Date(iso).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const tipoColor: Record<string, string> = {
    actividad: '#1a1a1a',
    taller:    '#7c3aed',
    comida:    '#b45309',
    logistica: '#374151',
    libre:     '#16a34a',
    privado:   '#dc2626',
    traslado:  '#2563eb',
  }

  return (
    <>
      <style>{`
        body { font-family: Georgia, 'Times New Roman', serif; background: white; }
        .doc { max-width: 216mm; margin: 0 auto; padding: 16mm 18mm; }
        .header { text-align: center; margin-bottom: 10mm; border-bottom: 2px solid #C9A96E; padding-bottom: 6mm; }
        .header-brand { font-size: 8px; letter-spacing: 0.5em; text-transform: uppercase; color: #C9A96E; margin-bottom: 3mm; }
        .header-evento { font-size: 22px; color: #111; font-weight: normal; margin-bottom: 2mm; }
        .header-meta { font-size: 10px; color: #888; letter-spacing: 0.08em; }
        .header-modo { display: inline-block; margin-top: 3mm; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; padding: 2px 8px; border: 1px solid #C9A96E; color: #C9A96E; }
        .dia-header { margin: 8mm 0 3mm; }
        .dia-label { font-size: 9px; letter-spacing: 0.35em; text-transform: uppercase; color: #C9A96E; margin-bottom: 1mm; }
        .dia-fecha { font-size: 15px; color: #111; font-weight: normal; border-bottom: 1px solid #e5e0d8; padding-bottom: 2mm; }
        .item { display: flex; gap: 6mm; padding: 3.5mm 0; border-bottom: 1px solid #f0ece6; }
        .item-time { min-width: 22mm; text-align: right; }
        .item-hora { font-size: 11px; color: #888; font-family: 'Courier New', monospace; }
        .item-hora-fin { font-size: 9px; color: #bbb; font-family: 'Courier New', monospace; }
        .item-content { flex: 1; }
        .item-titulo { font-size: 12px; color: #1a1a1a; }
        .item-descripcion { font-size: 10px; color: #777; margin-top: 1mm; line-height: 1.4; }
        .item-meta { display: flex; gap: 4mm; margin-top: 1mm; flex-wrap: wrap; }
        .item-tag { font-size: 8.5px; color: #aaa; letter-spacing: 0.08em; }
        .item-notas { font-size: 9.5px; color: #666; background: #fafaf8; border-left: 2px solid #C9A96E; padding: 2mm 3mm; margin-top: 2mm; font-style: italic; }
        .no-items { font-size: 11px; color: #aaa; text-align: center; padding: 10mm; }
        .print-bar {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: white; border-top: 1px solid #e5e7eb;
          padding: 12px 24px; display: flex; align-items: center; justify-content: space-between;
          font-family: -apple-system, sans-serif; z-index: 100;
        }
        .print-btn { padding: 8px 20px; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; }
        .mode-toggle { display: flex; gap: 8px; }
        .mode-link { font-size: 12px; color: #4b5563; text-decoration: none; border: 1px solid #e5e7eb; padding: 6px 12px; border-radius: 6px; }
        .mode-link.active { background: #111; color: #fff; border-color: #111; }
        @media print {
          .print-bar { display: none !important; }
          .doc { padding: 12mm 14mm; }
        }
      `}</style>

      <div className="doc">
        <div className="header">
          <div className="header-brand">Trascendencia</div>
          <div className="header-evento">{evento.nombre}</div>
          <div className="header-meta">
            {[evento.capitulo, evento.ciudad, evento.pais].filter(Boolean).join('  ·  ')}
          </div>
          <div className="header-modo">
            {esEquipo ? 'Agenda del Equipo — Detallada' : 'Agenda para Participantes'}
          </div>
        </div>

        {dias.length === 0 ? (
          <div className="no-items">Sin actividades registradas en el itinerario.</div>
        ) : (
          dias.map(dia => {
            const diaItems = byDia[dia]
            const primeraFecha = diaItems.find(i => i.fecha)?.fecha ?? null
            return (
              <div key={dia}>
                <div className="dia-header">
                  <div className="dia-label">Día {dia}</div>
                  <div className="dia-fecha">{formatFechaDia(primeraFecha, dia)}</div>
                </div>
                {diaItems.map((item, idx) => (
                  <div key={idx} className="item">
                    <div className="item-time">
                      <div className="item-hora">{formatHora(item.hora_inicio)}</div>
                      {item.hora_fin && <div className="item-hora-fin">{formatHora(item.hora_fin)}</div>}
                    </div>
                    <div className="item-content">
                      <div className="item-titulo" style={{ color: tipoColor[item.tipo] ?? '#1a1a1a' }}>
                        {item.titulo}
                      </div>
                      {item.descripcion && !esEquipo && (
                        <div className="item-descripcion">{item.descripcion}</div>
                      )}
                      {esEquipo && (
                        <div className="item-meta">
                          {item.ubicacion && <span className="item-tag">📍 {item.ubicacion}</span>}
                          {item.responsable && <span className="item-tag">👤 {item.responsable}</span>}
                          {item.tipo !== 'actividad' && <span className="item-tag" style={{ color: tipoColor[item.tipo] ?? '#aaa', textTransform: 'uppercase' }}>{item.tipo}</span>}
                        </div>
                      )}
                      {esEquipo && item.notas_staff && (
                        <div className="item-notas">{item.notas_staff}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>

      <div className="print-bar no-print">
        <div className="mode-toggle">
          <a
            href={`/imprimir/agenda?event_id=${event_id}&modo=participantes`}
            className={`mode-link ${!esEquipo ? 'active' : ''}`}
          >
            Participantes
          </a>
          <a
            href={`/imprimir/agenda?event_id=${event_id}&modo=equipo`}
            className={`mode-link ${esEquipo ? 'active' : ''}`}
          >
            Equipo (detallada)
          </a>
        </div>
        <button className="print-btn" onClick={() => window.print()}>
          Imprimir / Guardar PDF
        </button>
      </div>
    </>
  )
}
