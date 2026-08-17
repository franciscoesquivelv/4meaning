// ── Prototipo del ecosistema 4 Meaning ──────────────────────────
// Datos simulados. No toca Supabase. Sirve para iterar la forma
// antes de escribir el esquema.
//
// Léxico vinculante (Renata, Consejo #002):
//   experiencia (no curso) · bisagra (no lección) · tiempo (no módulo)
//   participante (no alumno) · retorno (no progreso) · grant (no enrollment)
//   capítulo (no cohorte) · testimonio (no certificado)
// Campos prohibidos: progress, completion_pct, score, streak, badge, rank, quiz

export type Marca = 'trascendencia' | 'personalab'
export type Tiempo = 'vispera' | 'ignicion' | 'retorno'

// Cómo se detenta un acceso. Es la diferencia estructural entre las marcas:
//   · Trascendencia lo otorga a la familia que va a vivir el retiro.
//   · PersonaLab lo otorga al MODERADOR, que compra para su foro y es el
//     único titular. Algunos productos pueden abrir espacio a la gente del
//     foro, pero eso se decide experiencia por experiencia.
export type Titularidad = 'familia' | 'moderador' | 'miembro_foro'

export const MARCAS: Record<Marca, {
  nombre: string
  dominante: string
  tinte: string
  borde: string
}> = {
  trascendencia: {
    nombre: 'Trascendencia',
    dominante: '#4C0F18',            // Vino Profundo
    tinte: 'rgba(76,15,24,0.075)',
    borde: 'rgba(76,15,24,0.28)',
  },
  personalab: {
    nombre: 'PersonaLab',
    dominante: '#002B34',            // Verde Petroleo
    // Alfa mas alta que el vino: el teal sobre papel calido se apaga
    // hacia gris y la dominancia deja de leerse.
    tinte: 'rgba(0,43,52,0.085)',
    borde: 'rgba(0,43,52,0.30)',
  },
}

// ── Bisagras: los momentos de una experiencia ───────────────────
// No son lecciones. Una bisagra es un punto donde algo gira.
export interface Bisagra {
  titulo: string
  descripcion: string
  // Qué sostiene esta bisagra: la sala, el objeto, o la pantalla.
  soporte: 'sala' | 'objeto' | 'pantalla'
  listo: boolean
}

export interface BloqueTiempo {
  tiempo: Tiempo
  titulo: string
  // Qué papel juega el software en este tiempo (Renata, Consejo #002).
  papelSoftware: string
  bisagras: Bisagra[]
}

export interface Experiencia {
  id: string
  marca: Marca
  nombre: string
  subtitulo: string
  narrativa?: string
  // Si esta experiencia admite abrir acceso a la gente del foro,
  // además del moderador. Se decide caso por caso.
  abreEspacioAlForo: boolean
  bloques: BloqueTiempo[]
}

export const EXPERIENCIAS: Record<string, Experiencia> = {
  'metamorfosis': {
    id: 'metamorfosis',
    marca: 'personalab',
    nombre: 'Metamorfosis y Metanoia',
    subtitulo: 'Cerrando círculos',
    narrativa: 'No estás roto, estás mudando.',
    abreEspacioAlForo: false,
    bloques: [
      {
        tiempo: 'vispera',
        titulo: 'Víspera',
        papelSoftware: 'Aquí el software es protagonista. Es el único tiempo que hoy no existe en ningún lado.',
        bisagras: [
          { titulo: 'La carta de convocatoria', descripcion: 'Lo que reciben los miembros del foro dos semanas antes. Define el tono con el que llegan.', soporte: 'pantalla', listo: true },
          { titulo: 'Lo que hay que traer', descripcion: 'Un objeto propio que represente algo que no termina de cerrarse.', soporte: 'objeto', listo: true },
          { titulo: 'Lo que el moderador prepara', descripcion: 'Checklist de sala, materiales y disposición del espacio.', soporte: 'pantalla', listo: false },
        ],
      },
      {
        tiempo: 'ignicion',
        titulo: 'Ignición',
        papelSoftware: 'Software mudo. La app del participante se apaga y solo queda modo sala para el moderador.',
        bisagras: [
          { titulo: 'Muda', descripcion: 'Reconocer qué ya no sirve. Trabajo con el objeto que cada quien trajo.', soporte: 'sala', listo: true },
          { titulo: 'Crisálida', descripcion: 'El tiempo intermedio. La parte más incómoda y la que no se puede acelerar.', soporte: 'sala', listo: false },
          { titulo: 'Eclosión', descripcion: 'Lo que emerge. Se nombra en voz alta frente al foro.', soporte: 'sala', listo: false },
          { titulo: 'Vuelo', descripcion: 'Ritual de cierre. Es lo único que sostiene el cuidado del participante.', soporte: 'objeto', listo: true },
        ],
      },
      {
        tiempo: 'retorno',
        titulo: 'Retorno',
        papelSoftware: 'Aquí el software es indispensable, no cómodo. Es lo que sostiene en el tiempo.',
        bisagras: [
          { titulo: 'El gesto mínimo', descripcion: 'Lo que cada quien se comprometió a hacer, en una sola frase suya.', soporte: 'pantalla', listo: false },
          { titulo: 'Capa mensual', descripcion: 'Un solo puntero al mes. Nunca una racha, nunca un recordatorio de deuda.', soporte: 'pantalla', listo: false },
          { titulo: 'Cierre a seis meses', descripcion: 'Ver la raíz completa, no la rama sola. El testimonio lo entrega una persona.', soporte: 'sala', listo: false },
        ],
      },
    ],
  },
  'presente-regalo': {
    id: 'presente-regalo',
    marca: 'personalab',
    nombre: 'El Presente como Regalo',
    subtitulo: '',
    abreEspacioAlForo: true,
    bloques: [
      { tiempo: 'vispera', titulo: 'Víspera', papelSoftware: 'Sin diseñar todavía.', bisagras: [] },
      { tiempo: 'ignicion', titulo: 'Ignición', papelSoftware: 'Sin diseñar todavía.', bisagras: [] },
      { tiempo: 'retorno', titulo: 'Retorno', papelSoftware: 'Corriendo hoy con el foro Anáhuac.', bisagras: [
        { titulo: 'Capa mensual', descripcion: 'En curso. Mes 5 de 6.', soporte: 'pantalla', listo: true },
      ] },
    ],
  },
  'trascendencia': {
    id: 'trascendencia',
    marca: 'trascendencia',
    nombre: 'Trascendencia',
    subtitulo: 'El legado familiar como proyecto de vida',
    abreEspacioAlForo: false,
    bloques: [
      { tiempo: 'vispera', titulo: 'Víspera', papelSoftware: 'Ya existe en el portal actual: formulario, acuerdos, itinerario.', bisagras: [
        { titulo: 'Formulario de historia familiar', descripcion: 'Lo que la pareja comparte antes de llegar.', soporte: 'pantalla', listo: true },
        { titulo: 'Acuerdos de confidencialidad', descripcion: 'Firma digital antes del retiro.', soporte: 'pantalla', listo: true },
      ] },
      { tiempo: 'ignicion', titulo: 'Ignición', papelSoftware: 'Modo sala: itinerario, operación del día, equipo.', bisagras: [
        { titulo: 'Las cinco dinámicas', descripcion: 'Mochila de valores, caja negra, valijas, arqueología, evento vivido.', soporte: 'objeto', listo: true },
      ] },
      { tiempo: 'retorno', titulo: 'Retorno', papelSoftware: 'Existe a 90 días. Falta llevarlo a seis meses.', bisagras: [
        { titulo: 'Compromisos a 90 días', descripcion: 'Hoy vive como casilla con barra de porcentaje. Hay que rediseñarlo.', soporte: 'pantalla', listo: true },
        { titulo: 'Storybook y video', descripcion: 'Se recibe, no se descarga.', soporte: 'objeto', listo: true },
      ] },
    ],
  },
}

// ── Accesos otorgados (grants) ──────────────────────────────────
export interface Acceso {
  id: string
  experienciaId: string
  marca: Marca
  titularidad: Titularidad
  tiempo: Tiempo
  estado: string
  detalle: string
  invitadoPor?: string
  capitulo?: string
  // Solo cuando es moderador: a cuánta gente le está corriendo esto.
  personasEnElForo?: number
}

export interface Persona {
  id: string
  nombre: string
  descripcion: string
  superAdmin?: boolean
  operaEn?: Marca[]
  accesos: Acceso[]
}

export const PERSONAS: Record<string, Persona> = {
  a: {
    id: 'a',
    nombre: 'Ana y Martín Solís',
    descripcion: 'Familia · un solo acceso',
    accesos: [
      {
        id: 'g1',
        experienciaId: 'trascendencia',
        marca: 'trascendencia',
        titularidad: 'familia',
        tiempo: 'vispera',
        estado: 'Faltan 34 días',
        detalle: 'Capítulo Monterrey · 12 al 14 de septiembre',
        invitadoPor: 'Los invitó Rodrigo Lemus',
        capitulo: 'Monterrey',
      },
    ],
  },
  b: {
    id: 'b',
    nombre: 'Rodrigo Lemus',
    descripcion: 'Moderador de foro · vivió Trascendencia y compró PersonaLab',
    accesos: [
      {
        id: 'g2',
        experienciaId: 'trascendencia',
        marca: 'trascendencia',
        titularidad: 'familia',
        tiempo: 'retorno',
        estado: 'Mes 2 de 6',
        detalle: 'Vivido en abril · Capítulo Monterrey',
        capitulo: 'Monterrey',
      },
      {
        id: 'g3',
        experienciaId: 'metamorfosis',
        marca: 'personalab',
        titularidad: 'moderador',
        tiempo: 'vispera',
        estado: 'Corre en 9 días',
        detalle: 'Foro Anáhuac',
        capitulo: 'Anáhuac',
        personasEnElForo: 12,
      },
      {
        id: 'g4',
        experienciaId: 'presente-regalo',
        marca: 'personalab',
        titularidad: 'moderador',
        tiempo: 'retorno',
        estado: 'Mes 5 de 6',
        detalle: 'Foro Anáhuac · corrió en marzo',
        capitulo: 'Anáhuac',
        personasEnElForo: 11,
      },
    ],
  },
  c: {
    id: 'c',
    nombre: 'Lucía Ferrer',
    descripcion: 'Equipo de PersonaLab, sin acceso a Trascendencia',
    operaEn: ['personalab'],
    accesos: [],
  },
  d: {
    id: 'd',
    nombre: 'Francisco Esquivel',
    descripcion: 'Super admin, ve todo el ecosistema',
    superAdmin: true,
    operaEn: ['trascendencia', 'personalab'],
    accesos: [],
  },
}

export const ORDEN_PERSONAS = ['a', 'b', 'c', 'd'] as const

export const RESUMEN_MARCA: Record<Marca, { k: string; v: string }[]> = {
  trascendencia: [
    { k: 'Eventos activos', v: '3' },
    { k: 'Familias inscritas', v: '41' },
    { k: 'Acuerdos por firmar', v: '7' },
    { k: 'Próximo evento', v: '12 sep' },
  ],
  personalab: [
    { k: 'Experiencias vivas', v: '2' },
    { k: 'Capítulos activos', v: '5' },
    { k: 'Moderadores con acceso', v: '9' },
    { k: 'Próxima corrida', v: '15 ago' },
  ],
}

export const ETIQUETA_TIEMPO: Record<Tiempo, string> = {
  vispera: 'Víspera',
  ignicion: 'Estos días',
  retorno: 'Retorno',
}
