import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminTopNav from '@/components/AdminTopNav'
import ToastProvider from '@/components/ToastProvider'
import { SUELO } from '@/lib/estilos/oficina'

// ── EL CHASIS DEL BACK OFFICE ───────────────────────────────────
//
// Este archivo decide de que color es el suelo de las 89 pantallas de
// trabajo, y hasta hoy lo decidia sin darse cuenta: `bg-slate-50`, que es el
// gris azulado de fabrica de Tailwind.
//
// Medido en grados de tono: slate-50 (#F8FAFC) esta en 210 y el papel de la
// marca (#F6EEE3) en 35. 175 grados, practicamente opuestos. El filete
// repetia el defecto con 180. O sea que la superficie base de todo el
// trabajo interno tenia la temperatura invertida respecto de la marca.
//
// Cambiarlo AQUI, y no pantalla por pantalla, es lo que hace que las 89
// hereden el fondo correcto sin tocar ninguna. Es reversible de un commit.
//
// `marca-trascendencia` fija la DOMINANCIA de todo el arbol: dentro de esta
// clase, `bg-dom` y `text-dom` pintan vino. El workspace de PersonaLab la
// sobreescribe con `marca-personalab` en su propio layout, y a partir de ahi
// las mismas clases pintan teal. Ninguna pantalla declara su color.

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) {
    redirect('/mi-retiro')
  }

  return (
    <div className="marca-trascendencia">
      <AdminTopNav userEmail={user.email ?? ''} />
      <ToastProvider>
        <main className={`pt-14 ${SUELO}`}>
          {children}
        </main>
      </ToastProvider>
    </div>
  )
}
