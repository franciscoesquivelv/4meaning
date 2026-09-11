# Registro de cuenta fundido con el cobro, PersonaLab

> Diseño aprobado por Francisco el 2026-09-11 (Etapa 2 del protocolo de
> registro). Secuencia y estado: Sora. Forma: Julian. Ninguno de los dos
> tomó la parte del otro.
>
> Este documento es la Etapa 2. La Etapa 3 (auditoría de Hugo y Leo sobre
> este diseño, antes de construir) se convoca después de guardarlo. Nada de
> lo que describe está construido todavía como pantalla real, salvo los
> tokens de forma en `lib/estilos/acceso.ts`, verificados sin romper las
> tres pantallas que ya lo usan.

## Por qué existe

`El Presente como Regalo` y las demás experiencias digitales de PersonaLab
las compra una persona sola, sin foro ni moderador. Hoy no existe ninguna
pantalla donde esa persona pueda crear su cuenta. Este documento diseña esa
pantalla, antes de escribirla.

Decisiones previas que este diseño da por hechas, sin volver a discutirlas:
registro antes que pago, en un solo lienzo; landing en `4meaning.life` hace
de carrito sin backend; confirmación de correo por enlace **apagada**;
cuando un correo ya tiene cuenta, se dice sin ambigüedad; mínimo de
contraseña de la plataforma es 6, el portal exige más. Ver
`/Users/franciscoesquivel/.claude/projects/-Users-franciscoesquivel-Documents-GitHub-4meaning-Web/memory/personalab-producto-digital.md`
para el historial completo.

---

## 1. La secuencia, campo por campo (Sora)

No son dos pantallas: un solo lienzo con dos momentos internos. El segundo
(cobro) permanece oculto hasta que el primero (identidad) queda resuelto.

1. **Contexto de compra** (información, no campo). Nombre de la experiencia
   y precio, del parámetro que trae el carrito del landing.
2. **Botón "Continuar con Google"**, arriba de todo. Cero fricción, cero
   contraseña que inventar.
3. **Separador**: "o con tu correo".
4. **Campo Correo electrónico.** Al perder el foco (blur), comprobación
   propia del servidor, no depende de lo que devuelva `signUp()` (Santiago
   no lo verificó con la confirmación apagada). Si el correo ya tiene
   cuenta, aparece aquí, antes de que la persona toque la contraseña.
5. **Campo Contraseña**, visible solo si no se usó Google. Validación
   también en blur, mínimo **8** caracteres (no el piso de 6 de la
   plataforma: `nueva-contrasena/page.tsx:69` ya exige 8 un paso más
   adelante del mismo flujo, y dos números distintos en el mismo portal es
   el sistema hablando con dos voces).
6. **El cobro se revela** solo cuando el correo pasó su comprobación Y (si
   aplica) la contraseña cumple el mínimo, o la persona volvió autenticada
   de Google. Antes de eso el bloque de cobro no está deshabilitado a la
   vista: está ausente.
7. **Sección de cobro.** Forma de Julian (territorio 2 de la tarjeta). Vive
   después de la identidad resuelta, nunca antes.
8. **Un solo botón de envío.** Primero crea la cuenta (o confirma la que
   trajo Google), después cobra. Si el primer paso no termina, el segundo
   no arranca.

Con Google: al volver del redirect, la sección de identidad se colapsa a una
línea de confirmación (con salida "cambiar de cuenta") y el cobro se revela
de inmediato, sin pedir contraseña.

**Quita de Sora, ya decidida:** mientras no haya procesador de pago
conectado, el paso 7 no se construye. El botón del paso 8 dice
`Crear cuenta`, no `Pagar y crear tu cuenta`, y el flujo termina ahí. La
fusión completa no llega en un clic todavía; una compra real en esta
ventana se resuelve a mano por `/usuarios/nuevo`, que ya existe.

---

## 2. Los seis estados, texto exacto (Sora)

### Cargando
```
Creando tu cuenta…
```
```
Procesando el pago…
```
(la segunda, cuando exista el procesador)

### Correo ya existe
```
Ya existe una cuenta con este correo.
```
```
Inicia sesión y seguimos con tu compra
```
Depende de que `/login` acepte un parámetro de retorno, que hoy no tiene
(`app/login/page.tsx:35` manda siempre a `/`). **Bloqueo de construcción.**

### Contraseña corta
```
La contraseña necesita al menos 8 caracteres.
```
Texto literal reusado de `app/nueva-contrasena/page.tsx:69`, a propósito:
el portal no exige dos números distintos para "una contraseña válida".

### Límite de 30 altas cada 5 minutos
```
En este momento se están creando muchas cuentas a la vez. Espera un minuto e inténtalo otra vez: no tienes que volver a escribir nada.
```

### Éxito
Solo cuando las tres escrituras (cuenta, rol, acceso) están confirmadas,
cada una con su error revisado:
```
Listo. Tu cuenta quedó creada y ya tienes acceso a [nombre de la experiencia].
```
Botón: `Empezar`, directo a la experiencia, no a una lista.

### Fallo genérico de sistema
```
No pudimos crear tu cuenta ahora. No es algo que hayas hecho tú: algo falló de nuestro lado. Vuelve a intentarlo en un momento. Si sigue pasando, escríbenos y lo resolvemos contigo.
```

---

## 3. El pipeline cuenta → cobro → grant (Sora)

Tres escrituras separadas. Lo que distingue cada estado: **¿ya se movió
dinero?**

### Estado A — Cuenta creada, el cobro NO se completó
```
Tu cuenta ya está creada. El cobro no se pudo completar.

No la perdiste, ni tienes que volver a registrarte. Puedes intentar el cobro otra vez o hacerlo más tarde desde tu cuenta.
```
Botón primario: `Intentar el cobro otra vez`. Salida: `Hacerlo más tarde`.
**Es seguro ofrecer reintentar: el dinero nunca se movió.**

### Estado B — El cobro SÍ se completó, falla el `grant`
```
Tu pago se procesó y tu cuenta está creada. Nos falta conectar tu acceso a [experiencia] de nuestro lado: lo activamos en cuanto lo veamos, o escríbenos y lo resolvemos al momento. No vuelvas a pagar: ya quedó registrado.
```
**Sin botón de reintentar.** Reintentar aquí sugeriría un segundo cobro
sobre un pago que ya existe. Este texto es la corrección directa de
`app/api/admin/invite/route.ts:123-131`, que hoy devuelve `{ok:true}`
aunque el `grant` falle.

### Estado C — Las tres escrituras confirmadas
El texto de Éxito de la sección 2, repetido aquí para que se note la
diferencia de tono: no menciona el cobro, porque para cuando se lee ya es
un hecho pasado.

**Por qué no pueden compartir palabras:** si A y B sonaran igual, alguien
a quien ya se le cobró podría leer "puedes intentarlo de nuevo" y pagar una
segunda vez pensando que la primera no contó.

---

## 4. La forma (Julian)

### Estructura de la tarjeta
Una tarjeta, dos territorios (cuenta / pago), separados por el filete
`FILETE` (`border-t border-line-dk`), un solo botón de cierre al final.
Mismo lenguaje que la cotización. La ley de un primario por pantalla es por
pantalla, no por territorio.

### El botón de Google
Mismo alto de toque que el botón principal (44px, `min-h-toque`), no el
mismo peso visual: `BOTON_SECUNDARIO`, borde `paper/45` (3.75 medido),
texto `paper` sobre transparente (13.09 medido). No cierra la pantalla,
solo completa identidad. Orden: **primero, arriba de todo** (resuelto por
la secuencia de Sora, sección 1).

### El campo con error
`alerta` como borde reprueba en los dos fondos posibles (1.77 contra la
tarjeta, 2.11 contra el campo; el mínimo es 3). `terra` aprueba (4.06 y
4.84) pero se descarta: ya es la señal de "acento informativo", y usarlo
para error confundiría dos señales separadas desde el 24 de agosto.
Resolución: el mismo borde, de translúcido a sólido, sin matiz nuevo:
`campo(conError=true)` da `border-paper` (13.09) en vez de `border-paper/45`
(3.75). El texto del error usa `ERROR` (`bg-alerta text-paper`, 7.39),
pegado al campo específico. Sora decide en cuál campo cae cada mensaje.

### Tokens, cero nuevos
`lib/estilos/acceso.ts` ganó `campo(conError)` (reemplaza `CAMPO` sin
cambiar su render por defecto, verificado pixel a pixel), `BOTON_SECUNDARIO`
y `FILETE`. Las tres pantallas que ya usaban `CAMPO` (`login`,
`recuperar-contrasena`, `nueva-contrasena`) no cambian.

### Responsive, medido a 375px real
Gutter 24px, tarjeta 327px, interior de campo 261px, campo 46px de alto,
botón 44px, lockup 34px de alto / 210px de ancho. `px-6` y `max-w-sm`
(384px) se sostienen sin tocar. El interior alcanza para vencimiento+CVC en
dos columnas cuando exista el procesador (estimado, no verificado: depende
de qué proveedor se elija).

### Por qué esta pantalla no hereda el lenguaje de `mis-experiencias`
Ese lenguaje es de alguien con sesión activa. Esta pantalla ocurre antes de
que la cuenta exista, mismo momento funcional que `/login`. Es umbral, no
chasis.

### Innegociable
Cero hex. Un primario por pantalla. `alerta` nunca como texto o borde en
este lienzo. Toque mínimo 44px. `terra` nunca como señal de error.

### Ajustable para Sora
Nombres de los territorios, dónde cae cada mensaje, ancho de tarjeta.

---

## 5. Lo que esto bloquea, y no se puede saltar

1. **La migración que amplía `profiles.role`.** Documentado en
   `docs/INCIDENTE-ROL-INDIVIDUAL.md`. Sin esto, el Estado C ("ya tienes
   acceso") sería falso desde su primera palabra: la escritura del rol
   falla en la base antes de llegar al `grant`.
2. **`/login` necesita un parámetro de retorno.** Hoy redirige siempre a
   `/` (`app/login/page.tsx:35`). Sin esto, "Inicia sesión y seguimos con
   tu compra" no puede cumplir lo que promete.
3. **`/usuarios` no agrupa el rol `individual`.** `usuarios/page.tsx:85-88`
   solo agrupa en `team` y `participant`. Una cuenta `individual` no
   aparece en ninguna fila todavía.
4. **El reemplazo de "no registrado".** Validado por Sora: la palabra
   correcta es "Nunca ha iniciado sesión" (`auth.users.last_sign_in_at is
   null`), no "no registrado" (la cuenta sí existe). Aplica al panel de
   Usuarios para altas manuales.

## 6. Pendiente, sin resolver en esta etapa

- La señal exacta de Supabase para el límite de 30 altas/5min: sin
  verificar contra el dashboard real.
- El proveedor de cobro: sigue parqueado, "un solo tema" aparte.
- Si el formulario de tarjeta debe verse (marcado "próximamente") aunque no
  cobre, o mantenerse ausente como decidió Sora: pregunta abierta que
  Francisco puede reabrir si prefiere otra cosa.
