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

### P-007 — Correr la migración que renombra las columnas reales de "foro"
- Estado: **decidido, listo para correr**
- Origen: parte de H-007 (2026-09-21). El código ya lee/escribe usando los
  nombres viejos de columna (`abre_espacio_al_foro`, `personas_en_el_foro`)
  detrás de campos de TypeScript ya renombrados (`abreEspacioAlGrupo`,
  `personasEnElGrupo`) — funciona hoy sin la migración, así que esto no
  bloquea nada, pero deja la base con nombres que ya no coinciden con el
  código que la envuelve.
- Qué se sabe: la migración está escrita y verificada por Daniel antes de
  escribirse (cero RLS, cero vistas, cero funciones, cero CHECK, cero
  índices dependen de estos dos nombres) —
  `supabase/migrations/20260921_1900_foro_se_llama_grupo.sql`. No tengo
  acceso directo a Postgres desde este worktree (`supabase link` no
  encuentra el proyecto), así que no pude correrla yo mismo.
- Dueño: Francisco (correrla en el editor SQL de Supabase) o dar acceso
  para que Claude la corra directo.
- Criterio de cierre: las dos columnas se llaman `abre_espacio_al_grupo` y
  `personas_en_el_grupo`; los dos comentarios `TODO` en
  `lib/personalab/catalogo.ts` y `experiencias/actions.ts` que referencian
  esta migración se quitan en el mismo cambio.

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

### P-001 — Vocabulario propio, sin YPO, para las dos líneas
- Estado: **abierto** (tres palabras ya resueltas, ver H-006/H-007 en Hecho)
- Origen: Francisco, 2026-09-21. "Esas palabras tampoco me gustan para
  trascendencia... en general tienen que tener otro vocabulario. Ya te dije
  que YPO tiene que quedar por aparte, no le estamos vendiendo a ellos."
- Qué se sabe: `capítulo`→`grupo`, `corrida`→`encuentro` y `foro`→`grupo`
  (el mismo grupo, fundidos en una sola palabra) ya se hicieron. Lo que
  sigue abierto es `guion`, `kit`, `retorno` — el resto del "Léxico
  vinculante del Consejo #002" (`dominio.ts:1-14`), heredado de la
  estructura de YPO. Francisco pide repensarlo para AMBAS líneas, no solo
  relabelear PersonaLab.
- Dueño: Claude investiga alcance (dónde aparece cada término, en cuál línea,
  en label vs. en dato vs. en nombre de columna) y lo trae al consejo
  (Daniel ya lo señaló; falta Nora, que es quien piensa el copy) antes de
  proponer nombres. No se inventa vocabulario sin pasar por el consejo:
  es exactamente el atajo que Francisco pidió dejar de tomar.
- Criterio de cierre: propuesta de vocabulario nueva, aprobada por Francisco,
  aplicada en TODOS los lugares donde aparece el término viejo (label, dato,
  y donde sea razonable, nombre de ruta) — no una parte.

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

### H-007 — Foro se funde en grupo (código); migración lista, sin correr
- Estado: **hecho** (código) — verificado 2026-09-21; migración de base
  pendiente, ver P-007
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
- Sin tocar, a propósito: `foro`, `guion`, `retorno` y el resto del léxico
  compartido con Trascendencia — eso es P-001, sigue abierto. Moderadores
  sigue como pestaña plana — eso es P-003, sigue abierto (falta construir
  la página de detalle de grupo donde debería anidarse).

### H-005 — Rediseño real del lector de participante y del editor, sección por sección
- Estado: **hecho** — verificado 2026-09-21
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
