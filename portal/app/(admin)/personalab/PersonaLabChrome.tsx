'use client'

import { usePathname } from 'next/navigation'
import PersonaLabNav from './PersonaLabNav'
import { enModoEditor } from '@/lib/personalab/modoEditor'

// MISMO MECANISMO QUE AdminChrome, UN NIVEL ABAJO. En modo editor tampoco
// hay pestañas de PersonaLab ni el contenedor de 1200px que las acompaña --
// el editor ya administra su propio ancho completo (ver el comentario
// grande al principio de Editor.tsx). `children` se entrega SIN envoltorio
// cuando la ruta es la del editor: no hay nada de qué escapar desde adentro.
export default function PersonaLabChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const modoEditor = enModoEditor(pathname)

  if (modoEditor) return <>{children}</>

  return (
    <>
      <PersonaLabNav />
      <div className="max-w-[1200px] mx-auto px-6 py-8">{children}</div>
    </>
  )
}
