import type { User } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/server'

// ── TODOS LOS USUARIOS DE auth.users, SIN LÍMITE SILENCIOSO ────
//
// `service.auth.admin.listUsers()` sin argumentos pagina por 50, de fábrica
// (documentado en el propio paquete: GoTrueAdminApi.js, "Defaults to return
// 50 users per page"). Dos archivos lo llamaban cada uno por su cuenta, sin
// pasar página, y ninguno miraba si había una siguiente.
//
// Encontrado por Hugo en la Etapa 5, dos consecuencias concretas si algún
// día hay más de 50 cuentas:
//   - `usuarios/page.tsx`: alguien que sí inició sesión, pero cuyo id cae en
//     una página que nunca se pidió, se vería con el badge falso "Nunca ha
//     iniciado sesión".
//   - `invite/route.ts`: si el correo buscado en la rama "ya existía" no
//     está en los primeros 50, la búsqueda no lo encuentra, y la ruta
//     responde éxito sin haber hecho nada. Es la misma forma exacta del
//     incidente que este mismo día se cerró en otro lado: éxito falso por
//     no revisar un límite que sí existe.
//
// Se resuelve una vez, aquí, y los dos archivos usan esto en vez de llamar
// `listUsers()` por su cuenta.

const TOPE_DE_PAGINAS = 40 // 40 x 200 = 8000 cuentas. Una valvula de
// seguridad, no una expectativa: si algun dia el portal tiene miles de
// cuentas, esta funcion necesita repensarse (buscar por correo en vez de
// traer todo), no seguir subiendo este numero.

export async function todosLosUsuariosDeAuth() {
  const service = createServiceClient()
  const todos: User[] = []

  let pagina = 1
  for (; pagina <= TOPE_DE_PAGINAS; pagina++) {
    const { data, error } = await service.auth.admin.listUsers({ page: pagina, perPage: 200 })
    if (error) throw error

    todos.push(...data.users)

    // `nextPage` viene null cuando no hay mas. Tambien se corta si la
    // pagina vino mas corta que lo pedido, por si el campo de paginacion no
    // llegara a existir en la respuesta.
    if (!data.nextPage || data.users.length < 200) break
  }

  return todos
}
