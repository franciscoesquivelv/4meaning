// ── ESTADOS DE ENTREGA ──────────────────────────────────────────
// El Storybook y el Video Narrado, que son los dos objetos que la familia
// se lleva del retiro.
//
// POR QUE ESTE ARCHIVO EXISTE. Durante meses el admin escribio 'entregado'
// y la pantalla del participante comparo contra 'delivered'. Las dos ramas
// del participante eran inalcanzables, asi que ninguna pareja vio nunca que
// su Storybook estaba listo: siempre decia "Pendiente", aunque el libro ya
// estuviera en sus manos.
//
// Nadie lo noto porque los dos lados se escribieron por separado y nada los
// obligaba a coincidir. Ahora los dos importan de aqui, y el CHECK de la
// base (migrations/002_phase1_pipeline.sql) es la misma lista.

export const ESTADOS_ENTREGA = ['pendiente', 'en_produccion', 'entregado'] as const

export type EstadoEntrega = (typeof ESTADOS_ENTREGA)[number]

export const ETIQUETA_ENTREGA: Record<EstadoEntrega, string> = {
  pendiente: 'Pendiente',
  en_produccion: 'En proceso',
  entregado: 'Entregado',
}

// Normaliza lo que venga de la base. Devuelve null si el valor no es uno de
// los tres: asi un dato viejo o corrupto no se pinta como "Pendiente", que
// es justo el error que se acaba de corregir. Un estado desconocido no se
// muestra, y eso se nota.
export function estadoEntrega(valor: string | null | undefined): EstadoEntrega | null {
  if (!valor) return null
  return (ESTADOS_ENTREGA as readonly string[]).includes(valor)
    ? (valor as EstadoEntrega)
    : null
}

export function estaEntregado(valor: string | null | undefined): boolean {
  return estadoEntrega(valor) === 'entregado'
}
