'use client'

import { usePathname } from 'next/navigation'
import AdminTopNav from './AdminTopNav'
import { SUELO } from '@/lib/estilos/oficina'
import { enModoEditor } from '@/lib/personalab/modoEditor'

// SEPARADO DE AdminTopNav A PROPÓSITO. El `pt-14` de `<main>` existe SOLO
// para reservar el alto de la barra fija de arriba (`BARRA_CASA`, h-14): las
// dos tienen que apagarse juntas, o el modo editor deja un hueco de 56px en
// blanco justo donde la barra ya no está. Ver `enModoEditor`.
export default function AdminChrome({
  userEmail, children,
}: { userEmail: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const modoEditor = enModoEditor(pathname)

  return (
    <>
      {!modoEditor && <AdminTopNav userEmail={userEmail} />}
      <main className={`${modoEditor ? '' : 'pt-14'} ${SUELO}`}>
        {children}
      </main>
    </>
  )
}
