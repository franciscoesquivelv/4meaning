import Link from 'next/link'

// La vista del participante, vista desde dentro del portal.
//
// ANTES ERA UNA URL PUBLICA (/prototipo/lector). Cualquiera con el enlace
// leia el contenido de una experiencia sin sesion. Ahora vive detras del
// gate, y por eso deja de ser "el lector" para ser lo que de verdad es: una
// PREVIA que mira el equipo. El lector del participante llegara cuando los
// grants y la sesion de participante esten cableados, y entonces sera otra
// ruta con otra puerta.
//
// Se enmarca en vez de ocupar la pantalla entera: dentro del portal, una
// pantalla que finge ser el telefono de otra persona confunde sobre quien
// esta mirando. El marco lo dice.

export default function VistaLayout({
  children, params,
}: {
  children: React.ReactNode
  params: { corridaId: string }
}) {
  return (
    <div className="max-w-[560px] mx-auto">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Previa
          </div>
          <p className="text-sm text-slate-600 mt-0.5">
            Así se ve para quien entra a leer.
          </p>
        </div>
        <Link
          href={`/personalab/corridas/${params.corridaId}`}
          className="text-xs text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap flex-shrink-0 underline underline-offset-2"
        >
          Volver a la corrida
        </Link>
      </div>

      <div
        className="rounded-2xl border border-slate-200 overflow-hidden bg-[#FAF8F4] shadow-sm"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        {children}
      </div>
    </div>
  )
}
