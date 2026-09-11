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
//
// Reescrito como funcion el 2026-09-11, para el registro fundido con el
// cobro de PersonaLab: ese formulario necesita marcar un campo con error
// ("ese correo ya esta en uso") sin tocar el color. `campo(false)` produce
// EXACTAMENTE la misma cadena que la constante vieja, asi que login,
// recuperar-contrasena y nueva-contrasena no cambian un pixel.
export const campo = (conError = false) =>
  "w-full min-h-toque px-4 py-3 bg-dom-deep rounded-xl " +
  "text-sm text-paper placeholder:text-paper/65 focus:outline-none " +
  "focus:border-terra-lo transition-colors border " +
  (conError ? "border-paper" : "border-paper/45")

export const CAMPO = campo(false)

// EL BORDE DE ERROR, Y POR QUE NO ES `alerta`. Medido en el navegador
// simulando dominancia PersonaLab sobre este mismo lienzo (marca-personalab,
// teal): `alerta` (#8C2A22) como filete da 1.77 contra la tarjeta y 2.11
// contra el fondo del campo. Los dos reprueban el 3:1 que pide un limite de
// control (WCAG 1.4.11), y de lejos: es la misma razon medida por la que
// ERROR, mas abajo, usa `alerta` como RELLENO solido con texto `paper`
// (7.39) y nunca como texto o filete suelto. Aqui se confirma que tampoco
// sirve como borde, ni en vino ni en teal.
//
// Probado `terra` como alternativa: 4.06 contra la tarjeta y 4.84 contra el
// campo, los dos aprueban. Lo descarto de todas formas, y lo registro porque
// la cifra sola no alcanza: `terra` ya es la senal de EXPLICATIVO ("acento
// calido, informativo"), la distincion que Julian separo el 24 de agosto de
// `alerta` ("la diferencia se ve de un vistazo"). Pintar un campo con error
// del mismo color que un aviso informativo confunde las dos senales.
//
// La solucion es subir el MISMO borde a su version solida, sin cambiar de
// matiz: `paper/45` en reposo (3.75) a `paper` solido (13.09). No colisiona
// con el foco, que es `terra-lo` (otro matiz por completo), y no crea un
// token nuevo: es el mismo paper que ya usa el boton y el lockup.
//
// El TEXTO del error ("ese correo ya esta en uso") no va en el campo: usa
// ERROR, mas abajo, pegado debajo del campo al que corresponde. Sora decide
// en cual de los dos lugares de la pantalla aparece cada mensaje; esta es la
// forma que toma donde sea que ella lo ponga.

// Accion principal. Sobre fondo vino el primario no puede ser vino, asi que
// se invierte a papel. Contraste medido: 15.96 a 1. La terracota se reserva
// para el acento, que es su dosis en el sistema de marca.
export const BOTON =
  "w-full min-h-toque py-3 bg-paper text-dom-deep font-semibold text-sm " +
  "rounded-xl hover:bg-paper-2 transition-colors disabled:opacity-50 " +
  "disabled:cursor-not-allowed"

// Accion secundaria, incorporada el 2026-09-11 para el registro con Google
// del cobro fundido de PersonaLab. Mismo alto de toque que el boton
// primario, pero NO su mismo peso: el relleno solido de `paper` se reserva
// para la UNICA accion que cierra la pantalla entera, que es pagar. Entrar
// con Google no cierra la pantalla (todavia falta el pago), solo completa la
// mitad de identidad sin escribir nada, asi que se trata al mismo nivel que
// un campo: filete `paper/45`, el mismo 3.75 medido en el campo de correo, y
// texto `paper` sobre transparente (revela la tarjeta), 13.09 medido.
//
// PENDIENTE, de Sora y del hallazgo de Santiago que ella tiene: si el boton
// de Google va PRIMERO en la pantalla o al mismo nivel que correo y
// contrasena es orden, y el orden no lo decido yo. Lo que si decido es que,
// donde sea que se ponga, no pesa mas que la accion final.
export const BOTON_SECUNDARIO =
  "w-full min-h-toque py-3 border border-paper/45 text-paper font-medium text-sm " +
  "rounded-xl bg-transparent hover:bg-paper/10 active:bg-paper/15 transition-colors " +
  "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"

// Filete interno, para partir una tarjeta en TERRITORIOS: el de cuenta y el
// de pago del registro fundido, o el borde antes del enlace que login ya
// usaba a mano (`mt-6 border-t border-line-dk`). Nombrado para no volver a
// escribirlo la proxima vez, que es el motivo entero de este archivo.
export const FILETE = "border-t border-line-dk"

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
