import { createServiceClient } from '@/lib/supabase/server'
import { exigirEquipo } from './medios'
import type { Resultado } from './lectura'

// ── CUÁNTO ESPACIO DE SUBIDA ESTAMOS USANDO ──────────────────────
//
// Pedido de Francisco, 2026-09-30: "en el portal van a subir cosas... cómo
// hacemos para saber cuánto espacio utilizado tenemos."
//
// SE LEE `media.peso_bytes`, NO EL ALMACÉN DE VERDAD. Cada archivo subido
// ya pasa por `/api/personalab/medios/subir`, que registra su peso real
// (el que Storage reportó, no el que el navegador dijo) en esta misma
// tabla -- es la fuente que ya existe, y leerla es una consulta, no una
// llamada a la API de Storage enumerando objeto por objeto. El límite
// honesto que esto tiene, medido el mismo día que se escribió: puede
// DESVIARSE si un archivo se borra del almacén por fuera de la app (se
// encontró exactamente un caso así auditando esto -- un PDF de prueba que
// ya no existe en Storage pero cuya fila en `media` seguía viva). No
// hace que la cifra mienta hacia arriba del uso real de Storage: la
// dirección del error es la contraria, "la base cree que hay un archivo
// que ya no está", así que esto nunca puede mostrar MENOS de lo que
// Storage de verdad tiene ocupado, solo (rara vez) un poco más.
export interface UsoAlmacenamiento {
  totalBytes: number
  porBucket: { bucket: string; bytes: number; archivos: number }[]
}

// EL TOPE DEL PLAN NO VIVE EN NINGUNA TABLA: es una cifra de la cuenta de
// Supabase (Project Settings → Billing), no del proyecto ni de ninguna
// fila. No hay forma honesta de leerla desde aquí -- la llave de servicio
// de este proyecto no da acceso a esa API. Se declara a mano, una vez, y
// se queda en `null` hasta que alguien la ponga: con `null`, la pantalla
// muestra el uso real sin fingir un porcentaje contra un tope inventado.
// Para ponerla, cambia este número por el tope real en bytes.
export const TOPE_ALMACENAMIENTO_BYTES: number | null = null

export async function cargarUsoAlmacenamiento(): Promise<Resultado<UsoAlmacenamiento>> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { estado: 'sin-acceso' }

  const service = createServiceClient()
  const { data, error } = await service.from('media').select('bucket, peso_bytes')
  if (error) return { estado: 'fallo', motivo: error.message }

  const porBucketMapa = new Map<string, { bytes: number; archivos: number }>()
  let totalBytes = 0
  for (const m of data ?? []) {
    const bytes = m.peso_bytes ?? 0
    totalBytes += bytes
    const actual = porBucketMapa.get(m.bucket) ?? { bytes: 0, archivos: 0 }
    actual.bytes += bytes
    actual.archivos += 1
    porBucketMapa.set(m.bucket, actual)
  }

  return {
    estado: 'ok',
    datos: {
      totalBytes,
      porBucket: Array.from(porBucketMapa.entries())
        .map(([bucket, v]) => ({ bucket, ...v }))
        .sort((a, b) => b.bytes - a.bytes),
    },
  }
}
