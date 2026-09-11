// ── A DÓNDE VA CADA QUIEN AL ENTRAR ─────────────────────────────
//
// Existía en dos sitios y decía dos cosas distintas.
//
// `app/page.tsx` sabía la regla completa. Pero el FALLO de `(admin)/layout.tsx`
// mandaba a cualquiera que no fuera del equipo a `/mi-retiro`, sin mirar su
// rol, y el FALLO de `(participant)/layout.tsx` mandaba a cualquiera que no
// fuera participante o equipo a `/login`, CON LA SESIÓN ABIERTA. Un cliente
// de PersonaLab (rol 'individual', que no existía hasta hoy) entraba, la
// raíz lo mandaba a `/hoy` por no ser 'participant', `/hoy` lo rebotaba a
// `/mi-retiro` por no ser del equipo, y `/mi-retiro` lo rebotaba a `/login`
// estando ya autenticado. Tres saltos para terminar donde empezó, mintiendo
// que no había iniciado sesión.
//
// Una sola función, y cada layout la usa tanto para la raíz como para su
// propio fallo. Si mañana se agrega un rol, se agrega aquí una vez.

export type Rol = 'participant' | 'individual' | 'super_admin' | 'admin' | 'staff'

export function inicioDe(role: string | null | undefined): string {
  switch (role) {
    case 'participant':
      return '/mi-retiro'
    case 'individual':
      return '/mis-experiencias'
    case 'super_admin':
    case 'admin':
    case 'staff':
      return '/hoy'
    default:
      // Sin perfil reconocible no hay a dónde mandarlo que no sea
      // preguntarle quién es. Este es el único caso legítimo de /login
      // para alguien que ya tiene sesión.
      return '/login'
  }
}
