import Link from 'next/link'
import { cargarResumen } from '@/lib/personalab/gestion'
import { Badge, Titulo, Etiqueta, FilaMetricas, TarjetaLista, Fila } from './ui'
import { AVISO, BTN_PRIMARIO, BTN_SECUNDARIO, COLOR_ESTADO, COLOR_MADURACION, VACIO_NEUTRO, TARJETA } from './tokens'

const ETIQUETA_ESTADO: Record<string, string> = {
  prospecto: 'Prospecto', confirmada: 'Confirmado', en_preparacion: 'En preparación',
  corrida: 'Realizado', cancelada: 'Cancelado',
}
const ETIQUETA_MADURACION: Record<string, string> = {
  diseno: 'En diseño', piloto: 'En piloto', lista: 'Lista', retirada: 'Retirada',
}

function fecha(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ETAPA "GESTIÓN CONECTADA A LA BASE REAL", 2026-09-24. Hasta aquí esta
// pantalla (y las otras cuatro del panel de gestión) leía `dominio.ts`,
// un catálogo escrito a mano nunca conectado a Supabase -- los enlaces
// lo delataban, llevaban a ids como `c1` en vez de un UUID real. Se
// encontró el mismo día que Francisco pidió limpiar los datos de prueba
// de la base: después de borrarlos, esta pantalla seguía mostrando
// "Grupo Anáhuac" y "Rodrigo Lemus", porque nunca había leído la base
// para empezar. Ver `lib/personalab/gestion.ts` para el detalle completo
// de cada consulta real.
export default async function ResumenPage() {
  const r = await cargarResumen()

  if (r.estado === 'sin-acceso') {
    return (
      <div className="max-w-[560px] mt-8">
        <div className={`${TARJETA} p-6`}>
          <h1 className="text-lg font-semibold text-ink">Sin permiso de equipo</h1>
          <p className="text-sm text-ink mt-2 leading-relaxed">
            Tu cuenta no tiene permiso de equipo sobre PersonaLab.
          </p>
          <Link href="/workspaces" className={`${BTN_PRIMARIO} inline-block mt-5`}>Volver</Link>
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

  const { encuentrosPorDelante, gruposTotal, moderadoresTotal, personasEnRetorno, proximos, huecos, catalogo, enRetorno } = r.datos

  // Mismo estilo del dashboard de Trascendencia: alertas con borde
  // izquierdo ámbar, la primera con botón oscuro, las demás en blanco.
  const alertas = [
    ...proximos
      .filter(c => c.pendientes > 0)
      .map(c => ({
        titulo: `${c.pendientes} pendiente${c.pendientes > 1 ? 's' : ''} de preparación`,
        sub: `${c.experienciaNombre} · ${c.grupoNombre}`,
        href: `/personalab/encuentros/${c.id}`,
        accion: 'Ver encuentro',
      })),
    ...(huecos.length
      ? [{
          titulo: `${huecos.reduce((s, h) => s + h.bisagrasFaltantes.length, 0)} bisagras sin diseñar`,
          sub: 'No es captura pendiente: falta trabajo de diseño antes de poder realizarla',
          href: '/personalab/experiencias',
          accion: 'Ver experiencias',
        }]
      : []),
  ]

  return (
    <>
      <Titulo sub="Lo que está en curso, lo que viene y dónde falta diseño.">PersonaLab</Titulo>

      <FilaMetricas
        items={[
          { v: String(encuentrosPorDelante), k: 'Encuentros por delante', href: '/personalab/encuentros' },
          { v: String(gruposTotal), k: 'Grupos', href: '/personalab/grupos' },
          { v: String(moderadoresTotal), k: 'Moderadores', href: '/personalab/moderadores' },
          { v: String(personasEnRetorno), k: 'Personas en retorno', href: '/personalab/retorno' },
        ]}
      />

      {alertas.length > 0 && (
        <div className="mb-8">
          <Etiqueta>Pendiente antes del próximo encuentro</Etiqueta>
          <div className="flex flex-col gap-2">
            {alertas.map((a, i) => (
              <div key={a.titulo + a.sub} className={`${AVISO} flex items-center justify-between gap-4`}>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{a.titulo}</div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{a.sub}</div>
                </div>
                <Link
                  href={a.href}
                  className={
                    i === 0
                      ? `${BTN_PRIMARIO} text-xs px-3 py-1.5 whitespace-nowrap flex-shrink-0`
                      : `${BTN_SECUNDARIO} text-xs px-3 py-1.5 whitespace-nowrap flex-shrink-0`
                  }
                >
                  {a.accion}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-5">
        <div className="flex flex-col gap-5">
          <TarjetaLista titulo="Próximos encuentros" verTodo={{ href: '/personalab/encuentros', label: 'Ver todos' }}>
            {proximos.length === 0 ? (
              <div className={VACIO_NEUTRO}>Nada agendado por ahora.</div>
            ) : (
              proximos.map(c => (
                <Fila
                  key={c.id}
                  href={`/personalab/encuentros/${c.id}`}
                  titulo={c.experienciaNombre}
                  sub={`${c.grupoNombre} · ${c.fecha ? fecha(c.fecha) : 'sin fecha'} · ${c.personasEnElGrupo || 'sin'} personas`}
                  derecha={<Badge label={ETIQUETA_ESTADO[c.estado] ?? c.estado} cls={COLOR_ESTADO[c.estado] ?? COLOR_ESTADO.prospecto} />}
                />
              ))
            )}
          </TarjetaLista>

          <TarjetaLista titulo="Huecos del catálogo" verTodo={{ href: '/personalab/experiencias', label: 'Ver todas' }}>
            {huecos.length === 0 ? (
              <div className={VACIO_NEUTRO}>Sin huecos: todo el catálogo tiene su diseño al día.</div>
            ) : (
              huecos.map(h => (
                <Fila
                  key={h.experienciaId}
                  href={`/personalab/experiencias/${h.experienciaSlug}`}
                  titulo={h.experienciaNombre}
                  sub={h.sinDiseño ? 'Sin ninguna bisagra. La experiencia entera está por diseñar.' : h.bisagrasFaltantes.join(' · ')}
                  derecha={
                    <span className="text-xs text-amber-700 tabular-nums whitespace-nowrap">
                      {h.sinDiseño ? 'sin diseño' : `faltan ${h.bisagrasFaltantes.length}`}
                    </span>
                  }
                />
              ))
            )}
          </TarjetaLista>
        </div>

        <div className="flex flex-col gap-5">
          <TarjetaLista titulo="Catálogo" verTodo={{ href: '/personalab/experiencias', label: 'Ver todas' }}>
            {catalogo.map(e => (
              <Fila
                key={e.id}
                href={`/personalab/experiencias/${e.slug}`}
                titulo={e.nombre}
                sub={
                  (e.bisagrasTotal === 0 ? 'Sin bisagras' : `${e.bisagrasListas} de ${e.bisagrasTotal} bisagras listas`) +
                  ' · ' + (e.encuentros === 0 ? 'nunca se ha realizado' : `${e.encuentros} encuentro${e.encuentros > 1 ? 's' : ''}`)
                }
                derecha={<Badge label={ETIQUETA_MADURACION[e.maduracion] ?? e.maduracion} cls={COLOR_MADURACION[e.maduracion] ?? COLOR_MADURACION.diseno} />}
              />
            ))}
          </TarjetaLista>

          <TarjetaLista titulo="En retorno" verTodo={{ href: '/personalab/retorno', label: 'Ver todo' }}>
            {enRetorno.length === 0 ? (
              <div className={VACIO_NEUTRO}>Ningún grupo está en retorno ahora mismo.</div>
            ) : (
              enRetorno.map(c => (
                <Fila
                  key={c.id}
                  href={`/personalab/encuentros/${c.id}`}
                  titulo={c.experienciaNombre}
                  sub={`${c.grupoNombre} · ${c.personasEnElGrupo} personas`}
                  derecha={
                    <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
                      Mes {c.mesDeRetorno ?? 0} de 6
                    </span>
                  }
                />
              ))
            )}
          </TarjetaLista>
        </div>
      </div>
    </>
  )
}
