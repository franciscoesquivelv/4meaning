// ── TOKENS DEL WORKSPACE DE PERSONALAB ──────────────────────────
//
// ESTE ARCHIVO YA NO ACUNA COLOR. Es una fachada sobre
// `lib/estilos/oficina.ts`, que es el sistema unico de las superficies de
// trabajo del portal. Los nombres se conservan uno por uno para que las 29
// pantallas de este arbol no se toquen: cambian de color todas a la vez,
// desde aqui, que es donde el cambio se puede revisar y revertir.
//
// QUE DECIA ANTES, Y POR QUE ERA EL PROBLEMA. La linea 8 lo declaraba por
// escrito: "El chasis es NEUTRO (escala slate), igual que Trascendencia". Lo
// era, y esa era exactamente la falla: medido el 2026-09-06, la barra de este
// workspace y la de Trascendencia eran la MISMA cadena caracter por caracter,
// asi que cruzar de una marca a la otra no cambiaba un solo pixel de color.
// Ademas exportaba el teal `#002B34` como constante `TEAL` y ningun archivo
// lo consumia: hallazgo abierto desde el 2026-08-13.
//
// Ahora la identidad no la lleva una constante que nadie importa: la lleva
// `marca-personalab` en `layout.tsx`, y desde ahi `bg-dom` y `text-dom`
// pintan teal en todo el arbol sin que ninguna pantalla lo pida.
//
// LOS CUATRO CONTRASTES QUE ESTE ARCHIVO ACUNABA POR DEBAJO DEL MINIMO, y que
// 29 pantallas heredaban. Todos eran `text-slate-400`, 2.56 sobre blanco y
// 2.45 sobre el fondo de pagina, o sea poco mas de la mitad del minimo de 4.5:
//   linea  21  ETIQUETA        2.56  ->  4.93
//   linea  74  BTN_PRONTO      2.56  ->  4.93
//   linea  79  TH              2.56  ->  4.93
//   linea 121  VACIO_NEUTRO    2.45  ->  4.93
// No es casualidad que sean esos cuatro: son la etiqueta de un dato, el
// encabezado de una columna, la explicacion de por que un boton no responde y
// el texto de un estado vacio. Los cuatro son lo UNICO que explica lo que se
// esta mirando, y los cuatro estaban en el gris mas claro del archivo.

export {
  // Superficies
  PAGINA, TARJETA, TARJETA_PLANA,
  // Tipografia de pagina
  H1, SUBTITULO, ETIQUETA,
  // Botones
  FOCO, BTN_PRIMARIO, BTN_SECUNDARIO, BTN_FILA, BTN_PELIGRO, BTN_PRONTO,
  // Tablas
  TH, TD,
  // Pastillas
  PASTILLA,
  // Bloques
  EXPLICATIVO, EXPLICATIVO_TEXTO, AVISO,
  // Vacios
  VACIO, VACIO_NEUTRO,
} from '@/lib/estilos/oficina'

import { TONO } from '@/lib/estilos/oficina'

// ── MAPAS DE ESTADO ─────────────────────────────────────────────
// Se usan como `${PASTILLA} ${COLOR_ESTADO[k]}`, asi que aqui va solo el par
// de color. Eran cinco pares del arcoiris de Tailwind (slate, blue, amber,
// emerald, red), ninguno en la paleta de la marca. Contrastes sobre papel:
// neutro 4.93, marca 13.09 en teal, curso 4.93, bien 5.48, alerta 7.39.
//
// Los ROTULOS no estan aqui y no se tocaron: viven en `dominio.ts` y son de
// Sora. Lo que se decide aqui es de que color se pintan.
export const COLOR_ESTADO: Record<string, string> = {
  prospecto:      TONO.neutro,
  confirmada:     TONO.marca,
  en_preparacion: TONO.curso,
  corrida:        TONO.bien,
  cancelada:      TONO.alerta,
}

export const COLOR_MADURACION: Record<string, string> = {
  'diseño':   TONO.curso,
  'piloto':   TONO.marca,
  'lista':    TONO.bien,
  'retirada': TONO.neutro,
}

// ── CATEGORIAS DE SOPORTE ───────────────────────────────────────
// Tres categorias, y la marca tiene exactamente tres acentos no semanticos
// que puede prestarles sin inventar color: la marca dominante, la secundaria
// y el acento humano. Eran `amber`, `violet` y `blue` de fabrica.
//
// LO QUE ESTO NO RESUELVE, y queda anotado como pendiente con nombre: un
// sistema de CATEGORIAS de verdad. Hay 21 archivos que definen el suyo desde
// el arcoiris de Tailwind, y el mas grande es la agenda impresa con siete
// colores. Tres entran aqui porque son tres; siete piden decidir un sistema,
// no sustituir colores, y eso no se decide en un archivo de fachada.
export const COLOR_SOPORTE: Record<string, string> = {
  sala:     TONO.curso,
  objeto:   TONO.marca,
  pantalla: 'border-sec/45 text-sec',
}
