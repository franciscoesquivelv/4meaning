// ── ¿YA TERMINÓ EL RETIRO? ──────────────────────────────────────
//
// POR QUE ESTE ARCHIVO EXISTE. `events.fecha_fin` es una columna `date`, o
// sea el texto "2026-03-15" sin hora y sin zona. `new Date("2026-03-15")` lo
// interpreta como medianoche UTC, que en la sede son las 18:00 del dia 14.
// Con esa cuenta, `/compromisos` se abria la tarde del dia ANTERIOR al
// cierre, con la pareja todavia en la sala. La app le decia "el retiro ya
// concluyo" a alguien que estaba sentado adentro.
//
// El retiro termina cuando termina su ultimo dia en el reloj de quien lo
// vive. Las sedes de Trascendencia estan en UTC-6 (Ciudad de Mexico,
// Antigua, Guatemala, San Salvador) y Mexico ya no cambia de horario, asi
// que el desfase es fijo. Si algun dia hay retiro fuera de ese huso, esta
// constante deja de alcanzar y el evento va a necesitar su propia zona.
const HUSO_SEDE = '-06:00'

export function finDelRetiro(fechaFin: string | null | undefined): Date | null {
  if (!fechaFin) return null
  // Una fecha que ya trae hora se respeta tal cual; una fecha suelta se cierra
  // al final de su dia en la sede.
  const texto = fechaFin.includes('T') ? fechaFin : `${fechaFin}T23:59:59${HUSO_SEDE}`
  const d = new Date(texto)
  return Number.isNaN(d.getTime()) ? null : d
}

export function retiroTerminado(
  fechaFin: string | null | undefined,
  ahora: Date = new Date()
): boolean {
  const fin = finDelRetiro(fechaFin)
  return fin !== null && fin.getTime() < ahora.getTime()
}
