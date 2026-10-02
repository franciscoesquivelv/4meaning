// LA MISMA ATMÓSFERA DEL LECTOR REAL, ADAPTADA A UN PANEL CHICO, NO A LA
// PANTALLA ENTERA. Pedido de Francisco, 2026-10-02: "en el preview, se ve
// el contenido demasiado delgado, como si estuviese hecho para mobile."
// La respuesta NO es ensanchar la columna de 620px -- esa cifra la midió
// Julian contra el bloque `texto` real (67 caracteres por línea, dentro
// del óptimo 45-75; P-013, ver `AtmosferaLectura.tsx`), y ensancharla
// rompe esa medida en vez de mejorar algo. El lector real YA resuelve
// "que no se sienta como mobile en escritorio" con un degradado ambiental
// alrededor de la columna (`AtmosferaLectura.tsx`), nunca tocando la
// columna. Confirmado en vivo con una cuenta de prueba y un grant real
// (revocado después): el degradado SÍ está activo y SÍ se ve. Francisco,
// con ese hallazgo sobre la mesa, decidió: "dejar la columna en 620px...
// si el editor y mi preview ya tienen el mismo degradado ambiental".
//
// POR QUÉ NO ES EL MISMO COMPONENTE, SOLO IMPORTADO. `AtmosferaLectura`
// usa `fixed inset-[-20%]`, posicionado contra la VENTANA completa --
// correcto para una página entera, pero en el panel del editor (una
// tarjeta embebida, no una página) un `fixed` se saldría de la tarjeta y
// taparía el riel y el lienzo de al lado. Aquí es `absolute`, contra el
// propio contenedor (que ya es `relative overflow-hidden` en los dos
// lugares que lo usan), con blobs más chicos -- el panel mismo es mucho
// más chico que una ventana completa, los mismos 560px/120px de blur se
// habrían comido el panel entero en vez de decorar sus márgenes.
export default function AtmosferaVistaPrevia() {
  return (
    <div className="absolute inset-[-20%] blur-[70px] pointer-events-none overflow-hidden" aria-hidden="true">
      <span
        className="absolute w-[320px] h-[320px] rounded-full top-[8%] left-[2%]"
        style={{ background: 'radial-gradient(circle, var(--teal-2), transparent 70%)', opacity: 0.16 }}
      />
      <span
        className="absolute w-[280px] h-[280px] rounded-full bottom-[12%] right-[3%]"
        style={{ background: 'radial-gradient(circle, var(--wine-2), transparent 70%)', opacity: 0.09 }}
      />
      <span
        className="absolute w-[230px] h-[230px] rounded-full top-[40%] right-[1%]"
        style={{ background: 'radial-gradient(circle, var(--terra), transparent 68%)', opacity: 0.08 }}
      />
      <span
        className="absolute w-[170px] h-[170px] rounded-full bottom-[4%] left-[6%]"
        style={{ background: 'radial-gradient(circle, var(--gold), transparent 72%)', opacity: 0.04 }}
      />
    </div>
  )
}
