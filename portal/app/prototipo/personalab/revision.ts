import { NIVEL, type Bloque } from './contenido'
import type { Experiencia } from './dominio'

// Compuerta de publicacion. Distingue dos cosas que se confunden siempre:
//
//   IMPIDE   lo que dejaria contenido roto del lado del participante.
//   ADVIERTE lo que probablemente es un olvido, pero puede ser deliberado.
//
// Nada aqui es una opinion de estilo. Si una regla no se puede sostener
// como "esto se va a ver mal o vacio para alguien", no entra.

export type Severidad = 'impide' | 'advierte'

export interface Hallazgo {
  severidad: Severidad
  bisagraId: string
  bisagra: string
  que: string
  comoSeArregla: string
}

export interface Revision {
  hallazgos: Hallazgo[]
  impedimentos: number
  advertencias: number
  puedePublicar: boolean
  resumen: {
    bisagrasConContenido: number
    bisagrasTotales: number
    bloques: number
    visiblesAlParticipante: number
    soloModerador: number
  }
}

function vacio(s?: string) {
  return !s || s.trim().length === 0
}

export function revisar(experiencia: Experiencia, bloques: Bloque[]): Revision {
  const hallazgos: Hallazgo[] = []
  const bisagras = experiencia.bisagras.slice().sort((a, b) => a.orden - b.orden)

  for (const bi of bisagras) {
    const suyos = bloques.filter(b => b.bisagraId === bi.id).sort((a, b) => a.orden - b.orden)
    const nombre = bi.titulo

    if (suyos.length === 0) {
      hallazgos.push({
        severidad: 'advierte',
        bisagraId: bi.id,
        bisagra: nombre,
        que: 'No tiene ningún bloque.',
        comoSeArregla: 'Escríbela, o déjala así si todavía no toca.',
      })
      continue
    }

    // Una bisagra donde el participante no ve nada es una pantalla en blanco
    // para el, aunque para el moderador este llena.
    const visibles = suyos.filter(b => NIVEL[b.audiencia] <= 1)
    if (visibles.length === 0) {
      hallazgos.push({
        severidad: 'impide',
        bisagraId: bi.id,
        bisagra: nombre,
        que: 'El participante no vería nada: todos los bloques son solo para el moderador.',
        comoSeArregla: 'Cambia al menos un bloque a Todos, o deja la bisagra vacía.',
      })
    }

    for (const b of suyos) {
      switch (b.tipo) {
        case 'texto':
        case 'consigna':
        case 'aviso':
        case 'gesto':
        case 'nota':
          if (vacio(b.texto)) {
            hallazgos.push({
              severidad: 'impide',
              bisagraId: bi.id,
              bisagra: nombre,
              que: `Hay un bloque de ${b.tipo} sin texto.`,
              comoSeArregla: 'Escríbelo o quítalo.',
            })
          }
          break

        case 'cita':
          if (vacio(b.texto)) {
            hallazgos.push({
              severidad: 'impide',
              bisagraId: bi.id,
              bisagra: nombre,
              que: 'Hay una cita sin texto.',
              comoSeArregla: 'Escríbela o quítala.',
            })
          } else if (vacio(b.autor)) {
            hallazgos.push({
              severidad: 'advierte',
              bisagraId: bi.id,
              bisagra: nombre,
              que: 'Una cita no dice quién lo dijo.',
              comoSeArregla: 'Una voz sin nombre se lee como nuestra.',
            })
          }
          break

        case 'objeto':
          if (vacio(b.texto)) {
            hallazgos.push({
              severidad: 'impide',
              bisagraId: bi.id,
              bisagra: nombre,
              que: 'Hay un objeto sin nombre.',
              comoSeArregla: 'Di qué se tiene en la mano.',
            })
          } else if (vacio(b.pie)) {
            hallazgos.push({
              severidad: 'advierte',
              bisagraId: bi.id,
              bisagra: nombre,
              que: `El objeto "${b.texto}" no dice qué hacer con él.`,
              comoSeArregla: 'Agrega una frase al pie.',
            })
          }
          break

        case 'archivo':
          if (vacio(b.nombreArchivo)) {
            hallazgos.push({
              severidad: 'impide',
              bisagraId: bi.id,
              bisagra: nombre,
              que: 'Hay un archivo sin subir.',
              comoSeArregla: 'Súbelo o quita el bloque.',
            })
          }
          if (b.descargable && b.audiencia === 'todos') {
            hallazgos.push({
              severidad: 'advierte',
              bisagraId: bi.id,
              bisagra: nombre,
              que: `"${b.nombreArchivo}" es descargable y lo ve todo el foro.`,
              comoSeArregla: 'Los guiones de sala suelen ser solo para el moderador.',
            })
          }
          break

        case 'imagen':
        case 'video':
          if (vacio(b.url)) {
            hallazgos.push({
              severidad: 'impide',
              bisagraId: bi.id,
              bisagra: nombre,
              que: `Hay un bloque de ${b.tipo} sin contenido.`,
              comoSeArregla: 'Súbelo o quita el bloque.',
            })
          }
          break
      }
    }

    // Dos pausas seguidas no son un respiro, son un hueco.
    for (let i = 1; i < suyos.length; i++) {
      if (suyos[i].tipo === 'pausa' && suyos[i - 1].tipo === 'pausa') {
        hallazgos.push({
          severidad: 'advierte',
          bisagraId: bi.id,
          bisagra: nombre,
          que: 'Hay dos pausas seguidas.',
          comoSeArregla: 'Deja una. Dos seguidas se leen como un error.',
        })
        break
      }
    }
  }

  const impedimentos = hallazgos.filter(h => h.severidad === 'impide').length
  const advertencias = hallazgos.filter(h => h.severidad === 'advierte').length
  const conContenido = bisagras.filter(bi => bloques.some(b => b.bisagraId === bi.id)).length

  return {
    hallazgos,
    impedimentos,
    advertencias,
    puedePublicar: impedimentos === 0,
    resumen: {
      bisagrasConContenido: conContenido,
      bisagrasTotales: bisagras.length,
      bloques: bloques.length,
      visiblesAlParticipante: bloques.filter(b => NIVEL[b.audiencia] <= 1).length,
      soloModerador: bloques.filter(b => NIVEL[b.audiencia] === 2).length,
    },
  }
}
