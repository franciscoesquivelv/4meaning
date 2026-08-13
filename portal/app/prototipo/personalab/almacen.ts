'use client'

import { BLOQUES, type Bloque, type TipoBloque, type Audiencia } from './contenido'

// Almacen del prototipo. Persiste en localStorage para que el guardado de
// borrador sea real y no un letrero: puedes escribir, cerrar la pestana y
// volver. Cuando llegue Supabase solo se cambia el adaptador de aqui
// adentro; los tipos y la interfaz no se mueven.
//
// Dos copias, no una: lo PUBLICADO es lo que ve el participante, y el
// BORRADOR es donde se trabaja. Publicar copia borrador sobre publicado.
// Sin eso, editar seria editar en vivo encima de gente leyendo.

const LLAVE_BORRADOR = 'personalab.borrador.v1'
const LLAVE_PUBLICADO = 'personalab.publicado.v1'
const LLAVE_HISTORIAL = 'personalab.historial.v1'

export type EstadoGuardado = 'limpio' | 'pendiente' | 'guardando' | 'guardado' | 'error'

export interface Publicacion {
  numero: number
  fecha: string
  bloques: number
}

function leer(llave: string): Bloque[] | null {
  if (typeof window === 'undefined') return null
  try {
    const crudo = window.localStorage.getItem(llave)
    if (!crudo) return null
    const datos = JSON.parse(crudo)
    return Array.isArray(datos) ? (datos as Bloque[]) : null
  } catch {
    return null
  }
}

// ── Publicado ───────────────────────────────────────────────────

export function cargarPublicado(): Bloque[] {
  return leer(LLAVE_PUBLICADO) ?? BLOQUES
}

export function historial(): Publicacion[] {
  if (typeof window === 'undefined') return []
  try {
    const crudo = window.localStorage.getItem(LLAVE_HISTORIAL)
    if (!crudo) return [{ numero: 2, fecha: '2026-07-30', bloques: BLOQUES.length }]
    return JSON.parse(crudo) as Publicacion[]
  } catch {
    return []
  }
}

export function publicar(bloques: Bloque[], fechaISO: string): Publicacion {
  const previo = historial()
  const numero = (previo[0]?.numero ?? 0) + 1
  const entrada: Publicacion = { numero, fecha: fechaISO, bloques: bloques.length }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LLAVE_PUBLICADO, JSON.stringify(bloques))
    window.localStorage.setItem(LLAVE_HISTORIAL, JSON.stringify([entrada, ...previo]))
    // Publicar cierra el borrador: lo que sigue es lo publicado.
    window.localStorage.removeItem(LLAVE_BORRADOR)
  }
  return entrada
}

// ── Borrador ────────────────────────────────────────────────────

export function cargar(): Bloque[] {
  return leer(LLAVE_BORRADOR) ?? cargarPublicado()
}

export function guardar(bloques: Bloque[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LLAVE_BORRADOR, JSON.stringify(bloques))
}

export function descartarBorrador(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(LLAVE_BORRADOR)
}

export function hayBorrador(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(LLAVE_BORRADOR) !== null
}

// Cuantos bloques difieren entre borrador y publicado.
export function diferencias(): { nuevos: number; editados: number; quitados: number } {
  const b = cargar()
  const p = cargarPublicado()
  const porId = new Map(p.map(x => [x.id, x]))
  let nuevos = 0
  let editados = 0
  for (const x of b) {
    const y = porId.get(x.id)
    if (!y) nuevos++
    else if (JSON.stringify(x) !== JSON.stringify(y)) editados++
  }
  const idsB = new Set(b.map(x => x.id))
  const quitados = p.filter(x => !idsB.has(x.id)).length
  return { nuevos, editados, quitados }
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
