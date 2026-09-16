import Link from 'next/link'
import { listarExperiencias } from '@/lib/personalab/catalogo'
import { Badge, Titulo, Tabla, Explicativo, Vacio } from '../ui'
import { TD, BTN_PRIMARIO, TARJETA } from '../tokens'
import { TONO } from '@/lib/estilos/oficina'

// ETAPA "SECCIÓN DE EXPERIENCIAS". Hasta aquí esta lista leía de
// `dominio.ts`, el catálogo escrito a mano. Ver `lib/personalab/catalogo.ts`
// para qué tan real es la base debajo de cada fila: bisagras y kit de
// Metamorfosis y El Presente como Regalo son reales; el kit de El
// Agradecimiento y cinco de las seis corridas del catálogo viejo, no.

// El enum real (`pl_maduracion`) no lleva tilde: 'diseno', no 'diseño'. El
// mapa de `dominio.ts`/`tokens.ts` sí la lleva, así que no sirve aquí.
const ETIQUETA_MADURACION: Record<string, string> = {
  diseno: 'En diseño',
  piloto: 'En piloto',
  lista: 'Lista',
  retirada: 'Retirada',
}
const TONO_MADURACION: Record<string, string> = {
  diseno: TONO.curso,
  piloto: TONO.marca,
  lista: TONO.bien,
  retirada: TONO.neutro,
}

export default async function ExperienciasPage() {
  const r = await listarExperiencias()

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
          <h1 className="text-lg font-semibold text-ink">No se pudo abrir Experiencias</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">{r.motivo}</p>
          <Link href="/personalab" className={`${BTN_PRIMARIO} inline-block mt-5`}>Volver</Link>
        </div>
      </div>
    )
  }

  const experiencias = r.datos

  return (
    <>
      <Titulo
        sub="La biblioteca. Cada experiencia es un diseño, no un contenedor de lecciones: vive en tres tiempos y se sostiene en bisagras."
        accion={
          <Link href="/personalab/experiencias/nueva" className={BTN_PRIMARIO}>
            + Nueva experiencia
          </Link>
        }
      >
        Experiencias
      </Titulo>

      <Explicativo titulo="¿A quién se le otorga el acceso?">
        Siempre al <b>moderador</b>, que compra para su foro. La columna de espacio al foro dice si esa
        experiencia además admite abrir acceso individual a cada persona. Se decide experiencia por
        experiencia, no como regla general.
      </Explicativo>

      {experiencias.length === 0 ? (
        <Vacio
          accion={
            <Link href="/personalab/experiencias/nueva" className={BTN_PRIMARIO}>
              + Nueva experiencia
            </Link>
          }
        >
          Todavía no hay ninguna experiencia en el catálogo.
        </Vacio>
      ) : (
        <Tabla cabeceras={['Experiencia', 'Estado', 'Duración', 'Bisagras', 'Corridas', 'Espacio al foro']}>
          {experiencias.map(e => (
            <tr key={e.id} className="hover:bg-paper-2 transition-colors">
              <td className={TD}>
                <Link href={`/personalab/experiencias/${e.slug}`} className="font-medium text-ink hover:underline">
                  {e.nombre}
                </Link>
                {e.subtitulo && <div className="text-xs text-gray-ui mt-0.5">{e.subtitulo}</div>}
              </td>
              <td className={TD}>
                <Badge label={ETIQUETA_MADURACION[e.maduracion] ?? e.maduracion} cls={TONO_MADURACION[e.maduracion] ?? TONO.neutro} />
              </td>
              <td className={`${TD} text-gray-ui`}>{e.duracion ?? 'Por definir'}</td>
              <td className={`${TD} tabular-nums`}>
                {e.bisagrasTotal === 0 ? (
                  <span className="text-terra-ui">ninguna</span>
                ) : (
                  <>
                    {e.bisagrasListas} de {e.bisagrasTotal}
                    {e.bisagrasListas < e.bisagrasTotal && (
                      <span className="text-terra-ui"> · faltan {e.bisagrasTotal - e.bisagrasListas}</span>
                    )}
                  </>
                )}
              </td>
              <td className={`${TD} tabular-nums`}>
                {e.corridas === 0 ? <span className="text-terra-ui">nunca</span> : e.corridas}
              </td>
              <td className={`${TD} text-gray-ui`}>
                {e.abreEspacioAlForo ? 'Sí, si el moderador lo abre' : 'No, todo pasa por el moderador'}
              </td>
            </tr>
          ))}
        </Tabla>
      )}
    </>
  )
}
