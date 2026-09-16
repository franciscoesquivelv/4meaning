'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { DatosCompras, CompraFila, ExperienciaOpcion } from '@/lib/personalab/compras'
import { registrarCompra, canjearCompra } from './actions'
import { Titulo, Tabla, Vacio, Boton, Panel, Etiqueta } from '../ui'
import { TD, ETIQUETA } from '../tokens'

const ETIQUETA_INPUT = `${ETIQUETA} block mb-1.5`
const INPUT =
  'w-full bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink ' +
  'placeholder:text-gray-ui/70 focus:outline-none focus:border-dom/50 transition-colors'
const FILA_HOVER = 'hover:bg-paper-2 transition-colors'

function formatoMonto(centavos: number, moneda: string) {
  return `${(centavos / 100).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${moneda}`
}

function formatoFecha(iso: string) {
  return iso.slice(0, 10)
}

export default function ComprasClient({ datos }: { datos: DatosCompras }) {
  const router = useRouter()
  const [mostrarForm, setMostrarForm] = useState(false)

  const pendientes = datos.compras.filter(c => !c.canjeadoAt)
  const canjeadas = datos.compras.filter(c => c.canjeadoAt)

  return (
    <>
      <Titulo
        sub="El libro a mano de lo que se ha cobrado: quién ya pagó, quién ya tiene acceso y quién sigue esperando que alguien del equipo se lo dé."
        accion={
          <Boton variante="primario" onClick={() => setMostrarForm(v => !v)}>
            {mostrarForm ? 'Cerrar' : '+ Registrar compra'}
          </Boton>
        }
      >
        Compras
      </Titulo>

      {mostrarForm && (
        <div className="mb-8">
          <FormularioCompra
            experiencias={datos.experiencias}
            onListo={() => { setMostrarForm(false); router.refresh() }}
          />
        </div>
      )}

      <Etiqueta>Pendientes de dar acceso ({pendientes.length})</Etiqueta>
      <div className="mb-8">
        {pendientes.length === 0 ? (
          <Vacio neutro>No hay compras esperando acceso.</Vacio>
        ) : (
          <Tabla cabeceras={['Quién compró', 'Experiencia', 'Monto', 'Pagó el', '']}>
            {pendientes.map(c => <FilaPendiente key={c.id} compra={c} />)}
          </Tabla>
        )}
      </div>

      <Etiqueta>Quién ya tiene acceso ({datos.accesos.length})</Etiqueta>
      <div className="mb-8">
        {datos.accesos.length === 0 ? (
          <Vacio neutro>Nadie tiene acceso individual todavía.</Vacio>
        ) : (
          <Tabla cabeceras={['Quién', 'Experiencia', 'Desde']}>
            {datos.accesos.map(a => (
              <tr key={a.grantId} className={FILA_HOVER}>
                <td className={TD}>
                  <div className="font-medium text-ink">{a.nombre ?? a.email}</div>
                  {a.nombre && <div className="text-xs text-gray-ui mt-0.5">{a.email}</div>}
                </td>
                <td className={`${TD} text-gray-ui`}>{a.experienciaNombre}</td>
                <td className={`${TD} text-gray-ui tabular-nums`}>{formatoFecha(a.otorgadoAt)}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </div>

      {canjeadas.length > 0 && (
        <>
          <Etiqueta>Historial de compras canjeadas ({canjeadas.length})</Etiqueta>
          <Tabla cabeceras={['Quién compró', 'Experiencia', 'Monto', 'Pagó el', 'Canjeó el']}>
            {canjeadas.map(c => (
              <tr key={c.id} className={FILA_HOVER}>
                <td className={TD}>{c.email}</td>
                <td className={`${TD} text-gray-ui`}>{c.experienciaNombre}</td>
                <td className={`${TD} tabular-nums`}>{formatoMonto(c.montoCentavos, c.moneda)}</td>
                <td className={`${TD} text-gray-ui tabular-nums`}>{formatoFecha(c.pagadoAt)}</td>
                <td className={`${TD} text-gray-ui tabular-nums`}>{formatoFecha(c.canjeadoAt!)}</td>
              </tr>
            ))}
          </Tabla>
        </>
      )}
    </>
  )
}

// Una fila por compra sin canjear, con su propio botón de "Dar acceso":
// cada canje es independiente, así que el error de uno no debe bloquear ni
// confundirse con el de otro. `canjearCompra` ya hace todo el trabajo
// (resolver la cuenta, escribir el perfil si es nueva, dar el grant, marcar
// la compra); aquí solo se refleja el resultado.
function FilaPendiente({ compra }: { compra: CompraFila }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [listo, setListo] = useState(false)

  function darAcceso() {
    setError(null)
    startTransition(async () => {
      const r = await canjearCompra(compra.id)
      if ('error' in r) {
        setError(r.error)
        return
      }
      setListo(true)
      setTimeout(() => router.refresh(), 900)
    })
  }

  return (
    <tr className={FILA_HOVER}>
      <td className={TD}>{compra.email}</td>
      <td className={`${TD} text-gray-ui`}>{compra.experienciaNombre}</td>
      <td className={`${TD} tabular-nums`}>{formatoMonto(compra.montoCentavos, compra.moneda)}</td>
      <td className={`${TD} text-gray-ui tabular-nums`}>{formatoFecha(compra.pagadoAt)}</td>
      <td className={TD}>
        <div className="flex flex-col items-end gap-1.5">
          <Boton
            variante="primario"
            cargando={pending}
            listo={listo}
            textoCargando="Dando acceso…"
            textoListo="Acceso dado"
            disabled={pending || listo}
            onClick={darAcceso}
          >
            Dar acceso
          </Boton>
          {error && <span className="text-xs text-alerta max-w-[220px] text-right">{error}</span>}
        </div>
      </td>
    </tr>
  )
}

// EL LIBRO A MANO. No hay pasarela detrás: esto solo deja constancia de un
// pago que YA ocurrió por otro medio (transferencia, efectivo). Registrarlo
// aquí no cobra nada ni le manda nada a nadie; eso pasa recién en "Dar
// acceso", que sí crea la cuenta si hace falta y manda el correo real.
function FormularioCompra({
  experiencias, onListo,
}: {
  experiencias: ExperienciaOpcion[]
  onListo: () => void
}) {
  const [form, setForm] = useState({
    email: '',
    experienceId: '',
    monto: '',
    moneda: 'USD',
    referencia: '',
    pagadoAt: new Date().toISOString().slice(0, 10),
  })
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const montoCentavos = Math.round(parseFloat(form.monto.replace(',', '.')) * 100)
    if (!Number.isFinite(montoCentavos) || montoCentavos < 0) {
      setError('El monto no es un número válido.')
      return
    }

    startTransition(async () => {
      const r = await registrarCompra({
        email: form.email,
        experienceId: form.experienceId,
        montoCentavos,
        moneda: form.moneda,
        referencia: form.referencia,
        pagadoAt: form.pagadoAt,
      })
      if ('error' in r) {
        setError(r.error)
        return
      }
      onListo()
    })
  }

  return (
    <Panel>
      <form onSubmit={enviar} className="space-y-4">
        <div>
          <p className="text-sm font-medium text-ink">Registrar una compra que ya se cobró</p>
          <p className="text-xs text-gray-ui mt-0.5">
            Esto no cobra nada: es solo dejar constancia de un pago que ya ocurrió, por transferencia o en efectivo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={ETIQUETA_INPUT}>Correo de quien compró</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="nombre@correo.com"
              className={INPUT}
            />
          </div>

          <div>
            <label className={ETIQUETA_INPUT}>Experiencia</label>
            <select
              required
              value={form.experienceId}
              onChange={e => setForm(f => ({ ...f, experienceId: e.target.value }))}
              className={INPUT}
            >
              <option value="">Elegir…</option>
              {experiencias.map(x => (
                <option key={x.id} value={x.id}>{x.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={ETIQUETA_INPUT}>Monto</label>
            <input
              required
              inputMode="decimal"
              value={form.monto}
              onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
              placeholder="45.00"
              className={INPUT}
            />
          </div>

          <div>
            <label className={ETIQUETA_INPUT}>Moneda</label>
            <input
              required
              value={form.moneda}
              onChange={e => setForm(f => ({ ...f, moneda: e.target.value.toUpperCase() }))}
              maxLength={3}
              className={INPUT}
            />
          </div>

          <div>
            <label className={ETIQUETA_INPUT}>Pagó el</label>
            <input
              required
              type="date"
              value={form.pagadoAt}
              onChange={e => setForm(f => ({ ...f, pagadoAt: e.target.value }))}
              className={INPUT}
            />
          </div>

          <div>
            <label className={ETIQUETA_INPUT}>Referencia (opcional)</label>
            <input
              value={form.referencia}
              onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))}
              placeholder="Transferencia BAC #1234"
              className={INPUT}
            />
          </div>
        </div>

        {error && <p className="text-sm text-alerta">{error}</p>}

        <div className="flex justify-end">
          <Boton type="submit" variante="primario" cargando={pending} textoCargando="Guardando…" disabled={pending}>
            Guardar compra
          </Boton>
        </div>
      </form>
    </Panel>
  )
}
