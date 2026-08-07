'use client'

import { BLOQUES, type Bloque, type TipoBloque, type Audiencia } from './contenido'

// Almacen del prototipo. Persiste en localStorage para que el guardado de
// borrador sea real y no un letrero: puedes escribir, cerrar la pestana y
// volver. Cuando llegue Supabase solo se cambia el adaptador de aqui
// adentro; los tipos y la interfaz no se mueven.

const LLAVE = 'personalab.borrador.v1'

export type EstadoGuardado = 'limpio' | 'pendiente' | 'guardando' | 'guardado' | 'error'

export function cargar(): Bloque[] {
  if (typeof window === 'undefined') return BLOQUES
  try {
    const crudo = window.localStorage.getItem(LLAVE)
    if (!crudo) return BLOQUES
    const datos = JSON.parse(crudo)
    return Array.isArray(datos) && datos.length > 0 ? (datos as Bloque[]) : BLOQUES
  } catch {
    return BLOQUES
  }
}

export function guardar(bloques: Bloque[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LLAVE, JSON.stringify(bloques))
}

export function descartarBorrador(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(LLAVE)
}

export function hayBorrador(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(LLAVE) !== null
}

// ── Operaciones sobre la lista ──────────────────────────────────

let contador = 0
function nuevoId() {
  contador += 1
  return `n${Date.now().toString(36)}${contador}`
}

export function bloqueNuevo(bisagraId: string, tipo: TipoBloque, orden: number): Bloque {
  const base: Bloque = { id: nuevoId(), bisagraId, orden, tipo, audiencia: 'todos' }
  switch (tipo) {
    case 'nota':
      return { ...base, audiencia: 'moderador', texto: '' }
    case 'archivo':
      return { ...base, audiencia: 'moderador', nombreArchivo: '', descargable: true, pie: '' }
    case 'pausa':
      return base
    case 'cita':
      return { ...base, texto: '', autor: '' }
    case 'objeto':
      return { ...base, texto: '', pie: '' }
    case 'imagen':
    case 'video':
      return { ...base, pie: '' }
    default:
      return { ...base, texto: '' }
  }
}

export function reordenar(bloques: Bloque[], bisagraId: string, id: string, delta: number): Bloque[] {
  const dentro = bloques
    .filter(b => b.bisagraId === bisagraId)
    .sort((a, b) => a.orden - b.orden)
  const i = dentro.findIndex(b => b.id === id)
  const j = i + delta
  if (i < 0 || j < 0 || j >= dentro.length) return bloques

  const copia = [...dentro]
  const [movido] = copia.splice(i, 1)
  copia.splice(j, 0, movido)
  const ordenes = new Map(copia.map((b, k) => [b.id, k + 1]))

  return bloques.map(b => (ordenes.has(b.id) ? { ...b, orden: ordenes.get(b.id)! } : b))
}

export function cambiarAudiencia(tipo: TipoBloque, audiencia: Audiencia): Audiencia {
  // Una nota nunca puede ser publica: es su definicion.
  if (tipo === 'nota') return 'moderador'
  return audiencia
}
