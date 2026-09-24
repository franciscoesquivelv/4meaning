# Registro de pendientes

> Por qué existe: 2026-09-21, después de que Francisco dijera "estoy harto de
> pedir cosas y que no hay verdaderos cambios, mucho de lo que digo se ignora
> y se toma con atajos que no funcionan y dejan problemas", el consejo
> (Daniel, Hugo, Leo) coincidió, cada uno por su cuenta, en el mismo
> diagnóstico: el problema no es que no se verifique — es que lo ya
> verificado no se fuerza a cerrarse. Un hallazgo correcto queda enterrado en
> un archivo de memoria narrativo que nadie vuelve a leer, y semanas después
> "adoptado y no hecho" se ve idéntico a "descartado en silencio".
>
> Este archivo es la corrección: una tabla, no prosa repartida. Toda sesión
> que toque PersonaLab o Trascendencia lo revisa al empezar y lo actualiza
> antes de cerrar. Un hallazgo no cuenta como resuelto hasta que su fila diga
> `hecho` con fecha y verificación real — no "ya quedó", una prueba.

## Cómo se usa

Cada fila es una decisión o un hallazgo, no una tarea vaga. Cuatro estados,
nunca solo abierto/cerrado:

- **abierto** — diagnosticado, sin decisión de qué hacer o sin ejecutar.
- **decidido** — ya se sabe qué hacer, falta construirlo.
- **hecho** — construido y verificado con ejecución real (no lectura de
  código). Lleva fecha de verificación y cómo se verificó.
- **rechazado** — se consideró y se decidió NO hacerlo. Lleva por qué, para
  que no se vuelva a proponer como si fuera nuevo.

Regla dura: ninguna fila pasa a `hecho` solo porque el código compila o
porque "debería funcionar". Necesita la prueba (comando, captura, consulta a
la base) igual que exige el resto del protocolo de este portal.

---

## Abiertos / decididos

### P-012 — El Presente como Regalo, construido con la cronología real: falta el pasaje del Dr. Alexander, lo de perdón, y publicar
- Estado: **decidido, mecanismo verificado de punta a punta, falta contenido de Francisco y la decisión de publicar**
- Actualización 2026-09-23: Francisco corrió la migración. Verificado con
  ejecución real (no solo que la migración "corrió bien"): sesión real de
  un comprador (no service role) contra `public.responses` -- guardar,
  leer lo propio, y borrar, los tres correctos; y el caso negativo, ese
  mismo comprador NO puede escribir una respuesta contra un bloque de una
  experiencia donde no tiene grant (RLS lo rechazó, confirmado con el
  mensaje de error real de Postgres). La prueba se hizo contra un bloque
  YA PUBLICADO marcado `guarda` solo por un instante y revertido al
  terminar, para no tocar ni exponer el contenido nuevo de "El Presente
  como Regalo" todavía sin publicar.
- Origen: Francisco, 2026-09-22 ("llena el Presente como Regalo... hazlo
  bien"), con el PDF de la cronología real del retiro presencial. Se cruzó
  contra las once decisiones de Francisco del 2026-09-13 (memoria de
  proyecto `presente-regalo-digital.md`) antes de escribir nada: la base
  seguía en 4 bisagras-contenedor cuando la decisión 5 ya pedía "un
  momento, una pantalla... unas 20", y `Escritura.tsx` seguía con la regla
  de "nunca se guarda" del 10-sep sin el interruptor por sección que la
  decisión 2 del 13-sep ya había decidido construir. Reconstruir esto
  bien, no llenar las 4 bisagras viejas, fue la elección explícita de
  Francisco sobre las dos opciones que se le dieron.
- **Contenido:** Renata adaptó las 16 actividades de la cronología
  presencial a texto/consigna/gesto/pausa/aviso real, momento por
  momento, sin resumir. Dos huecos que no inventó, quedan como avisos
  honestos en el lector, no bloques rotos: el pasaje real del libro del
  Dr. Alexander (Finitud), y el video de perdón (Perdón, la cronología
  misma dice "falta research" para ese punto). **Necesito de Francisco**:
  el pasaje del Dr. Alexander con su autor confirmado, y la decisión o el
  research de los ítems 14-15 (perdón, tres columnas / video).
- **Estructura:** las 4 bisagras-contenedor se partieron en 16 momentos
  reales (Finitud 6, Gratitud 5, Silencio 2, Perdón 3), escritos en la
  versión borrador de la experiencia real (no tocan lo publicado). "Unas
  20" de la decisión 5 se quedó en 16 porque Silencio, el módulo más
  nuevo, es genuinamente más corto que los otros tres — no se fragmentó
  a la fuerza para llegar a un número.
- **El interruptor de guardado, construido de punta a punta:**
  `Bloque.guarda` (nuevo campo del contrato, `lib/personalab/bloques.ts`,
  falla cerrado como `aplicaDigital`), checkbox real en el editor
  (`Editor.tsx`), tabla nueva `public.responses` con RLS propia
  (`supabase/migrations/20260922_1200_respuestas_guardadas.sql`,
  auditada por Hugo, dos rondas — la primera versión validaba grant de
  experiencia pero no versión/audiencia del bloque, corregido para copiar
  el mismo predicado que ya usa la política de lectura real de `blocks`),
  `Escritura.tsx` reescrito con los dos comportamientos y su botón real de
  borrar (nada que guarde sale sin poder borrarse — condición de Sora),
  `lectura.ts` y `Cierre.tsx` leyendo y juntando lo guardado con lo que
  sigue viviendo solo en la pestaña. Tres consignas marcadas `guarda:
  true` (la frase de Finitud, el regalo de Gratitud, el cierre de Perdón)
  para que decisión 9 y 11 del 13-sep (el cierre reúne el material, lo
  escrito en Finitud puede recordarse después) tengan algo real que leer;
  el resto de las consignas de calentamiento se queda efímera, a
  propósito, criterio mío, ajustable.
- **Lo que NO se construyó en esta pasada, marcado, no escondido:** el
  test de propósito oculto como primera pantalla (decisión 6) y el
  recordar-lo-escrito entre módulos como mecanismo de UI (decisión 11,
  más allá de que el dato ya se guarda) — son piezas más grandes, fuera
  del alcance que describí cuando Francisco eligió "hazlo bien". Si hace
  falta, son su propio pendiente.
- **Verificado hasta ahora:** typecheck limpio; la estructura completa
  (16 bisagras, 69 bloques, orden secuencial sin huecos) confirmada con
  consulta directa a la base; el editor real, con una cuenta de equipo,
  muestra los 16 momentos y su vista previa renderiza el contenido real
  correctamente (checkbox de guardado marcado donde corresponde, avisos
  de audio/video pendientes legibles, sin bloques rotos). **Lo que falta
  verificar** porque depende de la migración: que guardar y borrar una
  respuesta funcione de verdad contra `public.responses`, y la lectura
  real de un comprador (`/experiencia/presente-regalo`) una vez marcadas
  `listo` las 16 bisagras.
- Dueño: Francisco corre la migración en el editor SQL de Supabase (no
  tengo acceso directo, mismo motivo que P-007) y entrega el pasaje del
  Dr. Alexander + la decisión sobre perdón; Claude termina la
  verificación y publica en cuanto eso llegue.
- Criterio de cierre: comprador real (grant real, no previa de equipo) ve
  contenido real en `/experiencia/presente-regalo` (no "0 pasos"),
  guardar y borrar una respuesta funciona de verdad, y la versión queda
  publicada.

### P-014 — El borde de todo campo del editor mide 1.15:1, muy por debajo del mínimo de 3:1
- Estado: **abierto**
- Origen: Claude, 2026-09-23, midiendo el contraste del campo de título
  de sección que pidió Francisco revisar. `INPUT` (`Editor.tsx:111`,
  `bg-white border border-line`) es la convención de caja de TODO el
  editor -- once o más campos la usan. Medido, no estimado: el borde
  `--line` contra `bg-white` da 1.15:1; WCAG pide 3:1 para el borde de
  un control. No es un defecto de un campo, es la convención entera.
- Qué se sabe: el texto adentro de los campos mide bien (14+:1 en los
  casos medidos); el problema es solo el borde que separa un campo de
  lo que lo rodea. Corregirlo bien es una decisión de token (¿un
  `--line` más oscuro? ¿una sombra en vez de borde?), no un cambio de
  clase suelto -- necesita el mismo criterio de Julian que ya fijó el
  resto de la paleta.
- Dueño: sin asignar -- Julian primero, para decidir el token; Claude
  aplica.
- Criterio de cierre: el borde de un campo mide 3:1 o más contra su
  propio fondo, verificado con el mismo método de esta sesión
  (inyección de JS, luminancia real, no estimada), en al menos los
  campos que Francisco toca más seguido (título/descripción de sección,
  campo principal de bloque).

### P-015 — Recuperación de contraseña rota, en producción, con una cuenta real
- Estado: **tres piezas del plan barato construidas y verificadas (tipos + render); falta Resend y el resto del plan**
- Actualización 2026-09-23, ejecutado de la lista "barato y ya" del plan
  conjunto de Daniel y Hugo (`recuperar-contrasena/page.tsx`):
  - `redirectTo` ya no usa `window.location.origin` a secas: en
    producción (`NODE_ENV === 'production'`, no depende de que
    `NEXT_PUBLIC_APP_URL` tenga el valor correcto en Vercel, que hoy NO
    lo tiene) usa un dominio de marca fijo en el código
    (`https://app.4meaning.life`); en desarrollo/preview sigue cayendo a
    `window.location.origin` como antes, para no romper las pruebas
    locales. Esto cierra el bug COMPLETO que rompió el correo de
    Patricia -- es el único uso de `redirectTo` en todo el repo. Corregir
    el valor de `NEXT_PUBLIC_APP_URL` en el dashboard de Vercel sigue
    siendo aparte (config de cuenta, no código) y ya no es necesario para
    que esto funcione.
  - Quitado el catch-all que mostraba el mensaje crudo de Supabase
    (`authError.message`) a cualquier visitante anónimo para cualquier
    error no previsto por las dos reglas ya existentes.
  - "Espera un minuto y vuelve a intentar" (minimizaba una espera real de
    hasta una hora) corregido a un mensaje que no promete un tiempo que
    no se puede cumplir.
  - Verificado: `tsc --noEmit` limpio, la página carga y renderiza igual
    que antes. No se disparó un envío real (consumiría el cupo
    compartido de 2/hora que Patricia todavía puede necesitar).
  - Sin construir del plan barato: subir el mínimo de contraseña a 8 en
    el dashboard de Supabase (config de cuenta, no código); evaluar
    activar el captcha nativo de Supabase Auth (sí es código, una tarde,
    pero es una pieza aparte, no un ajuste de mensaje).
- Actualización 2026-09-23, auditoría completa de Daniel y Hugo (mecanismo
  y seguridad del flujo completo, no solo el bug puntual), plan conjunto
  entregado:
- Origen: Francisco, 2026-09-23, intentando recuperar el acceso de una
  cuenta real de equipo (`arriaza.patricia@gmail.com`). Con razón: "eso
  no nos puede pasar con un cliente."
- Qué se sabe, verificado en vivo: (1) el primer correo lo disparé desde
  mi entorno local, así que `redirectTo` (`recuperar-contrasena/page.tsx`,
  se arma con `window.location.origin`) apuntó a `localhost:3000` -- un
  enlace que nunca iba a funcionar para nadie fuera de mi máquina. Error
  mío, no del sistema. (2) Reintentando desde el sitio real, Supabase
  respondió con su límite de frecuencia: 2 correos de autenticación por
  HORA, para todo el proyecto (no por cuenta) -- ya anotado como
  pendiente desde antes (`personalab-producto-digital.md`: "se conecta
  SMTP propio (Resend) más adelante, no bloquea el trabajo de hoy"). Ese
  "más adelante" ya bloqueó trabajo real hoy.
- Actualización 2026-09-23, auditoría de Daniel y Hugo (mecanismo y
  seguridad del flujo completo, no solo el bug puntual):
  - **Daniel, mecanismo:** `redirectTo` es el ÚNICO uso de
    `redirectTo`/`emailRedirectTo` en todo el repo (grep exhaustivo);
    `inviteUserByEmail` (`lib/personalab/acceso.ts:35`) no pasa
    `redirectTo` y depende del Site URL del dashboard de Supabase
    (`app.4meaning.life`, según el comentario de `app/page.tsx:10-15`),
    así que ese camino no tiene este bug. El fix es de una línea. Hallazgo
    nuevo: en Vercel ya existe `NEXT_PUBLIC_APP_URL` (Production +
    Preview, confirmado con `vercel env ls`), pero CERO código lo lee
    (grep exhaustivo) y su valor real (`vercel env pull`, revisado y
    borrado) es `https://trascendencia-portal.vercel.app/`, NO
    `https://app.4meaning.life` -- confirmado con `vercel inspect` que
    ese dominio viejo sigue siendo alias vivo del mismo deployment, así
    que no está muerto, pero no es el dominio de marca y no hay forma de
    confirmar desde el código si está en la lista blanca de redirect URLs
    de Supabase (sin `supabase/config.toml`, esa lista solo vive en el
    dashboard). No usar esa variable tal cual; corregir su valor o
    introducir una nueva, solo en Production, para que Preview y local
    sigan cayendo a `window.location.origin` como hoy.
    `RESEND_API_KEY` confirmado en vivo, 2026-09-23, ausente en
    Production, Preview y Development de Vercel (las tres revisadas) --
    reconfirma P-005 sin cambio en dos días. Prueba en vivo del límite:
    4 llamadas seguidas a `POST /auth/v1/recover` con direcciones
    inventadas (nunca con la cuenta real de Patricia ni con ninguna
    dirección real, para no mandar correo sin permiso) devolvieron 200
    `{}` sin error -- no prueba que el cupo real esté disponible, porque
    Supabase no gasta el cupo de envío en una dirección que no existe (a
    propósito, para no filtrar cuentas). El costo de conectar Resend como
    SMTP de Supabase sigue siendo config pura (sección 3.4), pero el paso
    previo -- dominio verificado con SPF/DKIM, sección 3.2 -- tiene
    propagación de DNS real, no garantizada en "una tarde". Lo más grave:
    el mensaje que ve el cliente hoy cuando el cupo se agota
    (`recuperar-contrasena/page.tsx:35`, "espera un minuto") minimiza una
    espera que puede ser de hasta una hora, y ni siquiera es su propio
    intento el que pudo gastar el cupo (es compartido con las
    invitaciones de staff). No es hipotético: ya pasó hoy con dos cuentas
    de prueba en la misma hora -- el umbral es la escala de HOY, no una
    proyección.
  - **Hugo, seguridad:** sin enumeración de cuentas -- el éxito siempre
    da el mismo mensaje genérico (`recuperar-contrasena/page.tsx:68-70`),
    confirmado también contra el endpoint real (200 `{}` igual con
    dirección inventada). Pero el manejo de error tiene un catch-all real:
    `recuperar-contrasena/page.tsx:38-39` muestra el mensaje crudo de
    Supabase a cualquier visitante anónimo para cualquier error que no
    calce con los dos regex ya previstos, y como `email_log` no existe
    (PROTOCOLO-CORREO.md 4.2), ese texto ni siquiera queda registrado
    para el equipo -- se ve una vez en la pantalla de un desconocido y se
    pierde. El branch de "la dirección de retorno no está autorizada"
    también expone configuración interna a un anónimo, severidad baja.
    HALLAZGO NUEVO, el más serio: cero captcha en todo el repo (grep) y
    cero throttle propio delante de este formulario (grep, ya confirmado
    antes para otra ruta) -- el único freno es el cupo de Supabase, que
    es público (`/auth/v1/recover` no pide sesión, la anon key no es
    secreta), compartido entre recuperar contraseña e invitar personal, y
    cualquiera sin cuenta puede agotarlo con dos solicitudes y bloquear de
    paso las invitaciones reales del equipo. No es solo que el cupo sea
    bajo: es un recurso público, sin costo de ataque, compartido entre dos
    funciones críticas. CSRF revisado, sin hallazgo (el token viaje por
    header leído de almacenamiento same-origin, no por cookie ambiental
    cross-site). Contraseña mínima de 8 caracteres es SOLO del cliente
    (`nueva-contrasena/page.tsx:69`); nada en el repo confirma que
    Supabase también lo exige del lado del servidor (default de Supabase
    es 6, por debajo de lo que la pantalla promete).
- **Plan conjunto, barato/urgente (sin depender de Resend) contra lo que
  sí necesita Resend:**
  - Barato y ya (minutos a una tarde, sin Resend): fijar `redirectTo` a
    la URL de marca en vez de `window.location.origin` y corregir/retirar
    el valor equivocado de `NEXT_PUBLIC_APP_URL`; quitar el catch-all que
    muestra el error crudo de Supabase; corregir el mensaje de "espera un
    minuto" para que no minimice la espera real ni le atribuya el
    bloqueo al propio intento; subir el mínimo de contraseña en el
    dashboard de Supabase a 8 para que calce con la promesa en pantalla;
    evaluar activar el captcha nativo de Supabase Auth (única defensa
    real contra el DoS de cupo compartido mientras el cupo siga en 2/hora
    -- esto sí es código, no solo config, una tarde).
  - Necesita la pieza grande (Resend): lo único que de verdad sube el
    techo de 2/hora es conectar Resend como SMTP de Supabase (3.4),
    detrás de un dominio verificado con SPF/DKIM (3.2, con propagación de
    DNS real). Y aun conectado, la sección 4 completa de
    PROTOCOLO-CORREO.md (bitácora, webhooks, cola, lista de supresión,
    semáforo, alerta por push) sigue sin existir, así que conectar Resend
    quita el techo pero no da todavía visibilidad de si un correo real
    llegó -- ese es el segundo piso de "listo para un cliente real", no
    el primero.
- Dueño: Francisco decide qué del plan barato se construye ya y resuelve
  Resend externamente (dominio + llave); Claude ejecuta lo decidido.
- Criterio de cierre: un enlace de recuperación real, enviado desde
  producción, funciona de punta a punta para una cuenta real, verificado
  con ejecución real; y una decisión explícita sobre si el límite de
  2/hora de Supabase es aceptable para el volumen esperado de clientes
  reales o si Resend deja de ser "más adelante".

### P-013 — El editor no es versátil: siete quejas de Francisco, auditadas por Julian/Daniel/Leo
- Estado: **séptima vuelta: auditoría de Sora recibida y aplicada, verificado en vivo con cuenta y contenido desechables**
- Actualización 2026-09-23, séptima vuelta: Sora auditó TODO mensaje de
  error/estado del editor real, no solo "No se pudo guardar". Hallazgo
  más grave de lo que disparó la auditoría: `estadosPorSeccion` se
  escribía (`marcarSeccion`) pero NADA lo leía -- ni el chip de la
  cabecera (`estadoGlobal` solo miraba `estadosPorBloque`), ni el
  guardia de "¿salir sin guardar?" (`beforeunload`, mismo `estadoGlobal`),
  ni ninguna fila del riel. Editar el título de una sección no movía
  ningún indicador, en éxito o en error, y cerrar la pestaña con un
  título sin guardar no avisaba -- pérdida de datos silenciosa, más
  grave que un mensaje pobre. Corregido y verificado en vivo (cuenta
  desechable, contenido desechable en "El Presente como Regalo Demo",
  creado y borrado por la UI real, nunca sobre lo que Francisco pueda
  tener abierto):
  - `estadoGlobal` ahora también mira `estadosPorSeccion`: el chip de la
    cabecera y "Guardar ahora" reaccionan a un título/descripción de
    sección sin guardar, igual que ya reaccionaban a un bloque.
    Verificado: al editar un título, el chip pasó por "Guardando" y
    volvió a "Guardado"; antes se hubiera quedado en "Todo guardado"
    todo el tiempo, sin moverse.
  - Cada fila del riel (`FilaSeccion`) ahora muestra "Guardando…" o "No
    se guardó" en el lugar del conteo de bloques mientras hay algo
    pendiente, con un aro rojo discreto en error -- mismo lenguaje visual
    que ya usaba la tarjeta de un bloque. Verificado en vivo, capturado
    en el momento exacto del guardado.
  - `guardarYa` ("Guardar ahora" y Cmd/Ctrl+S) ahora también adelanta el
    debounce de una sección pendiente, no solo el de bloques -- si no se
    corregía, el botón podía aparecer por una sección y no hacer nada al
    hacer clic.
  - Los cuatro `catch` genéricos que Sora señaló (crear/mover/borrar
    sección, borrar bloque) ahora distinguen un choque de versión real
    (banner con "Recargar") de un fallo genérico, en vez de un mismo
    "Intenta de nuevo" para las dos causas -- reintentar contra una
    versión muerta solo vuelve a fallar, y el mensaje viejo no lo decía.
  - `errorGlobal` ahora se limpia también en el camino de ÉXITO de cada
    acción que puede ponerlo (guardar/crear bloque, guardar/mover/borrar
    sección), no solo al empezar tres acciones sueltas -- antes un
    banner de error podía sobrevivir a la corrección real y contradecir
    un chip que ya decía "Guardado".
  - Mensajes que antes caían al `catch` genérico SIN explicación (el
    hueco original, literalmente lo que reportó Francisco) ahora dicen
    qué pasó, con una distinción real de "sin conexión" (`navigator
    .onLine`) contra cualquier otro fallo -- no se construyó reintento
    automático al recuperar señal; eso es una pieza aparte, más grande
    (necesitaría guardar POR QUÉ falló cada guardado, no solo que
    falló), queda de backlog si se pide.
  - **Hallazgo propio, encontrado auditando el mismo camino que señaló
    Sora, no reportado por ella:** `guardarSeccionRemoto` y
    `reordenarSeccionesRemoto` (`almacenRemoto.ts`) hacían su `UPDATE`
    sin `.select()` -- el mismo defecto que `guardarBloque` ya tenía
    resuelto (comentario propio en el archivo, "MISMO DEFECTO QUE..."),
    pero nunca se replicó al escribir el CRUD de secciones. Un `UPDATE`
    cuya fila cae fuera del `using` de RLS (versión que dejó de ser el
    borrador vivo) no es un error para Postgres ni PostgREST -- son cero
    filas afectadas, y sin `.select()` la llamada vuelve como éxito.
    Confirmado contra la política real (`20260914_1030_hinges_por_
    version.sql:412-427`, mismo `for all using(...) with check(...)` que
    `blocks`): antes de esto, editar el título de una sección o
    reordenarla sobre una versión muerta reportaba "Guardado" sin haber
    escrito nada. Corregido con `.select('id').maybeSingle()` +
    `ConflictoDeVersion` si no hay fila, igual que `guardarBloque`.
  - Verificado también sin regresión: crear dos secciones, reordenarlas
    con las flechas, agregar un bloque de texto, editarlo y verlo
    persistir (consulta directa a la base), borrar bloque y secciones --
    todo con cuenta y contenido desechables, limpiado después.
- Actualización 2026-09-23, sexta vuelta: Francisco, usando el editor
  para construir contenido real, encontró tres bugs concretos y pidió
  tres auditorías nuevas, más una lista larga de cambios sin construir
  todavía.
  **Corregido, verificado en vivo:**
  - Negrita/cursiva "tira hasta abajo del texto": `el.focus()` sin
    `preventScroll` dispara el comportamiento nativo del navegador de
    desplazar la página para que el elemento enfocado quede a la vista
    -- en una sección con varios bloques, cada clic en negrita saltaba
    la pantalla entera. Corregido con `el.focus({ preventScroll: true })`
    en los dos sitios (negrita/cursiva y estilo de línea). No lo pude
    reproducir de punta a punta en mi entorno de prueba, pero es la
    causa real y documentada de exactamente este síntoma -- si Francisco
    lo sigue viendo después de este cambio, es una señal de que hay una
    segunda causa y hay que seguir buscando, no que el diagnóstico esté
    cerrado por decreto.
  - Vista previa del teléfono no se quedaba fija: mismo defecto que ya
    se había corregido en el riel y el lienzo (P-013, cuarta vuelta) --
    le faltaba la altura fija (`lg:h-[calc(100vh-164px)]`) para que el
    `sticky` tuviera de sobra todo el alto de la ventana donde pegarse.
    Sin esa altura, se pegaba solo mientras el contenido propio de esa
    columna alcanzara, y se soltaba en cuanto el lienzo se hacía más
    largo.
  - Descripción de sección no aparecía en ninguna vista previa: el campo
    nunca se leía en el panel del teléfono, en ningún lente. Corregido
    para que aparezca en el lente "Como moderador" (nunca en
    "participante" -- el propio campo dice "no la ve el participante").
  **Despachado, sin construir todavía:** Sora audita TODOS los mensajes
  de error/estado del editor real (no solo "No se pudo guardar", que
  fue el disparador) -- respuesta pendiente.
  **Plan de acción de Leo y Julian, entregado 2026-09-23, nada construido
  todavía, falta que Francisco confirme el orden:** verificaron sobre el
  código real (sin sesión de navegador) que el lector real
  (`app/(experiencia)/`) no tiene NINGÚN tratamiento de escritorio hoy --
  seis pantallas con `max-w-[620px]`/`max-w-[520px]` fijo en todos los
  breakpoints, `md:` solo cambia relleno y tamaño de letra, cero
  `@media` propio en `globals.css`/`marca.css`, cero lógica en JS atada a
  un ancho (el bug de `TopNav` a 375px ya está resuelto, mismo día, filas
  de arriba). No es una reparación, es una superficie sin decisión de
  escritorio todavía. El toggle del editor ("Como participante" / "Como
  moderador", `Editor.tsx:1062-1072`) filtra AUDIENCIA
  (`NIVEL[b.audiencia]`, `:649`), no dispositivo: el marco de teléfono
  (`:1076`, `w-[375px] lg:w-[320px]`) es fijo siempre. Decisión: construir
  primero el ancho de escritorio del lector real (columna de lectura
  ~620-680px se queda por legibilidad -- es la misma medida que Julian ya
  usa para rechazar texto justificado -- pero el lienzo alrededor gana
  composición real con el degradado/grano que BRAND.md §9 ya autoriza y
  que hoy no se usa en PersonaLab), y RECIÉN DESPUÉS agregar al editor un
  segundo selector de dispositivo (celular/computadora) que conviva con
  el de audiencia, nunca lo reemplace -- reemplazarlo borraría
  información que Francisco ya usa (la descripción solo-moderador).
  Construir el toggle antes que el layout real le mostraría al equipo
  una pantalla que la producción no sostiene. Orden de magnitud: el
  ensanche del lector es CSS puro sobre seis archivos más `Bloques.tsx`
  (ya fluido: `w-full`, `aspect-video`, `aspect-[2/1]`, sin anchos fijos
  en píxeles), medio día a un día si la dirección es "columna generosa +
  atmósfera", más si Francisco pide una composición distinta (rail de
  contexto, multi-columna) porque eso reabre a Sora (qué se puede
  revelar sin romper "se revela por apertura, no por logro"). El
  selector de dispositivo en el editor, una vez exista el layout real:
  horas, mismo orden que mover "+ Nueva sección" a la cabecera. Revisado
  también si el mismo patrón se repite en otra pantalla del participante:
  `app/(participant)/` (Trascendencia) no usa `max-w-[` en absoluto, así
  que no comparte este defecto específico -- no se auditó más a fondo,
  fuera de alcance hoy. Por consultar antes de construir: Sora
  (obligatorio, qué puede mostrar de más un lienzo ancho sin romper su
  propio criterio de revelado), Marcus (opcional, solo si esto amerita
  una regla explícita de ancho de columna en BRAND.md, que hoy no existe).
  **Pedido, sin decidir alcance todavía (backlog, no urgente hoy):**
  Ctrl+Z en el editor; una sección de referencias/fuentes por
  experiencia, citables aparte; renombrar el tipo de bloque "Consigna"
  a algo más claro; bullets/listas numeradas en el toolbar de texto
  (centrar texto ya se evaluó y Julian lo vetó explícitamente contra
  BRAND.md -- si Francisco insiste, es una decisión que hay que
  reabrir con él, no aplicar sola); un tipo de bloque "divisor" entre
  bloques.
- Actualización 2026-09-23, quinta vuelta: Sora y Leo respondieron con
  veredicto conjunto "PROCEDE". Verificaron, no de memoria: el botón
- Actualización 2026-09-23, quinta vuelta: Sora y Leo respondieron con
  veredicto conjunto "PROCEDE". Verificaron, no de memoria: el botón
  flotante de la cuarta vuelta resolvía "¿sobrevive al scroll?" pero no
  "¿lo veo sin que me lo señalen?" -- un FAB en una esquina es gramática
  de app de celular, y el editor real ya entrenó a mirar la cabecera
  fija (ahí viven "Guardar ahora" y "Revisar y publicar"). Movido: "+
  Nueva sección" ahora vive en la cabecera, no flotando. Confirmaron
  también que crear de inmediato con el título ya seleccionado sigue
  siendo lo correcto (un diálogo de nombre previo multiplicaría la
  ceremonia 16-20 veces por experiencia) -- no se construyó eso.
  Sobre el título: el lápiz de la cuarta vuelta "parcha, no arregla" --
  un campo se lee como campo por su caja, no por un ícono al lado. Se
  le dio caja real (borde + fondo) y se quitó el lápiz, que ya no
  agregaba nada. Midiendo esa caja salió un hallazgo más grande, no
  solo de este campo: el `INPUT` que usa TODO el editor da 1.15:1 de
  contraste de borde, muy por debajo del 3:1 de WCAG -- registrado
  aparte como P-014, no se resuelve aquí porque es un cambio de token,
  no de un campo.
  Sora encontró además, antes de tocar código, que convivían DOS "+
  Nueva sección" (la de la cuarta vuelta y el enlace viejo que se creía
  quitado) -- resultó ser una lectura de un instante intermedio de la
  cuarta vuelta, ya no existe en el código final, confirmado con grep.
  Leo hizo el barrido que pidió Francisco sobre el resto del editor:
  encontró un candidato barato más, de baja prioridad (las flechas
  ↑↓ de reordenar sección son invisibles en reposo, `opacity-0` hasta
  hover) -- no se corrigió porque ya existe arrastrar real como camino
  principal; queda nombrado para quien lo quiera barato después.
- Actualización 2026-09-23, cuarta vuelta: Francisco reportó, dos rondas
  seguidas, no poder encontrar "agregar sección". Investigado en vivo, no
  asumido: el botón SÍ existía y funcionaba, pero mi "fuera de la región
  que hace scroll" (tercera vuelta) no estaba fijo de verdad -- viajaba
  con el scroll de la PÁGINA completa, no del riel, así que había que
  bajar por las 16 secciones para encontrarlo. Corregido con el mismo
  patrón ya probado de "agregar bloque": botón flotante fijo de verdad
  (`position: fixed`), abajo a la izquierda, con texto visible en vez de
  un enlace pequeño al fondo de una lista.
  También: "Guardar ahora" seguía visible (deshabilitado) al entrar al
  editor sin nada pendiente, y confundía -- corregido para que solo
  aparezca cuando hay algo de verdad sin guardar, no que aparezca
  siempre y cambie de aspecto.
  Contraste medido (no estimado) en los elementos nuevos de esta semana:
  un fallo real encontrado y corregido -- el asa de arrastre `⠿` al 50%
  de opacidad daba 1.94:1, muy por debajo del mínimo de 3:1 para un
  control funcional; sólido da 4.52:1. El resto (botón flotante 13.09:1,
  lápiz 4.93:1, input de título 14.71:1, toolbar de texto 4.93:1) ya
  pasaba.
  Despaché a Sora y a Leo con la pregunta de fondo que pidió Francisco:
  no si el botón se ve, sino si "riel angosto con acción al fondo de la
  lista" es el patrón correcto para algo que se va a hacer muchas veces,
  bajo presión de tiempo. Respuesta pendiente -- lo que se decida ahí
  puede reemplazar el arreglo técnico de hoy, no solo sumarse.
- Actualización 2026-09-23, tercera y última ola: limpieza de tokens
  (58 líneas, hex vivo y `slate-*` fuera de marca dentro del propio
  `Editor.tsx`, cambiados a `text-ink`/`text-gray-ui`/`bg-paper(-2)`/
  `border-line`/`text-dom`/`text-terra-ui`/`rounded-[10px]`, con la
  única excepción a propósito del bisel del teléfono de la vista
  previa, que no es chrome de marca). Y arrastrar de verdad para
  reordenar secciones (`@dnd-kit/core` + `/sortable`, nueva dependencia,
  cero librería de este tipo existía antes): asa `⠿` junto a cada
  sección, las flechas ↑↓ se quedan como camino accesible por teclado.
  Verificado con una secuencia real de eventos de puntero (mousedown +
  varios pointermove + mouseup) contra la base real, porque el gesto
  simple del navegador de este entorno no dispara suficiente movimiento
  intermedio para que `@dnd-kit` lo reconozca -- no es un bug del
  código, es un límite de la herramienta de prueba. Confirmado el
  intercambio y revertido al orden original.
- Actualización 2026-09-23, con Francisco probando en tiempo real: sin
  esperar otra ronda de consejo (ya tenía el veredicto de Julian sobre
  forma), se construyó negrita/cursiva real (rodea la selección) y
  Párrafo/Subtítulo/Título (opera sobre la línea del cursor) para los
  siete tipos de bloque con texto. Bug real encontrado probando: un
  triple-clic incluye el salto de línea siguiente en la selección, y
  envolverla tal cual dejaba el cierre de `**` huérfano en su propia
  línea -- corregido recortando la selección al texto real antes de
  envolver. Los otros seis tipos de bloque (cita/consigna/gesto/aviso/
  nota/objeto) mostraban los asteriscos literales -- ahora interpretan
  negrita/cursiva vía `Enfasis`, nuevo export de `RenderMarkdown.tsx`.
  Verificado en un bloque `texto` y en uno `consigna`, con la vista
  previa real. También: scroll sin barra visible (pedido explícito,
  "ensucian la vista"), "+ Nueva sección" movida fuera de la región que
  scrollea, confirmación de borrar con la redacción exacta que pidió, y
  lápiz junto al título para que se vea editable antes de tocarlo.
  Queda: arrastrar de verdad (necesita `@dnd-kit`) y la limpieza de 27
  `text-slate-*` + 6 hex vivos dentro del propio `Editor.tsx` que
  encontró Julian.
- Origen: Francisco, 2026-09-23, usando el editor real de punta a punta
  por primera vez: "no es versátil, solo permite agregar bloques."
- **Hecho hoy, verificado con ejecución real (cuenta de equipo, consulta
  directa a la base) contra "El Presente como Regalo":**
  - Crear, renombrar/editar descripción, reordenar (flechas) y borrar
    (con confirmación) una sección -- el hueco más sólido de los siete,
    confirmado por Leo contra el historial completo: nunca existió, no
    era una regresión. `almacenRemoto.ts` (`crearSeccionRemoto`,
    `guardarSeccionRemoto`, `reordenarSeccionesRemoto`,
    `borrarSeccionRemoto`) + `Editor.tsx`.
  - Scroll independiente para el riel y el lienzo (arreglo CSS que
    Daniel y Julian ya habían escrito: `overflow-y-auto` sobre el
    `sticky` existente).
  - `spellCheck`/`lang="es"` explícitos en los campos de texto (ya
    funcionaba por default del navegador, según Daniel y Julian; esto
    lo hace explícito, no depende de un default silencioso).
  - Rótulo del botón "Guardar" aclarado ("Guardar ahora" + título
    explicando qué hace) -- Leo encontró que no estaba roto, dice lo
    mismo que el chip de al lado con otras palabras.
  - Palabra "sección" en el texto visible del editor donde antes decía
    "bisagra" (solo copy de esta pantalla, no los 884 usos del
    identificador en 32 archivos que encontró Leo -- eso es un rename
    mecánico aparte, sin urgencia, sin riesgo).
- **Decidido, sin construir todavía (orden de Leo, con Daniel y Julian ya
  de acuerdo en el fondo):**
  - Texto enriquecido: extender `RenderMarkdown.tsx` (ya admite
    `**negrita**`/`*cursiva*`/`##`/`###`, pero SOLO para bloques tipo
    `texto` -- hallazgo de Leo, los otros once tipos muestran los
    asteriscos literales) con H1 con nombre (Párrafo/Subtítulo/Título,
    veto de Julian a tamaños libres) y un toolbar sobre el `textarea`
    (`selectionStart/End`). Julian vetó color libre y centrar/justificar
    por fuera de BRAND.md. Sin decidir: hipervínculos. 2-4 días base,
    +1 por extra (Daniel).
  - Rótulo interno por bloque (no visible al participante, veto de
    Julian por chocar con los H2/H3 recién aprobados): mismo patrón
    aditivo que `aplicaDigital`/`guarda`, sin bloqueo técnico (Daniel).
  - Arrastrar para reordenar de verdad (hoy son flechas): necesita
    `@dnd-kit` (cero librería de drag hoy), ~1-2 días por lista, riel de
    secciones y lista de bloques son dos contextos distintos (Daniel).
    Pospuesto hasta que el reordenar con flechas esté probado en uso
    real (Leo).
  - Limpieza de 27 usos de `text-slate-*` + 6 hex vivos + radios fuera
    de norma DENTRO del propio `Editor.tsx` (hallazgo de Julian, fuera
    de las siete quejas): es la razón formal de que el editor "lea
    formulario genérico" aunque sus botones ya estén en marca.
- **Hallazgo no pedido, de Leo:** el producto promete "se editan/arman
  desde el editor" en su propia copy (`EditarFichaClient.tsx:50`,
  `experiencias/nueva/page.tsx:58`) sin cumplirlo -- corregido de hecho
  con esta misma pasada, ya no es falso.
- Dueño: Claude construye lo decidido; falta que Francisco confirme
  alcance de hipervínculos antes de esa pieza.
- Criterio de cierre: cada pieza, verificada con ejecución real, no
  lectura de código.

### P-011 — Cinco cambios estructurales para que el lector deje de sentirse "muy sutil"
- Estado: **abierto**
- Origen: Julian, 2026-09-21, segunda vuelta después de que Francisco
  repitiera la misma crítica tras H-005. Julian ya no sostiene su propio
  veredicto anterior ("bien logrados"): dice que auditó cumplimiento de
  marca, no si el conjunto se siente producido, y que su propia
  unificación de tokens en H-005 (objeto/archivo/nota a un solo
  contenedor) empeoró la monotonía que Francisco denuncia, porque antes
  tres siluetas distintas rompían por accidente el patrón que hoy se ve
  parejo. Nada de esto es copy ni contenido nuevo -- es forma, jurisdicción
  de Julian, y él la respeta explícitamente (no decidió secuencia ni
  contenido, eso es de Sora).
- Los cinco, en el orden de apalancamiento que Julian dio:
  1. Construir el cruce de tramo en el encabezado de bisagra -- decisión
     YA APROBADA por el propio Julian el 2026-09-12 (su Consejo del
     mismo día) y nunca construida. El dato ya existe (`Bisagra.tramo`),
     la lógica de detección ya está escrita en el índice
     (`[slug]/page.tsx:100`), solo falta aplicarla al vecino anterior en
     `[bisagra]/page.tsx`.
  2. Revisar con Sora el techo de frecuencia del umbral oscuro a pantalla
     completa (`UmbralBienvenida.tsx`): hoy aparece UNA sola vez por
     cuenta para siempre; la doctrina de Julian pide 2-3. No decide él
     dónde, decide que la forma ya existe y está subusada.
  3. Diferenciar SILUETA, no color, de los seis tipos de bloque
     (consigna, aviso, nota, gesto, objeto, archivo) que hoy comparten
     margen y contenedor casi idénticos (`mt-8 md:mt-10`,
     `bg-paper-2 border border-line rounded-[10px]`), distinguidos solo
     por el texto de un rótulo de 10px.
  4. Aplicar degradado+grano al umbral y al nuevo encabezado de cruce de
     tramo -- ya autorizado por BRAND.md §9, ya implementado en
     `assets/brand.css:70-81` para el sitio público, con CERO uso en
     todo PersonaLab (grep verificado). Cero token nuevo, cero hex nuevo.
  5. Generalizar el patrón de `gesto` (ícono + tratamiento propio sin
     imagen) a los demás tipos de bloque sin imagen, que hoy caen a
     rótulo + texto plano sin ningún dispositivo visual.
- Tensión sin resolver que Julian marcó y no decidió: `font-mono` en los
  números del índice (`[slug]/page.tsx:110`) ya rompe BRAND.md §5 ("100%
  sans, sin excepción") como precedente real -- punto para Marcus o
  Francisco, no de Julian.
- Dueño: sin asignar -- necesita que Francisco decida si esto se
  construye ahora (es una vuelta de trabajo real, no un ajuste rápido) y,
  si sí, con qué alcance de los cinco.
- Criterio de cierre: cada uno de los cinco puntos que se decida
  construir, verificado con ejecución real (captura de la bisagra real,
  no de la previa de equipo) contra "El Presente como Regalo".

### P-010 — El Presente como Regalo se ve vacío para cualquier comprador digital real
- Estado: **abierto, urgente**
- Origen: Claude, 2026-09-21, verificando con una cuenta real de comprador
  individual (grant real, no cuenta de equipo) por qué el lector se sentía
  "muy sutil". No es un problema de diseño: es que no hay nada que ver.
  `/experiencia/presente-regalo` (la ruta real, verificada con sesión real,
  no la previa de equipo) muestra "Son 0 pasos. Esta experiencia todavía no
  tiene contenido publicado para leer en línea."
- Qué se sabe, verificado con consulta directa a la base: la versión
  publicada (`fc912c8a...`, número 2) SÍ tiene 9 bisagras reales y 19
  bloques reales de contenido, 5 de las 9 bisagras marcadas `listo: true`.
  Pero `cargarExperiencia()` (`lib/personalab/lectura.ts:160-166`) filtra
  por `modo in ('digital','ambos')` ADEMÁS de `listo = true` -- un diseño
  deliberado de Leo (Consejo del 2026-09-12, evitar bisagras vacías en el
  lector) que falla cerrado a propósito. El problema es el dato: las 5
  bisagras `listo: true` (Invitación al grupo, El inventario del hoy, La
  carta al futuro, Capa mensual, Entrega de la carta) están TODAS en
  `modo: 'presencial'` (el default de la columna); las 4 que sí están en
  `modo: 'digital'` (Finitud, Gratitud, Silencio, Perdón) NO están
  `listo`. Cero intersección → cero bisagras → "0 pasos" para cualquier
  comprador digital real, hoy, en producción.
- No hay control en el editor para esto: `Editor.tsx` no tiene ningún
  campo que toque `hinges.modo` (grep verificado). Solo existe el
  checkbox "Aplica al modo digital" que agregué hoy a nivel de BLOQUE
  `gesto` (H-005) -- eso es un campo distinto, no ayuda aquí. Arreglar
  esto hoy requiere escribir directo a la base, o construir el control
  que falta en el editor.
- Por qué no lo ejecuté solo: cuáles de las 5 bisagras terminadas deben
  quedar `modo: digital` o `ambos` es una decisión de producto, no
  técnica. Al menos una ("La carta al futuro") involucra un objeto físico
  real (la carta se sella a mano, `contenido.ts:96-98`) y puede que a
  propósito no deba abrirse igual sin ese objeto -- exactamente el tipo
  de decisión que el campo `aplicaDigital` de H-005 existe para resolver
  bloque por bloque, no experiencia por experiencia con un flip ciego.
- Dueño: Francisco decide qué bisagras abren en digital; Claude ejecuta
  en cuanto haya respuesta.
- Criterio de cierre: una cuenta de comprador individual real ve al menos
  una bisagra al entrar a `/experiencia/presente-regalo`, verificado con
  sesión real, no con la previa de equipo.

### P-009 — El lector no distingue peso: el sellado de la carta se ve igual que un calentamiento
- Estado: **abierto**
- Origen: Sora, 2026-09-21, juicio de sensación pedido por Francisco después
  de repetir su crítica de UX/UI en producción real, tras la revisión de
  Julian (H-005) que calificó los doce tipos de bloque como "bien logrados"
  sin abrir el navegador. Corrección a la nota que Sora dejó aquí sobre la
  cejilla "IGNICIÓN": Francisco la vio en `/personalab/vista/c3`, que
  Claude confirmó después (y Julian, por separado, también) que es una
  previa de EQUIPO con datos de muestra (`dominio.ts`/`contenido.ts`), un
  árbol de código distinto de la ruta real del comprador
  (`app/(experiencia)/experiencia/[slug]/[bisagra]/page.tsx`, sin rastro
  de `ETIQUETA_TIEMPO`, confirmado por grep). La cejilla SÍ sigue viva en
  `app/(admin)/personalab/vista/[encuentroId]/[bisagraId]/page.tsx:60,94`,
  con su propia paleta hex suelta (`#002B34`, `#8F5341`, `#676E6E`) sin
  tocar desde antes de H-005 -- es un hallazgo real, aparte, sin dueño
  todavía (ver higiene fuera de encargo en la memoria de Julian,
  interacción 22).
- Qué se sabe: el contenedor (rótulo pequeño + línea `border-line` +
  texto) es el mismo para TODO bloque de un mismo tipo, sin importar lo que
  pide. En "El inventario del hoy" (p2), la consigna `b6` ("escribe cinco
  cosas...", `Escritura.tsx`) es un calentamiento reversible: se puede
  reescribir hasta cerrar la pestaña y no vuelve en ningún lado. En "La
  carta al futuro" (p3), la consigna `b13` ("escribe tu nombre en el sobre
  y ciérralo... vuelve a tus manos en seis meses", `contenido.ts:96-98`) es
  el único gesto irreversible de todo el producto digital, el que sostiene
  el arco de seis meses hasta `p5`. Las dos consignas usan exactamente el
  mismo componente, con el mismo margen, el mismo rótulo. El bloque
  `aviso` que sigue ("no se digitaliza, no se fotografía... te la
  devolvemos cerrada", `b14`) también comparte molde con cualquier aviso
  rutinario del sistema. El único bloque con margen distinto hoy es
  `pausa` (`Bloques.tsx`, comentario de Elena del 2026-09-11: "el mayor
  del sistema, para que se sienta como un corte real"), es decir que un
  silencio de veinte segundos pesa hoy más, visualmente, que sellar una
  carta a mano.
- No es un hallazgo de forma (eso ya lo tiene Julian y no se re-litiga
  aquí): es que ni un solo lugar del sistema marca, con espacio o con
  quietud, que el sellado es distinto de los demás. No se propone copy
  nuevo ni componente nuevo; el juicio completo, con las tres preguntas
  contestadas, vive en la sesión de Sora del 2026-09-21.
- Dueño: sin asignar — es alcance de producto (cuánto se invierte en un
  solo momento) antes que decisión técnica.
- Criterio de cierre: decisión explícita de si el sellado de `p3`
  (consigna + objeto + aviso) recibe tratamiento sensorial distinto del
  resto de las consignas del sistema, o si se decide a propósito que no lo
  necesita. No cuenta como cerrado un cambio que solo reordene texto.

### P-008 — `pl_titularidad.miembro_foro`, un valor de enum real
- Estado: **abierto**
- Origen: Daniel, 2026-09-21, al evaluar el alcance de H-007. Tiene la
  misma forma que `pl_estado_corrida` (aplazado en H-006): es un VALOR de
  enum, no un nombre de columna, comparado y renderizado en varios sitios.
  Se dejó intacto a propósito — solo se cambió su etiqueta visible
  ("Miembro de grupo" en `ProgresoClient.tsx`).
- Dueño: sin asignar.
- Criterio de cierre: decisión explícita de si vale la pena la migración
  de enum (`alter type ... rename value`) o si con la etiqueta visible ya
  cambiada es suficiente y este valor se queda como deuda interna
  invisible para siempre.

### P-003 — Moderadores anidados dentro de su grupo
- Estado: **decidido**
- Origen: Francisco, 2026-09-21. Confirmado: un grupo tiene UN moderador
  (`moderadorId` singular se queda como está).
- Qué se sabe: la relación ya existe en el modelo (`Moderador.capituloId`).
  Falta construir `/personalab/[grupos]/[id]`, que HOY NO EXISTE (Leo lo
  verificó), y quitar la pestaña plana de moderadores del nav.
- Dueño: Claude.
- Criterio de cierre: página de detalle de grupo construida y navegable,
  mostrando su moderador; la entrada de nav separada para moderadores,
  eliminada; probado en el navegador, no solo compilado.

### P-005 — Retorno: automatizar los envíos ahora, sin caso de uso activo
- Estado: **decidido, bloqueado en parte por infraestructura externa**
- Origen: Francisco, 2026-09-21 ("constrúyelo ahora de todas formas"), pese
  a que la única experiencia con retorno real diseñado (El Agradecimiento)
  está pausada y lo que se vende hoy (El Presente como Regalo) no tiene
  retorno.
- Qué se sabe:
  - `Experiencia.abreEspacioAlForo` NO es el campo "tiene retorno" (Daniel y
    Hugo lo confirmaron con el mismo contraejemplo: Metamorfosis lo tiene en
    `false` y sí tiene tres bisagras de tiempo `retorno`). El campo correcto
    ya existe sin nombrarse: `bisagras.some(b => b.tiempo === 'retorno')`.
  - Los envíos reales de correo (`/api/experiencia/enviar`, confirmación de
    firma) dependen de `RESEND_API_KEY`, que sigue sin configurarse en
    Vercel (verificado con `vercel env ls production`, cero resultados,
    2026-09-21). El correo de Supabase Auth (invitación/recuperar) tiene
    tope de 2/hora, no sirve para esto.
  - Depende de P-001/P-002 para el nombre ("Retorno" es parte del léxico en
    discusión).
- Dueño: Claude construye lo que no depende de terceros (el modelo de
  programación — cuándo toca qué a qué grupo o individual — y la lógica de
  envío); Francisco resuelve Resend externamente para que los envíos reales
  salgan.
- Criterio de cierre: un envío programado se dispara solo, sin acción manual,
  verificado con un envío real de prueba una vez Resend esté configurado.

### P-006b — La causa de fondo: no existe "staff solo de PersonaLab"
- Estado: **abierto**
- Origen: Daniel, 2026-09-21. Es la TERCERA vez que señala este mismo hueco
  (Consejo #002, su auditoría del 13-sep, y ahora): falta una tabla de
  membresías persona×marca×rol. Hoy el rol es un campo único y global en
  `profiles`, así que no puede distinguir "esta cuenta es staff de
  PersonaLab" de "esta cuenta es staff de Trascendencia". H-004 (abajo, en
  Hecho) corrigió el síntoma sin tocar esto.
- Dueño: sin asignar todavía.
- Criterio de cierre: Daniel dice que ya está especificada, pendiente de
  construir. Falta traer esa especificación antes de empezar.

## Rechazados

*(vacío por ahora)*

## Hecho

### H-009 — P-007 cerrado: la base ya se llama grupo, no foro
- Estado: **hecho** — verificado 2026-09-21
- Origen: Francisco corrió `supabase/migrations/20260921_1900_foro_se_llama_grupo.sql`
  directo en el editor SQL del dashboard de Supabase (yo no tengo ni puedo
  tener acceso para iniciar sesión ahí — es una de las cosas que tengo
  prohibido hacer aunque se me autorice explícitamente).
- Verificado con consulta real a la base (no lectura de código): las
  columnas `experiences.abre_espacio_al_grupo` y `runs.personas_en_el_grupo`
  existen y responden; los nombres viejos (`abre_espacio_al_foro`,
  `personas_en_el_foro`) ya no existen, confirmado porque Postgres
  devuelve "column does not exist" al pedirlos.
- Quitadas las dos costuras de traducción que quedaban desde H-007:
  `lib/personalab/catalogo.ts` (3 usos) y
  `app/(admin)/personalab/experiencias/actions.ts` (2 usos) ya leen y
  escriben directo `abre_espacio_al_grupo`/`personas_en_el_grupo`, sin el
  comentario `TODO` que apuntaba a esta migración.
- Verificado en el navegador con una cuenta desechable, contra la base
  real (no datos de `dominio.ts`): la lista de Experiencias muestra bien
  la columna "Espacio al grupo" para las seis experiencias reales; la
  ficha de "El Presente como Regalo" la muestra bien; y el formulario de
  editar la ficha SÍ escribe el valor nuevo en la base al guardar
  (probado destildando el checkbox, confirmado `false` por consulta
  directa, y restaurado a su valor original `true` de la misma forma,
  también confirmado por consulta directa, para no dejar alterado un
  dato real de producto).

### H-008 — P-001 cerrado: guion, kit y retorno se quedan igual
- Estado: **hecho** — verificado 2026-09-21
- Origen: continuación de P-001 sobre las tres palabras que quedaban
  después de H-006/H-007. El propio archivo `dominio.ts` las llamaba
  "léxico compartido con Trascendencia, heredado de YPO" sin haberlo
  verificado nunca — este pendiente era exactamente para comprobar eso
  antes de tocar nada.
- Nora verificó (contra su propia memoria del proyecto, no por intuición)
  que ninguna de las tres viene de YPO: las tres se acuñaron dentro de la
  casa el 2026-07-07, en el consejo del protocolo de retorno, dos meses y
  medio antes de que existiera la pregunta de vocabulario YPO. Y que
  Trascendencia no comparte estas palabras — tiene las suyas propias para
  lo mismo (itinerario, materiales, entregas; ver la tabla de
  equivalencia en `dominio.ts`), así que "compartido" tampoco era cierto.
  Decisión: no cambia ninguna etiqueta.
- Daniel verificó el alcance técnico igual que para foro, por si acaso
  algo sí cambiaba: `guion` no toca la base (cero objetos Postgres);
  `kit` es una tabla real (`kit_pieces`) de un solo consumidor, de solo
  lectura, sin FK/CHECK/vista — rename hubiera sido barato si hacía
  falta; `retorno` es el más profundo de los tres, un valor de enum real
  (`pl_tiempo`) cuyo ORDEN se usa estructuralmente en
  `solo_avanza_marcador()`, más una tabla dormida (`public.returns`, cero
  consumidores) y una capa TS activa. Hallazgo de Daniel para dejar
  anotado aunque hoy no aplique: `lib/personalab/progreso.ts:147`
  compara el string literal `'retorno'` a mano contra `hinge.tiempo` en
  un diccionario de orden; si algún día se renombra ese valor de enum sin
  tocar esa línea en el mismo cambio, la posición cae en silencio a `9`.
- Corregido en `app/(admin)/personalab/dominio.ts`: el comentario que
  encuadraba mal las tres palabras. Ningún otro archivo cambia — no hay
  relabeling que aplicar porque no hay palabra nueva.
- Con esto, P-001 queda completo: `capítulo`→`grupo` y `corrida`→
  `encuentro` (H-006), `foro`→`grupo` (H-007), y `guion`/`kit`/`retorno`
  confirmados como ya propios (H-008).

### H-007 — Foro se funde en grupo (código); migración lista, sin correr
- Estado: **hecho** (código) — verificado 2026-09-21; migración de base
  corrida y verificada después, ver H-009
- Origen: Francisco ("sigue con foro"), continuando H-006. Decisión de
  Nora: no es palabra nueva, es fundir dos etiquetas que ya nombraban lo
  mismo (el propio `dominio.ts` ya lo decía). Alcance verificado por
  Daniel antes de tocar nada: dos columnas reales (`abre_espacio_al_foro`,
  `personas_en_el_foro`), y un valor de enum real
  (`pl_titularidad.miembro_foro`) que se deja aparte, ver P-008.
- 18 archivos de `app/(admin)/personalab` y `lib/personalab`: `dominio.ts`
  (tipos, datos), `lib/personalab/catalogo.ts` y `experiencias/actions.ts`
  (los campos de TS ya se llaman `abreEspacioAlGrupo`/`personasEnElGrupo`,
  desacoplados de las columnas reales, que siguen con su nombre viejo
  hasta que corra la migración), y todas las pantallas que muestran la
  palabra. De paso, una redundancia real encontrada en el navegador
  ("Grupo Grupo Anáhuac") corregida quitando la etiqueta repetida.
- Verificado en un deploy real, sección por sección: Resumen, Encuentros,
  Grupos, Moderadores, Retorno, Progreso, y el catálogo real de
  Experiencias (lista, nueva, ficha, checkbox).

### H-006 — Capítulo → Grupo, Corrida → Encuentro; Kit fuera del nav
- Estado: **hecho** — verificado 2026-09-21
- Origen: Francisco ("CAMBIA LOS NOMBRES"), sobre P-002 (ya decidido) y
  P-004 (ya decidido).
- `capítulo`→`grupo` y `corrida`→`encuentro`, palabra e identificadores,
  en todo `app/(admin)/personalab` y `lib/personalab`: `dominio.ts` (tipos,
  datos, funciones), `lib/personalab/catalogo.ts` (el catálogo REAL, que
  lee `chapters`/`runs`), rutas (`/personalab/grupos`,
  `/personalab/encuentros`, `vista/[encuentroId]`), nav, `/workspaces`.
  El enum real de la base (`pl_estado_corrida`) NO se tocó — renombrar un
  enum de Postgres es una migración aparte, no un cambio de etiqueta; sus
  claves siguen en español-viejo mientras que solo lo que se MUESTRA
  cambió. Verificado en un deploy real, sección por sección: Resumen,
  Grupos, Encuentros, Moderadores, Retorno, y la ficha real de una
  experiencia con un encuentro de verdad (no solo datos de `dominio.ts`).
- Kit ya no aparece en `PersonaLabNav.tsx`. Su contenido real sigue en
  `Experiencia.kit`, sin pantalla propia — migrarlo a un documento interno
  de verdad queda pendiente, no se inventó hoy.
- Sin tocar, a propósito: `foro` (resuelto después en H-007) y `guion`,
  `kit`, `retorno` (resueltos después en H-008, sin cambio). Moderadores
  sigue como pestaña plana — eso es P-003, sigue abierto (falta construir
  la página de detalle de grupo donde debería anidarse).

### H-005 — Rediseño real del lector de participante y del editor, sección por sección
- Estado: **hecho para lo que cubrió** — verificado 2026-09-21, pero la
  fila se queda corta del encargo original. Francisco vio el resultado en
  producción el mismo día y repitió su crítica de siempre ("muy sutil").
  Julian reabrió su propio veredicto (interacción 22 de su memoria): su
  revisión (abajo) auditó cumplimiento de marca (tokens, radios, sans),
  no si el CONJUNTO se siente producido, y son preguntas distintas que
  pueden dar resultados opuestos sobre el mismo código. Lo que falta,
  estructural y con dueño, sigue en P-011. Esta fila no se borra ni se
  pasa a `abierto` -- lo que dice que se hizo, se hizo y se verificó; lo
  que faltó, está en P-011, no aquí.
- Origen: Francisco, 2026-09-21. "Necesito que sigamos mejorando el diseño
  de lo que ve el participante... que no sean cambios que prácticamente ni
  se notan, como siempre hacen... sección por sección, imposibilitando
  cualquier atajo... Quiero que hagan lo mismo con el editor."
- Julian y Leo revisaron las dos superficies bloque por bloque, cada uno
  consultando a Sora y Daniel donde el terreno no era el suyo (documentado
  con cita literal en sus memorias). Ejecutado en cuatro commits
  (`bfbd2b6`, `5b94733`, `199d11c`, `e7f3a22`), cada uno verificado con
  ejecución real, no lectura de código:
  - **Lector**: tokens reales en objeto/nota/archivo/video (antes hex
    vivo, uno con radio de 12px contra el mandato de BRAND.md de 10px);
    alt no vacío en imagen; gesto con `aplicaDigital` (falla cerrado —
    tres bloques reales de El Agradecimiento, "escríbelo a mano en tu
    libreta", dejan de pintarse en el lector digital hasta que alguien
    los marque); se revirtió la cejilla de tiempo que yo mismo había
    agregado antes en esta misma sesión, por hallazgo cruzado de Julian
    y Sora.
  - **Editor**: tarjetas colapsables + botón flotante de agregar (el
    cambio más notorio, según los dos); etiqueta de campo duplicada
    corregida derivándola del contrato; selector de audiencia sin peso
    visual en su default; grid de tres columnas desde 1024px en vez de
    1280px; aviso cuando "segundos de pausa" supera el techo real;
    "Quitar archivo" ahora pide confirmar, igual que borrar un bloque.
  - **TopNav**: colapsa a menú bajo 640px — antes desbordaba 19px a
    375px, con "Cerrar sesión" cortado fuera del borde.
  - **Cierre y acceso**: `Cierre.tsx` ya no afirma "Terminaste" sin haber
    llegado al final (hallazgo de Hugo, re-verificado vivo); `sin-acceso`
    se separó de un nuevo `sin-contenido` para no decirle a un comprador
    real que quizás se equivocó de cuenta.
  Verificado en un deploy real (no solo local): login, lector sin cejilla
  ni gesto no marcado, editor con tarjetas colapsables, checkbox de
  gesto guardando de verdad contra la base, menú móvil funcionando a
  375px.

### H-001 — El rol 'individual' no existía para la base de datos
- Estado: **hecho** — verificado 2026-09-21
- Ver `docs/INCIDENTE-ROL-INDIVIDUAL.md`, cerrado hoy. Las tres correcciones
  (restricción de la base, `ROLES_VALIDOS`, `EditRoleSelect.tsx`) estaban
  aplicadas desde el 11 de septiembre; el documento nunca se marcó cerrado.
  Verificado con una consulta real a la restricción de Postgres y grep del
  código actual, no con la fecha del commit.

### H-002 — Cuenta nueva canjeada por Compras quedaba en role='participant'
- Estado: **hecho** — verificado 2026-09-21
- `handle_new_user()` deja todo perfil nuevo en `role='participant'` (el
  default de la columna) y corre antes de que el código mirara si la fila ya
  existía. Corregido en `lib/personalab/acceso.ts` (commit `0aa4dd7`):
  `asegurarPerfilIndividual` ahora distingue "cuenta nueva" de "cuenta ya
  confirmada de antes" usando `correoEnviado`, no "¿existe la fila?".
  Verificado por la UI real de Compras dos veces: una cuenta nueva quedó en
  `individual`; una cuenta ya confirmada como Trascendencia conservó su rol
  y de todas formas recibió su grant.

### H-004 — Todo staff aterrizaba en Trascendencia al entrar, siempre
- Estado: **hecho** — verificado 2026-09-21
- Origen: Francisco, 2026-09-21 ("sigue abriéndome el login dentro de
  trascendencia"). `inicioDe()` mandaba a cualquier super_admin/admin/staff
  a `/hoy`, que es 100% Trascendencia, sin excepción.
- Corregido en `lib/rutas/porRol.ts` (commit `6fe59e6`): el staff entra por
  `/workspaces`, la pantalla neutral que ya existía. Verificado con una
  cuenta nueva real, en producción, en una pestaña sin sesión previa:
  aterriza en "¿Dónde vas a trabajar?", no en ninguna marca.
- Esto es el SÍNTOMA. La causa de fondo sigue abierta en P-006b.

### H-003 — El portal entero se llamaba y se veía "Trascendencia"
- Estado: **hecho** — verificado 2026-09-21
- El `<title>`, el nombre de la PWA, `manifest.json` (incluido su
  `start_url`, que apuntaba a `/mi-retiro` y rompía para cuentas de
  PersonaLab) y el umbral compartido (login/recuperar/nueva-contraseña)
  decían o pintaban "Trascendencia" sin importar la cuenta. Commit `fa537c6`.
  Verificado en producción real, `app.4meaning.life/login`, con captura.
