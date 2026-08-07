import PersonaLabNav from './PersonaLabNav'
import { PAGINA } from './tokens'

// Calcado de app/(admin)/layout.tsx:22-31: barra superior mas main sobre
// slate-50. Sin barra lateral, que era el error de forma del prototipo.

export default function PersonaLabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={PAGINA}>
      <PersonaLabNav />
      <main className="max-w-[1200px] mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
