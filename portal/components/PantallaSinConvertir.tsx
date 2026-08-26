// ── ANDAMIO TEMPORAL ────────────────────────────────────────────
// Las pantallas del participante se están convirtiendo a los tokens de
// marca una por una. Las que todavía no se han convertido siguen escritas
// con el negro #0C0C0C y el crema #F5F0E8 que traía el layout, y ninguno
// de los dos está en la paleta de 4 Meaning.
//
// Al sacar esos colores del layout compartido (que era lo que permitía
// convertir de a una), estas pantallas se habrían quedado con texto claro
// sobre fondo claro. Este componente les devuelve su fondo mientras les
// toca su turno.
//
// SE BORRA cuando la última pantalla esté convertida. Si este archivo
// sigue existiendo, quedan pantallas fuera de marca: sirve de recordatorio
// contable, no solo de parche.

export default function PantallaSinConvertir({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0C0C0C] text-[#F5F0E8] min-h-screen -mb-24 pb-24">
      {children}
    </div>
  )
}
