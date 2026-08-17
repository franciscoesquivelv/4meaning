# Especificacion: autoria de experiencias en PersonaLab

> Sintesis del workflow del Consejo. Contrastar siempre contra
> VISTO-EN-VIVO.md, que es observacion directa del portal real.

```tsx
  <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-100">
    <label className="flex items-center gap-2 cursor-pointer group select-none">
      <input type="checkbox" className="sr-only peer" checked={bl.contenido.modo === 'descarga'} onChange={toggleModo} />
      <span className="w-4 h-4 rounded border-2 border-slate-300 bg-white flex items-center justify-center transition-colors peer-checked:bg-slate-900 peer-checked:border-slate-900 group-hover:border-slate-400">
        <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span className="text-xs text-slate-600">Se puede descargar</span>
    </label>
    <span className="text-xs text-slate-400">Si se puede descargar, no lo puede ver el participante.</span>
  </div>
</div>
```

Un `archivo` nace con `audiencia: 'moderador'` y `modo: 'descarga'`. Si el autor cambia la audiencia a Todos, la casilla se desmarca sola y el modo pasa a `lectura`; si vuelve a marcar la casilla, la audiencia sube a Moderador sola. Los dos controles son la misma regla vista desde dos lados, y moverse en uno mueve el otro en vez de producir un error.

Debajo, el pie del documento: `Campo` con rótulo `Qué es este documento`, marcador de posición `Guion de sala, versión 1.2`, pista `Una frase. Es lo que se lee antes de descargar.`

**Fallido:**

```tsx
<div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
  <div className="flex items-start gap-3">
    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-red-700">No se pudo subir {a.nombre}</p>
      <p className="text-xs text-red-600 mt-0.5">{motivo}</p>
    </div>
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button onClick={reintentar}
        className="text-xs font-medium text-red-700 border border-red-300 bg-white px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap">
        Reintentar
      </button>
      <button onClick={descartar} className={BTN_FILA + ' bg-white'}>Descartar</button>
    </div>
  </div>
</div>
```

**Motivos exactos, en español y sin jerga:**

| Causa | Motivo |
|---|---|
| Conexión cortada | Se cortó la conexión al {pct} por ciento. El archivo sigue en tu computadora, no se perdió nada. |
| Demasiado grande | Pesa {peso} y el máximo son {limite}. Comprímelo o divídelo en dos. |
| Formato equivocado, PDF | Esto no es un PDF. Solo se admiten archivos .pdf. |
| Formato equivocado, video | Ese formato no lo podemos reproducir. Usa MP4 o MOV. |
| PDF protegido | El PDF tiene contraseña. Quítasela y vuelve a subirlo. |
| Error del servidor | Falló del lado nuestro, no del tuyo. Vuelve a intentar en un minuto. |

**Video, vacío con dos vías:** segmented control `Subir archivo` y `Pegar enlace`. La vía de enlace es un `Campo` de tipo url con marcador `https://vimeo.com/…` y pista: `Vimeo o YouTube, siempre en modo no listado. Un enlace público deja de ser tuyo.` Error bajo el campo en `text-xs text-red-600 mt-1`: `No reconocemos ese enlace. Solo Vimeo y YouTube, siempre en modo no listado.`

**Video, listo:** miniatura de 96 por 56 con el poster, triángulo de reproducir centrado y duración en `absolute bottom-1 right-1 text-[10px] font-medium text-white bg-black/70 px-1 rounded tabular-nums`. A la derecha `Reproducir`, `Reemplazar`, quitar. Debajo, el pie.

**Advertencia de dominio del video**, cuando vive en una bisagra con soporte `sala` o cuando el pie contiene la palabra formación:

```tsx
<div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
  <p className="font-semibold text-xs uppercase tracking-wide text-amber-600 mb-1">Ojo con el kit</p>
  <p className="text-sm text-amber-800 leading-relaxed">
    La pieza humana solo se transmite en formación presencial, nunca por video. Este video sirve de apoyo,
    no sustituye la formación del moderador.
  </p>
</div>
```

La regla está literal en `dominio.ts:64`. La advertencia avisa, no bloquea.

## 4.9 La vista previa

Reutiliza el marco de teléfono que ya existe en `portal/app/(admin)/eventos/[id]/preview/page.tsx:264-317`, con su barra de estado, su muesca y su nav inferior simulada. Dentro del marco se renderiza el lector de la sección 5, con sus propios tokens de papel.

```tsx
<div className="space-y-3">
  <div className={SUPERFICIE + ' px-4 py-3'}>
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className={ETIQUETA_SECCION}>Vista previa</h2>
      <Link href={`${base}/vista-previa`} target="_blank"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap">
        Pantalla completa →
      </Link>
    </div>
    <div className="flex items-center bg-slate-100 rounded-lg p-1">
      {(['participante','moderador'] as const).map(l => (
        <button key={l} onClick={() => setLente(l)}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            lente === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          {l === 'participante' ? 'Como participante' : 'Como moderador'}
        </button>
      ))}
    </div>
  </div>

  <div className="relative mx-auto" style={{ width: 375 }}>
    <div className="relative bg-[#FAF8F4] rounded-[40px] shadow-2xl border-4 border-slate-800 overflow-hidden" style={{ minHeight: 640 }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-slate-900 rounded-b-2xl z-20" />
      <div className="absolute top-9 left-1/2 -translate-x-1/2 z-30 text-[9px] font-semibold uppercase tracking-widest text-[#8F5341] bg-[#EFE9E0] px-2 py-0.5 rounded-full">
        Vista previa
      </div>
      <div className="overflow-y-auto" style={{ height: 600 }}>
        <LectorBisagra bisagra={activa} nivel={lente === 'participante' ? 1 : 2} />
      </div>
    </div>
  </div>

  <p className="text-[11px] text-slate-400 text-center px-4 leading-relaxed">
    Estás viendo el borrador. El participante ve la última versión publicada hasta que publiques de nuevo.
  </p>
</div>
```

El chip `Vista previa` dentro del teléfono no es decoración: sin él, una captura de pantalla del panel es indistinguible de producción.

**Las dos lentes:**

- **Como participante:** `bloquesVisibles(bisagraId, 1)`. Sin notas, sin archivos de moderador, sin bisagras de sala.
- **Como moderador:** `bloquesVisibles(bisagraId, 2)`. Todo lo anterior más las notas, los archivos descargables, el bloque `requiere` y la duración de la bisagra.

Esta pantalla responde la pregunta que el autor no puede contestar de otra forma: qué queda del lado de allá.

Vacíos de la vista previa, copy exacto:

| Situación | Copy |
|---|---|
| Nada visible para el participante | Con esta lente el participante no ve nada todavía. Los bloques que hiciste son solo para el moderador. |
| Nada para el moderador | No hay nada para el moderador en esta bisagra. Ni guion, ni documentos, ni notas. |
| Bisagra de sala sin nada en pantalla | Esta bisagra ocurre en la sala. El software no entra y eso está bien. |
| Experiencia entera vacía | Todavía no hay nada que leer. Escribe el primer bloque y aparece aquí. |

## 4.10 La pantalla de publicar

`/experiencias/[id]/publicar`, contenedor `px-8 pt-6 pb-12 max-w-3xl mx-auto`.

**Bloque 1, qué recibe el participante.** Barra de métricas con el truco de hairlines de `eventos/[id]/page.tsx:156-167`, la mejor pieza técnica del chasis: el fondo `slate-200` del contenedor se ve solo a través del `gap-px` y produce líneas de 1px sin bordes dobles.

```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden mb-8">
  {[
    { label: 'Bisagras',           value: bisagras.length },
    { label: 'Bloques que ve',     value: bloquesParticipante },
    { label: 'Archivos',           value: archivos },
    { label: 'Minutos de lectura', value: minutos },
  ].map(m => (
    <div key={m.label} className="bg-white px-6 py-4">
      <div className="text-2xl font-semibold text-slate-900 tabular-nums">{m.value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{m.label}</div>
    </div>
  ))}
</div>
```

**Bloque 2, bloqueos.** Franja roja. Si hay uno solo, el botón de publicar está deshabilitado con `title` que dice por qué.

```tsx
<h2 className={ETIQUETA_SECCION + ' mb-3'}>Hay que arreglar esto antes de publicar</h2>
<div className="flex flex-col gap-3 mb-8">
  {bloqueos.map(b => (
    <div key={b.codigo + b.bloqueId} className="flex items-start gap-4 border-l-4 border-red-400 bg-red-50 rounded-r-xl px-5 py-4 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{b.titulo}</p>
        <p className="text-xs text-slate-500 mt-0.5">{b.detalle}</p>
      </div>
      <Link href={b.href}
        className="shrink-0 text-xs font-medium text-slate-700 border border-slate-300 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap">
        Ir a arreglarlo
      </Link>
    </div>
  ))}
</div>
```

**Bloqueos, copy exacto** (mismos códigos que `revisar_publicacion`):

| Código | Título | Detalle |
|---|---|---|
| `sin_nombre` | La experiencia no tiene nombre | Sin nombre no se puede licenciar a ningún capítulo. |
| `sin_ignicion` | La ignición no tiene ninguna bisagra | Una experiencia sin ignición no es una experiencia. |
| `bisagra_sin_titulo` | Hay {n} bisagras sin título | Una bisagra sin título aparece en blanco en el guion del moderador. |
| `texto_vacio` | Hay {n} bloques de texto vacíos | Se van a ver como una tarjeta en blanco. Escríbelos o elimínalos. |
| `medio_no_listo` | Hay {n} archivos todavía subiendo o fallidos | Espera a que terminen, súbelos otra vez o quita el bloque. |
| `video_en_ignicion` | Hay {n} videos en la ignición | En la ignición el software es mudo. Muévelos a la víspera o quítalos. |
| `gesto_fuera_de_retorno` | Hay un gesto fuera del retorno | El gesto solo va en el retorno. |
| `imagen_sin_alt` | Hay {n} imágenes sin texto alternativo | Quien no ve la imagen no se entera de qué había. Descríbela en una frase. |
| `video_enlace_roto` | Hay {n} enlaces de video que no reconocemos | Solo admitimos Vimeo y YouTube en modo no listado. |

**Bloque 3, advertencias.** Franja ámbar, misma estructura, sin botón. No impiden publicar.

| Código | Título | Detalle |
|---|---|---|
| `vispera_vacia` | La víspera está vacía | Es el tiempo que hoy no existe en ningún lado y es donde el software más sirve. |
| `retorno_vacio` | El retorno está vacío | Sin retorno, la experiencia termina el día que termina la sala. |
| `ignicion_con_pantalla` | Hay contenido de participante en la ignición | Ese día el software es mudo. Confirma que quieres eso. |
| `sala_con_pantalla` | Hay {n} bisagras de sala con contenido de pantalla | Lo que pasa entre personas no necesita pantalla. |
| `bisagra_sin_bloques` | Hay {n} bisagras sin ningún bloque | Existen en el índice pero no tienen contenido. |
| `bisagra_no_lista` | Hay {n} bisagras marcadas como no listas | Tú mismo dijiste que les falta trabajo. |
| `bisagra_sin_duracion` | Hay {n} bisagras sin duración | El moderador no va a poder planear la jornada. |
| `video_sin_poster` | Hay {n} videos sin imagen de portada | Sin portada, el video se ve como un rectángulo negro. |
| `archivo_al_participante` | Hay {n} archivos que ve el participante | Confirma que quieres eso. Por defecto los archivos son del moderador. |
| `pieza_kit_falta` | Hay {n} piezas del kit marcadas como que faltan | El capítulo va a recibir una lista incompleta. |

**Bloque 4, la confirmación.** Dos pasos, mecánica de `EventStatusButton.tsx:39-57`.

```tsx
// Paso 1
<button onClick={() => setConfirmando(true)} disabled={bloqueos.length > 0}
  title={bloqueos.length > 0 ? 'Primero hay que arreglar lo de arriba' : 'Publica la versión nueva'}
  className={BTN_PRIMARIO}>
  Publicar versión {n + 1}
</button>

// Paso 2
<div className={SUPERFICIE + ' p-5'}>
  <p className="text-sm font-semibold text-slate-900 mb-1">
    Se publica la versión {n + 1} de {experiencia.nombre}
  </p>
  <p className="text-sm text-slate-500 leading-relaxed mb-4">
    Los {m} moderadores con acceso van a ver la versión nueva la próxima vez que abran la experiencia.
    Las corridas que ya empezaron se quedan con la versión que tenían.
  </p>
  {advertencias.length > 0 && (
    <p className="text-xs text-amber-700 mb-4">
      Publicas con {advertencias.length} advertencia{advertencias.length === 1 ? '' : 's'} sin resolver.
    </p>
  )}
  <div>
    <label htmlFor="nota-version" className={ETIQUETA_CAMPO}>Qué cambió en esta versión</label>
    <input id="nota-version" placeholder="Se rediseñó Crisálida y se agregó el guion de sala" className={CAMPO} />
    <p className={PISTA_CAMPO}>Opcional. Queda en el historial y lo ve el moderador.</p>
  </div>
  <div className="flex gap-3 mt-4">
    <button onClick={publicar} disabled={cargando} className={BTN_PRIMARIO}>
      {cargando ? 'Publicando…' : 'Sí, publicar'}
    </button>
    <button onClick={() => setConfirmando(false)} className={BTN_SECUNDARIO}>Cancelar</button>
  </div>
</div>
```

Al publicar: toast `Versión {n+1} publicada`, tipo success, y vuelta a la Ficha.

Casos límite:
- Sin cambios respecto de la publicada: `No hay nada nuevo que publicar. Lo que ven los moderadores es exactamente lo que hay en el editor.`
- Nunca publicada: el botón dice `Publicar por primera vez` y el texto de confirmación dice `Desde ahora, los moderadores con acceso podrán abrir esta experiencia.`

## 4.11 Estados vacíos y errores del workspace

**Markup canónico del estado vacío, uno solo.** El admin tiene cuatro ejecuciones distintas del mismo patrón (`dashboard/page.tsx:74`, `eventos/page.tsx:61`, `usuarios/page.tsx:121`, `eventos/[id]/page.tsx:183`).

```tsx
<div className={SUPERFICIE + ' p-12 text-center'}>
  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  </div>
  <p className="text-base font-semibold text-slate-900 mb-2">{titulo}</p>
  <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">{cuerpo}</p>
  <button className={BTN_PRIMARIO}>{cta}</button>
</div>
```

Vacío dentro de una tarjeta, sin icono ni botón: `px-4 py-6 text-center text-slate-400 text-sm`, que es `eventos/[id]/page.tsx:183`.

**Vacíos del editor:**

| Situación | Copy | Acción |
|---|---|---|
| Experiencia sin ninguna bisagra | Título: `Esta experiencia todavía no está diseñada.` Cuerpo: `No es que falte capturarla, es que no existe. Empieza por la ignición, que es donde ocurre.` | Botón `Crear la primera bisagra` |
| Tiempo sin bisagras, en el lienzo | `Este tiempo no está diseñado.` | Botón dashed `+ Bisagra en {tiempo}` |
| Tiempo sin bisagras, en el riel | `Este tiempo no está diseñado.` | ninguna |
| Bisagra sin bloques | `La bisagra existe pero no tiene contenido.` | selector de tipo abierto abajo |
| Bloque de texto vacío | `Bloque vacío` | ninguna |
| Archivo sin subir | `Sin archivo. Súbelo o elimina el bloque.` | ninguna |
| Video sin archivo ni enlace | `Sin video. Sube uno o pega un enlace.` | ninguna |
| Kit vacío | `Sin kit definido. Un capítulo no puede correr esto sin saber qué necesita.` | Botón `Definir el kit` |
| Sin accesos otorgados | `Ningún moderador tiene acceso a esta experiencia todavía. El acceso se le da al moderador, que compra para su foro.` | Botón `Dar acceso a un moderador` |
| Historial vacío | `Esta experiencia nunca se ha publicado.` | ninguna |

**Errores:**

| Situación | Dónde | Copy |
|---|---|---|
| Falla el autoguardado | banner rojo | Tus últimos cambios no se guardaron. Lo que escribiste sigue en pantalla, no se ha perdido. No cierres esta pestaña hasta que diga Todo guardado. |
| Falla el guardado manual | toast error | No se pudo guardar. Revisa tu conexión y vuelve a intentar. |
| Sin conexión | banner ámbar | Estás sin conexión. Puedes seguir escribiendo. Guardamos en cuanto vuelvas a estar en línea. |
| Otra persona editó | banner ámbar, dos botones | {Nombre} guardó cambios en esta experiencia mientras la tenías abierta. Recarga para ver su versión, o copia lo tuyo antes de recargar. |
| Conflicto en un bloque | borde de aviso en la tarjeta | Alguien más cambió este bloque. Recarga para ver la versión buena. |
| Experiencia inexistente | página completa | Esta experiencia no existe o la eliminaron. |
| Sin permiso de autoría | página completa | Puedes ver esta experiencia pero no editarla. Pídele acceso de autor a quien la creó. |
| Sesión caducada | banner rojo | Tu sesión caducó. Abre otra pestaña, entra de nuevo y vuelve aquí. Lo que escribiste sigue en pantalla. |

**Ningún mensaje muestra texto de base de datos ni inglés.** El admin hoy hace `setError(error.message)` con el mensaje crudo de Postgres en `familias/nueva/page.tsx:46` y `NuevoItemForm.tsx:73`, y se lo enseña en inglés a una coordinadora. Aquí el mensaje técnico va a la consola y al log, y a la pantalla va una frase escrita por una persona.

## 4.12 Accesibilidad, no negociable

1. Todo `input`, `textarea` y `select` lleva `id`, y su `label` lleva `htmlFor` o es `sr-only` asociado. **Verificado que el admin no lo hace en ningún archivo** (`EditarEventoForm.tsx:42-52`, `NuevoItemForm.tsx:100-101`, `ChecklistClient.tsx:250-257`, `familias/nueva/page.tsx:69-76`). Un editor de autoría es un formulario gigante y sin esto es inusable con lector de pantalla. `Campo` los genera con `useId()`.
2. Un solo tratamiento de foco: `focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent`. El admin tiene cuatro en cuatro archivos hermanos, uno casi invisible (`focus:ring-slate-900/10` en `NuevoItemForm.tsx:77`) y uno sin reemplazo (`outline: 'none'` en `familias/nueva/page.tsx:186`).
3. Todo botón con solo icono lleva `aria-label` y `title`.
4. El acordeón de bloque lleva `aria-expanded` y `aria-controls`.
5. Ninguna acción existe únicamente en hover, salvo el punto de inserción, que es redundante con el botón dashed del pie.
6. El orden de tabulación sigue el orden visual: riel, lienzo de arriba abajo, panel.
7. El chip de guardado vive dentro de `aria-live="polite"`.
8. Nada de texto informativo por debajo de `slate-400` sobre blanco. `slate-300` se reserva a separadores y al marcador de celda vacía.
9. Los checkbox son `input type="checkbox"` con `sr-only peer`, no `<button>` sin `role` como en `ChecklistClient.tsx:44`.

---

# 5. La lectura del participante

## 5.1 Rutas y shell

```
/prototipo/personalab/lector/[corridaId]                 portada
/prototipo/personalab/lector/[corridaId]/[bisagraRaizId] lectura de una bisagra
/prototipo/personalab/lector/[corridaId]/cierre          cierre
```

En producción cuelgan de `/experiencia/...` fuera del prototipo. Se usa `corridaId` y no `experienciaId` porque la versión, la apertura y el nivel de audiencia se resuelven desde la corrida.

```tsx
<article className="lab-lectura lab-columna font-[family-name:var(--font-lab)] bg-[#FAF8F4] min-h-screen">
  {bloques.map(b => <Bloque key={b.id} b={b} />)}
</article>
```

Sin barra inferior fija. `ParticipantNav.tsx` de 64px más `pb-24` roba 96px de 812, un 12 por ciento de la pantalla, para navegar entre secciones que en el lector no se usan. El lector es un modo; se sale por la flecha o por la hoja de ruta.

## 5.2 Escala tipográfica

Familia `var(--font-lab)`, peso base 300.

| Rol | Teléfono | Escritorio | Peso | Tracking | Color |
|---|---|---|---|---|---|
| Display de portada | 40px / lh 1.00 | 68px / lh 1.00 | 200 | −0.03em | `#FFFFFF` |
| Nombre de tiempo | 32px / lh 1.05 | 44px / lh 1.05 | 200 | −0.03em | `#FFFFFF` |
| Título de cierre | 28px / lh 1.15 | 38px / lh 1.15 | 200 | −0.025em | `#FFFFFF` |
| H1 de bisagra | 28px / lh 1.12 | 36px / lh 1.10 | 200 | −0.025em | `#002B34` |
| Entradilla | 19px / lh 1.60 | 21px / lh 1.60 | 300 | −0.005em | `#002B34` al 85 |
| H2 interno | 24px / lh 1.20 | 30px / lh 1.15 | 200 | −0.02em | `#002B34` |
| H3 interno | 17px / lh 1.35 | 18px / lh 1.35 | 500 | 0 | `#14181B` |
| **Cuerpo** | **17px / lh 1.75** | **18px / lh 1.80** | **300** | 0 | `#14181B` |
| Cita | 21px / lh 1.50 | 26px / lh 1.45 | 200 | −0.015em | `#002B34` |
| Pie de foto | 12.5px / lh 1.60 | 12.5px / lh 1.60 | 300 | 0 | `#676E6E` |
| Metadato | 12.5px / lh 1.50 | 13px / lh 1.50 | 300 | 0 | `#676E6E` |
| Rótulo terracota | 10px | 10px | 600 | 0.16em, mayúsculas | `#8F5341` |
| Rótulo de marca | 10px | 10px | 600 | 0.34em, mayúsculas | `#D8AC96` |

620px a 18px da aproximadamente **68 caracteres**, dentro de la banda de 60 a 75. En teléfono, 375 menos 40 de canal da 335px a 17px, aproximadamente **39 caracteres**, que es el techo real del formato.

**Prohibido:** cuerpo por debajo de 17px. Cuerpo en `#676E6E`. Cursiva en pesos 200 o 300 por debajo de 19px: en el stack de sistema se deshilacha.

Comparación con lo que hay hoy: el participante de Trascendencia lee `text-sm` (14px) dentro de `max-w-lg` (512px), en `programa/page.tsx:252` e `info/page.tsx:152`, y no hay ni un tamaño de lectura mayor en ninguna vista. Es texto pequeño en una medida corta.

## 5.3 Ritmo vertical

Base 4px. Margen superior de cada bloque:

| Bloque | Teléfono | Escritorio |
|---|---|---|
| Párrafo tras párrafo | 24px | 28px |
| H2 dentro del markdown | 56px | 72px |
| H3 dentro del markdown | 32px | 40px |
| Cita | 40px | 52px |
| Imagen, video | 36px | 48px |
| Archivo, objeto, consigna, aviso, nota, gesto | 32px | 40px |
| Pausa, arriba y abajo | 64px | 80px |
| Pie de bisagra | 88px | 120px |
| Cambio de tiempo | 88px | 120px |

## 5.4 Render por tipo de bloque

**Encabezado de la bisagra**, siempre, antes del primer bloque:

```tsx
<header className="pt-10 md:pt-16">
  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
    {ETIQUETA_TIEMPO[bi.tiempo]}
  </div>
  <h1 className="mt-4 text-[28px] md:text-[36px] leading-[1.12] md:leading-[1.10] font-extralight tracking-[-0.025em] text-[#002B34] text-balance">
    {bi.titulo}
  </h1>
  {bi.descripcion && (
    <p className="mt-5 text-[19px] md:text-[21px] leading-[1.6] font-light tracking-[-0.005em] text-[#002B34]/85 max-w-[46ch]">
      {bi.descripcion}
    </p>
  )}
  <div className="mt-8 h-px bg-[#E5DED4]" />
</header>
```

La entradilla sale de `Bisagra.descripcion` (`dominio.ts:45`). Esto corrige de raíz que `eventos/[id]/page.tsx:127` no tenga ningún h1.

**1. `texto`**

```tsx
<div className="mt-6 md:mt-7">
  <RenderMarkdown md={b.contenido.md} tono="papel" />
</div>
```

Sin tarjeta, sin borde, sin fondo. Es lo contrario de lo que hace el portal hoy, y esa es la corrección: `info/page.tsx:147-156` y `programa/page.tsx:251-255` meten el párrafo en `bg-[#181818] border border-[#2A2A2A] rounded-xl p-5`, así que cada bloque de sentido queda amputado del siguiente por un borde. `BRAND.md:146` pide justo lo contrario: amplio, sereno, con espacio para respirar.

**Mapa de clases en tono papel:**

| Nodo | Clases |
|---|---|
| Párrafo | `text-[17px] md:text-[18px] leading-[1.75] md:leading-[1.8] font-light text-[#14181B]` |
| Párrafo tras párrafo | `mt-6 md:mt-7` |
| H2 | `mt-14 md:mt-[72px] mb-4 md:mb-5 text-[24px] md:text-[30px] leading-[1.2] md:leading-[1.15] font-extralight tracking-[-0.02em] text-[#002B34] text-balance scroll-mt-[68px]` con `id` |
| H3 | `mt-8 md:mt-10 mb-2 text-[17px] md:text-[18px] leading-[1.35] font-medium text-[#14181B]` |
| Negrita | `font-medium text-[#002B34]` |
| Itálica | `italic` |
| Lista | `my-5 space-y-2.5 list-none pl-0`, item `relative pl-[22px]` con `::before` de 6px por 1px en `#B9735A` a `top-[13px]` |
| Lista numerada | `my-5 space-y-2.5 list-decimal pl-6 marker:text-[#8F5341] marker:text-[13px]` |
| Cita en línea (`>`) | `border-l-2 border-[#B9735A]/50 pl-4 my-6 text-[#002B34]` |
| Enlace | `text-[#002B34] no-underline border-b border-[rgba(185,115,90,.55)] pb-[1px] hover:border-[#B9735A]` |

**2. `cita`**

```tsx
<figure className="mt-10 md:mt-[52px] mb-10 md:mb-[52px]">
  <div className="w-10 h-px bg-[#B9735A]" aria-hidden="true" />
  <blockquote className="mt-5 text-[21px] md:text-[26px] leading-[1.5] md:leading-[1.45] font-extralight tracking-[-0.015em] text-[#002B34] text-balance">
    {b.contenido.texto}
  </blockquote>
  {b.contenido.atribucion && (
    <figcaption className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
      {b.contenido.atribucion}
    </figcaption>
  )}
</figure>
```

Filete terracota de 40 por 1px arriba, no comillas grandes ni barra lateral. Sin cursiva: a peso 200 el stack de sistema la deshilacha. Sin comillas tipográficas en el dato: las pone el diseño o no van.

**3. `imagen`**

```tsx
<figure className="lab-media mt-9 md:mt-12">
  <div className={`relative overflow-hidden bg-[#EFE9E0] md:rounded-[3px] ${RATIO[b.contenido.ratio ?? '3:2']}`}>
    <img src={urlFirmada} alt={b.contenido.alt} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
  </div>
  {b.contenido.pie && (
    <figcaption className="mt-3 px-5 md:px-0 max-w-[52ch] text-[12.5px] leading-[1.6] font-light text-[#676E6E]">
      {b.contenido.pie}
    </figcaption>
  )}
</figure>
```

```ts
const RATIO = { '3:2':'aspect-[3/2]', '4:5':'aspect-[4/5]', '16:9':'aspect-video', '1:1':'aspect-square' } as const
```

Teléfono: borde a borde, sin radio (una esquina redonda contra el borde de la pantalla se lee como error de recorte). Escritorio: 820px con `encuadre: 'ancho'`, 620px con `columna`, radio 3px.

`<img>` con `loading="lazy"`, no `next/image`: la URL firmada expira y `next/image` cachearía una URL muerta.

**4. `video`**

```tsx
<figure className="lab-media mt-9 md:mt-12">
  <div className="relative aspect-video overflow-hidden bg-[#001A21] md:rounded-[3px]">
    {/* subido */}
    <video className="w-full h-full object-cover" controls playsInline preload="metadata"
           poster={posterUrl} src={urlFirmada} />
    {/* enlace: iframe del proveedor con los mismos bordes */}
  </div>
  <figcaption className="mt-3 px-5 md:px-0 flex items-baseline justify-between gap-4 text-[12.5px] leading-[1.6] font-light text-[#676E6E]">
    <span className="max-w-[52ch]">{b.contenido.pie}</span>
    {duracion && <span className="shrink-0 tabular-nums">{duracion}</span>}
  </figcaption>
</figure>
```

Reglas duras: nunca `autoPlay`, nunca `loop`, `poster` obligatorio, `preload="metadata"` y no `auto` porque el participante está en datos móviles, `playsInline` obligatorio porque sin él iOS abre el reproductor a pantalla completa y expulsa al lector del texto.

**5. `archivo`**

```tsx
{modo === 'descarga' ? (
  <a href={`/api/personalab/medios/${b.medioId}?corrida=${cid}&bloque=${b.id}&descarga=1`}
     className="group mt-8 md:mt-10 flex items-center gap-4 no-underline bg-white border border-[#E5DED4] hover:border-[#B9735A] rounded-[4px] px-4 py-4 md:px-5 md:py-[18px] transition-colors">
    <span className="shrink-0 w-11 h-11 grid place-items-center rounded-[3px] border border-[#002B34]/25 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#002B34]">
      PDF
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[14.5px] font-normal text-[#002B34]">{b.contenido.nombre}</span>
      <span className="block mt-0.5 text-[11.5px] font-light text-[#676E6E]">
        PDF · {peso} · {b.contenido.descripcion}
      </span>
    </span>
    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8F5341] group-hover:text-[#B9735A] transition-colors">
      Descargar
    </span>
  </a>
) : (
  <div className="lab-media mt-9 md:mt-12">
    <iframe src={urlFirmada} className="w-full h-[80vh] border border-[#E5DED4] md:rounded-[3px] bg-white" title={b.contenido.nombre} />
    <p className="mt-3 px-5 md:px-0 text-[12.5px] font-light text-[#676E6E]">{b.contenido.descripcion}</p>
  </div>
)}
```

Alto real del enlace de descarga: 44 más 32, 76px. Sobra sobre los 44px de objetivo táctil.

Es lo contrario de `documentos/page.tsx`, la única lista de descargables del portal, que está escrita con estilos en línea sin Tailwind, monta tarjetas `#fff` dentro del layout oscuro, y en la línea 67 pinta el nombre sin declarar color, heredando el `text-[#F5F0E8]` del layout: crema sobre blanco, ilegible.

**6. `objeto`**

```tsx
<div className="mt-8 md:mt-10 border-t border-[#B9735A] bg-[#EFE9E0]/55 px-4 py-4 md:px-5 md:py-[18px]">
  <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
    Se recibe en la sala
  </div>
  <div className="mt-2 text-[15px] font-normal text-[#002B34]">{nombre}</div>
  {detalle && (
    <p className="mt-1.5 text-[13px] leading-[1.6] font-light text-[#676E6E] max-w-[54ch]">{detalle}</p>
  )}
</div>
```

**Sin enlace, sin botón, sin icono de descarga.** El borde superior terracota de 1px, y no el lateral, dice "esto entra en la lectura desde fuera de la pantalla".

**7. `consigna`**

```tsx
<div className="mt-8 md:mt-10 border-l-2 border-[#002B34] pl-4 md:pl-5 py-0.5">
  <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#002B34]/65">
    {b.contenido.etiqueta}
  </div>
  <div className="mt-2"><RenderMarkdown md={b.contenido.md} tono="papel" compacto /></div>
</div>
```

Barra izquierda teal de 2px. Sin fondo: no es un aviso, es parte del texto con más peso.

**8. `aviso`**

```tsx
<aside className={`mt-8 md:mt-10 px-4 py-4 md:px-5 md:py-[18px] border-l-2 ${
  b.contenido.tono === 'cuidado'
    ? 'border-[#8F5341] bg-[#B9735A]/[0.08]'
    : 'border-[#E5DED4] bg-[#EFE9E0]/55'}`}>
  {b.contenido.titulo && (
    <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
      {b.contenido.titulo}
    </div>
  )}
  <div className="mt-2"><RenderMarkdown md={b.contenido.md} tono="papel" compacto /></div>
</aside>
```

**9. `nota`** (solo moderador)

```tsx
<aside className="mt-8 md:mt-10 border-l-2 border-[#B9735A] bg-[#B9735A]/[0.06] px-4 py-4 md:px-5 md:py-[18px]">
  <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
    Solo tú ves esto
  </div>
  <div className="mt-2"><RenderMarkdown md={b.contenido.md} tono="papel" compacto /></div>
</aside>
```

Hereda el tratamiento que el prototipo ya inventó para la nota de diseño (`experiencias/[id]/page.tsx:130-147`), convertido a barra lateral para que se distinga de la consigna sin leer la etiqueta.

**10. `pausa`**

```tsx
<div className="mt-16 md:mt-20 mb-16 md:mb-20 flex justify-center gap-3" aria-hidden="true">
  <span className="w-[3px] h-[3px] rounded-full bg-[#B9735A]/55" />
  <span className="w-[3px] h-[3px] rounded-full bg-[#B9735A]/55" />
  <span className="w-[3px] h-[3px] rounded-full bg-[#B9735A]/55" />
</div>
```

**11. `gesto`**, estado vacío:

```tsx
<div className="mt-8 md:mt-10 border-t border-[#B9735A] pt-5">
  <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">Tu frase</div>
  <p className="mt-2 text-[13px] leading-[1.6] font-light text-[#676E6E]">{b.contenido.consigna}</p>
  <label htmlFor={`gesto-${b.id}`} className="sr-only">Tu frase</label>
  <textarea id={`gesto-${b.id}`} rows={2} maxLength={140} autoComplete="off"
    placeholder="Escríbela con tus palabras."
    className="mt-3 w-full bg-transparent resize-none text-[19px] md:text-[21px] leading-[1.55] font-light text-[#002B34] placeholder:text-[#676E6E]/70 border-b border-[#E5DED4] focus:border-[#B9735A] outline-none pb-2 transition-colors" />
  <button disabled={!texto.trim()}
    className="mt-5 px-5 py-2.5 rounded-[4px] bg-[#002B34] text-white text-[12.5px] font-medium hover:bg-[#0A3B45] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
    Guardar
  </button>
</div>
```

Estado guardado: **el control se convierte en su resultado**, exactamente como `CheckInButton.tsx:65-80`.

```tsx
<div className="mt-8 md:mt-10 border-t border-[#B9735A] pt-5">
  <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">Tu frase</div>
  <p className="mt-3 text-[19px] md:text-[21px] leading-[1.55] font-light text-[#002B34]">{texto}</p>
  <button onClick={editar} className="mt-3 text-[11.5px] text-[#676E6E] hover:text-[#002B34] transition-colors">
    Cambiarla
  </button>
</div>
```

140 caracteres, sin contador visible. Sin toast: el propio texto en su lugar es la confirmación. Sin racha, sin conteo de meses.

## 5.5 Navegación

**Barra superior, 52px**, pegajosa:

```tsx
<header className="sticky top-0 z-40 h-[52px] bg-[#FAF8F4]/[0.88] backdrop-blur-[14px] backdrop-saturate-[160%] border-b border-[#E5DED4]">
  <div className="mx-auto max-w-[860px] h-full px-5 flex items-center justify-between gap-3">
    <Link href={`/lector/${cid}`} className="flex items-center gap-2 min-w-0 no-underline text-[#676E6E] hover:text-[#002B34] transition-colors">
      <svg className="w-[15px] h-[15px] shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M10 3L5 8l5 5" />
      </svg>
      <span className="text-[12.5px] font-light truncate">{contexto}</span>
    </Link>
    <button onClick={abrirHoja} className="shrink-0 h-11 -mr-2 px-3 flex items-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#002B34] hover:text-[#B9735A] transition-colors">
      Hoja de ruta
    </button>
  </div>
</header>
```

**El texto `contexto` cambia al hacer scroll.** Al inicio muestra el nombre de la experiencia; al pasar el primer `h2`, muestra el título de la sección. Con `IntersectionObserver`, no con cálculo de scroll:

```ts
const io = new IntersectionObserver(
  entradas => {
    const visible = entradas.filter(e => e.isIntersecting).at(-1)
    if (visible) setContexto(visible.target.textContent ?? '')
  },
  { rootMargin: '-52px 0px -75% 0px', threshold: 0 }
)
document.querySelectorAll('article h2[id]').forEach(h => io.observe(h))
```

Esto responde `dónde estoy` sin contar nada. La flecha izquierda **siempre sube un nivel** a la portada, nunca es el atrás del navegador.

**Hoja de ruta:** hoja inferior en teléfono, diálogo centrado en escritorio. Cierra con Escape, atrapa el foco y bloquea el scroll del cuerpo (el modal de `ItinerarioClient.tsx:359-437` no hace ninguna de las tres). Agrupa por tiempo con rótulo `text-[10px] font-semibold uppercase tracking-[0.19em] text-[#676E6E]`.

**Cuatro estados de fila, ninguno es un porcentaje:**

| Estado | Punto | Título | Sufijo |
|---|---|---|---|
| Actual | `bg-[#B9735A]` | `text-[#002B34] font-normal` | `Aquí estás` en `#8F5341` |
| Abierta | `bg-[#E5DED4]` | `text-[#002B34] font-light`, enlace | ninguno |
| En la sala | círculo con borde `#E5DED4` | `text-[#676E6E] font-light`, sin enlace | `En la sala` en `#676E6E` |
| Todavía no abierta | círculo con borde `#E5DED4` | `text-[#676E6E] font-light`, sin enlace | `Se abre el 12 de agosto` en `#8F5341` |

El último corrige el sello `text-white/20` de `programa/page.tsx:256`, que sobre `#1A1A1A` es prácticamente invisible.

**Botón flotante en teléfono**, porque la barra está arriba y el pulgar abajo:

```tsx
<button onClick={abrirHoja} aria-label="Hoja de ruta"
  className="md:hidden fixed right-4 z-30 w-11 h-11 rounded-full bg-[#002B34] text-[#FAF8F4] grid place-items-center shadow-[0_2px_14px_rgba(0,26,33,.22)] bottom-[max(20px,env(safe-area-inset-bottom))]">
  <svg className="w-[17px] h-[17px]" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 5h12M3 9h12M3 13h7" />
  </svg>
</button>
```

**Pie de bisagra:** se avanza **por nombre, no por posición**.

```tsx
<footer className="mt-[88px] md:mt-[120px] border-t border-[#E5DED4] pt-8 md:pt-10 pb-16 md:pb-24">
  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#676E6E]">Aquí termina</div>
  <div className="mt-1.5 text-[13.5px] font-light text-[#676E6E]">{bi.titulo}</div>

  {siguiente && siguiente.soporte !== 'sala' ? (
    <Link href={`/lector/${cid}/${siguiente.raizId}`} className="group mt-7 flex items-baseline gap-3 no-underline">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">Sigue</span>
      <span className="text-[22px] md:text-[26px] font-extralight tracking-[-0.02em] leading-[1.25] text-[#002B34] group-hover:text-[#B9735A] transition-colors text-balance">
        {siguiente.titulo}
      </span>
    </Link>
  ) : siguiente ? (
    <div className="mt-7">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
        Lo que sigue no pasa aquí
      </div>
      <div className="mt-2 text-[22px] md:text-[26px] font-extralight tracking-[-0.02em] text-[#676E6E]">
        {siguiente.titulo}
      </div>
      <p className="mt-3 text-[14px] leading-[1.7] font-light text-[#676E6E] max-w-[42ch]">
        Ocurre entre personas, en la sala. No hay nada que abrir.
      </p>
    </div>
  ) : (
    <Link href={`/lector/${cid}/cierre`} className="group mt-7 inline-flex items-baseline gap-3 no-underline">
      <span className="text-[22px] md:text-[26px] font-extralight tracking-[-0.02em] text-[#002B34] group-hover:text-[#B9735A] transition-colors">
        Cerrar {ETIQUETA_TIEMPO[bi.tiempo].toLowerCase()}
      </span>
    </Link>
  )}
</footer>
```

**Reanudar:** puntero al `raizId` de la última bisagra abierta, en `localStorage` con la clave `lab_ultima_{corridaId}`, escrito solo dentro de `useEffect`. Se usa únicamente para redactar el llamado de la portada: `Continuar en: Lo que hay que traer`. Es un puntero a un id, no un índice ni un conteo. Si algún día sube a Supabase, la columna se llama `ultima_bisagra_raiz_id`, nunca `progress`.

**Prohibido en la navegación:** barra de progreso, porcentaje, `3 de 7`, casilla de `Marcar como leída`, racha, insignia, confeti, sonido, candado sobre lo no abierto, cualquier conteo de lo hecho contra lo pendiente.

## 5.6 Moderador y participante en la misma pantalla

**Banda de 30px** encima de la barra superior, que pasa a `sticky top-[30px]`:

```tsx
<div className="h-[30px] bg-[#002B34] text-[#F2EFE9] flex items-center justify-center gap-4 px-5 text-[10px] uppercase tracking-[0.16em]">
  <span className="text-[#D8AC96] font-semibold">Moderador</span>
  <span className="truncate opacity-85">Ves todo lo que no ve el foro</span>
  <Link href="?como=participante" className="shrink-0 opacity-70 hover:opacity-100 underline underline-offset-[3px] decoration-[#D8AC96]/50 transition-opacity">
    Ver como participante
  </Link>
</div>
```

Es el mismo gesto que la tira de prototipo de `prototipo/layout.tsx:24-46`: mayúsculas, `letter-spacing .16em`, fondo `#002B34`, acento terracota en la palabra que nombra el modo.

En modo previsualización la banda cambia a `bg-[#8F5341] text-[#FAF8F4]`, dice `Vista de participante` más `Así se ve para el foro`, y el enlace vuelve con `Volver a mi vista`.

`?como=participante` solo lo acepta el servidor si el rol real es moderador. Un participante que lo escriba a mano no cambia nada.

Cuando `abreEspacioAlForo` es `false`, la banda añade: `Nadie más abre esta pantalla. Esta vista es para que sepas qué vas a proyectar.`

**Lo que el moderador ve de más al inicio de una bisagra:**

```tsx
{nivel >= 2 && bi.requiere?.length > 0 && (
  <div className="mt-6 border-l-2 border-[#B9735A] bg-[#B9735A]/[0.06] px-4 py-4 md:px-5 md:py-[18px]">
    <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
      Necesitas en la mano
    </div>
    <ul className="mt-2.5 space-y-1.5">
      {bi.requiere.map(r => (
        <li key={r} className="relative pl-[18px] text-[14px] leading-[1.55] font-light text-[#14181B]">
          <span className="absolute left-0 top-[10px] w-[6px] h-px bg-[#B9735A]" />
          {r}
        </li>
      ))}
    </ul>
    {bi.duracion && (
      <div className="mt-3 pt-3 border-t border-[#B9735A]/25 text-[11.5px] font-light text-[#8F5341] tabular-nums">
        {bi.duracion}
      </div>
    )}
  </div>
)}
```

El moderador **no** ve las frases que escribieron otros. Eso es material de la sala.

## 5.7 Teléfono

Referencia 375 por 812.

| Elemento | Valor |
|---|---|
| Canal lateral | 20px, único en todo el lector |
| Ancho de texto | 335px |
| Media | 375px, borde a borde |
| Barra superior | 52px, o 82px con banda de moderador |
| `scroll-mt` de anclas | 68px, o 98px con banda |
| Cuerpo | 17px / 29.75px de interlínea |
| Objetivo táctil mínimo | 44 por 44px |
| Botón flotante | 44px, `right-4`, `bottom: max(20px, env(safe-area-inset-bottom))` |
| Hoja de ruta | `max-h-[78vh]`, fondo `pb-[max(28px,env(safe-area-inset-bottom))]` |

**Reglas:**

1. Un canal único de 20px. El portal actual usa `px-6` en Mi Retiro, `px-5` en seis páginas, `px-4` en dos y 24px en línea en Documentos: al cambiar de pestaña el texto se desplaza de lado.
2. Imagen y video a sangre por debajo de 768px, sin radio.
3. `100svh` y no `100vh` en la portada. Con `100vh` la barra de Safari tapa el llamado a entrar.
4. `text-balance` en titulares. Tailwind 3.4 lo trae, y a 40px sobre 335px un titular de cinco palabras parte mal sin él.
5. Sin hover como única vía.
6. `overflow-x` cero. Todo `lab-sangre` dentro de la rejilla, nunca con `w-screen`, que en iOS suma el ancho de la barra de scroll.

Un solo punto de corte, en `md` (768px). La rejilla resuelve el resto sin más consultas de medios.

## 5.8 Los tres momentos de transición

**Entrar, la portada.** `/lector/[corridaId]`. Alto completo, profundo, con la aurora que el participante ya vio en la landing (`assets/brand.css:52-56`), **sin animación**: en la landing los blobs derivan 26 a 38 segundos, aquí gastaría batería y agitaría una pantalla que debe estar quieta.

```tsx
<section className="relative min-h-[100svh] overflow-hidden bg-[#001A21] flex flex-col justify-end px-5 md:px-10 pt-24 pb-14 md:pb-20">
  <div aria-hidden="true" className="pointer-events-none absolute -top-[22%] -left-[18%] w-[78vw] h-[78vw] max-w-[720px] max-h-[720px] rounded-full opacity-70 blur-[70px]"
       style={{ background: 'radial-gradient(circle, #0E5866, transparent 70%)' }} />
  <div aria-hidden="true" className="pointer-events-none absolute -bottom-[16%] -right-[12%] w-[62vw] h-[62vw] max-w-[560px] max-h-[560px] rounded-full opacity-[0.28] blur-[70px]"
       style={{ background: 'radial-gradient(circle, #B9735A, transparent 68%)' }} />

  <div className="relative mx-auto w-full max-w-[620px]">
    <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#D8AC96]">PersonaLab</div>
    <h1 className="mt-6 text-[40px] md:text-[68px] leading-[1.0] font-extralight tracking-[-0.03em] text-white text-balance">
      {exp.nombre}
    </h1>
    {exp.narrativa && (
      <p className="mt-5 text-[19px] md:text-[22px] leading-[1.45] font-extralight text-[#D8AC96] max-w-[26ch]">
        {exp.narrativa}
      </p>
    )}
    <div className="mt-10 flex items-center gap-4 text-[12.5px] font-light text-white/55">
      <span>{capitulo.nombre}</span>
      <span className="w-px h-3 bg-white/25" aria-hidden="true" />
      <span>{fecha(corrida.fecha)}</span>
    </div>
    <Link href={destino}
      className="mt-9 inline-flex items-center gap-2 no-underline text-[12px] tracking-[0.03em] text-white/90 border-b border-white/40 pb-[3px] hover:text-white hover:border-[#B9735A] transition-colors">
      {puntero ? `Continuar en: ${nombreDe(puntero)}` : 'Entrar'}
    </Link>
  </div>
</section>
```

**Cambio de tiempo.** Cuando la siguiente bisagra pertenece a otro tiempo, entre el pie y el enlace se interpone una banda a sangre:

```tsx
<section className="lab-sangre mt-[88px] md:mt-[120px] bg-[#002B34] px-5 md:px-10 py-12 md:py-16">
  <div className="mx-auto max-w-[620px]">
    <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D8AC96]">Empieza</div>
    <h2 className="mt-3 text-[32px] md:text-[44px] leading-[1.05] font-extralight tracking-[-0.03em] text-white">
      {ETIQUETA_TIEMPO[siguienteTiempo]}
    </h2>
    <p className="mt-5 max-w-[46ch] text-[15px] md:text-[16px] leading-[1.7] font-light text-white/70">
      {COPY_TIEMPO[siguienteTiempo]}
    </p>
  </div>
</section>
```

```ts
const COPY_TIEMPO: Record<Tiempo, string> = {
  vispera:  'Lo que sigue se lee antes. Prepara el tono con el que vas a llegar.',
  ignicion: 'Lo que sigue no pasa aquí. Pasa en la sala, entre personas.',
  retorno:  'Lo que sigue vuelve una vez al mes. Sin prisa, sin deuda.',
}
```

Escrito a partir de `PAPEL_SOFTWARE` (`dominio.ts:27-31`), en voz de participante. **Estas frases no las validó Francisco ni Renata.**

**Llegar al final.** `/lector/[corridaId]/cierre`. Cierra el arco de la portada: mismo profundo, misma medida, sin aurora. La portada abre con un halo, el cierre cierra con un filete.

```ts
const CIERRE: Record<Tiempo, { titulo: string; cuerpo: string }> = {
  vispera: {
    titulo: 'Hasta aquí llega la pantalla.',
    cuerpo: 'Lo que sigue ocurre en la sala, el día de la corrida. No hay nada más que abrir aquí hasta entonces. Lleva contigo lo que te pidieron.',
  },
  ignicion: {
    titulo: 'Lo que pasó, pasó entre ustedes.',
    cuerpo: 'Nada de eso vive aquí dentro y así debe ser. En unas semanas se abre el retorno, con una sola cosa al mes.',
  },
  retorno: {
    titulo: 'Aquí se cierra.',
    cuerpo: 'Seis meses después de la sala, esto termina. Lo que quede no está en esta pantalla: está en lo que hayas hecho con ello.',
  },
}
```

Al pie, el sello que `BRAND.md:127` establece: `Una experiencia de 4 Meaning`, en `text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/35` sobre `border-t border-white/10`.

**Prohibido en el cierre:** palomita gigante, felicitaciones, certificado, insignia, sugerencia de otra experiencia, compartir en redes, encuesta. El cierre nombra lo que sigue fuera de la pantalla y calla.

---

# 6. Orden de implementación

El criterio es que haya algo que mirar lo antes posible, y que lo primero que se mire sea lo que el usuario más quiere ver: contenido publicado con diseño.

## Paso 0. El chasis (medio día)

**Qué:** `globals.css` con las cuatro adiciones. `tokens.ts`. `PersonaLabTopNav.tsx`. `layout.tsx` reescrito. Borrar `WorkspaceNav.tsx`. Repintar las nueve páginas existentes de estilos en línea a las clases de `tokens.ts`, según la tabla de la sección 2.

**Qué se ve:** el workspace entero deja de verse teal con barra lateral y pasa a verse como Trascendencia. Es un cambio de cero función y de máximo impacto percibido, y sin él todo lo demás se va a ver como un injerto.

**Riesgo:** ninguno funcional. Es repintado.

## Paso 1. El modelo y la semilla (medio día)

**Qué:** `contenido.ts` con los tipos, el `CATALOGO` y las tablas `VERSIONES`, `BISAGRAS`, `PIEZAS_KIT`, `BLOQUES`, `MEDIOS`. `markdown.ts`. Refactor de proyección en `dominio.ts` según la sección 3.9. Semilla de contenido **real y escrito**, no lorem, para las cinco bisagras de `El Presente como Regalo` (`dominio.ts:174-180`), que es la única experiencia del catálogo con `abreEspacioAlForo: true` y bisagras diseñadas.

**Qué se ve:** nada todavía. Verificar que las cinco páginas de la sección 3.9 siguen renderizando. **Commit propio.**

## Paso 2. El lector (un día y medio)

**Qué:** `RenderMarkdown.tsx`, los once renderizadores de bloque, la barra superior con `IntersectionObserver`, la hoja de ruta, el pie por nombre, la portada, el cambio de tiempo y el cierre. Con los medios apuntando a `public/ejemplos/`.

**Qué se ve:** **la primera cosa que el usuario quiere ver.** Contenido real, en papel, a 620px, con imágenes, citas y consignas, en teléfono y en escritorio, con las dos lentes. Aquí ya se puede discutir tipografía, ritmo y tono con algo delante.

Ir antes del editor es deliberado: el lector define qué tiene que producir el editor, es más barato, y es lo que contesta `el participante debe ver el contenido con una experiencia de usuario excelente`.

## Paso 3. El editor de texto (dos días)

**Qué:** `ExperienciaSubNav.tsx` con las cinco secciones. `almacen.ts`. Riel de índice. Lienzo con tarjetas de bisagra. Bloques de `texto`, `cita`, `consigna`, `aviso`, `nota`, `pausa`: agregar, abrir, editar, reordenar, eliminar con los tres pasos. El guardado entero: cuatro estados del chip, banner, `beforeunload`, Cmd más S. Panel de vista previa con las dos lentes, reutilizando el lector del paso 2.

**Qué se ve:** el usuario puede escribir una bisagra completa y verla en el teléfono al lado, en vivo. Es el bucle que pidió.

**Sin archivos todavía.** Se declara y se dice por qué: los seis estados de subida son la parte más cara y la que menos aporta a validar la forma.

## Paso 4. Publicar (medio día)

**Qué:** `revisar_publicacion` en TypeScript. Pantalla `/publicar` con las tres franjas y la confirmación de dos pasos. Estados de versión derivados. `abrirBorrador` y `publicar` en el almacén. Aviso azul en el editor. Badge en el índice de experiencias. Página de historial.

**Qué se ve:** el ciclo completo. Escribir, guardar, publicar, ver el badge cambiar, abrir borrador, ver que lo publicado no se movió.

## Paso 5. Archivos y video simulados (un día)

**Qué:** `imagen`, `video`, `archivo` y `objeto`. Los seis estados de subida simulados con temporizadores y `URL.createObjectURL`, con el aviso permanente sobre el control: `Prototipo: el archivo no se sube a ningún lado y se pierde al recargar.` Los estados de fallo se disparan con un botón de demostración para poder verlos.

**Qué se ve:** el flujo entero de cargar un PDF que el moderador descarga y de subir un video, sin infraestructura.

**Aquí termina el prototipo.** Punto de corte real: el usuario puede construir una experiencia completa, verla en las tres audiencias y publicarla, todo con datos simulados. Si algo del modelo está mal, se descubre aquí y corregir cuesta una tarde en vez de una migración.

## Paso 6. El esquema real (dos días)

**Qué:** migración `20260808_personalab_contenido.sql` completa. Semilla de las cuatro experiencias, cinco capítulos, cinco moderadores y cinco corridas desde `dominio.ts`. RLS probada con tres usuarios de prueba: uno de equipo, un moderador, un miembro de foro.

## Paso 7. Buckets y subida real (dos días)

**Qué:** los dos buckets privados con sus límites. Las cuatro rutas de medios. La ruta firmada de lectura con el 404 y el registro de descargas. Sustituir la subida simulada.

## Paso 8. Conectar el almacén a Supabase (dos días)

**Qué:** los tipos no cambian; solo se cambia el adaptador dentro de `almacen.ts`. Autoguardado real con `rev` y 409 en conflicto. `abrir_borrador` y `publicar_version` por RPC.

## Diferido, con su razón

| Diferido | Razón |
|---|---|
| Arrastrar y soltar bloques | los botones de subir y bajar resuelven el caso. Cero dependencias hoy en el repositorio |
| Paso de revisión (`en_revision`) | el usuario no lo pidió. Las compuertas hacen el trabajo |
| Diff visual entre versiones | `raizId` ya lo permite. Nadie lo ha pedido |
| Subida reanudable TUS para video grande | levanta el techo de 200 MB a 2 GB. Proyecto propio |
| Bloque `audio` | no hay ni un caso hoy |
| Traducciones | entra como `bloques_traduccion (bloque_raiz_id, idioma, contenido)` sin tocar nada de lo de arriba |
| Autoría por el moderador | protege el diseño licenciado. Cuando llegue la petición, será un objeto `aviso de corrida`, no bloques |
| Marca de agua o DRM en PDF | `inline` no protege y no se va a fingir que sí |

---

# 7. Contradicciones que resolví

## 7.1 El chasis: barra lateral contra barra superior

**Diseño 1** mantenía `WorkspaceNav` de 218px teal. **Diseño 2** proponía eliminarlo y adoptar la barra horizontal. **Diseño 3** no tocaba el workspace.

**Resuelto a favor del Diseño 2.** Verifiqué con grep que `portal/components/AdminNav.tsx` no lo importa ningún archivo de `app/`: es código muerto. El chasis vivo de Trascendencia son once líneas horizontales (`portal/app/(admin)/layout.tsx:22-31`). Mientras PersonaLab tenga una columna oscura a la izquierda no se va a parecer, por mucho que se ajusten los grises de adentro. La silueta manda, y es el reclamo literal del usuario.

**Costo asumido y declarado:** se pierde la agrupación Catálogo, Operación, Después de `WorkspaceNav.tsx:10-31`, que es la mejor idea del prototipo. Se compensa bajando Kit al nivel de la experiencia, donde el modelo ya lo tiene.

## 7.2 El dialecto de estilo

**Diseño 1** decía 100 por ciento estilos en línea, por continuidad con `ui.tsx`. **Diseños 2 y 3** decían Tailwind.

**Resuelto a favor de Tailwind.** Tres razones. Primera: los estilos en línea no expresan media queries, y todo el lector depende de un punto de corte (620 contra 820, 17px contra 18px). Segunda: no expresan `hover` ni `focus`, y el editor es todo hover y focus. Tercera: Tailwind es el dialecto mayoritario del repositorio y `tailwind.config.ts:5` ya cubre `./app/**`, así que las clases funcionan dentro de `/prototipo` sin configuración.

**Costo asumido:** durante el paso 0 conviven dos dialectos dentro de `/prototipo/personalab`. Por eso el paso 0 repinta las nueve páginas de golpe en lugar de dejarlo para después: si no, el resultado neto es un dialecto más, no uno menos.

## 7.3 El formato de texto rico

**Diseño 1:** DocRico, JSON acotado con nodos y marcas, validado por función en Postgres. **Diseño 2:** markdown restringido, texto plano, renderer propio. **Diseño 3:** HTML acotado con lista blanca y `dangerouslySetInnerHTML`.

**Resuelto a favor del markdown restringido (Diseño 2).**

Contra DocRico: exige construir un editor estructurado sobre `contentEditable`, que es semanas de trabajo y bloquea todo lo demás. El usuario pidió iterar viendo. Un `textarea` con barra de herramientas y modo Leer se construye en horas y produce el mismo resultado publicado.

Contra HTML: `dangerouslySetInnerHTML` abre superficie de inyección y, más importante, impide que el mismo contenido se pinte en dos tonos. El renderer de markdown a nodos de React es lo que permite un solo componente con dos mapas de clase, y eso es lo que evita que pase lo que ya pasó con el contenido de acuerdos, implementado dos veces con divergencias silenciosas entre `acuerdos/[id]/page.tsx:67-94` y `firmar/[token]/page.tsx:152-172`.

**Lo que sí tomé de DocRico:** la disciplina de las diez capacidades cerradas y la prohibición de HTML crudo. Y la ruta de salida queda abierta: si algún día se quiere un editor WYSIWYG, el markdown se parsea a DocRico con el mismo parser que ya existe.

**Riesgo que hereda esta decisión:** si un autor pega texto con tablas o imágenes en línea desde otra herramienta, ve los caracteres crudos en la vista previa. La compuerta de publicación avisa, pero el momento de confusión existe.

## 7.4 El catálogo de bloques: 13 contra 7 contra 11

**Resuelto en 11.** Criterio: cada tipo tiene que tener un caso real en `dominio.ts` hoy, o ser exigido por el encargo del usuario. Lo demás se declara descartado con su razón.

- `titulo` y `separador` del Diseño 1 se absorben: `##` vive en el markdown, `pausa` es el único separador que la marca admite.
- `audio`, `llamado` y `kit_ref` del Diseño 1 se van: cero casos hoy. `kit_ref` se pliega dentro de `objeto` como `piezaKitId` opcional, que da lo mismo sin una FK obligatoria.
- `escritura` del Diseño 2 y `gesto` del Diseño 3 son el mismo bloque. Se queda `gesto`, que es la palabra del dominio (`dominio.ts:151`).
- `objeto`, `consigna`, `nota` y `pausa` del Diseño 3 entran completos: son los tres o cuatro tipos que ningún lector de cursos tiene y que este dominio sí exige.
- `destacado` del Diseño 1 y `aviso` del Diseño 2 son el mismo bloque. Se queda `aviso`.

## 7.5 El modo de color del lector

**Diseño 1:** oscuro teal `#071216` con acento terracota. **Diseño 2:** oscuro heredando el sistema del participante de Trascendencia, `#0C0C0C` con dorado `#C9A96E`. **Diseño 3:** claro, papel `#FAF8F4`.

**Resuelto a favor del Diseño 3, con el gesto profundo del Diseño 1 en los tres momentos de transición.**

Contra el Diseño 2: el dorado `#C9A96E` es la marca de Trascendencia, con 114 apariciones en ese producto. Copiarlo es pintar PersonaLab con la identidad de la otra línea.

Contra el Diseño 1: `#002B34` es un color oscuro, y sobre un fondo casi negro es invisible. La dominancia teal que `BRAND.md:83` le asigna a PersonaLab tendría que expresarse con un tinte claro inventado, es decir, la marca dejaría de dominar justo donde vive el producto.

A favor del claro: `BRAND.md:60` asigna al blanco el rol explícito de espacio y lectura, y `BRAND.md:68` define `--paper` como blanco cálido para grandes lienzos claros. Y el único patrón de lectura sostenida bien resuelto del portal ya es claro: `acuerdos/[id]/page.tsx:36-47` y `firmar/[token]/page.tsx:115-123` abandonan el negro para leer.

La contradicción aparente con `BRAND.md:72`, que pide fondos profundos con tipografía clara, se resuelve porque esa regla gobierna el estilo de la marca, no la ergonomía de un texto de 1200 palabras leído en un teléfono a las once de la noche. Se cumple exactamente donde no hay que leer párrafos: portada, cambio de tiempo y cierre en `#001A21`.

## 7.6 Dónde vive el estado del editor

**Diseño 1:** `localStorage` con `useSyncExternalStore`. **Diseño 2:** servidor, y descarta `localStorage` citando el defecto de `OperacionClient.tsx:512-518`.

**Resuelto: los dos, cada uno en su sitio.** El prototipo no tiene servidor porque está fuera del gate de sesión a propósito (`portal/middleware.ts:14`, verificado), así que `localStorage` es la única forma de demostrar autoguardado y reanudar tras recargar, que es justo lo que hay que enseñar. En producción, servidor. La objeción del Diseño 2 era sobre leer `localStorage` durante el render, y eso se evita explícitamente: la lectura va solo dentro de `useEffect`.

## 7.7 Paso de revisión

**Diseño 1** proponía un estado `en_revision` que congela el contenido, con separación de roles autor y editor, y afirmaba que el usuario lo pidió. **Diseños 2 y 3** no lo contemplaban.

**Resuelto: se corta de v1.** El usuario dijo `una vez este terminado se pueda publicar`. No hay ninguna mención a un flujo de aprobación. Un estado de revisión con dos roles, en un equipo donde `Lucía Ferrer` es hoy la única persona de PersonaLab (`WorkspaceNav.tsx:116-117`), es un trámite consigo misma.

**Lo que sí tomé:** las compuertas de publicación como función única que alimenta el botón, la pantalla y la operación de publicar. Eso hace el trabajo real que un revisor haría. El estado `en_revision` cabe después entre borrador y publicada sin cambiar nada más.

## 7.8 Validación del jsonb en CHECK constraints

**Diseño 1** ponía `bloque_valido()` y `doc_rico_valido()` dentro de CHECK constraints, y en sus propios riesgos anotaba que cambiar la función no revalida las filas viejas y que `pg_dump` queda sensible al orden.

**Resuelto: solo cuatro CHECK, los que son reglas de dominio.** Nota interna nunca al participante, descarga solo profesional, objeto sin URL, medio obligatorio. La forma del jsonb se valida en el borde de la API y en `revisar_publicacion`.

Criterio: un CHECK que llama a plpgsql es una promesa que no se cumple del todo, y la deuda que introduce es peor que el problema que resuelve. Los cuatro que se quedan son comparaciones de texto simples que Postgres evalúa sin función y que no van a cambiar nunca, porque son reglas de la metodología.

## 7.9 Contenedor y anchos

**Diseño 2** proponía `max-w-7xl mx-auto` único para todo el workspace. **Diseño 1** no lo tocaba. **Diseño 3** proponía 620 y 820 para el lector.

**Los dos, sin conflicto.** El workspace usa `px-8 pt-6 pb-12 max-w-7xl mx-auto` en todas sus páginas, lo que corrige de paso la incoherencia más visible del admin: cuatro disciplinas de contenedor conviviendo (`max-w-2xl mx-auto` en dashboard, `max-w-4xl` sin centrar en usuarios, `max-w-7xl` sin centrar en detalle de evento, sin límite en el kanban). El lector usa su rejilla de tres anchos.

## 7.10 La medida de línea del lector

**Diseño 1** proponía 640px a 17px. **Diseño 3** proponía 620px a 18px. **Diseño 2** heredaba `max-w-lg` a 15px.

**Resuelto en 620px a 18px (Diseño 3).** 620 a 18 da 68 caracteres; 640 a 17 da unos 74. Los dos están dentro de la banda buena, pero 18px es mejor para lectura sostenida en escritorio y `620` deja la imagen `ancho` a 820 sin que la diferencia sea aparatosa. La versión del Diseño 2 se descarta porque `max-w-lg` a `text-sm` es lo que hace hoy Trascendencia, y es exactamente la parte que hay que corregir.

---

## Riesgos que quedan abiertos, sin resolver

1. **Los tokens neutros de la marca están definidos tres veces con valores distintos y nadie ha decidido cuál manda.** `BRAND.md:58-69` dice ink `#14181B`, gray `#6F7777`, paper `#FAF8F4`, line `#E7E1D8`. `assets/brand.css:14` dice ink `#171310`, gray `#7A736B`, paper `#F6EEE3`, line `#E2D5C4`. El prototipo sigue a `BRAND.md` en los tres primeros pero inventa line `#E5DED4` y divisor `#EFE9E0`. Especifiqué sobre la versión del prototipo más mis correcciones de contraste. **Si alguien decide después que manda `brand.css`, el papel cambia de `#FAF8F4` a `#F6EEE3` y todos los contrastes hay que recalcularlos.** Esto se decide antes de escribir el lector, no después.

2. **Los contrastes los calculé a mano con la fórmula WCAG, no con herramienta ni sobre el render real.** Los cinco valores clave son 16.83:1 para `#14181B`, 14.19:1 para `#002B34`, 4.91:1 para `#676E6E`, 5.69:1 para `#8F5341`, y los tres reprobados 4.24:1 (`#6F7777`), 3.50:1 (`#B9735A`) y 2.545:1 (`#A69C90`). La dirección es correcta con seguridad; el segundo decimal no lo garantizo.

3. **El peso 200 no es seguro fuera de Apple.** El stack resuelve a Helvetica Neue UltraLight en iOS y macOS, pero en Android Chrome `BlinkMacSystemFont` resuelve a Roboto y el peso 200 se colapsa al 300. Como el mercado es México, Colombia y El Salvador y la lectura pasa en el teléfono, la mayoría va a ver los titulares en Roboto Light. No lo probé en dispositivo.

4. **El techo real de subida a Supabase Storage no lo verifiqué.** No hay ni una llamada a Storage en el repositorio (grep de `.storage` y `upload(` sobre `app`, `lib` y `components`: cero resultados), así que no hay precedente del que leer la configuración. Los 25 MB y 200 MB son decisiones de configuración, no hechos medidos. Confirmarlos en los ajustes del proyecto antes de escribirlos en la interfaz.

5. **La experiencia mejor trabajada del catálogo es la que no tiene lector de participante.** `Metamorfosis y Metanoia` tiene 10 bisagras y `abreEspacioAlForo: false` (`dominio.ts:139`). Las dos que sí abren espacio son `El Presente como Regalo`, con 5 bisagras (`dominio.ts:171`), y `El Nido Vacío`, con cero (`dominio.ts:193`). Consecuencia práctica: la exigencia de que el participante vea el contenido con una experiencia excelente solo se puede demostrar hoy sobre `El Presente como Regalo`. Conviene decidir con el usuario si Metamorfosis va a abrir espacio.

6. **La rejilla `lab-columna` depende de que todo hijo directo sea un bloque del catálogo.** En cuanto alguien envuelva dos bloques en un `div` para agruparlos, el hijo pierde su asignación de columna y el sangrado deja de funcionar en silencio, sin error. Necesita un comentario en el código.

7. **El bloque `gesto` es el punto donde la prohibición de campos es más fácil de violar sin darse cuenta.** En cuanto exista la tabla `gestos` con una fila por participante y por mes, alguien va a querer contar filas y mostrar el conteo. La disciplina se sostiene en la revisión de código, no en el diseño.

8. **El copy de los tres momentos de transición y de los tres cierres lo escribí yo**, siguiendo el tono de `BRAND.md:19-23` y el registro de `dominio.ts`. No lo validó Francisco ni Renata. Son las frases más visibles de toda la experiencia y las que más fácil suenan a manual de coaching si se traducen mal.

9. **El paso 0 no produce ninguna función nueva.** El usuario podría percibirlo como retroceso. Pero sin él, el editor se va a ver como Trascendencia mientras la página de la que se llega sigue viéndose teal, y eso es peor que no hacer nada.

10. **El refactor de proyección de la sección 3.9 toca `dominio.ts`,** del que dependen cinco archivos con dieciocho puntos de uso de `.bisagras` y `.kit`, todos enumerados con línea. Es el único punto del plan donde algo que hoy funciona puede romperse. Commit propio y verificación de las cinco páginas antes de seguir.