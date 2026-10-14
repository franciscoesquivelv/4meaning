'use client'

import { useState } from 'react'
import { miniaturaYoutube, urlDeIncrustacion, type VideoExterno } from '@/lib/personalab/videoExterno'
import { FOCO } from './tokens'

// EL VIDEO QUE VE QUIEN LEE. YouTube y Vimeo, incrustados.
//
// YOUTUBE ENTRA COMO PORTADA Y SE CARGA AL TOCAR. Un reproductor de YouTube
// trae cientos de KB de código y sus cookies aunque nadie lo reproduzca, y
// una experiencia puede tener varios videos. Con la portada, la página pesa
// poco, se ve con el mismo cuidado que el resto (sin la barra de YouTube
// hasta que hace falta) y el toque que la persona da es el mismo que
// arranca el video: `autoplay=1` en la carga que sigue a ese toque.
//
// VIMEO ENTRA DIRECTO. Su reproductor es liviano, y su miniatura no se puede
// deducir del id (hay que preguntarla a su API), así que una portada propia
// sería otra consulta por cada vista.
//
// SIN TEXTO EXPLICATIVO ENCIMA NI DEBAJO. Francisco, 2026-10-13, sobre las
// frases de acompañamiento del lector: "NO HACEN FALTA".

const PERMISOS =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'

export default function VideoIncrustado({ video, titulo }: { video: VideoExterno; titulo: string }) {
  const [activo, setActivo] = useState(false)

  if (video.proveedor === 'vimeo' || activo) {
    return (
      <iframe
        src={urlDeIncrustacion(video, { autoplay: activo })}
        title={titulo}
        className="rounded-[10px] w-full aspect-video bg-ink"
        allow={PERMISOS}
        allowFullScreen
        loading={activo ? undefined : 'lazy'}
        // YouTube rechaza (error 153) el reproductor si la página que lo
        // incrusta no manda ningún "referer". Se fija a propósito en vez de
        // depender del valor por defecto del navegador.
        referrerPolicy="strict-origin-when-cross-origin"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setActivo(true)}
      aria-label={`Reproducir: ${titulo}`}
      className={`group relative block w-full aspect-video rounded-[10px] overflow-hidden bg-ink ${FOCO}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={miniaturaYoutube(video.id)}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <span className="absolute inset-0 bg-ink/25 group-hover:bg-ink/10 transition-colors duration-300" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-16 h-16 rounded-full bg-paper/90 flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-ink ml-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  )
}
