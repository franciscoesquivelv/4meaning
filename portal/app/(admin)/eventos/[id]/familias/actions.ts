'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── MARCAR EL VIDEO COMO ENTREGADO ──────────────────────────────
//
// ESTA ACCION LE MENTIA A LA PAREJA, Y ES LA MISMA FALLA DEL STORYBOOK QUE
// `lib/entregas.ts` documenta como ya corregida. El dato del video vivia
// partido en dos columnas que no se hablaban:
//
//   `video_entregado` (boolean)  lo escribia esta pantalla, Familias,
//                                 y lo leian Familias y Hoy.
//   `video_status`    (texto)    lo escribe Entregas, y es lo que lee la
//                                 pareja (`lib/participante/mi-retiro.ts:84`).
//
// Apretar "Marcar entregado" aqui le avisaba al panel del equipo y no le
// avisaba a la pareja: su app seguia diciendo "Pendiente" sobre un video que
// ya tenia en la mano. Nadie lo notaba porque los dos lados se escribieron
// por separado y nada los obligaba a coincidir.
//
// AHORA HAY UNA SOLA COLUMNA. `video_status` es la que manda, porque es la
// que tiene el CHECK de la base (`supabase/migrations/002_phase1_pipeline.sql:126`)
// y la que ya leen la pareja y la pantalla de Entregas. Esta accion escribe
// ahi. `video_entregado` y `video_entregado_at` quedaron sin un solo lector
// en el codigo y se dan de baja en
// `supabase/migrations/20260906_una_sola_columna_de_video.sql`.
//
// VERIFICACION MECANICA, la que exige el umbral: la columna que escribe
// "Marcar entregado" es `video_status`, y la columna que lee la pareja es
// `video_status`. Son la misma. Antes no lo eran.

// La fecha del dia en la sede (UTC-6), no en UTC. A las 19:00 de un martes
// en Mexico, `toISOString()` a secas ya dice miercoles.
function hoyEnSede(): string {
  return new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export async function marcarVideoEntregado(
  familyId: string,
  eventId: string
): Promise<{ error: string } | void> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('families')
      .update({ video_status: 'entregado', video_fecha: hoyEnSede() })
      .eq('id', familyId)
    if (error) return { error: error.message }

    revalidatePath(`/eventos/${eventId}/familias`)
    revalidatePath(`/eventos/${eventId}/entregas`)
    // La pantalla de la pareja. Sin esto el estado nuevo tarda en llegarle
    // justo a quien mas le importa.
    revalidatePath('/mi-retiro')
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}
