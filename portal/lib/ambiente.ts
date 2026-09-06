import { createClient } from '@/lib/supabase/server'

// ── AMBIENTE DE PRUEBAS ─────────────────────────────────────────
//
// Todo lo que hay hoy en el portal es ficticio: cuatro familias, sus
// acuerdos, su itinerario, sus entregas. Sirve para guiar y para tener algo
// estable que mirar. El riesgo de datos falsos sin marcar es que en unos
// meses ya nadie recuerda cuales eran, y alguien toma una decision mirando
// una familia que no existe.
//
// La bandera vive en `events.es_prueba` porque el evento es la raiz: todo lo
// demas lleva `event_id` o cuelga de algo que lo lleva. Se marca arriba una
// vez, en vez de una bandera por familia que se puede contradecir con la de
// su evento.
//
// POR QUE ESTA CONSULTA VA APARTE Y NO PEGADA AL RESTO. La columna la crea
// `supabase/migrations/20260906_ambiente_de_pruebas.sql`, y las migraciones
// las corre Francisco a mano. Entre que este codigo sale y esa migracion se
// corre hay una ventana donde la columna no existe. Si `es_prueba` viajara
// dentro del `select` de la pagina, esa consulta fallaria entera y la
// pantalla se quedaria sin evento, sin familias y sin decir por que. Asi, lo
// unico que se pierde en esa ventana es el distintivo.
//
// Se asume NO prueba cuando falla, que es el lado seguro del error: es mejor
// no marcar un evento de prueba que marcar como prueba uno real.

export async function esEventoDePrueba(eventId: string): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('es_prueba')
    .eq('id', eventId)
    .maybeSingle()

  if (error || !data) return false
  return (data as { es_prueba?: boolean }).es_prueba === true
}

// La version de lista, para no hacer una consulta por evento en `/eventos`.
// Devuelve el conjunto de ids marcados como prueba; vacio si la columna
// todavia no existe.
export async function eventosDePrueba(): Promise<Set<string>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('id')
    .eq('es_prueba', true)

  if (error || !data) return new Set()
  return new Set(data.map(e => e.id))
}
