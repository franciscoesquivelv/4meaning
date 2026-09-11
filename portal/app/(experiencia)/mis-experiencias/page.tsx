import Link from 'next/link'
import { misExperiencias } from '@/lib/personalab/cuenta'
import Fallo from '../experiencia/Fallo'

// La casa del cliente. Lo primero que ve al entrar, y a lo que vuelve cada
// vez: qué compró y por dónde seguir.

export default async function MisExperiencias() {
  const r = await misExperiencias()

  if (r.estado === 'fallo') return <Fallo motivo={r.motivo} />
  // 'sin-acceso' no puede pasar aquí: llegar a esta ruta ya exigió sesión en
  // el layout. Si pasara, es un estado que no debería existir y se trata
  // como fallo, no se esconde.
  if (r.estado === 'sin-acceso') return <Fallo motivo="sin sesión al listar experiencias" />

  const experiencias = r.datos

  return (
    <main className="max-w-[620px] mx-auto px-6 py-14 md:py-20">
      <h1 className="display text-[32px] md:text-[42px] text-dom">
        Tus experiencias
      </h1>

      {experiencias.length === 0 ? (
        // NO ES UN ERROR: es lo que ve cualquiera que todavía no compró
        // nada, o cuya compra todavía no se conectó a esta cuenta. Las dos
        // cosas se resuelven igual, escribiéndonos.
        <div className="mt-10 border border-line rounded-xl p-8 text-center">
          <p className="text-[16px] leading-[1.6] font-light text-ink/90">
            Todavía no tienes ninguna experiencia en tu cuenta.
          </p>
          <p className="mt-3 text-[14px] leading-[1.6] text-gray-ui">
            Si ya compraste una y no la ves aquí, escríbenos y la
            conectamos a esta cuenta.
          </p>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {experiencias.map(e => (
            <li key={e.slug}>
              <Link
                href={`/experiencia/${e.slug}`}
                className="block border border-line rounded-xl p-6 hover:border-dom transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom"
              >
                <div className="text-[19px] font-light text-ink">{e.nombre}</div>
                {e.subtitulo && (
                  <div className="mt-1 text-[14px] text-gray-ui">{e.subtitulo}</div>
                )}
                {e.duracion && (
                  <div className="mt-3 text-[12px] uppercase tracking-wider text-terra-ui">
                    {e.duracion}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
