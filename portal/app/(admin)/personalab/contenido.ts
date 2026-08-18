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

  // ══════════════════════════════════════════════════════════════
  // EL AGRADECIMIENTO
  // ══════════════════════════════════════════════════════════════
  // Escrito sobre el diseño que ya vive en Notion. Las notas de sala llevan
  // la doctrina del moderador: donde esta el riesgo, que se dice en voz y
  // que NO se hace. Son la mitad del producto que el moderador compra.

  // ── ag1 · La carta de convocatoria (vispera) ──
  {
    id: 'g1', bisagraId: 'ag1', orden: 1, tipo: 'texto', audiencia: 'todos',
    texto: 'En dos semanas vamos a pasar un día juntos, y va a ser sobre el agradecimiento.\n\nNo hace falta que prepares nada. No hay lectura previa, no hay que traer una lista, y no vamos a pedirte que te pongas de pie a decir por qué estás agradecido.',
  },
  {
    id: 'g2', bisagraId: 'ag1', orden: 2, tipo: 'texto', audiencia: 'todos',
    texto: '## Lo que sí vamos a hacer\n\nVamos a buscar **un momento**. Uno solo, concreto, en el que alguien te sostuvo. No una idea general de que la vida es buena, sino una tarde, una persona, algo que pasó de verdad.\n\nDe ahí sale una historia que es tuya, y esa historia se queda contigo mucho después del día.',
  },
  {
    id: 'g3', bisagraId: 'ag1', orden: 3, tipo: 'aviso', audiencia: 'todos',
    texto: 'Si llegas en un mal momento, ven igual. No vamos a pedirte que finjas que estás bien, y en ningún ejercicio es obligatorio hablar.',
  },
  {
    id: 'g4', bisagraId: 'ag1', orden: 4, tipo: 'nota', audiencia: 'moderador',
    texto: 'Manda esta carta catorce días antes, no antes. Si se manda con un mes, se olvida; con una semana, la gente ya se comprometió a otra cosa.\n\nSi alguien te contesta preguntando qué tiene que llevar, responde solo "nada". Cualquier tarea previa arranca el día con deuda, y el día se sostiene sobre lo contrario.',
  },

  // ── ag2 · La noche de antes (vispera) ──
  {
    id: 'g5', bisagraId: 'ag2', orden: 1, tipo: 'texto', audiencia: 'todos',
    texto: 'Mañana nos vemos.\n\nLlega sin prisa, y si puedes, deja libre lo que viene después. Vas a salir con algo que no vas a querer meter entre dos pendientes.',
  },
  {
    id: 'g6', bisagraId: 'ag2', orden: 2, tipo: 'pausa', audiencia: 'todos',
  },
  {
    id: 'g7', bisagraId: 'ag2', orden: 3, tipo: 'texto', audiencia: 'todos',
    texto: 'Nada más. Duerme.',
  },
  {
    id: 'g8', bisagraId: 'ag2', orden: 4, tipo: 'nota', audiencia: 'moderador',
    texto: 'Este mensaje es corto a propósito y no debe crecer. La tentación de agregarle logística, hora y dirección es fuerte: mándala aparte. Este mensaje solo baja el ritmo.',
  },

  // ── ag3 · Bajar el ritmo (ignicion, tracto 1) ──
  {
    id: 'g9', bisagraId: 'ag3', orden: 1, tipo: 'texto', audiencia: 'todos',
    texto: 'Llevas semanas resolviendo cosas. Eso no está mal, pero tiene un costo: cuando uno vive resolviendo, deja de notar.\n\nLo que tenemos alrededor se vuelve paisaje. Sigue ahí, y deja de verse.',
  },
  {
    id: 'g10', bisagraId: 'ag3', orden: 2, tipo: 'consigna', audiencia: 'todos',
    texto: 'Nombra tres cosas de esta semana que estuvieron bien y que no notaste mientras pasaban. Pequeñas. Que no sean logros.',
  },
  {
    id: 'g11', bisagraId: 'ag3', orden: 3, tipo: 'pausa', audiencia: 'todos',
  },
  {
    id: 'g12', bisagraId: 'ag3', orden: 4, tipo: 'nota', audiencia: 'moderador',
    texto: 'Este tracto termina ARRIBA. Es cálido y no baja. Si alguien se adelanta y trae algo hondo, agradécelo y guárdalo: "eso vamos a trabajarlo en un rato, no lo sueltes". Bajar aquí desordena todo el día.\n\nInsiste en que sean cosas pequeñas. Cuando alguien dice "mi familia", pide el momento: qué día, qué pasó.',
  },
  {
    id: 'g13', bisagraId: 'ag3', orden: 5, tipo: 'nota', audiencia: 'moderador',
    texto: 'Al terminar va un descanso ligero, incluso social. Es el único del día donde está bien que la gente hable de otra cosa.',
  },

  // ── ag4 · Alguien te sostuvo (ignicion, tracto 1) ──
  {
    id: 'g14', bisagraId: 'ag4', orden: 1, tipo: 'texto', audiencia: 'todos',
    texto: 'Nadie se dio a sí mismo la existencia. Todo lo que somos, empezando por estar aquí, lo recibimos de alguien.\n\nEso suena a frase. Deja de sonar a frase cuando le pones un nombre y una fecha.',
  },
  {
    id: 'g15', bisagraId: 'ag4', orden: 2, tipo: 'cita', audiencia: 'todos',
    texto: 'La comunión de las conciencias es el hecho primitivo.',
    autor: 'Maurice Nédoncelle',
  },
  {
    id: 'g16', bisagraId: 'ag4', orden: 3, tipo: 'consigna', audiencia: 'todos',
    texto: 'Busca un momento en que alguien te sostuvo: te ayudó, te cuidó, o simplemente estuvo cuando no podías solo. Uno. Con fecha, con lugar y con cara.',
  },
  {
    id: 'g17', bisagraId: 'ag4', orden: 4, tipo: 'gesto', audiencia: 'todos',
    texto: 'Escríbelo a mano en la primera página. Todavía no la historia completa: solo el momento, tal como te llega.',
  },
  {
    id: 'g18', bisagraId: 'ag4', orden: 5, tipo: 'nota', audiencia: 'moderador',
    texto: 'Va a haber alguien que no tenga un rostro claro. Hay quien agradece a la vida, o a algo que recibió sin saber de quién. No lo corrijas y no le pidas que encuentre una persona: lo que se pide es concreción, no destinatario.\n\nLo que sí pides siempre es el detalle. Un episodio real deja huella; un concepto no.',
  },

  // ── ag5 · La grieta (ignicion, tracto 2) ──
  {
    id: 'g19', bisagraId: 'ag5', orden: 1, tipo: 'aviso', audiencia: 'todos',
    texto: 'Aquí puede aparecer emoción, y puede no aparecer. Las dos cosas están bien. Si en algún momento quieres parar, paras, y no tienes que explicar por qué.',
  },
  {
    id: 'g20', bisagraId: 'ag5', orden: 2, tipo: 'texto', audiencia: 'todos',
    texto: 'Vuelve al momento que escribiste. No a lo que significa. Al momento.\n\nDónde estabas. Qué hora era. Qué te dijo esa persona, con sus palabras. Qué habrías hecho si no hubiera estado.',
  },
  {
    id: 'g21', bisagraId: 'ag5', orden: 3, tipo: 'consigna', audiencia: 'todos',
    texto: 'Quédate ahí un momento, sin escribir. Solo mirándolo.',
  },
  {
    id: 'g22', bisagraId: 'ag5', orden: 4, tipo: 'pausa', audiencia: 'todos',
  },
  {
    id: 'g23', bisagraId: 'ag5', orden: 5, tipo: 'nota', audiencia: 'moderador',
    texto: 'ESTA ES LA BISAGRA DELICADA DEL DÍA. Tres reglas.\n\nUno: el permiso de parar se dice EN VOZ, antes de empezar, no se deja en letra chica. Y se dice sin dramatismo, como quien menciona dónde está la salida.\n\nDos: si alguien llora, no lo consueles ni lo señales. Sostén el silencio. Consolar rápido comunica que la emoción es un problema que hay que apagar.\n\nTres: tú no eres terapeuta y esto no es terapia. Si alguien abre algo que claramente te queda grande, no lo trabajes en la sala. Acompáñalo al descanso, y ahí le pasas el puntero de apoyo.',
  },
  {
    id: 'g24', bisagraId: 'ag5', orden: 6, tipo: 'nota', audiencia: 'moderador',
    texto: 'NO cortes aquí. La siguiente bisagra va pegada a esta, sin descanso en medio. La grieta abre y la historia contiene lo que se abrió; si mandas al foro a un café en este punto, la gente sale cruda y no vuelve igual.',
  },
  {
    id: 'g25', bisagraId: 'ag5', orden: 7, tipo: 'video', audiencia: 'moderador',
    duracion: '14 min',
    pie: 'De la formación: cómo se sostiene un silencio de treinta segundos sin rescatar a nadie.',
  },

  // ── ag6 · Tu historia (ignicion, tracto 2) ──
  {
    id: 'g26', bisagraId: 'ag6', orden: 1, tipo: 'texto', audiencia: 'todos',
    texto: 'Lo que acabas de mirar todavía no es una historia. Es un recuerdo suelto, y los recuerdos sueltos se pierden.\n\nUna historia tiene tres partes: **qué era difícil**, **quién apareció**, y **quién eres tú por eso**.',
  },
  {
    id: 'g27', bisagraId: 'ag6', orden: 2, tipo: 'texto', audiencia: 'todos',
    texto: 'La segunda parte es donde casi todos se equivocan, y es la que más pesa.\n\nNo escribas lo que esa persona **hizo por ti**. Escribe **cómo es ella**. Qué la llevó a aparecer. Qué tuvo que poner de su parte. Qué dice de ella que estuviera ahí.\n\nLa diferencia parece pequeña y no lo es. Contar el favor te deja a ti en el centro. Contar a la persona la pone a ella.',
  },
  {
    id: 'g28', bisagraId: 'ag6', orden: 3, tipo: 'consigna', audiencia: 'todos',
    texto: 'Escribe tu historia con esas tres partes, y en la segunda habla de quién es esa persona, no de lo que te dio. Que quepa en una página. No la hagas bonita.',
  },
  {
    id: 'g29', bisagraId: 'ag6', orden: 4, tipo: 'gesto', audiencia: 'todos',
    texto: 'A mano, en la libreta. Esta es la que se va a quedar seis meses contigo, así que escríbela como hablas.',
  },
  {
    id: 'g30', bisagraId: 'ag6', orden: 5, tipo: 'nota', audiencia: 'moderador',
    texto: 'LA SEGUNDA PARTE ES LA QUE HAY QUE VIGILAR. Que hable de la persona, no del favor. Esa instrucción es la que tiene la mejor evidencia de toda la experiencia: en trescientas setenta conversaciones grabadas, lo que hizo que el otro se sintiera visto y querido fue que lo alabaran a él, no que le describieran el beneficio recibido.\n\nY tiene un segundo efecto: hablar de la persona en vez del favor baja la sensación de deuda, que es el riesgo del cierre del día.',
  },
  {
    id: 'g31', bisagraId: 'ag6', orden: 6, tipo: 'nota', audiencia: 'moderador',
    texto: 'La tercera parte, "quién soy por eso", es la que casi todos se saltan. Pásate por las mesas y pregúntala uno por uno.\n\nY vigila la tentación de la moraleja. Si alguien escribe "aprendí a valorar lo que tengo", devuélvelo al hecho: qué cambió en ti, en concreto, después de aquello.',
  },
  {
    id: 'g32', bisagraId: 'ag6', orden: 7, tipo: 'nota', audiencia: 'moderador',
    texto: 'Aquí sí va descanso, y es distinto al primero: silencio, sin prisa, sin música. No es un coffee break. Dilo antes de soltarlos, o la sala se llena de conversación y se pierde lo que se acaba de abrir.',
  },

  // ── ag7 · Decirlo en voz alta (ignicion, tracto 3) ──
  {
    id: 'g33', bisagraId: 'ag7', orden: 1, tipo: 'texto', audiencia: 'todos',
    texto: 'Hasta aquí trabajaste solo, y eso no fue el calentamiento. Era la condición.\n\nUno no puede entregar lo que todavía no tiene. Ahora que la historia es tuya, se puede decir.',
  },
  {
    id: 'g34', bisagraId: 'ag7', orden: 2, tipo: 'consigna', audiencia: 'todos',
    texto: 'De dos en dos. Lee tu historia completa a una sola persona, y después escucha la suya. Sin explicarla antes ni justificarla después.',
  },
  {
    id: 'g35', bisagraId: 'ag7', orden: 3, tipo: 'aviso', audiencia: 'todos',
    texto: 'Nadie comenta la historia de nadie. No se aconseja, no se compara y no se responde con una propia. Se escucha, y ya.',
  },
  {
    id: 'g36', bisagraId: 'ag7', orden: 4, tipo: 'pausa', audiencia: 'todos',
  },
  {
    id: 'g37', bisagraId: 'ag7', orden: 5, tipo: 'texto', audiencia: 'todos',
    texto: 'Ahora el círculo completo, y aquí ya nadie tiene que leer.\n\nQuien quiera decir algo, dice algo. Puede ser su historia entera, o una línea, o el nombre de la persona que apareció en ella.',
  },
  {
    id: 'g38', bisagraId: 'ag7', orden: 6, tipo: 'nota', audiencia: 'moderador',
    texto: 'POR QUÉ PRIMERO DE DOS EN DOS Y NO EN CÍRCULO. Cuando se comparó, la conversación uno a uno produjo más conexión y más apoyo percibido que decirlo en público. El plenario no gana nada medible y sí trae un riesgo: quien escucha diez historias hermosas sin tener una a la altura puede salir peor de como entró.\n\nLa pareja resuelve las dos cosas. Todos hablan, todos son escuchados, y nadie se compara contra diez.',
  },
  {
    id: 'g39', bisagraId: 'ag7', orden: 7, tipo: 'nota', audiencia: 'moderador',
    texto: 'Arma tú las parejas, no las dejes al azar de quién se sienta con quién. Y separa a los que llegaron juntos: con un conocido de años se cuenta la versión que ya conoce.',
  },
  {
    id: 'g40', bisagraId: 'ag7', orden: 8, tipo: 'nota', audiencia: 'moderador',
    texto: 'EN EL CÍRCULO, el riesgo es que se vuelva competencia: quién agradece mejor, quién se quiebra más. La regla de no comentar hay que sostenerla desde el primer turno; si dejas pasar un aplauso, ya no la recuperas.\n\nEmpieza tú, con algo tuyo de verdad y corto. El largo del primer turno fija el largo de todos.\n\nY el círculo es voluntario de verdad. Si hablan cuatro de doce, estuvo bien. Que no hable nadie también es un resultado, no un fracaso tuyo.',
  },

  // ── ag8 · La llave (ignicion, tracto 3) ──
  {
    id: 'g41', bisagraId: 'ag8', orden: 1, tipo: 'objeto', audiencia: 'todos',
    texto: 'Tu libreta',
    pie: 'La primera página ya no se toca. Lo que sigue son las páginas de después.',
  },
  {
    id: 'g42', bisagraId: 'ag8', orden: 2, tipo: 'texto', audiencia: 'todos',
    texto: 'Esa página es tu ancla. Durante los próximos seis meses vas a volver a ella, y no vas a escribir encima: vas a escribir después.\n\nLa raíz no cambia. Lo que crece son las ramas.',
  },
  {
    id: 'g43', bisagraId: 'ag8', orden: 3, tipo: 'consigna', audiencia: 'todos',
    texto: 'Elige tu ritmo, ahora: una vez por semana o dos. Y elige el día. Escríbelo en la segunda página.',
  },
  {
    id: 'g44', bisagraId: 'ag8', orden: 4, tipo: 'gesto', audiencia: 'todos',
    texto: 'Ensáyalo una vez, aquí, con todos: abre en la página del ancla, quédate en silencio, ciérrala. Sin escribir nada todavía.',
  },
  {
    id: 'g45', bisagraId: 'ag8', orden: 5, tipo: 'nota', audiencia: 'moderador',
    texto: 'El ritmo se elige AQUÍ, contigo delante, no después en frío. Y el ensayo se hace de verdad, aunque se sienta raro hacer un simulacro de algo tan pequeño: es lo que convierte el gesto en reflejo.\n\nAntes de cerrar el día, confirma con los ojos que cada quien tiene su ancla sellada y su ritmo escrito. Eso se ve, no se asume.',
  },
  {
    id: 'g46', bisagraId: 'ag8', orden: 6, tipo: 'archivo', audiencia: 'moderador',
    nombreArchivo: 'guion-de-sala-agradecimiento-v1.pdf',
    peso: '340 KB',
    descargable: true,
    pie: 'El guion completo del día, con los tiempos y los cortes. Imprímelo: no lo leas del teléfono en la sala.',
  },

  // ── ag9 · Lo que vas a devolver (ignicion, tracto 3) ──
  {
    id: 'g47', bisagraId: 'ag9', orden: 1, tipo: 'cita', audiencia: 'todos',
    texto: 'Nadie puede dar lo que no ha recibido.',
    autor: 'Tomás de Aquino',
  },
  {
    id: 'g48', bisagraId: 'ag9', orden: 2, tipo: 'aviso', audiencia: 'todos',
    texto: 'Si en algún momento de hoy sentiste que quedaste debiendo algo, eso es normal y no significa que debas nada. Un regalo que se convierte en factura deja de ser regalo, y lo que recibiste fue un regalo.',
  },
  {
    id: 'g49', bisagraId: 'ag9', orden: 3, tipo: 'texto', audiencia: 'todos',
    texto: 'No hay nada que saldar. Esa persona no te prestó: te dio.\n\nLo que sí pasa, cuando uno se sabe sostenido, es que le nacen ganas de sostener. No es una obligación que te queda. Es algo que te sale.',
  },
  {
    id: 'g50', bisagraId: 'ag9', orden: 4, tipo: 'consigna', audiencia: 'todos',
    texto: 'Si te nace un nombre, quédatelo. Si no te nace ninguno, también está bien: hoy no es el día de decidir eso.',
  },
  {
    id: 'g51', bisagraId: 'ag9', orden: 5, tipo: 'nota', audiencia: 'moderador',
    texto: 'ESTA ES LA BISAGRA DE MAYOR RIESGO DEL DÍA, y no es la que parece. En el estudio más grande que existe, con diez mil personas en treinta y cuatro países, las prácticas de agradecimiento SUBEN la sensación de estar endeudado. Es el único efecto adverso que se mide al alza de forma consistente, y este es el momento donde aparece.\n\nPor eso el aviso de arriba va antes que nada, y por eso la consigna admite quedarse sin nombre. Alguien que sale con la sensación de deber un favor sale peor de como entró.',
  },
  {
    id: 'g52', bisagraId: 'ag9', orden: 6, tipo: 'nota', audiencia: 'moderador',
    texto: 'LO QUE NO SE HACE AQUÍ: no pidas que lo digan en voz alta, no armes una ronda de compromisos, no preguntes "¿y qué vas a hacer con esto?", y no pongas fechas.\n\nTomás distingue la deuda legal, que se exige, de la deuda moral, que obliga desde dentro. Todo lo de esa lista convierte la segunda en la primera.\n\nCierra con la palabra de cierre, la que se transmite en la formación. Es la que tiene que rimar con la de los seis meses.',
  },

  // ── ag10 · El gesto de cada semana (retorno) ──
  {
    id: 'g53', bisagraId: 'ag10', orden: 1, tipo: 'texto', audiencia: 'todos',
    texto: 'Siempre igual, para que se vuelva reflejo.\n\nAbres en la página del ancla, nunca en blanco. Te quedas quieto un momento. Escribes la rama de esta semana. Y cierras viendo la raíz completa otra vez, no la rama sola.',
  },
  {
    id: 'g54', bisagraId: 'ag10', orden: 2, tipo: 'consigna', audiencia: 'todos',
    texto: 'Esta semana, la lente es: alguien que te sostuvo sin que se lo pidieras.',
  },
  {
    id: 'g55', bisagraId: 'ag10', orden: 3, tipo: 'aviso', audiencia: 'todos',
    texto: 'Si se pone pesado, salta directo al cierre sin terminar la rama. Eso cuenta como un retorno completo. Parar también es haber terminado.',
  },

  // ── ag11 · La capa del mes (retorno) ──
  {
    id: 'g56', bisagraId: 'ag11', orden: 1, tipo: 'texto', audiencia: 'todos',
    texto: 'Este mes no vas a añadir. Vas a mirar lo que añadiste.\n\nRelee las ramas de las últimas cuatro semanas, completas, antes de escribir nada.',
  },
  {
    id: 'g57', bisagraId: 'ag11', orden: 2, tipo: 'consigna', audiencia: 'todos',
    texto: 'Escribe una sola línea sobre lo que notas al leerlas juntas. No una rama nueva: lo que se repite.',
  },

  // ── ag12 · Recibir el libro (retorno) ──
  {
    id: 'g58', bisagraId: 'ag12', orden: 1, tipo: 'objeto', audiencia: 'todos',
    texto: 'Tu libro',
    pie: 'Veinticuatro semanas encuadernadas. Se recibe en la mano.',
  },
  {
    id: 'g59', bisagraId: 'ag12', orden: 2, tipo: 'texto', audiencia: 'todos',
    texto: 'Empezó con una página y una persona que te sostuvo.\n\nEsto es lo que creció encima.',
  },
  {
    id: 'g60', bisagraId: 'ag12', orden: 3, tipo: 'nota', audiencia: 'moderador',
    texto: 'El libro no se manda y no se descarga: se entrega, uno por uno, diciendo el nombre. Convoca al foro para esto aunque hayan pasado seis meses y cueste juntarlos.\n\nLa palabra de cierre retoma la del día cero. Quien no la recuerde, que no improvise: pídesela a quien lo formó.',
  },
  {
    id: 'g61', bisagraId: 'ag12', orden: 4, tipo: 'imagen', audiencia: 'moderador',
    pie: 'El libro terminado, para que sepas qué estás prometiendo cuando lo anuncias el día cero.',
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
