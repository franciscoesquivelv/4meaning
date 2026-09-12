'use client'

import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

// Mueve el marcador de "dónde me quedé" al abrir esta bisagra.
//
// NO PINTA NADA. Es un componente sin salida visual a propósito: la persona
// no tiene que ver que la estamos recordando, solo tiene que encontrar el
// botón diciendo "Continuar" la próxima vez que entre.
//
// Y NO ES PROGRESO. La tabla `bookmarks` guarda una fila por persona y
// experiencia, con la última bisagra abierta y cuándo. Sin porcentaje, sin
// racha, sin nada que se pueda pintar como un termómetro: el léxico del
// Consejo #002 prohíbe esos campos por nombre y la tabla lo lleva escrito.
//
// Si falla, no pasa nada y no se le dice a nadie: interrumpir a alguien en
// medio de esto con un aviso de error cuesta más que el fallo.
//
// PERO EL COSTO YA NO ES EL QUE DECÍA AQUÍ. Hasta la Etapa 2, perder este
// marcador costaba "un toque de más en el índice". Dejó de ser cierto dos
// veces: el índice ahora decide con él qué se lista (así que perderlo
// recorta el recorrido a la vista), y el piso de tiempo de la pausa decide
// con él si ya se estuvo aquí (así que perderlo hace que la espera vuelva a
// correr en algo ya leído). Sigue sin avisarse, y sigue siendo la decisión
// correcta, pero quien lea esto tiene que saber qué se pierde de verdad.
// Corregido el 2026-09-12, hallazgo de Leo.

export default function MarcarVisto({
  experienciaId,
  bisagraId,
}: {
  experienciaId: string
  bisagraId: string
}) {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // YA NO SE CANCELA AL DESMONTAR, Y ES A PROPÓSITO. Hallazgo de Leo del
    // 2026-09-12: este componente no pinta nada, así que no hay estado que
    // proteger de una actualización tardía, que es para lo único que sirve
    // cancelar. Lo que sí hacía la bandera era tirar la escritura cuando
    // alguien pasaba rápido a la bisagra siguiente, porque `getUser()` es
    // una llamada de red y a veces contesta después de que la pantalla se
    // fue. Perder el marcador cuesta caro hoy (ver arriba), y la escritura
    // no le molesta a nadie aunque la persona ya no esté mirando.
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // `profile_id` va explícito porque la política de inserción exige que
      // coincida con `auth.uid()`. Es la misma persona por los dos lados: la
      // base no se fía de lo que mande el cliente.
      await supabase.from('bookmarks').upsert(
        {
          profile_id: user.id,
          experience_id: experienciaId,
          hinge_id: bisagraId,
          visto_at: new Date().toISOString(),
        },
        { onConflict: 'profile_id,experience_id' }
      )
    })()
  }, [experienciaId, bisagraId])

  return null
}
