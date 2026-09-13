import { NIVEL, definicion, type Bloque } from '@/lib/personalab/bloques'
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

// Lee un campo del bloque por su nombre en el contrato. Un campo que no sea
// texto (los segundos de la pausa, el interruptor de descargable) no se juzga
// por "estar vacío", y por eso solo se devuelve algo cuando es una cadena.
function valorDe(b: Bloque, campo: string): string | undefined {
  const v = (b as unknown as Record<string, unknown>)[campo]
  return typeof v === 'string' ? v : v === undefined || v === null ? undefined : ' '
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

    // LAS REGLAS POR CAMPO SALEN DEL CONTRATO, NO DE UN `switch` AQUÍ.
    //
    // Aquí había una rama por tipo con las mismas reglas escritas por tercera
    // vez, y YA ESTABA EN DESACUERDO CON LA BASE, no en teoría: pedía `url`
    // para una imagen, mientras el constraint `blocks_contenido_por_tipo`
    // exige `media_id`. El editor decía "puedes publicar" y la base habría
    // rechazado el insert. Hallazgo de Leo.
    //
    // Ahora cada campo declara en el contrato si su ausencia impide, advierte
    // o da igual, y con qué frase se explica. Un tipo de bloque nuevo trae sus
    // reglas puestas, sin que nadie tenga que acordarse de esta pantalla.
    for (const b of suyos) {
      const def = definicion(b.tipo)

      for (const [campo, regla] of Object.entries(def.campos)) {
        if (regla.exigencia === 'opcional') continue
        if (!vacio(valorDe(b, campo))) continue

        hallazgos.push({
          severidad: regla.exigencia,
          bisagraId: bi.id,
          bisagra: nombre,
          que: `${def.nombre}: ${regla.queFalta ?? `falta ${regla.etiqueta.toLowerCase()}.`}`,
          comoSeArregla: regla.comoSeArregla ?? 'Complétalo, o quita el bloque si ya no hace falta.',
        })
      }

      // El medio subido, que no es un campo del jsonb sino una columna.
      // Espeja la rama del constraint: para video y audio vale la URL
      // externa, para imagen y archivo no hay salida.
      if (def.medio && !b.medioId && !(def.medio.admiteUrl && !vacio(b.url))) {
        hallazgos.push({
          severidad: 'impide',
          bisagraId: bi.id,
          bisagra: nombre,
          que: `${def.nombre}: quedó sin archivo.`,
          comoSeArregla: def.medio.admiteUrl
            ? 'Súbelo o pega un enlace, o quita el bloque si ya no hace falta.'
            : 'Súbelo, o quita el bloque si ya no hace falta.',
        })
      }

      // LA ÚNICA REGLA QUE NO ES POR CAMPO, y por eso sigue escrita a mano:
      // cruza dos cosas del bloque (que sea descargable y quién lo ve) en vez
      // de mirar si un campo está vacío.
      //
      // Y CAMBIÓ DE SENTIDO EL 2026-09-13. Antes decía que un descargable
      // visible para todos era sospechoso, porque descargable significaba
      // guion de sala del moderador. El producto digital jubiló esa regla: al
      // participante sí se le puede entregar una hoja para imprimir o llenar.
      // Lo que queda es lo que sigue siendo cierto: un archivo marcado SOLO
      // para el moderador y a la vez descargable por el foro no se sostiene.
      if (b.tipo === 'archivo' && b.descargable && b.audiencia !== 'todos') {
        hallazgos.push({
          severidad: 'advierte',
          bisagraId: bi.id,
          bisagra: nombre,
          que: `"${b.nombreArchivo ?? 'Un archivo'}" es descargable pero no lo ve el participante.`,
          comoSeArregla: 'Si es una hoja de trabajo, ponla en Todos. Si es guion de sala, está bien así.',
        })
      }
    }

    // Dos pausas seguidas no son un respiro, son un hueco.
    for (let i = 1; i < suyos.length; i++) {
      if (suyos[i].tipo === 'pausa' && suyos[i - 1].tipo === 'pausa') {
        hallazgos.push({
          severidad: 'advierte',
          bisagraId: bi.id,
          bisagra: nombre,
          que: 'Quedaron dos pausas seguidas.',
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
