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

### P-012 — El Presente como Regalo, construido con la cronología real: falta correr la migración y publicar
- Estado: **decidido, código listo, contenido escrito en borrador, bloqueado en la migración**
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
