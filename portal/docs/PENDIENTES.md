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

### P-026 — Cuatro ajustes de pulido del editor: botón flotante fuera, padding del lienzo, panel por zona, pie del borrador fuera
- Estado: **construido y verificado en vivo, 2026-10-01**
- Origen: Francisco, 2026-10-01, cuatro pedidos juntos.
- **"El botón de la esquina inferior derecha que agrega bloques... estorba."**
  Era el "+" flotante que llevaba hasta el panel "Agregar bloque"
  (construido junto con P-024, el mismo día). Con el panel ya arriba y
  siempre visible al entrar a un segmento (P-024), el atajo dejó de
  hacer falta -- se quitó entero, junto con el `id="agregar-bloque"` y
  el `scroll-mt-24` que solo él usaba.
- **"El scroll de la sección de bloques no tiene un padding o un margen
  inferior... se ve raro."** El riel de secciones SÍ traía `pb-16` desde
  siempre; el lienzo de bloques (el mismo contenedor, mismo patrón de
  scroll, según su propio comentario) nunca lo tuvo -- un `pb-16` que
  faltaba, confirmado comparando los dos contenedores, no un rediseño.
- **"Dile a Julian que trabaje en darle una distinción a las distintas
  secciones del editor... alguna sombra o una diferencia de tono..."**
  Antes las tres columnas (riel, lienzo, vista previa) flotaban sueltas
  sobre el mismo suelo `bg-paper-2` del layout, sin marco propio --
  tarjetas individuales (una fila de sección, un bloque, el selector de
  vista previa) sí se distinguían entre sí, pero las TRES ZONAS GENERALES
  no se distinguían de nada; de ahí "es como estar trabajando todo lo
  mismo". Pase de Julian, usando el sistema de dos peldaños que ya rige
  el resto del portal (`lib/estilos/oficina.ts`: suelo `paper-2`,
  elevado `paper` + `border-line`), no un lenguaje nuevo: las tres
  columnas son ahora su propio panel `TARJETA`, con el `gap-6` de la
  cuadrícula pintando el suelo entre ellas como el corte real. Dentro del
  riel y de la vista previa, piezas que ya eran `TARJETA` (la fila de
  sección activa, el selector celular/computadora) perdieron su propio
  fondo/borde donde quedaba redundante dentro del panel nuevo -- una
  tarjeta idéntica dentro de otra tarjeta idéntica no sumaba nada. Al
  marco de escritorio (`dispositivo === 'computadora'`) se le agregó
  `shadow-md`, que nunca había tenido pese a representar lo mismo que el
  bisel del celular (un objeto, una pantalla simulada), que sí trae
  `shadow-xl` desde siempre -- no es sombra nueva en columnas quietas
  (eso se evitó a propósito, ver el comentario grande en `Editor.tsx`
  junto a la cuadrícula: `shadow-lg` en este portal está reservado a lo
  que de verdad flota, como un menú), es la MISMA idea que ya existía
  para el celular, aplicada al modo que no la tenía.
- **"'Estás viendo el borrador...' Es innecesario este texto."** Se quitó
  el párrafo entero debajo de la vista previa. El comentario que
  explicaba por qué el bisel del celular se encogía en ventanas bajas
  (2026-09-24) citaba ese pie como una de las piezas que restaban
  espacio -- se corrigió esa explicación para no describir un elemento
  que ya no existe, y se confirmó que quitarlo no reabre ese bug (un
  `lg:flex-none` menos le deja más espacio al bisel, nunca menos).
- Verificado en vivo con cuenta y experiencia desechables (cuatro
  segmentos en los tres tiempos, uno con tres bloques): las tres columnas
  se ven como tres paneles bordeados separados por el suelo, en celular Y
  en computadora, riel colapsado Y expandido, 1280px Y 375px (mobile,
  donde las tres se apilan y cada una sigue leyéndose como su propio
  panel). El padding inferior del lienzo se confirmó con capturas
  desplazadas hasta el último bloque. El botón flotante no aparece en
  ningún estado. El pie del borrador no aparece. `shadow-md` del marco de
  escritorio confirmado con `getComputedStyle` contra el elemento real,
  no solo mirado. Sin errores nuevos en consola (el único warning que
  aparece es el de hidratación ya documentado en P-023, preexistente,
  confirmado otra vez que no lo causa este cambio). `npx tsc --noEmit`
  limpio.
- **CORRECCIÓN EL MISMO DÍA -- la verificación de arriba no lo agarró.**
  Francisco, apenas visto el cambio: "el borde derecho del celular se
  corta. Hay mucho márgen entre el espacio de bloques y el espacio del
  celular." Dos hallazgos reales, los dos causados por el panel nuevo:
  - El bisel del celular tenía `lg:w-[320px]` FIJO, calibrado contra una
    columna de 320px sin borde ni padding propios. En cuanto esa columna
    ganó su panel (`border` + `p-3`, 26px entre los dos), el bisel pedía
    más ancho del que su contenedor ya tenía y se recortaba contra el
    `overflow-hidden` nuevo -- dos números fijos (el ancho del bisel Y el
    ancho de columna del grid) describiendo la misma cosa sin que nada
    los mantuviera iguales. Corregido quitando el ancho fijo: el bisel
    ahora ESTIRA al 100% del espacio real que `flex` le da (mismo
    mecanismo que ya usaba el marco de escritorio con `max-w-[620px]`),
    con `lg:max-w-[320px]` como techo, no como valor fijo.
  - El `gap-6` (24px) entre columnas nunca cambió de número, pero con las
    tres columnas ya bordeadas ese mismo espacio se empezó a LEER como
    un vacío entre tarjetas, no como aire alrededor de contenido suelto
    -- el borde nuevo cambió cuánto vacío se percibe, aunque el pixel no
    se hubiera movido antes de este commit. Bajado a `gap-4` (16px).
  - Verificado en vivo otra vez, misma cuenta y experiencia desechables:
    `getBoundingClientRect()` contra el elemento real confirmó el bisel
    completo dentro de su panel (antes `fitsInside: false` con el borde
    derecho recortado, ahora `true`, 13px de margen simétrico a cada
    lado); el gap entre columnas midió 16px real en pantalla, no solo en
    el className. Celular, computadora, 1280px, 375px -- otra vez los
    cuatro, no solo el caso donde se encontró el defecto. `npx tsc
    --noEmit` limpio.

### P-025 — Vista previa de escritorio antes de abrir el editor, construida y verificada en vivo
- Estado: **construido y verificado en vivo, 2026-10-01**
- Origen: Francisco, 2026-09-30 (valorado en P-022), confirmó seguir con
  este el 2026-10-01.
- Nueva ruta `experiencias/[id]/preview` (server component, sin
  `'use client'` -- no hace falta nada interactivo, Francisco pidió "cómo
  se vería en desktop", nada de selector celular/computadora que nadie
  pidió). Reusa `cargarParaEditar()`, la MISMA función que ya usa
  `editor/page.tsx`: ya trae TODOS los segmentos y TODOS los bloques del
  borrador en una sola carga, no solo el activo, así que no hizo falta
  ninguna consulta nueva a la base.
- Reusa `BloqueLector` (el mismo componente que ya pinta cada bloque en
  el lector real y en la vista previa del editor) y calca el marco de
  escritorio sin bisel que ya existía dentro del editor (620px,
  `Editor.tsx`, rama `dispositivo === 'computadora'`) -- no se inventó
  renderizado nuevo, se ensambló lo que ya estaba probado.
- Mismo techo de audiencia que la vista previa del editor
  (`NIVEL[b.audiencia] <= 2`, `Editor.tsx:991`): lo exclusivo de equipo
  se esconde siempre, lo exclusivo de moderador SÍ se muestra -- esta
  pantalla es para quien edita, no para el participante, mismo criterio
  que ya está probado ahí. Cada segmento vacío dice "todavía no tiene
  nada escrito" en vez de desaparecer en silencio.
- Botón "Vista previa" nuevo en la ficha de la experiencia
  (`experiencias/[id]/page.tsx`), entre "Editar ficha" y "Abrir editor".
- Verificado en vivo con cuenta y experiencia desechables (tres
  segmentos, uno por cada tiempo, con un bloque de texto, uno de nota
  exclusiva de moderador, uno de cita, uno exclusivo de equipo, y un
  segmento sin ningún bloque):
  - El bloque de equipo NO apareció. La nota de moderador SÍ apareció
    (con su propio tratamiento visual, "Para ti, no para el grupo").
    El segmento sin bloques mostró su propio mensaje vacío.
  - Los tres tiempos (Previo/Desarrollo/Post) aparecieron en orden,
    separados.
  - `notFound()` real para un slug que no existe. Estado vacío real
    (botón propio) para una experiencia sin ningún segmento.
  - Consola limpia en una pestaña nueva, sin historial de otras
    páginas -- se descartó un warning de hidratación que apareció al
    principio: era historial acumulado de haber visitado el editor
    antes en la misma pestaña (el mismo hallazgo ya documentado en
    P-023), no algo nuevo de esta pantalla.
  - `npx tsc --noEmit` limpio.

### P-024 — "Agregar bloque" subió al principio de la lista, compacto
- Estado: **construido y verificado en vivo, 2026-10-01**
- Origen: Francisco, 2026-10-01: "quiero que la sección de agregar
  bloques ahora esté arriba... para no tener que scrollear hasta abajo
  cada vez que quiero agregar algo. Hazla compacta para que no robe
  mucho espacio."
- El panel vivía DESPUÉS de la lista completa de bloques del segmento
  (`Editor.tsx`): agregar el bloque número nueve significaba pasar por
  los ocho anteriores cada vez. Se movió arriba, justo debajo del título
  y la descripción del segmento, antes de la lista.
- Compacto a propósito: mitad del padding del panel (`p-4`→`p-2.5`),
  etiqueta más chica (`text-[11px]`→`text-[10px]`, menos margen),
  separación entre la fila de tipos frecuentes y ocasionales reducida a
  la mitad. `BotonTipo` ganó una variante `compacto` (menos padding por
  botón) en vez de un componente nuevo -- es el mismo botón, no una
  pieza distinta que mantener en paralelo.
- El botón flotante "+" (fijo abajo a la derecha, que ya existía para
  este mismo problema -- hallazgo de Julian documentado en el propio
  código) NO se tocó: sigue apuntando al mismo `id="agregar-bloque"`,
  así que `scrollIntoView` lo encuentra donde esté. Antes bajaba hasta el
  final; ahora sube hasta el principio cuando se está desplazado bien
  abajo en una lista larga -- mismo mecanismo, misma utilidad, solo que
  ahora el caso común (recién se abre el segmento) ya no necesita ni
  siquiera ese botón.
- Verificado en vivo con cuenta y experiencia desechables (un segmento
  con 8 bloques): el panel apareció arriba, compacto, sin tener que
  scrollear; clicar un tipo agregó el bloque sin haber tenido que buscar
  el panel primero; el botón flotante "+" sigue llevando al panel
  (ahora arriba) sin cambios de código. `npx tsc --noEmit` limpio.

### P-023 — Arrastrar bloques dentro de un segmento, construido y verificado en vivo
- Estado: **construido y verificado en vivo, 2026-10-01**
- Origen: Francisco, 2026-09-30 (valorado en P-022), confirmó seguir con
  este el 2026-10-01: "parece el más barato".
- Confirmado el motivo de la valoración, leyendo y probando el código: era
  de verdad el más barato de los tres. `reordenar()` (la versión de
  bloques de `reordenarSecciones`, `almacenRemoto.ts:111`) ya aceptaba
  cualquier delta por el mismo `splice` que usan las secciones -- no hubo
  que tocar NADA del backend ni de `mover(id, delta)`. Todo lo nuevo:
  - `alSoltarBloque()` en `Editor.tsx`, calcado de `alSoltarSeccion()`:
    traduce `active`/`over` del evento de arrastre a un id real con
    `idPorClave` (la clave estable, no el id -- un bloque recién creado
    puede seguir en `local:...` a mitad de un arrastre) y llama a
    `mover(id, delta)`, el mismo camino que ya usan las flechas ▲▼.
  - La lista de bloques de la sección activa se envolvió en su propio
    `DndContext`/`SortableContext` (`sensoresArrastre` se reusa tal cual,
    ya estaba declarado para las secciones).
  - `TarjetaBloque` ahora llama a `useSortable({id: claveArrastre})`
    internamente (mismo patrón que `FilaSeccion`) y tiene un asa de
    arrastre (⠿) separada del botón de expandir/colapsar, para que
    arrastrar no compita con un clic normal -- mismo motivo que ya
    documenta el comentario de `FilaSeccion`.
  - Las flechas ▲▼ NO se quitaron: siguen siendo el camino accesible por
    teclado, igual que con las secciones.
- Verificado en vivo con cuenta y experiencia desechables (tres bloques de
  prueba, "BLOQUE UNO/DOS/TRES"): arrastrar el primero debajo del segundo
  cambió el orden a DOS/UNO/TRES, quedó "Guardado", el botón "↩ Deshacer"
  apareció, y la vista previa de la derecha se actualizó al mismo orden.
  Recargando la página desde cero el orden siguió siendo DOS/UNO/TRES --
  confirma que de verdad escribió en la base, no solo en pantalla. Las
  flechas ▲▼ y el expandir/colapsar se probaron después del cambio y
  siguen funcionando igual que antes (no hay regresión). `npx tsc --noEmit`
  limpio.
- **Hallazgo de paso, no introducido por este cambio:** la consola del
  navegador muestra un warning de hidratación de React en el arrastre de
  SECCIONES (`aria-describedby="DndDescribedBy-2"` servidor contra
  `"DndDescribedBy-0"` cliente, dentro de `FilaSeccion`). Se verificó que
  YA EXISTE en el código de `main` sin ningún cambio de esta sesión
  (`git stash` temporal de este cambio, mismo warning exacto con el
  código ya desplegado). Es una limitación conocida de `@dnd-kit/utilities`:
  `useUniqueId()` usa un contador en una variable de módulo (`let ids =
  {}`), no el `useId()` de React, así que no es seguro contra SSR+
  hidratación. Es solo un atributo de accesibilidad (no afecta el
  arrastre, ni visualmente, ni la función), y React lo corrige solo al
  hidratar; no se tocó porque no es parte de lo que se pidió y arreglarlo
  de verdad significa tocar la librería o evitar SSR en este componente,
  no un cambio de una línea. Queda anotado para no redescubrirlo como si
  fuera nuevo la próxima vez que alguien mire la consola.

### P-022 — Tres pedidos nuevos de Francisco, valorados: Ideas (vista previa y arrastrar bloques ya construidos, ver P-025 y P-023)
- Estado: **abierto** — Ideas sigue sin construir, falta que Francisco
  decida si entra
- Origen: Francisco, 2026-09-30, junto con el pedido de subida que se
  volvió P-021: pidió ayuda para "valorar la creación" de tres cosas.
- **"Sección de Ideas" para anotar y que queden registradas.** No existe
  nada parecido hoy -- se buscó en todo el código y lo único que aparece
  con "idea" es vocabulario de contenido de retiro, no una feature. Es
  terreno nuevo de punta a punta: tabla nueva (texto, autor, fecha),
  política RLS calcada de `exigirEquipo()` (mismo candado que ya usa
  medios), página nueva en el nav de PersonaLab, formulario simple de
  agregar/listar/borrar. Esfuerzo **medio**: no es complejo, pero no hay
  nada que reaprovechar -- todo se escribe de cero.
- **Vista previa en desktop antes de abrir el editor. Construida y
  verificada, ver P-025** -- lo que sigue es la valoración original, que
  se queda como registro de por qué salió barata, no como pendiente.
  Esto es DISTINTO
  de la vista previa que ya existe dentro del editor (el selector "En
  celular/En computadora" de la columna derecha, `Editor.tsx:1583`): esa
  vive adentro del editor y muestra solo el segmento activo. Lo que pide
  Francisco es verlo ANTES de entrar, con TODOS los segmentos. La buena
  noticia, confirmada leyendo el código: el bloque de escritorio ya
  existe armado (`Editor.tsx:1634`, sin bisel, 620px, ya calibrado) y
  `PreviaContenido`/`BloqueLector` (que ya sabe pintar los doce tipos de
  bloque y respeta qué es exclusivo de equipo) también. Lo nuevo es
  nada más una página que cargue TODOS los segmentos de la versión
  (con `cargarParaEditar`, que el editor ya usa y ya los trae todos) y
  los recorra en vez de mostrar solo el activo. Esfuerzo **bajo-medio**:
  es ensamblar piezas ya probadas, no inventar renderizado nuevo.
- **Arrastrar bloques dentro de un segmento, como ya se arrastra
  secciones. Construido y verificado, ver P-023** -- lo que sigue es la
  valoración original, que se queda como registro de por qué salió
  barato, no como pendiente. Confirmado leyendo el código: las secciones
  ya tenían
  `DndContext`/`SortableContext`/`useSortable` completo y funcionando
  (`Editor.tsx:1372-1413`), y el reordenamiento de BLOQUES (`mover(id,
  delta)`, hoy solo con flechas ▲▼) YA le manda a `reordenarRemoto` la
  lista completa de `{id, orden}` -- exactamente la forma que un
  `onDragEnd` de arrastre necesita, no un reemplazo de la función. Lo
  único nuevo es envolver la lista de bloques en su propio
  `DndContext`/`SortableContext` (calcado del de secciones) y cambiar el
  disparador de "clic en flecha" a "soltar al arrastrar" -- el backend
  no cambia. Esfuerzo **bajo**: es el mismo patrón que ya está en
  producción, aplicado un nivel más adentro.
- No se construyó nada de esto todavía -- es la valoración que Francisco
  pidió, para que decida con información real, no una opinión sin
  fundamento.

### P-021 — El bucket dice admitir video hasta 200 MB; Supabase de verdad lo corta cerca de 50 MB
- Estado: **mensaje de error corregido y verificado en vivo (2026-10-01) —
  la causa real NECESITA una acción de Francisco en el Dashboard, sin la
  cual el límite real sigue siendo ~50 MB pase lo que pase en el código**
- Origen: Francisco, 2026-09-30: "revisa el upload de videos y de
  imágenes, no pude subir algunos videos... tiene que haber un mensaje
  que explique por qué... si es un video muy pesado tiene que
  mencionarlo directamente."
- **Lo que se encontró, probando contra Storage real (no leyendo código):**
  `subirArchivo()` (`app/(admin)/personalab/almacenRemoto.ts`) tenía UN
  mensaje fijo para cualquier fallo de subida: "Se cortó la conexión. El
  archivo sigue en tu computadora, no se perdió nada." -- fuera cual
  fuera la causa real. Se subieron archivos de prueba reales (sparse,
  via `mkfile`) directo contra el bucket `personalab-medios` para ver qué
  responde Storage de verdad:
  - 210 MB y 100 MB: **rechazados**, `{name: 'StorageApiError',
    statusCode: '413', message: 'The object exceeded the maximum allowed
    size'}`.
  - 75 MB y 60 MB: **rechazados**, mismo error.
  - 50 MB y 25 MB: **aceptados**.
- **El hallazgo real no es el mensaje, es el límite.** El bucket tiene
  declarado `file_size_limit = 200 MB` (migración
  `20260914_1744_bucket_admite_audio.sql`) y `motivoRechazo()` (el
  aviso ANTES de intentar subir, en `lib/personalab/medios.ts`) le dice
  "sí cabe" a cualquier archivo hasta 200 MB. Pero Storage lo rechaza
  igual, acotado por binario entre 50 y 60 MB. Esto es casi con certeza
  la causa directa de "no pude subir algunos videos": cualquier video de
  retiro entre ~50 y 200 MB pasa el aviso de bienvenida y falla después,
  silenciosamente, con un mensaje que ni siquiera decía por qué.
  El techo real que aplica es el límite de proyecto de Supabase
  (Dashboard → Project Settings → Storage → "Upload file size limit"),
  que viene en 50 MB por defecto y es independiente del límite por
  bucket -- no es una fila de esta base, no es algo que la llave de
  servicio de este proyecto pueda leer ni cambiar. El límite de 200 MB
  del bucket es hoy aspiracional: nunca se aplica mientras el techo de
  proyecto se quede en su default.
- **Construido:** `mensajeDeErrorDeSubida()` nuevo en `almacenRemoto.ts`,
  que lee la forma real del error de `uploadToSignedUrl` en vez de
  asumir una causa fija: `statusCode === '413'` dice claro que pesa
  demasiado y sugiere comprimir o dividir (sin prometer una cifra de MB
  que hoy no se puede verificar); cualquier otro `StorageApiError` real
  muestra el motivo tal cual Storage lo dio; solo cuando no hay
  respuesta de la API (falla de red de verdad) se usa el mensaje de "se
  cortó la conexión", que ahí sí es honesto.
- Verificado: `npx tsc --noEmit` limpio; la función nueva probada contra
  las formas de error reales capturadas de Storage (413 real, y un
  `StorageApiError` genérico) más un fallo de red simulado, los tres
  casos resuelven al mensaje correcto. No se pudo completar la prueba
  de extremo a extremo en el navegador integrado: el selector de
  "Elegir archivo" abre un diálogo nativo del sistema operativo, y ese
  navegador no tiene manera de adjuntar un archivo a él (no hay
  `file_upload` ni un `<input type=file>` que quede en el DOM para
  manipular). Sí se verificó en vivo, en ese mismo navegador con una
  cuenta y una experiencia desechables (borradas después): login,
  creación de segmento, agregar bloque de Video -- todo con el léxico
  "segmento" ya correcto en la UI real.
- **Pendiente, y no es cosa de código:** para que el bucket realmente
  admita hasta 200 MB como dice, alguien con acceso al Dashboard de
  Supabase tiene que subir el "Upload file size limit" del proyecto a
  200 MB (o más). Sin eso, el mensaje ahora es honesto pero el límite
  real sigue siendo ~50 MB.

### P-020 — Indicador de almacenamiento en el Resumen de PersonaLab
- Estado: **construido y verificado en vivo, 2026-09-30**
- Origen: Francisco preguntó cómo saber cuánto espacio de subida se está
  usando en Supabase, ahora que el editor ya admite subir imagen/video/
  audio/PDF y "en el portal van a subir cosas".
- Construido: `lib/personalab/almacenamiento.ts`
  (`cargarUsoAlmacenamiento()`), que suma `media.peso_bytes` por bucket --
  la fuente que ya existe (cada subida real pasa por
  `/api/personalab/medios/subir`, que registra el peso real ahí), no una
  llamada aparte a la API de Storage enumerando objeto por objeto. Tarjeta
  nueva en `/personalab` (Resumen), debajo de "En retorno".
- **Límite honesto, documentado en el propio archivo:** el tope del plan
  (cuánto hay disponible EN TOTAL) no vive en ninguna tabla -- es una
  cifra de la cuenta de Supabase, no de este proyecto, y la llave de
  servicio no da acceso a esa API. `TOPE_ALMACENAMIENTO_BYTES` se deja en
  `null` a propósito: sin un tope real, la pantalla muestra el uso sin
  fingir una barra de porcentaje contra un número inventado. Falta que
  Francisco diga el tope de su plan para activar la barra.
- **Hallazgo de paso, auditando esto mismo:** la tabla `media` tiene una
  fila (`prueba2.pdf`, bucket `personalab-documentos`) que ya NO existe
  en el almacén real -- confirmado comparando la tabla contra
  `storage.from(bucket).list()` directo. Está referenciada por un bloque
  de una versión RETIRADA de "El Presente como Regalo" (no la publicada
  ni el borrador), así que hoy no la ve nadie real. También se encontró
  un archivo huérfano real en Storage (`PHOTO-2026-02-19-19-41-09.jpg`,
  subido dos veces el 2026-09-30 con 2 minutos de diferencia, la primera
  copia sin ningún bloque que la use) -- 90 KB, no importa hoy, pero es
  la primera señal de que puede acumularse basura de subidas abandonadas
  si nadie limpia. Ninguno de los dos se tocó: son hallazgos para
  decidir aparte, no lo que se pidió.
- Verificado en vivo con cuenta desechable: la tarjeta mostró "8.7 MB",
  desglosado "Fotos, video y audio (4 archivos) 8.7 MB" y "Documentos (1
  archivo) 26 KB" -- coincide exacto con la consulta directa a la base
  hecha antes de construir nada. `npx tsc --noEmit` limpio.

### P-019 — Dos personas editando lo mismo a la vez: los segmentos no tenían ningún candado
- Estado: **cerrado y verificado en vivo contra la base real, 2026-09-29**
- Origen: Francisco pidió auditar el guardado del editor con una pregunta
  concreta: "si yo tengo abierta mi cuenta y mi tía también, al mismo
  tiempo... que nunca por un error tonto se vaya a perder información."
- **Dos hallazgos reales, no teóricos, confirmados leyendo el código y la
  base antes de tocar nada:**
  1. `hinges` (los segmentos) nunca tuvo el candado de concurrencia
     optimista que `blocks` y `experience_versions` sí tienen desde
     `20260813_personalab_almacenamiento.sql` -- ese archivo lo dice por
     escrito: "Dos personas editando la misma version se pisan en
     silencio sin esto." Confirmado contra el esquema real
     (`information_schema`/una consulta directa): `hinges` no tiene
     columna `rev`. Hasta hoy, si dos personas del equipo editan el
     título del MISMO segmento a la vez, ninguna ve ningún aviso: el
     segundo guardado en llegar pisa al primero en silencio, y quien
     escribió primero nunca se entera de que se perdió.
  2. `reordenarRemoto` (mover bloques) tenía el MISMO defecto que ya se
     había encontrado y cerrado en `reordenarSeccionesRemoto` y en
     `guardarSeccionRemoto` en vueltas anteriores de esta misma auditoría
     -- pero nunca se cerró aquí. Sin `.select().maybeSingle()`, un
     UPDATE cuya fila queda fuera del `using` de RLS (versión que dejó de
     ser el borrador vivo) no es un error para Postgres ni para
     PostgREST: son cero filas afectadas, y la llamada reportaba éxito
     sin haber movido nada.
- **Construido:** migración nueva
  (`supabase/migrations/20260929_1715_hinges_concurrencia_optimista.sql`)
  que agrega `hinges.rev` y le engancha el mismo trigger genérico
  (`pl_subir_rev()`) que ya usan `blocks` y `experience_versions` --no
  hizo falta escribir nada nuevo del lado de la base, solo extender el
  mecanismo que ya existía. `guardarSeccionRemoto` ahora manda
  `eq('rev', s.rev)` y distingue, releyendo la fila si el primer intento
  no encuentra nada, entre "otra persona ya lo guardó" (la fila sigue
  viva, con un `rev` más alto) y "la versión ya no es la que se creía"
  (la fila no aparece ni en la segunda lectura). `reordenarRemoto` ganó
  el mismo `.select().maybeSingle()` que ya tenían sus hermanas.
- **El mensaje de conflicto también mentía, y se corrigió.** Hasta hoy,
  CUALQUIER conflicto (de cualquier causa) mostraba el mismo texto:
  "alguien publicó o deshizo una publicación" -- falso en el caso que
  Francisco preguntó, donde nadie publica nada, solo dos personas editan
  a la vez. `ConflictoDeVersion.revReal` ya cargaba la distinción desde
  que existe (`guardarBloque` la usa para construirse); lo que faltaba
  era leerla en `Editor.tsx` para elegir el mensaje correcto en vez de
  repetir siempre el mismo. Ahora hay dos mensajes reales,
  `mensajeDeConflicto(e)` decide cuál, y los ocho sitios del editor que
  antes mostraban el genérico ya usan la función nueva.
- **Verificado hasta ahora, lo que sí se pudo sin la migración:**
  `npx tsc --noEmit` limpio con los tipos nuevos (`BisagraEditable.rev`,
  las firmas de `guardarSeccionRemoto`/`crearSeccionRemoto`/`seccionNueva`
  sin `rev` en la creación). La ruta normal de reordenar bloques (que sí
  usa `reordenarRemoto`, el segundo hallazgo) se ejercitó de verdad
  dentro de la verificación en vivo de P-018 (deshacer un movimiento de
  bloque) y siguió funcionando igual con el `.select().maybeSingle()`
  agregado.
- **Francisco corrió la migración. Verificado en vivo, el escenario
  exacto que preguntó, con cuenta y experiencia desechables:**
  1. Se creó un segmento real (`rev: 1`, confirmado contra la base).
  2. Se simuló "la tía" guardando un cambio directo contra la base
     (`titulo: 'Título de la tía'`), sin pasar por el navegador --
     `rev` subió a 2 solo, vía el trigger, tal como se diseñó.
  3. En el navegador, que seguía mostrando el segmento con `rev: 1` en
     memoria, se escribió un título distinto y se dejó autoguardar. El
     banner mostró el mensaje NUEVO y correcto ("Alguien más del equipo
     guardó un cambio aquí mismo... están editando al mismo tiempo"), no
     el de "alguien publicó". Confirmado contra la base: el título de la
     tía seguía intacto (`rev: 2`) -- el intento de Francisco NUNCA lo
     pisó, se rechazó antes de tocar la fila.
  4. Recargando, la pantalla mostró el título real (el de la tía), sin
     nada perdido de ningún lado.
  5. Aparte, se simuló la OTRA causa (la fila deja de existir, como pasa
     cuando alguien publica) borrando el segmento directo contra la base
     mientras seguía abierto en el navegador, y editando encima: ahí SÍ
     apareció el mensaje viejo ("alguien publicó o deshizo una
     publicación"), correcto para esa causa. Los dos mensajes salen bien,
     cada uno en su caso real, no el mismo texto repetido siempre.
  6. Un guardado normal, sin ningún conflicto, se probó aparte: creó el
     segmento en `rev: 1` y, tras editar el título, subió a `rev: 2` en
     la base -- el candado no estorba el camino feliz.
  `npx tsc --noEmit` limpio en cada paso. Cuenta y experiencia de prueba
  borradas al terminar.

### P-018 — Deshacer (Ctrl/Cmd+Z) construido de punta a punta en el editor, no existía
- Estado: **construido y verificado contra la base real, 2026-09-29**
- Origen: Francisco pidió revisar "si ya la función de CTRL-Z está
  correctamente implementada" y que fuera "coherente y fácil de marcar
  para los errores que se cometieron". No estaba implementada -- cero
  ocurrencias de deshacer/undo/ctrl+z en todo `Editor.tsx`, confirmado por
  grep antes de escribir una sola línea. Lo único que existía era el
  deshacer NATIVO del navegador dentro de un campo enfocado, que no cubre
  borrar un bloque o un segmento (los dos ya avisaban "no vas a poder
  recuperar el contenido", y hasta hoy era cierto), no cubre reordenar, y
  se pierde al cambiar de segmento porque el textarea se desmonta.
- **La regla que hace que las dos formas de deshacer convivan sin
  pisarse:** dentro de un campo de texto, Ctrl/Cmd+Z deshace con el
  mecanismo NATIVO del navegador (letra por letra, ya funciona bien).
  Fuera de un campo -- el momento típico después de borrar algo -- usa una
  pila propia del editor. El atajo revisa `e.target` antes de decidir
  cuál de los dos le toca.
- **Cubre las seis acciones estructurales**, cada una con su propia
  entrada en la pila: crear/borrar/mover un bloque, crear/borrar/mover un
  segmento. También cubre editar texto (título/descripción de un segmento,
  contenido de un bloque), agrupado por RÁFAGA de escritura (misma
  ventana de 700ms que ya agrupa el autoguardado, `DEMORA_AUTOGUARDADO`)
  y no por tecla -- deshacer letra por letra sigue siendo trabajo del
  navegador.
- **Cada entrada revierte llamando a las funciones de bajo nivel de
  `almacenRemoto.ts`** (`crearBloque`, `borrarBloque`, `reordenarRemoto`,
  etc.), nunca a las funciones públicas instrumentadas (`agregar`,
  `borrar`, `mover`...). Si deshacer un borrado llamara a `agregar`, que
  a su vez registra su propio deshacer, cada Ctrl+Z generaría el deshacer
  del deshacer -- un ping-pong sin salida. Es la misma razón por la que no
  hizo falta ninguna bandera de "estoy deshaciendo": las funciones de
  restauración nunca tocan `registrarDeshacer`.
- **El caso más difícil, resuelto:** borrar un segmento se lleva sus
  bloques con él (`blocks.hinge_id` tiene `on delete cascade`, ya
  documentado en `almacenRemoto.ts`). Deshacer eso no es solo recrear el
  segmento -- es capturar TODOS sus bloques antes de borrar y recrearlos
  uno por uno bajo el id nuevo del segmento recreado (la base nunca
  reutiliza un id borrado).
- **La carrera que sí se cerró, no se dejó como riesgo aceptado:** si se
  deshace la creación de un bloque mientras su primer guardado (que crea
  la fila real) todavía está en vuelo, resolver el id demasiado pronto lo
  encontraría `local:` y no borraría nada del lado del servidor -- el
  INSERT que sigue en camino dejaría una fila huérfana que reaparecería
  al recargar la página. `deshacerCreacionDeBloque` espera esa creación
  en curso (`creacionesEnCurso`, el mismo mecanismo que ya usa
  `guardarOCrear` para esta exacta carrera) antes de decidir.
- **Visible, no solo atajo de teclado.** Botón "↩ Deshacer" en la
  cabecera, junto a "Guardar ahora", que solo aparece cuando hay algo que
  deshacer y cuyo título dice QUÉ va a deshacer -- misma lección que
  "Nueva sección" ya había dejado como FAB en una vuelta anterior: un
  atajo que nadie ve, la mitad de quienes lo necesitan no lo encuentran.
- **Verificado en vivo contra la base real**, con cuenta y experiencia
  desechables (nunca sobre El Presente como Regalo ni ningún contenido
  real), los seis escenarios, confirmando cada uno con una consulta
  directa a la base, no solo mirando la pantalla:
  1. Crear un segmento → deshacer → cero filas en `hinges`.
  2. Crear un segmento, escribir un título, deshacer dos veces: la
     primera solo revierte el texto ("Nueva sección" de vuelta, el
     segmento se queda), la segunda sí borra el segmento completo.
  3. Agregar un bloque con contenido real, borrarlo, deshacer → el
     bloque vuelve con el contenido exacto, confirmado en `blocks.contenido`.
  4. Dentro de un textarea enfocado, Ctrl+Z no toca la pila del editor
     (confirmado: el botón "↩ Deshacer" siguió mostrando la MISMA
     entrada antes y después, sin popearse).
  5. Mover un bloque, deshacer (por botón) → orden restaurado,
     confirmado en `blocks.orden`.
  6. Borrar un segmento con DOS bloques adentro, deshacer (por teclado)
     → el segmento y los dos bloques vuelven, contenido y orden
     correctos, confirmado con una consulta que junta `hinges` y `blocks`.
  `npx tsc --noEmit` limpio en cada paso.
- **Lo que NO se construyó, a propósito, no por descuido:** rehacer
  (Ctrl+Shift+Z / Ctrl+Y) -- Francisco no lo pidió, y la pila actual no
  guarda lo deshecho para rehacerlo. Si hace falta, es su propio pendiente
  aparte, con su propio diseño (qué pasa si entre deshacer y rehacer se
  hizo una acción nueva). La pila tiene techo de 25 acciones -- no hay
  persistencia entre sesiones ni sobre-vive un `location.reload()`, a
  propósito: deshacer siempre fue, en todo editor real, una memoria de la
  SESIÓN de edición, no un historial permanente (eso ya existe, aparte,
  como el ciclo de publicar/despublicar de `experience_versions`).

### P-017 — Léxico de pantalla: bisagra ahora es "segmento", tiempo ahora es Previo/Desarrollo/Post
- Estado: **decidido y aplicado en todo el portal de PersonaLab (admin), 2026-09-29**
- Origen: dos pedidos seguidos de Francisco sobre "El Presente como Regalo"
  (ver P-012) escalaron a un cambio de vocabulario de pantalla más amplio.
  Primero pidió que los tres tiempos (víspera/ignición/retorno) se llamen
  Previo/Desarrollo/Post. Luego notó la contradicción que eso abría:
  "¿Eso no son secciones ahora?" -- el editor YA llamaba "sección" a cada
  bisagra (Nueva sección, Título de la sección...) desde hace varias
  vueltas, y con el tiempo también llamándose "sección" las dos cosas
  iban a compartir nombre en la misma pantalla (la ficha de una
  experiencia diría "sección: Previo" y adentro "sección: Invitación al
  grupo"). Preguntado en el chat, decidió: el tiempo se queda con
  "sección"; la bisagra necesita otra palabra. Se investigó "momento"
  (candidato natural por la memoria `presente-regalo-digital.md`,
  decisión 5: "un momento, una pantalla") y se descartó por chocar con el
  guion real: `contenido.ts` usa "momento" una y otra vez como lenguaje
  natural del retiro ("busca un momento en que alguien te sostuvo"), así
  que una pantalla rotulada "Momento 3 de 5" habría competido con el
  propio texto que le pide a la persona pensar en "un momento" distinto.
  Se propusieron "paso" y "parada" como alternativas limpias; Francisco
  eligió **"segmento"**, sin choque con nada existente (verificado con
  grep antes de adoptarla).
- **Lo que cambió, y lo que no.** Igual que con tiempo: el vocabulario
  interno (la tabla `hinges`, el tipo `BisagraEditable`, las funciones
  `agregarSeccion`/`seccionesRef`/etc., los comentarios de código) se
  queda igual a propósito -- renombrar eso es otro proyecto, nadie lo
  pidió. Lo único que cambió es la etiqueta que lee la persona: "bisagra"
  y "sección" (como sinónimo de bisagra) pasan a ser "segmento" en las 11
  pantallas donde aparecían como texto visible (Resumen, Experiencias,
  la ficha de una experiencia, Editar ficha, Nueva experiencia, Publicar,
  Progreso, el detalle de un encuentro, y el editor real: botón "+ Nuevo
  segmento", el diálogo de borrar, el título del campo, los mensajes de
  guardar/crear/borrar). El "Retorno" del menú de PersonaLab (la etapa de
  seguimiento a seis meses de un grupo, no un tiempo de una experiencia)
  y "recorrido"/"pasos" del lector real del participante
  (`(experiencia)/experiencia/[slug]/page.tsx:65`, "Son N pasos.") son
  conceptos distintos que ya tenían su propia palabra funcionando: no se
  tocaron.
- Verificado en vivo con cuenta desechable: Resumen ("11 segmentos sin
  diseñar", "X de Y segmentos listos"), Experiencias (encabezado de tabla
  "SEGMENTOS"), la ficha de El Presente como Regalo ("Segmentos 4 de 8"),
  y el editor real ("+ Nuevo segmento", el diálogo completo de borrar con
  su texto y su botón, ambos en "segmento"). `npx tsc --noEmit` limpio.
- Lo que sigue con el nombre viejo, a propósito, documentado para que no
  se confunda con un olvido: los comentarios de código (siguen hablando
  de "sección"/"bisagra" porque describen variables y funciones que
  siguen llamándose así) y `app/prototipo/` (ruta muerta, ya no enlazada
  desde ningún lado del portal real, confirmado por grep antes de dejarla
  intacta).

### P-016 — `kit/page.tsx` y `vista/[encuentroId]/` siguen en datos de muestra
- Estado: **abierto para los datos; el color de marca de los dos ya se corrigió (2026-09-28)**
- Origen: encontrado de pasada arreglando H-010 (Resumen/Grupos/
  Moderadores/Encuentros/Retorno). Después de esa reescritura, dos
  archivos más de `app/(admin)/personalab/` siguen importando de
  `dominio.ts`: `kit/page.tsx` y `vista/[encuentroId]/` (esta segunda ya
  estaba marcada como fósil/prototipo por Julian antes de esta sesión,
  no es un hallazgo nuevo del todo). No se investigó qué tan real o
  falso es cada uno -- solo se confirmó que existen, por el mismo grep
  que encontró el resto.
- Dueño: sin asignar.
- Criterio de cierre: mismo patrón que H-010 -- confirmar contra el
  esquema real qué tabla debería alimentar cada pantalla, construir el
  loader real, verificar con ejecución real, no con lectura de código.
- Actualización 2026-09-28: Francisco pidió un análisis de continuidad de
  tono/voz/persona en todo PersonaLab. El lenguaje resultó consistente en
  todos lados -- el hallazgo real fue visual, no verbal. Precisamente estos
  dos archivos (los más viejos, nunca migrados) tenían la disciplina de
  color rota: `kit/page.tsx` pintaba con `slate`/`amber`/`emerald` de
  fábrica de Tailwind en vez de los tokens de `tokens.ts`, y
  `vista/[encuentroId]/**` (las tres pantallas: portada, layout y bisagra)
  tenía TODO su color escrito a mano en hex, sin pasar nunca por
  `lib/estilos/oficina.ts`. Entre esos hex estaba `#8F5341` en tres sitios
  distintos (la etiqueta de tiempo y sus estados de hover) -- exactamente
  "la tercera terracota" que el propio `lib/estilos/oficina.ts` ya había
  señalado como problema el 2026-09-06 en otra parte del sistema, repetida
  aquí sin que nadie la hubiera tocado. El resto de los hex (`#EFF3F4`,
  `#D5DEE0`, `#4B6B72`, `#14181B`, `#676E6E`, `#E7E1D8`, `#FAF8F4`) no
  correspondían a ningún token declarado: variantes inventadas, muy
  cercanas pero no iguales a `paper`, `paper-2`, `gray-ui` e `ink`.
  Corregidos los cuatro archivos a los tokens reales (`teal`, `terra-lo`,
  `terra-ui`, `gray-ui`, `ink`, `paper`, `paper-2`, `line`, `line-dk`,
  `bien`). Verificado en vivo con cuenta desechable, en `/personalab/kit`
  y en `/personalab/vista/c1` y `/personalab/vista/c2/…` (mock, con y sin
  contenido, con y sin lente de moderador): capturas de pantalla
  confirmando que el color ahora coincide con el resto del sistema, sin
  regresión visual. El problema de fondo (estos dos árboles siguen leyendo
  `dominio.ts` y no la base real) sigue exactamente igual que antes: esto
  no lo resuelve, solo evita que quien migre los datos después herede
  también colores rotos.

### P-012 — El Presente como Regalo, construido con la cronología real: falta el pasaje del Dr. Alexander, lo de perdón, y publicar
- Estado: **decidido, mecanismo verificado de punta a punta, falta contenido de Francisco y la decisión de publicar. Además: las secciones se renombraron (Previo/Desarrollo/Post) y la versión PUBLICADA quedó con una fila menos, falsa, y sigue siendo un snapshot viejo que no es el borrador real**
- Actualización 2026-09-29: dos pedidos de Francisco sobre esta misma
  experiencia, los dos resueltos.
  1. **"Las secciones ya no se llamen víspera, ignición, retorno... ponles
     Previo, Desarrollo, Post."** Ese vocabulario viene del Consejo #002
     (`supabase/migrations/20260813_personalab_contenido.sql:6-18`): léxico
     deliberado para que el esquema NO se pareciera al de un curso ("tiempo:
     no módulo → enum vispera/ignicion/retorno"). Cambiar el enum real de la
     base (`pl_tiempo`) es una migración de esquema aparte que nadie pidió;
     lo que se corrigió es la ETIQUETA que ve la persona, en el único lugar
     donde vive de verdad (`ETIQUETA_TIEMPO`, `dominio.ts`) más las dos
     copias sueltas que no importaban de ahí (`experiencias/[id]/page.tsx`,
     `encuentros/[id]/page.tsx`). El vocabulario interno (`vispera`,
     `ignicion`, `retorno`, como valores de enum y como nombres de campo)
     sigue igual, mismo patrón que `pl_maduracion` ('diseno' por dentro,
     "En diseño" en pantalla). Verificado en vivo: la ficha de la
     experiencia, la vista previa del lector y el riel del editor real, los
     tres dicen ahora Previo/Desarrollo/Post.
  2. **"No pongas lo de la capa mensual... es un 'fixed' de lo que
     habíamos hablado al principio, no una realidad de la estructura de
     hoy. Corrige esa página ya."** Cierto, y peor de lo que parecía visto
     de afuera. La ficha de la experiencia (`experiencias/[id].page.tsx`,
     vía `catalogo.ts`) muestra la versión PUBLICADA (2026-09-14), no el
     borrador real (2026-09-15, el que de verdad se edita hoy: 18 bisagras
     reales, todas bajo Desarrollo, cero Retorno). Esa versión publicada
     nunca se actualizó desde que se creó: tenía una bisagra "Capa mensual"
     (retorno) con `listo: true` y **cero bloques de contenido** -- una fila
     que afirmaba estar lista sin haber una sola palabra escrita adentro.
     Confirmado contra la base real antes de tocar nada (bloques, bookmarks
     y respuestas guardadas: los tres en cero para esa fila) y borrada,
     junto con su gemela en los datos de ejemplo de `dominio.ts`
     (`vista/[encuentroId]/`, mismo texto, "En curso con el grupo Anáhuac.
     Mes 5 de 6." -- una fecha que nunca ocurrió).
  - **Lo que NO se tocó, y Francisco tiene que saber:** la versión
    publicada sigue siendo, en todo lo demás, el snapshot viejo de
    pre-reconstrucción -- tres bisagras con contenido real pero superadas
    (Invitación al foro, El inventario del hoy, La carta al futuro) más
    cuatro cáscaras vacías (Finitud/Gratitud/Silencio/Perdón, `listo:
    false`, 0 bloques cada una) y "Entrega de la carta" (retorno, 5
    bloques reales, no se tocó: SÍ tiene contenido, a diferencia de Capa
    mensual). Nada de esto vive en el borrador real. La ficha de la
    experiencia va a seguir sin reflejar "cómo está la estructura hoy" en
    su totalidad -- no solo en Capa mensual -- hasta que ese borrador se
    publique, que es justo la decisión que este mismo pendiente ya tenía
    parada esperando el contenido que falta (Dr. Alexander, perdón). No se
    tocó ni se publicó nada de eso sin que Francisco lo pida: es su
    decisión, ya escrita arriba en este mismo pendiente antes de hoy.
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
- Estado: **duodécima vuelta: los tres campos de texto que le faltaba el `spellCheck`/`lang="es"` de la novena vuelta ya lo tienen; pendiente de Francisco decidir si además quiere un corrector propio dentro de la app**
- Actualización 2026-09-28, duodécima vuelta: Francisco volvió a preguntar
  "cómo hacemos para que se marquen los errores ortográficos", cuatro días
  después de que la novena vuelta ya hubiera probado que el subrayado rojo
  nativo del navegador SÍ funciona (captura real, palabra mal escrita a
  propósito) y hubiera dejado como sospecha más probable que fuera la
  configuración de idioma de su propio Chrome. Antes de repetirle esa misma
  respuesta, se revisó el código en vez de asumir que seguía intacto: SÍ
  había un hueco real, no cubierto en la novena vuelta -- tres campos de
  texto libre del editor no llevaban `spellCheck`/`lang="es"` (el "Pie" de
  video/audio/imagen/archivo, "Quién lo dijo" de una cita, "Nota al pie" de
  un objeto), a diferencia de los textareas principales y de título/
  descripción de sección, que sí lo tenían desde antes. Corregido en los
  tres; verificado en vivo, con cuenta desechable y contenido desechable
  (una sección y un bloque "Cita" creados y borrados por la UI real dentro
  de "El Presente como Regalo Demo", nunca sobre contenido real) que el
  atributo llega al DOM (`spellcheck: true, lang: "es"`) en el campo antes
  descubierto. No se repitió la prueba visual del subrayado rojo en sí --
  ya está probada en la novena vuelta y es el mismo mecanismo del
  navegador, no uno nuevo. Sigue en pie, sin construir, la pieza más
  grande que la novena vuelta ya había dejado explícitamente para que
  Francisco decidiera: un corrector ortográfico propio, dentro de la app,
  que no dependa de la configuración de cada navegador -- diccionario real
  y superposición visual sobre el campo, alcance bastante mayor que este
  arreglo.
- Actualización 2026-09-24, undécima vuelta: Francisco, viendo capturas del
  espacio en blanco que había quedado abajo de la vista previa en la décima
  vuelta, pidió un "modo editor" explícito: que al entrar al editor "el menú
  de arriba se colapse o se vaya" y que "el teléfono siempre se pueda ver
  completo", con instrucción directa de que Leo, Julian y Sora decidieran el
  diseño. Se convocó al consejo antes de tocar código (sesión completa en
  `./memory/Leo.md` interacción 47, `./memory/Julian.md` interacción 27,
  `./memory/Sora.md` interacción 35, todas en
  `/Users/franciscoesquivel/Documents/Projects/4Meaning/AGENTS/`). Veredicto,
  sin disenso: las dos barras (BARRA_CASA 56px y BARRA_WORKSPACE de
  PersonaLab, 48px) se apagan POR COMPLETO mientras la ruta está bajo
  `/editor` -- nunca una versión encogida -- dejando solo la cabecera propia
  del editor (69px) como cromo, con su enlace "← [nombre]" ya existente como
  única salida; al navegar fuera de `/editor`, las dos reaparecen de
  inmediato.
  - Construido: `lib/personalab/modoEditor.ts` (`enModoEditor(pathname)`,
    la única fuente de verdad de la ruta), `components/AdminChrome.tsx`
    (apaga `AdminTopNav` y el `pt-14` de `<main>` que reservaba su alto) y
    `app/(admin)/personalab/PersonaLabChrome.tsx` (apaga `PersonaLabNav` y
    el contenedor `max-w-[1200px] px-6 py-8` que lo acompañaba). Los dos
    layouts (`(admin)/layout.tsx`, `(admin)/personalab/layout.tsx`) pasaron
    a delegarles esa decisión en vez de renderizar el cromo directo.
  - `Editor.tsx` ya no recibe ningún envoltorio ajeno en modo editor, así
    que el truco de escape `-50vw` de la novena/décima vuelta (y la
    cancelación de un `py-8` ajeno que traía) se volvió innecesario y se
    quitó -- no queda cromo del que escapar. El offset de las tres columnas
    bajó de 173px a 93px (69px de la cabecera propia + su `mb-6`, medido
    con `getBoundingClientRect()`, no adivinado).
  - **SEGUNDA CAUSA, ENCONTRADA VERIFICANDO EN VIVO Y NO SOLO CALCULANDO EL
    OFFSET:** aun con el offset correcto, el bisel del teléfono tenía
    `style={{ height: 620 }}` fijo, que no respondía al espacio real. En
    una ventana de 768px de alto (una laptop común) el teléfono se seguía
    recortando 19px por abajo. Corregido convirtiendo la columna de vista
    previa en una columna flex (`lg:flex lg:flex-col`): el selector
    celular/computadora y el pie "Estás viendo el borrador" a su tamaño
    natural (`lg:flex-none`), y el teléfono (o el marco de escritorio) a
    `lg:flex-1 lg:min-h-0` con `lg:max-h-[620px]` como techo, no como
    fijo -- se encoge cuando hace falta, nunca desborda, y sigue topando en
    620px cuando sobra espacio (verificado a 1200×1000: el bisel se quedó
    exactamente en 620px).
  - Verificado en vivo, cuenta desechable (`staff`, creada y borrada por
    script contra la base real, nunca sobre una cuenta de Francisco): a
    768px de alto, la columna de vista previa mide exactamente `bottom:
    768` (cero desborde, `pageScrollable: false`); a 1000px de alto, el
    bisel topa en 620px; a 375px de ancho (celular real), `scrollWidth ===
    clientWidth === 375` (cero desborde horizontal) y las dos barras
    también desaparecen ahí. Al navegar fuera de `/editor`
    (`/personalab/experiencias/presente-regalo`), las dos barras
    reaparecen de inmediato, capturado en pantalla. `npx tsc --noEmit`
    limpio. El único mensaje de consola en una pestaña nueva es un aviso
    de hidratación de `@dnd-kit` (`aria-describedby`) preexistente del
    riel arrastrable, no introducido por este cambio.
  - `app/globals.css`: el comentario de `overflow-x: hidden` en `body`
    describía el truco `-50vw` que este cambio elimina -- corregido para
    no confundir a quien lo lea después; la regla se queda como red de
    seguridad general del sitio, no se retiró (retirarla sin probar cada
    pantalla del portal es un riesgo aparte, fuera de este pedido).
  - Leo dejó, sin bloquear, una verificación pendiente (no nueva, ya
    resuelta en la séptima vuelta de esta misma fila): que el autoguardado
    cubra reordenar/crear/borrar secciones y bloques, no solo texto. Releída
    la fila de la séptima vuelta: sí lo cubre (`moverSeccion`,
    `confirmarBorrarSeccion`, `agregarSeccion`, `mover`, `borrar` tienen su
    propio `catch` con reversión y distinción de conflicto real). No hace
    falta trabajo nuevo, solo queda esta nota cruzando las dos filas para
    que no se vuelva a preguntar como si fuera un hueco abierto.
- Actualización 2026-09-24, décima vuelta: Francisco reportó, después del
  ensanche de la novena vuelta, "veo un espacio blanco al final de la
  pantalla" y "el teléfono... haciendo scroll con toda la página, se
  vuelve molesto" -- el mismo síntoma que ya se había cerrado una vez
  (cuarta vuelta) volvió a aparecer. Medido con `getBoundingClientRect()`
  real en el navegador antes de tocar nada, no adivinado: dos causas
  reales, las dos en `Editor.tsx`.
  1. La cabecera pegajosa del editor mide 69px de alto real; las tres
     columnas (riel, lienzo, previa) estaban ancladas a `top-[164px]`,
     asumiendo 60px -- 9px de más. Corregido a `top-[173px]` (104+69) en
     las tres, con la cifra medida documentada en el propio código para
     que no se vuelva a desviar en silencio.
  2. El `py-8` (relleno inferior) del contenedor compartido de
     PersonaLabLayout agregaba 32px de "pista" de scroll de más después
     de donde las columnas ya terminan de llenar la pantalla -- y ese
     tramo de más es exactamente donde una columna `sticky` se queda sin
     contenedor donde seguir pegada y se suelta a moverse con la página
     otra vez, justo el síntoma reportado. Cancelado con `lg:-mb-8` en el
     envoltorio del editor, mismo espíritu que el `-mx-6` que ya cancela
     el relleno horizontal de la cabecera.
  Verificado con medición real antes y después (no solo mirado): el
  scroll sobrante de la página bajó de 115px a 71px, y en el scroll
  máximo la columna de vista previa queda exactamente al borde de la
  pantalla, sin hueco visible, confirmado por captura real.
  **Además, a pedido explícito de Francisco:** se retiró el selector
  "Como participante/Como moderador" de la vista previa -- reabre a
  propósito lo que Leo y Julian habían fijado un día antes como dos ejes
  independientes (ver más abajo). La vista previa ahora muestra siempre
  la lente más completa (equivalente al "moderador" de antes, sin
  contar lo exclusivo de equipo): nada se esconde nunca al editar, así
  que la pérdida de poder alternar queda cerrada sin dejar un hueco.
  **Y los cuatro hallazgos de la revisión de Leo y Julian** (despachada
  en la novena vuelta, respondió en esta): dos ya aplicados --
  `Editor.tsx`, el lienzo de escritura no tenía techo de ancho propio
  (podía llegar a ~130 caracteres por línea, casi el doble del techo de
  75 que Julian mismo fijó un día antes para el lector real); corregido
  con `lg:max-w-[720px]` en la columna del lienzo. El asa de colapsar el
  riel medía 32px de alto (`h-8`), no los 44px (`min-h-toque`) que ya
  usa el resto de controles nuevos de esta sesión; corregido. Los otros
  dos hallazgos de Leo (discoverabilidad del asa sin señal en reposo, y
  la combinación riel-colapsado + modo-computadora que antes empujaba el
  lienzo por encima del techo del lector) quedan sin resolver aparte --
  el segundo ya no aplica tal como se describió, porque el lienzo ahora
  tiene su propio techo de 720px que no depende de cuánto espacio libere
  el riel al colapsarse.
- Actualización 2026-09-24, novena vuelta: Francisco reclamó, con razón,
  que tres cosas de esta fila seguían sin construirse y una cuarta
  (centrar/justificar) parecía ignorada sin explicación. Revisado uno
  por uno:
  - **Bloque "Divisor"**: construido de punta a punta. Nuevo tipo en
    `lib/personalab/bloques.ts` (`campos: {}`, igual que `pausa` pero sin
    piso de tiempo -- puramente visual), render en `Bloques.tsx` (un
    filete `border-line`), y migración nueva
    `supabase/migrations/20260924_1800_bloque_divisor.sql` que agrega
    `'divisor'` al enum `pl_tipo_bloque` y su rama en
    `blocks_contenido_por_tipo` (pasa siempre, como `pausa`). **Falta que
    Francisco corra esa migración en el editor SQL de Supabase** -- sin
    eso, la base rechaza el bloque con el `else` genérico del constraint.
    Verificado en el editor real que el tipo aparece en la paleta con su
    copy correcto; el guardado contra la base real queda pendiente de esa
    migración.
  - **Selector "En celular"/"En computadora"**: construido, coexistiendo
    con "Como participante"/"Como moderador" sin reemplazarlo, tal como
    lo dejó condicionado el veredicto de Leo y Julian del 2026-09-23 (ver
    más abajo, "Plan de acción de Leo y Julian"). Dependía de que el
    lector real de escritorio existiera primero, y ya existe (misma
    vuelta, lienzo ancho con atmósfera). En "computadora" la tercera
    columna del editor se ensancha (`320px` a `680px`) y el marco de
    teléfono se quita del todo -- ancho real de columna 620px, la misma
    cifra que Julian ya calibró para el lector, no un número aparte.
    Verificado en vivo con cuenta desechable: los dos selectores
    funcionan juntos (la descripción solo-moderador se sigue viendo en
    modo escritorio), sin bisel de teléfono, contenido real.
  - **Corrector ortográfico**: investigado en vivo antes de asumir que
    estaba roto. El `spellCheck`/`lang="es"` que ya existía SÍ funciona
    en un navegador real -- probado tecleando una palabra mal escrita a
    propósito ("propocito") en el editor real, con captura de pantalla
    que muestra el subrayado rojo ondulado nativo. Si Francisco no lo ve
    en su propio navegador, es casi seguro una configuración de Chrome
    de su lado (`chrome://settings/languages`, revisar que español esté
    agregado a "Revisión ortográfica"), no un defecto del código. Un
    corrector propio, dentro de la app, que no dependa de ningún ajuste
    de navegador, es una pieza aparte y bastante más grande (diccionario
    real, superposición visual sobre el textarea) -- no se construyó sin
    que Francisco decida primero si de verdad la necesita después de
    revisar su propio Chrome.
  - **Centrar/justificar texto**: NO era un olvido -- Julian lo vetó
    explícitamente contra BRAND.md al construir el toolbar de texto
    (interacción ya registrada en su memoria), y se le reportó a
    Francisco en su momento. Quedó preguntado de nuevo, directo, si
    quiere reabrir esa decisión -- no se construye solo.
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
  **Respuesta de Sora, 2026-09-23, PROCEDE:** verificado contra las seis
  pantallas reales (`[slug]/page.tsx:43`, `[slug]/[bisagra]/page.tsx:47`,
  `cierre/page.tsx:20`, `mis-experiencias/page.tsx:20`, `cuenta/page.tsx:19`,
  todas `max-w-[620px]`/`max-w-[520px]` fijo), BRAND.md:181-182 y el
  degradado/grano de `assets/brand.css:74-81`. El patrón ya vive en este
  repo aplicado a una sola cabecera (`components/participante/MiRetiro.tsx:121-131`,
  "la aurora de brand.css") y nunca a un lienzo completo: esto es una
  aplicación nueva de una pieza probada, no territorio sin probar. La
  propuesta de Julian (columna igual, atmósfera ciega al estado, sin
  navegación ni contexto de avance) pasa mi umbral de "se revela por
  apertura, no por logro" (memoria Sora, Consejo 2026-09-11) porque el
  grano y el degradado no leen ningún dato de la persona: no dependen de
  qué bisagra está abierta ni de cuántas faltan. Línea exacta: grano o
  degradado solos, sin ningún elemento con significado, pasan; un filete
  decorativo simple pasa solo si es idéntico en las doce bisagras y en las
  seis pantallas (el día que cambie de grosor, color o posición según lo
  leído, es una barra de progreso disfrazada); cualquier cosa que sugiera
  cuánto falta o en qué sección se está -- índice lateral, miniatura de lo
  que queda, degradado que se intensifica con el avance -- cruza la línea,
  diga o no un número. MI AGREGADO, con mi autoridad: no dejar la
  atmósfera pareja en las doce bisagras. Mi propia auditoría del
  2026-09-21 (memoria Sora, interacción 30, P-009) ya nombró que hoy el
  único bloque con más peso visual es `pausa` (`Bloques.tsx:8`) mientras
  que sellar la carta en El Presente como Regalo (p3, consigna b13, el
  único gesto irreversible del producto) pesa igual que cualquier otro
  bloque. El lienzo ancho puede llevar UNA variación, atada al tipo de
  bloque que se está leyendo (nunca a la posición en la secuencia ni a
  cuánto se ha recorrido), para que ese peso ya decidido por Elena se
  note con espacio y quietud. Costo: Julian calibra dos estados de
  atmósfera en vez de uno; el disparador se lee del mismo dato que ya
  existe en `Bloques.tsx`, cero campo nuevo. Si no se construye la
  variación, no rompe nada: la atmósfera pareja sola ya pasa el umbral,
  solo que deja el lienzo ancho tan honesto y sin ritual como el resto
  del lector hoy. No escala nada a Francisco: cae entera en jurisdicción
  de secuencia y estado: la forma exacta del filete y de los dos estados
  es de Julian.
  **Calibración de Julian, 2026-09-23, ejecutable con cifra, no dirección
  general:** corrigió un dato mal atribuido antes de fijar nada -- el
  bloque que carga el volumen real de lectura no es `consigna` (19-21px,
  el menos frecuente de los doce) sino `texto` (`RenderMarkdown.tsx:14`,
  17-18px, idéntico al que ya medía en `Cierre.tsx`). El cpl que manda es
  el de ese tamaño: 67 a 620px, 74 a 680px (a un carácter del techo de
  75). Las cinco decisiones: (1) ancho de columna **620px**, sin cambio,
  por el cpl de arriba; (2) el lienzo ancho entra en juego en **`lg:`
  (1024px)**, punto de corte nuevo en todo el portal, no `md:` (a 768px el
  margen junto a la columna es 74px por lado, insuficiente; a 1024px es
  202px); (3) el cuarteto de `MiRetiro.tsx:121-131` ("la aurora de
  brand.css") se adapta a lienzo completo invirtiendo el orden de
  dominancia (PersonaLab manda teal, BRAND.md §4), recalibrado para fondo
  claro: teal-2 16%, wine-2 9%, terra 8%, gold 4%, `position: fixed`,
  blur 120px (no 60: esto ambienta minutos, no una cabecera de tres
  segundos), tamaños 560/480/400/300px, sin animación; (4) el estado
  `pesoMayor` lo dispara `consigna` (mismo chequeo que ya usa
  `[bisagra]/page.tsx:84` para decidir `<Escritura>` vs `<BloqueLector>`,
  cero campo nuevo) y el cambio es MENOS color, no más: se retiran
  wine-2/terra/gold, solo queda teal-2, de 16% a 10% -- subir color en un
  gesto a veces irreversible repetiría la jerarquía doble que ya se
  prohibió tres veces; vive en un componente nuevo, montado explícito
  solo en `[slug]`/`[bisagra]`/`cierre`, nunca en el layout compartido ni
  en las pantallas de gestión/error; (5) el filete decorativo **se
  retira**, no agrega nada que el lienzo no cargue ya. Confianza: alta en
  las cinco cifras, declarado "propuesto, no verificado en pantalla" por
  falta de sesión en el worktree -- verificación real, abajo.
  **Construido y verificado en vivo, 2026-09-23 (Claude):** nuevo
  `app/(experiencia)/experiencia/AtmosferaLectura.tsx`, montado en las
  tres pantallas de lectura larga (`[slug]/page.tsx`, `[bisagra]/page.tsx`
  con `pesoMayor` calculado igual que línea 84, `cierre/page.tsx` con
  `pesoMayor = consignas.length > 0`), con las cinco cifras de Julian
  exactas, sin desviación. Verificado con cuenta y grant desechables
  contra dos experiencias reales publicadas ("El Agradecimiento Demo","El
  Presente como Regalo" -- esta última resultó tener 0 bisagras en su
  versión PUBLICADA, todo el contenido de la P-012 sigue en un borrador
  nunca publicado, hallazgo aparte, no se tocó): a 1440px la atmósfera se
  ve en los dos márgenes fuera de la columna, nunca sobre el texto; en la
  misma bisagra con `consigna` el estado `pesoMayor` se ve visiblemente
  más quieto (un solo tinte tenue) contra el estado base (los cuatro,
  incluido un tinte cálido del lado derecho) -- comparado con capturas
  reales, no de memoria. Por debajo de `lg:` (probado a 900px) la
  atmósfera desaparece por completo, columna igual que antes. Probado
  también a 375px (móvil): sin cambio, cero regresión. `tsc --noEmit`
  limpio.
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

### H-010 — Resumen, Grupos, Moderadores, Encuentros y Retorno conectados a la base real
- Estado: **hecho** — verificado 2026-09-24, con datos reales desechables
- Origen: Francisco pidió limpiar los datos de prueba de PersonaLab
  ("foros y personas que no son reales"). Se borraron los 5 foros de
  siembra y 13 perfiles de prueba (ver más abajo) y, al revisar, las
  pantallas de gestión seguían mostrando "Grupo Anáhuac", "Rodrigo
  Lemus", etc. — no podían haber cambiado, porque nunca leyeron la base
  para empezar: `app/(admin)/personalab/page.tsx` (Resumen),
  `grupos/page.tsx`, `moderadores/page.tsx`, `encuentros/page.tsx` (lista
  y ficha `[id]`) y `retorno/page.tsx` leían enteros de `dominio.ts`
  (`GRUPOS`, `MODERADORES`, `ENCUENTROS`, arreglos escritos a mano). Los
  enlaces lo delataban: llevaban a `/personalab/encuentros/c1`, no a un
  UUID real. Solo Experiencias, Compras y Progreso eran reales.
- Construido: `lib/personalab/gestion.ts`, mismo patrón que
  `compras.ts`/`catalogo.ts` (`exigirEquipo()` + `createServiceClient()`
  + `Resultado<T>`), con seis funciones (`cargarResumen`, `cargarGrupos`,
  `cargarModeradores`, `cargarEncuentros`, `cargarEncuentro`,
  `cargarRetorno`) contra `chapters`, `chapter_moderators`,
  `moderator_training`, `runs`, `run_checklist`, `returns`,
  `experiences`/`hinges` reales. Las seis pantallas reescritas para
  llamarlas, conservando el mismo JSX/diseño -- solo cambió de dónde sale
  el dato.
- Tres desajustes reales que la reescritura corrigió, no heredó: el enum
  real de `runs.estado` es `confirmada`/`corrida`/`cancelada`, no
  `confirmado`/`realizado`/`cancelado` del mock; `chapter_moderators` es
  tabla muchos-a-muchos (el mock asumía un moderador por grupo); "mes de
  retorno" no es un campo del encuentro, se calcula del mes más alto con
  un toque real (`returns.occurred_at` no nulo) para ese encuentro --
  como `returns` está vacía hoy, el módulo sale honesto en vez de
  inventar un número. De paso, `tokens.ts: COLOR_MADURACION` tenía la
  clave `'diseño'` con tilde contra el enum real `'diseno'` sin tilde
  (bug ya encontrado una vez por `experiencias/page.tsx`, que se hizo su
  propio mapa local en vez de tocar el archivo compartido) -- corregido
  en el origen esta vez.
- El detalle de un encuentro (`encuentros/[id]/page.tsx`) tenía
  `GRUPO_EJEMPLO`: catorce nombres inventados que se mostraban como "la
  lista del grupo" sin serlo. Reemplazado por los grants reales
  `titularidad='miembro_foro'` de ese encuentro -- si nadie tiene acceso
  individual todavía, la pantalla lo dice, no inventa catorce personas.
- Verificado en vivo, no solo tipado: cuenta y datos desechables (un
  grupo, un moderador, un encuentro contra "El Presente como Regalo" con
  checklist real) en las seis pantallas, confirmando bisagras/bloques
  reales en el guion de sala y en la víspera. Se probó también el camino
  de retorno completo (encuentro marcado `corrida` + dos toques
  `returns` reales) y el Resumen se actualizó solo, sin recargar código:
  "Personas en retorno" y la tarjeta "En retorno" reflejaron el dato real
  de inmediato. Todo el contenido de prueba se borró después
  (`chapters`/`chapter_moderators`/`runs`/`run_checklist`/`returns`
  confirmados en 0 filas por consulta directa). `tsc --noEmit` limpio.
- Nota aparte, no resuelta aquí: `kit/page.tsx` y
  `vista/[encuentroId]/` siguen leyendo `dominio.ts` -- ver P-016.

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
