'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { crearExperiencia } from '../actions'
import { Titulo, Panel, Boton } from '../../ui'
import { ETIQUETA } from '../../tokens'

const ETIQUETA_INPUT = `${ETIQUETA} block mb-1.5`
const INPUT =
  'w-full bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink ' +
  'placeholder:text-gray-ui/70 focus:outline-none focus:border-dom/50 transition-colors'

function aSlugVista(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}

export default function NuevaExperienciaPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTocado, setSlugTocado] = useState(false)
  const [subtitulo, setSubtitulo] = useState('')
  const [duracion, setDuracion] = useState('')
  const [abreEspacioAlForo, setAbreEspacioAlForo] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const r = await crearExperiencia({
        nombre,
        slug: slug || aSlugVista(nombre),
        subtitulo,
        duracion,
        abreEspacioAlForo,
      })
      if ('error' in r) { setError(r.error); return }
      router.push(`/personalab/experiencias/${r.slug}`)
    })
  }

  return (
    <div className="max-w-lg">
      <Link href="/personalab/experiencias" className="text-xs text-gray-ui hover:text-ink transition-colors">
        ← Experiencias
      </Link>

      <div className="mt-4">
        <Titulo sub="El primer borrador del diseño. Las bisagras y el kit se arman después, desde el editor.">
          Nueva experiencia
        </Titulo>
      </div>

      <Panel>
        <form onSubmit={enviar} className="space-y-4">
          <div>
            <label className={ETIQUETA_INPUT}>Nombre</label>
            <input
              required
              value={nombre}
              onChange={e => {
                setNombre(e.target.value)
                if (!slugTocado) setSlug(aSlugVista(e.target.value))
              }}
              placeholder="Ej: El Presente como Regalo"
              className={INPUT}
            />
          </div>

          <div>
            <label className={ETIQUETA_INPUT}>Slug (parte de la URL)</label>
            <input
              required
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugTocado(true) }}
              placeholder="presente-regalo"
              className={`${INPUT} font-mono`}
            />
          </div>

          <div>
            <label className={ETIQUETA_INPUT}>Subtítulo (opcional)</label>
            <input
              value={subtitulo}
              onChange={e => setSubtitulo(e.target.value)}
              className={INPUT}
            />
          </div>

          <div>
            <label className={ETIQUETA_INPUT}>Duración (opcional)</label>
            <input
              value={duracion}
              onChange={e => setDuracion(e.target.value)}
              placeholder="Por definir"
              className={INPUT}
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={abreEspacioAlForo}
              onChange={e => setAbreEspacioAlForo(e.target.checked)}
              className="w-4 h-4"
            />
            Admite abrir acceso individual al foro, además del moderador
          </label>

          {error && <p className="text-sm text-alerta">{error}</p>}

          <div className="flex justify-end">
            <Boton type="submit" variante="primario" cargando={pending} textoCargando="Creando…" disabled={pending}>
              Crear experiencia
            </Boton>
          </div>
        </form>
      </Panel>
    </div>
  )
}
