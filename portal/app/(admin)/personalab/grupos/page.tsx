import Link from 'next/link'
import { cargarGrupos } from '@/lib/personalab/gestion'
import { Titulo, Tabla, BotonPronto, Vacio } from '../ui'
import { TD, TARJETA, BTN_PRIMARIO } from '../tokens'

function fecha(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ETAPA "GESTIÓN CONECTADA A LA BASE REAL", 2026-09-24. Hasta aquí leía
// `dominio.ts`. Ver `lib/personalab/gestion.ts` para el porqué completo.
export default async function GruposPage() {
  const r = await cargarGrupos()

  if (r.estado === 'sin-acceso') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-ink">Sin permiso de equipo</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">
            Tu cuenta no tiene permiso de equipo sobre PersonaLab.
          </p>
          <Link href="/personalab" className={`${BTN_PRIMARIO} inline-block mt-5`}>Volver</Link>
        </div>
      </div>
    )
  }
  if (r.estado === 'fallo') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-ink">No se pudo cargar</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">{r.motivo}</p>
        </div>
      </div>
    )
  }

  const grupos = r.datos

  return (
    <>
      <Titulo
        sub="Cada grupo que adopta y realiza una experiencia con un moderador propio. Es la unidad de replicabilidad."
        accion={<BotonPronto>+ Nuevo grupo</BotonPronto>}
      >
        Grupos
      </Titulo>

      {grupos.length === 0 ? (
        <Vacio>Todavía no hay ningún grupo dado de alta.</Vacio>
      ) : (
        <Tabla cabeceras={['Grupo', 'Ciudad', 'Moderador', 'Realizados', 'Siguiente']}>
          {grupos.map(g => (
            <tr key={g.id} className="hover:bg-slate-50 transition-colors">
              <td className={`${TD} font-medium text-slate-900`}>{g.nombre}</td>
              <td className={`${TD} text-slate-500`}>{g.ciudad ?? '—'}</td>
              <td className={`${TD} text-slate-500`}>
                {g.moderadores.length === 0
                  ? <span className="text-amber-700">sin moderador</span>
                  : g.moderadores.map(m => m.nombre).join(', ')}
              </td>
              <td className={`${TD} tabular-nums`}>
                {g.realizados === 0 ? <span className="text-amber-700">nunca</span> : g.realizados}
              </td>
              <td className={TD}>
                {g.siguiente ? (
                  <Link
                    href={`/personalab/encuentros/${g.siguiente.id}`}
                    className="text-slate-900 hover:underline"
                  >
                    {g.siguiente.experienciaNombre}
                    {g.siguiente.fecha && <span className="text-slate-400"> · {fecha(g.siguiente.fecha)}</span>}
                  </Link>
                ) : (
                  <span className="text-slate-400">nada agendado</span>
                )}
              </td>
            </tr>
          ))}
        </Tabla>
      )}
    </>
  )
}
