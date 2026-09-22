'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { FichaExperiencia } from '@/lib/personalab/catalogo'
import { actualizarFicha } from '../../actions'
import { Titulo, Panel, Boton } from '../../../ui'
import { ETIQUETA } from '../../../tokens'

const ETIQUETA_INPUT = `${ETIQUETA} block mb-1.5`
const INPUT =
  'w-full bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink ' +
  'placeholder:text-gray-ui/70 focus:outline-none focus:border-dom/50 transition-colors'
const TEXTAREA = `${INPUT} resize-y min-h-[88px]`

export default function EditarFichaClient({ experiencia }: { experiencia: FichaExperiencia }) {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: experiencia.nombre,
    subtitulo: experiencia.subtitulo ?? '',
    narrativa: experiencia.narrativa ?? '',
    duracion: experiencia.duracion ?? '',
    notaDiseno: experiencia.notaDiseno ?? '',
    abreEspacioAlGrupo: experiencia.abreEspacioAlGrupo,
  })
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const r = await actualizarFicha(experiencia.id, form)
      if ('error' in r) { setError(r.error); return }
      router.push(`/personalab/experiencias/${experiencia.slug}`)
    })
  }

  return (
    <div className="max-w-lg">
      <Link
        href={`/personalab/experiencias/${experiencia.slug}`}
        className="text-xs text-gray-ui hover:text-ink transition-colors"
      >
        ← {experiencia.nombre}
      </Link>

      <div className="mt-4">
        <Titulo sub="El nombre, la narrativa y cómo se da acceso. Las bisagras se editan desde el editor.">
          Editar ficha
        </Titulo>
      </div>

      <Panel>
        <form onSubmit={enviar} className="space-y-4">
          <div>
            <label className={ETIQUETA_INPUT}>Nombre</label>
            <input
              required
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className={INPUT}
            />
          </div>

          <div>
            <label className={ETIQUETA_INPUT}>Subtítulo</label>
            <input
              value={form.subtitulo}
              onChange={e => setForm(f => ({ ...f, subtitulo: e.target.value }))}
              className={INPUT}
            />
          </div>

          <div>
            <label className={ETIQUETA_INPUT}>Narrativa</label>
            <textarea
              value={form.narrativa}
              onChange={e => setForm(f => ({ ...f, narrativa: e.target.value }))}
              className={TEXTAREA}
            />
          </div>

          <div>
            <label className={ETIQUETA_INPUT}>Duración</label>
            <input
              value={form.duracion}
              onChange={e => setForm(f => ({ ...f, duracion: e.target.value }))}
              placeholder="Por definir"
              className={INPUT}
            />
          </div>

          <div>
            <label className={ETIQUETA_INPUT}>Nota de diseño</label>
            <textarea
              value={form.notaDiseno}
              onChange={e => setForm(f => ({ ...f, notaDiseno: e.target.value }))}
              className={TEXTAREA}
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={form.abreEspacioAlGrupo}
              onChange={e => setForm(f => ({ ...f, abreEspacioAlGrupo: e.target.checked }))}
              className="w-4 h-4"
            />
            Admite abrir acceso individual al grupo, además del moderador
          </label>

          {error && <p className="text-sm text-alerta">{error}</p>}

          <div className="flex justify-end gap-3">
            <Link href={`/personalab/experiencias/${experiencia.slug}`} className="text-sm text-gray-ui hover:text-ink self-center transition-colors">
              Cancelar
            </Link>
            <Boton type="submit" variante="primario" cargando={pending} textoCargando="Guardando…" disabled={pending}>
              Guardar cambios
            </Boton>
          </div>
        </form>
      </Panel>
    </div>
  )
}
