import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { H1 } from '@/lib/estilos/oficina'

// Panel de la casa: desde aqui se entra a cualquiera de los dos workspaces.
// Vive dentro del grupo (admin), asi que ya queda protegido por su layout,
// que exige rol super_admin, admin o staff.
//
// HASTA HOY, ESTA PANTALLA MENTIA. Solo mostraba la tarjeta de PersonaLab a
// `super_admin`, con un mensaje que le decia a cualquier otro rol "pidesela
// a un super admin" -- pero `(admin)/personalab/layout.tsx` (la puerta real,
// la que de verdad importa) ya admite a `super_admin`, `admin` Y `staff`
// desde la Etapa 6a, la misma definicion de equipo que usa el resto del
// portal. Encontrado probando en vivo, no leyendo: una cuenta de prueba con
// rol `staff` entraba sin problema a `/personalab` escribiendo la URL
// directo, mientras esta pantalla le habria dicho que no podia. Caso real:
// Patricia (`staff`) reporto no tener acceso a PersonaLab: si tenia acceso,
// esta pantalla se lo escondia y la mandaba a pedirlo de nuevo. Se corrige
// para que las dos puertas digan lo mismo.

// CADA TARJETA LLEVA SU PROPIA CLASE DE MARCA, Y ESO ES TODO EL MECANISMO.
//
// Antes cada marca traia tres valores escritos a mano: un hex, un rgba de
// tinte y un rgba de borde, seis en total, aplicados con `style={{}}`. Eso es
// exactamente el mecanismo que llevo el dorado #C9A96E a 67 apariciones sin
// que nadie lo decidiera: cuando el color se escribe en la pantalla, la
// pantalla siguiente lo copia y lo desvia un poco.
//
// Ahora la tarjeta se pinta sola: dentro de `marca-trascendencia`, `text-dom`
// es vino; dentro de `marca-personalab`, teal. Las clases son identicas en
// las dos y no hay un solo color escrito aqui. El dia que entre una tercera
// marca, se agrega su clase en `app/marca.css` y esta pagina no se toca.
//
// Esta es ademas la unica pagina del portal donde las dos dominancias se ven
// una al lado de la otra, asi que es donde el codigo de color se aprende.
interface Marca {
  id: string
  nombre: string
  descripcion: string
  href: string
  /** Clase de dominancia de `app/marca.css`. Decide de que color es la tarjeta. */
  marca: string
  /** Wordmark en blanco, recortado a su caja de contenido real (ver el
   *  script que lo generó, más abajo). Vive sobre una ficha de
   *  `--dom-deep`, nunca sobre el tinte claro de la tarjeta: ninguna de
   *  las dos marcas tiene una versión oscura del wordmark, solo blanca. */
  logo: string
  logoRatio: number
}

const MARCAS: Marca[] = [
  {
    id: 'trascendencia',
    nombre: 'Trascendencia',
    descripcion: 'Retiros familiares. Eventos, familias, acuerdos, itinerario y operación del día.',
    href: '/hoy',
    marca: 'marca-trascendencia',
    logo: '/logo-trascendencia-wht.png',
    logoRatio: 7142 / 1020,
  },
  {
    id: 'personalab',
    nombre: 'PersonaLab',
    descripcion: 'Experiencias para foros. Catálogo, encuentros, grupos y moderadores.',
    href: '/personalab',
    marca: 'marca-personalab',
    logo: '/logo-personalab-wht.png',
    logoRatio: 4673 / 711,
  },
]

export default async function WorkspacesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  // MISMO CONJUNTO QUE `(admin)/personalab/layout.tsx: ROLES_CON_ACCESO`,
  // a propósito -- es la puerta que de verdad decide, esta pantalla solo
  // la describe. Si ese archivo cambia, este debe cambiar con él.
  const puedePersonaLab = ['super_admin', 'admin', 'staff'].includes(profile?.role ?? '')
  const visibles = puedePersonaLab ? MARCAS : MARCAS.filter(m => m.id === 'trascendencia')
  const nombre = profile?.full_name?.split(' ')[0]

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="mb-10">
        <p className="text-sm text-gray-ui">
          {nombre ? `Hola, ${nombre}.` : 'Hola.'}
        </p>
        <h1 className={`${H1} mt-1`}>
          Inicio
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibles.map(m => (
          <Link
            key={m.id}
            href={m.href}
            className={
              `${m.marca} block rounded-marca p-6 bg-dom/[0.06] border border-dom/30 ` +
              'transition-all hover:bg-dom/10 hover:border-dom/50 ' +
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom ' +
              'focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2'
            }
          >
            {/* Ficha de `--dom-deep`, no el tinte claro de la tarjeta: el
                wordmark de las dos marcas solo existe en blanco, y blanco
                sobre `bg-dom/[0.06]` (prácticamente el papel) no se leería.
                Medido, no estimado: blanco sobre `--dom-deep` da 14.8:1 en
                vino y 13.7:1 en teal, muy por encima del 3:1 que pide WCAG
                para un logotipo (se trata como imagen de marca, no como
                texto de lectura). */}
            <div className="inline-flex bg-dom-deep rounded-marca px-4 py-3 mb-4">
              <Image
                src={m.logo}
                alt={m.nombre}
                width={Math.round(m.logoRatio * 100)}
                height={100}
                className="h-6 w-auto"
                priority
              />
            </div>
            <p className="text-sm text-ink leading-relaxed">{m.descripcion}</p>
            <div className="mt-5 pt-4 border-t border-dom/30 text-xs font-medium text-dom">
              Entrar →
            </div>
          </Link>
        ))}
      </div>

      {/* Era `text-slate-400`: 2.45 sobre el fondo. Es la unica explicacion de
          por que aqui solo se ve una marca, o sea la respuesta a la pregunta
          que la pantalla provoca. `gray-ui` da 4.52 sobre el suelo. */}
      {!puedePersonaLab && (
        <p className="text-xs text-gray-ui mt-8 leading-relaxed max-w-[60ch]">
          Si necesitas acceso a PersonaLab, pídeselo a un super admin. Los permisos por marca todavía no
          están seccionados: hoy el rol es global y se está trabajando en separarlo.
        </p>
      )}
    </div>
  )
}
