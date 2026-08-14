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

// LA LLAVE LLEVA LA EXPERIENCIA. Antes no: habia una sola llave global para
// todo el catalogo, asi que abrir el editor de Metamorfosis cargaba los
// bloques de El Presente como Regalo, cuyas bisagras son otras. Las diez
// bisagras de Metamorfosis salian "vacias" y publicar desde ahi publicaba el
// contenido de la otra experiencia encima. Ninguna pantalla lo advertia.
//
// La v2 en la llave es a proposito: las llaves v1 que quedaron en los
// navegadores tienen contenido de una experiencia guardado como si fuera de
// todas, y no hay forma de saber de cual. Se abandonan en vez de migrarse.
const llaveBorrador = (exp: string) => `personalab.${exp}.borrador.v2`
const llavePublicado = (exp: string) => `personalab.${exp}.publicado.v2`
const llaveHistorial = (exp: string) => `personalab.${exp}.historial.v2`

// Los bloques sembrados son todos de El Presente como Regalo: sus bisagras
// son p1 a p5. Las demas experiencias arrancan en blanco, que es la verdad,
// en vez de arrancar con contenido ajeno que no calza con sus bisagras.
const EXPERIENCIA_SEMBRADA = 'presente-regalo'

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

export function cargarPublicado(exp: string): Bloque[] {
  const guardado = leer(llavePublicado(exp))
  if (guardado) return guardado
  return exp === EXPERIENCIA_SEMBRADA ? BLOQUES : []
}

export function historial(exp: string): Publicacion[] {
  if (typeof window === 'undefined') return []
  try {
    const crudo = window.localStorage.getItem(llaveHistorial(exp))
    if (!crudo) {
      return exp === EXPERIENCIA_SEMBRADA
        ? [{ numero: 2, fecha: '2026-07-30', bloques: BLOQUES.length }]
        : []
    }
    return JSON.parse(crudo) as Publicacion[]
  } catch {
    return []
  }
}

export function publicar(exp: string, bloques: Bloque[], fechaISO: string): Publicacion {
  const previo = historial(exp)
  const numero = (previo[0]?.numero ?? 0) + 1
  const entrada: Publicacion = { numero, fecha: fechaISO, bloques: bloques.length }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(llavePublicado(exp), JSON.stringify(bloques))
    window.localStorage.setItem(llaveHistorial(exp), JSON.stringify([entrada, ...previo]))
    // Publicar cierra el borrador: lo que sigue es lo publicado.
    window.localStorage.removeItem(llaveBorrador(exp))
  }
  return entrada
}

// ── Borrador ────────────────────────────────────────────────────

export function cargar(exp: string): Bloque[] {
  return leer(llaveBorrador(exp)) ?? cargarPublicado(exp)
}

export function guardar(exp: string, bloques: Bloque[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(llaveBorrador(exp), JSON.stringify(bloques))
}

export function descartarBorrador(exp: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(llaveBorrador(exp))
}

export function hayBorrador(exp: string): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(llaveBorrador(exp)) !== null
}

// Cuantos bloques difieren entre borrador y publicado.
export function diferencias(exp: string): { nuevos: number; editados: number; quitados: number } {
  const b = cargar(exp)
  const p = cargarPublicado(exp)
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
