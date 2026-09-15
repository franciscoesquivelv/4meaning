'use client'

import { useState } from 'react'

// LA "DESCARGAR" QUE NUNCA DESCARGABA NADA. `Bloques.tsx` pintaba esta
// etiqueta como un `<span>` sin `href` ni `onClick` — un rótulo, no un
// botón. Nadie, ni participante ni moderador, tenía cómo disparar
// `GET /medios/[id]?descargar=1` desde la pantalla; solo se llegaba ahí
// escribiendo la URL a mano. Hallazgo de Hugo, auditoría de UX/UI e
// interconectividad, 2026-09-15.
//
// Por qué es un componente aparte y no el botón inline en `Bloques.tsx`:
// ese archivo lo usa un Server Component (el lector real del participante),
// y un botón interactivo necesita su propio límite de Client Component.
// El resto del bloque de archivo se sigue pintando en el servidor; solo
// este botón cruza la frontera.
//
// Por qué `fetch` y no un `<a href>` directo: la ruta con `?descargar=1`
// responde JSON, no un redirect (`[id]/route.ts` lo explica: necesita
// devolver el nombre y confirmar que la bitácora se escribió antes de que
// el navegador se vaya). Se pide la URL firmada real y se navega a ella.
export default function BotonDescargar({ medioId }: { medioId: string }) {
  const [estado, setEstado] = useState<'listo' | 'pidiendo' | 'error'>('listo')

  async function descargar() {
    setEstado('pidiendo')
    try {
      const r = await fetch(`/api/personalab/medios/${medioId}?descargar=1`)
      if (!r.ok) throw new Error()
      const { url } = await r.json()
      window.location.href = url
      setEstado('listo')
    } catch {
      setEstado('error')
    }
  }

  return (
    <button
      onClick={descargar}
      disabled={estado === 'pidiendo'}
      className="text-[12px] font-medium text-[#8F5341] border border-[#E0CFC4] rounded-lg px-3 py-1.5 hover:bg-[#8F5341]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8F5341] disabled:opacity-60 transition-colors"
    >
      {estado === 'pidiendo' ? 'Un momento…' : estado === 'error' ? 'No se pudo. Reintentar' : 'Descargar'}
    </button>
  )
}
