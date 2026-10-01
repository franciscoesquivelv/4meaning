'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { exigirEquipo } from '@/lib/personalab/medios'
import type { Idea } from '@/lib/personalab/ideas'

// Cualquiera del equipo puede borrar cualquier idea, no solo la propia --
// mismo criterio que el resto de PersonaLab (una experiencia, un segmento,
// un bloque: quien sea del equipo lo gestiona, no solo quien lo creó).
// "Nosotros" fue la palabra de Francisco, no "yo".

// DEVUELVE LA IDEA CREADA, NO SOLO `{ok:true}`. BUG REAL, ENCONTRADO
// PROBANDO EN VIVO, no leyendo código: `IdeasClient.tsx` guarda la lista
// en su propio `useState`, sembrado UNA VEZ desde `ideasIniciales`. Un
// `router.refresh()` sí vuelve a correr el server component y le pasa un
// prop nuevo, pero React no resincroniza un `useState` ya inicializado
// solo porque el prop cambió -- la idea se guardaba de verdad en la base
// (confirmado con una consulta directa) y la pantalla seguía diciendo
// "todavía no hay ninguna idea anotada". La corrección no es forzar un
// re-sincronizado de props (`useEffect` persiguiendo al padre), es que el
// action devuelva lo que el cliente ya necesita para pintar la fila de
// inmediato, mismo criterio que ya usa `borrar` (que nunca tuvo este bug
// porque actualiza su propio estado directo, sin esperar al padre).
export async function crearIdea(texto: string): Promise<{ error: string } | { ok: true; idea: Idea }> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { error: guardia.error }

  const limpio = texto.trim()
  if (!limpio) return { error: 'Escribe algo antes de guardar.' }

  const service = createServiceClient()
  const { data, error } = await service
    .from('ideas')
    .insert({ texto: limpio, created_by: guardia.user!.id })
    .select('id, texto, created_at, profiles(full_name, email)')
    .single()

  if (error) return { error: error.message }

  const perfil = data.profiles as unknown as { full_name: string | null; email: string } | null
  const idea: Idea = {
    id: data.id as string,
    texto: data.texto as string,
    autor: perfil?.full_name ?? perfil?.email ?? 'Alguien del equipo',
    creadaEn: data.created_at as string,
  }

  revalidatePath('/personalab/ideas')
  return { ok: true, idea }
}

export async function borrarIdea(id: string): Promise<{ error: string } | { ok: true }> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { error: guardia.error }

  const service = createServiceClient()
  const { error } = await service.from('ideas').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/personalab/ideas')
  return { ok: true }
}
