import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PersonaLabNav from './PersonaLabNav'

// El workspace de PersonaLab, ya dentro del portal.
//
// El layout de (admin) ya exigio sesion y rol de equipo, y ya puso la barra
// superior y el fondo. Aqui solo falta la puerta de MARCA, que es distinta
// de la puerta de equipo: ser staff de Trascendencia no deberia dar acceso
// a PersonaLab.
//
// POR QUE SOLO SUPER ADMIN, POR AHORA. El rol es un campo unico y global en
// profiles: no existe todavia "staff de PersonaLab". Hasta que el frente de
// identidad separe los permisos por marca, la unica regla que no se
// equivoca es la mas cerrada. Es la misma que ya aplica el selector de
// workspaces, y se ensancha cambiando esta linea.
const ROLES_CON_ACCESO = ['super_admin']

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
      <PersonaLabNav />
      <div className="max-w-[1200px] mx-auto px-6 py-8">{children}</div>
    </div>
  )
}
