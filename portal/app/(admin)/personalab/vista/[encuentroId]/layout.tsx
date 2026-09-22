import Link from 'next/link'

// La vista del participante, vista desde dentro del portal.
//
// ANTES ERA UNA URL PUBLICA (/prototipo/lector). Cualquiera con el enlace
// leia el contenido de una experiencia sin sesion. Ahora vive detras del
// gate, y por eso deja de ser "el lector" para ser lo que de verdad es: una
// PREVIA que mira el equipo, con datos de muestra de `dominio.ts`/
// `contenido.ts`. El lector real del participante YA EXISTE, en
// app/(experiencia)/experiencia/[slug]/ -- gateado por sesion y por grant
// real, no por esta previa. Las dos rutas comparten el mismo `BloqueLector`
// (Bloques.tsx), así que un bloque se ve igual en las dos; el encabezado,
// el pie y la paleta de esta previa NO son los de la ruta real (hallazgo
// de Julian y Claude, 2026-09-21, docs/PENDIENTES.md P-009).
//
// Se enmarca en vez de ocupar la pantalla entera: dentro del portal, una
// pantalla que finge ser el telefono de otra persona confunde sobre quien
// esta mirando. El marco lo dice.

export default function VistaLayout({
  children, params,
}: {
  children: React.ReactNode
  params: { encuentroId: string }
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
          href={`/personalab/encuentros/${params.encuentroId}`}
          className="text-xs text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap flex-shrink-0 underline underline-offset-2"
        >
          Volver al encuentro
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
