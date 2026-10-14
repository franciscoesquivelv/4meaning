import { NextRequest, NextResponse } from 'next/server'
import { exigirEquipo } from '@/lib/personalab/medios'
import { leerVideoExterno, urlCanonica, miniaturaYoutube } from '@/lib/personalab/videoExterno'

// "¿ES ESTE EL VIDEO?" AL PEGAR UN ENLACE. Mismo propósito que la ventana que
// muestra el PDF subido: un último control, antes de publicar, de que el
// video es el correcto y de que de verdad se va a poder ver.
//
// Le pregunta al servicio de cada plataforma (oEmbed) por el título, el
// autor y la miniatura. Sirve de validación, no solo de adorno: oEmbed
// responde distinto para un video que no existe, uno privado y uno cuyo
// dueño no permite incrustarlo, y esos tres casos son justo los que dejan al
// participante con un reproductor roto.
//
// SOLO PARA EL EQUIPO. Y NUNCA SE LE PIDE NADA A LA URL QUE LLEGA: se lee, se
// extrae el id, y la consulta se arma desde cero contra dos hosts fijos. Si
// se reenviara la URL tal cual, esta ruta sería un servidor que cualquiera
// del equipo puede mandar a pedir lo que quiera (SSRF).

const ESPERA_MS = 6000

type Motivo = 'no-reconocido' | 'no-existe' | 'no-incrustable' | 'sin-respuesta'

function fallo(motivo: Motivo) {
  return NextResponse.json({ ok: false, motivo })
}

export async function GET(request: NextRequest) {
  const guardia = await exigirEquipo()
  if (guardia.error) {
    return NextResponse.json({ error: guardia.error }, { status: guardia.status })
  }

  const entrada = request.nextUrl.searchParams.get('url') ?? ''
  const video = leerVideoExterno(entrada)
  if (!video) return fallo('no-reconocido')

  const canonica = urlCanonica(video)
  const consulta =
    video.proveedor === 'youtube'
      ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${video.id}`)}`
      : `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${video.id}${video.hash ? `/${video.hash}` : ''}`)}`

  const control = new AbortController()
  const reloj = setTimeout(() => control.abort(), ESPERA_MS)
  let r: Response
  try {
    r = await fetch(consulta, { signal: control.signal, cache: 'no-store' })
  } catch {
    return fallo('sin-respuesta')
  } finally {
    clearTimeout(reloj)
  }

  // 401/403: el video existe pero su dueño no deja incrustarlo (YouTube
  // responde 401; Vimeo 403 cuando lo restringe a ciertos dominios).
  // 404/400: no existe, se borró, o es privado.
  if (r.status === 401 || r.status === 403) return fallo('no-incrustable')
  if (r.status === 404 || r.status === 400) return fallo('no-existe')
  if (!r.ok) return fallo('sin-respuesta')

  let datos: { title?: string; author_name?: string; thumbnail_url?: string }
  try {
    datos = await r.json()
  } catch {
    return fallo('sin-respuesta')
  }

  return NextResponse.json({
    ok: true,
    proveedor: video.proveedor,
    canonica,
    titulo: datos.title ?? null,
    autor: datos.author_name ?? null,
    miniatura: video.proveedor === 'youtube' ? miniaturaYoutube(video.id) : (datos.thumbnail_url ?? null),
    inicio: video.inicio ?? null,
  })
}
