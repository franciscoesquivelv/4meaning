import Link from 'next/link'
import { cargarModeradores } from '@/lib/personalab/gestion'
import { Titulo, Tabla, Explicativo, BotonPronto, Vacio } from '../ui'
import { TD, TARJETA, BTN_PRIMARIO } from '../tokens'

// ETAPA "GESTIÓN CONECTADA A LA BASE REAL", 2026-09-24. Hasta aquí leía
// `dominio.ts`. Ver `lib/personalab/gestion.ts` para el porqué completo.
//
// `chapter_moderators` es una tabla muchos-a-muchos de verdad: un
// moderador puede estar en más de un grupo. El mock anterior asumía uno
// solo (`Moderador.grupoId`); aquí se listan todos.
export default async function ModeradoresPage() {
  const r = await cargarModeradores()

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

  const moderadores = r.datos

  return (
    <>
      <Titulo
        sub="Quiénes tienen acceso y en qué están formados. El acceso a una experiencia se le otorga al moderador, no al grupo."
        accion={<BotonPronto>+ Dar acceso</BotonPronto>}
      >
        Moderadores
      </Titulo>

      <Explicativo titulo="La formación no se sustituye con video">
        Un moderador sin formación en una experiencia no puede realizarla, aunque su grupo tenga
        licencia. La formación es presencial y no tiene versión grabada.
      </Explicativo>

      {moderadores.length === 0 ? (
        <Vacio>Todavía no hay ningún moderador dado de alta.</Vacio>
      ) : (
        <Tabla cabeceras={['Moderador', 'Grupo', 'Formado en', 'Encuentros', 'Desde']}>
          {moderadores.map(m => (
            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
              <td className={TD}>
                <div className="font-medium text-slate-900">{m.nombre}</div>
                <div className="text-xs text-slate-500 mt-0.5">{m.email}</div>
              </td>
              <td className={`${TD} text-slate-500`}>
                {m.grupos.length === 0 ? '—' : m.grupos.map(g => g.nombre).join(', ')}
              </td>
              <td className={TD}>
                {m.formadoEn.length === 0 ? (
                  <span className="text-xs text-amber-700">Sin formación todavía</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {m.formadoEn.map(e => (
                      <Link
                        key={e.experienciaId}
                        href={`/personalab/experiencias/${e.experienciaSlug}`}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors whitespace-nowrap"
                      >
                        {e.experienciaNombre}
                      </Link>
                    ))}
                  </div>
                )}
              </td>
              <td className={`${TD} tabular-nums`}>{m.encuentros}</td>
              <td className={`${TD} text-slate-500`}>{m.desde}</td>
            </tr>
          ))}
        </Tabla>
      )}
    </>
  )
}
