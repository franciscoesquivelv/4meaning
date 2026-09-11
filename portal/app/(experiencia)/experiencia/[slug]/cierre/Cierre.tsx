'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// El cierre. Junta lo que la persona escribió, se lo enseña, y le ofrece
// mandárselo.
//
// LAS RESPUESTAS NO VIENEN DEL SERVIDOR, porque no existen ahí. Viven en el
// `sessionStorage` de esta pestaña y este componente es el único sitio de
// todo el sistema donde se leen juntas. Las consignas sí vienen del servidor:
// hacen falta para poner cada respuesta debajo de su pregunta.

const PREFIJO = 'pl.escritura.'

type Consigna = { id: string; texto: string; bisagra: string }
type Estado = 'leyendo' | 'listo' | 'enviando' | 'enviado' | 'fallo'

export default function Cierre({
  slug,
  nombre,
  consignas,
}: {
  slug: string
  nombre: string
  consignas: Consigna[]
}) {
  const [respuestas, setRespuestas] = useState<{ c: Consigna; texto: string }[]>([])
  const [estado, setEstado] = useState<Estado>('leyendo')
  const [correo, setCorreo] = useState('')

  useEffect(() => {
    const r: { c: Consigna; texto: string }[] = []
    try {
      for (const c of consignas) {
        const t = sessionStorage.getItem(PREFIJO + c.id)
        if (t?.trim()) r.push({ c, texto: t })
      }
    } catch { /* almacenamiento bloqueado: se queda vacío */ }
    setRespuestas(r)
    setEstado('listo')
  }, [consignas])

  async function enviar() {
    setEstado('enviando')
    try {
      const res = await fetch('/api/experiencia/enviar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slug,
          respuestas: respuestas.map(r => ({ consigna: r.c.texto, texto: r.texto })),
        }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error ?? 'fallo')
      setCorreo(j.correo ?? '')
      setEstado('enviado')
    } catch {
      setEstado('fallo')
    }
  }

  if (estado === 'leyendo') return null

  return (
    <>
      <h1 className="display text-[32px] md:text-[42px] text-dom mt-3">
        {respuestas.length > 0 ? 'Lo que escribiste' : `Terminaste ${nombre}`}
      </h1>

      {respuestas.length === 0 ? (
        // NO SE REGAÑA A QUIEN NO ESCRIBIÓ. Sora lo dejó fijado para la sala:
        // parar también es haber terminado, y el permiso de quedarse en la
        // superficie hay que sostenerlo hasta el final, no solo ofrecerlo al
        // principio. Sin el cuerpo del facilitador, aquí va por escrito.
        <p className="mt-6 text-[17px] leading-[1.65] font-light text-ink/90">
          No escribiste nada, y está bien. Atravesarlo ya fue hacerlo.
        </p>
      ) : (
        <>
          <p className="mt-6 text-[17px] leading-[1.65] font-light text-ink/90">
            Esto vive solo en esta pestaña. Si la cierras, se borra.
          </p>

          <div className="mt-12 space-y-10">
            {respuestas.map(({ c, texto }) => (
              <div key={c.id}>
                <p className="text-[13px] leading-[1.5] text-gray-ui">{c.texto}</p>
                <p className="mt-2 text-[17px] leading-[1.7] font-light text-ink whitespace-pre-wrap">
                  {texto}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-line">
            {estado === 'enviado' ? (
              <p className="text-[16px] leading-[1.6] font-light text-bien">
                Te lo mandamos a {correo}. Guárdalo: es la única copia.
              </p>
            ) : (
              <>
                <button
                  onClick={enviar}
                  disabled={estado === 'enviando'}
                  className="inline-flex items-center px-6 py-3 rounded-full bg-dom text-paper text-[15px] font-medium hover:opacity-90 disabled:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  {estado === 'enviando' ? 'Enviando...' : 'Mándamelo a mi correo'}
                </button>

                {estado === 'fallo' && (
                  // El fallo se dice y no se disfraza, y sin echarle la culpa
                  // a quien lo está leyendo.
                  <p className="mt-4 text-[15px] leading-[1.6] text-alerta">
                    No pudimos mandarlo ahora. No cierres esta pestaña todavía:
                    lo que escribiste sigue aquí. Vuelve a intentarlo en un
                    momento.
                  </p>
                )}
              </>
            )}
          </div>
        </>
      )}

      <Link
        href={`/experiencia/${slug}`}
        className="inline-flex items-center mt-12 text-[15px] text-dom underline underline-offset-4 hover:opacity-80"
      >
        Volver al recorrido
      </Link>
    </>
  )
}
