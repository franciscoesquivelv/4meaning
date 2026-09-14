import { NIVEL, definicion, estaVacio, type Bloque, type ClaseCampo } from '@/lib/personalab/bloques'
import type { ExperienciaEditable as Experiencia } from '@/lib/personalab/editorDatos'

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

// Lee un campo del bloque por su nombre en el contrato, y pregunta al contrato
// si está vacío. La pregunta la contesta `estaVacio`, que sabe que "vacío" no
// significa lo mismo para un texto que para un número. Aquí vivía una función
// que lo resolvía con un centinela de cadena, y el centinela estaba al revés.
function campoVacio(b: Bloque, campo: string, clase: ClaseCampo): boolean {
  return estaVacio(clase, (b as unknown as Record<string, unknown>)[campo])
}

// CÓMO SE NOMBRA EL BLOQUE DEL QUE HABLA UN HALLAZGO.
//
// Una bisagra tiene veinte bloques y varios del mismo tipo. Decir "Objeto: no
// dice qué hacer con él" obliga a buscarlo a ojo; decir `El objeto "Tu
// libreta"` lo señala. El código viejo interpolaba y al derivar las reglas se
// perdió, dejando todos los hallazgos del mismo tipo con texto idéntico.
// Hallazgo de Leo.
//
// Si el bloque todavía no tiene con qué identificarse, se nombra por su tipo
// y ya: es el caso del bloque recién creado, que es justo cuando no hay nada
// que citar.
function etiquetaDe(b: Bloque, nombreTipo: string): string {
  const seña = b.nombreArchivo || b.texto || b.pie
  if (!seña || !seña.trim()) return `Un bloque de ${nombreTipo.toLowerCase()}`
  const corta = seña.trim().replace(/\s+/g, ' ')
  const recortada = corta.length > 42 ? `${corta.slice(0, 42).trimEnd()}...` : corta
  return `${nombreTipo} "${recortada}"`
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
      const faltantes = Object.entries(def.campos)
        .filter(([campo, regla]) => regla.exigencia !== 'opcional' && campoVacio(b, campo, regla.clase))

      // SI LO PRINCIPAL FALTA, NO SE ENUMERA LO SECUNDARIO. El código viejo
      // usaba un `else if` y era deliberado: a un bloque recién creado no se
      // le dice "la cita no tiene texto" y "la cita no dice quién lo dijo" a
      // la vez. Se dice lo que hay que hacer primero. Al derivar las reglas se
      // perdió ese agrupamiento y los hallazgos se duplicaron; lo encontró Leo
      // diffeando la compuerta vieja contra la nueva.
      const hayImpedimento = faltantes.some(([, r]) => r.exigencia === 'impide')
      const aReportar = hayImpedimento
        ? faltantes.filter(([, r]) => r.exigencia === 'impide')
        : faltantes

      for (const [, regla] of aReportar) {
        hallazgos.push({
          severidad: regla.exigencia as Severidad,
          bisagraId: bi.id,
          bisagra: nombre,
          que: `${etiquetaDe(b, def.nombre)} ${regla.queFalta ?? `no tiene ${regla.etiqueta.toLowerCase()}.`}`,
          comoSeArregla: regla.comoSeArregla ?? 'Complétalo, o quita el bloque si ya no hace falta.',
        })
      }

      // El archivo subido, que no es un campo del jsonb sino una columna.
      // Espeja la rama del constraint: para video y audio vale la URL externa,
      // para imagen y archivo no hay salida. La severidad la decide el
      // contrato, no esta línea, y hoy es 'advierte' en los cuatro porque
      // todavía no existe ninguna pantalla que escriba `media_id`. El porqué
      // completo está junto a la declaración, en `bloques.ts`.
      // La url se juzga con el criterio del contrato y no con `vacio()`: una
      // `blob:` de la subida simulada es una cadena llena y aun así no sirve
      // de nada, y antes apagaba este aviso. Ver `urlUtilizable`.
      if (def.medio && !b.medioId && !(def.medio.admiteUrl && !estaVacio('url', b.url))) {
        hallazgos.push({
          severidad: def.medio.exigencia,
          bisagraId: bi.id,
          bisagra: nombre,
          que: `${etiquetaDe(b, def.nombre)} no tiene un archivo que se pueda servir.`,
          comoSeArregla: def.medio.admiteUrl
            ? 'Súbelo cuando el editor guarde de verdad, o pega un enlace. Por ahora es un aviso, no un bloqueo.'
            : 'La subida real llega con el editor reconstruido. Por ahora es un aviso, no un bloqueo.',
        })
      }

      // El dato fuera del rango que el propio contrato declara. Hoy el único
      // caso son los segundos de la pausa, que el participante ve recortados
      // al techo: sin este aviso, un 600 tecleado por error se comporta como
      // 30 y nadie se entera de que el dato está mal.
      for (const [campo, regla] of Object.entries(def.campos)) {
        if (regla.clase !== 'numero') continue
        const v = (b as unknown as Record<string, unknown>)[campo]
        if (typeof v !== 'number') continue
        if (regla.max !== undefined && v > regla.max) {
          hallazgos.push({
            severidad: 'advierte',
            bisagraId: bi.id,
            bisagra: nombre,
            que: `${etiquetaDe(b, def.nombre)} tiene ${regla.etiqueta.toLowerCase()} en ${v}, y el máximo es ${regla.max}.`,
            comoSeArregla: `Se va a comportar como ${regla.max}. Bájalo para que el dato diga la verdad.`,
          })
        }
        if (regla.min !== undefined && v < regla.min) {
          hallazgos.push({
            severidad: 'advierte',
            bisagraId: bi.id,
            bisagra: nombre,
            que: `${etiquetaDe(b, def.nombre)} tiene ${regla.etiqueta.toLowerCase()} en ${v}, por debajo de ${regla.min}.`,
            comoSeArregla: `Súbelo a ${regla.min} o más.`,
          })
        }
      }

      // NO HAY REGLA SOBRE `descargable`, Y ESO ES UNA DECISIÓN.
      //
      // Había una que avisaba cuando un descargable lo veía todo el foro,
      // porque descargable significaba guion de sala del moderador. Francisco
      // jubiló esa regla el 2026-09-13: al participante digital sí se le puede
      // pedir que imprima o descargue su hoja de trabajo.
      //
      // Yo la había sustituido por la inversa, y Leo probó que era falso
      // positivo en los dos únicos archivos que existen, que son guiones de
      // sala descargables a propósito. Una regla que se equivoca en el cien
      // por ciento de sus casos reales no cumple la doctrina escrita arriba en
      // este mismo archivo. Y nadie pidió una regla nueva: jubilar no es
      // invertir. Queda fuera hasta que haya un caso que la sostenga.
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
