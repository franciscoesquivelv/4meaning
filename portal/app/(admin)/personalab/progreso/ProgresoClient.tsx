'use client'

import { useRouter } from 'next/navigation'
import type { DatosProgreso } from '@/lib/personalab/progreso'
import { ETIQUETA_TIEMPO } from '../dominio'
import { Titulo, Tabla, Vacio, Etiqueta } from '../ui'
import { TD, PASTILLA, ETIQUETA } from '../tokens'
import { TONO } from '@/lib/estilos/oficina'

const ETIQUETA_TITULARIDAD: Record<string, string> = {
  moderador: 'Moderador',
  miembro_foro: 'Miembro de foro',
  individual: 'Cliente individual',
}

function formatoFecha(iso: string) {
  return iso.slice(0, 10)
}

export default function ProgresoClient({ datos }: { datos: DatosProgreso }) {
  const router = useRouter()

  return (
    <>
      <Titulo sub="Por dónde va cada quien, no cuánto le falta. No hay porcentaje ni racha: solo la última bisagra que abrió y cuándo.">
        Progreso
      </Titulo>

      {datos.experiencias.length === 0 ? (
        <Vacio neutro>Nadie tiene acceso a ninguna experiencia todavía.</Vacio>
      ) : (
        <>
          <div className="mb-6">
            <label className={`${ETIQUETA} block mb-1.5`}>Experiencia</label>
            <select
              value={datos.experienciaId ?? ''}
              onChange={e => router.push(`/personalab/progreso?experiencia=${e.target.value}`)}
              className="w-full max-w-sm bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-dom/50 transition-colors"
            >
              {datos.experiencias.map(e => (
                <option key={e.id} value={e.id}>{e.nombre} · {e.personas} {e.personas === 1 ? 'persona' : 'personas'}</option>
              ))}
            </select>
          </div>

          <Etiqueta>Resumen</Etiqueta>
          <div className="mb-8 flex flex-wrap gap-2">
            {datos.agregado.length === 0 ? (
              <Vacio neutro>Nadie ha abierto nada todavía.</Vacio>
            ) : (
              datos.agregado.map(a => (
                <span
                  key={a.etiqueta + a.orden}
                  className={`${PASTILLA} ${a.tiempo ? TONO.marca : TONO.neutro} !text-[12px] px-3 py-1.5`}
                >
                  {a.tiempo && <span className="opacity-70 mr-1.5">{ETIQUETA_TIEMPO[a.tiempo as keyof typeof ETIQUETA_TIEMPO]}</span>}
                  {a.etiqueta} · {a.cantidad}
                </span>
              ))
            )}
          </div>

          <Etiqueta>Por persona ({datos.porPersona.length})</Etiqueta>
          {datos.porPersona.length === 0 ? (
            <Vacio neutro>Nadie tiene acceso a esta experiencia.</Vacio>
          ) : (
            <Tabla cabeceras={['Quién', 'Rol', 'Posición', 'Última vez']}>
              {datos.porPersona.map(p => (
                <tr key={p.profileId} className="hover:bg-paper-2 transition-colors">
                  <td className={TD}>
                    <div className="font-medium text-ink">{p.nombre ?? p.email}</div>
                    {p.nombre && <div className="text-xs text-gray-ui mt-0.5">{p.email}</div>}
                  </td>
                  <td className={`${TD} text-gray-ui`}>{ETIQUETA_TITULARIDAD[p.titularidad] ?? p.titularidad}</td>
                  <td className={TD}>
                    {p.posicion ? (
                      <>
                        <span className="text-gray-ui text-xs uppercase tracking-wider mr-1.5">
                          {ETIQUETA_TIEMPO[p.posicion.tiempo as keyof typeof ETIQUETA_TIEMPO] ?? p.posicion.tiempo}
                        </span>
                        {p.posicion.titulo}
                      </>
                    ) : (
                      <span className="text-gray-ui">Sin empezar</span>
                    )}
                  </td>
                  <td className={`${TD} text-gray-ui tabular-nums`}>
                    {p.vistoAt ? formatoFecha(p.vistoAt) : '—'}
                  </td>
                </tr>
              ))}
            </Tabla>
          )}
        </>
      )}
    </>
  )
}
