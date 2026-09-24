import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PersonaLabChrome from './PersonaLabChrome'

// El workspace de PersonaLab, ya dentro del portal.
//
// El layout de (admin) ya exigio sesion y rol de equipo, y ya puso la barra
// superior y el fondo. Aqui solo falta la puerta de MARCA, que es distinta
// de la puerta de equipo: ser staff de Trascendencia no deberia dar acceso
// a PersonaLab.
//
// YA NO SOLO SUPER ADMIN. Hasta la Etapa 6a esta era la unica puerta del
// portal entero cerrada a `['super_admin']` en vez del equipo completo: en
// todos los demas lados (`(admin)/layout.tsx`, `exigirEquipo()`,
// `/usuarios`, las rutas de push) "equipo" es
// `['super_admin','admin','staff']`, y esta linea decia por escrito que
// era una excepcion "por ahora", no una regla aparte.
//
// Deja de sostenerse el dia que alguien real necesita entrar y no puede:
// Francisco confirmo que el onboarding de compradores de PersonaLab (la
// pantalla de Compras) lo va a operar tambien otra persona del equipo, sin
// que esa persona necesite ver el pago directamente. Con la puerta en
// `['super_admin']`, esa persona no podia entrar a NINGUNA pantalla de
// PersonaLab, ni siquiera a la que existe para que ella la use. Se ensancha
// a la misma definicion de equipo que ya usa el resto del portal; el dia
// que exista permiso por marca, esto se vuelve a angostar desde aqui.
const ROLES_CON_ACCESO = ['super_admin', 'admin', 'staff']

export default async function PersonaLabLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // A /workspaces, no a /login: quien llega aqui SI tiene sesion y SI es del
  // equipo. Mandarlo al login seria decirle que no esta identificado, que es
  // falso, y ademas lo dejaria dando vueltas.
  if (!profile || !ROLES_CON_ACCESO.includes(profile.role)) {
    redirect('/workspaces')
  }

  // `marca-personalab` sobreescribe la dominancia que el layout de (admin)
  // fija en `marca-trascendencia`. A partir de aqui `bg-dom` y `text-dom`
  // pintan TEAL y no vino, y ninguna de las 29 pantallas de este arbol lo
  // declara: lo declara el layout de la marca, una vez.
  //
  // Medido el 2026-09-06, y es la razon de que esta linea exista: la clase
  // estaba definida en `app/marca.css:96` y aplicada CERO veces en todo el
  // repositorio. Este workspace y el de Trascendencia escribian la misma
  // cadena de color caracter por caracter, asi que cruzar de una marca a la
  // otra no cambiaba un solo pixel. El propio `tokens.ts:8` lo decia por
  // escrito: "El chasis es NEUTRO (escala slate), igual que Trascendencia".
  return (
    <div className="marca-personalab">
      <PersonaLabChrome>{children}</PersonaLabChrome>
    </div>
  )
}
