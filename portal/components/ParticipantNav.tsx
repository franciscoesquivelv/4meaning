import { createClient } from '@/lib/supabase/server'
import { retiroTerminado } from '@/lib/participante/tiempo'
import ParticipantNavLinks from './ParticipantNavLinks'

// ── LA BARRA DE LA PAREJA ───────────────────────────────────────
//
// ANTES: cinco pestañas, y una de ellas era un candado. Compromisos vivia en
// la barra durante las seis semanas de vispera y durante los tres dias del
// retiro, o sea el 100% del tiempo en que la pareja usa la app, y lo unico
// que hacia al tocarla era decir "Disponible al terminar el retiro". Un
// quinto de la navegacion principal era una puerta cerrada.
//
// AHORA: cuatro, y la cuarta es la que esta viva hoy.
//
//   Antes del retiro:  Inicio . Programa . Avisos . Firmar
//   Despues:           Inicio . Programa . Avisos . Compromisos
//
// El intercambio no es un truco de espacio: es que las dos pestañas son
// exactamente contrarias en el tiempo. Firmar solo tiene sentido antes de
// llegar, y despues es una tarea que ya no existe. Compromisos solo tiene
// sentido despues, y antes es un candado. Nunca las dos a la vez.
//
// LO QUE SE PIERDE, dicho sin maquillar: despues del retiro, Acuerdos sale
// de la barra. Sigue alcanzable desde Inicio, que lista los acuerdos ya
// firmados (`components/participante/MiRetiro.tsx:221`).
//
// LIMITE CONOCIDO DE LA PREVIA: quien mira desde el equipo no tiene familia
// propia, asi que aqui no hay fecha de retiro que leer y la barra cae al
// estado de antes del retiro. La previa del evento enumera las nueve
// pantallas por su cuenta, asi que Compromisos se sigue pudiendo revisar
// desde ahi; lo que no refleja el momento es la barra de abajo.

export default async function ParticipantNav() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let yaPaso = false

  if (user) {
    const { data: familia } = await supabase
      .from('families')
      .select('events(fecha_fin)')
      .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
      .limit(1)
      .maybeSingle()

    const evento = (familia?.events ?? null) as { fecha_fin: string | null } | null
    yaPaso = retiroTerminado(evento?.fecha_fin)
  }

  return <ParticipantNavLinks yaPaso={yaPaso} />
}
