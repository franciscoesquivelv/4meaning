// ── DOMINIO DE PERSONALAB ───────────────────────────────────────
// Equivalencia con Trascendencia:
//   evento    → corrida   (una experiencia, un capítulo, un moderador, una fecha)
//   familia   → foro      (el grupo que el moderador convoca)
//   itinerario→ guion     (las bisagras de la ignición, en orden)
//   materiales→ kit       (físico, humano, administrativo)
//   entregas  → retorno   (lo que sostiene a seis meses)
//
// Léxico vinculante del Consejo #002. Campos prohibidos:
// progress, completion_pct, score, streak, badge, rank, quiz.

export type Tiempo = 'vispera' | 'ignicion' | 'retorno'
export type Soporte = 'sala' | 'objeto' | 'pantalla'
export type EstadoCorrida = 'prospecto' | 'confirmada' | 'en_preparacion' | 'corrida' | 'cancelada'
export type MaduracionExp = 'diseño' | 'piloto' | 'lista' | 'retirada'

export const TEAL = '#002B34'
export const TEAL_2 = '#0A3B45'
export const TERRA = '#B9735A'

export const ETIQUETA_TIEMPO: Record<Tiempo, string> = {
  vispera: 'Víspera',
  ignicion: 'Ignición',
  retorno: 'Retorno',
}

export const PAPEL_SOFTWARE: Record<Tiempo, string> = {
  vispera: 'El software es protagonista. Es el tiempo que hoy no existe en ningún lado.',
  ignicion: 'Software mudo. Solo modo sala para el moderador.',
  retorno: 'El software es indispensable, no cómodo.',
}

export const SOPORTE_NOTA: Record<Soporte, string> = {
  sala: 'Ocurre entre personas. El software no entra.',
  objeto: 'Pieza física. El software la administra, no la entrega.',
  pantalla: 'Vive dentro del portal.',
}

// ── Bisagras ────────────────────────────────────────────────────
export interface Bisagra {
  id: string
  tiempo: Tiempo
  orden: number
  titulo: string
  descripcion: string
  soporte: Soporte
  duracion?: string
  listo: boolean
  // Lo que el moderador necesita tener en la mano para esta bisagra.
  requiere?: string[]
}

// ── Kit ─────────────────────────────────────────────────────────
// La carta de frontera de Renata, hecha estructura.
export type ColumnaKit = 'objeto' | 'humano' | 'administrativo'

export const COLUMNA_KIT: Record<ColumnaKit, { titulo: string; regla: string }> = {
  objeto: {
    titulo: 'Objeto físico',
    regla: 'Nunca digital, nunca descargable, nunca sustituible por PDF.',
  },
  humano: {
    titulo: 'Pieza humana',
    regla: 'Solo se transmite en formación presencial. Jamás por video.',
  },
  administrativo: {
    titulo: 'Capa administrativa',
    regla: 'Aquí sí, software. Inventario, versiones, fechas, accesos.',
  },
}

export interface PiezaKit {
  id: string
  columna: ColumnaKit
  nombre: string
  detalle: string
  porPersona?: boolean
  disponible: boolean
}

// ── Experiencia (el diseño maestro, la biblioteca) ──────────────
export interface Experiencia {
  id: string
  nombre: string
  subtitulo: string
  narrativa?: string
  maduracion: MaduracionExp
  abreEspacioAlForo: boolean
  duracion: string
  // Cuántas veces ha corrido de verdad.
  corridas: number
  bisagras: Bisagra[]
  kit: PiezaKit[]
  notaDiseño?: string
}

// ── Capítulo, moderador, corrida ────────────────────────────────
export interface Capitulo {
  id: string
  nombre: string
  ciudad: string
  moderadorId: string
}

export interface Moderador {
  id: string
  nombre: string
  email: string
  capituloId: string
  formadoEn: string[]      // ids de experiencias en las que está formado
  desde: string
}

export interface Corrida {
  id: string
  experienciaId: string
  capituloId: string
  moderadorId: string
  fecha: string
  estado: EstadoCorrida
  personasEnElForo: number
  sede?: string
  // Preparación: qué falta antes de correr.
  preparacion: { titulo: string; hecho: boolean; fase: string }[]
  // Retorno: en qué mes va, si ya corrió.
  mesDeRetorno?: number
  notas?: string
}

// ── Datos ───────────────────────────────────────────────────────

export const EXPERIENCIAS: Experiencia[] = [
  {
    id: 'metamorfosis',
    nombre: 'Metamorfosis y Metanoia',
    subtitulo: 'Cerrando círculos',
    narrativa: 'No estás roto, estás mudando.',
    maduracion: 'piloto',
    abreEspacioAlForo: false,
    duracion: 'Un día completo',
    corridas: 1,
    notaDiseño: 'Sobre-desarrollada en lo conceptual, sub-desarrollada en lo vivencial. El retorno está entero sin diseñar.',
    bisagras: [
      { id: 'm1', tiempo: 'vispera', orden: 1, titulo: 'La carta de convocatoria', descripcion: 'Lo que reciben los miembros del foro dos semanas antes. Define el tono con el que llegan.', soporte: 'pantalla', listo: true, requiere: ['Lista del foro'] },
      { id: 'm2', tiempo: 'vispera', orden: 2, titulo: 'Lo que hay que traer', descripcion: 'Un objeto propio que represente algo que no termina de cerrarse.', soporte: 'objeto', listo: true },
      { id: 'm3', tiempo: 'vispera', orden: 3, titulo: 'Preparación de sala', descripcion: 'Checklist de materiales y disposición del espacio.', soporte: 'pantalla', listo: false },
      { id: 'm4', tiempo: 'ignicion', orden: 1, titulo: 'Muda', descripcion: 'Reconocer qué ya no sirve. Trabajo con el objeto que cada quien trajo.', soporte: 'sala', duracion: '90 min', listo: true, requiere: ['Objeto de cada participante', 'Círculo de sillas'] },
      { id: 'm5', tiempo: 'ignicion', orden: 2, titulo: 'Crisálida', descripcion: 'El tiempo intermedio. La parte más incómoda y la que no se puede acelerar.', soporte: 'sala', duracion: '120 min', listo: false },
      { id: 'm6', tiempo: 'ignicion', orden: 3, titulo: 'Eclosión', descripcion: 'Lo que emerge. Se nombra en voz alta frente al foro.', soporte: 'sala', duracion: '75 min', listo: false },
      { id: 'm7', tiempo: 'ignicion', orden: 4, titulo: 'Vuelo', descripcion: 'Ritual de cierre. Es lo único que sostiene el cuidado del participante.', soporte: 'objeto', duracion: '45 min', listo: true, requiere: ['Velas', 'Libreta de cada participante'] },
      { id: 'm8', tiempo: 'retorno', orden: 1, titulo: 'El gesto mínimo', descripcion: 'Lo que cada quien se comprometió a hacer, en una sola frase suya.', soporte: 'pantalla', listo: false },
      { id: 'm9', tiempo: 'retorno', orden: 2, titulo: 'Capa mensual', descripcion: 'Un solo puntero al mes. Nunca una racha, nunca un recordatorio de deuda.', soporte: 'pantalla', listo: false },
      { id: 'm10', tiempo: 'retorno', orden: 3, titulo: 'Cierre a seis meses', descripcion: 'Ver la raíz completa, no la rama sola. El testimonio lo entrega una persona.', soporte: 'sala', listo: false },
    ],
    kit: [
      { id: 'k1', columna: 'objeto', nombre: 'Libreta de la muda', detalle: 'Cosida a mano, papel grueso. Se escribe a mano, no se transcribe.', porPersona: true, disponible: true },
      { id: 'k2', columna: 'objeto', nombre: 'Vela de cierre', detalle: 'Para el ritual de Vuelo.', porPersona: true, disponible: true },
      { id: 'k3', columna: 'objeto', nombre: 'Caja de la crisálida', detalle: 'Sin definir. Depende del diseño de la bisagra, que falta.', porPersona: true, disponible: false },
      { id: 'k4', columna: 'humano', nombre: 'Formación del moderador', detalle: 'Dos sesiones presenciales. No existe versión en video ni la va a haber.', disponible: true },
      { id: 'k5', columna: 'humano', nombre: 'Acompañamiento de la primera corrida', detalle: 'Alguien de 4 Meaning en la sala la primera vez que un capítulo lo corre.', disponible: true },
      { id: 'k6', columna: 'administrativo', nombre: 'Guion del moderador', detalle: 'Versión 1.2. Vive en el portal.', disponible: true },
      { id: 'k7', columna: 'administrativo', nombre: 'Inventario de objetos por capítulo', detalle: 'Qué tiene cada capítulo y qué hay que reponer.', disponible: false },
      { id: 'k8', columna: 'administrativo', nombre: 'Licencia del capítulo', detalle: 'Vigencia y alcance de lo que el capítulo puede correr.', disponible: false },
    ],
  },
  {
    id: 'presente-regalo',
    nombre: 'El Presente como Regalo',
    subtitulo: '',
    maduracion: 'lista',
    abreEspacioAlForo: true,
    duracion: 'Media jornada',
    corridas: 4,
    bisagras: [
      { id: 'p1', tiempo: 'vispera', orden: 1, titulo: 'Invitación al foro', descripcion: 'Convocatoria breve, una semana antes.', soporte: 'pantalla', listo: true },
      { id: 'p2', tiempo: 'ignicion', orden: 1, titulo: 'El inventario del hoy', descripcion: 'Qué hay de valioso en el presente que no se está mirando.', soporte: 'sala', duracion: '60 min', listo: true },
      { id: 'p3', tiempo: 'ignicion', orden: 2, titulo: 'La carta al futuro', descripcion: 'Escrita a mano. No se sube ni se transcribe.', soporte: 'objeto', duracion: '45 min', listo: true },
      { id: 'p4', tiempo: 'retorno', orden: 1, titulo: 'Capa mensual', descripcion: 'En curso con el foro Anáhuac. Mes 5 de 6.', soporte: 'pantalla', listo: true },
      { id: 'p5', tiempo: 'retorno', orden: 2, titulo: 'Entrega de la carta', descripcion: 'La carta escrita en la ignición vuelve a su autor a los seis meses. Se recibe, no se descarga.', soporte: 'objeto', listo: true },
    ],
    kit: [
      { id: 'pk1', columna: 'objeto', nombre: 'Papel y sobre lacrado', detalle: 'Para la carta al futuro.', porPersona: true, disponible: true },
      { id: 'pk2', columna: 'humano', nombre: 'Formación del moderador', detalle: 'Una sesión presencial.', disponible: true },
      { id: 'pk3', columna: 'administrativo', nombre: 'Guion del moderador', detalle: 'Versión 2.0.', disponible: true },
      { id: 'pk4', columna: 'administrativo', nombre: 'Calendario de entrega de cartas', detalle: 'Cuándo vuelve cada carta a su autor.', disponible: true },
    ],
  },
  {
    id: 'nido-vacio',
    nombre: 'El Nido Vacío',
    subtitulo: '',
    maduracion: 'diseño',
    abreEspacioAlForo: true,
    duracion: 'Por definir',
    corridas: 0,
    notaDiseño: 'Su unidad de participación está sin resolver: el capítulo base es individual pero admite variante en pareja, y eso rompe el modelo.',
    bisagras: [],
    kit: [],
  },
  {
    id: 'proposito-vida',
    nombre: 'Propósito de Vida',
    subtitulo: '',
    maduracion: 'diseño',
    abreEspacioAlForo: false,
    duracion: 'Por definir',
    corridas: 0,
    notaDiseño: 'Se vende en la landing y no tiene diseño detrás. Es el hueco más urgente del catálogo.',
    bisagras: [],
    kit: [],
  },
]

export const CAPITULOS: Capitulo[] = [
  { id: 'anahuac', nombre: 'Foro Anáhuac', ciudad: 'Ciudad de México', moderadorId: 'rodrigo' },
  { id: 'monterrey', nombre: 'Foro Monterrey Norte', ciudad: 'Monterrey', moderadorId: 'ines' },
  { id: 'guadalajara', nombre: 'Foro Guadalajara', ciudad: 'Guadalajara', moderadorId: 'tomas' },
  { id: 'sansalvador', nombre: 'Foro San Salvador', ciudad: 'San Salvador', moderadorId: 'claudia' },
  { id: 'bogota', nombre: 'Foro Bogotá', ciudad: 'Bogotá', moderadorId: 'esteban' },
]

export const MODERADORES: Moderador[] = [
  { id: 'rodrigo', nombre: 'Rodrigo Lemus', email: 'rodrigo@ejemplo.mx', capituloId: 'anahuac', formadoEn: ['metamorfosis', 'presente-regalo'], desde: '2025-11' },
  { id: 'ines', nombre: 'Inés Corral', email: 'ines@ejemplo.mx', capituloId: 'monterrey', formadoEn: ['presente-regalo'], desde: '2026-02' },
  { id: 'tomas', nombre: 'Tomás Bahena', email: 'tomas@ejemplo.mx', capituloId: 'guadalajara', formadoEn: ['presente-regalo'], desde: '2026-03' },
  { id: 'claudia', nombre: 'Claudia Merino', email: 'claudia@ejemplo.sv', capituloId: 'sansalvador', formadoEn: [], desde: '2026-06' },
  { id: 'esteban', nombre: 'Esteban Ruiz', email: 'esteban@ejemplo.co', capituloId: 'bogota', formadoEn: ['presente-regalo'], desde: '2026-01' },
]

export const CORRIDAS: Corrida[] = [
  {
    id: 'c1',
    experienciaId: 'metamorfosis',
    capituloId: 'anahuac',
    moderadorId: 'rodrigo',
    fecha: '2026-08-15',
    estado: 'en_preparacion',
    personasEnElForo: 12,
    sede: 'Casa de retiros Tepoztlán',
    preparacion: [
      { titulo: 'Moderador formado', hecho: true, fase: 'Antes de confirmar' },
      { titulo: 'Acuerdo de licencia firmado', hecho: true, fase: 'Antes de confirmar' },
      { titulo: 'Lista del foro cargada', hecho: true, fase: 'Cuatro semanas antes' },
      { titulo: 'Carta de convocatoria enviada', hecho: true, fase: 'Dos semanas antes' },
      { titulo: 'Objetos del kit en sede', hecho: false, fase: 'Semana de la corrida' },
      { titulo: 'Guion de sala revisado con el moderador', hecho: false, fase: 'Semana de la corrida' },
      { titulo: 'Acompañante de 4 Meaning confirmado', hecho: false, fase: 'Semana de la corrida' },
    ],
    notas: 'Primera corrida de Metamorfosis con un capítulo externo. Crisálida y Eclosión siguen sin diseño cerrado.',
  },
  {
    id: 'c2',
    experienciaId: 'presente-regalo',
    capituloId: 'anahuac',
    moderadorId: 'rodrigo',
    fecha: '2026-03-07',
    estado: 'corrida',
    personasEnElForo: 11,
    sede: 'Oficinas del foro',
    mesDeRetorno: 5,
    preparacion: [
      { titulo: 'Moderador formado', hecho: true, fase: 'Antes de confirmar' },
      { titulo: 'Acuerdo de licencia firmado', hecho: true, fase: 'Antes de confirmar' },
      { titulo: 'Lista del foro cargada', hecho: true, fase: 'Cuatro semanas antes' },
      { titulo: 'Carta de convocatoria enviada', hecho: true, fase: 'Dos semanas antes' },
      { titulo: 'Objetos del kit en sede', hecho: true, fase: 'Semana de la corrida' },
    ],
  },
  {
    id: 'c3',
    experienciaId: 'presente-regalo',
    capituloId: 'monterrey',
    moderadorId: 'ines',
    fecha: '2026-09-19',
    estado: 'confirmada',
    personasEnElForo: 9,
    preparacion: [
      { titulo: 'Moderador formado', hecho: true, fase: 'Antes de confirmar' },
      { titulo: 'Acuerdo de licencia firmado', hecho: false, fase: 'Antes de confirmar' },
      { titulo: 'Lista del foro cargada', hecho: false, fase: 'Cuatro semanas antes' },
      { titulo: 'Carta de convocatoria enviada', hecho: false, fase: 'Dos semanas antes' },
      { titulo: 'Objetos del kit en sede', hecho: false, fase: 'Semana de la corrida' },
    ],
  },
  {
    id: 'c4',
    experienciaId: 'presente-regalo',
    capituloId: 'bogota',
    moderadorId: 'esteban',
    fecha: '2026-10-24',
    estado: 'prospecto',
    personasEnElForo: 0,
    preparacion: [
      { titulo: 'Moderador formado', hecho: true, fase: 'Antes de confirmar' },
      { titulo: 'Acuerdo de licencia firmado', hecho: false, fase: 'Antes de confirmar' },
    ],
  },
  {
    id: 'c5',
    experienciaId: 'presente-regalo',
    capituloId: 'guadalajara',
    moderadorId: 'tomas',
    fecha: '2026-05-30',
    estado: 'corrida',
    personasEnElForo: 14,
    mesDeRetorno: 2,
    preparacion: [
      { titulo: 'Moderador formado', hecho: true, fase: 'Antes de confirmar' },
      { titulo: 'Acuerdo de licencia firmado', hecho: true, fase: 'Antes de confirmar' },
      { titulo: 'Lista del foro cargada', hecho: true, fase: 'Cuatro semanas antes' },
      { titulo: 'Carta de convocatoria enviada', hecho: true, fase: 'Dos semanas antes' },
      { titulo: 'Objetos del kit en sede', hecho: true, fase: 'Semana de la corrida' },
    ],
  },
]

// ── Ayudas ──────────────────────────────────────────────────────

export const ESTADO_CORRIDA: Record<EstadoCorrida, { etiqueta: string; fondo: string; texto: string }> = {
  prospecto:      { etiqueta: 'Prospecto',      fondo: 'rgba(111,119,119,.14)', texto: '#4B5563' },
  confirmada:     { etiqueta: 'Confirmada',     fondo: 'rgba(0,43,52,.12)',     texto: '#00404F' },
  en_preparacion: { etiqueta: 'En preparación', fondo: 'rgba(185,115,90,.18)',  texto: '#8F5341' },
  corrida:        { etiqueta: 'Corrida',        fondo: 'rgba(47,93,74,.14)',    texto: '#2F5D4A' },
  cancelada:      { etiqueta: 'Cancelada',      fondo: 'rgba(122,18,32,.10)',   texto: '#7A1220' },
}

export const MADURACION: Record<MaduracionExp, { etiqueta: string; fondo: string; texto: string }> = {
  'diseño':   { etiqueta: 'En diseño', fondo: 'rgba(185,115,90,.16)', texto: '#8F5341' },
  'piloto':   { etiqueta: 'En piloto', fondo: 'rgba(0,43,52,.12)',    texto: '#00404F' },
  'lista':    { etiqueta: 'Lista',     fondo: 'rgba(47,93,74,.14)',   texto: '#2F5D4A' },
  'retirada': { etiqueta: 'Retirada',  fondo: 'rgba(111,119,119,.14)',texto: '#4B5563' },
}

export function experiencia(id: string) {
  return EXPERIENCIAS.find(e => e.id === id)
}
export function capitulo(id: string) {
  return CAPITULOS.find(c => c.id === id)
}
export function moderador(id: string) {
  return MODERADORES.find(m => m.id === id)
}
export function corrida(id: string) {
  return CORRIDAS.find(c => c.id === id)
}
export function fecha(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
