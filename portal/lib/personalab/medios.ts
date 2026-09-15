import { createClient, createServiceClient } from '@/lib/supabase/server'

// Reglas de los dos buckets. Estan aqui y no en cada ruta para que no
// diverjan: el limite del servidor tiene que ser el mismo que el del bucket.

// El audio se une a `medios` en vez de tener bucket propio, ETAPA 5. La
// alternativa (bucket propio con techo más chico) es más precisa para una
// voz grabada, pero un bucket nuevo es una pieza más que mantener por una
// precisión que hoy nadie pidió: nada en este producto sube audio sin
// comprimir. `medios` ya es "lo audiovisual que se sirve al participante",
// y su techo de 200 MB (puesto para video) es generoso de sobra para voz,
// nunca un bloqueo. Se puede partir en un bucket propio el día que haga
// falta un techo más ajustado. Ver `SubirArchivo.tsx:35` para el mismo mime
// list ya declarado como `accept=` del selector, antes de que hubiera
// dónde subir de verdad.
export const BUCKETS = {
  medios: {
    id: 'personalab-medios',
    limite: 200 * 1024 * 1024,
    tipos: [
      'image/jpeg', 'image/png', 'image/webp', 'image/avif',
      'video/mp4', 'video/quicktime',
      'audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/webm',
    ],
  },
  documentos: {
    id: 'personalab-documentos',
    limite: 50 * 1024 * 1024,
    tipos: ['application/pdf'],
  },
} as const

export type NombreBucket = keyof typeof BUCKETS

export function bucketPara(mime: string): NombreBucket | null {
  if (BUCKETS.documentos.tipos.includes(mime as never)) return 'documentos'
  if (BUCKETS.medios.tipos.includes(mime as never)) return 'medios'
  return null
}

export function motivoRechazo(mime: string, bytes: number): string | null {
  const b = bucketPara(mime)
  if (!b) {
    if (mime.startsWith('video/')) return 'Ese formato no lo podemos reproducir. Usa MP4 o MOV.'
    if (mime.startsWith('image/')) return 'Ese formato de imagen no se admite. Usa JPG, PNG o WEBP.'
    if (mime.startsWith('audio/')) return 'Ese formato de audio no se admite. Usa MP3, M4A, AAC, OGG o WEBM.'
    return 'Ese tipo de archivo no se admite aquí.'
  }
  const { limite } = BUCKETS[b]
  if (bytes > limite) {
    const mb = Math.round(bytes / 1024 / 1024)
    const max = Math.round(limite / 1024 / 1024)
    return `Pesa ${mb} MB y el máximo son ${max}. Comprímelo o divídelo en dos.`
  }
  return null
}

// Quien pide tiene que ser del equipo para SUBIR. Leer es otra cosa y se
// resuelve por audiencia, no por rol.
export async function exigirEquipo() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.', status: 401 as const, user: null }

  const { data: perfil } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (!perfil || !['super_admin', 'admin', 'staff'].includes(perfil.role)) {
    return { error: 'Sin permisos.', status: 403 as const, user: null }
  }
  return { error: null, status: 200 as const, user }
}

export function servicio() {
  return createServiceClient()
}
