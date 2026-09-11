import Link from 'next/link'

// No existe, o existe y no es tuya. La RLS no distingue las dos cosas a
// propósito: decirle a alguien "existe pero no tienes acceso" le confirma que
// existe, y eso ya es información. Así que el texto no finge saber cuál de
// las dos es.
//
// Lo que sí hace es no dejar a nadie en un callejón: dice qué hacer.
export default function SinAcceso() {
  return (
    <main className="max-w-[520px] mx-auto px-6 py-24">
      <div className="cejilla">PersonaLab</div>
      <h1 className="display text-[30px] md:text-[36px] text-dom mt-3">
        Esta experiencia no está en tu cuenta
      </h1>
      <p className="mt-5 text-[16px] leading-[1.6] font-light text-ink/90">
        Puede que hayas entrado con un correo distinto al que usaste para
        comprarla, o que el enlace apunte a otra cosa.
      </p>
      <p className="mt-4 text-[15px] leading-[1.6] text-gray-ui">
        Si compraste y no la ves aquí, escríbenos y lo resolvemos. Tu compra no
        se pierde.
      </p>
      <Link
        href="/"
        className="inline-flex items-center mt-8 text-[15px] text-dom underline underline-offset-4 hover:opacity-80"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
