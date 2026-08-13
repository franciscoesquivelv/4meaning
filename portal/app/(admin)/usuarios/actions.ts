'use server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const ROLES_VALIDOS = ['super_admin', 'admin', 'staff', 'participant'] as const

export async function updateUserRole(
  userId: string,
  role: string
): Promise<{ error: string } | void> {
  try {
    // Un server action es un endpoint HTTP: cualquiera puede invocarlo, no
    // solo quien ve la pantalla de usuarios. Antes no verificaba nada y
    // escribia con el cliente de sesion, que es la mitad de la escalada de
    // privilegios. La otra mitad estaba en la politica de RLS.
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado.' }

    const { data: perfil } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (perfil?.role !== 'super_admin') {
      return { error: 'Solo un super admin puede cambiar el rol de una cuenta.' }
    }

    if (!ROLES_VALIDOS.includes(role as (typeof ROLES_VALIDOS)[number])) {
      return { error: 'Ese rol no existe.' }
    }

    // Quitarse a uno mismo el super admin deja el sistema sin quien reparta
    // permisos, y recuperarlo obliga a entrar por SQL.
    if (userId === user.id && role !== 'super_admin') {
      return { error: 'No puedes quitarte a ti mismo el rol de super admin.' }
    }

    // Verificado el permiso, se escribe con el cliente de servicio, que es
    // el mismo patron que ya usa /api/admin/invite.
    const service = createServiceClient()
    const { error } = await service.from('profiles').update({ role }).eq('id', userId)
    if (error) return { error: error.message }

    revalidatePath('/usuarios')
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}
