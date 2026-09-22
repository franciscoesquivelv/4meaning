'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { exigirEquipo } from '@/lib/personalab/medios'

function aSlug(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}

export interface EntradaExperiencia {
  nombre: string
  slug: string
  subtitulo: string
  duracion: string
  abreEspacioAlGrupo: boolean
}

export async function crearExperiencia(
  input: EntradaExperiencia
): Promise<{ error: string } | { ok: true; slug: string }> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { error: guardia.error }

  const nombre = input.nombre.trim()
  if (!nombre) return { error: 'Falta el nombre.' }

  const slug = aSlug(input.slug || input.nombre)
  if (!slug) return { error: 'El slug queda vacío. Escribe uno a mano.' }

  const service = createServiceClient()
  const { data, error } = await service
    .from('experiences')
    .insert({
      slug,
      nombre,
      subtitulo: input.subtitulo.trim() || null,
      duracion: input.duracion.trim() || null,
      abre_espacio_al_foro: input.abreEspacioAlGrupo, // TODO: columna renombrada a abre_espacio_al_grupo -- ver supabase/migrations/20260921_1900_foro_se_llama_grupo.sql, pendiente de correr
      created_by: guardia.user!.id,
    })
    .select('slug')
    .single()

  if (error) {
    const duplicado = error.code === '23505'
    return { error: duplicado ? `Ya existe una experiencia con el slug "${slug}".` : error.message }
  }

  revalidatePath('/personalab/experiencias')
  return { ok: true, slug: data.slug }
}

export interface EntradaFicha {
  nombre: string
  subtitulo: string
  narrativa: string
  duracion: string
  notaDiseno: string
  abreEspacioAlGrupo: boolean
}

export async function actualizarFicha(
  experienceId: string,
  input: EntradaFicha
): Promise<{ error: string } | { ok: true }> {
  const guardia = await exigirEquipo()
  if (guardia.error) return { error: guardia.error }

  const nombre = input.nombre.trim()
  if (!nombre) return { error: 'Falta el nombre.' }

  const service = createServiceClient()
  const { error } = await service
    .from('experiences')
    .update({
      nombre,
      subtitulo: input.subtitulo.trim() || null,
      narrativa: input.narrativa.trim() || null,
      duracion: input.duracion.trim() || null,
      nota_diseno: input.notaDiseno.trim() || null,
      abre_espacio_al_foro: input.abreEspacioAlGrupo, // TODO: columna renombrada a abre_espacio_al_grupo -- ver supabase/migrations/20260921_1900_foro_se_llama_grupo.sql, pendiente de correr
      updated_at: new Date().toISOString(),
    })
    .eq('id', experienceId)

  if (error) return { error: error.message }

  revalidatePath('/personalab/experiencias')
  return { ok: true }
}
