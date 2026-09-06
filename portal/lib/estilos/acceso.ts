// Las clases del umbral: login, recuperar contraseña y elegir contraseña nueva.
//
// Estan aqui y no dentro de cada pantalla porque las tres son el mismo
// territorio y hasta hoy cada una reescribia sus colores a mano. Ese es el
// mecanismo exacto que llevo el dorado #C9A96E a 67 apariciones: no fue una
// decision, fue copiar y pegar tres veces.
//
// Todos los colores son tokens de tailwind.config.ts. Ni un hex escrito aqui.

// Fondo del umbral. Vino profundo, que es el hero real de Trascendencia.
// `marca-trascendencia` fija la dominancia: dentro de esta clase `dom-deep`
// pinta vino. El dia que el umbral sea de PersonaLab, cambia la clase de
// marca y no una sola pantalla.
export const LIENZO =
  "marca-trascendencia min-h-screen bg-dom-deep flex flex-col items-center justify-center px-6 py-12"

// Tarjeta elevada. Vino sobre vino profundo: la misma elevacion que el sitio
// usa entre el hero y el bloque de las tres preguntas.
export const TARJETA =
  "w-full max-w-sm bg-dom border border-line-dk rounded-2xl p-8"

// Etiqueta de campo. Papel atenuado, que sobre vino profundo da 7.3 a 1.
export const ETIQUETA = "block text-xs text-paper/70 mb-1.5"

// Campo. Las tres cifras estan medidas en el navegador, sobre la pantalla
// corriendo, no calculadas de la paleta:
//   - El filete de un control necesita 3 a 1 contra su entorno. Con el filete
//     general sobre oscuro daba 1.48, y el campo tampoco se sostenia por su
//     fondo (1.21 contra la tarjeta): o sea que no se distinguia por nada.
//     En papel al 45% da 3.06 y es neutro, que es lo que un campo en reposo
//     debe ser.
//   - El foco entra en terracota clara SOLIDA, 7.39. Sube desde 3.06, que es
//     la direccion correcta. Con la terracota de marca bajaba, porque es mas
//     oscura que la clara sobre este fondo.
//   - El placeholder daba 2.41 y lleva informacion util (el formato del dato).
//     Al 65% llega a 4.5 sin confundirse con un valor ya escrito.
export const CAMPO =
  "w-full min-h-toque px-4 py-3 bg-dom-deep border border-paper/45 rounded-xl " +
  "text-sm text-paper placeholder:text-paper/65 focus:outline-none " +
  "focus:border-terra-lo transition-colors"

// Accion principal. Sobre fondo vino el primario no puede ser vino, asi que
// se invierte a papel. Contraste medido: 15.96 a 1. La terracota se reserva
// para el acento, que es su dosis en el sistema de marca.
export const BOTON =
  "w-full min-h-toque py-3 bg-paper text-dom-deep font-semibold text-sm " +
  "rounded-xl hover:bg-paper-2 transition-colors disabled:opacity-50 " +
  "disabled:cursor-not-allowed"

// Error. Enmarcado, no texto rojo suelto: sobre vino profundo ningun rojo de
// la paleta es legible como texto, y el vino de alerta si lo es como fondo.
// Contraste medido: 7.39 a 1.
export const ERROR = "rounded-xl bg-alerta px-4 py-3 text-sm text-paper"

// Confirmacion. El verde semantico da 2.91 a 1 sobre vino profundo, o sea que
// es ilegible aqui: sobre oscuro la senal buena es la terracota clara, 8.97.
export const CONFIRMACION = "text-sm text-terra-lo"

// Enlace secundario del pie de la tarjeta.
export const ENLACE =
  "flex min-h-toque items-center justify-center text-center text-xs " +
  "text-terra-lo hover:text-paper transition-colors"
