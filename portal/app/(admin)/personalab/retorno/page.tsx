import Link from 'next/link'
import { cargarRetorno } from '@/lib/personalab/gestion'
import { Titulo, Tabla, Explicativo, Vacio, Etiqueta, Panel } from '../ui'
import { TD, TARJETA, BTN_PRIMARIO } from '../tokens'

function fecha(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ETAPA "GESTIÓN CONECTADA A LA BASE REAL", 2026-09-24. Hasta aquí leía
// `dominio.ts`: "mes de retorno" vivía como un campo inventado sobre el
// encuentro mismo. La base real no tiene eso -- tiene `returns`, una fila
// por mes con `occurred_at` cuando de verdad ocurrió. "Mes de retorno" de
// un encuentro es el mes más alto con un toque REAL registrado. Hoy
// `returns` está vacía en toda la base, así que esta pantalla sale
// honesta: nada en curso, no un número inventado. Ver
// `lib/personalab/gestion.ts`.
export default async function RetornoPage() {
  const r = await cargarRetorno()

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

  const enCurso = r.datos
  const personas = enCurso.reduce((s, c) => s + c.personasEnElGrupo, 0)

  return (
    <>
      <Titulo sub="Lo que sostiene después del encuentro. Es donde el software es indispensable y no cómodo, y donde hoy PersonaLab no tiene nada construido.">
        Retorno
      </Titulo>

      <Explicativo titulo="Reglas de forma que este módulo no puede romper">
        Un solo puntero al mes, nunca una racha, nunca un recordatorio de deuda. Lo escrito a mano no se
        sube ni se transcribe. Lo que se entrega se recibe, no se descarga. Y no hay pantalla de
        estadísticas, ni de racha, ni de compartir: esas tres no se construyen.
      </Explicativo>

      <Etiqueta>Acompañamientos en curso · {personas} personas</Etiqueta>
      {enCurso.length === 0 ? (
        <Vacio>Nada en retorno ahora mismo.</Vacio>
      ) : (
        <Tabla cabeceras={['Experiencia', 'Grupo', 'Se realizó', 'Personas', 'Mes']}>
          {enCurso.map(c => (
            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
              <td className={TD}>
                <Link
                  href={`/personalab/encuentros/${c.id}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {c.experienciaNombre}
                </Link>
              </td>
              <td className={`${TD} text-slate-500`}>{c.grupoNombre}</td>
              <td className={`${TD} whitespace-nowrap`}>{c.fecha ? fecha(c.fecha) : '—'}</td>
              <td className={`${TD} tabular-nums`}>{c.personasEnElGrupo}</td>
              <td className={`${TD} tabular-nums`}>{c.mesDeRetorno ?? 0} de 6</td>
            </tr>
          ))}
        </Tabla>
      )}

      <div className="mt-8">
        <Etiqueta>Lo que falta construir</Etiqueta>
        <Panel>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Este módulo todavía no tiene ninguna pantalla propia para registrar un toque mensual: la
            tabla `returns` existe y está lista, pero nada del portal escribe en ella todavía.
          </p>
          <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
            <li>El gesto mínimo: capturar la frase de cada quien, en sus palabras.</li>
            <li>Capa mensual: un puntero al mes, con techo de frecuencia como regla del sistema.</li>
            <li>Cierre a seis meses: ver la raíz completa. El testimonio lo entrega una persona, no el sistema.</li>
          </ul>
        </Panel>
      </div>
    </>
  )
}
