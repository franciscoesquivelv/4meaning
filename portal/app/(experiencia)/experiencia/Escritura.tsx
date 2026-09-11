'use client'

import { useEffect, useRef, useState } from 'react'

// ── DONDE SE ESCRIBE ────────────────────────────────────────────
//
// Una consigna con su espacio para responder. En la sala la consigna se dice
// en voz alta y la persona escribe en papel; en pantalla lleva dónde.
//
// NO SE GUARDA EN NINGUNA TABLA, Y ESA ES LA DECISIÓN, NO UN ATAJO.
// Francisco lo fijó el 2026-09-10: lo que la persona escribe no se persiste.
// Vive en `sessionStorage`, que es del navegador y de esta pestaña, y se va
// cuando la cierra. Al terminar la experiencia puede pedir que se lo mandemos
// por correo, y en ese momento (y solo en ese) el texto sale del navegador.
//
// Por qué `sessionStorage` y no `localStorage`: localStorage sobrevive a
// cerrar el navegador y quedaría ahí semanas, en un equipo que puede ser
// compartido, con lo más íntimo que esa persona escribió. sessionStorage se
// borra al cerrar la pestaña. La promesa es "no se guarda", y el
// almacenamiento tiene que parecerse a la promesa.
//
// El costo, dicho y no escondido: si cierra la pestaña a media experiencia,
// lo escrito se pierde. Por eso se avisa antes de que pase, no después.

const PREFIJO = 'pl.escritura.'

export default function Escritura({
  bloqueId,
  consigna,
}: {
  bloqueId: string
  consigna: string
}) {
  const [texto, setTexto] = useState('')
  const [listo, setListo] = useState(false)
  const area = useRef<HTMLTextAreaElement>(null)

  // Se lee una vez, al montar. Antes de eso el textarea va vacío y sin
  // habilitar, para que nadie empiece a escribir sobre algo que está a punto
  // de ser reemplazado por lo que ya había.
  useEffect(() => {
    try {
      setTexto(sessionStorage.getItem(PREFIJO + bloqueId) ?? '')
    } catch {
      // Navegador con el almacenamiento bloqueado. Se escribe igual, solo que
      // no sobrevive a cambiar de pantalla. Mejor eso que no dejar escribir.
    }
    setListo(true)
  }, [bloqueId])

  // Crece con lo que se escribe. Una caja de tamaño fijo con barra de scroll
  // le dice a alguien cuánto se espera que escriba, y aquí no se espera una
  // cantidad.
  useEffect(() => {
    const el = area.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [texto])

  function guardar(v: string) {
    setTexto(v)
    try {
      if (v.trim()) sessionStorage.setItem(PREFIJO + bloqueId, v)
      else sessionStorage.removeItem(PREFIJO + bloqueId)
    } catch { /* ver arriba */ }
  }

  return (
    <div className="mt-8 md:mt-10 border-t border-b border-line py-6 md:py-7">
      <div className="cejilla">Consigna</div>

      <p className="mt-3 text-[19px] md:text-[21px] leading-[1.55] font-light text-dom">
        {consigna}
      </p>

      <textarea
        ref={area}
        value={texto}
        onChange={e => guardar(e.target.value)}
        disabled={!listo}
        rows={4}
        placeholder="Escribe aquí. O no: también se puede seguir sin escribir."
        aria-label="Tu respuesta"
        className="mt-5 w-full resize-none bg-transparent border-0 border-b border-line focus:border-dom outline-none text-[17px] leading-[1.7] font-light text-ink placeholder:text-gray-ui/70 pb-2 transition-colors"
      />

      {/* El permiso de no escribir, dicho en el sitio donde se ejerce.
          Sora lo dejó escrito para la sala: el permiso de quedarse en la
          superficie hay que ofrecerlo A MITAD y no solo en la entrada, y sin
          el cuerpo del facilitador que lo modele, aquí tiene que ir por
          escrito. Parar también es haber terminado. */}
      <p className="mt-3 text-[13px] leading-[1.5] text-gray-ui">
        Lo que escribas se queda en tu navegador. No lo guardamos, no lo
        leemos, y al final vas a poder pedir que te lo mandemos a tu correo.
      </p>
    </div>
  )
}
