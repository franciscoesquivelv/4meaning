// ── MODELO DE CONTENIDO ─────────────────────────────────────────
// Catalogo cerrado de 11 tipos de bloque. Criterio de la sintesis del
// Consejo: cada tipo tiene un caso real en el dominio hoy, o lo exige el
// encargo. Lo demas se descarto con su razon.
//
// Descartados y por que: `titulo` y `separador` se absorben (## vive en el
// markdown, `pausa` es el unico separador que la marca admite). `audio`,
// `llamado` y `kit_ref` se van por cero casos. `certificado` no existe:
// el testimonio lo entrega una persona.
//
// Campos PROHIBIDOS en todo el modelo del participante:
// progress, completion_pct, score, streak, badge, rank, quiz.

export type TipoBloque =
  | 'texto'      // markdown restringido
  | 'cita'       // voz ajena, con atribucion
  | 'consigna'   // lo que se le pide hacer a la persona
  | 'aviso'      // algo que hay que saber antes de seguir
  | 'nota'       // solo moderador, el participante nunca la ve
  | 'pausa'      // respiro deliberado, sin contenido
  | 'gesto'      // lo que se escribe a mano y NO se sube
  | 'objeto'     // pieza fisica que hay que tener en la mano
  | 'archivo'    // PDF, normalmente descargable por el moderador
  | 'imagen'
  | 'video'

// Quien puede ver un bloque. El nivel es acumulativo: el moderador ve todo
// lo del participante, y el equipo ve todo.
export type Audiencia = 'todos' | 'moderador' | 'equipo'

export const NIVEL: Record<Audiencia, number> = {
  todos: 1,
  moderador: 2,
  equipo: 3,
}

export interface Bloque {
  id: string
  bisagraId: string
  orden: number
  tipo: TipoBloque
  audiencia: Audiencia
  // Contenido segun el tipo. Se mantiene laxo a proposito en el prototipo:
  // en el esquema real esto es jsonb con validacion por tipo.
  texto?: string          // markdown para 'texto', literal para los demas
  autor?: string          // 'cita'
  pie?: string            // 'imagen', 'video', 'archivo', 'objeto'
  url?: string            // 'imagen', 'video', 'archivo'
  nombreArchivo?: string  // 'archivo'
  peso?: string           // 'archivo'
  descargable?: boolean   // 'archivo'
  duracion?: string       // 'video'
}

export const CATALOGO: Record<TipoBloque, { nombre: string; ayuda: string }> = {
  texto:    { nombre: 'Texto',    ayuda: 'Lo que se lee. Admite negrita, cursiva y subtitulos.' },
  cita:     { nombre: 'Cita',     ayuda: 'Una voz que no es la nuestra. Siempre con atribucion.' },
  consigna: { nombre: 'Consigna', ayuda: 'Lo que se le pide hacer a la persona, en una sola instruccion.' },
  aviso:    { nombre: 'Aviso',    ayuda: 'Algo que hay que saber antes de seguir.' },
  nota:     { nombre: 'Nota',     ayuda: 'Solo para el moderador. El participante nunca la ve.' },
  pausa:    { nombre: 'Pausa',    ayuda: 'Un respiro. No lleva contenido.' },
  gesto:    { nombre: 'Gesto',    ayuda: 'Lo que se escribe a mano. No se sube ni se transcribe.' },
  objeto:   { nombre: 'Objeto',   ayuda: 'Una pieza fisica que hay que tener en la mano.' },
  archivo:  { nombre: 'Archivo',  ayuda: 'Un PDF. Si es descargable, es para el moderador.' },
  imagen:   { nombre: 'Imagen',   ayuda: 'Con pie de foto.' },
  video:    { nombre: 'Video',    ayuda: 'Vimeo o YouTube en modo no listado.' },
}

// ── Versiones ───────────────────────────────────────────────────
export type EstadoVersion = 'borrador' | 'publicada'

export interface Version {
  id: string
  experienciaId: string
  numero: number
  estado: EstadoVersion
  actualizada: string
  notas?: string
}

export const VERSIONES: Version[] = [
  { id: 'v-pr-2', experienciaId: 'presente-regalo', numero: 2, estado: 'publicada', actualizada: '2026-07-30' },
  { id: 'v-pr-3', experienciaId: 'presente-regalo', numero: 3, estado: 'borrador', actualizada: '2026-08-06', notas: 'Reescribiendo la entrega de la carta.' },
  { id: 'v-me-1', experienciaId: 'metamorfosis', numero: 1, estado: 'borrador', actualizada: '2026-08-02' },
]

// ── Semilla real, no lorem ──────────────────────────────────────
// El Presente como Regalo, la unica experiencia del catalogo con bisagras
// disenadas y con abreEspacioAlForo en true.

export const BLOQUES: Bloque[] = [
  // ── p1 · Invitacion al foro (vispera) ──
  {
    id: 'b1', bisagraId: 'p1', orden: 1, tipo: 'texto', audiencia: 'todos',
    texto: 'Dentro de una semana vamos a sentarnos juntos una tarde. No hace falta que prepares nada, ni que leas nada antes. Solo que vengas.\n\nLo único que te pedimos es que llegues sin prisa. Si puedes, deja libre lo que sigue después.',
  },
  {
    id: 'b2', bisagraId: 'p1', orden: 2, tipo: 'cita', audiencia: 'todos',
    texto: 'La vida no es lo que uno vivió, sino la que uno recuerda, y cómo la recuerda para contarla.',
    autor: 'Gabriel García Márquez',
  },
  {
    id: 'b3', bisagraId: 'p1', orden: 3, tipo: 'texto', audiencia: 'todos',
    texto: 'Vamos a mirar el presente. No el que viene, ni el que se fue. El que está ocurriendo mientras lees esto.',
  },
  {
    id: 'b4', bisagraId: 'p1', orden: 4, tipo: 'nota', audiencia: 'moderador',
    texto: 'Manda esta carta siete días antes, no antes. Si se manda con dos semanas, la gente la lee y la olvida. Si se manda con tres días, se siente apurada.',
  },

  // ── p2 · El inventario del hoy (ignicion) ──
  {
    id: 'b5', bisagraId: 'p2', orden: 1, tipo: 'texto', audiencia: 'todos',
    texto: 'Casi todo lo que valoramos de nuestra vida lo vamos a valorar **después**. Cuando ya no esté, o cuando cambie.\n\nEsta primera parte es un ejercicio de mirar lo que hay hoy, mientras está.',
  },
  {
    id: 'b6', bisagraId: 'p2', orden: 2, tipo: 'consigna', audiencia: 'todos',
    texto: 'Escribe cinco cosas que hoy forman parte de tu vida y que dentro de diez años ya no van a estar igual.',
  },
  {
    id: 'b7', bisagraId: 'p2', orden: 3, tipo: 'gesto', audiencia: 'todos',
    texto: 'A mano, en tu libreta. Nadie va a leer esto, ni ahora ni después.',
  },
  {
    id: 'b8', bisagraId: 'p2', orden: 4, tipo: 'pausa', audiencia: 'todos',
  },
  {
    id: 'b9', bisagraId: 'p2', orden: 5, tipo: 'texto', audiencia: 'todos',
    texto: 'Ahora míralas otra vez. Marca la que más te costaría perder.',
  },
  {
    id: 'b10', bisagraId: 'p2', orden: 6, tipo: 'nota', audiencia: 'moderador',
    texto: 'Da doce minutos reales para la lista. La gente termina en cuatro y se queda mirando la hoja. Los ocho que sobran son donde aparece lo bueno. No rescates el silencio.',
  },

  // ── p3 · La carta al futuro (ignicion) ──
  {
    id: 'b11', bisagraId: 'p3', orden: 1, tipo: 'texto', audiencia: 'todos',
    texto: 'Vas a escribirle a la persona que vas a ser dentro de seis meses.\n\nNo es una carta de propósitos. No le pidas nada. Cuéntale cómo está tu vida hoy, con lo que tenga de bueno y de difícil.',
  },
  {
    id: 'b12', bisagraId: 'p3', orden: 2, tipo: 'objeto', audiencia: 'todos',
    texto: 'Papel y sobre',
    pie: 'Escribe a mano y cierra el sobre tú mismo. Nadie más lo va a tocar.',
  },
  {
    id: 'b13', bisagraId: 'p3', orden: 3, tipo: 'consigna', audiencia: 'todos',
    texto: 'Cuando termines, escribe tu nombre en el sobre y ciérralo. Vuelve a tus manos en seis meses.',
  },
  {
    id: 'b14', bisagraId: 'p3', orden: 4, tipo: 'aviso', audiencia: 'todos',
    texto: 'Esta carta no se digitaliza, no se fotografía y no se comparte. La guardamos cerrada y te la devolvemos cerrada.',
  },
  {
    id: 'b15', bisagraId: 'p3', orden: 5, tipo: 'archivo', audiencia: 'moderador',
    nombreArchivo: 'guion-carta-al-futuro-v2.pdf',
    peso: '340 KB',
    descargable: true,
    pie: 'Guion de sala para esta bisagra. Versión 2.0.',
  },
  {
    id: 'b16', bisagraId: 'p3', orden: 6, tipo: 'nota', audiencia: 'moderador',
    texto: 'Ten sobres de sobra. Siempre alguien arruina el primero. Y no pongas música: el silencio de cuarenta personas escribiendo es parte del ejercicio.',
  },

  // ── p4 · Capa mensual (retorno) ──
  {
    id: 'b17', bisagraId: 'p4', orden: 1, tipo: 'texto', audiencia: 'todos',
    texto: 'Una vez al mes te vamos a escribir. Una sola vez, y siempre lo mismo: una pregunta corta.\n\nNo hay que responder. No llevamos la cuenta de quién responde.',
  },
  {
    id: 'b18', bisagraId: 'p4', orden: 2, tipo: 'cita', audiencia: 'todos',
    texto: 'Lo que se mira con atención se vuelve importante.',
    autor: 'Simone Weil',
  },
  {
    id: 'b19', bisagraId: 'p4', orden: 3, tipo: 'nota', audiencia: 'moderador',
    texto: 'Techo duro: un envío al mes. Si alguien del equipo propone un recordatorio extra, la respuesta es no. Un segundo mensaje convierte la invitación en deuda.',
  },

  // ── p5 · Entrega de la carta (retorno) ──
  {
    id: 'b20', bisagraId: 'p5', orden: 1, tipo: 'texto', audiencia: 'todos',
    texto: 'Han pasado seis meses. La carta que escribiste vuelve hoy.',
  },
  {
    id: 'b21', bisagraId: 'p5', orden: 2, tipo: 'pausa', audiencia: 'todos',
  },
  {
    id: 'b22', bisagraId: 'p5', orden: 3, tipo: 'texto', audiencia: 'todos',
    texto: 'Ábrela cuando estés solo y con tiempo. No la leas en el estacionamiento ni entre dos reuniones.',
  },
  {
    id: 'b23', bisagraId: 'p5', orden: 4, tipo: 'objeto', audiencia: 'todos',
    texto: 'Tu sobre',
    pie: 'Se recibe en la mano, de una persona. No se descarga.',
  },
  {
    id: 'b24', bisagraId: 'p5', orden: 5, tipo: 'nota', audiencia: 'moderador',
    texto: 'Entrégalas una por una, diciendo el nombre en voz alta. No las dejes en una mesa para que cada quien recoja la suya. El acto de entregar es la mitad del ejercicio.',
  },
]

// ── Consultas ───────────────────────────────────────────────────

export function bloquesDe(bisagraId: string, nivel = 1): Bloque[] {
  return BLOQUES
    .filter(b => b.bisagraId === bisagraId && NIVEL[b.audiencia] <= nivel)
    .sort((a, b) => a.orden - b.orden)
}

export function tieneContenido(bisagraId: string): boolean {
  return BLOQUES.some(b => b.bisagraId === bisagraId)
}

export function versionesDe(experienciaId: string): Version[] {
  return VERSIONES.filter(v => v.experienciaId === experienciaId)
    .sort((a, b) => b.numero - a.numero)
}

export function versionPublicada(experienciaId: string): Version | undefined {
  return versionesDe(experienciaId).find(v => v.estado === 'publicada')
}
