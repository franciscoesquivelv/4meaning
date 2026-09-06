// ── LAS PRIMITIVAS DE LA OFICINA ────────────────────────────────
//
// POR QUE EXISTE ESTE ARCHIVO. PersonaLab tenia un sistema de primitivas
// (`app/(admin)/personalab/tokens.ts`) y el back office de Trascendencia no
// tenia ninguno. Medido el 2026-09-06 con el mismo comando en las dos
// superficies: back office 1 614 clases de color de fabrica de Tailwind
// contra 11 tokens de marca, o sea 0.6% en marca; PersonaLab 428 contra 0,
// o sea 0.0%.
//
// Ese vacio no es una estadistica, es un mecanismo. Cuando no hay donde
// buscar el color, cada pantalla nueva lo inventa, y el resultado medido fue
// un dorado #C9A96E que no esta en ninguna paleta de la marca repetido 67
// veces, y una TERCERA terracota (#8F5341) 20 veces mas. Nadie decidio eso:
// se copio y se pego.
//
// Aqui se decide una vez. La regla que este archivo hace cumplir es la
// misma de siempre: el token que una pantalla usa tiene que existir ya, no
// nacer en la pantalla que lo estrena.
//
// COMO SE USA: se importa la constante, no se copia su contenido.
//   import { TARJETA, H1, BTN_PRIMARIO } from '@/lib/estilos/oficina'
//
// CERO HEX EN ESTE ARCHIVO. Todos los valores son tokens de
// `tailwind.config.ts`, que a su vez leen las variables de `app/marca.css`.

// ── LAS SUPERFICIES, Y POR QUE ESTAS ────────────────────────────
//
// El fondo del back office era `bg-slate-50` (#F8FAFC). El de la marca es
// `--paper` (#F6EEE3). Medido en grados de tono: slate-50 esta en 210 y
// paper en 35. 175 grados de separacion, practicamente opuestos. No es que
// "se vea distinto": es la temperatura invertida en la superficie base de
// las 89 pantallas de trabajo.
//
// La escala tiene DOS peldanos y hace falta que los dos esten ocupados,
// porque el cromo tiene que elevarse sobre el suelo igual que hoy se eleva
// el blanco sobre slate-50:
//
//   SUELO   `paper-2` #EFE4D5   la pagina
//   CROMO   `paper`   #F6EEE3   barras, tarjetas, menus
//
// Cifras calculadas de los hex compuestos, no supuestas:
//   tarjeta sobre el suelo   ANTES 1.05 (white/slate-50)   DESPUES 1.26
//   filete de la barra       ANTES 1.18 (slate-200/slate-50)  DESPUES 1.25
// Las dos senales de separacion suben. Ninguna de las dos tiene minimo
// normativo (WCAG 1.4.11 pide 3:1 a los limites de un CONTROL, no a la
// separacion entre dos superficies), asi que van como comparativa.
//
// El precedente no se invento aqui: la app del participante ya resolvio
// este mismo problema y lleva 44 superficies elevadas sobre `bg-paper` con
// `border-line`. Esto es esa gramatica, un peldano abajo para dejarle sitio
// a las tarjetas `bg-white` que las 89 pantallas todavia tienen.

export const SUELO = 'bg-paper-2 min-h-screen'
export const PAGINA = SUELO

export const TARJETA = 'bg-paper border border-line rounded-marca'
export const TARJETA_PLANA = 'bg-paper border border-line rounded-marca overflow-hidden'

// ── EL CHASIS ───────────────────────────────────────────────────
//
// La barra de la casa (nivel 1) y las barras de workspace (nivel 2). Las dos
// escribian la misma cadena a mano en tres archivos distintos: medido, la
// linea de `PersonaLabNav.tsx:28` y la de `EventSubNav.tsx:135` eran
// identicas caracter por caracter. Eso es lo que hacia que cruzar de
// Trascendencia a PersonaLab no cambiara un solo pixel de color.

export const BARRA_CASA =
  'fixed top-0 left-0 right-0 w-full h-14 bg-paper border-b border-line z-50 ' +
  'flex items-center justify-between px-6'

export const BARRA_WORKSPACE =
  'sticky top-14 z-40 h-12 bg-paper border-b border-line flex items-center px-6 gap-3'

// El nombre que rotula una barra. Peso 600 y no 700: el sitio publico no
// declara un solo peso 700 en sus 67 declaraciones de tipografia, y el back
// office llevaba 48. La jerarquia de la marca se hace por escala y por aire.
//
// `whitespace-nowrap` porque en una ventana angosta el lockup "4 Meaning" se
// partia en dos renglones, visto en la pieza corriendo. Un nombre de marca
// partido a la mitad es un lockup roto, y este es el unico sitio del portal
// donde el nombre de la casa aparece en todas las pantallas.
export const ROTULO_BARRA = 'text-sm font-semibold tracking-tight text-ink whitespace-nowrap'

// ── Entradas de navegacion ──────────────────────────────────────
//
// AQUI ES DONDE CADA MARCA SE VE COMO ELLA MISMA. El estado activo se pinta
// con `dom`, que es la dominancia que declara la clase de marca del layout:
// vino dentro de Trascendencia, teal dentro de PersonaLab. La misma clase,
// dos colores, sin que ninguna pantalla lo declare.
//
// Contrastes calculados sobre el hex compuesto:
//   activo vino #4C0F18 sobre su propio tinte al 10%   10.84
//   activo teal #002B34 sobre su propio tinte al 10%   10.85
//   inactivo gray-ui #6C665F sobre paper                4.93
// El inactivo era `text-slate-500` (4.76) y `text-slate-600` (7.58), o sea
// dos pesos distintos para el mismo estado en dos barras hermanas.

const ENTRADA_BASE =
  'rounded-md whitespace-nowrap transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-paper'

export const entradaCasa = (activa: boolean) =>
  `${ENTRADA_BASE} px-3 py-2 text-sm ` +
  (activa
    ? 'text-dom font-medium bg-dom/10'
    : 'text-gray-ui hover:text-ink hover:bg-ink/5')

export const entradaWorkspace = (activa: boolean) =>
  `${ENTRADA_BASE} text-xs px-3 py-1.5 ` +
  (activa
    ? 'text-dom font-semibold bg-dom/10'
    : 'text-gray-ui hover:text-ink hover:bg-ink/5')

// Panel flotante de un menu de la barra.
export const MENU_PANEL =
  'absolute left-0 top-full mt-1 w-72 bg-paper border border-line rounded-marca ' +
  'shadow-lg py-1.5'

// EL ACTIVO DEL MENU NO SE TINTA, Y ESTE ES EL SEGUNDO HALLAZGO QUE SOLO
// APARECE CORRIENDO. Con `bg-dom/10` la nota de la entrada activa caia a 4.06
// (compuesto #E5D8CF), o sea que la unica entrada que la persona esta a punto
// de elegir era la unica cuya explicacion no se leia. Con `paper-2` solido la
// nota vuelve a 4.52, y el color de la marca lo lleva el TITULO, que es lo que
// se mira: `dom` sobre paper-2 da 12.04 en vino y 12.00 en teal.
export const menuEntrada = (activa: boolean) =>
  'block px-3 py-2 rounded-lg mx-1.5 transition-colors ' +
  (activa ? 'bg-paper-2' : 'hover:bg-ink/5')

export const menuTitulo = (activa: boolean) =>
  'block text-sm ' + (activa ? 'text-dom font-medium' : 'text-ink')

// La nota del menu era `text-slate-400`: 2.56 sobre blanco. Lleva la unica
// explicacion de a donde va cada destino, asi que tiene que leerse.
export const MENU_NOTA = 'block text-xs text-gray-ui mt-0.5'

// ── TIPOGRAFIA DE PAGINA ────────────────────────────────────────

export const H1 = 'text-2xl font-semibold tracking-tight text-ink'
export const H2 = 'text-lg font-medium tracking-tight text-ink'
// Era `text-slate-500`: 4.55 sobre slate-50, aprobado por dos centesimas.
export const SUBTITULO = 'text-sm text-gray-ui mt-1'
// Era `text-slate-400`: 2.56. La etiqueta de un dato es texto CHICO en
// mayusculas, que es justo el caso donde el contraste bajo mas se siente.
export const ETIQUETA =
  'text-[11px] font-semibold uppercase tracking-wider text-gray-ui'
// La cejilla de la marca. Vive en marca.css y aqui solo se nombra, para que
// una pantalla del back office no tenga que reinventar el tracking.
export const CEJILLA = 'cejilla'

// ── BOTONES ─────────────────────────────────────────────────────
//
// La estructura viene de `personalab/tokens.ts`, que ya la tenia resuelta y
// es lo unico bueno que ese archivo tenia: foco visible, estado de presion y
// deshabilitado real. Lo que cambia aqui es el color, y una cosa mas: el
// anillo de foco pasa a `dom`, o sea que tambien dice en que marca estas.
//   ring dom(vino) contra paper   13.15
//   ring dom(teal) contra paper   13.09

export const FOCO =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dom ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-paper'

// La presion dura 100ms, mas rapido que el hover de 150: el boton tiene que
// sentirse por delante del dedo, no por detras.
const PRESION =
  'transition-[background-color,border-color,transform,opacity] duration-100 active:scale-[0.98]'

const BASE = 'inline-flex items-center justify-center gap-2 rounded-lg select-none'

// UN SOLO PRIMARIO POR PANTALLA. Se escribia de tres maneras (`bg-slate-900`,
// `bg-slate-800` y `bg-[#111827]` a mano, 13 veces en 9 archivos) y 20
// archivos ponian mas de uno en la misma pantalla, hasta cinco.
// `paper` sobre `dom`: 13.15 en vino, 13.09 en teal.
// El DESHABILITADO no se rellena con `line`, y esa correccion sale de medir
// la pieza corriendo y no de leerla: `gray-ui` sobre `line` (#E2D5C4) da 3.93
// y reprueba. Es el mismo fenomeno de siempre, que `--gray-ui` esta calibrado
// EXACTAMENTE en 4.5 sobre papel y cualquier superficie mas oscura lo hunde.
// Sobre `paper-2` da 4.52, y la silueta del boton la sostiene el filete.
export const BTN_PRIMARIO =
  `${BASE} bg-dom text-paper text-sm font-medium px-4 py-2 min-h-toque ` +
  'hover:bg-dom-deep active:bg-dom-deep ' +
  'disabled:bg-paper-2 disabled:text-gray-ui disabled:border disabled:border-line ' +
  'disabled:cursor-not-allowed disabled:hover:bg-paper-2 disabled:active:scale-100 ' +
  PRESION + ' ' + FOCO

export const BTN_SECUNDARIO =
  `${BASE} bg-paper border border-line text-ink text-sm px-4 py-2 min-h-toque ` +
  'hover:bg-paper-2 hover:border-dom/30 active:bg-paper-2 ' +
  'disabled:bg-paper disabled:text-gray-ui disabled:border-line disabled:cursor-not-allowed ' +
  'disabled:hover:bg-paper disabled:active:scale-100 ' + PRESION + ' ' + FOCO

export const BTN_FILA =
  `${BASE} gap-1.5 text-xs border border-line text-gray-ui px-2.5 py-1 rounded-md ` +
  'hover:bg-paper-2 hover:text-ink hover:border-dom/30 active:bg-paper-2 ' +
  'disabled:text-gray-ui disabled:border-line disabled:cursor-not-allowed ' +
  'disabled:hover:bg-transparent disabled:active:scale-100 ' + PRESION + ' ' + FOCO

// Destructivo. `alerta` sobre paper da 7.39.
export const BTN_PELIGRO =
  `${BASE} gap-1.5 text-xs font-medium border border-alerta/45 text-alerta bg-paper ` +
  'px-2.5 py-1 rounded-md hover:bg-alerta/10 active:bg-alerta/15 ' + PRESION + ' ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alerta ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-paper'

// Lo que todavia no existe. Un boton muerto es peor que un boton ausente:
// ensena que la interfaz no responde, y esa leccion se generaliza a los
// botones que si funcionan.
//
// El texto era `text-slate-400`, 2.56, o sea que la unica explicacion de por
// que el boton no responde estaba por debajo del minimo legible. Que este
// apagado se dice con el borde punteado y con el cursor, no escondiendo la
// palabra. `gray-ui` sobre paper: 4.93.
export const BTN_PRONTO =
  `${BASE} bg-paper border border-dashed border-line text-gray-ui text-sm px-4 py-2 ` +
  'cursor-not-allowed'

// ── TABLAS ──────────────────────────────────────────────────────
// El encabezado era `text-slate-400`, 2.56: el rotulo de cada columna, que
// es lo unico que explica que hay debajo, era lo menos legible de la tabla.
export const TH =
  'text-left text-[11px] font-semibold uppercase tracking-wider text-gray-ui ' +
  'px-5 py-3 border-b border-line whitespace-nowrap'
export const TD = 'px-5 py-4 border-b border-line align-middle text-sm text-ink'
export const TR_HOVER = 'hover:bg-paper-2 transition-colors'

// ── PASTILLAS DE ESTADO ─────────────────────────────────────────
//
// EL RELLENO NO LLEVA EL COLOR DE LA PASTILLA, Y ESA ES UNA DECISION MEDIDA,
// no una preferencia. `--gray-ui` y `--terra-ui` existen porque los grises y
// la terracota de la marca no llegan a 4.5 sobre papel, asi que estan
// calibrados EXACTAMENTE en el minimo. Cualquier relleno tintado con su
// propio color los hunde: medido, el peor caso de las tres superficies
// (paper, paper-2 y las tarjetas blancas que todavia quedan) da 4.19 al 6%
// y 3.59 al 18%. Reprueban las dos.
//
// Con relleno `paper` solido la cifra deja de depender de donde caiga la
// pastilla, y la senal cromatica la llevan el filete y el texto:
//   prospecto  gray-ui   4.93      ejecutado  bien     5.48
//   confirmado dom      13.15      cancelado  alerta   7.39
//   preparacion terra-ui 4.93
//
// LO QUE ESTA PASTILLA NO RESUELVE, y queda anotado: los mapas de color por
// CATEGORIA (tipo de bloque, rol de equipo, area de compromiso, categoria de
// la agenda impresa) son otra cosa. Hay 21 archivos que definen el suyo desde
// el arcoiris de Tailwind. Eso pide decidir un sistema de categorias, no
// sustituir colores, y no se decide aqui.
export const PASTILLA =
  'text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ' +
  'bg-paper border'

// Los pares sueltos, para el patron `${PASTILLA} ${TONO.bien}` que las
// pantallas de PersonaLab ya usan con sus mapas de estado.
export const TONO = {
  neutro: 'border-line text-gray-ui',
  marca:  'border-dom/40 text-dom',
  curso:  'border-terra-ui/45 text-terra-ui',
  bien:   'border-bien/45 text-bien',
  alerta: 'border-alerta/45 text-alerta',
} as const

export const PASTILLA_NEUTRA = `${PASTILLA} ${TONO.neutro}`
export const PASTILLA_MARCA = `${PASTILLA} ${TONO.marca}`
export const PASTILLA_CURSO = `${PASTILLA} ${TONO.curso}`
export const PASTILLA_BIEN = `${PASTILLA} ${TONO.bien}`
export const PASTILLA_ALERTA = `${PASTILLA} ${TONO.alerta}`

// ── BLOQUES DE AVISO ────────────────────────────────────────────
//
// La gramatica es la que Francisco ya aprobo en la cotizacion: un bloque que
// habla desde otro lado de la mesa se marca como TERRITORIO, con filete
// lateral, no con un fondo de color de otra paleta. Antes eran `bg-blue-50`
// y `bg-amber-50`, dos colores que no estan en ninguna paleta de la marca.
//
// EL FILETE DEL EXPLICATIVO ES `terra` Y NO `terra-ui`, y esa correccion salio
// de MIRAR la pieza, no de medirla: con `terra-ui` (#965640) los dos bloques
// daban dos marrones oscuros que a 3px de ancho se leian identicos, o sea dos
// senales distintas diciendo lo mismo. `terra` (#B9735A) es la terracota de
// marca, mas clara y mas naranja, y contra el vino de `alerta` (#8C2A22) la
// diferencia se ve de un vistazo. El minimo aqui es 3 y no 4.5, porque un
// filete es senal no textual (WCAG 1.4.11): terra da 3.22, alerta 7.39.
export const EXPLICATIVO =
  'bg-paper border border-line border-l-[3px] border-l-terra rounded-r-marca p-4 flex gap-3'
export const EXPLICATIVO_TEXTO = 'text-sm text-ink leading-relaxed'

export const AVISO =
  'bg-paper border border-line border-l-[3px] border-l-alerta rounded-r-marca px-4 py-3'
export const AVISO_TEXTO = 'text-sm text-ink leading-relaxed'

// ── ESTADOS VACIOS ──────────────────────────────────────────────
// Dos, no uno. La caja punteada llama la atencion, asi que se reserva para
// el vacio que SI es un problema: falta algo y hay que hacer algo. El vacio
// normal (nada agendado, nada en retorno) se dice en voz baja y sin caja.
//
// El vacio neutro era `text-slate-400`, 2.45. Un estado vacio es la unica
// cosa en la pantalla: si no se lee, la pantalla esta en blanco.
export const VACIO =
  'border border-dashed border-line rounded-marca px-5 py-6 text-sm text-gray-ui leading-relaxed'
export const VACIO_NEUTRO = 'px-5 py-6 text-sm text-gray-ui leading-relaxed'

// ── CAMPOS ──────────────────────────────────────────────────────
// El back office no tenia ni una definicion de campo compartida.
export const CAMPO =
  'w-full min-h-toque px-3 py-2 bg-paper border border-line rounded-lg text-sm text-ink ' +
  'placeholder:text-gray-ui focus:outline-none focus:border-dom transition-colors'
export const CAMPO_ETIQUETA = 'block text-xs font-medium text-gray-ui mb-1.5'
