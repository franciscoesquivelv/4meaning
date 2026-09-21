import Link from 'next/link'

// LA COMPRA ES REAL. LO QUE FALTA ES CONTENIDO, NO ACCESO.
//
// Antes esto caía en `SinAcceso`, cuyo texto ("puede que hayas entrado con
// un correo distinto... o que el enlace apunte a otra cosa") le dice a
// alguien que SÍ compró esto que tal vez se equivocó de cuenta — falso, y
// una mala primera impresión sobre algo que ya pagó. Llegar a esta pantalla
// (ver `lectura.ts#cargarExperiencia`) ya cruzó la RLS que exige un grant
// vivo: quien la ve, compró. Hallazgo de Hugo.
export default function SinContenido() {
  return (
    <main className="max-w-[520px] mx-auto px-6 py-24">
      <div className="cejilla">PersonaLab</div>
      <h1 className="display text-[30px] md:text-[36px] text-dom mt-3">
        Todavía no hay nada que leer aquí
      </h1>
      <p className="mt-5 text-[16px] leading-[1.6] font-light text-ink/90">
        Ya tienes acceso a esta experiencia. Lo que falta es que el equipo
        publique su contenido.
      </p>
      <p className="mt-4 text-[15px] leading-[1.6] text-gray-ui">
        No hiciste nada mal, y tu compra no se pierde. Vuelve en unos días.
      </p>
      <Link
        href="/mis-experiencias"
        className="inline-flex items-center mt-8 text-[15px] text-dom underline underline-offset-4 hover:opacity-80"
      >
        Ver mis experiencias
      </Link>
    </main>
  )
}
