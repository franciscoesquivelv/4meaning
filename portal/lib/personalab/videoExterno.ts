// VIDEO DE YOUTUBE O VIMEO POR ENLACE. Pedido de Francisco, 2026-10-14: "al
// poner un video en alguno de los bloques me dé la opción de poner un video
// de YouTube, no quiero cargar el video completo al portal por tema de peso".
//
// UN SOLO LECTOR DE ENLACES, PARA EL EDITOR Y PARA EL LECTOR DEL
// PARTICIPANTE. Antes `Bloques.tsx` tenía su propia `comoIncrustable` con tres
// formas reconocidas (`watch?v=`, `youtu.be/` y Vimeo por número), y un enlace
// de Shorts, de transmisión en vivo o de `embed/` caía a `<video src>`: un
// reproductor negro y muerto. Un enlace "no listado" de Vimeo
// (`vimeo.com/ID/HASH`) también se rompía: el HASH es lo que permite
// incrustarlo, y se tiraba. Ahora hay una función que lo entiende todo, y el
// editor y el lector no pueden discrepar.
//
// Sin dependencias de servidor ni de navegador: la usan los dos lados.

export type ProveedorVideo = 'youtube' | 'vimeo'

export interface VideoExterno {
  proveedor: ProveedorVideo
  id: string
  // Solo Vimeo "no listado": sin él, el reproductor dice que el video no
  // existe aunque el enlace esté bien.
  hash?: string
  // Segundos desde donde arranca (`?t=90`, `&t=1m30s`, `#t=1m30s`).
  inicio?: number
}

const ID_YOUTUBE = /^[\w-]{11}$/
const ID_VIMEO = /^\d{5,12}$/
const HASH_VIMEO = /^[0-9a-f]{8,12}$/i

// "90", "90s", "1m30s", "1h2m3s" -> segundos. Lo que no se entiende, no es un
// tiempo: se descarta en vez de adivinar.
function aSegundos(t: string | null | undefined): number | undefined {
  if (!t) return undefined
  if (/^\d+$/.test(t)) return topar(Number(t))
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i)
  if (!m || (!m[1] && !m[2] && !m[3])) return undefined
  return topar((Number(m[1]) || 0) * 3600 + (Number(m[2]) || 0) * 60 + (Number(m[3]) || 0))
}

// Un video no dura un día entero; un número más grande es un error de dedo.
function topar(n: number): number | undefined {
  return n > 0 && n < 86400 ? Math.floor(n) : undefined
}

export function leerVideoExterno(crudo: string | null | undefined): VideoExterno | null {
  if (!crudo) return null
  let texto = crudo.trim()
  if (!texto) return null
  // `youtu.be/abc` pegado sin el `https://` es lo más común al copiar de la
  // barra de direcciones de un teléfono.
  if (!/^https?:\/\//i.test(texto)) texto = 'https://' + texto.replace(/^\/\//, '')

  let u: URL
  try {
    u = new URL(texto)
  } catch {
    return null
  }
  const host = u.hostname.toLowerCase().replace(/^(www|m|music)\./, '')
  const partes = u.pathname.split('/').filter(Boolean)

  // ── YouTube ──
  if (host === 'youtu.be' || host === 'youtube.com' || host === 'youtube-nocookie.com') {
    let id: string | null | undefined
    if (host === 'youtu.be') id = partes[0]
    else if (partes[0] === 'watch') id = u.searchParams.get('v')
    else if (['embed', 'shorts', 'live', 'v'].includes(partes[0])) id = partes[1]
    if (!id || !ID_YOUTUBE.test(id)) return null
    return {
      proveedor: 'youtube',
      id,
      inicio: aSegundos(u.searchParams.get('t') ?? u.searchParams.get('start')),
    }
  }

  // ── Vimeo ──
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    // `player.vimeo.com/video/ID` y `.../showcase/123/video/ID`: el número que
    // sigue a "video". En los demás, el primero (`vimeo.com/ID`,
    // `vimeo.com/channels/nombre/ID`).
    // Un número que sigue a "showcase" o "album" es el de una COLECCIÓN, no
    // el de un video: sin esta exclusión, `vimeo.com/showcase/123456` se
    // leía como el video 123456 (lo encontró la tabla de pruebas de abajo).
    const iVideo = partes.indexOf('video')
    const iId = iVideo >= 0
      ? iVideo + 1
      : partes.findIndex((p, i) => ID_VIMEO.test(p) && !['showcase', 'album'].includes(partes[i - 1]))
    const id = iId >= 0 ? partes[iId] : undefined
    if (!id || !ID_VIMEO.test(id)) return null
    const siguiente = partes[iId + 1]
    const hash = u.searchParams.get('h') ?? (siguiente && HASH_VIMEO.test(siguiente) ? siguiente : undefined)
    const enFragmento = u.hash.match(/t=([^&]+)/)?.[1]
    return {
      proveedor: 'vimeo',
      id,
      hash: hash && HASH_VIMEO.test(hash) ? hash : undefined,
      inicio: aSegundos(enFragmento ?? u.searchParams.get('t')),
    }
  }

  return null
}

// La forma en que se GUARDA el enlace: siempre la misma, sea cual sea la que
// se pegó. Así lo que está en la base es predecible, y un enlace de Shorts
// queda como el `watch?v=` que cualquier otra pantalla ya sabe leer.
export function urlCanonica(v: VideoExterno): string {
  if (v.proveedor === 'youtube') {
    return `https://www.youtube.com/watch?v=${v.id}${v.inicio ? `&t=${v.inicio}s` : ''}`
  }
  return `https://vimeo.com/${v.id}${v.hash ? `/${v.hash}` : ''}${v.inicio ? `#t=${v.inicio}s` : ''}`
}

// EL REPRODUCTOR QUE VE EL PARTICIPANTE.
//
// YouTube por `youtube-nocookie.com`, el modo de privacidad ampliada: no
// deja cookies de seguimiento hasta que la persona reproduce. `rel=0` limita
// los "videos relacionados" del final a los del MISMO canal (YouTube ya no
// permite quitarlos del todo). `playsinline` evita que el iPhone saque el
// video a pantalla completa por su cuenta. Vimeo con `dnt=1`, que le pide que
// no rastree.
export function urlDeIncrustacion(v: VideoExterno, opciones: { autoplay?: boolean } = {}): string {
  const auto = opciones.autoplay ? '&autoplay=1' : ''
  if (v.proveedor === 'youtube') {
    return (
      `https://www.youtube-nocookie.com/embed/${v.id}` +
      `?rel=0&playsinline=1&modestbranding=1&hl=es${v.inicio ? `&start=${v.inicio}` : ''}${auto}`
    )
  }
  return (
    `https://player.vimeo.com/video/${v.id}?dnt=1${v.hash ? `&h=${v.hash}` : ''}${auto}` +
    (v.inicio ? `#t=${v.inicio}s` : '')
  )
}

// La miniatura de YouTube se deduce del id, sin pedirle nada a ninguna API.
// `hqdefault` es de 4:3 con franjas negras arriba y abajo; el contenedor 16:9
// con `object-cover` las recorta justo.
export function miniaturaYoutube(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

export const NOMBRE_PROVEEDOR: Record<ProveedorVideo, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
}
