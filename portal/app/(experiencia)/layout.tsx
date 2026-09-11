import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopNav from './TopNav'

// ── EL LECTOR ───────────────────────────────────────────────────
//
// Donde vive la persona que compró una experiencia digital y la está
// atravesando. No es el back office y no es la app de Trascendencia: es un
// tercer territorio, con su propia marca.
//
// POR QUÉ NO CUELGA DE `(admin)/personalab`. Ese árbol exige `super_admin`.
// Quien compra el producto no es del equipo, así que no puede entrar ahí ni
// debería. Y tampoco cuelga de `(participant)`, que es Trascendencia y pinta
// vino: esto es PersonaLab y domina en teal.
//
// `marca-personalab` fija la dominancia para todo el árbol: aquí `bg-dom-deep`
// pinta teal, y no hay que declararlo en cada pantalla.

export default async function LectorLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sin sesión no hay nada que mostrar, porque la RLS no devolvería un solo
  // bloque. Se manda a entrar, que es cierto, y no a una pantalla de error.
  if (!user) redirect('/login')

  return (
    <div className="marca-personalab min-h-screen bg-paper">
      <TopNav />
      {children}
    </div>
  )
}
