// ── EL CONTRATO DE BLOQUE ───────────────────────────────────────────────
//
// Un solo sitio donde se dice qué tipos de bloque existen, qué campos lleva
// cada uno, cuáles son obligatorios y cómo se traduce la fila de la base al
// objeto que pinta la pantalla. Todo lo demás deriva de aquí.
//
// POR QUÉ EXISTE. Antes de este archivo, el mismo conocimiento estaba escrito
// en sitios que nada mantenía iguales: el tipo `TipoBloque`, el `CATALOGO`, el
// mapa de márgenes de `Bloques.tsx`, las reglas de `revision.ts`, el mapeo del
// lector en `lectura.ts`, el mapeo inverso de `almacenRemoto.ts` y las tres
// listas sueltas de `Editor.tsx`. Todo eso deriva ahora de aquí.
//
// La prueba de que eso no era teoría: el tipo `audio` se agregó a la base el
// 11 de septiembre de 2026 y consiguió DOS de los doce. Durante dos días
// existió en el esquema y se pintaba como nada, porque el `switch` del
// renderizador terminaba en `default: return null`. Sin error, sin hueco,
// sin señal. Nadie lo iba a descubrir salvo publicando uno.
//
// CUÁNTO CUESTA HOY AGREGAR UN TIPO, CONTADO Y NO ESTIMADO. Aquí decía
// "tres sitios, uno para decidir y dos que no se pueden olvidar". Era falso,
// y Leo lo contó ejecutando el ejercicio el 2026-09-13. Son trece, de los
// cuales SOLO DOS los fuerza el compilador:
//
//   FORZADOS (no compila si los olvidas):
//     1. la entrada de este contrato,
//     2. su caso de render en `Bloques.tsx`.
//
//   SUELTOS, y cada uno falla en silencio:
//     3. `almacen.ts` `bloqueNuevo`, cuyo `default` siembra un campo que el
//        tipo puede no tener,
//     4. `almacen.ts` `cambiarAudiencia`, que solo conoce `nota`,
//     5. el rótulo del formulario en `Editor.tsx`,
//     6. la etiqueta y el placeholder del pie, en el mismo archivo,
//     7. la escalera de campos del formulario sin medio,
//     8. `SubirArchivo.tsx`, qué extensiones acepta,
//     9. `SubirArchivo.tsx`, su copy y sus íconos,
//    10. `lib/personalab/medios.ts`, los mimes y el bucket de la familia,
//    11. la entrega propia del lector, en la página de la bisagra,
//    12. el valor del enum `pl_tipo_bloque`, en una migración,
//    13. su rama en `blocks_contenido_por_tipo`, cuyo `else` exige texto por
//        descarte, así que un tipo sin rama nace rechazado por la base.
//
// Del 3 al 11 se van cayendo con las etapas 3 y 5. Están escritos con
// nombre a propósito: la lección de `audio` es que lo que no está nombrado
// no se agrega, y el próximo tipo lo va a agregar alguien que lea esto.
//
// LO QUE ESTE ARCHIVO TODAVÍA NO HACE, y por qué. `Bloque` sigue siendo una
// interfaz plana con campos opcionales, y no un tipo por variante. Un tipo
// por variante es lo correcto y exige cirugía en `Editor.tsx`, que se
// reconstruye en la Etapa 3. Entra ahí, contra el editor nuevo, para no
// hacerlo dos veces. Mientras tanto, las DOS comprobaciones del final de este
// archivo mantienen unidos el contrato y la interfaz, en los dos sentidos.
//
// Campos PROHIBIDOS en todo el modelo del participante, por el léxico del
// Consejo #002: progress, completion_pct, score, streak, badge, rank, quiz.

// ── Piezas del contrato ─────────────────────────────────────────────────

// Cómo se captura y cómo se coacciona un campo al leerlo de la base.
export type ClaseCampo =
  | 'texto'     // varias líneas, admite markdown restringido
  | 'linea'     // una sola línea
  | 'numero'
  | 'booleano'
  | 'url'

// Qué pasa en la compuerta de publicación si el campo está vacío.
//
// La distinción es la de `revision.ts` y no se toca: IMPIDE es lo que
// dejaría contenido roto del lado del participante; ADVIERTE es lo que
// probablemente sea un olvido, pero puede ser deliberado.
export type Exigencia = 'impide' | 'advierte' | 'opcional'

export interface Campo {
  clase: ClaseCampo
  etiqueta: string
  exigencia: Exigencia
  // El texto que ve quien escribe cuando falta. Vive aquí y no en
  // `revision.ts` porque es parte de la definición del campo, no de la
  // compuerta: la compuerta solo lo enseña.
  queFalta?: string
  comoSeArregla?: string
  // Solo para 'numero'.
  min?: number
  max?: number
  // QUIÉN PONE ESTE VALOR. Por defecto, la persona que escribe el contenido.
  // 'sistema' significa que lo produce el propio producto (hoy: la subida de
  // un archivo, que devuelve su nombre y su peso) y que NO se le debe ofrecer
  // a nadie un campo para teclearlo.
  //
  // Está declarado antes de tener consumidor, y a propósito: el editor
  // reconstruido de la Etapa 3 va a pintar el formulario recorriendo estos
  // campos, y sin esta marca se encontraría ofreciéndole a un moderador
  // teclear a mano el peso de un PDF. Hallazgo de Daniel. Los dos campos que
  // la llevan desaparecen en la Etapa 5, cuando el peso y el nombre se lean
  // de la fila de `media` en vez de copiarse al jsonb.
  origen?: 'sistema'
}

// Los buckets de Storage separan por familia porque el techo de tamaño es
// POR BUCKET: meter un master WAV junto al video obligaría a subir el techo
// de los dos. El detalle de mimes y límites es de la Etapa 5; aquí solo se
// dice de qué familia es el medio de cada tipo.
export type FamiliaMedio = 'documento' | 'imagen' | 'video' | 'audio'

export interface Medio {
  familia: FamiliaMedio
  // Si además del archivo subido se acepta una URL externa. Esto no es una
  // preferencia: espeja la rama del constraint `blocks_contenido_por_tipo`,
  // que para video y audio pide `media_id is not null or url <> ''` y para
  // imagen y archivo exige `media_id` sin salida.
  admiteUrl: boolean
  // QUÉ HACE LA COMPUERTA SI FALTA EL ARCHIVO, y por qué esto es dato y no
  // una constante escrita en `revision.ts`.
  //
  // La verdad del esquema es que sin `media_id` la base rechaza el bloque.
  // Pero HOY NADIE ESCRIBE `media_id`: ni `crearBloque` ni `guardarBloque` lo
  // mandan, y el editor solo guarda nombre, peso y url. O sea que poner
  // 'impide' aquí ahora produce una compuerta que nadie puede satisfacer:
  // le dice a quien escribe "arregla esto" sobre algo que no tiene arreglo
  // desde ninguna pantalla. Eso no es fallar cerrado, es una pared.
  //
  // Así que hoy es 'advierte', con copy que dice la verdad completa, y pasa a
  // 'impide' en la Etapa 3, el día que el editor escriba `media_id` de
  // verdad. Cambiar una palabra por tipo, y la compuerta se endurece sola.
  // Hallazgo de Leo: mi versión anterior dejó `presente-regalo` sin poder
  // publicarse y sin forma de desbloquearla.
  exigencia: Extract<Exigencia, 'impide' | 'advierte'>
}

export interface Definicion {
  nombre: string
  ayuda: string
  // Dónde aparece en la paleta del editor. Antes eran dos arreglos sueltos.
  frecuencia: 'frecuente' | 'ocasional'
  // Ritmo vertical de la especificación, sección 5.3. Base 4px.
  margen: string
  campos: Record<string, Campo>
  medio?: Medio
}

// ── El contrato ─────────────────────────────────────────────────────────
//
// Criterio para abrir un tipo nuevo, de la síntesis del Consejo: cada tipo
// tiene un caso real en el dominio hoy, o lo exige el encargo. Lo demás se
// descarta con su razón escrita.
//
// Descartados y por qué: `titulo` y `separador` se absorben (## vive en el
// markdown, y `pausa` es el único separador que la marca admite). `llamado`
// y `kit_ref` se van por cero casos. `certificado` no existe: el testimonio
// lo entrega una persona.

const FALTA_TEXTO = {
  queFalta: 'quedó sin texto.',
  comoSeArregla: 'Escríbelo, o quita el bloque si ya no hace falta.',
} as const

export const CONTRATO = {
  texto: {
    nombre: 'Texto',
    ayuda: 'Lo que se lee. Admite negrita, cursiva y subtítulos.',
    frecuencia: 'frecuente',
    margen: '', // el propio markdown pone su margen
    campos: {
      texto: { clase: 'texto', etiqueta: 'Texto', exigencia: 'impide', ...FALTA_TEXTO },
    },
  },

  cita: {
    nombre: 'Cita',
    ayuda: 'Una voz que no es la nuestra. Siempre con atribución.',
    frecuencia: 'frecuente',
    margen: 'mt-10 md:mt-[52px]',
    campos: {
      texto: { clase: 'texto', etiqueta: 'Cita', exigencia: 'impide', ...FALTA_TEXTO },
      autor: {
        clase: 'linea',
        etiqueta: 'Quién lo dijo',
        exigencia: 'advierte',
        queFalta: 'no dice quién lo dijo.',
        comoSeArregla: 'Una voz sin nombre se lee como nuestra.',
      },
    },
  },

  consigna: {
    nombre: 'Consigna',
    ayuda: 'Lo que se le pide hacer a la persona, en una sola instrucción.',
    frecuencia: 'frecuente',
    margen: 'mt-8 md:mt-10',
    campos: {
      texto: { clase: 'texto', etiqueta: 'Consigna', exigencia: 'impide', ...FALTA_TEXTO },
    },
  },

  aviso: {
    nombre: 'Aviso',
    ayuda: 'Algo que hay que saber antes de seguir.',
    frecuencia: 'ocasional',
    margen: 'mt-8 md:mt-10',
    campos: {
      texto: { clase: 'texto', etiqueta: 'Aviso', exigencia: 'impide', ...FALTA_TEXTO },
    },
  },

  nota: {
    nombre: 'Nota',
    ayuda: 'Solo para el moderador. El participante nunca la ve.',
    frecuencia: 'frecuente',
    margen: 'mt-8 md:mt-10',
    campos: {
      texto: { clase: 'texto', etiqueta: 'Nota', exigencia: 'impide', ...FALTA_TEXTO },
    },
  },

  pausa: {
    nombre: 'Pausa',
    ayuda: 'Un respiro. No lleva contenido.',
    frecuencia: 'frecuente',
    margen: 'my-20 md:my-24',
    campos: {
      // El piso de tiempo: los segundos mínimos que esa bisagra dura antes
      // de ofrecer el paso siguiente. Se escribe a mano, nunca lo infiere el
      // sistema (decisión de Leo). Sin el campo, la pausa se comporta como
      // siempre, sin ninguna demora.
      //
      // EL TECHO DE 30 ESTÁ AQUÍ Y NO SOLO EN `PisoDeTiempo.tsx`. La pantalla
      // del participante lo recorta al pintar, así que un 600 tecleado por
      // error se veía como 30 y nadie se enteraba de que el dato estaba mal.
      //
      // Quien lee `max` hoy es la compuerta de publicación, que avisa del dato
      // fuera de rango. El editor todavía no tiene campo para escribir los
      // segundos (se teclean en la tabla de Supabase), así que no puede
      // impedirlo al escribir; eso llega con el editor reconstruido. Lo digo
      // aquí porque la versión anterior de este comentario afirmaba que el
      // editor ya lo impedía, y era falso.
      segundos: {
        clase: 'numero',
        etiqueta: 'Segundos de espera',
        exigencia: 'opcional',
        min: 0,
        max: 30,
      },
    },
  },

  gesto: {
    nombre: 'Gesto',
    ayuda: 'Lo que se escribe a mano. No se sube ni se transcribe.',
    frecuencia: 'frecuente',
    margen: 'mt-8 md:mt-10',
    campos: {
      texto: { clase: 'texto', etiqueta: 'Gesto', exigencia: 'impide', ...FALTA_TEXTO },
    },
  },

  objeto: {
    nombre: 'Objeto',
    ayuda: 'Una pieza física que hay que tener en la mano.',
    frecuencia: 'ocasional',
    margen: 'mt-8 md:mt-10',
    campos: {
      texto: {
        clase: 'linea',
        etiqueta: 'Qué se tiene en la mano',
        exigencia: 'impide',
        queFalta: 'quedó sin nombre.',
        comoSeArregla: 'Di qué se tiene en la mano.',
      },
      pie: {
        clase: 'linea',
        etiqueta: 'Qué hacer con él',
        exigencia: 'advierte',
        queFalta: 'no dice qué hacer con él.',
        comoSeArregla: 'Agrega una frase al pie.',
      },
    },
  },

  archivo: {
    nombre: 'Archivo',
    ayuda: 'Un PDF. Puede entregarse para imprimir o llenar.',
    frecuencia: 'ocasional',
    margen: 'mt-8 md:mt-10',
    medio: { familia: 'documento', admiteUrl: false, exigencia: 'advierte' },
    campos: {
      pie: { clase: 'linea', etiqueta: 'Pie', exigencia: 'opcional' },
      // DESCARGABLE YA NO ES SOLO DEL MODERADOR. El esquema llevaba escrita
      // la regla "lo que se entrega al participante se recibe, no se
      // descarga", que era cierta para la sala. El producto digital la
      // jubila por decisión de Francisco del 2026-09-13: al participante
      // digital sí se le puede pedir que imprima o descargue su hoja de
      // trabajo. La consecuencia de privacidad (el registro de descargas
      // guarda IP y navegador) se resuelve en la Etapa 5, y la decisión fue
      // que la descarga del participante no deja ese rastro.
      descargable: { clase: 'booleano', etiqueta: 'Se puede descargar', exigencia: 'opcional' },
      // Los pone la subida, no una persona. Ver `origen` arriba.
      nombreArchivo: { clase: 'linea', etiqueta: 'Nombre del archivo', exigencia: 'opcional', origen: 'sistema' },
      peso: { clase: 'linea', etiqueta: 'Peso', exigencia: 'opcional', origen: 'sistema' },
    },
  },

  imagen: {
    nombre: 'Imagen',
    ayuda: 'Con pie de foto.',
    frecuencia: 'ocasional',
    margen: 'mt-9 md:mt-12',
    medio: { familia: 'imagen', admiteUrl: false, exigencia: 'advierte' },
    campos: {
      pie: { clase: 'linea', etiqueta: 'Pie de foto', exigencia: 'opcional' },
      url: { clase: 'url', etiqueta: 'Enlace', exigencia: 'opcional' },
    },
  },

  video: {
    nombre: 'Video',
    ayuda: 'Subido, o de Vimeo o YouTube en modo no listado.',
    frecuencia: 'ocasional',
    margen: 'mt-9 md:mt-12',
    medio: { familia: 'video', admiteUrl: true, exigencia: 'advierte' },
    campos: {
      pie: { clase: 'linea', etiqueta: 'Pie', exigencia: 'opcional' },
      duracion: { clase: 'linea', etiqueta: 'Duración', exigencia: 'opcional' },
      url: { clase: 'url', etiqueta: 'Enlace', exigencia: 'opcional' },
    },
  },

  // EL TIPO QUE EXISTÍA EN LA BASE Y NO EN EL PRODUCTO. Agregado al esquema
  // el 2026-09-11 con su rama del constraint bien hecha, y sin una sola
  // línea en las cinco capas de código. El producto digital es pregrabado y
  // el audio es la mitad de lo que se entrega: el silencio con los ojos
  // tapados se guía con voz grabada, no con texto.
  //
  // Lo que falta para que sea utilizable de punta a punta es la Etapa 5: hoy
  // ningún bucket admite un mime de audio, así que el bloque se puede
  // declarar y pintar, pero todavía no se le puede subir un archivo.
  audio: {
    nombre: 'Audio',
    ayuda: 'Voz grabada. Se escucha, no se descarga.',
    frecuencia: 'ocasional',
    margen: 'mt-9 md:mt-12',
    medio: { familia: 'audio', admiteUrl: true, exigencia: 'advierte' },
    campos: {
      pie: { clase: 'linea', etiqueta: 'Pie', exigencia: 'opcional' },
      duracion: { clase: 'linea', etiqueta: 'Duración', exigencia: 'opcional' },
      url: { clase: 'url', etiqueta: 'Enlace', exigencia: 'opcional' },
    },
  },
} as const satisfies Record<string, Definicion>

// ── Lo que deriva ───────────────────────────────────────────────────────

export type TipoBloque = keyof typeof CONTRATO

// DOS VISTAS DEL MISMO OBJETO, Y LAS DOS HACEN FALTA. `CONTRATO` conserva el
// tipo literal de cada entrada, que es lo que permite que `TipoBloque` y la
// guarda de campos del final se deriven solas. Pero con el tipo literal,
// `CONTRATO['texto'].medio` ni siquiera existe como propiedad y no se puede
// leer en un recorrido. `DEF` es el mismo objeto visto como el contrato
// completo, para todo lo que recorre tipos en tiempo de ejecución.
const DEF: Record<TipoBloque, Definicion> = CONTRATO

export const TIPOS = Object.keys(CONTRATO) as TipoBloque[]

export function definicion(tipo: TipoBloque): Definicion {
  return DEF[tipo]
}

export const TIPOS_FRECUENTES = TIPOS.filter(t => DEF[t].frecuencia === 'frecuente')
export const TIPOS_OCASIONALES = TIPOS.filter(t => DEF[t].frecuencia === 'ocasional')

// Los tipos que llevan un archivo subido. Antes era `CON_SUBIDA`, una lista
// a mano en `Editor.tsx` que no incluía audio y no lo iba a incluir nunca.
export const CON_MEDIO = TIPOS.filter(t => DEF[t].medio !== undefined)

export function familiaDe(tipo: TipoBloque): FamiliaMedio | null {
  return DEF[tipo].medio?.familia ?? null
}

// ── Audiencia ───────────────────────────────────────────────────────────
// Quién puede ver un bloque. El nivel es acumulativo: el moderador ve todo
// lo del participante, y el equipo ve todo.

export type Audiencia = 'todos' | 'moderador' | 'equipo'

export const NIVEL: Record<Audiencia, number> = {
  todos: 1,
  moderador: 2,
  equipo: 3,
}

// ── El objeto que viaja por el producto ─────────────────────────────────

export interface Bloque {
  id: string
  bisagraId: string
  orden: number
  tipo: TipoBloque
  audiencia: Audiencia
  medioId?: string | null

  // Campos de contenido. Cada uno está declarado arriba, en el tipo que lo
  // usa; la comprobación del final de este archivo impide que esta lista y
  // el contrato se separen.
  texto?: string
  autor?: string
  pie?: string
  url?: string
  nombreArchivo?: string
  peso?: string
  descargable?: boolean
  duracion?: string
  segundos?: number
}

// ── La traducción, que vive aquí y en ningún otro sitio ─────────────────
//
// Había dos traducciones jsonb-a-objeto, en `lectura.ts` y en
// `almacenRemoto.ts`, y YA DIFERÍAN: la del lector conocía `segundos` y la
// del editor no, así que guardar una pausa desde el editor le habría
// borrado el piso de tiempo. El comentario de la del lector decía "esta es
// la única traducción y vive aquí sola", y era falso desde el día que se
// escribió la segunda.
//
// Ahora hay una, deriva del contrato, y agregar un campo no requiere
// acordarse de nada: si está declarado, viaja en las dos direcciones.

function coaccionar(clase: ClaseCampo, crudo: unknown): unknown {
  switch (clase) {
    case 'numero': {
      // Se acepta "20" además de 20. Hallazgo de Leo: quien escriba este
      // campo a mano en el editor de tablas de Supabase lo va a teclear como
      // texto sin darse cuenta, y exigir el tipo exacto daba cero espera,
      // cero error y cero señal. Lo que no es un número se descarta igual.
      const n = Number(crudo)
      return Number.isFinite(n) ? n : undefined
    }
    case 'booleano':
      return typeof crudo === 'boolean' ? crudo : undefined
    case 'texto':
    case 'linea':
    case 'url':
      return typeof crudo === 'string' ? crudo : undefined
  }
}

// ¿ESTE CAMPO ESTÁ VACÍO? La respuesta depende de la clase del campo, igual
// que la coerción, y por eso vive aquí y no en la compuerta.
//
// Antes esto era una función en `revision.ts` que devolvía una CADENA para
// alimentar un predicado de cadenas, y usaba `' '` como centinela de "esto
// existe, no lo juzgues". El centinela estaba invertido: el predicado hacía
// `.trim()`, así que `' '` se leía como vacío. O sea que una pausa con 20
// segundos puestos habría reportado "no tiene espera". No explotó por
// casualidad, porque hoy todos los campos numéricos y booleanos son
// opcionales y la compuerta sale antes de preguntar. Hallazgo de Daniel.
//
// Sin `default` a propósito: una clase de campo nueva obliga a decidir qué
// significa estar vacío para ella, en vez de heredar una respuesta.
export function estaVacio(clase: ClaseCampo, v: unknown): boolean {
  switch (clase) {
    case 'texto':
    case 'linea':
    case 'url':
      return typeof v !== 'string' || v.trim() === ''
    case 'numero':
      return typeof v !== 'number' || !Number.isFinite(v)
    case 'booleano':
      return typeof v !== 'boolean'
  }
}

export interface FilaBloque {
  id: string
  hinge_id: string
  orden: number
  tipo: string
  audiencia: string
  contenido: unknown
  media_id?: string | null
}

// De la fila de la base al objeto que pinta la pantalla.
//
// Un `tipo` que no esté en el contrato devuelve null en vez de un bloque a
// medias. Pasa solo si alguien agregó un valor al enum sin agregarlo aquí,
// y la respuesta correcta es no pintar nada antes que pintar un hueco que
// nadie sabe leer. Quien llama decide si eso es un fallo o se ignora.
export function desdeFila(f: FilaBloque): Bloque | null {
  if (!(f.tipo in CONTRATO)) return null
  const tipo = f.tipo as TipoBloque

  const contenido = (f.contenido ?? {}) as Record<string, unknown>
  const bloque: Bloque = {
    id: f.id,
    bisagraId: f.hinge_id,
    orden: f.orden,
    tipo,
    audiencia: f.audiencia as Audiencia,
    medioId: f.media_id ?? null,
  }

  for (const [nombre, campo] of Object.entries(DEF[tipo].campos)) {
    const valor = coaccionar(campo.clase, contenido[nombre])
    if (valor !== undefined) {
      ;(bloque as unknown as Record<string, unknown>)[nombre] = valor
    }
  }

  return bloque
}

// Del objeto al jsonb que espera la columna `contenido`.
//
// Solo viajan los campos DECLARADOS para ese tipo. Un bloque que traiga
// `autor` porque alguien lo cambió de cita a texto en el editor no arrastra
// el campo a la base: el contrato decide, no lo que traiga el objeto.
export function aContenido(b: Bloque): Record<string, unknown> {
  const salida: Record<string, unknown> = {}
  for (const [nombre, campo] of Object.entries(DEF[b.tipo].campos)) {
    const valor = coaccionar(campo.clase, (b as unknown as Record<string, unknown>)[nombre])
    if (valor !== undefined && valor !== '') salida[nombre] = valor
  }
  return salida
}

// ── La guarda que mantiene unidos el contrato y la interfaz ─────────────
//
// Si agregas un campo a un tipo del contrato y olvidas declararlo en
// `Bloque`, esto NO COMPILA, y el mensaje señala el campo que falta. Es el
// equivalente en TypeScript de la verificación de campos prohibidos que la
// migración hace en SQL: una guarda que falla cerrada en vez de un
// comentario pidiendo que alguien se acuerde.

type CamposDelContrato = {
  [T in TipoBloque]: keyof (typeof CONTRATO)[T]['campos']
}[TipoBloque]

type CamposQueFaltanEnBloque = Exclude<CamposDelContrato, keyof Bloque>

// El tipo del error NOMBRA el campo que falta, en vez de decir solo que algo
// no encaja. Probado: agregando `atribucion` al contrato sin declararlo
// arriba, el compilador responde
//   Type 'true' is not assignable to type '{ FALTA_DECLARAR_EN_BLOQUE: "atribucion" }'
// Los corchetes alrededor de los dos lados del `extends` son necesarios: sin
// ellos TypeScript distribuye la condición sobre la unión y el caso de varios
// campos faltantes se evalúa mal.
const _camposCubiertos: [CamposQueFaltanEnBloque] extends [never]
  ? true
  : { FALTA_DECLARAR_EN_BLOQUE: CamposQueFaltanEnBloque } = true
void _camposCubiertos

// Y LA GUARDA DEL SENTIDO CONTRARIO, que faltaba.
//
// La de arriba sola era de un solo sentido, y eso lo encontró Leo probándolo
// en vez de leyéndolo: agregar `atribucion?: string` a `Bloque` sin declararlo
// en ningún tipo del contrato compilaba limpio. Un campo así viaja a ninguna
// parte, `aContenido` lo tira al guardar y se lee `undefined` para siempre,
// sin error y sin señal. Es la enfermedad de `audio` en miniatura, dentro del
// archivo escrito para curarla.
//
// Las estructurales (id, bisagraId, orden, tipo, audiencia, medioId) se
// excluyen porque no son contenido: no viajan en el jsonb y no se declaran
// por tipo.
type CamposEstructurales = 'id' | 'bisagraId' | 'orden' | 'tipo' | 'audiencia' | 'medioId'
type CamposHuerfanos = Exclude<Exclude<keyof Bloque, CamposEstructurales>, CamposDelContrato>

const _sinHuerfanos: [CamposHuerfanos] extends [never]
  ? true
  : { CAMPO_EN_BLOQUE_QUE_NINGUN_TIPO_DECLARA: CamposHuerfanos } = true
void _sinHuerfanos
