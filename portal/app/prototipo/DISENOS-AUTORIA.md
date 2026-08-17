# Disenos completos: modelo, editor y lectura



---

## El lector del participante hereda del lado participante de Trascendencia solo el chasis (lienzo profundo, columna única,

- **El lienzo del lector es teal profundo #002B34, no el negro #0C0C0C que usa hoy el lado participante (portal/app/(participant)/layout.tsx:35).**: BRAND.md línea 55 declara el Verde Petróleo #002B34 como color rector y fondos profundos, y las líneas 82 y 83 asignan la dominancia teal a PersonaLab contra la dominancia vino de Trascendencia. Si PersonaLab hereda el negro, las dos marcas se ven igual y la casa de marca deja de leerse. El teal ya está en el código del prototipo: dominio.ts:17 y WorkspaceNav.tsx:41.
- **Muere el dorado #C9A96E y muere Cormorant Garamond. El acento es terracota y la tipografía es 100 por ciento sans.**: BRAND.md línea 100 dice literalmente que la decisión de la web es tipografía 100 por ciento sans serif y que se descartó Cormorant. El dorado #C9A96E no aparece en ninguna fila de la paleta oficial (BRAND.md líneas 55 a 70) y Renata ya lo registró como fuera de paleta en su memoria (Renata.md línea 93). Cormorant además se descarga en cada página (app/layout.tsx:6-12, cuatro pesos más itálicas) para usarse en dos componentes.
- **La terracota se parte en tres tokens por superficie: #B9735A solo como marca no textual (rieles de 2px, puntos, botón de fondo), #CFA48F para texto sobre teal, #8F5341 para texto sobre papel.**: Medí el contraste. #B9735A sobre #002B34 da 4.06:1, por debajo del mínimo 4.5:1 de WCAG AA para texto normal, así que la terracota de marca no puede ser color de texto sobre el lienzo. #CFA48F (el token --terra-2 de BRAND.md línea 67) da 6.71:1 y pasa. Sobre papel #FAF8F4, #B9735A da 3.50:1 y también falla, mientras #8F5341 da 5.69:1 y pasa; ese #8F5341 ya está en el prototipo (ui.tsx:67, 218, 234).
- **El cuerpo sobre teal va en peso 400, no en el 300 que manda BRAND.md línea 116.**: El 300 de BRAND.md está escrito para el sitio de marketing, que es papel #FAF8F4 con tinta oscura. En tipografía invertida el trazo se adelgaza ópticamente, y a 17px sobre un fondo de luminancia 0.02 el peso 300 pierde cuerpo. Es compensación óptica estándar, no capricho. Sobre papel el cuerpo sí va en 300, como manda la marca. Los tamaños de 22px para arriba sí van en 300 sobre teal, porque a esa escala el trazo aguanta.
- **El peso más ligero de display es 300, no 200, aunque BRAND.md línea 113 pida 200 a 300.**: BRAND.md línea 106 fija el stack de sistema Helvetica Neue y la línea 110 prohíbe cargar fuentes externas. Helvetica Neue tiene Thin real (200) en macOS e iOS, pero fuera de Apple el stack cae a Arial y Roboto, donde el peso 200 no existe y el navegador lo redondea a 100 o a 300. El mismo titular se vería distinto según el teléfono. La ligereza se consigue con escala (hasta 56px), tracking -0.02em y leading 1.03, que es exactamente lo que BRAND.md línea 97 pide: jerarquía por escala y aire, no por peso.
- **El campo `soporte` de la bisagra (dominio.ts:49, valores sala, objeto, pantalla) decide qué clase de pantalla se dibuja. Solo `pantalla` es una página de lectura.**: Está escrito en el propio dominio: SOPORTE_NOTA en dominio.ts:33-37 dice que sala ocurre entre personas y el software no entra, y que objeto es pieza física que el software administra pero no entrega. Si el lector renderiza las tres igual, la pantalla se apropia de lo que pasa en la sala, que es justo lo que Renata.md línea 100 prohíbe. Una bisagra de sala se dibuja como pantalla de cierre a 60svh que dice que ahí no hay nada que leer.
- **La posición se dice con un nombre, nunca con un número ni con una barra. El mapa se llama El recorrido y marca la bisagra actual con un riel terracota de 2px y la frase Aquí vas.**: Los campos progress, completion_pct, score, streak, badge, rank y quiz están prohibidos por el léxico vinculante (dominio.ts:10-11, data.ts:9). Un contador tipo 3 de 10 es completion_pct disfrazado de texto. Un riel que solo marca la posición actual, sin llenar las anteriores, comunica dónde estás sin comunicar acumulación. El patrón de riel ya existe en el prototipo: WorkspaceNav.tsx:103 usa borderLeft de 2px en #B9735A para el activo.
- **Una bisagra se abre por fecha o por la mano del moderador. Nunca por lo que hizo el participante.**: El desbloqueo secuencial de Trascendencia (mi-retiro/page.tsx:317-395, con opacity-60 y pointer-events-none) condiciona el paso siguiente a haber terminado el anterior, que es progreso con otro nombre. En PersonaLab la Víspera se abre por calendario y la Ignición la abre el moderador el día de la corrida, que es lo que ya modela el prototipo con `activo` y con el estado de la corrida.
- **El moderador ve exactamente la misma página que el participante, con una capa encima. No hay documento paralelo ni ruta de moderador.**: Dos documentos se desincronizan. El repositorio ya tiene la prueba: el mismo contenido de acuerdo está implementado dos veces, en acuerdos/[id]/page.tsx:67-94 y firmar/[token]/page.tsx:152-172, y ya divergieron en color de cuerpo, numeración de artículos y estilo de las líneas de firma. La capa del moderador son bloques con audiencia solo_moderador, más una banda superior de 40px y un enlace Ver como participante que es un query param, no un estado guardado.
- **El cuerpo va a 17px en teléfono y 18px en escritorio, con interlineado 1.75 y 1.7, dentro de una columna de 576px. El shell de la página es de 736px para que imagen, video y cita puedan salirse de la columna de texto.**: El lado participante actual lee a text-sm (14px) dentro de max-w-lg (512px), y esa es la única presentación de texto largo que existe en todo el portal (info/page.tsx:152, programa/page.tsx:252, avisos/page.tsx:80). Catorce píxeles es tamaño de metadato, no de lectura sostenida. A 18px en 576px la medida cae en 64 caracteres, dentro del rango de 60 a 70 que es donde el ojo no se pierde de renglón.
- **El lector no lleva barra inferior de navegación. Todo el cromo es una barra superior pegajosa de 52px.**: ParticipantNav.tsx:54-82 monta cinco destinos fijos en 64px más el safe area, y el layout reserva pb-24 (96px) por ella. Eso es correcto para un portal de trámites y es ruido en una pantalla de lectura. El precedente correcto ya existe en el propio repositorio: la vista de documento de acuerdos/[id]/page.tsx:36 quita la navegación y deja un solo enlace de vuelta. Un valor de marca es sin prisa (BRAND.md línea 23) y cinco destinos permanentes contradicen eso.
- **El final de la experiencia no entrega nada descargable ni dice completado. Dice quién entrega el testimonio, en qué fecha y en persona.**: Renata.md línea 57 fija que el libro se recibe, no se descarga, y la línea 100 del mismo archivo registra que el testimonio lleva delivered_by humano. Una pantalla de certificado descargable convertiría el cierre ritual en un trámite y activaría de hecho el concepto de badge, que está prohibido.

# El lector del participante · PersonaLab

Especificación de cómo se ve una experiencia publicada. Todo lo que sigue está en píxeles, en clases de Tailwind 3.4.1 (la versión que declara `portal/package.json:26`) y con la ruta y línea del archivo del que sale cada herencia.

---

## 0. Regla de oro

La pantalla nunca es la experiencia. Es la víspera y el eco de la experiencia.

De ahí salen las tres reglas de forma que gobiernan todo el documento:

1. Si el `soporte` de la bisagra no es `pantalla`, no hay artículo que leer. Se dibuja una pantalla de cierre.
2. La posición se dice con un nombre, nunca con un número.
3. Lo que el moderador ve de más es una capa sobre la misma página, no otra página.

---

## 1. Dirección visual: qué se hereda de Trascendencia y qué se rompe

| Pieza | Trascendencia (archivo y línea) | PersonaLab | Por qué |
|---|---|---|---|
| Chasis | `(participant)/layout.tsx:35-40`: lienzo profundo, columna única, `mx-auto` | Se hereda la idea, cambia el color y el ancho | El chasis funciona |
| Lienzo | `#0C0C0C` | `#002B34` teal | `BRAND.md:55` y `BRAND.md:83` |
| Superficie elevada | `#1A1A1A` editorial y `#181818` utilitaria, dos sistemas que nunca se unificaron | Una sola: `#0A3B45` (`--teal-2`, `BRAND.md:66`) | Un sistema de tarjeta, no dos |
| Acento | Dorado `#C9A96E`, 114 apariciones | Terracota en tres tokens por superficie | El dorado no está en la paleta oficial |
| Titulares | Cormorant Garamond light | Sans del sistema, peso 300 a gran escala | `BRAND.md:100` |
| Cuerpo | `text-sm` (14px) en `max-w-lg` (512px) | 17px teléfono / 18px escritorio en 576px | 14px es tamaño de metadato |
| Filete | `border-white/10` y `border-[#2A2A2A]` | `border-white/[0.12]` (`--line-dk`, `BRAND.md:70`) | Un solo filete |
| Navegación | Barra inferior fija de 5 destinos, 64px + safe area (`ParticipantNav.tsx:54-82`) | Sin barra inferior. Una barra superior de 52px | El lector es modo de atención |
| Modo documento | Hoja blanca sobre lienzo oscuro (`acuerdos/[id]/page.tsx:36-47`) | Se hereda tal cual, repintado a papel `#FAF8F4` sobre teal | Es lo mejor que hay en el repositorio |
| Estado vacío | Caja que explica cuándo aparecerá el contenido (`programa/page.tsx:234-239`) | Se hereda tal cual | Es el gesto que hace legible el contenido progresivo |
| Sello de disponibilidad | `text-white/20` (`programa/page.tsx:256`) | Se descarta. Mínimo `#8FB0B6` | Medí `white/20` sobre `#1A1A1A`: 1.90:1, contra el mínimo de 4.5:1 |
| Barra de progreso | `acuerdos/page.tsx:86-103` | Prohibida | Léxico vinculante |

### Lo que se hereda sin tocar

- El truco del punto del timeline: `border-2` en el color del lienzo para que la línea vertical parezca cortada (`programa/page.tsx:196`).
- El estado vacío en dos niveles: con llamada a la acción cuando está vacío de verdad, sin ella cuando el vacío lo causó un filtro (`FamiliasClient.tsx:167` contra `:177`).
- El `whitespace-pre-wrap` para respetar los saltos de línea del autor.
- La hoja clara sobre lienzo oscuro como cambio de modo de lectura.

---

## 2. Tokens

### 2.1 Extensión de `portal/tailwind.config.ts`

Hoy el archivo solo extiende `background` y `foreground` apuntando a variables CSS que `globals.css` nunca define (`tailwind.config.ts:10-15`). Sin esta extensión, el lector necesita más de cuarenta valores arbitrarios ilegibles.

```ts
// portal/tailwind.config.ts
theme: {
  extend: {
    colors: {
      teal:      '#002B34',   // lienzo
      'teal-2':  '#0A3B45',   // superficie elevada
      wine:      '#4C0F18',
      terra:     '#B9735A',   // marca, NUNCA texto sobre teal ni sobre papel
      'terra-2': '#CFA48F',   // terracota de texto sobre teal
      'terra-3': '#8F5341',   // terracota de texto sobre papel
      ink:       '#14181B',
      paper:     '#FAF8F4',
      lectura:   '#F2EFE9',   // cuerpo sobre teal
      'lectura-2': '#A8C3C8', // secundario sobre teal
      'lectura-3': '#8FB0B6', // terciario sobre teal
      gris:      '#6F7777',   // secundario sobre papel
      line:      '#E7E1D8',   // filete sobre papel
    },
  },
}
```

`#F2EFE9`, `#A8C3C8` y `#8FB0B6` no son invención: ya están en `portal/app/prototipo/personalab/WorkspaceNav.tsx:62`, `:101` y `:68`.

### 2.2 Color con contraste medido

Todos los cocientes calculados contra el lienzo `#002B34` (luminancia relativa 0.0197) con la fórmula WCAG 2.1.

| Token | Hex | Sobre teal | Uso | Veredicto |
|---|---|---|---|---|
| lectura | `#F2EFE9` | 13.1:1 | Cuerpo, titulares | AAA |
| lectura-2 | `#A8C3C8` | 8.11:1 | Subtítulo, cuerpo secundario | AAA |
| lectura-3 | `#8FB0B6` | 6.49:1 | Pies de foto, metadatos, razón de cierre | AA en todo tamaño |
| terra-2 | `#CFA48F` | 6.71:1 | Eyebrows, enlaces, autoría de cita | AA en todo tamaño |
| terra | `#B9735A` | 4.06:1 | **Solo no textual**: rieles de 2px, puntos, fondo de botón | Falla AA como texto |
| teal-2 | `#0A3B45` | 1.24:1 contra el lienzo | Superficie elevada | Correcto para superficie |

Sobre papel `#FAF8F4` (luminancia 0.9404):

| Token | Hex | Sobre papel | Uso |
|---|---|---|---|
| ink | `#14181B` | 12.4:1 | Cuerpo del documento |
| gris | `#6F7777` | 3.7:1 | Solo metadatos de 13px para arriba, nunca cuerpo |
| terra-3 | `#8F5341` | 5.69:1 | Eyebrow del documento |
| terra | `#B9735A` | 3.50:1 | Falla. No usar como texto sobre papel |

Texto sobre el botón de terracota: `#14181B` da 4.81:1 y pasa. `#002B34` da 4.06:1 y falla. El botón lleva tinta, no teal.

### 2.3 Tipografía

Familia única, la del sistema, declarada una sola vez en `portal/app/globals.css`:

```css
:root {
  --font-hn: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
}
html { -webkit-text-size-adjust: 100%; }
```

Se consume con `font-[family-name:var(--font-hn)]`, exactamente la misma sintaxis que ya usa `(participant)/layout.tsx:35`.

| Rol | Móvil | Escritorio | Peso | Leading | Tracking | Clase |
|---|---|---|---|---|---|---|
| Portada H1 | 34px | 56px | 300 | 1.03 | -0.02em | `text-[clamp(2.125rem,8.5vw,3.5rem)] font-light leading-[1.03] tracking-[-0.02em]` |
| Tiempo H2 | 26px | 34px | 300 | 1.1 | -0.01em | `text-[clamp(1.625rem,5vw,2.125rem)] font-light leading-[1.1] tracking-[-0.01em]` |
| Bisagra H1 | 28px | 40px | 300 | 1.15 | -0.015em | `text-[clamp(1.75rem,6vw,2.5rem)] font-light leading-[1.15] tracking-[-0.015em]` |
| Subtítulo H3 | 21px | 24px | 300 | 1.3 | -0.01em | `text-[1.3125rem] sm:text-[1.5rem] font-light leading-[1.3]` |
| Cita | 22px | 26px | 300 | 1.45 / 1.4 | -0.01em | `text-[1.375rem] sm:text-[1.625rem] font-light leading-[1.45] sm:leading-[1.4]` |
| Cuerpo sobre teal | 17px | 18px | **400** | 1.75 / 1.7 | 0 | `text-[1.0625rem] sm:text-[1.125rem] font-normal leading-[1.75] sm:leading-[1.7]` |
| Cuerpo sobre papel | 16px | 17px | 300 | 1.75 | 0 | `text-[1rem] sm:text-[1.0625rem] font-light leading-[1.75]` |
| Consigna | 19px | 21px | 400 | 1.55 | 0 | `text-[1.1875rem] sm:text-[1.3125rem] font-normal leading-[1.55]` |
| Pie de foto | 13px | 13px | 300 | 1.6 | 0 | `text-[0.8125rem] font-light leading-[1.6]` |
| Eyebrow | 11px | 11px | 500 | 1 | 0.3em | `text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em]` |
| Micro eyebrow | 10px | 10px | 500 | 1 | 0.28em | `text-[0.625rem] font-medium uppercase leading-none tracking-[0.28em]` |

Reglas duras de peso:

- **Sobre teal el cuerpo va en 400.** Es compensación óptica por tipografía invertida. Es una desviación deliberada de `BRAND.md:116`, que fue escrito para el sitio de marketing, que es papel.
- **Sobre teal, del 22px para arriba se vuelve a 300.** A esa escala el trazo aguanta.
- **Nunca por debajo de 300.** El 200 que pide `BRAND.md:113` solo existe en Helvetica Neue de Apple. Fuera de Apple el stack cae a Roboto y el navegador redondea a 100 o a 300.
- **Nunca 600 ni más en texto de lectura.** El 500 solo aparece en eyebrows de 10 y 11px, donde el tracking abierto se come el peso.

Números: `font-variant-numeric: tabular-nums` en toda fecha y toda duración, que en el repositorio actual solo se usa una vez (`eventos/[id]/page.tsx:164`).

### 2.4 Ritmo vertical

Escala de 8: 4, 8, 12, 16, 20, 24, 28, 32, 44, 56, 80, 96, 112, 128.

| Situación | Móvil | Escritorio | Clase |
|---|---|---|---|
| Entre bloques | 44px | 56px | `mt-11 sm:mt-14` |
| Antes de cita, imagen, video, consigna | 56px | 80px | `mt-14 sm:mt-20` |
| Entre párrafos de un mismo bloque | 24px | 28px | `space-y-6 sm:space-y-7` |
| Subtítulo al primer párrafo | 16px | 16px | `mb-4` |
| Bloque de respiro, arriba y abajo | 80px | 112px | `my-20 sm:my-28` |
| Antes del pie Sigue | 80px | 112px | `mt-20 sm:mt-28` |
| Antes del cierre de tiempo | 96px | 96px | `mt-24` |
| Base del artículo tras la barra | 32px | 56px | `pt-8 sm:pt-14` |
| Colchón inferior | 128px | 128px | `pb-32` |

### 2.5 Anchos

| Contenedor | Ancho | Clase |
|---|---|---|
| Columna de texto | 576px | `max-w-[36rem]` |
| Columna de cita | 544px | `max-w-[34rem]` |
| Shell del artículo | 736px | `max-w-[46rem]` |
| Gutter | 20px móvil / 32px escritorio | `px-5 sm:px-8` |

Medida resultante: 64 caracteres a 18px en escritorio, 40 caracteres a 17px en un teléfono de 375px. El segundo número es bajo y es el techo real de un teléfono; lo digo en vez de disimularlo.

### 2.6 Bordes, radios, foco

- Radio único: `rounded-[6px]`. Es el radio del prototipo (`ui.tsx:50`, `:97`). No hay `rounded-2xl`, no hay `rounded-full` salvo en el círculo de reproducción y en los puntos.
- Filete: `border-white/[0.12]` sobre teal, `border-[#E7E1D8]` sobre papel. Un solo grosor: 1px.
- Riel de marca: `border-l-2 border-[#B9735A]`. Es lo único que usa terracota plena.
- Foco, y esto no existe hoy en ninguna parte del portal: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#002B34]`. Todo elemento interactivo lo lleva.
- Sombras: ninguna. En un lienzo teal profundo la sombra no se ve y la elevación se comunica con `#0A3B45`.

---

## 3. Las cinco pantallas del lector

1. **El umbral**, una vez por experiencia y por persona.
2. **El recorrido**, el mapa.
3. **La bisagra de pantalla**, la página de lectura.
4. **La bisagra de sala o de objeto**, pantalla de cierre.
5. **El final**.

### 3.1 Shell

```tsx
// portal/app/prototipo/personalab/leer/[expId]/[bisagraId]/page.tsx
<div className="min-h-[100svh] overflow-x-clip bg-[#002B34] font-[family-name:var(--font-hn)] text-[#F2EFE9] antialiased">
  {esModerador && <BandaModerador expId={expId} />}
  <BarraLectura tiempo="Víspera" titulo="La carta de convocatoria" expId={expId} conBanda={esModerador} />
  <article className="mx-auto w-full max-w-[46rem] px-5 pb-32 pt-8 sm:px-8 sm:pt-14">
    <CabeceraBisagra ... />
    {bloques.map(b => <Bloque key={b.id} b={b} esModerador={esModerador} />)}
    <PieSigue siguiente={siguiente} />
  </article>
</div>
```

`min-h-[100svh]` y no `100vh`: en Safari de iOS la barra de URL colapsa y `100vh` provoca un salto de unos 60px. Tailwind 3.4 soporta la unidad. Hoy no se usa en ningún archivo del repositorio.

### 3.2 Barra de lectura, 52px

```tsx
<header className={`sticky z-40 h-[52px] border-b border-white/[0.12] bg-[#002B34]/[0.92] backdrop-blur-[6px] ${conBanda ? 'top-10' : 'top-0'}`}>
  <div className="mx-auto flex h-full max-w-[46rem] items-center gap-3 px-5 sm:px-8">
    <Link
      href={`/e/${expId}`}
      aria-label="Ir al recorrido"
      className="-ml-2.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[6px] text-[#A8C3C8] transition-colors hover:text-[#F2EFE9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>

    <button type="button" onClick={abrirMapa} className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F]">
      <span className="text-[0.625rem] font-medium uppercase leading-none tracking-[0.28em] text-[#CFA48F]">
        {tiempo}
      </span>
      <span className="w-full truncate text-[0.8125rem] font-normal leading-none text-[#A8C3C8]">
        {titulo}
      </span>
    </button>

    <span className="flex-shrink-0 text-[0.625rem] uppercase tracking-[0.22em] text-[#8FB0B6]">
      Recorrido
    </span>
  </div>
</header>
```

Corrige el hallazgo más grave del admin actual: la página de detalle de evento no tiene título en ninguna parte salvo un sub-nav truncado a 180px (`eventos/[id]/page.tsx:127`, `EventSubNav.tsx:54`). Aquí el título de la bisagra y el tiempo están siempre a la vista, y tocarlos abre el mapa.

Cromo total: 52px para el participante, 92px para el moderador.

---

## 4. Catálogo de bloques

### 4.0 Contrato de datos

```ts
// portal/app/prototipo/personalab/bloques.ts
export type Audiencia = 'todos' | 'solo_moderador'

export interface Base { id: string; orden: number; audiencia: Audiencia }

export type Bloque =
  | (Base & { tipo: 'texto';     subtitulo?: string; parrafos: string[]; lista?: string[] })
  | (Base & { tipo: 'cita';      texto: string; autor?: string })
  | (Base & { tipo: 'imagen';    url: string; alt: string; ancho: number; alto: number; pie?: string })
  | (Base & { tipo: 'video';     embedUrl: string; poster: string; titulo: string; duracion: string })
  | (Base & { tipo: 'archivo';   url: string; nombre: string; extension: string; peso: string; paginas?: number })
  | (Base & { tipo: 'consigna';  consigna: string; nota?: string })
  | (Base & { tipo: 'nota';      etiqueta: string; texto: string })
  | (Base & { tipo: 'documento'; titulo: string; tipoDoc: string; secciones: { encabezado?: string; cuerpo: string }[] })
  | (Base & { tipo: 'respiro' })
```

Nueve tipos. `audiencia` vive en el bloque, no en la bisagra, porque un mismo momento tiene capas para los dos.

Regla de despacho: si `audiencia === 'solo_moderador'` y el lector no es moderador, el bloque **no se renderiza y no deja hueco**. Nada de placeholders con candado.

### 4.1 `texto`

```tsx
<section className="mx-auto mt-11 w-full max-w-[36rem] sm:mt-14">
  {b.subtitulo && (
    <h3 className="mb-4 text-[1.3125rem] font-light leading-[1.3] tracking-[-0.01em] text-[#F2EFE9] sm:text-[1.5rem]">
      {b.subtitulo}
    </h3>
  )}

  <div className="space-y-6 sm:space-y-7">
    {b.parrafos.map((p, i) => (
      <p key={i} className="whitespace-pre-wrap text-[1.0625rem] font-normal leading-[1.75] text-[#F2EFE9] sm:text-[1.125rem] sm:leading-[1.7]">
        {p}
      </p>
    ))}
  </div>

  {b.lista && (
    <ul className="mt-7 space-y-3.5">
      {b.lista.map((li, i) => (
        <li key={i} className="relative pl-6 text-[1.0625rem] font-normal leading-[1.7] text-[#F2EFE9] sm:text-[1.125rem]">
          <span aria-hidden className="absolute left-0 top-[0.73em] h-1 w-1 rounded-full bg-[#B9735A]" />
          {li}
        </li>
      ))}
    </ul>
  )}
</section>
```

El `top-[0.73em]` centra un punto de 4px en la primera línea de un texto con leading 1.7: el centro de la caja de línea cae a 0.85em y la mitad del punto son 0.12em.

`parrafos` es un arreglo, no un `string` con saltos. El repositorio actual guarda texto largo como string plano y lo pinta con `whitespace-pre-wrap` (`info/page.tsx:152`), que es la razón de que no exista ningún control tipográfico. El `whitespace-pre-wrap` se conserva dentro del párrafo para saltos intencionales, pero el ritmo entre párrafos lo pone el `space-y`, no el autor.

### 4.2 `cita`

```tsx
<figure className="mx-auto mt-14 w-full max-w-[34rem] border-l-2 border-[#B9735A] pl-6 sm:mt-20 sm:pl-8">
  <blockquote className="text-[1.375rem] font-light leading-[1.45] tracking-[-0.01em] text-[#F2EFE9] sm:text-[1.625rem] sm:leading-[1.4]">
    {b.texto}
  </blockquote>
  {b.autor && (
    <figcaption className="mt-5 text-[0.8125rem] font-medium uppercase leading-none tracking-[0.16em] text-[#CFA48F]">
      {b.autor}
    </figcaption>
  )}
</figure>
```

Sin comillas tipográficas dibujadas y sin itálica. El riel de 2px hace todo el trabajo. La cita es más angosta que el texto (544 contra 576) para que se lea como respiro y no como continuación.

### 4.3 `imagen`

```tsx
<figure className="mx-auto mt-14 w-full max-w-[46rem] sm:mt-20">
  <div
    className="relative -mx-5 w-[calc(100%_+_2.5rem)] overflow-hidden bg-[#0A3B45] sm:mx-0 sm:w-full sm:rounded-[6px]"
    style={{ aspectRatio: `${b.ancho} / ${b.alto}` }}
  >
    <Image
      src={b.url}
      alt={b.alt}
      fill
      sizes="(max-width: 640px) 100vw, 736px"
      className="object-cover"
    />
  </div>
  {b.pie && (
    <figcaption className="mx-auto mt-4 max-w-[36rem] px-0 text-[0.8125rem] font-light leading-[1.6] text-[#8FB0B6]">
      {b.pie}
    </figcaption>
  )}
</figure>
```

Tres cosas nuevas para este repositorio:

- **Sangrado completo en teléfono.** `-mx-5 w-[calc(100%_+_2.5rem)]` anula el gutter de 20px y la imagen toca los dos bordes. Necesita `overflow-x-clip` en el shell.
- **`next/image`.** Hoy el lado participante tiene exactamente una etiqueta de imagen y es un `<img>` crudo con eslint desactivado (`equipo/page.tsx:66`). No existe ningún patrón de imagen dentro de texto: esto es código nuevo.
- **`alt` obligatorio.** Si el autor deja el `alt` vacío, la publicación se bloquea. Es la única validación de accesibilidad que exijo en la puerta.

La caja lleva `aspectRatio` con el alto y el ancho reales, no `aspect-video` fijo, para que no haya salto de layout mientras carga.

### 4.4 `video`

```tsx
'use client'
<figure className="mx-auto mt-14 w-full max-w-[46rem] sm:mt-20">
  <div className="relative -mx-5 aspect-video w-[calc(100%_+_2.5rem)] overflow-hidden bg-[#0A3B45] sm:mx-0 sm:w-full sm:rounded-[6px]">
    {!abierto ? (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="group absolute inset-0 h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#CFA48F]"
      >
        <Image src={b.poster} alt="" fill sizes="(max-width: 640px) 100vw, 736px" className="object-cover opacity-70 transition-opacity duration-200 group-hover:opacity-85 motion-reduce:transition-none" />
        <span aria-hidden className="absolute inset-0 bg-[#002B34]/40" />
        <span aria-hidden className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#CFA48F]/60 bg-[#002B34]/70 backdrop-blur-[2px]">
          <svg width="18" height="20" viewBox="0 0 18 20" fill="#CFA48F" aria-hidden="true"><path d="M17 10 0 20V0z" /></svg>
        </span>
        <span className="absolute bottom-4 left-5 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-[#F2EFE9]" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {b.duracion}
        </span>
        <span className="sr-only">Reproducir {b.titulo}</span>
      </button>
    ) : (
      <iframe
        src={`${b.embedUrl}?autoplay=1`}
        title={b.titulo}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    )}
  </div>
</figure>
```

El reproductor de terceros no se monta hasta el toque. En un teléfono con datos móviles eso ahorra entre 300KB y 900KB de JavaScript por bloque de video. La duración va visible antes de tocar, para que el participante decida con información.

Nunca `autoplay` sin toque. Nunca video de fondo.

### 4.5 `archivo`

```tsx
<a
  href={b.url}
  download
  className="mx-auto mt-11 flex w-full max-w-[36rem] items-center gap-4 rounded-[6px] border border-white/[0.14] bg-[#0A3B45] px-5 py-4 transition-colors hover:border-[#CFA48F]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#002B34] motion-reduce:transition-none sm:mt-14"
>
  <span aria-hidden className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[4px] border border-[#CFA48F]/35 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-[#CFA48F]">
    {b.extension}
  </span>
  <span className="min-w-0 flex-1">
    <span className="block truncate text-[0.9375rem] font-normal leading-tight text-[#F2EFE9]">{b.nombre}</span>
    <span className="mt-1 block text-[0.75rem] font-light text-[#8FB0B6]" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {b.paginas ? `${b.paginas} páginas · ` : ''}{b.peso}
    </span>
  </span>
  <span aria-hidden className="flex-shrink-0 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#CFA48F]">
    Descargar
  </span>
</a>
```

Alto total 76px. Por defecto `audiencia: 'solo_moderador'`, que es lo que Francisco pidió textualmente: el PDF lo descarga el moderador. Un archivo con `audiencia: 'todos'` es la excepción y el autor tiene que elegirla a mano.

Peso y páginas siempre visibles antes de tocar. El repositorio hoy lista documentos en la peor página que tiene (`documentos/page.tsx`, estilos inline, tarjeta blanca dentro de layout oscuro, nombre del documento sin color declarado que hereda crema sobre blanco y queda invisible en la línea 67). Este bloque la reemplaza.

### 4.6 `consigna`

```tsx
<aside className="mx-auto mt-14 w-full max-w-[36rem] border-y border-[#B9735A]/35 py-8 sm:mt-20 sm:py-10">
  <p className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[#CFA48F]">
    Para escribir a mano
  </p>
  <p className="mt-5 text-[1.1875rem] font-normal leading-[1.55] text-[#F2EFE9] sm:text-[1.3125rem]">
    {b.consigna}
  </p>
  {b.nota && (
    <p className="mt-4 text-[0.875rem] font-light leading-[1.7] text-[#8FB0B6]">{b.nota}</p>
  )}
</aside>
```

**No lleva campo de texto.** El bloque presenta la consigna y se calla. La regla universal heredada es escritura a mano sobre lo digital (`Renata.md:22` y `:100`), y el objeto de la Víspera es la libreta, no el formulario.

La única excepción es el Retorno, donde Renata diseñó dos cuerpos intercambiables, libreta física y PWA (`Renata.md:58`). Esa superficie de escritura pertenece a la especificación del Retorno, no a esta. Aquí solo dejo la frontera dicha.

### 4.7 `nota`

```tsx
<aside className="mx-auto mt-11 w-full max-w-[36rem] rounded-[6px] bg-[#0A3B45] px-5 py-5 sm:mt-14 sm:px-6 sm:py-6">
  <p className="text-[0.625rem] font-medium uppercase leading-none tracking-[0.28em] text-[#CFA48F]">
    {b.etiqueta}
  </p>
  <p className="mt-4 text-[0.9375rem] font-normal leading-[1.7] text-[#A8C3C8] sm:text-[1rem]">
    {b.texto}
  </p>
</aside>
```

Una sola variante. No hay nota roja, ámbar y azul. El repositorio actual tiene tres mapas de color por tipo que además se contradicen entre pantallas (`ItinerarioClient.tsx:36-46`, `ItinerarioList.tsx:30-40`, `OperacionClient.tsx:59-69`). La etiqueta lleva la semántica; el color no.

### 4.8 `documento`

Único cambio de modo del lector. Es la hoja clara sobre lienzo oscuro de `acuerdos/[id]/page.tsx:36-47`, repintada a papel.

```tsx
<article className="-mx-5 mt-14 bg-[#FAF8F4] px-6 py-10 sm:-mx-8 sm:mt-20 sm:rounded-[6px] sm:px-12 sm:py-14">
  <header className="border-b border-[#E7E1D8] pb-7">
    <p className="text-[0.625rem] font-medium uppercase leading-none tracking-[0.3em] text-[#8F5341]">
      {b.tipoDoc}
    </p>
    <h2 className="mt-4 text-[1.5rem] font-light leading-[1.25] tracking-[-0.01em] text-[#14181B] sm:text-[1.75rem]">
      {b.titulo}
    </h2>
  </header>

  <div className="mt-8 space-y-7">
    {b.secciones.map((s, i) => (
      <section key={i}>
        {s.encabezado && (
          <h3 className="mb-2 text-[0.9375rem] font-medium leading-snug text-[#14181B]">
            {i + 1}. {s.encabezado}
          </h3>
        )}
        <p className="max-w-[34rem] whitespace-pre-wrap text-[1rem] font-light leading-[1.75] text-[#14181B] sm:text-[1.0625rem]">
          {s.cuerpo}
        </p>
      </section>
    ))}
  </div>
</article>
```

Toma la versión pública, que está mejor resuelta que la privada: artículos numerados con `{i + 1}` (`firmar/[token]/page.tsx:157`) y cabecera con más aire. La versión privada no numera y usa un cuerpo un tono más claro.

Cuidado heredado: el layout impone `text-[#F2EFE9]` a todo lo que cuelga de él. Este bloque tiene que declarar `text-[#14181B]` en cada nodo de texto o hereda crema sobre papel, que es exactamente el defecto vivo de `documentos/page.tsx:67`.

### 4.9 `respiro`

```tsx
<div aria-hidden className="mx-auto my-20 flex w-full max-w-[36rem] items-center justify-center sm:my-28">
  <span className="h-1 w-1 rounded-full bg-[#B9735A]" />
  <span className="mx-3 h-1 w-1 rounded-full bg-[#B9735A]/50" />
  <span className="h-1 w-1 rounded-full bg-[#B9735A]/25" />
</div>
```

Tres puntos que se desvanecen, 80px de aire arriba y abajo. Es la única ornamentación del lector y existe porque `BRAND.md:146` pide amplio y sereno, con espacio para respirar.

### 4.10 Envoltura del bloque de moderador

```tsx
<div className="mx-auto mt-11 w-full max-w-[36rem] border-l-2 border-[#B9735A] bg-[#0A3B45] py-5 pl-5 pr-5 sm:mt-14 sm:pl-6 sm:pr-6">
  <p className="text-[0.625rem] font-medium uppercase leading-none tracking-[0.28em] text-[#CFA48F]">
    Solo tú ves esto
  </p>
  <div className="mt-4 [&>*]:!mt-0 [&>*]:!max-w-none">{children}</div>
</div>
```

El `[&>*]:!mt-0` cancela el margen superior del bloque envuelto, que ya lo pone la envoltura, y el `!max-w-none` deja que el bloque llene el ancho del contenedor.

---

## 5. Navegación

### 5.1 El recorrido, el mapa

Ruta `/e/[expId]`. Es a la vez índice y respuesta a dónde estoy.

```tsx
<nav aria-label="El recorrido" className="mx-auto w-full max-w-[36rem] px-5 pb-32 pt-10 sm:px-8 sm:pt-14">
  <p className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[#CFA48F]">
    El recorrido
  </p>
  <h1 className="mt-6 text-[clamp(1.875rem,7vw,2.75rem)] font-light leading-[1.08] tracking-[-0.02em] text-[#F2EFE9]">
    {exp.nombre}
  </h1>

  {TIEMPOS.map(t => (
    <section key={t.id} className="mt-16 first:mt-14">
      <h2 className="text-[clamp(1.625rem,5vw,2.125rem)] font-light leading-[1.1] tracking-[-0.01em] text-[#F2EFE9]">
        {t.titulo}
      </h2>
      <p className="mt-3 max-w-[30rem] text-[0.875rem] font-light leading-[1.7] text-[#8FB0B6]">
        {t.resumen}
      </p>

      <ol className="mt-7">
        {t.bisagras.map(b => {
          const aqui = b.id === actual
          const cerrada = !b.abierta
          return (
            <li key={b.id}>
              <Link
                href={cerrada ? '#' : `/e/${exp.id}/${b.id}`}
                aria-current={aqui ? 'step' : undefined}
                aria-disabled={cerrada || undefined}
                tabIndex={cerrada ? -1 : undefined}
                className={[
                  'block border-l-2 py-4 pl-5 pr-1 transition-colors motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F]',
                  aqui ? 'border-[#B9735A] bg-white/[0.05]' : 'border-white/[0.10] hover:border-[#CFA48F]/50',
                  cerrada ? 'pointer-events-none opacity-60' : '',
                ].join(' ')}
              >
                <span className="flex items-baseline justify-between gap-4">
                  <span className="text-[1.0625rem] font-normal leading-snug text-[#F2EFE9]">
                    {b.titulo}
                  </span>
                  {aqui && (
                    <span className="flex-shrink-0 text-[0.625rem] font-medium uppercase tracking-[0.24em] text-[#CFA48F]">
                      Aquí vas
                    </span>
                  )}
                </span>
                <span className="mt-1.5 block text-[0.8125rem] font-light leading-[1.6] text-[#8FB0B6]">
                  {cerrada ? b.razonCerrada : LINEA_SOPORTE[b.soporte]}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  ))}
</nav>
```

```ts
const LINEA_SOPORTE = {
  pantalla: 'Para leer',
  sala:     'Ocurre en la sala',
  objeto:   'Se recibe en la mano',
}
```

Cinco cosas que hace este mapa:

1. **Dice dónde estás con una palabra**, no con una fracción. El riel de 2px en `#B9735A` es el mismo gesto de `WorkspaceNav.tsx:103`.
2. **No marca lo ya leído.** Ningún ítem anterior cambia de aspecto. Marcar los anteriores es una barra de progreso hecha de filas.
3. **Muestra lo cerrado en vez de esconderlo, con su razón**: "Se abre el 15 de agosto", "La abre Rodrigo el día de la corrida". Es el patrón de `programa/page.tsx:234-239`, que es lo mejor que tiene el portal para contenido progresivo.
4. **Anuncia el soporte antes de entrar.** El participante sabe si va a leer o si eso pasa en la sala antes de tocar.
5. **Alto de fila 72px**, muy por encima del mínimo táctil de 44px.

`opacity-60` para lo cerrado, no `opacity-45` ni `text-white/20`. Con 60 por ciento el contraste efectivo se queda alrededor de 5:1; el `white/20` que usa hoy el portal para el sello de disponibilidad mide 1.90:1 sobre `#1A1A1A`, es decir es texto que técnicamente no está ahí.

### 5.2 El mapa como hoja, en teléfono

Tocar el título de la barra abre la misma lista como hoja de abajo hacia arriba, el patrón de `HelpButton.tsx:63-71`, corregido:

```tsx
<div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm" onClick={cerrar}>
  <div
    role="dialog"
    aria-modal="true"
    aria-label="El recorrido"
    onClick={e => e.stopPropagation()}
    className="max-h-[85svh] overflow-y-auto rounded-t-[6px] border-t-2 border-[#B9735A] bg-[#002B34] px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6"
  >
    ...misma lista...
  </div>
</div>
```

Con lo que el modal actual no tiene: `role="dialog"`, `aria-modal`, cierre con Escape, bloqueo del scroll del cuerpo y trampa de foco. El modal de `ItinerarioClient.tsx:359-437` no tiene ninguna de las cinco.

### 5.3 Avanzar

```tsx
<footer className="mx-auto mt-20 w-full max-w-[36rem] sm:mt-28">
  <div aria-hidden className="h-px w-16 bg-[#B9735A]" />

  {siguiente ? (
    <Link href={`/e/${expId}/${siguiente.id}`} className="group mt-8 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#002B34]">
      <span className="block text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[#8FB0B6]">
        Sigue
      </span>
      <span className="mt-3 block text-[1.375rem] font-light leading-[1.35] text-[#F2EFE9] transition-colors group-hover:text-[#CFA48F] motion-reduce:transition-none sm:text-[1.5rem]">
        {siguiente.titulo}
      </span>
      <span className="mt-2 block text-[0.8125rem] font-light text-[#8FB0B6]">
        {LINEA_SOPORTE[siguiente.soporte]}
      </span>
    </Link>
  ) : (
    <CierreDeTiempo tiempo={tiempo} siguienteTiempo={siguienteTiempo} />
  )}
</footer>
```

Un solo destino, nombrado. No hay "Siguiente" genérico, no hay flechas de anterior y siguiente compitiendo. La única vuelta atrás es la barra superior, y siempre lleva al mapa.

### 5.4 Regla de apertura

Una bisagra se abre por **fecha** (`abre_at`) o por **la mano del moderador**. Jamás por lo que hizo el participante.

El desbloqueo secuencial de `mi-retiro/page.tsx:317-395`, donde el paso 2 está en `opacity-60 pointer-events-none` hasta terminar el paso 1, es progreso con otro nombre y no se hereda.

### 5.5 Marcador de lectura

Se guarda `ultima_bisagra_vista` por grant. Es un marcapáginas, no una métrica: nunca se agrega, nunca se convierte en fracción, nunca se muestra a nadie más que a su dueño, y su único efecto visible es que el mapa se abre con la fila correcta a la vista. El campo no se llama `hinges_completed` ni nada que se le parezca.

### 5.6 Tope de longitud

Una bisagra de `pantalla` no pasa de **8 bloques o unas 1.200 palabras**. Pasado eso, el autor tiene que partirla. Es lo que permite no tener indicador de scroll: una bisagra cabe en una sesión de lectura de tres a cinco minutos.

---

## 6. Moderador y participante en la misma experiencia

El acceso es del moderador, que compra para su foro. Algunas experiencias abren espacio individual a la gente del foro según `abreEspacioAlForo` (`dominio.ts:88`).

### 6.1 Banda de moderador, 40px

```tsx
<div className="sticky top-0 z-50 border-t-2 border-[#B9735A] bg-[#0A3B45]">
  <div className="mx-auto flex h-10 max-w-[46rem] items-center justify-between gap-3 px-5 sm:px-8">
    <span className="truncate text-[0.625rem] font-medium uppercase tracking-[0.24em] text-[#CFA48F]">
      Lo ves como moderador
    </span>
    <Link
      href={`?como=participante`}
      className="flex-shrink-0 text-[0.625rem] font-medium uppercase tracking-[0.18em] text-[#A8C3C8] underline-offset-4 transition-colors hover:text-[#F2EFE9] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F]"
    >
      Ver como participante
    </Link>
  </div>
</div>
```

Con `?como=participante` la banda cambia de texto a "Lo ves como lo ve tu foro" y el enlace pasa a "Volver a tu vista". Es un query param, no estado guardado: recargar devuelve la vista real.

### 6.2 Tabla de diferencias

| Cosa | Participante | Moderador |
|---|---|---|
| Banda superior de 40px | No existe | Sí, terracota |
| Cromo total | 52px | 92px |
| Bloques `solo_moderador` | No se renderizan, no dejan hueco | Envoltura con riel y "Solo tú ves esto" |
| Archivos del kit y guion | Invisibles | Descargables |
| `requiere[]` de la bisagra (`dominio.ts:50`) | Invisible | Lista al pie de la bisagra |
| `duracion` de la bisagra | Invisible | Visible en el mapa y en la cabecera |
| Bisagra de `sala` | Pantalla de cierre | Guion completo, modo sala |
| Bisagras aún cerradas para el foro | `opacity-60` más razón | Abiertas, con el rótulo "Tu foro aún no lo ve" |
| `notaDiseño` (`dominio.ts:94`) | Nunca | Nunca. Eso vive en el back office, no en el lector |
| Marca de titularidad | Nada | Una línea al pie del umbral: "El acceso es tuyo. La gente que convoques no necesita cuenta." |

El renglón de titularidad ya está escrito en el prototipo (`experiencia/[id]/page.tsx:231-234`) y se conserva casi literal.

### 6.3 Una sola fuente

La página es la misma. La capa del moderador es aditiva. No existe `/guion` ni `/moderador` como ruta paralela. La razón está en el propio repositorio: el contenido de acuerdo está implementado dos veces, en `acuerdos/[id]/page.tsx:67-94` y en `firmar/[token]/page.tsx:152-172`, y ya divergió en tres puntos sin que nadie lo decidiera.

---

## 7. Teléfono

Es donde va a pasar. Anchos de referencia: 375 (iPhone SE y mini), 390 (iPhone 14), 430 (Pro Max).

| Regla | Valor |
|---|---|
| Gutter | 20px (`px-5`), 32px a partir de 640 (`sm:px-8`) |
| Medida a 375px | 335px útiles a 17px, unos 40 caracteres |
| Alto de viewport | `min-h-[100svh]`, nunca `100vh` |
| Objetivo táctil mínimo | 44 × 44. Volver: 44×44. Fila del mapa: 72px. Archivo: 76px. Botón principal: 56px |
| Colchón inferior | `pb-32` (128px). Sin barra fija abajo, el colchón es lo que despega la última línea del indicador de inicio |
| Safe area | Solo en la hoja del mapa: `pb-[max(2.5rem,env(safe-area-inset-bottom))]` |
| Sangrado | Imagen y video sangran a los dos bordes con `-mx-5 w-[calc(100%_+_2.5rem)]`. El shell lleva `overflow-x-clip` o aparece scroll horizontal |
| Zoom de iOS | Ningún control con fuente menor a 16px. El lector casi no tiene controles, pero la regla aplica a la búsqueda del mapa si se agrega |
| Ajuste de texto | `-webkit-text-size-adjust: 100%` en `html`, o Safari en horizontal infla el cuerpo |
| Scroll horizontal | Prohibido en el cuerpo. La tabla no existe en el lector. Si algún día existe, va dentro de `overflow-x-auto` propio |
| Barras de scroll ocultas | Prohibido usar `scrollbar-hide` ni `scrollbar-none`. Ninguna de las dos existe: no son utilidades de Tailwind 3 y `tailwind.config.ts:17` declara `plugins: []`. Están vivas y muertas en `programa/page.tsx:137` y `EventSubNav.tsx:69` |
| Movimiento | Toda transición lleva `motion-reduce:transition-none`. Duración máxima 200ms |
| Imágenes | `sizes="(max-width: 640px) 100vw, 736px"` siempre |

### Presupuesto de la pantalla de 812px de alto

- Barra de lectura: 52px, el 6.4 por ciento.
- Texto visible en el primer pliegue: unas 21 líneas a 29.75px de interlineado.

Con la barra inferior de cinco destinos que hereda hoy el participante serían 52 + 64 + 34 de safe area, o sea 150px de cromo, el 18 por ciento del alto. Por eso el lector no la lleva.

---

## 8. Los cuatro momentos de transición

### 8.1 Entrar: el umbral

Se ve una vez por experiencia y por persona, la primera vez que entra. Ocupa la pantalla completa, sin barra, sin scroll obligado.

```tsx
<section className="flex min-h-[100svh] flex-col justify-between bg-[#002B34] px-6 pb-10 pt-16 sm:px-10 sm:pb-16 sm:pt-24">
  <div className="mx-auto flex w-full max-w-[36rem] flex-1 flex-col justify-center">
    <p className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[#CFA48F]">
      PersonaLab
    </p>

    <h1 className="mt-7 text-[clamp(2.125rem,8.5vw,3.5rem)] font-light leading-[1.03] tracking-[-0.02em] text-[#F2EFE9]">
      Metamorfosis y Metanoia
    </h1>

    <p className="mt-4 text-[1.0625rem] font-light leading-[1.5] text-[#A8C3C8] sm:text-[1.1875rem]">
      Cerrando círculos
    </p>

    <p className="mt-10 max-w-[26rem] text-[1.375rem] font-light leading-[1.35] text-[#CFA48F] sm:text-[1.625rem]">
      No estás roto, estás mudando.
    </p>

    <div aria-hidden className="mt-12 h-px w-16 bg-[#B9735A]" />

    <p className="mt-6 text-[0.875rem] font-light leading-[1.75] text-[#8FB0B6]">
      Te convocó Rodrigo Lemus.<br />
      Foro Anáhuac · 15 de agosto.
    </p>
  </div>

  <div className="mx-auto w-full max-w-[36rem]">
    <Link
      href={`/e/${expId}/${primera.id}`}
      className="flex h-14 w-full items-center justify-center rounded-[6px] bg-[#B9735A] text-[0.875rem] font-medium uppercase tracking-[0.18em] text-[#14181B] transition-colors hover:bg-[#CFA48F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#002B34] motion-reduce:transition-none"
    >
      Entrar
    </Link>
    <p className="mt-6 text-center text-[0.625rem] uppercase tracking-[0.28em] text-[#8FB0B6]">
      Una experiencia de 4 Meaning
    </p>
  </div>
</section>
```

Cuatro reglas de oficio que este umbral cumple, sacadas de `Renata.md:99`:

- **La casa se presenta como sello de aval al pie, no como marca en la puerta.** Arriba manda PersonaLab, abajo "Una experiencia de 4 Meaning", que es el sello literal de `BRAND.md:127`.
- **Puerta única.** El umbral no muestra catálogo. Con un solo acceso se atraviesa en segundos.
- **Nombra a quien invitó.** "Te convocó Rodrigo Lemus". La pertenencia concreta no se pierde dentro de la casa.
- **La narrativa antes que la logística.** La frase de la experiencia va a 22 o 26px en terracota, arriba de la fecha.

Tinta `#14181B` sobre el botón terracota, no teal. Medido: 4.81:1 contra 4.06:1.

### 8.2 Terminar una parte: el cierre de bisagra

No dice completado, no da una palomita, no suma nada. Un filete de 64px, y el nombre de lo que sigue. Está en 5.3.

Si la bisagra pertenece al Retorno, el filete se acompaña de un solo gesto de cierre, que escribe `occurred_at` y no un booleano `completado`. Renata sustituyó explícitamente el booleano por el timestamp (`Renata.md:100`).

### 8.3 Terminar un tiempo: el traspaso

Aquí la pantalla se apaga y entrega el turno a la sala. Es el momento más importante del lector.

```tsx
<section className="-mx-5 mt-24 bg-[#0A3B45] px-6 py-24 sm:-mx-8 sm:rounded-[6px] sm:px-14 sm:py-32">
  <p className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[#CFA48F]">
    Termina la Víspera
  </p>
  <p className="mt-8 max-w-[26rem] text-[1.5rem] font-light leading-[1.4] text-[#F2EFE9] sm:text-[1.875rem]">
    Lo que sigue ocurre en la sala. Nos vemos el 15 de agosto.
  </p>
  <p className="mt-7 max-w-[24rem] text-[0.9375rem] font-light leading-[1.7] text-[#8FB0B6]">
    No hace falta traer el teléfono. Trae el objeto y la libreta.
  </p>
</section>
```

96px de aire arriba, 96 y 128 de padding interno, superficie elevada y solo tres líneas. Es la pantalla más vacía del producto y así tiene que ser.

### 8.4 Bisagra que no es de pantalla

```tsx
<section className="mx-auto flex min-h-[60svh] w-full max-w-[34rem] flex-col justify-center px-5 py-20 text-center sm:px-8">
  <p className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[#CFA48F]">
    {tiempo}
  </p>
  <h1 className="mt-6 text-[clamp(1.75rem,6vw,2.5rem)] font-light leading-[1.15] tracking-[-0.015em] text-[#F2EFE9]">
    {bisagra.titulo}
  </h1>
  <p className="mx-auto mt-7 max-w-[24rem] text-[1rem] font-light leading-[1.75] text-[#A8C3C8] sm:text-[1.0625rem]">
    {CIERRE[bisagra.soporte]}
  </p>
</section>
```

```ts
const CIERRE = {
  sala:   'Esto ocurre entre personas, en la sala. No hay nada que leer aquí.',
  objeto: 'Esto se recibe en la mano. No se descarga.',
}
```

Sin llamada a la acción, sin enlace de "Sigue". Solo la barra superior para volver al mapa. La pantalla que dice que no le toca no puede invitar a seguir usándola.

Para el moderador, la misma bisagra de `sala` sí abre el guion, con `duracion` y `requiere[]`.

### 8.5 El final

```tsx
<section className="mx-auto flex min-h-[80svh] w-full max-w-[34rem] flex-col justify-center px-5 py-24 sm:px-8">
  <div aria-hidden className="h-px w-16 bg-[#B9735A]" />

  <h1 className="mt-10 text-[clamp(1.875rem,7vw,2.75rem)] font-light leading-[1.08] tracking-[-0.02em] text-[#F2EFE9]">
    Hasta aquí llega la pantalla.
  </h1>

  <p className="mt-8 text-[1.0625rem] font-normal leading-[1.75] text-[#A8C3C8] sm:text-[1.125rem]">
    Lo que hiciste no está aquí dentro. Está en la libreta que escribiste a mano y en lo que dijiste en voz alta frente a tu foro.
  </p>

  <p className="mt-6 text-[1.0625rem] font-normal leading-[1.75] text-[#A8C3C8] sm:text-[1.125rem]">
    Rodrigo Lemus te entrega tu testimonio en persona el 12 de febrero.
  </p>

  <Link
    href={`/e/${expId}`}
    className="mt-14 inline-flex w-fit items-center border-b border-[#CFA48F]/45 pb-1.5 text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-[#CFA48F] transition-colors hover:border-[#CFA48F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA48F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#002B34]"
  >
    Volver al recorrido
  </Link>
</section>
```

Sin certificado, sin descarga, sin resumen de lo recorrido, sin porcentaje. El testimonio lo entrega una persona, en una fecha, en la mano (`Renata.md:57` y `:100`).

---

## 9. Accesibilidad, lo que hoy no existe y aquí sí

| Regla | Estado actual del repositorio |
|---|---|
| Anillo de foco visible en todo interactivo | Hoy hay cuatro tratamientos distintos en cuatro archivos hermanos y en el lado participante solo cambia el color del borde |
| `aria-current="step"` en la fila actual del mapa | No existe concepto de posición |
| `role="dialog"`, `aria-modal`, Escape, trampa de foco, bloqueo de scroll en la hoja | El modal de `ItinerarioClient.tsx:359-437` no tiene ninguna de las cinco |
| `alt` obligatorio en imagen, validado en la publicación | No hay imágenes en contenido |
| Contraste mínimo 4.5:1 en todo texto | `white/20` en `programa/page.tsx:256` mide 1.90:1 |
| `motion-reduce:transition-none` | No aparece en ningún archivo |
| `lang="es"` | Ya está en `app/layout.tsx:35` |
| Encabezados en orden, un solo `h1` por pantalla | El detalle de evento no tiene `h1` |

---

## 10. Lo que el lector no hace, y es intencional

1. No tiene barra de progreso, porcentaje, racha, insignia, puntaje ni contador de "n de N".
2. No marca lo ya leído en el mapa.
3. No desbloquea por actividad del participante.
4. No pide correo, no pide cuenta a la gente del foro, no pide respuesta escrita en pantalla salvo en el Retorno.
5. No autorreproduce video ni audio.
6. No usa emoji. El repositorio mezcla emoji con SVG dibujado a mano en `programa/page.tsx:205`, `acuerdos/page.tsx:81` y `avisos/page.tsx:55`. Aquí todo icono es SVG en línea, `strokeWidth={1.5}`, `currentColor`.
7. No usa guion largo en ningún texto visible. Los rangos van con la palabra "a" o con punto medio. El repositorio actual lo tiene en `OperacionClient.tsx:262`, `NuevoItemForm.tsx:174` y `:176`, `info/page.tsx:142`, `mi-retiro/page.tsx:264` y `:279`, y en varias respuestas del FAQ.
8. No entrega nada al final.

---

## 11. Orden de construcción sugerido

1. Extender `tailwind.config.ts` con los tokens y declarar `--font-hn` en `globals.css`. Sin esto todo lo demás son cadenas ilegibles.
2. `bloques.ts` con el contrato de nueve tipos, compartido con el editor del autor.
3. El shell, la barra de 52px y el bloque `texto`. Con eso ya se puede leer.
4. `cita`, `nota`, `respiro`. Son puro CSS.
5. El mapa El recorrido y el pie Sigue. Aquí ya se puede navegar la experiencia completa.
6. `imagen` y `video`. Necesitan `next/image` y almacenamiento, es donde entra la infraestructura.
7. `archivo` y la capa de moderador con la banda y `?como=participante`.
8. Umbral, cierre de tiempo, bisagra de sala, final. Son las cuatro transiciones y se hacen juntas porque comparten la misma composición vertical centrada.
9. `documento`, portado desde `firmar/[token]/page.tsx:115-187`, que es la mejor de las dos versiones existentes.

---

## Especificación de la pantalla de autoría de PersonaLab, escrita entera en el lenguaje visual de Trascendencia (escala sl

- **El chasis es barra lateral oscura de 240px (bg-slate-900) más dos filas sticky de 56px y 48px sobre el contenido, es decir 104px de cromo horizontal, exactamente el mismo total que una página de evento de Trascendencia.**: No invento una barra lateral: reactivo la que el repo ya tiene en portal/components/AdminNav.tsx:53 (aside w-[240px] min-h-screen bg-[#111111] flex flex-col flex-shrink-0 border-r border-[#1F2937]), traducida de la escala gray a slate. PersonaLab tiene siete destinos agrupados en Catálogo, Operación y Después (WorkspaceNav.tsx:10-31); meterlos en una barra superior de dos links como AdminTopNav.tsx:43-50 los aplastaría. Las dos filas sticky replican el patrón de EventSubNav.tsx:41 y dejan el estado de guardado y el botón Publicar siempre visibles mientras el autor hace scroll.
- **Dos paneles: riel de índice de 264px sticky a la izquierda y lienzo de bloques a la derecha con max-w-3xl. Las propiedades de cada bloque viven dentro del bloque abierto, en una franja de Ajustes, no en un inspector fijo a la derecha.**: Trascendencia no tiene ningún inspector persistente en ninguna pantalla. Su unidad de edición es la tarjeta con campos de EditarEventoForm.tsx:142-143 y su patrón de detalle en sitio es el acordeón de fila de ItinerarioList.tsx:107-153, que además calcula hasDetails y deshabilita el toggle cuando no hay nada que expandir. Un inspector sería una cuarta región vertical que el sistema nunca ha tenido y que duplicaría el mismo formulario en otro sitio.
- **La vista previa sustituye al riel del índice cuando se abre, en vez de aparecer como tercera columna.**: Una sola regla de layout, sin ramificar por breakpoint. Cuando el autor está escribiendo necesita el índice; cuando está revisando cómo se ve, necesita el teléfono. Nunca las dos cosas a la vez. El marco de teléfono ya existe y mide 375px de ancho (portal/app/(admin)/eventos/[id]/preview/page.tsx:264), así que el panel necesita 390px, casi lo mismo que el riel más el gap.
- **Reordenar se hace con botones de subir y bajar más un selector Mover a, no con arrastrar y soltar.**: Verificado con grep sobre app y components: no hay ni un draggable, ni un onDragStart, ni dnd-kit, ni react-beautiful-dnd en el repositorio, y portal/package.json solo declara next, react, supabase, resend y web-push. Arrastrar sería la única interacción del producto sin equivalente de teclado y exigiría una dependencia nueva. Los botones funcionan igual en el riel y en el lienzo, con teclado y en tablet.
- **El editor de texto es un textarea con markdown restringido a diez capacidades (párrafo, salto duro, negrita, itálica, H2, H3, lista con viñetas, lista numerada, cita, enlace) y un renderer propio de unas cuarenta líneas, sin dangerouslySetInnerHTML.**: El lector del participante hoy tiene exactamente un tratamiento de texto largo: text-sm leading-relaxed whitespace-pre-wrap sobre un string plano (preview/page.tsx:78, programa/page.tsx:252, info/page.tsx:152). Cada capacidad extra del editor crea un caso de render que el lector no sabe pintar. Diez capacidades es lo mínimo para escribir de verdad y el máximo que el sistema visual puede absorber sin inventar tipografía nueva.
- **El guardado combina autoguardado a los 1200 ms de inactividad con un botón Guardar siempre visible y siempre clicable, más un chip de estado de cuatro estados en la barra sticky.**: El usuario pidió literalmente poder guardar el progreso, así que tiene que existir un botón que se pueda apretar. Deshabilitarlo cuando no hay cambios produce ansiedad, así que guarda igual y responde Todo guardado. El chip resuelve el hallazgo de que Trascendencia tiene cinco patrones distintos de guardado y uno de ellos, EditarEventoForm, no da ninguna confirmación al usuario.
- **Toda acción destructiva usa confirmación de dos pasos en línea: el botón se transforma en frase de consecuencia más Confirmar más Cancelar, y después de borrar el mismo hueco ofrece Deshacer durante diez segundos.**: Es el patrón de EventStatusButton.tsx:39-57 combinado con el de CheckInButton.tsx:65-91, que es el mejor mecanismo de feedback del repositorio: el control se convierte en su estado final en vez de lanzar un mensaje aparte. Evita el confirm() nativo de ChecklistClient.tsx:118 y DeleteItemButton.tsx:17, que rompe el lenguaje visual con un diálogo del sistema operativo.
- **Cada bloque lleva una propiedad de audiencia con tres valores: participante, moderador o ambos, expuesta como segmented control en la franja de Ajustes.**: El dominio lo exige. El PDF que se descarga lo descarga el moderador, no el participante (petición textual del usuario), y el moderador es un profesional que opera la experiencia, no un participante. Sin esta propiedad, el autor no tiene forma de subir un guion de sala sin exponerlo. También es lo que hace posible la vista previa de dos lentes.
- **Publicar pasa por una ruta propia de revisión, /experiencias/[id]/publicar, con bloqueos en rojo que impiden publicar y advertencias en ámbar que se pueden saltar, y crea una versión numerada. Las corridas ya iniciadas se quedan en la versión con la que arrancaron.**: Una experiencia publicada llega a moderadores que ya compraron acceso para su foro. Publicar a ciegas un tiempo sin bisagras o un video que falló al subir es un daño hacia afuera. La ruta propia permite mostrar además qué recibe el participante, que es lo que el autor no puede ver desde el editor.
- **El editor normaliza cuatro deudas del admin y no las hereda: un solo negro (bg-slate-900 con hover:bg-slate-700), un solo tratamiento de foco (focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent), un solo texto de carga (Guardando… con puntos suspensivos U+2026) y una sola opacidad de deshabilitado (disabled:opacity-60 disabled:cursor-not-allowed). Todo vive en un módulo tokens.ts que se importa.**: El admin tiene dos negros primarios conviviendo (bg-slate-900 y bg-[#111827] en eventos/page.tsx:54), cuatro tratamientos de foco en cuatro archivos hermanos, cuatro textos de carga distintos, tres opacidades de deshabilitado y cinco mapas de badge duplicados. Un producto que va a ser sobre todo formularios no puede nacer con esa dispersión.
- **El cuerpo de lectura del lector de PersonaLab sube de text-sm leading-relaxed a text-[15px] leading-[1.75], y el sello de disponibilidad sube de text-white/20 a text-[#6B7280].**: Hoy el participante lee 14px dentro de un contenedor max-w-lg, es decir una medida de línea de unos 512px. Para un párrafo de aviso eso está bien; para una experiencia escrita de varios miles de caracteres es texto pequeño. El text-white/20 del sello (programa/page.tsx:256) es el candidato más claro a fallar contraste en todo el portal.
- **Dentro del editor no hay teal (#002B34) ni terracota (#B9735A). El acento del estado activo es border-l-2 border-slate-900 y el color solo aparece en badges.**: El usuario ya vio dos versiones del prototipo y pidió específicamente que se parezca más a Trascendencia. El prototipo actual está pintado en teal y terracota con estilos inline (dominio.ts:17-19, ui.tsx, WorkspaceNav.tsx), que es justamente lo que lo hace verse de otro producto. Trascendencia no tiene color de acento: tiene slate y un negro.
- **Los controles de cada fila de bloque están siempre visibles en text-slate-400 y se oscurecen en hover, en vez de aparecer con opacity-0 group-hover:opacity-100.**: El patrón de revelar en hover de ChecklistClient.tsx:69 es invisible con teclado y no existe en pantallas táctiles. En una pantalla cuyo trabajo entero es manipular bloques, esconder los verbos es el error más caro.

# La pantalla de autoría de PersonaLab

Especificación de implementación. Lenguaje visual: el de Trascendencia, extraído del código real. Léxico: experiencia, tiempo (víspera, ignición, retorno), bisagra, bloque, participante, moderador, autor, capítulo, foro, grant.

Nota de escritura: en todo el copy visible de esta especificación no aparece el guion largo. Punto, coma o dos puntos.

---

## 0. Principio rector

Trascendencia es un panel operativo sobrio y denso: superficies blancas `rounded-xl` con `shadow-sm` sobre `bg-slate-50`, tipografía de dos tamaños (`text-xs` y `text-sm` cubren el 90 por ciento del admin), un solo negro para lo primario y color únicamente en badges. La autoría de PersonaLab se construye dentro de ese vocabulario, sin agregar ni una familia tipográfica, ni un radio, ni un acento.

Tres cosas se corrigen en vez de imitarse, y esas correcciones son parte de la especificación:

1. La página de detalle de evento no tiene título (`eventos/[id]/page.tsx:127` arranca con metadatos en `text-slate-400`). Aquí el nombre de la experiencia sí es un `h1`.
2. El admin tiene cuatro disciplinas de contenedor. Aquí hay una: `max-w-7xl mx-auto`.
3. El admin tiene cinco mapas de badge duplicados. Aquí hay un módulo `tokens.ts` que se importa.

---

## 1. Rutas y archivos

```
portal/app/prototipo/personalab/
  tokens.ts                                  ← clases compartidas, único lugar
  lector/                                    ← componentes del lado participante
    TarjetaLectura.tsx
    RenderMarkdown.tsx
    markdown.ts
  experiencias/[id]/
    ExperienciaHeader.tsx                    ← fila sticky 1, 56px
    ExperienciaSubNav.tsx                    ← fila sticky 2, 48px
    page.tsx                                 ← Ficha (existe, se repinta)
    editor/
      page.tsx
      EditorClient.tsx                       ← estado, autoguardado, atajos
      RielIndice.tsx
      TarjetaBisagra.tsx
      SelectorTipoBloque.tsx
      BloqueTexto.tsx
      BloqueArchivo.tsx                      ← PDF e imagen
      BloqueVideo.tsx
      BloqueAviso.tsx
      BloqueEscritura.tsx
      AjustesBloque.tsx
      EstadoGuardado.tsx
      PanelVistaPrevia.tsx
      ConfirmacionEnLinea.tsx
    vista-previa/page.tsx                    ← versión a pantalla completa
    publicar/page.tsx
    historial/page.tsx
```

`portal/app/globals.css` recibe una adición, porque `scrollbar-none` se usa en el admin pero no existe:

```css
.scrollbar-none { scrollbar-width: none; -ms-overflow-style: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
```

---

## 2. tokens.ts

```ts
// portal/app/prototipo/personalab/tokens.ts
// Un solo lugar. Trascendencia tiene cinco mapas de badge duplicados
// (EventSubNav.tsx:12, eventos/[id]/page.tsx:6, 28, 45 y 115). Aquí no se repite.

export const SUPERFICIE       = 'bg-white border border-slate-200 rounded-xl shadow-sm'
export const SUPERFICIE_PLANA = 'bg-white border border-slate-200 rounded-xl'
export const CABECERA_TARJETA = 'flex items-center justify-between px-4 py-3 border-b border-slate-100'

export const BTN_PRIMARIO   = 'px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
export const BTN_SECUNDARIO = 'px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap disabled:opacity-60'
export const BTN_FILA       = 'text-xs text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium whitespace-nowrap disabled:opacity-60'
export const BTN_PELIGRO    = 'text-xs text-red-700 border border-red-300 bg-white px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors font-medium whitespace-nowrap disabled:opacity-60'
export const BTN_DASHED     = 'flex items-center justify-center gap-2 w-full text-sm text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 hover:border-slate-400 px-4 py-2.5 rounded-xl transition-colors'
export const BTN_ICONO      = 'w-7 h-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400'

export const CAMPO          = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent'
export const CAMPO_FANTASMA = 'w-full bg-transparent border border-transparent rounded-lg px-2 py-1 hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder-slate-300'
export const ETIQUETA_CAMPO   = 'block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider'
export const ETIQUETA_SECCION = 'text-xs font-semibold text-slate-500 uppercase tracking-wider'

export const BADGE_ESTADO = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold'
export const BADGE_TIPO   = 'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold'

export const ESTADO_EXPERIENCIA = {
  borrador:  { etiqueta: 'Borrador',              cls: 'bg-slate-100 text-slate-600' },
  cambios:   { etiqueta: 'Cambios sin publicar',  cls: 'bg-amber-100 text-amber-700' },
  publicada: { etiqueta: 'Publicada',             cls: 'bg-emerald-100 text-emerald-700' },
  retirada:  { etiqueta: 'Retirada',              cls: 'bg-red-100 text-red-700' },
} as const

export const TIPO_BLOQUE = {
  texto:     { etiqueta: 'Texto',      cls: 'bg-slate-100 text-slate-600' },
  cita:      { etiqueta: 'Cita',       cls: 'bg-violet-100 text-violet-700' },
  imagen:    { etiqueta: 'Imagen',     cls: 'bg-sky-100 text-sky-700' },
  documento: { etiqueta: 'Documento',  cls: 'bg-amber-100 text-amber-700' },
  video:     { etiqueta: 'Video',      cls: 'bg-blue-100 text-blue-700' },
  aviso:     { etiqueta: 'Aviso',      cls: 'bg-red-100 text-red-700' },
  escritura: { etiqueta: 'Escritura',  cls: 'bg-emerald-100 text-emerald-700' },
} as const

export const TEXTO_GUARDANDO = 'Guardando…'   // U+2026, un solo carácter, siempre este
```

Regla de forma heredada del admin y que se respeta: `rounded-full` cuando el badge dice un estado, `rounded-md` cuando dice una taxonomía. La forma comunica si el dato es progreso o categoría.

Nota sobre el rojo: el admin escribe `text-red-500` para Cancelado (`EventSubNav.tsx:17`) mientras todos los demás badges usan el tono 700. Aquí se usa `text-red-700` siempre.

---

## 3. El chasis

### 3.1 Barra lateral del workspace, 240px

Se reactiva `portal/components/AdminNav.tsx:53`, que hoy es código muerto (ningún archivo lo importa), traducido de la escala gray a slate.

```tsx
<aside className="w-[240px] min-h-screen bg-slate-900 flex flex-col flex-shrink-0 border-r border-slate-800 fixed left-0 top-0 z-50">
  {/* Capa 4 Meaning */}
  <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-2">
    <Link href="/prototipo/organizador?u=d" className="block shrink-0">
      <Image src="/4m-logo-wht.png" alt="4 Meaning" width={110} height={16}
             className="h-3.5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
    </Link>
    <Link href="/dashboard"
          className="text-[10px] tracking-widest uppercase text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">
      Trascendencia →
    </Link>
  </div>

  {/* Marca del workspace */}
  <div className="px-5 py-5 border-b border-slate-800">
    <div className="text-sm font-semibold tracking-tight text-white">PersonaLab</div>
    <div className="text-xs text-slate-500 mt-1">Diseño de experiencias</div>
  </div>

  {/* Navegación agrupada */}
  <nav className="flex-1 py-3 overflow-y-auto">
    {GRUPOS.map(g => (
      <div key={g.titulo ?? 'raiz'} className="mb-3">
        {g.titulo && (
          <div className="px-5 pt-2.5 pb-1.5 text-[9px] font-semibold text-slate-600 uppercase tracking-widest">
            {g.titulo}
          </div>
        )}
        {g.items.map(it => (
          <Link key={it.href} href={it.href}
                className={[
                  'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors border-l-2',
                  activo(it)
                    ? 'text-white bg-white/5 border-white font-medium'
                    : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5',
                ].join(' ')}>
            {it.label}
          </Link>
        ))}
      </div>
    ))}
  </nav>

  <div className="px-5 py-3.5 border-t border-slate-800">
    <div className="text-xs text-slate-400">Lucía Ferrer</div>
    <div className="text-[10px] text-slate-500 mt-0.5">Autora</div>
  </div>
</aside>
```

Grupos: sin título (Resumen), Catálogo (Experiencias, Kit y fronteras), Operación (Corridas, Capítulos, Moderadores), Después (Retorno). Es la agrupación que ya existe en `WorkspaceNav.tsx:10-31` y que el admin muerto también tenía en `AdminNav.tsx:108-181`.

### 3.2 Fila sticky 1: encabezado de experiencia, 56px

Aquí vive lo que el detalle de evento de Trascendencia no tiene: un título de verdad. Y aquí viven, siempre visibles, el estado de guardado y el botón de publicar.

```tsx
<header className="sticky top-0 z-40 h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-3">
  <Link href="/prototipo/personalab/experiencias"
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap flex-shrink-0">
    ← Experiencias
  </Link>
  <span className="text-slate-200">|</span>

  <h1 className="text-sm font-semibold text-slate-900 truncate max-w-[280px] flex-shrink-0">
    {experiencia.nombre || 'Experiencia sin nombre'}
  </h1>
  <span className={`${BADGE_ESTADO} flex-shrink-0 ${ESTADO_EXPERIENCIA[estado].cls}`}>
    {ESTADO_EXPERIENCIA[estado].etiqueta}
  </span>

  <div className="flex-1" />

  <div className="flex items-center gap-3 flex-shrink-0">
    <EstadoGuardado estado={guardado} ultimoGuardadoAt={ultimoGuardadoAt} onGuardar={guardarAhora} />
    <span className="w-px h-5 bg-slate-100" />
    <button onClick={() => setVistaPrevia(v => !v)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              vistaPrevia
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}>
      Vista previa
    </button>
    <Link href={`/prototipo/personalab/experiencias/${id}/publicar`}
          title="Revisar y publicar. Los moderadores con acceso verán la versión nueva."
          className="text-xs font-medium px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-700 transition-colors whitespace-nowrap">
      Publicar
    </Link>
  </div>
</header>
```

El botón Publicar recibe el tratamiento de botón sólido dentro de una barra de navegación. Es el mismo gesto que Trascendencia le da a Operación en `EventSubNav.tsx:81`: el único item con jerarquía visual propia porque es el modo que importa.

Cada control lleva atributo `title` con una explicación en español. Es la única ayuda contextual del portal (`eventos/[id]/page.tsx:229, 235, 242-247`) y merece conservarse como convención.

### 3.3 Fila sticky 2: secciones de la experiencia, 48px

```tsx
<div className="sticky top-14 z-30 h-12 bg-white border-b border-slate-200 flex items-center px-6">
  <div className="relative flex-1 overflow-hidden">
    <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-10" />
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pr-8">
      {[
        { href: ``,             label: 'Ficha' },
        { href: `/editor`,      label: 'Editor' },
        { href: `/kit`,         label: 'Kit' },
        { href: `/accesos`,     label: 'Accesos' },
        { href: `/historial`,   label: 'Historial' },
      ].map(({ href, label }) => (
        <Link key={label} href={`/prototipo/personalab/experiencias/${id}${href}`}
              className={`text-xs px-3 py-1.5 rounded-md whitespace-nowrap flex-shrink-0 transition-colors ${
                activo
                  ? 'text-slate-900 font-semibold bg-slate-100 border-b-2 border-slate-900 -mb-px rounded-b-none'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}>
          {label}
        </Link>
      ))}
    </div>
  </div>
</div>
```

Corrección deliberada: en el admin el hover del link inactivo llega al mismo `bg-slate-100` que marca el activo, así que con el cursor encima los dos estados se ven casi iguales (`AdminTopNav.tsx:30-31`, `EventSubNav.tsx:85-86`). Aquí el hover baja a `bg-slate-50` y el activo suma subrayado de 2px.

Cromo total: 56 más 48 igual a 104px, exactamente lo mismo que una página de evento en Trascendencia.

---

## 4. Layout del editor

### 4.1 La decisión

Opciones evaluadas:

| Opción | Veredicto |
|---|---|
| Tres paneles: lista, lienzo, inspector | Descartada. A 1440px con la lateral de 240px el lienzo cae a 434px. Y el inspector es una cuarta región vertical que Trascendencia nunca ha tenido. |
| Una columna con edición en sitio | Descartada. Una experiencia tiene tres tiempos y hasta diez bisagras (ver `dominio.ts:143-154`). Sin índice el autor se pierde en el scroll. |
| Página de lista más página de edición por bloque | Descartada. Es lo que hace hoy el admin con Itinerario y obliga a navegar para cada campo. Rompe el flujo de escritura. |
| **Dos paneles: riel de índice más lienzo, propiedades dentro del bloque** | **Elegida.** |

Justificación: el patrón nativo de Trascendencia para ver el detalle de una fila sin salir de la lista es el acordeón de `ItinerarioList.tsx:107-153`, y su unidad de captura es la tarjeta con campos de `EditarEventoForm.tsx:142-143`. Un bloque abierto es exactamente eso: un acordeón que despliega una tarjeta con campos. No hace falta inventar un inspector.

Reparto de propiedades:

- **De la experiencia** (nombre, subtítulo, narrativa, duración, `abreEspacioAlForo`, nota de diseño): viven en Ficha, ruta aparte, igual que `eventos/[id]/editar`.
- **De la bisagra** (título, tiempo, orden, soporte, duración, requiere): cabecera de la tarjeta más su franja de Ajustes.
- **Del bloque** (audiencia, descargable, nota para el moderador): franja de Ajustes del bloque.

### 4.2 El grid

```tsx
<main className="pl-[240px] bg-slate-50 min-h-screen">
  <ExperienciaHeader ... />
  <ExperienciaSubNav ... />

  <div className="px-8 pt-6 pb-24 max-w-7xl mx-auto">
    <div className={`grid gap-6 items-start ${
      vistaPrevia
        ? 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_390px]'
        : 'grid-cols-1 lg:grid-cols-[264px_minmax(0,1fr)]'
    }`}>
      {!vistaPrevia && (
        <aside className="hidden lg:block sticky top-[120px]">
          <RielIndice ... />
        </aside>
      )}

      <div className="min-w-0 max-w-3xl space-y-6">
        {/* lienzo */}
      </div>

      {vistaPrevia && (
        <aside className="hidden lg:block sticky top-[120px]">
          <PanelVistaPrevia ... />
        </aside>
      )}
    </div>
  </div>
</main>
```

`top-[120px]` es 104 de cromo más 16 de aire. Debajo de `lg` el riel se convierte en un botón Índice que abre una hoja inferior, y la vista previa manda a la ruta `/vista-previa`.

Un solo contenedor, `max-w-7xl mx-auto`. El admin tiene cuatro disciplinas distintas conviviendo, y `max-w-7xl` sin `mx-auto` en `eventos/[id]/page.tsx:127` deja el contenido pegado a la izquierda en pantallas grandes. Aquí se centra.

---

## 5. El riel del índice

```tsx
<div className={SUPERFICIE + ' overflow-hidden'}>
  <div className={CABECERA_TARJETA}>
    <h2 className={ETIQUETA_SECCION}>Índice</h2>
    <span className="text-xs text-slate-400 tabular-nums">{listas} / {total}</span>
  </div>

  {(['vispera', 'ignicion', 'retorno'] as const).map(t => {
    const bs = bisagrasDe(t)
    return (
      <div key={t}>
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            {ETIQUETA_TIEMPO[t]}
          </span>
          <span className="text-[10px] text-slate-400 tabular-nums">{bs.length}</span>
        </div>

        {bs.length === 0 ? (
          <div className="px-4 py-4 text-center text-xs text-slate-400 border-b border-slate-100">
            Este tiempo no está diseñado.
          </div>
        ) : bs.map(b => (
          <button key={b.id} onClick={() => irA(b.id)}
                  className={[
                    'w-full text-left flex items-start gap-2 px-4 py-2.5 border-b border-slate-100 border-l-2 transition-colors',
                    b.id === activaId
                      ? 'bg-slate-100 border-l-slate-900'
                      : 'border-l-transparent hover:bg-slate-50',
                  ].join(' ')}>
            <span className="text-[10px] text-slate-400 tabular-nums mt-1 w-4 flex-shrink-0">
              {String(b.orden).padStart(2, '0')}
            </span>
            <span className="flex-1 min-w-0">
              <span className={`block text-sm truncate ${
                b.id === activaId ? 'text-slate-900 font-semibold' : 'text-slate-700'
              }`}>
                {b.titulo || 'Bisagra sin título'}
              </span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                {b.bloques.length === 0
                  ? 'Sin bloques'
                  : `${b.bloques.length} bloque${b.bloques.length === 1 ? '' : 's'}`}
              </span>
            </span>
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              b.listo ? 'bg-emerald-500' : 'bg-amber-400'
            }`}
            title={b.listo ? 'Lista' : 'Falta trabajo'} />
          </button>
        ))}

        <div className="px-3 py-2 border-b border-slate-100">
          <button onClick={() => agregarBisagra(t)}
                  className="w-full text-xs text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg py-1.5 transition-colors">
            + Bisagra en {ETIQUETA_TIEMPO[t].toLowerCase()}
          </button>
        </div>
      </div>
    )
  })}
</div>
```

El punto de color a la derecha es el único indicador de avance de autoría del riel, y es del autor, no del participante. No hay porcentaje, no hay barra, no hay racha.

---

## 6. El lienzo

### 6.1 Cabecera del tiempo

Entre grupos de bisagras, sobre `bg-slate-50` directamente, sin tarjeta:

```tsx
<div className="flex items-baseline justify-between gap-4 pt-2">
  <div>
    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
      {ETIQUETA_TIEMPO[t]}
    </h2>
    <p className="text-xs text-slate-400 mt-1 max-w-[52ch] leading-relaxed">
      {PAPEL_SOFTWARE[t]}
    </p>
  </div>
  <span className="text-xs text-slate-400 tabular-nums flex-shrink-0">
    {listas} de {total} listas
  </span>
</div>
```

`PAPEL_SOFTWARE` ya existe en `dominio.ts:27-31` y dice cosas como que en la ignición el software es mudo. Ese texto es la mejor guía de autoría que tiene el producto y tiene que estar en la pantalla donde se autora.

### 6.2 Tarjeta de bisagra

```tsx
<section id={`bisagra-${b.id}`}
         className={SUPERFICIE + ' overflow-hidden scroll-mt-[128px]'}>

  {/* Cabecera */}
  <div className="flex items-start justify-between gap-3 px-5 py-3 border-b border-slate-100">
    <div className="flex items-start gap-3 min-w-0 flex-1">
      <span className="text-xs text-slate-400 tabular-nums mt-2 w-5 flex-shrink-0 text-right">
        {String(b.orden).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <label htmlFor={`titulo-${b.id}`} className="sr-only">Título de la bisagra</label>
        <input id={`titulo-${b.id}`} value={b.titulo}
               onChange={e => setTitulo(b.id, e.target.value)}
               placeholder="Título de la bisagra"
               className={CAMPO_FANTASMA + ' -ml-2 text-sm font-semibold text-slate-900'} />
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={BADGE_TIPO + ' ' + SOPORTE[b.soporte].cls}>{SOPORTE[b.soporte].etiqueta}</span>
          {b.duracion && <span className="text-xs text-slate-400">{b.duracion}</span>}
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-400">
            {b.bloques.length === 0 ? 'Sin bloques' : `${b.bloques.length} bloques`}
          </span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
      <button className={BTN_ICONO} disabled={esPrimera} title="Subir esta bisagra" aria-label="Subir esta bisagra">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button className={BTN_ICONO} disabled={esUltima} title="Bajar esta bisagra" aria-label="Bajar esta bisagra">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <button onClick={() => setAjustes(!ajustes)}
              className={BTN_ICONO + (ajustes ? ' bg-slate-100 text-slate-900' : '')}
              title="Ajustes de la bisagra" aria-label="Ajustes de la bisagra" aria-expanded={ajustes}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="3" />
          <path strokeLinecap="round" d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10l1.4 1.4m0-12.8l-1.4 1.4m-10 10l-1.4 1.4" />
        </svg>
      </button>
      <ConfirmacionEnLinea
        etiqueta="Eliminar bisagra"
        pregunta={`Se elimina "${b.titulo || 'esta bisagra'}" con sus ${b.bloques.length} bloques.`}
        onConfirmar={() => eliminarBisagra(b.id)} />
    </div>
  </div>

  {/* Ajustes de la bisagra, plegable */}
  {ajustes && (
    <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 grid grid-cols-2 gap-4">
      <div>
        <label htmlFor={`soporte-${b.id}`} className={ETIQUETA_CAMPO}>Soporte</label>
        <select id={`soporte-${b.id}`} className={CAMPO}>
          <option value="sala">Sala. Ocurre entre personas, el software no entra.</option>
          <option value="objeto">Objeto. Pieza física, el software la administra.</option>
          <option value="pantalla">Pantalla. Vive dentro del portal.</option>
        </select>
      </div>
      <div>
        <label htmlFor={`duracion-${b.id}`} className={ETIQUETA_CAMPO}>Duración</label>
        <input id={`duracion-${b.id}`} placeholder="90 min" className={CAMPO} />
      </div>
      <div className="col-span-2">
        <label htmlFor={`requiere-${b.id}`} className={ETIQUETA_CAMPO}>
          Qué necesita el moderador en la mano
        </label>
        <input id={`requiere-${b.id}`} placeholder="Velas, libreta de cada participante" className={CAMPO} />
        <p className="text-[11px] text-slate-400 mt-1">Separa con comas. Aparece en el guion de sala.</p>
      </div>
    </div>
  )}

  {/* Bloques */}
  <div className="divide-y divide-slate-100">
    {b.bloques.map(bl => <FilaBloque key={bl.id} bloque={bl} />)}
  </div>

  {/* Pie: agregar bloque */}
  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
    <SelectorTipoBloque onElegir={t => agregarBloque(b.id, t)} />
  </div>
</section>
```

Sobre el campo fantasma: es el único control nuevo del sistema. Regla dura, para que nunca parezca texto muerto: `hover:border-slate-200` visible, anillo de foco estándar, `placeholder` que nombra el campo, y `label` con `sr-only`. Ningún input de este editor va sin `id` y sin `label` asociado, cosa que el admin no hace en ningún archivo.

### 6.3 Fila de bloque, colapsada

```tsx
<div className="group flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
  <span className={BADGE_TIPO + ' mt-0.5 flex-shrink-0 ' + TIPO_BLOQUE[bl.tipo].cls}>
    {TIPO_BLOQUE[bl.tipo].etiqueta}
  </span>

  <button onClick={() => abrir(bl.id)} className="flex-1 min-w-0 text-left" aria-expanded={false}>
    <span className="block text-sm text-slate-900 truncate">
      {resumen(bl) || <span className="text-slate-300">Bloque vacío</span>}
    </span>
    <span className="block text-xs text-slate-400 truncate mt-0.5">{detalle(bl)}</span>
  </button>

  {bl.audiencia !== 'participante' && (
    <span className={BADGE_TIPO + ' mt-0.5 flex-shrink-0 bg-slate-100 text-slate-500'}
          title="Este bloque no lo ve el participante">
      Solo moderador
    </span>
  )}

  <div className="flex items-center gap-0.5 flex-shrink-0">
    <button className={BTN_ICONO} title="Subir este bloque" aria-label="Subir este bloque">…</button>
    <button className={BTN_ICONO} title="Bajar este bloque" aria-label="Bajar este bloque">…</button>
    <ConfirmacionEnLinea compacto etiqueta="Eliminar bloque"
      pregunta="Se elimina este bloque." onConfirmar={() => eliminarBloque(bl.id)} />
  </div>
</div>
```

Los verbos están siempre visibles en `slate-400`, no escondidos tras `opacity-0 group-hover:opacity-100` como en `ChecklistClient.tsx:69`. Ese patrón es invisible con teclado y no existe en pantalla táctil.

### 6.4 Fila de bloque, abierta

Al abrir, la fila conserva su cabecera y despliega debajo el editor propio del tipo más la franja de Ajustes:

```tsx
<div className="border-l-2 border-slate-900 bg-white">
  {/* cabecera igual que la colapsada, con aria-expanded={true} */}
  <div className="px-5 pb-5">
    {/* editor del tipo, ver secciones 8, 9 y 10 */}
  </div>
  <AjustesBloque bloque={bl} />
</div>
```

### 6.5 Ajustes de bloque

```tsx
<div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-4 flex-wrap">
  <div className="flex items-center gap-2">
    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Quién lo ve</span>
    <div className="flex items-center bg-slate-100 rounded-lg p-1">
      {(['participante', 'moderador', 'ambos'] as const).map(a => (
        <button key={a} onClick={() => setAudiencia(bl.id, a)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  bl.audiencia === a
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}>
          {AUDIENCIA_ETIQUETA[a]}
        </button>
      ))}
    </div>
  </div>

  <button onClick={() => setNota(!nota)}
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
    {bl.notaModerador ? 'Editar nota para el moderador' : '+ Nota para el moderador'}
  </button>
</div>

{nota && (
  <div className="px-5 pb-4 bg-slate-50">
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <label htmlFor={`nota-${bl.id}`}
             className="block font-semibold text-xs uppercase tracking-wide text-amber-600 mb-1.5">
        Nota para el moderador
      </label>
      <textarea id={`nota-${bl.id}`} rows={2}
                placeholder="El participante nunca ve esto. Sirve para el guion de sala."
                className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y" />
    </div>
  </div>
)}
```

El callout ámbar es el mismo de `ItinerarioClient.tsx:411-416`, que es el patrón con el que Trascendencia ya distingue lo que solo ve el staff.

---

## 7. Agregar, reordenar, eliminar

### 7.1 Agregar

Gesto: botón dashed a ancho completo al pie de la bisagra. Es el patrón de `ChecklistClient.tsx:239`, la mejor affordance de creación del admin. Al pulsarlo se expande en sitio una rejilla de tipos, sin capa flotante, sin modal.

```tsx
// cerrado
<button onClick={() => setAbierto(true)} className={BTN_DASHED}>
  + Agregar bloque
</button>

// abierto
<div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
  <div className="flex items-center justify-between mb-3">
    <h4 className={ETIQUETA_SECCION}>Qué quieres agregar</h4>
    <button onClick={() => setAbierto(false)}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
      Cancelar
    </button>
  </div>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    {TIPOS.map(t => (
      <button key={t.id} onClick={() => elegir(t.id)}
              className="flex flex-col items-start gap-1.5 px-3 py-2.5 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors text-left">
        <span className={BADGE_TIPO + ' ' + TIPO_BLOQUE[t.id].cls}>{TIPO_BLOQUE[t.id].etiqueta}</span>
        <span className="text-[11px] text-slate-400 leading-snug">{t.pista}</span>
      </button>
    ))}
  </div>
</div>
```

Pistas exactas de cada tipo:

| Tipo | Pista |
|---|---|
| Texto | Para escribir. Es el bloque que más vas a usar. |
| Cita | Una frase sola, con peso. |
| Imagen | Una foto o una lámina, con pie. |
| Documento | Un PDF. Elige quién puede descargarlo. |
| Video | Un archivo o un enlace no listado. |
| Aviso | Algo que hay que leer sí o sí. |
| Escritura | El participante escribe para sí mismo. Nadie lo califica. |

El tipo Escritura solo aparece si `experiencia.abreEspacioAlForo` es verdadero. Si es falso, en su lugar va una celda apagada:

```tsx
<div className="flex flex-col items-start gap-1.5 px-3 py-2.5 border border-dashed border-slate-200 rounded-lg opacity-60">
  <span className={BADGE_TIPO + ' bg-slate-100 text-slate-400'}>Escritura</span>
  <span className="text-[11px] text-slate-400 leading-snug">
    Esta experiencia no abre espacio al foro. Cámbialo en la Ficha.
  </span>
</div>
```

Al elegir un tipo, el bloque se inserta **al final de esa bisagra**, ya abierto, con el foco en su primer campo. Nunca se abre un formulario en otra página.

También hay un punto de inserción entre bloques: al pasar el cursor por el divisor aparece una línea con un botón central de 20px:

```tsx
<div className="relative h-0">
  <div className="absolute inset-x-5 -top-3 h-6 flex items-center opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
    <span className="flex-1 h-px bg-slate-200" />
    <button className="mx-2 w-5 h-5 rounded-full bg-white border border-slate-300 text-slate-400 hover:border-slate-900 hover:text-slate-900 text-xs leading-none transition-colors"
            title="Insertar bloque aquí" aria-label="Insertar bloque aquí">+</button>
    <span className="flex-1 h-px bg-slate-200" />
  </div>
</div>
```

Este sí puede esconderse en hover porque es una comodidad, no la única vía: el botón dashed del pie siempre está.

### 7.2 Reordenar

Gesto principal: botones de subir y bajar, en la fila del bloque y en la cabecera de la bisagra. Deshabilitados en los extremos con `disabled:opacity-40`, nunca ocultos, para que la posición se lea del propio control.

Gesto secundario: mover entre bisagras o entre tiempos, dentro de Ajustes:

```tsx
<div>
  <label htmlFor={`mover-${bl.id}`} className={ETIQUETA_CAMPO}>Mover a</label>
  <select id={`mover-${bl.id}`} className={CAMPO} defaultValue="">
    <option value="" disabled>Elige otra bisagra</option>
    {bisagras.map(b => (
      <option key={b.id} value={b.id}>
        {ETIQUETA_TIEMPO[b.tiempo]} · {String(b.orden).padStart(2,'0')} {b.titulo}
      </option>
    ))}
  </select>
</div>
```

Al mover, el lienzo hace scroll a la nueva posición y la fila entra con `bg-slate-50` durante 900 ms para que la vista no se pierda.

Arrastrar y soltar: no se construye ahora. El repositorio no tiene ninguna dependencia ni ningún `draggable`. Si algún día se agrega, va encima de los botones, nunca en su lugar.

### 7.3 Eliminar

Componente `ConfirmacionEnLinea`, con la mecánica de `EventStatusButton.tsx:39-57` y el remate de `CheckInButton.tsx:65-91`.

```tsx
// Estado 1, reposo
<button onClick={() => setPaso('confirmar')} className={BTN_ICONO + ' hover:text-red-600 hover:bg-red-50'}
        title={etiqueta} aria-label={etiqueta}>
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
  </svg>
</button>

// Estado 2, confirmando
<div className="flex items-center gap-2">
  <span className="text-xs text-slate-500">{pregunta}</span>
  <button onClick={confirmar} disabled={cargando}
          className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors">
    {cargando ? '…' : 'Eliminar'}
  </button>
  <button onClick={() => setPaso('reposo')}
          className="px-3 py-1 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
    Cancelar
  </button>
</div>

// Estado 3, deshacer, 10 segundos
<div className="flex items-center gap-2">
  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
    Eliminado
  </span>
  <button onClick={deshacer}
          className="text-xs font-medium text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors">
    Deshacer
  </button>
</div>
```

Nunca `confirm()` del navegador. Nunca un modal.

Regla de escalado de la confirmación:

| Qué se elimina | Pregunta exacta |
|---|---|
| Bloque vacío | Se elimina y no hay nada que perder. (se borra directo, sin paso 2) |
| Bloque con texto | Se elimina este bloque con lo que escribiste. |
| Bloque con archivo | Se elimina este bloque y su archivo deja de estar disponible. |
| Bisagra | Se elimina "{título}" con sus {n} bloques. |
| Bisagra ya publicada | Se elimina "{título}". Está publicada, así que los moderadores dejarán de verla en cuanto publiques de nuevo. |

---

## 8. El editor de texto

### 8.1 Qué necesita para escribir de verdad

Diez capacidades, ni una más:

1. Párrafo
2. Salto de línea duro dentro del párrafo
3. Negrita
4. Itálica
5. Título de sección (H2)
6. Subtítulo (H3)
7. Lista con viñetas
8. Lista numerada
9. Cita destacada
10. Enlace

Formato: markdown restringido, guardado como texto plano. El renderer es propio, de unas cuarenta líneas, y devuelve nodos de React. Nunca `dangerouslySetInnerHTML`. Cualquier sintaxis fuera de la gramática se muestra literal, no se interpreta.

### 8.2 Qué se descarta y por qué

| Descartado | Razón |
|---|---|
| Color de texto, tamaño, familia | El lector del participante tiene una sola escala. Un autor con selector de color rompe la marca en la primera semana. |
| Alineación y sangría | El lector es una columna de 512px en teléfono. No hay nada que alinear. |
| Subrayado | Se confunde con enlace. |
| Tachado y resaltado | No existe ningún tratamiento equivalente en el lado participante. |
| Tablas y columnas | No caben en teléfono y el lector no tiene patrón para ellas. |
| HTML crudo y embeds arbitrarios | Superficie de seguridad y de rotura visual sin techo. |
| Emojis como iconografía | El portal usa SVG de trazo 1.5 dibujado a mano. Los emojis de `programa/page.tsx:205` y `avisos/page.tsx:55` rompen el registro y no se replican. |
| Imagen en línea dentro del texto | La imagen es un bloque propio, con su pie y su medida. |
| Notas al pie, índices, anclas | Complejidad sin demanda. |

### 8.3 Markup

```tsx
<div className="px-5 pb-5">
  <div className="flex items-center gap-1 border border-slate-200 border-b-0 rounded-t-lg bg-slate-50 px-2 py-1.5">
    <button type="button" onClick={() => envolver('**')} title="Negrita (Cmd+B)" aria-label="Negrita"
            className={BTN_ICONO + ' text-sm font-bold'}>B</button>
    <button type="button" onClick={() => envolver('*')} title="Itálica (Cmd+I)" aria-label="Itálica"
            className={BTN_ICONO + ' text-sm italic'}>I</button>

    <span className="w-px h-4 bg-slate-200 mx-1" />

    <button type="button" onClick={() => prefijo('## ')} title="Título de sección" aria-label="Título de sección"
            className={BTN_ICONO + ' text-[11px] font-semibold'}>H2</button>
    <button type="button" onClick={() => prefijo('### ')} title="Subtítulo" aria-label="Subtítulo"
            className={BTN_ICONO + ' text-[11px] font-semibold'}>H3</button>

    <span className="w-px h-4 bg-slate-200 mx-1" />

    <button type="button" onClick={() => prefijo('- ')} title="Lista con viñetas" aria-label="Lista con viñetas"
            className={BTN_ICONO}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="5" cy="7" r="1" fill="currentColor" /><circle cx="5" cy="12" r="1" fill="currentColor" />
        <circle cx="5" cy="17" r="1" fill="currentColor" />
        <path strokeLinecap="round" d="M9 7h11M9 12h11M9 17h11" />
      </svg>
    </button>
    <button type="button" onClick={() => prefijo('1. ')} title="Lista numerada" aria-label="Lista numerada"
            className={BTN_ICONO}>…</button>
    <button type="button" onClick={() => prefijo('> ')} title="Cita" aria-label="Cita"
            className={BTN_ICONO}>…</button>
    <button type="button" onClick={insertarEnlace} title="Enlace (Cmd+K)" aria-label="Enlace"
            className={BTN_ICONO}>…</button>

    <div className="flex-1" />

    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
      <button type="button" onClick={() => setModo('escribir')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                modo === 'escribir' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>Escribir</button>
      <button type="button" onClick={() => setModo('leer')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                modo === 'leer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>Leer</button>
    </div>
  </div>

  {modo === 'escribir' ? (
    <>
      <label htmlFor={`texto-${bl.id}`} className="sr-only">Texto del bloque</label>
      <textarea id={`texto-${bl.id}`} rows={10} value={bl.texto}
                onChange={e => setTexto(bl.id, e.target.value)}
                placeholder="Escribe aquí lo que va a leer el participante."
                className="w-full px-4 py-3 border border-slate-200 rounded-b-lg text-sm leading-relaxed text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-y" />
    </>
  ) : (
    <div className="border border-slate-200 rounded-b-lg bg-white px-4 py-3 min-h-[240px]">
      <RenderMarkdown texto={bl.texto} tono="claro" />
    </div>
  )}

  <div className="flex items-center justify-between mt-1.5">
    <span className="text-[11px] text-slate-400">
      Markdown simple: **negrita**, *itálica*, ## título, - lista, &gt; cita
    </span>
    <span className="text-[11px] text-slate-400 tabular-nums">
      {palabras} palabras · {minutos} min de lectura
    </span>
  </div>
</div>
```

`resize-y`, que sí existe en Tailwind. El admin escribe `resize-vertical` en `NuevoItemForm.tsx:163 y 192`, que no es una utilidad válida y no hace nada.

Atajos dentro del textarea: Cmd/Ctrl+B negrita, Cmd/Ctrl+I itálica, Cmd/Ctrl+K enlace, Cmd/Ctrl+S guardar. Enter dentro de una lista continúa la lista. Enter en una lista vacía la cierra.

El modo Leer del editor usa `tono="claro"` sobre blanco. La vista previa del panel usa `tono="oscuro"` con las clases del participante. Es el mismo componente con dos mapas de clase, y ese es el punto: el markdown se renderiza en un solo sitio del código.

---

## 9. Documento PDF

Cinco estados de interfaz, cuatro de los cuales pidió el usuario.

### 9.1 Vacío, esperando archivo

```tsx
<label htmlFor={`pdf-${bl.id}`}
       onDragOver={e => { e.preventDefault(); setArrastrando(true) }}
       onDragLeave={() => setArrastrando(false)}
       onDrop={soltar}
       className={`flex flex-col items-center justify-center gap-2 w-full border border-dashed rounded-xl px-4 py-8 text-center cursor-pointer transition-colors ${
         arrastrando ? 'border-slate-900 bg-slate-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
       }`}>
  <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  </span>
  <span className="text-sm font-medium text-slate-700">
    Arrastra el PDF aquí o haz clic para elegirlo
  </span>
  <span className="text-xs text-slate-400">Un archivo PDF, hasta 25 MB.</span>
</label>
<input id={`pdf-${bl.id}`} type="file" accept="application/pdf" className="sr-only" onChange={elegir} />
```

### 9.2 Subiendo

```tsx
<div className={SUPERFICIE_PLANA + ' px-4 py-3'}>
  <div className="flex items-center justify-between gap-3 mb-2">
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-900 truncate">{archivo.nombre}</p>
      <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
        {subido} de {total}
      </p>
    </div>
    <button onClick={cancelar} className={BTN_FILA + ' flex-shrink-0'}>Cancelar</button>
  </div>
  <div className="w-full bg-slate-100 rounded-full h-2">
    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
         style={{ width: `${pct}%` }} />
  </div>
</div>
```

Es literalmente la barra de progreso de `ChecklistClient.tsx:187-191`, incluida la transición de 500 ms, que es la más lenta del admin y hace que el avance se sienta.

### 9.3 Listo

```tsx
<div className={SUPERFICIE_PLANA + ' px-4 py-3'}>
  <div className="flex items-center gap-3">
    <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
      PDF
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-900 truncate">{archivo.nombre}</p>
      <p className="text-xs text-slate-400 mt-0.5">
        {archivo.peso} · {archivo.paginas} páginas · subido el {fecha(archivo.subidoAt)}
      </p>
    </div>
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <a href={archivo.url} target="_blank" rel="noopener noreferrer" className={BTN_FILA}>Abrir</a>
      <label className={BTN_FILA + ' cursor-pointer'}>
        Reemplazar
        <input type="file" accept="application/pdf" className="sr-only" onChange={reemplazar} />
      </label>
      <ConfirmacionEnLinea compacto etiqueta="Quitar archivo"
        pregunta="Se quita el archivo. El bloque se queda vacío."
        onConfirmar={quitar} />
    </div>
  </div>

  <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-100">
    <label className="flex items-center gap-2 cursor-pointer group select-none">
      <input type="checkbox" className="sr-only peer" checked={bl.descargable} onChange={toggle} />
      <span className="w-4 h-4 rounded border-2 border-slate-300 bg-white flex items-center justify-center transition-colors peer-checked:bg-slate-900 peer-checked:border-slate-900 group-hover:border-slate-400">
        <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span className="text-xs text-slate-600">Se puede descargar</span>
    </label>
    <span className="text-xs text-slate-400">
      Quién lo ve se define abajo, en Quién lo ve.
    </span>
  </div>
</div>
```

Por defecto, un documento nace con audiencia `moderador` y descargable activo. Es lo que pidió el usuario: cargar PDFs que el moderador va a descargar.

### 9.4 Fallido

```tsx
<div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
  <div className="flex items-start gap-3">
    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-red-700">No se pudo subir {archivo.nombre}</p>
      <p className="text-xs text-red-600 mt-0.5">{motivo}</p>
    </div>
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button onClick={reintentar}
              className="text-xs font-medium text-red-700 border border-red-300 bg-white px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors">
        Reintentar
      </button>
      <button onClick={descartar} className={BTN_FILA + ' bg-white'}>Descartar</button>
    </div>
  </div>
</div>
```

Motivos exactos, en español y sin jerga:

| Causa | Motivo exacto |
|---|---|
| Conexión cortada | Se cortó la conexión al {pct} por ciento. El archivo sigue en tu computadora, no se perdió nada. |
| Demasiado grande | Pesa {peso} y el máximo son 25 MB. Comprímelo o divídelo en dos. |
| Formato equivocado | Esto no es un PDF. Solo se admiten archivos .pdf. |
| PDF protegido | El PDF tiene contraseña. Quítasela y vuelve a subirlo. |
| Error del servidor | Falló del lado nuestro, no del tuyo. Vuelve a intentar en un minuto. |

---

## 10. Video

Cinco estados: vacío, subiendo, procesando, listo, fallido. El estado de procesamiento existe porque después de subir todavía no se conoce la duración ni la miniatura.

### 10.1 Vacío, con dos vías

```tsx
<div className="flex items-center bg-slate-100 rounded-lg p-1 w-fit mb-3">
  <button onClick={() => setVia('archivo')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            via === 'archivo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}>Subir archivo</button>
  <button onClick={() => setVia('enlace')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            via === 'enlace' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}>Pegar enlace</button>
</div>

{via === 'archivo' ? (
  <label htmlFor={`video-${bl.id}`} className="…mismo dropzone que el PDF…">
    <span className="text-sm font-medium text-slate-700">
      Arrastra el video aquí o haz clic para elegirlo
    </span>
    <span className="text-xs text-slate-400">MP4 o MOV, hasta 500 MB.</span>
  </label>
) : (
  <div>
    <label htmlFor={`enlace-${bl.id}`} className={ETIQUETA_CAMPO}>Enlace del video</label>
    <input id={`enlace-${bl.id}`} type="url" placeholder="https://vimeo.com/…" className={CAMPO} />
    <p className="text-[11px] text-slate-400 mt-1">
      Vimeo o YouTube, siempre en modo no listado. Un enlace público deja de ser tuyo.
    </p>
  </div>
)}
```

### 10.2 Procesando

```tsx
<div className={SUPERFICIE_PLANA + ' px-4 py-3 flex items-center gap-3'}>
  <span className="w-24 h-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
    <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
  </span>
  <div className="min-w-0 flex-1">
    <p className="text-sm font-medium text-slate-900 truncate">{archivo.nombre}</p>
    <p className="text-xs text-slate-400 mt-0.5">
      Subido. Estamos preparándolo para que se vea bien en teléfono. Puedes seguir trabajando.
    </p>
  </div>
</div>
```

El spinner es el que ya usa `ToggleBlockButton.tsx:37`, con `border-2` y `border-t-transparent`.

### 10.3 Listo

```tsx
<div className={SUPERFICIE_PLANA + ' px-4 py-3'}>
  <div className="flex items-center gap-3">
    <span className="relative w-24 h-14 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
      <img src={video.poster} alt="" className="w-full h-full object-cover opacity-80" />
      <span className="absolute inset-0 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="absolute bottom-1 right-1 text-[10px] font-medium text-white bg-black/70 px-1 rounded tabular-nums">
        {video.duracion}
      </span>
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-900 truncate">{video.nombre}</p>
      <p className="text-xs text-slate-400 mt-0.5">{video.peso} · {video.resolucion} · {video.duracion}</p>
    </div>
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button className={BTN_FILA}>Reproducir</button>
      <label className={BTN_FILA + ' cursor-pointer'}>Reemplazar<input type="file" className="sr-only" /></label>
      <ConfirmacionEnLinea compacto etiqueta="Quitar video"
        pregunta="Se quita el video. El bloque se queda vacío." onConfirmar={quitar} />
    </div>
  </div>

  <div className="mt-3 pt-3 border-t border-slate-100">
    <label htmlFor={`pie-${bl.id}`} className={ETIQUETA_CAMPO}>Qué es este video</label>
    <input id={`pie-${bl.id}`} placeholder="Una frase. Aparece debajo del video."
           className={CAMPO} />
  </div>
</div>
```

Advertencia de dominio, se muestra cuando el video vive en una bisagra con soporte `sala` o cuando el pie contiene la palabra formación:

```tsx
<div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
  <p className="font-semibold text-xs uppercase tracking-wide text-amber-600 mb-1">Ojo con el kit</p>
  <p className="text-sm text-amber-800 leading-relaxed">
    La pieza humana solo se transmite en formación presencial, nunca por video. Este video sirve de apoyo,
    no sustituye la formación del moderador.
  </p>
</div>
```

La regla está literal en `dominio.ts:64-66`. La advertencia no bloquea, solo avisa.

---

## 11. El guardado

El usuario lo pidió con nombre propio: guardar el progreso. Tiene que ser visible y tiene que ser pulsable.

### 11.1 Reglas

1. Autoguardado a los 1200 ms de inactividad en cualquier campo, y siempre al salir de un campo.
2. Botón explícito, siempre visible y siempre pulsable. Si no hay cambios, guarda igual y responde Todo guardado. Nunca se deshabilita: un botón de guardar apagado produce dudas.
3. Cmd/Ctrl+S guarda y evita el diálogo del navegador.
4. Al intentar cerrar la pestaña con cambios pendientes, `beforeunload`.
5. Los autoguardados no lanzan toast. El toast se reserva para el guardado manual con éxito y para el fallo. El proveedor de toasts no tiene cola ni tope (`ToastProvider.tsx:35`), así que un toast por autoguardado apilaría tarjetas hasta salirse de la pantalla.
6. Ante fallo: reintento automático a los 5, 15 y 60 segundos, chip en rojo y banner persistente en el lienzo. El banner es persistente porque el toast se va solo a los 3000 ms y un error de guardado no puede desaparecer solo.
7. El borrador vive en el servidor, no en `localStorage`. `OperacionClient.tsx:512-518` lee `localStorage` durante el render y el propio autor lo tuvo que parchear con un efecto por desajuste de servidor y cliente. No se repite.

### 11.2 El chip

```tsx
// Todo guardado
<div className="flex items-center gap-1.5 flex-shrink-0">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
  <span className="text-xs text-slate-400">Todo guardado</span>
  <span className="text-xs text-slate-300 hidden xl:inline">· {haceCuanto}</span>
</div>

// Sin guardar
<div className="flex items-center gap-2 flex-shrink-0">
  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
  <span className="text-xs text-amber-700">Sin guardar</span>
  <button onClick={guardarAhora}
          className="text-xs font-medium text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors">
    Guardar
  </button>
</div>

// Guardando
<div className="flex items-center gap-1.5 flex-shrink-0">
  <span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
  <span className="text-xs text-slate-400">Guardando…</span>
</div>

// Falló
<div className="flex items-center gap-2 flex-shrink-0">
  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
  <span className="text-xs text-red-700">No se pudo guardar</span>
  <button onClick={guardarAhora}
          className="text-xs font-medium text-red-700 border border-red-300 bg-white px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors">
    Reintentar
  </button>
</div>
```

`haceCuanto` se formatea así: menos de un minuto da "hace un momento", menos de una hora da "hace {n} min", el resto da la hora en formato 24 horas. Se recalcula cada 30 segundos.

### 11.3 El banner de error

Al principio del lienzo, sobre todas las bisagras. Es el patrón de alerta con franja lateral de `dashboard/page.tsx:44-56`.

```tsx
<div className="flex items-start gap-4 border-l-4 border-red-400 bg-red-50 rounded-r-xl px-5 py-4 shadow-sm">
  <div className="flex-1">
    <p className="text-sm font-semibold text-slate-900">Tus últimos cambios no se guardaron</p>
    <p className="text-xs text-slate-500 mt-0.5">
      Lo que escribiste sigue en pantalla, no se ha perdido. No cierres esta pestaña hasta que diga Todo guardado.
      Reintentamos solos en {segundos} segundos.
    </p>
  </div>
  <button onClick={guardarAhora}
          className="shrink-0 text-xs font-medium text-slate-700 border border-slate-300 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap">
    Reintentar ahora
  </button>
</div>
```

---

## 12. La vista previa

### 12.1 El panel

Reutiliza el marco de teléfono que ya existe en `portal/app/(admin)/eventos/[id]/preview/page.tsx:262-318`, con su barra de estado, su muesca y su barra de navegación inferior simulada.

```tsx
<div className="space-y-3">
  {/* Cabecera del panel */}
  <div className={SUPERFICIE + ' px-4 py-3'}>
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className={ETIQUETA_SECCION}>Vista previa</h2>
      <Link href={`/prototipo/personalab/experiencias/${id}/vista-previa`} target="_blank"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap">
        Pantalla completa →
      </Link>
    </div>
    <div className="flex items-center bg-slate-100 rounded-lg p-1">
      <button onClick={() => setLente('participante')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                lente === 'participante' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>Como participante</button>
      <button onClick={() => setLente('moderador')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                lente === 'moderador' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>Como moderador</button>
    </div>
  </div>

  {/* Teléfono */}
  <div className="relative mx-auto" style={{ width: '375px' }}>
    <div className="relative bg-[#0C0C0C] rounded-[40px] shadow-2xl border-4 border-[#2A2A2A] overflow-hidden"
         style={{ minHeight: '640px' }}>
      {/* barra de estado, muesca y nav inferior, copiadas de preview/page.tsx:270-316 */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 text-[9px] font-semibold uppercase tracking-widest text-[#C9A96E] bg-black/60 px-2 py-0.5 rounded-full">
        Vista previa
      </div>
      <div className="overflow-y-auto" style={{ height: '580px', paddingBottom: '80px' }}>
        <div className="px-5 pt-4 space-y-4">
          {bloquesVisibles(lente).length === 0
            ? <VacioLector lente={lente} />
            : bloquesVisibles(lente).map(bl => <TarjetaLectura key={bl.id} bloque={bl} />)}
        </div>
      </div>
    </div>
  </div>

  <p className="text-[11px] text-slate-400 text-center px-4 leading-relaxed">
    Estás viendo el borrador. El participante ve la última versión publicada hasta que publiques de nuevo.
  </p>
</div>
```

El chip Vista previa dentro del teléfono no es decoración: sin él, una captura de pantalla del panel es indistinguible de producción.

### 12.2 Las dos lentes

- **Como participante**: solo bloques con audiencia `participante` o `ambos`. Sin notas para el moderador. Sin documentos marcados solo para moderador.
- **Como moderador**: todo, más las notas en el callout ámbar, más los documentos con su botón de descarga. Es el guion de sala tal como el moderador lo va a ver.

Esta pantalla es la respuesta a la pregunta que el autor no puede contestar de otra forma: qué queda del lado de allá.

### 12.3 Tokens del lector

La tarjeta de lectura hereda el sistema editorial del participante, que es el que carga la marca:

```tsx
<article className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-5">
  <div className="text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] mb-2">
    {ETIQUETA_TIEMPO[bloque.tiempo]}
  </div>
  <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">{bloque.titulo}</h3>
  <div className="text-[15px] leading-[1.75] text-[#B0A898] space-y-3">
    <RenderMarkdown texto={bloque.texto} tono="oscuro" />
  </div>
</article>
```

Mapa de clases del renderer en tono oscuro:

| Nodo | Clases |
|---|---|
| Párrafo | `text-[15px] leading-[1.75] text-[#B0A898]` |
| H2 | `text-base font-semibold text-[#F5F0E8] mt-6 mb-2` |
| H3 | `text-sm font-semibold text-[#F5F0E8] mt-4 mb-1.5` |
| Negrita | `font-semibold text-[#F5F0E8]` |
| Itálica | `italic` |
| Lista | `list-disc pl-5 space-y-1.5 marker:text-[#C9A96E]` |
| Lista numerada | `list-decimal pl-5 space-y-1.5 marker:text-[#6B7280]` |
| Cita | `border-l-2 border-[#C9A96E]/40 pl-4 italic text-[#F5F0E8] font-[family-name:var(--font-cormorant)] text-lg leading-relaxed` |
| Enlace | `text-[#C9A96E] underline underline-offset-2 hover:text-[#D4B07A]` |

Dos cambios deliberados respecto de lo que hay hoy en el lado participante: el cuerpo sube de `text-sm leading-relaxed` a `text-[15px] leading-[1.75]`, y cualquier sello de disponibilidad sube de `text-white/20` a `text-[#6B7280]`. Hoy el participante lee 14px en una columna de 512px y el sello está en un blanco al 20 por ciento que casi no se ve sobre `#1A1A1A`.

---

## 13. Publicar

### 13.1 Los tres estados de una experiencia

| Estado | Badge | Qué significa |
|---|---|---|
| Borrador | `bg-slate-100 text-slate-600` | Nunca se ha publicado. Ningún moderador la ve. |
| Publicada | `bg-emerald-100 text-emerald-700` | Lo que hay en el editor es idéntico a lo publicado. |
| Cambios sin publicar | `bg-amber-100 text-amber-700` | Está publicada y además hay ediciones que los moderadores todavía no ven. |
| Retirada | `bg-red-100 text-red-700` | Ya no se puede licenciar a capítulos nuevos. Las corridas en curso siguen. |

Cuando el estado es Publicada o Cambios sin publicar, el editor muestra un aviso fijo arriba del lienzo:

```tsx
<div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Versión {n} publicada</p>
  <p className="text-sm text-blue-800 leading-relaxed">
    Lo que edites aquí no lo ven los moderadores hasta que publiques de nuevo.
  </p>
</div>
```

Es el bloque de nota comercial de `eventos/[id]/page.tsx:323-325`.

### 13.2 La ruta de revisión

`/experiencias/[id]/publicar`, contenedor `max-w-3xl mx-auto px-8 pt-6 pb-12`.

**Bloque 1: qué recibe el participante.** Barra de métricas con el truco de hairlines por gap de `eventos/[id]/page.tsx:156`, que es la mejor pieza técnica del chasis.

```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden mb-6">
  {[
    { label: 'Bisagras',   value: bisagras.length },
    { label: 'Bloques que ve', value: bloquesParticipante },
    { label: 'Documentos', value: documentos },
    { label: 'Minutos de lectura', value: minutos },
  ].map(m => (
    <div key={m.label} className="bg-white px-6 py-4">
      <div className="text-2xl font-semibold text-slate-900 tabular-nums">{m.value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{m.label}</div>
    </div>
  ))}
</div>
```

**Bloque 2: bloqueos.** Si hay uno solo, el botón de publicar no existe.

```tsx
<div className="space-y-3 mb-6">
  <h2 className={ETIQUETA_SECCION + ' mb-3'}>Hay que arreglar esto antes de publicar</h2>
  {bloqueos.map(b => (
    <div key={b.id} className="flex items-start gap-4 border-l-4 border-red-400 bg-red-50 rounded-r-xl px-5 py-4 shadow-sm">
      <div className="flex-1">
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

Lista completa de bloqueos, con copy exacto:

| Título | Detalle |
|---|---|
| La experiencia no tiene nombre | Sin nombre no se puede licenciar a ningún capítulo. |
| La ignición no tiene ninguna bisagra | Una experiencia sin ignición no es una experiencia. |
| Hay {n} bisagras sin título | Una bisagra sin título aparece en blanco en el guion del moderador. |
| Hay {n} bloques de texto vacíos | Se van a ver como una tarjeta en blanco. Escríbelos o elimínalos. |
| Hay {n} archivos que fallaron al subir | Súbelos otra vez o quita el bloque. |
| Hay {n} bloques de documento sin archivo | El bloque existe pero no hay nada que descargar. |
| Hay {n} enlaces de video que no reconocemos | Solo admitimos Vimeo y YouTube en modo no listado. |

**Bloque 3: advertencias.** No impiden publicar.

| Título | Detalle |
|---|---|
| La víspera está vacía | Es el tiempo que hoy no existe en ningún lado y es donde el software más sirve. |
| Hay {n} bisagras sin duración | El moderador no va a poder planear la jornada. |
| Hay {n} piezas del kit marcadas como que faltan | El capítulo va a recibir una lista incompleta. |
| Hay un video de {min} minutos | En teléfono, un video largo casi nadie lo termina. Considera partirlo. |
| Hay {n} documentos que ve el participante | Confirma que quieres eso. Por defecto los documentos son del moderador. |
| Ninguna bisagra abre espacio para escribir | Esta experiencia abre espacio al foro pero no hay dónde escribir. |
| Un bloque de video parece de formación | El kit dice que la pieza humana no se transmite por video. |

**Bloque 4: la confirmación.** Dos pasos, con la mecánica de `EventStatusButton.tsx:39-57`.

```tsx
// Paso 1
<button onClick={() => setConfirmando(true)} disabled={bloqueos.length > 0}
        className={BTN_PRIMARIO + ' w-full sm:w-auto'}>
  Publicar versión {n + 1}
</button>

// Paso 2
<div className={SUPERFICIE + ' p-5'}>
  <p className="text-sm font-semibold text-slate-900 mb-1">
    Se publica la versión {n + 1} de {experiencia.nombre}
  </p>
  <p className="text-sm text-slate-500 leading-relaxed mb-4">
    Los {n} moderadores con acceso van a ver la versión nueva la próxima vez que abran la experiencia.
    Las corridas que ya empezaron se quedan con la versión que tenían.
  </p>
  {advertencias.length > 0 && (
    <p className="text-xs text-amber-700 mb-4">
      Publicas con {advertencias.length} advertencia{advertencias.length === 1 ? '' : 's'} sin resolver.
    </p>
  )}
  <div className="flex gap-3">
    <button onClick={publicar} disabled={cargando} className={BTN_PRIMARIO}>
      {cargando ? 'Publicando…' : 'Sí, publicar'}
    </button>
    <button onClick={() => setConfirmando(false)} className={BTN_SECUNDARIO}>Cancelar</button>
  </div>
</div>
```

Al publicar: toast `Versión {n+1} publicada`, tipo success, y redirección a la Ficha.

### 13.3 Versiones

Publicar congela una copia del contenido y le da número. La corrida guarda con qué versión arrancó. El moderador de una corrida en curso ve un aviso en su panel: `Hay una versión nueva de esta experiencia. Tu foro sigue con la versión {n} hasta que termine.`

Esto es una decisión de producto, no una consecuencia técnica. Está marcada como riesgo porque no ha sido validada con Francisco.

---

## 14. Estados vacíos y de error, copy exacto

Dos niveles de vacío, la distinción buena que ya hace `FamiliasClient.tsx:167 contra 177`: vacío de verdad lleva llamada a la acción, vacío por filtro no.

### 14.1 En el editor

| Situación | Dónde | Copy exacto | Acción |
|---|---|---|---|
| Experiencia sin ninguna bisagra | Lienzo, tarjeta `p-12 text-center` | **Esta experiencia todavía no está diseñada.** No es que falte capturarla: es que no existe. Empieza por la ignición, que es donde ocurre. | Botón: Crear la primera bisagra |
| Tiempo sin bisagras | Lienzo, dentro del grupo, `px-4 py-6 text-center text-slate-400 text-sm` | Este tiempo no está diseñado. | Botón dashed: + Bisagra en {tiempo} |
| Tiempo sin bisagras | Riel | Este tiempo no está diseñado. | ninguna |
| Bisagra sin bloques | Dentro de la tarjeta, `px-5 py-6 text-center text-slate-400 text-sm` | La bisagra existe pero no tiene contenido. | Selector de tipo abierto |
| Bloque de texto vacío | Resumen de la fila colapsada | Bloque vacío | ninguna |
| Documento sin archivo | Fila colapsada, detalle | Sin archivo. Súbelo o elimina el bloque. | ninguna |
| Kit vacío en la Ficha | Tarjeta | Sin kit definido. Un capítulo no puede correr esto sin saber qué necesita. | Botón: Definir el kit |

### 14.2 En la vista previa

| Situación | Copy exacto |
|---|---|
| Nada visible para el participante | Con esta lente el participante no ve nada todavía. Los bloques que hiciste son solo para el moderador. |
| Nada para el moderador | No hay nada para el moderador en esta experiencia. Ni guion, ni documentos, ni notas. |
| Bisagra de soporte sala sin nada en pantalla | Esta bisagra ocurre en la sala. El software no entra y eso está bien. |

### 14.3 Errores

| Situación | Dónde | Copy exacto |
|---|---|---|
| Falla el guardado | Banner rojo en el lienzo | Tus últimos cambios no se guardaron. Lo que escribiste sigue en pantalla, no se ha perdido. No cierres esta pestaña hasta que diga Todo guardado. |
| Falla el guardado manual | Toast tipo error | No se pudo guardar. Revisa tu conexión y vuelve a intentar. |
| Sin conexión | Banner ámbar | Estás sin conexión. Puedes seguir escribiendo. Guardamos en cuanto vuelvas a estar en línea. |
| Otra persona editó | Banner ámbar con dos botones | {Nombre} guardó cambios en esta experiencia mientras la tenías abierta. Recarga para ver su versión, o copia lo tuyo antes de recargar. |
| Archivo demasiado grande | En el bloque | Pesa {peso} y el máximo son {limite}. Comprímelo o divídelo en dos. |
| Formato no admitido, PDF | En el bloque | Esto no es un PDF. Solo se admiten archivos .pdf. |
| Formato no admitido, video | En el bloque | Ese formato no lo podemos reproducir. Usa MP4 o MOV. |
| Enlace de video no reconocido | Bajo el campo, `text-xs text-red-600 mt-1` | No reconocemos ese enlace. Solo Vimeo y YouTube, siempre en modo no listado. |
| Subida cortada | En el bloque | Se cortó la conexión al {pct} por ciento. El archivo sigue en tu computadora, no se perdió nada. |
| Error del servidor al subir | En el bloque | Falló del lado nuestro, no del tuyo. Vuelve a intentar en un minuto. |
| Experiencia inexistente | Página completa | Esta experiencia no existe o la eliminaron. |
| Sin permiso de autoría | Página completa | Puedes ver esta experiencia pero no editarla. Pídele acceso de autor a quien la creó. |
| Publicación bloqueada | Página de publicar | No se puede publicar todavía. Hay {n} cosa{s} por arreglar. |
| Publicación sin cambios | Página de publicar | No hay nada nuevo que publicar. Lo que ven los moderadores es exactamente lo que hay en el editor. |
| Historial vacío | Página de historial | Esta experiencia nunca se ha publicado. |
| Sesión caducada | Banner rojo | Tu sesión caducó. Abre otra pestaña, entra de nuevo y vuelve aquí. Lo que escribiste sigue en pantalla. |

Ningún mensaje de error muestra texto de base de datos ni inglés. El admin hoy hace `setError(error.message)` con el mensaje crudo de Postgres en `familias/nueva/page.tsx:46` y en `NuevoItemForm.tsx:73`, y se lo enseña en inglés a una coordinadora. Aquí el mensaje técnico va a la consola y al log; a la pantalla va una frase escrita por una persona.

### 14.4 Estado vacío, markup canónico

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

Uno solo. El admin tiene cuatro ejecuciones distintas del mismo patrón.

---

## 15. Modelo de datos

### 15.1 Para el prototipo, TypeScript sin base de datos

Se agrega a `dominio.ts`, respetando el léxico y sin ningún campo prohibido:

```ts
export type TipoBloque = 'texto' | 'cita' | 'imagen' | 'documento' | 'video' | 'aviso' | 'escritura'
export type Audiencia  = 'participante' | 'moderador' | 'ambos'
export type EstadoArchivo = 'vacio' | 'subiendo' | 'procesando' | 'listo' | 'fallido'
export type EstadoPublicacion = 'borrador' | 'publicada' | 'cambios' | 'retirada'

export interface Archivo {
  nombre: string
  peso: string
  url: string
  estado: EstadoArchivo
  progreso?: number          // 0 a 100, solo mientras sube
  motivoFallo?: string
  paginas?: number           // PDF
  duracion?: string          // video
  poster?: string            // video
  descargable: boolean
}

export interface Bloque {
  id: string
  tipo: TipoBloque
  orden: number
  audiencia: Audiencia
  texto?: string             // markdown restringido
  pie?: string
  archivo?: Archivo
  enlace?: string
  notaModerador?: string
}

// Bisagra gana bloques. Todo lo demás de dominio.ts:40-51 se conserva.
export interface Bisagra {
  id: string
  tiempo: Tiempo
  orden: number
  titulo: string
  descripcion: string
  soporte: Soporte
  duracion?: string
  listo: boolean
  requiere?: string[]
  bloques: Bloque[]          // nuevo
}

export interface VersionPublicada {
  numero: number
  publicadaAt: string
  publicadaPor: string
  nota?: string
}

// Experiencia gana estado de publicación e historial.
// estadoPublicacion, versiones, borradorActualizadoAt, borradorActualizadoPor
```

Campos que no existen y no van a existir en el modelo del participante: `progress`, `completion_pct`, `score`, `streak`, `badge`, `rank`, `quiz`. La única señal de avance del editor, el punto verde o ámbar del riel, es del autor y vive en `Bisagra.listo`, que ya existía.

### 15.2 Para el esquema real, boceto

Migración `20260808_experiencia_autoria.sql`, siguiendo la convención de nombres de `portal/supabase/migrations`.

```
experiencias            id, nombre, subtitulo, narrativa, duracion, abre_espacio_al_foro,
                        maduracion, estado_publicacion, version_actual,
                        borrador_actualizado_at, borrador_actualizado_por
bisagras                id, experiencia_id, tiempo, orden, titulo, descripcion,
                        soporte, duracion, listo, requiere (text[])
bloques                 id, bisagra_id, tipo, orden, audiencia, texto, pie,
                        enlace, nota_moderador, archivo_id
archivos                id, bucket_path, nombre_original, mime, peso_bytes,
                        estado, paginas, duracion_seg, poster_path, descargable
experiencia_versiones   id, experiencia_id, numero, contenido (jsonb congelado),
                        publicada_at, publicada_por, nota
corridas                + version_experiencia (int)
```

RLS: escritura solo para perfiles con rol de autor sobre esa experiencia. Lectura del contenido publicado para moderadores con grant vigente sobre el capítulo. Los archivos con `audiencia = 'moderador'` nunca se sirven por URL pública, siempre por URL firmada de vida corta.

---

## 16. Accesibilidad, no negociable

1. Todo input, textarea y select lleva `id`, y su `label` lleva `htmlFor`. El admin no lo hace en ningún archivo. Un editor de autoría es un formulario gigante y sin esto es inusable con lector de pantalla.
2. Un solo tratamiento de foco en todo el editor: `focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent`. El admin tiene cuatro tratamientos en cuatro archivos hermanos, uno de ellos casi invisible (`focus:ring-slate-900/10`).
3. Todo botón con solo icono lleva `aria-label` y `title`.
4. El acordeón de bloque lleva `aria-expanded` y `aria-controls`.
5. Ninguna acción existe únicamente en hover.
6. El orden de tabulación sigue el orden visual: riel, luego lienzo de arriba abajo, luego panel.
7. El chip de guardado vive dentro de una región `aria-live="polite"` para que el cambio de estado se anuncie.
8. Contraste: nada de texto informativo por debajo de `slate-400` sobre blanco. `slate-300` se reserva para separadores y para el guion de celda vacía.

---

## 17. Qué no se construye ahora

- Arrastrar y soltar bloques.
- Editor WYSIWYG.
- Comentarios y colaboración en tiempo real.
- Plantillas de experiencia.
- Traducción y multiidioma.
- Versionado con ramas. Solo hay una línea de versiones numeradas.
- Cualquier cosa que mida al participante: progreso, porcentaje, puntaje, racha, insignia, ranking, examen. Está prohibido por el dominio y no entra por la puerta de atrás disfrazado de otra cosa.

---

## 18. Orden de construcción sugerido

1. `tokens.ts`, la regla de `scrollbar-none` en `globals.css`, y el repintado del chasis: `AdminNav` reactivado en slate, `ExperienciaHeader`, `ExperienciaSubNav`.
2. El riel y el lienzo con bisagras y bloques de texto, con agregar, reordenar y eliminar completos. Sin archivos todavía.
3. El guardado entero, incluidos los cuatro estados del chip, el banner y el aviso al salir.
4. `RenderMarkdown` más el `PanelVistaPrevia` con las dos lentes.
5. La ruta de publicar con sus bloqueos y advertencias.
6. Bloques de documento y de video, primero simulados con temporizadores para probar los cinco estados sin infraestructura, después conectados al almacenamiento real.

Los pasos 1 a 5 no necesitan nada del servidor ni de almacenamiento, así que se pueden llevar al prototipo con los datos simulados que ya existen en `dominio.ts`. El paso 6 es el único que abre trabajo de infraestructura.

---

## El lector del participante invierte el modo de Trascendencia: donde el retiro es negro con dorado, PersonaLab lee sobre 

- **El lector del participante es claro: papel #FAF8F4, tinta #14181B, teal #002B34 como estructura. Lo profundo (#001A21) se reserva a portada, cambio de tiempo y cierre, donde no hay texto largo.**: BRAND.md:60 asigna al blanco el rol explicito de 'Espacio y lectura' y BRAND.md:68 define --paper como 'blanco calido para grandes lienzos claros'. Ademas, el unico patron de lectura sostenida que el portal actual resolvio bien es la hoja blanca sobre lienzo oscuro de acuerdos/[id]/page.tsx:36-47 y firmar/[token]/page.tsx:115-123: en ambos casos, para leer, el portal abandona el negro. La contradiccion aparente con BRAND.md:72 ('fondos profundos con tipografia clara') se resuelve porque esa regla gobierna el estilo de la marca, no la ergonomia de un texto de 1200 palabras leido en un telefono a las once de la noche. Se cumple la regla exactamente en los momentos donde no hay que leer parrafos.
- **Tipografia 100 por ciento sans en el stack de sistema (-apple-system, BlinkMacSystemFont, Helvetica Neue, Helvetica, Arial), declarado como --font-lab en globals.css y aplicado con font-[family-name:var(--font-lab)]. Cormorant Garamond queda prohibido en PersonaLab.**: BRAND.md:100-102 lo dice literal: 'Decision de la web (por preferencia del cliente): tipografia 100% sans serif. Los titulos van en la sans a pesos ligeros (200-300) y gran escala; se descarto la capa serif editorial (Cormorant)'. Ademas el prototipo ya fuerza ese mismo stack en prototipo/layout.tsx:20 y el sitio publico lo define en assets/brand.css:14, asi que el participante que llega desde 4meaning.life/personalab no percibe cambio de fuente al entrar al portal. Beneficio medible: se dejan de descargar cuatro pesos de Cormorant mas italicas que app/layout.tsx:6-12 carga hoy en todas las paginas y que el admin no usa jamas.
- **Los bloques de texto largo no van dentro de tarjeta. El parrafo se apoya directamente sobre el papel. La tarjeta se reserva a los cuatro bloques utilitarios: archivo, objeto, nota del moderador y gesto.**: Es lo contrario de lo que hace el portal hoy y esa es exactamente la correccion. En Trascendencia todo texto largo vive envuelto: info/page.tsx:147-156 y programa/page.tsx:251-255 meten el parrafo en bg-[#181818] border border-[#2A2A2A] rounded-xl p-5. El resultado es que un texto de tres parrafos se lee dentro de una caja de 512px menos 40px de padding, es decir 472px utiles, y cada bloque de sentido queda amputado del siguiente por un borde. Sin tarjeta, la columna de 620px queda entera para el texto y el borde solo aparece cuando significa algo (una pieza fisica, un archivo, algo que solo ve el moderador). BRAND.md:146 pide justo esto: 'Amplio, sereno, con espacio para respirar. Se evitan composiciones saturadas'.
- **La navegacion avanza por nombre, no por posicion ni por cuenta. El pie de cada bisagra dice 'Sigue' mas el titulo real de la siguiente, en 22px peso 200. En ningun lugar aparece 'bisagra 3 de 7', ni porcentaje, ni barra.**: El encargo prohibe barras y porcentajes, y el lexico vinculante prohibe progress, completion_pct, streak y rank en el modelo del participante. Pero un contador posicional del tipo '3 de 7', aunque tecnicamente sea posicion y no logro, se lee como progreso y reintroduce la deuda por la puerta de atras. Nombrar lo que sigue es ademas mejor diseno: el participante decide si continua sabiendo que le espera, no cuanto le falta. El propio dominio ya opera asi en dominio.ts:152, donde la capa mensual se define como 'Un solo puntero al mes. Nunca una racha, nunca un recordatorio de deuda'.
- **El filtrado moderador contra participante ocurre en el servidor y elimina los bloques del payload antes de serializar. Nunca se renderiza y se oculta con CSS, y nunca se le muestra al participante un hueco, un candado o un teaser de lo que no puede ver.**: Los bloques de tipo archivo llevan URLs de PDF del guion del moderador (dominio.ts:161, 'Guion del moderador. Version 1.2. Vive en el portal'). Si el bloque viaja en el HTML aunque este oculto, cualquiera con el inspector abierto se lleva el guion, y el guion es precisamente la pieza que hace licenciable la experiencia a un capitulo. El hueco visible tambien se descarta por razon de tono: un candado convierte la experiencia en un catalogo con niveles, que es lo que la regla del vestibulo ya prohibio explicitamente en prototipo/page.tsx:12-13 ('jamas se muestra un catalogo con candados').
- **Las bisagras con soporte 'sala' nunca se abren al participante. Aparecen en la hoja de ruta, con su nombre completo, sin enlace, y con la etiqueta 'En la sala'.**: Lo pide el dominio de forma inequivoca: SOPORTE_NOTA.sala en dominio.ts:34 dice 'Ocurre entre personas. El software no entra', y PAPEL_SOFTWARE.ignicion en dominio.ts:29 dice 'Software mudo. Solo modo sala para el moderador'. Mostrarlas sin enlace, en vez de esconderlas, resuelve algo que ningun lector de cursos hace bien: el participante ve la forma completa de la experiencia y entiende que la parte central no esta en la pantalla porque no debe estarlo, no porque se la esten reteniendo. Es la diferencia entre una ausencia con sentido y un contenido bloqueado.
- **La posicion de lectura se guarda como un puntero al id de la ultima bisagra abierta, en localStorage con la clave lab_ultima_<experienciaId>, y solo se usa para redactar el llamado de la portada ('Continuar en: Lo que hay que traer'). Nunca se muestra como fraccion ni se sincroniza al servidor en el prototipo.**: Reanudar es una cortesia de lectura, no una medicion. Guardarlo como id y no como indice ni como conteo mantiene el modelo del participante limpio de los campos prohibidos, y deja la puerta abierta a subirlo a Supabase mas adelante con la unica condicion de que la columna se llame ultima_bisagra_id y jamas progress. La aclaracion del usuario permite guardar avance del lado profesional, no del participante, y un puntero de lectura no es avance: es donde quedo abierto el libro.
- **Se corrigen tres colores de texto respecto de lo que el prototipo usa hoy: gris de lectura #676E6E en vez de #6F7777, terracota de texto #8F5341 en vez de #B9735A, y prohibicion total de #A69C90 como color de texto.**: Calcule el contraste WCAG de los tres sobre papel #FAF8F4. #6F7777 da 4.32:1, que reprueba AA (4.5:1) para todo texto menor a 24px, y el prototipo lo usa a 11.5 y 12.5px en ui.tsx:38, ui.tsx:89 y experiencias/[id]/page.tsx:52. #B9735A da 3.50:1 y no alcanza ni para texto grande en cuerpo. #A69C90 da 2.545:1 y reprueba incluso el minimo de 3:1 para texto grande, y sin embargo lleva texto en experiencias/[id]/page.tsx:26, 49, 223 y 243. Los sustitutos que propongo dan 4.91:1, 5.69:1 y quedan dentro de la familia cromatica: #8F5341 ya es el terracota de texto que el propio prototipo eligio en ui.tsx:66 y en los mapas de dominio.ts:322 y 328.
- **El lector se escribe en Tailwind con valores arbitrarios, mas un bloque acotado de CSS propio en globals.css para la rejilla de tres anchos y para la prosa. No se usan objetos de estilo en linea.**: La lectura de componentes interactivos encontro tres dialectos conviviendo en el admin (Tailwind con tokens, Tailwind con hexadecimales crudos, y objetos CSSProperties en linea, este ultimo en familias/nueva/page.tsx:172-189, el peor archivo del repositorio). El prototipo de PersonaLab hoy suma un cuarto dialecto: estilos en linea en ui.tsx, WorkspaceNav.tsx y todas sus paginas. Tailwind es el dialecto mayoritario del repositorio, tailwind.config.ts:5 ya cubre ./app/**, y las clases funcionan igual dentro de /prototipo. Lo que Tailwind no expresa limpio es la rejilla de lineas nombradas y la prosa con hijos arbitrarios, y eso va a globals.css, que hoy tiene once lineas y puede crecer.
- **Los bloques de video quedan prohibidos en el tiempo de Ignicion. El editor no debe ofrecerlos ahi, y si existen por dato heredado, el lector no los renderiza.**: PAPEL_SOFTWARE.ignicion (dominio.ts:29) dice 'Software mudo'. Un video es lo mas ruidoso que puede haber en una pantalla, y la ignicion es el dia en que doce personas estan en circulo con un objeto en la mano. Permitirlo tecnicamente y confiar en que nadie lo use es como dejar el boton puesto. Ademas COLUMNA_KIT.humano en dominio.ts:63-64 fija la regla hermana: 'Solo se transmite en formacion presencial. Jamas por video'.

# El lector del participante · PersonaLab

Como ve una persona una experiencia publicada. Especificación de implementación.

Todo lo que sigue está anclado a archivos del repositorio. Cuando afirmo algo del código, cito archivo y línea. Cuando propongo algo nuevo, lo digo.

---

## 0. Alcance

**Cubre.** La superficie de lectura del participante y del moderador cuando abren una experiencia publicada: dirección visual, render de cada tipo de bloque, navegación interna, distinción por rol, teléfono y los tres momentos de transición.

**No cubre.** El editor del back office (otra especificación). El esquema de Supabase. El flujo de compra y otorgamiento del grant. La entrega de correos de convocatoria.

**Rutas.**

```
/experiencia/[expId]                    → portada
/experiencia/[expId]/[bisagraId]        → lectura de una bisagra
/experiencia/[expId]/cierre             → cierre de la experiencia
```

En el prototipo, bajo `/prototipo/personalab/lector/...` para no chocar con `portal/app/prototipo/experiencia/[id]/page.tsx`, que hoy es la vista de estructura, no de lectura.

**Dos maneras de entrar, decididas por la experiencia.**

`Experiencia.abreEspacioAlForo` (`dominio.ts:88`) gobierna quién existe como lector:

- `false` (Metamorfosis, `dominio.ts:139`): el único lector es el moderador. Nadie del foro tiene cuenta. La pantalla existe para que el moderador lea, prepare y en su caso proyecte.
- `true` (El Presente como Regalo, `dominio.ts:171`): cada persona del foro recibe un enlace mágico y lee por su cuenta. El moderador ve lo mismo más sus capas.

El interruptor "Ver como participante" existe en los dos casos. Cuando `abreEspacioAlForo` es `false`, la banda del moderador añade: `Nadie más abre esta pantalla. Esta vista es para que sepas qué vas a proyectar.`

---

## 1. Dirección visual

### 1.1 Qué se hereda de Trascendencia y qué cambia

| Pieza | Trascendencia hoy | PersonaLab lector | Por qué |
|---|---|---|---|
| Lienzo | `bg-[#0C0C0C]` (`(participant)/layout.tsx:35`) | `bg-[#FAF8F4]` | `BRAND.md:60` da al blanco el rol de lectura. La única lectura inmersiva bien resuelta del portal ya es clara: `acuerdos/[id]/page.tsx:36-47` |
| Acento | Dorado `#C9A96E`, 114 apariciones | Terracota `#B9735A` como filete, `#8F5341` como texto | `BRAND.md:83` da terracota a las tres marcas como acento humano |
| Color rector | No existe, el dorado hace todo | Teal `#002B34` en títulos, enlaces y estructura | `BRAND.md:83`: PersonaLab domina en teal |
| Familia | DM Sans más Cormorant (`app/layout.tsx:6-20`) | Sans de sistema, sola | `BRAND.md:100-102` |
| Peso de titular | `font-light` (300) en Cormorant | `font-extralight` (200) en sans | `BRAND.md:113` |
| Ancho de lectura | `max-w-lg` = 512px a 14px | 620px a 18px | 512px a `text-sm` da 40 caracteres: eso es un mensaje, no un texto |
| Envoltura del texto | Toda prosa dentro de tarjeta (`info/page.tsx:147-156`) | Prosa sin tarjeta, sobre el papel | `BRAND.md:146`: amplio, sereno, sin saturar |
| Navegación | Barra inferior fija de 64px (`ParticipantNav.tsx:54-82`) | Barra superior de 52px, sin barra inferior fija | Leer es un modo, no una pestaña |
| **Se hereda tal cual** | El modo documento: cambiar de color y ensanchar el contenedor para leer (`firmar/[token]/page.tsx:115-123`) | Igual, invertido: el lector es claro y los momentos son profundos | Es lo mejor que tiene el portal |
| **Se hereda tal cual** | El vacío que explica en lugar de esconder (`programa/page.tsx:234-239`) | Igual, con contraste corregido | Es lo que hace legible el contenido que va llegando |
| **Se hereda tal cual** | El control que se convierte en su estado final (`CheckInButton.tsx:65-80`) | Igual, para el bloque `gesto` | Mejor patrón de guardado del repositorio |
| **No se hereda** | El sello `text-white/20` de "Disponible desde" (`programa/page.tsx:256`) | Etiqueta legible en `#8F5341` | `white/20` es invisible a propósito de nadie |
| **No se hereda** | Emojis mezclados con SVG (`programa/page.tsx:205`, `avisos/page.tsx:55`) | Solo SVG trazo 1.5, o nada | Rompe el registro |
| **No se hereda** | Guion largo en copy (`info/page.tsx:142`, `mi-retiro/page.tsx:264`) | Prohibido | Regla dura del usuario |

### 1.2 Paleta del lector

Fuente: `BRAND.md:51-70`, con tres correcciones de contraste calculadas por mí sobre papel `#FAF8F4`.

**Superficies**

| Uso | Hex | Dónde |
|---|---|---|
| Papel de lectura | `#FAF8F4` | Fondo de toda la lectura |
| Papel elevado | `#EFE9E0` | Fondo del bloque `objeto`, placeholder de imagen |
| Blanco | `#FFFFFF` | Solo el bloque `archivo` |
| Profundo | `#001A21` | Portada, cierre |
| Profundo elevado | `#002B34` | Interstitial de cambio de tiempo, banda del moderador |
| Filete claro | `#E5DED4` | Bordes de bloque utilitario, barra superior |
| Divisor interno | `#EFE9E0` | Filas de la hoja de ruta |

**Texto sobre papel `#FAF8F4`**

| Rol | Hex | Contraste | Regla |
|---|---|---|---|
| Cuerpo, títulos H3 | `#14181B` | **16.83:1** | Todo el texto de lectura |
| Títulos H1 y H2, enlaces | `#002B34` | **14.2:1** | Estructura |
| Metadatos, pies de foto | `#676E6E` | **4.91:1** | **Sustituye a `#6F7777`** |
| Etiquetas terracota | `#8F5341` | **5.69:1** | **Sustituye a `#B9735A` en texto** |
| Filetes terracota | `#B9735A` | no aplica | Solo reglas, bordes y display de 24px o más |

**Prohibido en texto.** `#6F7777` da **4.32:1** y reprueba AA por debajo de 24px, y el prototipo lo usa a 11.5 y 13.5px en `ui.tsx:38`, `ui.tsx:89` y `experiencias/[id]/page.tsx:52`. `#B9735A` da **3.50:1**. `#A69C90` da **2.545:1** y no alcanza ni el mínimo de texto grande, pese a llevar texto en `experiencias/[id]/page.tsx:26, 49, 223, 243`.

**Texto sobre profundo `#001A21`**

| Rol | Valor | Contraste |
|---|---|---|
| Titular | `#FFFFFF` | 18.5:1 |
| Cuerpo | `text-white/70` | **9.13:1** |
| Metadato | `text-white/55` | **5.67:1** |
| Acento | `#D8AC96` (`terra-lo`, `brand.css:14`) | **8.77:1** |
| Filete | `rgba(255,255,255,.12)` | no aplica |

### 1.3 Escala tipográfica

Familia: `var(--font-lab)`, peso base 300.

| Rol | Teléfono | Escritorio | Peso | Tracking | Color |
|---|---|---|---|---|---|
| Display de portada | 40px / lh 1.00 | 68px / lh 1.00 | 200 | −0.03em | `#FFFFFF` |
| Título de cierre | 28px / lh 1.15 | 38px / lh 1.15 | 200 | −0.025em | `#FFFFFF` |
| Nombre de tiempo | 32px / lh 1.05 | 44px / lh 1.05 | 200 | −0.03em | `#FFFFFF` |
| H1 de bisagra | 28px / lh 1.12 | 36px / lh 1.10 | 200 | −0.025em | `#002B34` |
| Entradilla | 19px / lh 1.60 | 21px / lh 1.60 | 300 | −0.005em | `#002B34` |
| H2 interno | 24px / lh 1.20 | 30px / lh 1.15 | 200 | −0.02em | `#002B34` |
| H3 interno | 17px / lh 1.35 | 18px / lh 1.35 | 500 | 0 | `#14181B` |
| **Cuerpo** | **17px / lh 1.75** | **18px / lh 1.80** | **300** | 0 | `#14181B` |
| Cita | 21px / lh 1.50 | 26px / lh 1.45 | 200 | −0.015em | `#002B34` |
| Pie de foto | 12.5px / lh 1.60 | 12.5px / lh 1.60 | 300 | 0 | `#676E6E` |
| Metadato | 12.5px / lh 1.50 | 13px / lh 1.50 | 300 | 0 | `#676E6E` |
| Eyebrow | 10px | 10px | 600 | 0.18em, mayúsculas | `#8F5341` |
| Eyebrow de marca | 10px | 10px | 600 | 0.34em, mayúsculas | `#D8AC96` |
| Etiqueta de grupo | 10px | 10px | 600 | 0.19em, mayúsculas | `#676E6E` |

**Medida de línea.** 620px a 18px en Helvetica Neue da aproximadamente **68 caracteres**, dentro de la banda de 60 a 75. En teléfono, 375px menos 40px de canal da 335px a 17px, aproximadamente **39 caracteres**, que es el techo real del formato.

**Prohibido.** Cuerpo por debajo de 17px. Cuerpo en `#676E6E`. Cursiva en pesos 200 o 300 por debajo de 19px: en el stack de sistema se deshilacha.

### 1.4 Rejilla y ritmo vertical

**Tres anchos.**

| Zona | Teléfono | Escritorio |
|---|---|---|
| Texto | 375 − 40 = 335px | 620px |
| Media | borde a borde, 375px | 820px |
| Sangrado | borde a borde | 100% |

**Ritmo vertical.** Base 4px. Margen superior de cada bloque:

| Bloque | Teléfono | Escritorio |
|---|---|---|
| Párrafo tras párrafo | 24px | 28px |
| H2 | 56px | 72px |
| H3 | 32px | 40px |
| Cita | 40px | 52px |
| Imagen, video | 36px | 48px |
| Archivo, objeto, consigna, nota, gesto | 32px | 40px |
| Pausa (arriba y abajo) | 64px | 80px |
| Pie de bisagra | 88px | 120px |
| Interstitial de tiempo | 88px | 120px |

### 1.5 CSS que hay que añadir a `portal/app/globals.css`

Hoy tiene once líneas. Se le añade esto, y nada más.

```css
:root {
  --font-lab: -apple-system, BlinkMacSystemFont, "Helvetica Neue",
              Helvetica, Arial, sans-serif;
}

/* Rejilla de tres anchos. Todo hijo DIRECTO es un bloque del catálogo. */
.lab-columna {
  display: grid;
  grid-template-columns:
    [borde-i] minmax(20px, 1fr)
    [media-i]  minmax(0, 100px)
    [texto-i]  minmax(0, 620px) [texto-f]
               minmax(0, 100px) [media-f]
               minmax(20px, 1fr) [borde-f];
}
.lab-columna > *            { grid-column: texto-i / texto-f; }
.lab-columna > .lab-media   { grid-column: media-i / media-f; }
.lab-columna > .lab-sangre  { grid-column: borde-i / borde-f; }

@media (max-width: 767px) {
  .lab-columna > .lab-media { grid-column: borde-i / borde-f; }
}

/* Suavizado: sobre papel claro, antialiased adelgaza el peso 300. */
.lab-lectura {
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
}
.lab-lectura ::selection { background: rgba(185,115,90,.22); }

/* Prosa. Subconjunto en línea permitido: strong, em, a, br, ul, li. */
.lab-prosa { font-size: 17px; line-height: 1.75; font-weight: 300; color: #14181B; }
@media (min-width: 768px) { .lab-prosa { font-size: 18px; line-height: 1.8; } }
.lab-prosa > p + p { margin-top: 24px; }
@media (min-width: 768px) { .lab-prosa > p + p { margin-top: 28px; } }
.lab-prosa strong { font-weight: 500; color: #002B34; }
.lab-prosa a {
  color: #002B34; text-decoration: none;
  border-bottom: 1px solid rgba(185,115,90,.55); padding-bottom: 1px;
}
.lab-prosa a:hover { border-bottom-color: #B9735A; }
.lab-prosa ul { margin: 20px 0; padding: 0; list-style: none; }
.lab-prosa li { position: relative; padding-left: 22px; margin-top: 10px; }
.lab-prosa li::before {
  content: ''; position: absolute; left: 4px; top: 13px;
  width: 6px; height: 1px; background: #B9735A;
}

/* Barra de scroll oculta, de verdad. Las clases scrollbar-hide y
   scrollbar-none que usan EventSubNav.tsx:69 y programa/page.tsx:137
   NO EXISTEN: tailwind.config.ts:17 declara plugins vacío. */
.lab-sin-barra { scrollbar-width: none; }
.lab-sin-barra::-webkit-scrollbar { display: none; }

@media (prefers-reduced-motion: reduce) {
  .lab-lectura *, .lab-lectura *::before, .lab-lectura *::after {
    animation-duration: .01ms !important; transition-duration: .01ms !important;
  }
}
```

**Además, dos correcciones fuera del lector.**

1. `portal/app/layout.tsx:37` declara `maximum-scale=1`, que bloquea el zoom con dos dedos. En un lector de texto largo es un fallo de accesibilidad. Quitarlo.
2. `portal/app/layout.tsx:38` fija `theme-color` en `#111111`, que es el negro de Trascendencia. En las rutas de PersonaLab exportar `viewport` con `themeColor: '#001A21'` en la portada y `'#FAF8F4'` en la lectura.

---

## 2. Catálogo de bloques

Once tipos. Cada uno con su markup exacto. El contenedor común:

```tsx
<article className="lab-lectura lab-columna font-[family-name:var(--font-lab)]
                    bg-[#FAF8F4] pb-0">
  {bloques.map(b => <Bloque key={b.id} b={b} />)}
</article>
```

### Encabezado de la bisagra (siempre, antes del primer bloque)

```tsx
<header className="pt-10 md:pt-16">
  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8F5341]">
    Víspera
  </div>
  <h1 className="mt-4 text-[28px] md:text-[36px] leading-[1.12] md:leading-[1.10]
                 font-extralight tracking-[-0.025em] text-[#002B34] text-balance">
    La carta de convocatoria
  </h1>
  <p className="mt-5 text-[19px] md:text-[21px] leading-[1.6] font-light
                tracking-[-0.005em] text-[#002B34]/85 max-w-[46ch]">
    Lo que reciben los miembros del foro dos semanas antes. Define el tono con el que llegan.
  </p>
  <div className="mt-8 h-px bg-[#E5DED4]" />
</header>
```

La entradilla sale de `Bisagra.descripcion` (`dominio.ts:45`). Esto corrige de raíz el hallazgo de que la página de detalle de evento del admin no tiene título (`eventos/[id]/page.tsx:127`).

---

### 1. `parrafo`

```tsx
<div className="lab-prosa mt-6 md:mt-7"
     dangerouslySetInnerHTML={{ __html: b.texto }} />
```

17px / 1.75 en teléfono, 18px / 1.8 en escritorio, peso 300, `#14181B`, 620px. Sin tarjeta, sin borde, sin fondo.

Subconjunto permitido: `<p> <strong> <em> <a> <br> <ul> <li>`. Se sanea en el servidor con lista blanca. Prohibido `<h1>` a `<h6>` dentro del párrafo: los títulos son su propio bloque.

---

### 2. `titulo`

Nivel 2:

```tsx
<h2 id={b.id}
    className="mt-14 md:mt-[72px] mb-4 md:mb-5
               text-[24px] md:text-[30px] leading-[1.2] md:leading-[1.15]
               font-extralight tracking-[-0.02em] text-[#002B34] text-balance
               scroll-mt-[68px]">
  {b.texto}
</h2>
```

Nivel 3:

```tsx
<h3 className="mt-8 md:mt-10 mb-2
               text-[17px] md:text-[18px] leading-[1.35]
               font-medium text-[#14181B]">
  {b.texto}
</h3>
```

El `id` y `scroll-mt-[68px]` (52px de barra más 16px de aire) son lo que permite que la barra superior siga la sección y que la hoja de ruta salte a un punto interno.

---

### 3. `cita`

```tsx
<figure className="mt-10 md:mt-[52px] mb-10 md:mb-[52px]">
  <div className="w-10 h-px bg-[#B9735A]" aria-hidden="true" />
  <blockquote className="mt-5 text-[21px] md:text-[26px]
                         leading-[1.5] md:leading-[1.45]
                         font-extralight tracking-[-0.015em]
                         text-[#002B34] text-balance">
    {b.texto}
  </blockquote>
  {b.atribucion && (
    <figcaption className="mt-4 text-[10px] font-semibold uppercase
                           tracking-[0.16em] text-[#8F5341]">
      {b.atribucion}
    </figcaption>
  )}
</figure>
```

Filete terracota de 40 × 1px arriba, no comillas grandes ni barra lateral. Sin cursiva: a peso 200 el stack de sistema la deshilacha. Sin comillas tipográficas en el dato: las pone el diseño o no van.

---

### 4. `imagen`

```tsx
<figure className="lab-media mt-9 md:mt-12">
  <div className={`relative overflow-hidden bg-[#EFE9E0] md:rounded-[3px]
                   ${RATIO[b.ratio ?? '3:2']}`}>
    <Image src={b.url} alt={b.alt ?? ''} fill
           sizes="(max-width: 767px) 100vw, 820px"
           className="object-cover" />
  </div>
  {b.pie && (
    <figcaption className="mt-3 px-5 md:px-0 max-w-[52ch]
                           text-[12.5px] leading-[1.6] font-light text-[#676E6E]">
      {b.pie}
    </figcaption>
  )}
</figure>
```

```ts
const RATIO = {
  '3:2':  'aspect-[3/2]',
  '4:5':  'aspect-[4/5]',
  '16:9': 'aspect-video',
  '1:1':  'aspect-square',
} as const
```

Teléfono: borde a borde, sin radio (el radio en sangrado se ve como error). Escritorio: 820px, radio 3px. `next/image` con `fill`, nunca `<img>` crudo: `equipo/page.tsx:64-70` es la única imagen del portal y usa `<img>` con el linter apagado.

**Este patrón no existe en el repositorio.** Es nuevo. No hay ni una imagen dentro de texto de lectura en todo el lado participante.

---

### 5. `video`

```tsx
<figure className="lab-media mt-9 md:mt-12">
  <div className="relative aspect-video overflow-hidden bg-[#001A21] md:rounded-[3px]">
    <video className="w-full h-full object-cover"
           controls playsInline preload="metadata"
           poster={b.poster} src={b.url} />
  </div>
  <figcaption className="mt-3 px-5 md:px-0 flex items-baseline justify-between gap-4
                         text-[12.5px] leading-[1.6] font-light text-[#676E6E]">
    <span className="max-w-[52ch]">{b.pie}</span>
    {b.duracion && (
      <span className="shrink-0 tabular-nums text-[#676E6E]">{b.duracion}</span>
    )}
  </figcaption>
</figure>
```

**Reglas duras.** Nunca `autoPlay`. Nunca `loop`. `poster` obligatorio: sin él el bloque es un rectángulo negro. `preload="metadata"`, no `auto`: el participante está en datos móviles.

**Prohibido en el tiempo de Ignición.** `PAPEL_SOFTWARE.ignicion` (`dominio.ts:29`) dice "Software mudo". El editor no ofrece el bloque ahí y el lector no lo renderiza aunque exista por dato heredado.

Recomendación de alojamiento: propio o Mux, no el reproductor de YouTube. Al terminar, YouTube encima una rejilla de recomendaciones ajenas, y eso destruye el cierre de un bloque contemplativo.

---

### 6. `archivo`

```tsx
<a href={b.url} download
   className="group mt-8 md:mt-10 flex items-center gap-4 no-underline
              bg-white border border-[#E5DED4] hover:border-[#B9735A]
              rounded-[4px] px-4 py-4 md:px-5 md:py-[18px] transition-colors">
  <span className="shrink-0 w-11 h-11 grid place-items-center rounded-[3px]
                   border border-[#002B34]/25 text-[9px] font-semibold
                   uppercase tracking-[0.12em] text-[#002B34]">
    PDF
  </span>
  <span className="min-w-0 flex-1">
    <span className="block truncate text-[14.5px] font-normal text-[#002B34]">
      {b.nombre}
    </span>
    <span className="block mt-0.5 text-[11.5px] font-light text-[#676E6E]">
      PDF · {b.peso} · {b.detalle}
    </span>
  </span>
  <span className="shrink-0 text-[10px] font-semibold uppercase
                   tracking-[0.14em] text-[#8F5341]
                   group-hover:text-[#B9735A] transition-colors">
    Descargar
  </span>
</a>
```

Alto real: 44 + 32 = 76px en teléfono. Sobra sobre los 44px de objetivo táctil.

`audiencia` por omisión: **`'solo_moderador'`**. El caso de uso que el usuario nombró (`cargar pdf que el moderador va a descargar`) es del moderador. Que el participante descargue algo es la excepción y hay que declararla.

Es lo contrario de `documentos/page.tsx`, que es la única lista de descargables del portal, está escrita con estilos en línea sin Tailwind, monta tarjetas `#fff` dentro del layout oscuro y en la línea 67 pinta el nombre sin declarar color, heredando `#F5F0E8`: crema sobre blanco, ilegible.

---

### 7. `objeto`

La pieza física del kit. Se anuncia, no se entrega.

```tsx
<div className="mt-8 md:mt-10 border-t border-[#B9735A]
                bg-[#EFE9E0]/55 px-4 py-4 md:px-5 md:py-[18px]">
  <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
    Se recibe en la sala
  </div>
  <div className="mt-2 text-[15px] font-normal text-[#002B34]">
    {b.nombre}
  </div>
  <p className="mt-1.5 text-[13px] leading-[1.6] font-light text-[#676E6E] max-w-[54ch]">
    {b.detalle}
  </p>
</div>
```

**Sin enlace, sin botón, sin icono de descarga.** `COLUMNA_KIT.objeto.regla` (`dominio.ts:59-60`) lo fija: "Nunca digital, nunca descargable, nunca sustituible por PDF". El borde superior terracota de 1px, y no el lateral, dice "esto entra en la lectura desde fuera de la pantalla".

---

### 8. `consigna`

Lo que hay que hacer o traer. Es la única voz imperativa del lector.

```tsx
<div className="mt-8 md:mt-10 border-l-2 border-[#002B34] pl-4 md:pl-5 py-0.5">
  <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#002B34]/65">
    {b.nombre /* "Lo que hay que traer" */}
  </div>
  <p className="mt-2 text-[17px] md:text-[18px] leading-[1.6] font-light text-[#14181B]">
    {b.texto}
  </p>
</div>
```

Barra izquierda teal de 2px. Sin fondo: no es un aviso, es parte del texto con más peso.

---

### 9. `nota` (solo moderador)

```tsx
<aside className="mt-8 md:mt-10 border-l-2 border-[#B9735A] bg-[#B9735A]/[0.06]
                  px-4 py-4 md:px-5 md:py-[18px]">
  <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
    Solo tú ves esto
  </div>
  <div className="lab-prosa mt-2 [&>p]:text-[15px] [&>p]:leading-[1.65]
                  [&>p+p]:mt-4"
       dangerouslySetInnerHTML={{ __html: b.texto }} />
</aside>
```

Hereda el tratamiento que el prototipo ya inventó para la nota de diseño (`experiencias/[id]/page.tsx:130-147`: fondo `rgba(185,115,90,.07)`, borde `rgba(185,115,90,.26)`), convertido a barra lateral para que se distinga de la consigna sin leer la etiqueta.

`audiencia` siempre `'solo_moderador'`, no configurable.

---

### 10. `pausa`

El aire que `BRAND.md:146` pide, hecho elemento.

```tsx
<div className="mt-16 md:mt-20 mb-16 md:mb-20 flex justify-center gap-3"
     aria-hidden="true">
  <span className="w-[3px] h-[3px] rounded-full bg-[#B9735A]/55" />
  <span className="w-[3px] h-[3px] rounded-full bg-[#B9735A]/55" />
  <span className="w-[3px] h-[3px] rounded-full bg-[#B9735A]/55" />
</div>
```

Tres puntos de 3px con 12px de separación, 128px de aire arriba y abajo en teléfono. Separa dos movimientos de un mismo texto sin abrir sección.

---

### 11. `gesto`

La única superficie donde el participante escribe. Corresponde a "El gesto mínimo: lo que cada quien se comprometió a hacer, en una sola frase suya" (`dominio.ts:151`).

Estado vacío:

```tsx
<div className="mt-8 md:mt-10 border-t border-[#B9735A] pt-5">
  <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
    Tu frase
  </div>
  <textarea rows={2} maxLength={140} autoComplete="off"
    placeholder="Escríbela con tus palabras."
    className="mt-3 w-full bg-transparent resize-none
               text-[19px] md:text-[21px] leading-[1.55] font-light
               text-[#002B34] placeholder:text-[#676E6E]/70
               border-b border-[#E5DED4] focus:border-[#B9735A]
               outline-none pb-2 transition-colors" />
  <button disabled={!texto.trim()}
    className="mt-5 px-5 py-2.5 rounded-[4px]
               bg-[#002B34] text-white text-[12.5px] font-medium
               hover:bg-[#0A3B45] disabled:opacity-40
               disabled:cursor-not-allowed transition-colors">
    Guardar
  </button>
</div>
```

Estado guardado: **el control se convierte en su resultado**, exactamente como `CheckInButton.tsx:65-80`.

```tsx
<div className="mt-8 md:mt-10 border-t border-[#B9735A] pt-5">
  <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
    Tu frase
  </div>
  <p className="mt-3 text-[19px] md:text-[21px] leading-[1.55] font-light text-[#002B34]">
    {texto}
  </p>
  <button onClick={editar}
    className="mt-3 text-[11.5px] text-[#676E6E] hover:text-[#002B34]
               transition-colors">
    Cambiarla
  </button>
</div>
```

**Reglas duras.** 140 caracteres, sin contador visible. Sin racha, sin conteo de meses cumplidos, sin "has escrito 4 de 6". Sin toast: el propio texto en su lugar es la confirmación. `maxLength` 140 y `rows={2}` porque es una frase, no un diario.

**Riesgo declarado.** En cuanto exista una tabla con una fila por participante y mes, alguien va a querer contar filas y mostrar el conteo. Esa disciplina se sostiene en la revisión de código.

---

### Resumen del catálogo

| # | Tipo | Ancho | Audiencia por omisión | Restricción |
|---|---|---|---|---|
| 1 | `parrafo` | texto | todos | HTML en lista blanca |
| 2 | `titulo` | texto | todos | niveles 2 y 3 |
| 3 | `cita` | texto | todos | sin cursiva |
| 4 | `imagen` | media | todos | `alt` obligatorio |
| 5 | `video` | media | todos | **prohibido en Ignición** |
| 6 | `archivo` | texto | **solo moderador** | URL firmada |
| 7 | `objeto` | texto | todos | nunca enlazable |
| 8 | `consigna` | texto | todos | una por bisagra |
| 9 | `nota` | texto | **solo moderador**, fijo | |
| 10 | `pausa` | texto | todos | decorativo |
| 11 | `gesto` | texto | todos | **solo en Retorno**, 140 caracteres |

---

## 3. Navegación

### 3.1 Barra superior, 52px

```tsx
<header className="sticky top-0 z-40 h-[52px]
                   bg-[#FAF8F4]/[0.88] backdrop-blur-[14px] backdrop-saturate-[160%]
                   border-b border-[#E5DED4]">
  <div className="mx-auto max-w-[860px] h-full px-5 flex items-center justify-between gap-3">

    <Link href={`/experiencia/${expId}`}
          className="flex items-center gap-2 min-w-0 no-underline
                     text-[#676E6E] hover:text-[#002B34] transition-colors">
      <svg className="w-[15px] h-[15px] shrink-0" viewBox="0 0 16 16" fill="none"
           stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M10 3L5 8l5 5" />
      </svg>
      <span className="text-[12.5px] font-light truncate">{contexto}</span>
    </Link>

    <button onClick={abrirHoja}
            className="shrink-0 h-11 -mr-2 px-3 flex items-center
                       text-[10px] font-semibold uppercase tracking-[0.16em]
                       text-[#002B34] hover:text-[#B9735A] transition-colors">
      Hoja de ruta
    </button>
  </div>
</header>
```

El `backdrop-blur-[14px]` con `backdrop-saturate-[160%]` es el mismo tratamiento de `#nav.scrolled` en `assets/brand.css:33`.

**El texto `contexto` cambia al hacer scroll.** Al inicio muestra el nombre de la experiencia. Al pasar el primer `h2`, muestra el título de la sección en la que uno está. Con `IntersectionObserver`, no con cálculo de scroll:

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

Esto es lo que responde "dónde estoy" sin contar nada. La flecha izquierda **siempre sube un nivel** a la portada de la experiencia, nunca es el atrás del navegador.

### 3.2 La hoja de ruta

Hoja inferior en teléfono, diálogo centrado en escritorio.

```tsx
<div role="dialog" aria-modal="true" aria-label="Hoja de ruta"
     onClick={cerrar}
     className="fixed inset-0 z-50 bg-[#001A21]/60 backdrop-blur-[2px]
                flex flex-col justify-end md:items-center md:justify-center md:p-6">
  <div onClick={e => e.stopPropagation()}
       className="bg-[#FAF8F4] border-t border-[#E5DED4]
                  md:border md:rounded-[6px] md:max-w-[440px] md:w-full
                  rounded-t-[10px] max-h-[78vh] overflow-y-auto lab-sin-barra
                  px-5 pt-5 pb-[max(28px,env(safe-area-inset-bottom))]">

    <div className="flex items-baseline justify-between gap-4 pb-4">
      <div className="text-[15px] font-light text-[#002B34]">{exp.nombre}</div>
      <button onClick={cerrar} aria-label="Cerrar"
              className="shrink-0 -mr-2 w-11 h-11 grid place-items-center
                         text-[#676E6E] hover:text-[#002B34] transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 16 16" stroke="currentColor"
             strokeWidth="1.5" strokeLinecap="round">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>

    {TIEMPOS.map(t => (
      <section key={t} className="mt-5 first:mt-0">
        <div className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#676E6E]">
          {ETIQUETA_TIEMPO[t]}
        </div>
        {bisagrasDe(t).map(bi => <FilaHoja key={bi.id} bi={bi} />)}
      </section>
    ))}
  </div>
</div>
```

**Cuatro estados de fila, y ninguno es un porcentaje.**

Actual:
```tsx
<div className="flex items-baseline gap-3 py-3 border-t border-[#EFE9E0]">
  <span className="shrink-0 w-1 h-1 rounded-full bg-[#B9735A] translate-y-[-3px]" />
  <span className="flex-1 text-[14.5px] font-normal text-[#002B34]">{bi.titulo}</span>
  <span className="shrink-0 text-[9.5px] font-semibold uppercase
                   tracking-[0.14em] text-[#8F5341]">Aquí estás</span>
</div>
```

Abierta:
```tsx
<Link href={`/experiencia/${expId}/${bi.id}`}
      className="flex items-baseline gap-3 py-3 border-t border-[#EFE9E0]
                 no-underline group">
  <span className="shrink-0 w-1 h-1 rounded-full bg-[#E5DED4] translate-y-[-3px]" />
  <span className="flex-1 text-[14.5px] font-light text-[#002B34]
                   group-hover:text-[#B9735A] transition-colors">{bi.titulo}</span>
</Link>
```

En la sala (`soporte === 'sala'`), sin enlace:
```tsx
<div className="flex items-baseline gap-3 py-3 border-t border-[#EFE9E0]">
  <span className="shrink-0 w-1 h-1 rounded-full border border-[#E5DED4]
                   translate-y-[-3px]" />
  <span className="flex-1 text-[14.5px] font-light text-[#676E6E]">{bi.titulo}</span>
  <span className="shrink-0 text-[9.5px] font-semibold uppercase
                   tracking-[0.14em] text-[#676E6E]">En la sala</span>
</div>
```

Todavía no abierta:
```tsx
<div className="flex items-baseline gap-3 py-3 border-t border-[#EFE9E0]">
  <span className="shrink-0 w-1 h-1 rounded-full border border-[#E5DED4]
                   translate-y-[-3px]" />
  <span className="flex-1 text-[14.5px] font-light text-[#676E6E]">{bi.titulo}</span>
  <span className="shrink-0 text-[9.5px] font-semibold uppercase
                   tracking-[0.14em] text-[#8F5341]">Se abre el 12 de agosto</span>
</div>
```

Ese último estado corrige el sello `text-white/20` de `programa/page.tsx:256`, que sobre `#1A1A1A` es prácticamente invisible.

Las bisagras de sala aparecen listadas y sin enlace **a propósito**. `SOPORTE_NOTA.sala` (`dominio.ts:34`) dice "Ocurre entre personas. El software no entra". El participante ve la forma completa de la experiencia y entiende que la parte central no está en la pantalla porque no debe estarlo.

**El diálogo cierra con Escape**, atrapa el foco y bloquea el scroll del cuerpo. El modal de `ItinerarioClient.tsx:359-437` no hace ninguna de las tres y es la única referencia del repositorio.

### 3.3 Botón flotante en teléfono

La barra está arriba y el pulgar abajo. Un botón de 44px resuelve el alcance.

```tsx
<button onClick={abrirHoja} aria-label="Hoja de ruta"
        className="md:hidden fixed right-4 z-30 w-11 h-11 rounded-full
                   bg-[#002B34] text-[#FAF8F4] grid place-items-center
                   shadow-[0_2px_14px_rgba(0,26,33,.22)]
                   bottom-[max(20px,env(safe-area-inset-bottom))]">
  <svg className="w-[17px] h-[17px]" viewBox="0 0 18 18" stroke="currentColor"
       strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 5h12M3 9h12M3 13h7" />
  </svg>
</button>
```

Mismo lugar y tamaño que `HelpButton.tsx` (`fixed bottom-20 right-4 w-10 h-10`), pero a `bottom-5` porque en el lector no hay barra inferior que esquivar.

### 3.4 Pie de bisagra

```tsx
<footer className="mt-[88px] md:mt-[120px] border-t border-[#E5DED4]
                   pt-8 md:pt-10 pb-16 md:pb-24">
  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#676E6E]">
    Aquí termina
  </div>
  <div className="mt-1.5 text-[13.5px] font-light text-[#676E6E]">
    {bisagraActual.titulo}
  </div>

  {siguiente ? (
    <Link href={`/experiencia/${expId}/${siguiente.id}`}
          className="group mt-7 flex items-baseline gap-3 no-underline">
      <span className="shrink-0 text-[10px] font-semibold uppercase
                       tracking-[0.18em] text-[#8F5341]">Sigue</span>
      <span className="text-[22px] md:text-[26px] font-extralight
                       tracking-[-0.02em] leading-[1.25] text-[#002B34]
                       group-hover:text-[#B9735A] transition-colors text-balance">
        {siguiente.titulo}
      </span>
    </Link>
  ) : (
    <Link href={`/experiencia/${expId}/cierre`}
          className="group mt-7 inline-flex items-baseline gap-3 no-underline">
      <span className="text-[22px] md:text-[26px] font-extralight
                       tracking-[-0.02em] text-[#002B34]
                       group-hover:text-[#B9735A] transition-colors">
        Cerrar la víspera
      </span>
    </Link>
  )}
</footer>
```

Cuando la siguiente bisagra es de sala, el enlace se sustituye por texto sin acción:

```tsx
<div className="mt-7">
  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8F5341]">
    Lo que sigue no pasa aquí
  </div>
  <div className="mt-2 text-[22px] md:text-[26px] font-extralight
                  tracking-[-0.02em] text-[#676E6E]">
    {siguiente.titulo}
  </div>
  <p className="mt-3 text-[14px] leading-[1.7] font-light text-[#676E6E] max-w-[42ch]">
    Ocurre entre personas, en la sala. No hay nada que abrir.
  </p>
</div>
```

### 3.5 Reanudar

```ts
const CLAVE = (expId: string) => `lab_ultima_${expId}`

// Al montar la lectura, en useEffect, nunca durante el render.
// OperacionClient.tsx:512-518 lee localStorage en el inicializador de
// useState y el propio autor lo parchea abajo por desajuste de SSR.
useEffect(() => {
  localStorage.setItem(CLAVE(expId), bisagraId)
}, [expId, bisagraId])
```

En la portada, el llamado se redacta con eso:

- Sin puntero: `Entrar`
- Con puntero: `Continuar en: Lo que hay que traer`

Es un puntero a un `id`, no un índice ni un conteo. Si algún día sube a Supabase, la columna se llama `ultima_bisagra_id`. Nunca `progress`.

### 3.6 Prohibido en la navegación

Barra de progreso. Porcentaje. "3 de 7". Casilla de "Marcar como leída". Racha. Insignia. Confeti. Sonido. Candado sobre lo no abierto. Cualquier conteo de lo hecho contra lo pendiente.

---

## 4. Moderador y participante en la misma pantalla

### 4.1 El filtrado ocurre en el servidor

```ts
export type Rol = 'moderador' | 'participante'
export type Audiencia = 'todos' | 'solo_moderador'

export function bloquesVisibles(bloques: Bloque[], rol: Rol): Bloque[] {
  if (rol === 'moderador') return bloques
  return bloques.filter(b => b.audiencia === 'todos')
}

export function bisagrasVisibles(bs: Bisagra[], rol: Rol): Bisagra[] {
  if (rol === 'moderador') return bs
  return bs.filter(b => b.soporte !== 'sala')
}
```

Se llama **antes de serializar**. Nunca se envía un bloque para ocultarlo con CSS. Los bloques de `archivo` llevan la URL del guion del moderador (`dominio.ts:161`), que es la pieza que hace licenciable la experiencia a un capítulo: si viaja en el HTML aunque esté oculto, cualquiera con el inspector abierto se la lleva.

**El participante no ve huecos.** Ni candado, ni "contenido reservado", ni contador de bloques ocultos. La regla del vestíbulo ya lo dice: "jamás se muestra un catálogo con candados" (`prototipo/page.tsx:12-13`).

### 4.2 La banda del moderador, 30px

Encima de la barra superior. La barra pasa a `sticky top-[30px]`.

```tsx
<div className="h-[30px] bg-[#002B34] text-[#F2EFE9]
                flex items-center justify-center gap-4 px-5
                text-[10px] uppercase tracking-[0.16em]">
  <span className="text-[#D8AC96] font-semibold">Moderador</span>
  <span className="truncate opacity-85">Ves todo lo que no ve el foro</span>
  <Link href={`?como=participante`}
        className="shrink-0 opacity-70 hover:opacity-100 underline
                   underline-offset-[3px] decoration-[#D8AC96]/50 transition-opacity">
    Ver como participante
  </Link>
</div>
```

Es el mismo gesto que la tira de prototipo de `prototipo/layout.tsx:24-46`: 11px, `letter-spacing .16em`, mayúsculas, fondo `#002B34`, acento terracota en la palabra que nombra el modo.

En modo previsualización, la banda cambia a terracota y el enlace vuelve:

```tsx
<div className="h-[30px] bg-[#8F5341] text-[#FAF8F4] ...">
  <span className="font-semibold">Vista de participante</span>
  <span className="truncate opacity-85">Así se ve para el foro</span>
  <Link href="?" className="shrink-0 underline ...">Volver a mi vista</Link>
</div>
```

`?como=participante` solo lo acepta el servidor si el rol real es moderador. Un participante que lo escriba a mano no cambia nada.

### 4.3 Tabla de diferencias

| Elemento | Participante | Moderador |
|---|---|---|
| Bloque `parrafo`, `cita`, `imagen`, `video` | sí | sí |
| Bloque `consigna`, `objeto`, `pausa` | sí | sí |
| Bloque `nota` | **no está en el payload** | sí, con barra terracota |
| Bloque `archivo` con `audiencia: 'solo_moderador'` | **no está en el payload** | sí, descargable |
| Bisagras con `soporte: 'sala'` | listadas en la hoja de ruta, sin enlace | abribles y legibles |
| Bisagras de Víspera y Retorno | sí | sí |
| Banda superior de 30px | no | sí |
| Interruptor de previsualización | no | sí |
| Duración de cada bisagra (`Bisagra.duracion`, `dominio.ts:50`) | no | sí, junto al título |
| `Bisagra.requiere` (`dominio.ts:51`) | no | sí, lista al inicio |
| Bloque `gesto` | sí, escribe | sí, escribe la suya |

El moderador **no** ve las frases que escribieron otros. Eso es material de la sala.

### 4.4 Lo que el moderador ve de más al inicio de una bisagra

```tsx
{rol === 'moderador' && bi.requiere?.length && (
  <div className="mt-6 border-l-2 border-[#B9735A] bg-[#B9735A]/[0.06]
                  px-4 py-4 md:px-5 md:py-[18px]">
    <div className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8F5341]">
      Necesitas en la mano
    </div>
    <ul className="mt-2.5 space-y-1.5">
      {bi.requiere.map(r => (
        <li key={r} className="relative pl-[18px] text-[14px] leading-[1.55]
                               font-light text-[#14181B]">
          <span className="absolute left-0 top-[10px] w-[6px] h-px bg-[#B9735A]" />
          {r}
        </li>
      ))}
    </ul>
    {bi.duracion && (
      <div className="mt-3 pt-3 border-t border-[#B9735A]/25
                      text-[11.5px] font-light text-[#8F5341] tabular-nums">
        {bi.duracion}
      </div>
    )}
  </div>
)}
```

---

## 5. Lectura en teléfono

Referencia 375 × 812 (iPhone 13 mini y equivalentes Android). Es donde va a pasar.

### 5.1 Medidas

| Elemento | Valor |
|---|---|
| Canal lateral | 20px |
| Ancho de texto | 335px |
| Media | 375px, borde a borde |
| Barra superior | 52px, o 82px con banda de moderador |
| `scroll-mt` de anclas | 68px, o 98px con banda |
| Cuerpo | 17px / 29.75px de interlínea |
| Caracteres por línea | aproximadamente 39 |
| Objetivo táctil mínimo | 44 × 44px |
| Botón flotante | 44px, `right-4`, `bottom: max(20px, env(safe-area-inset-bottom))` |
| Altura de hoja | `max-h-[78vh]` |
| Fondo de la hoja | `pb-[max(28px,env(safe-area-inset-bottom))]` |

### 5.2 Reglas de teléfono

1. **Sin barra inferior fija.** `ParticipantNav.tsx` de 64px más `pb-24` roba 96px de 812, un 12 por ciento de la pantalla, para navegar entre secciones que en el lector no se usan. El lector es un modo; se sale por la flecha o por la hoja.
2. **Imagen y video a sangre.** El radio desaparece por debajo de 768px: una esquina redonda contra el borde de la pantalla se lee como error de recorte.
3. **`100svh`, no `100vh`.** En la portada. Con `100vh` la barra de Safari tapa el llamado a entrar.
4. **`text-balance` en titulares.** Tailwind 3.4 lo trae. A 40px sobre 335px, un titular de cinco palabras parte mal sin él.
5. **Sin hover como única vía.** La ✕ revelada al pasar el ratón de `ChecklistClient.tsx:69` no existe en táctil.
6. **`playsInline` obligatorio** en `<video>`: sin él, iOS abre el reproductor a pantalla completa y expulsa al lector del texto.
7. **Un canal único, 20px.** El portal actual usa `px-6` en Mi Retiro, `px-5` en seis páginas, `px-4` en dos y 24px en línea en Documentos: al cambiar de pestaña el texto se desplaza de lado.
8. **`overflow-x` cero.** Todo `lab-sangre` debe estar dentro de la rejilla, nunca con `w-screen`, que en iOS suma el ancho de la barra de scroll y produce arrastre horizontal.

### 5.3 Puntos de corte

| Ancho | Texto | Media | Cuerpo | Canal |
|---|---|---|---|---|
| < 768px | 100% − 40px | 100% | 17px / 1.75 | 20px |
| ≥ 768px | 620px | 820px | 18px / 1.80 | automático |

Un solo punto de corte, en `md`. La rejilla resuelve el resto sin más consultas de medios.

---

## 6. Los tres momentos de transición

### 6.1 Entrar: la portada

`/experiencia/[expId]`. Alto completo, profundo, con la aurora que el participante ya vio en la landing.

```tsx
<section className="relative min-h-[100svh] overflow-hidden bg-[#001A21]
                    flex flex-col justify-end px-5 md:px-10 pt-24 pb-14 md:pb-20">

  {/* Aurora. Mismos valores que assets/brand.css:52-56, sin animación. */}
  <div aria-hidden="true"
       className="pointer-events-none absolute -top-[22%] -left-[18%]
                  w-[78vw] h-[78vw] max-w-[720px] max-h-[720px]
                  rounded-full opacity-70 blur-[70px]"
       style={{ background: 'radial-gradient(circle, #0E5866, transparent 70%)' }} />
  <div aria-hidden="true"
       className="pointer-events-none absolute -bottom-[16%] -right-[12%]
                  w-[62vw] h-[62vw] max-w-[560px] max-h-[560px]
                  rounded-full opacity-[0.28] blur-[70px]"
       style={{ background: 'radial-gradient(circle, #B9735A, transparent 68%)' }} />

  <div className="relative mx-auto w-full max-w-[620px]">
    <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#D8AC96]">
      PersonaLab
    </div>

    <h1 className="mt-6 text-[40px] md:text-[68px] leading-[1.0]
                   font-extralight tracking-[-0.03em] text-white text-balance">
      {exp.nombre}
    </h1>

    {exp.narrativa && (
      <p className="mt-5 text-[19px] md:text-[22px] leading-[1.45]
                    font-extralight text-[#D8AC96] max-w-[26ch]">
        {exp.narrativa}
      </p>
    )}

    <div className="mt-10 flex items-center gap-4 text-[12.5px] font-light text-white/55">
      <span>{capitulo.nombre}</span>
      <span className="w-px h-3 bg-white/25" aria-hidden="true" />
      <span>{fecha(corrida.fecha)}</span>
    </div>

    <Link href={destino}
          className="mt-9 inline-flex items-center gap-2 no-underline
                     text-[12px] tracking-[0.03em] text-white/90
                     border-b border-white/40 pb-[3px]
                     hover:text-white hover:border-[#B9735A] transition-colors">
      {puntero ? `Continuar en: ${nombreDe(puntero)}` : 'Entrar'}
    </Link>
  </div>
</section>
```

El botón es el `.btn-ghost` de `assets/brand.css:60` traducido a Tailwind: `border-bottom 1px rgba(255,255,255,.4)`, `padding-bottom 3px`, 12px, `letter-spacing .03em`. La aurora **no se anima**. En la landing los blobs derivan 26 a 38 segundos; aquí gastaría batería y agitaría una pantalla que debe estar quieta.

### 6.2 Terminar una parte

Dos escalas.

**Fin de bisagra.** El pie de la sección 3.4. Filete, "Aquí termina", el nombre de lo que acaba, y lo que sigue nombrado en 22px peso 200. Sin palomita, sin "completado", sin animación.

**Cambio de tiempo.** Cuando la siguiente bisagra pertenece a otro tiempo, entre el pie y el enlace se interpone una banda a sangre:

```tsx
<section className="lab-sangre mt-[88px] md:mt-[120px]
                    bg-[#002B34] px-5 md:px-10 py-12 md:py-16">
  <div className="mx-auto max-w-[620px]">
    <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D8AC96]">
      Empieza
    </div>
    <h2 className="mt-3 text-[32px] md:text-[44px] leading-[1.05]
                   font-extralight tracking-[-0.03em] text-white">
      {ETIQUETA_TIEMPO[siguienteTiempo]}
    </h2>
    <p className="mt-5 max-w-[46ch] text-[15px] md:text-[16px] leading-[1.7]
                  font-light text-white/70">
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

### 6.3 Llegar al final

`/experiencia/[expId]/cierre`. Cierra el arco de la portada: mismo profundo, misma medida, sin aurora. La portada abre con un halo; el cierre cierra con un filete.

```tsx
<section className="min-h-[100svh] bg-[#001A21] px-5 md:px-10
                    py-20 md:py-28 flex flex-col justify-center">
  <div className="mx-auto w-full max-w-[620px]">
    <div className="w-10 h-px bg-[#B9735A]" aria-hidden="true" />

    <h2 className="mt-7 text-[28px] md:text-[38px] leading-[1.15]
                   font-extralight tracking-[-0.025em] text-white text-balance">
      {CIERRE[tiempo].titulo}
    </h2>

    <p className="mt-5 max-w-[46ch] text-[16px] md:text-[17px] leading-[1.75]
                  font-light text-white/70">
      {CIERRE[tiempo].cuerpo}
    </p>

    <Link href="/"
          className="mt-12 inline-flex items-center gap-2 no-underline
                     text-[12px] tracking-[0.03em] text-white/90
                     border-b border-white/40 pb-[3px]
                     hover:text-white hover:border-[#B9735A] transition-colors">
      Volver
    </Link>

    <div className="mt-16 pt-6 border-t border-white/10
                    text-[9.5px] font-semibold uppercase tracking-[0.22em]
                    text-white/35">
      Una experiencia de 4 Meaning
    </div>
  </div>
</section>
```

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

El sello final es el que `BRAND.md:127` establece: "Una experiencia de 4 Meaning".

**Prohibido en el cierre.** Palomita gigante. "¡Felicidades!". Certificado. Insignia. Sugerencia de otra experiencia. Compartir en redes. Encuesta. El cierre nombra lo que sigue fuera de la pantalla y calla.

---

## 7. Contrato de datos

```ts
export type TipoBloque =
  | 'parrafo' | 'titulo' | 'cita' | 'imagen' | 'video'
  | 'archivo' | 'objeto' | 'consigna' | 'nota' | 'pausa' | 'gesto'

export type Audiencia = 'todos' | 'solo_moderador'

export interface Bloque {
  id: string
  bisagraId: string
  orden: number
  tipo: TipoBloque
  audiencia: Audiencia

  texto?: string        // parrafo (HTML acotado), titulo, cita, consigna, nota
  nivel?: 2 | 3         // titulo
  atribucion?: string   // cita
  nombre?: string       // archivo, objeto, consigna (etiqueta)
  detalle?: string      // archivo (uso), objeto (regla)
  url?: string          // imagen, video, archivo
  alt?: string          // imagen, obligatorio
  poster?: string       // video, obligatorio
  pie?: string          // imagen, video
  ratio?: '3:2' | '4:5' | '16:9' | '1:1'  // imagen, por omisión 3:2
  duracion?: string     // video, "7 min"
  peso?: string         // archivo, "2.4 MB"
}
```

**Prohibido en cualquier tabla del participante.** `progress`, `completion_pct`, `score`, `streak`, `badge`, `rank`, `quiz`, `completed_at`, `viewed_count`.

**Validaciones del editor.**

| Regla | Motivo |
|---|---|
| `video` no se permite en Ignición | `PAPEL_SOFTWARE.ignicion`, `dominio.ts:29` |
| `gesto` solo en Retorno, máximo uno por bisagra | `dominio.ts:151` |
| `objeto` nunca lleva `url` | `COLUMNA_KIT.objeto.regla`, `dominio.ts:60` |
| `imagen` sin `alt` no publica | accesibilidad |
| `video` sin `poster` no publica | rectángulo negro |
| `nota` fuerza `audiencia: 'solo_moderador'` | no configurable |
| `archivo` por omisión `'solo_moderador'` | el guion es la pieza licenciable |
| Ningún texto visible contiene el carácter `—` | regla dura del usuario |
| `parrafo` no admite `<h1>` a `<h6>` | los títulos son su propio bloque |

---

## 8. Lista de verificación

**Antes de escribir código**
- [ ] Decidir qué tabla de neutros manda: `BRAND.md:58-69` o `assets/brand.css:14`. Si gana `brand.css`, el papel pasa de `#FAF8F4` a `#F6EEE3` y todos los contrastes de esta especificación se recalculan.
- [ ] Validar las frases de `COPY_TIEMPO` y `CIERRE` con quien fija la voz.

**Mientras se escribe**
- [ ] Añadir el bloque de CSS de la sección 1.5 a `portal/app/globals.css`.
- [ ] Quitar `maximum-scale=1` de `portal/app/layout.tsx:37` y medir el efecto en las siete páginas de `(participant)`.
- [ ] Exportar `viewport.themeColor` por ruta.
- [ ] Ningún texto en `#6F7777`, `#B9735A` ni `#A69C90`. Usar `#676E6E` y `#8F5341`.
- [ ] Ningún carácter `—` en copy visible.
- [ ] `bloquesVisibles` y `bisagrasVisibles` se llaman en el servidor, antes de serializar.
- [ ] `IntersectionObserver`, no cálculo de scroll, para el contexto de la barra.
- [ ] `localStorage` solo dentro de `useEffect`, nunca en el inicializador de `useState`.

**Antes de dar por bueno**
- [ ] Medir el contraste real con herramienta. Los números de esta especificación son cálculos a mano.
- [ ] Probar en Android con Roboto: verificar que `font-extralight` no colapse los titulares.
- [ ] Probar a 375px sin arrastre horizontal en ninguna bisagra.
- [ ] Recorrer todo el lector con teclado: `Tab` alcanza cada enlace, la hoja atrapa el foco y cierra con `Escape`.
- [ ] Abrir con `prefers-reduced-motion` activo.
- [ ] Verificar en el inspector que el HTML del participante **no contiene** ni un bloque `nota` ni una URL de PDF.

---

## Diseño del modelo de contenido y del flujo de autoría de PersonaLab, verificado contra el código real del repositorio. E

- **El contenido es una lista ordenada de bloques tipados que cuelga de una bisagra, con `contenido jsonb` validado por tipo y columnas de primera clase solo para lo que necesita integridad referencial (medio_id, pieza_kit_id).**: "Cada curso sera distinto" hace imposible un formulario fijo. El `jsonb` deja crecer el catalogo de tipos sin migracion de esquema, y coincide con el estilo de la casa: `agreements.contenido jsonb` (portal/supabase/schema.sql:112) y `documents.contenido jsonb` (schema.sql:138) ya lo usan. Las columnas de FK aparte permiten impedir borrar un medio en uso.
- **Texto rico como documento JSON acotado (DocRico v1: solo parrafo y lista; solo marcas enfasis, fuerte y enlace). Sin encabezados ni imagenes dentro del texto.**: La estructura de la pagina la define la lista de bloques, no el texto. Si el editor pudiera meter H2 dentro de un parrafo habria dos fuentes de estructura y el diseño publicado dejaria de ser predecible. El renderer mapea cada nodo a un token de marca, sin HTML crudo.
- **Versionado a nivel de experiencia con copia al escribir. Bisagras, bloques y kit cuelgan de `versiones_experiencia`, no de `experiencias`. Lo publicado es inmutable por trigger; editar ejecuta `abrir_borrador()` que clona la version publicada. Cada corrida ancla `version_id` al confirmarse.**: Un moderador que prepara su corrida para dentro de dos semanas no puede ver cambiar el guion bajo los pies. La pregunta operativa real es "con que diseño corrio el foro Anahuac en agosto", y esa pregunta la contesta exactamente una version por experiencia.
- **Toda fila versionada lleva `raiz_id` estable entre versiones, ademas de su `id` propio por version. `abrir_borrador()` copia el `raiz_id` sin tocarlo.**: Sin identidad estable, migrar una corrida de la version 2 a la 3 rompe las aperturas ya registradas y hace imposible el diff "que cambio respecto a lo publicado" que necesita la pantalla de revision. Con `raiz_id`, el diff es un FULL OUTER JOIN y las aperturas apuntan a `bisagra_raiz_id`, que sobrevive.
- **La audiencia es un PISO acumulativo, no una etiqueta exclusiva: `nivel_audiencia(participante)=1, moderador=2, equipo=3`, y quien tiene nivel N ve todo bloque con nivel <= N.**: Es la semantica que la gente asume igual. Si "moderador" significara "solo el moderador", el moderador no veria el material del participante y no podria preparar la sala, que es su trabajo. Ademas reduce el filtro a una comparacion de enteros, igual en SQL, en RLS y en TypeScript.
- **`archivo` con `modo = 'descarga'` solo es legal si `audiencia in ('moderador','equipo')`, como CHECK de la tabla `bloques`.**: Es lexico de dominio, no preferencia de UX: "Se recibe, no se descarga" aparece dos veces en los datos del prototipo (app/prototipo/data.ts:145 y app/prototipo/personalab/dominio.ts:179). El usuario pidio explicitamente PDFs que el MODERADOR descarga. Una regla de dominio que solo vive en la UI se rompe el dia que alguien escribe un script de carga masiva.
- **La apertura del contenido se decide por BISAGRA, no por bloque, y con tres modos: inmediata, programada (offset en dias respecto de `corridas.fecha`) y manual.**: El mismo bloque se abre en agosto para Anahuac y en septiembre para Monterrey, asi que la fecha absoluta no puede vivir en el diseño. Y la granularidad util es la bisagra: la capa mensual del retorno es una bisagra por mes (dominio.ts:152), no un bloque suelto. El modo manual es la generalizacion correcta del `activo boolean` que Trascendencia ya usa en `event_content_blocks` (app/(admin)/eventos/[id]/contenido/actions.ts:16).
- **Subida directa del navegador a Supabase Storage con URL de subida firmada emitida por el servidor. El servidor nunca transporta los bytes. Dos buckets privados: `experiencia-docs` y `experiencia-video`.**: El limite de cuerpo de una server action de Next 14 es de 1 MB por defecto y `portal/next.config.mjs` esta vacio, o sea que hoy corre con los valores de fabrica: cualquier PDF real tumbaria la accion. Dos buckets porque los limites de tamaño y de MIME en Supabase se configuran por bucket, y video y documento no comparten limite.
- **Video en v1 por dos vias: `externo` (Vimeo, YouTube no listado o Mux, se guarda proveedor mas id) como camino principal, y `subido` con techo de 50 MB para piezas cortas. La subida reanudable (TUS) para archivos grandes queda declarada como fase 2.**: El usuario pidio "subir videos" y hay que darle una via que funcione el primer dia sin montar transcodificacion. 50 MB alcanza para una guia de 2 a 3 minutos a 720p, que es el caso real de la vispera. La UI dice la verdad sobre el techo en vez de fallar en silencio.
- **No existe ninguna tabla que registre que consumio un participante. Cero campos de lectura, avance o consumo del lado del participante.**: El lexico vinculante prohibe progress, completion_pct, score, streak, badge, rank y quiz (dominio.ts:10). Registrar "bisagra leida" es exactamente `progress` con otro nombre, y una vez que existe la columna alguien acaba pintando una barra.
- **El autor guarda solo; publicar exige rol `editor` del workspace, en la tabla nueva `equipo_4meaning`. El estado `en_revision` congela la version igual que `publicada`.**: El usuario pidio revision como paso propio del ciclo. Si el estado en revision siguiera siendo escribible, revisar no significaria nada porque el contenido cambiaria mientras se revisa. Y separar autor de editor es lo que hace que la revision no sea un tramite de uno mismo.
- **Las compuertas de publicacion son una funcion SQL `puede_publicar(version)` que devuelve filas con severidad `bloqueo` o `aviso`, y la pantalla de revision renderiza esas filas tal cual.**: Una sola definicion de "esto esta listo" para el boton, para la funcion `publicar_version` y para la pantalla. Si la lista viviera en el cliente, publicar por API se saltaria las compuertas.
- **`orden numeric(20,10)` con insercion por punto medio, y renumeracion a 1..N dentro de `publicar_version`.**: Arrastrar un bloque entre otros dos es un solo UPDATE en vez de renumerar toda la cola, que es lo que importa cuando el autoguardado dispara cada 800 ms. La renumeracion al publicar acota la degradacion de precision de los puntos medios.
- **En el prototipo, el estado del editor vive en un store de cliente con `useSyncExternalStore` mas persistencia en `localStorage` bajo la clave `personalab_borrador_v1`, sembrado desde los datos estaticos.**: El prototipo esta fuera del gate de sesion a proposito (portal/middleware.ts:14) y no toca Supabase. Un modulo mutable en el servidor se reinicia con cada recompilacion y no permite demostrar autoguardado ni reanudar tras recargar, que es justo lo que hay que enseñar.
- **El lector del participante es oscuro con dominancia teal y acento terracota; el guion del moderador es papel claro e imprimible.**: BRAND.md:83 asigna a PersonaLab el teal `#002B34` como dominante y terracota como acento, asi que copiar el dorado `#C9A96E` de Trascendencia seria pintar PersonaLab con la marca de la otra linea. El guion va en papel porque en la ignicion "el software es mudo" (dominio.ts:29): el moderador esta en la sala, no frente a una pantalla.

> **Nota de lexico.** El usuario dice "curso"; el codigo dice **experiencia**. Este documento usa el lexico vinculante en todo el modelo de datos: experiencia, tiempo (vispera / ignicion / retorno), bisagra, participante, capitulo, grant. Cuando aparece "curso" es porque se cita al usuario.

> **Nota sobre "guardar el progreso".** El usuario pidio "que se pueda guardar el progreso". Ese progreso es el del AUTOR sobre su borrador, y esta permitido y especificado en la seccion 7. La prohibicion de `progress`, `completion_pct`, `score`, `streak`, `badge`, `rank` y `quiz` (declarada en `portal/app/prototipo/personalab/dominio.ts:10`) aplica al PARTICIPANTE, y se respeta: no existe ninguna tabla que registre lo que un participante consumio.

---

# 1. Alcance

Cubre siete cosas: catalogo de bloques, anidamiento en la estructura de tiempos y bisagras, ciclo de vida y versionado, archivos, visibilidad por audiencia, esquema SQL y representacion en el prototipo de TypeScript.

Queda fuera y se declara como tal en la seccion 15.

## 1.1 Lo que ya existe, verificado

| Hecho | Donde |
|---|---|
| El prototipo de PersonaLab no toca Supabase. Datos en TypeScript, estilos 100% inline | `portal/app/prototipo/personalab/dominio.ts`, `ui.tsx` |
| `Bisagra` ya existe con `tiempo`, `orden`, `titulo`, `descripcion`, `soporte`, `duracion`, `listo`, `requiere` | `dominio.ts:40-51` |
| Las bisagras hoy son un arreglo literal dentro de `Experiencia` | `dominio.ts:92` |
| `abreEspacioAlForo` ya existe por experiencia | `dominio.ts:88` |
| El prototipo esta fuera del gate de sesion a proposito | `portal/middleware.ts:14` |
| Trascendencia ya tiene contenido progresivo, pero por evento y con un solo `activo boolean` | `portal/app/(admin)/eventos/[id]/contenido/page.tsx:4-14` |
| Ese contenido es `titulo` mas `contenido text` plano. Sin bloques, sin medios | mismo archivo, linea 8 |
| El participante lo lee como parrafo unico con `whitespace-pre-wrap` | `portal/app/(participant)/programa/page.tsx:252` |
| **No hay ninguna subida de archivos en todo el repositorio.** `grep` de `.storage` y `upload(` sobre `app`, `lib` y `components` no devuelve nada | verificado en esta sesion |
| `documents.pdf_url` es un `text` que alguien pega a mano | `portal/supabase/schema.sql:141` |
| El esquema usa `text` mas `check`, nunca enums nativos | `schema.sql:52-53, 75-76, 113-114` |
| Las columnas de dominio van en español, las de auditoria en ingles (`created_at`, `created_by`) | `schema.sql` completo |
| `next.config.mjs` esta vacio: Next corre con los limites de fabrica | `portal/next.config.mjs` |
| PersonaLab domina en teal `#002B34`, acento terracota `#B9735A` | `BRAND.md:83`, tabla de la linea 55 |

---

# 2. Jerarquia

```
experiencia                 identidad estable. Nombre, slug, maduracion, abreEspacioAlForo.
└── version                 el contenedor versionado. borrador | en_revision | publicada | retirada
    ├── tiempo              NO es tabla. Es la columna `tiempo` de la bisagra: vispera | ignicion | retorno
    │   └── bisagra         el momento donde algo gira. Tiene orden dentro de su tiempo.
    │       └── bloque      lista ordenada y tipada. Es el contenido.
    ├── bisagra_id NULL     bloques de PORTADA de la experiencia (lo que se lee antes de entrar a ningun tiempo)
    └── pieza_kit           el kit de replicabilidad, tambien versionado
```

Y fuera del diseño, del lado de la operacion:

```
capitulo ── moderador ── corrida ── version_id  (anclada al confirmar)
                          ├── grant       quien tiene acceso y con que titularidad
                          └── apertura    que bisagras ya se abrieron para este foro
```

## 2.1 Por que el tiempo no es una tabla

Los tres tiempos son un universo cerrado y con significado fijo (`ETIQUETA_TIEMPO` y `PAPEL_SOFTWARE`, `dominio.ts:21-31`). Nadie va a crear un cuarto tiempo. Una tabla `tiempos` añadiria un JOIN a cada lectura para modelar tres constantes. Se queda como `text` con `check`, igual que el resto del esquema.

## 2.2 Bloques de portada

Un bloque con `bisagra_id IS NULL` pertenece a la portada de la experiencia. Es lo que abre la lectura: la narrativa ("No estas roto, estas mudando", `dominio.ts:137`), la imagen de entrada, la duracion. Se ordena en su propio ambito.

## 2.3 El anidamiento en una frase

Un bloque nunca contiene otro bloque. La unica estructura es: bisagra ordenada dentro de un tiempo, bloque ordenado dentro de una bisagra. Sin columnas, sin acordeones anidados, sin bloques contenedores. Es deliberado: el contenido se lee en una sola columna en el telefono, y una jerarquia mas profunda en el editor produce arboles que nadie sabe navegar.

---

# 3. Catalogo de bloques

Trece tipos. Cada bloque tiene siempre, sin importar su tipo:

| Campo | Tipo | Nota |
|---|---|---|
| `id` | uuid | por version |
| `raiz_id` | uuid | identidad estable entre versiones |
| `version_id` | uuid | a que version pertenece |
| `bisagra_id` | uuid nullable | null = portada |
| `orden` | numeric | punto medio para insertar |
| `tipo` | text | uno de los 13 |
| `audiencia` | text | `participante` \| `moderador` \| `equipo`. Es un PISO, ver seccion 5 |
| `contenido` | jsonb | forma segun el tipo |
| `medio_id` | uuid nullable | FK a `medios` |
| `poster_medio_id` | uuid nullable | solo video |
| `pieza_kit_id` | uuid nullable | solo kit_ref |
| `rev` | int | bloqueo optimista del autoguardado |

## 3.1 Los trece tipos

### 1. `titulo`
Encabezado de seccion dentro de una bisagra.
```json
{ "texto": "Lo que hay que traer", "nivel": 2 }
```
- `texto`: 1 a 200 caracteres.
- `nivel`: 2 o 3. No hay nivel 1: el H1 de la pagina es el titulo de la bisagra.

### 2. `texto`
Cuerpo de lectura. Es el bloque mas usado.
```json
{ "doc": { "v": 1, "nodos": [ ... ] } }
```
- `doc`: un DocRico, seccion 4.

### 3. `cita`
```json
{ "doc": { "v": 1, "nodos": [ { "tipo": "parrafo", "hijos": [ { "texto": "No estas roto, estas mudando." } ] } ] },
  "autor": "Renata Vidal", "fuente": "Consejo #002" }
```
- `doc`: solo nodos `parrafo`. Una lista dentro de una cita se rechaza en la compuerta de publicacion.
- `autor`, `fuente`: opcionales, texto plano hasta 120 caracteres.

### 4. `destacado`
Callout visible al lector. Para "lo que hay que traer", advertencias de logistica, avisos de sala.
```json
{ "tono": "aviso", "titulo": "Trae un objeto", "doc": { "v": 1, "nodos": [...] } }
```
- `tono`: `neutro` | `aviso` | `cuidado`.
- `titulo`: opcional, hasta 80 caracteres.

### 5. `nota`
La nota para el moderador que el participante nunca ve. Mismo renderer que `destacado`, distinto color y audiencia forzada.
```json
{ "tono": "neutro", "titulo": "Si el grupo se traba", "doc": { "v": 1, "nodos": [...] } }
```
- **CHECK de tabla**: `audiencia in ('moderador','equipo')`. Un `nota` con audiencia participante no entra a la base.
- En el menu de insertar se llama "Nota para el moderador" y preselecciona `audiencia = 'moderador'`.

### 6. `imagen`
```json
{ "alt": "Circulo de sillas con una vela al centro", "pie": "Disposicion de la sala para Vuelo",
  "encuadre": "ancho", "foco": { "x": 0.5, "y": 0.35 } }
```
- `medio_id` obligatorio, con `medios.clase = 'imagen'`.
- `alt`: obligatorio, 1 a 300 caracteres. Compuerta de aviso si esta vacio.
- `encuadre`: `ancho` (rompe la medida de lectura, hasta 900 px) | `columna` (se queda dentro de los 640 px del texto).
- `foco`: punto de interes 0..1 para el recorte responsive. Opcional, por omision el centro.
- El `alt` vive en el bloque, no en el medio: la misma foto puede describirse distinto en dos lugares.

### 7. `video`
```json
{ "fuente": "externo", "proveedor": "vimeo", "id_externo": "912345678",
  "titulo": "Palabras antes de la vispera", "duracion_seg": 154,
  "transcripcion": "Texto completo de lo que se dice." }
```
o
```json
{ "fuente": "subido", "titulo": "Guia de respiracion", "duracion_seg": 210 }
```
- `fuente`: `externo` (obliga `proveedor` en `vimeo` | `youtube` | `mux`, mas `id_externo`) o `subido` (obliga `medio_id` con `clase = 'video'`).
- `poster_medio_id`: opcional, imagen de portada. Compuerta de aviso si falta en un video externo.
- `transcripcion`: opcional pero recomendada. Es lo unico que hace el video buscable y accesible.

### 8. `audio`
```json
{ "titulo": "Practica guiada de la crisalida", "duracion_seg": 480, "transcripcion": "..." }
```
- `medio_id` obligatorio, `clase = 'audio'`.
- **Justificacion del tipo**: la metodologia trabaja con practicas guiadas y con la voz. Un audio de 8 minutos servido como `archivo` descargable convierte una practica en un archivo suelto; como bloque propio se reproduce en linea, con la transcripcion al lado y sin salir de la lectura.

### 9. `archivo`
El PDF. Es el tipo que carga la distincion mas importante del sistema.
```json
{ "nombre": "Guion del moderador v1.2", "modo": "descarga",
  "descripcion": "Imprimir antes de la sesion. 12 paginas.", "paginas": 12 }
```
- `medio_id` obligatorio, `clase = 'documento'`.
- `modo`:
  - `descarga`: se sirve con `Content-Disposition: attachment`. El boton dice "Descargar". **Solo legal si `audiencia in ('moderador','equipo')`**, por CHECK de tabla.
  - `lectura`: se sirve con `Content-Disposition: inline` y se incrusta en la pagina. Sin boton de descarga. Es el unico modo permitido hacia el participante.
- Toda descarga queda registrada en `descargas_medio` (seccion 10.6).

### 10. `separador`
```json
{ "estilo": "aire" }
```
- `estilo`: `linea` (filete de 1 px) | `aire` (48 px de vacio) | `ornamento` (simbolo de marca centrado).

### 11. `llamado`
Llamado a la accion.
```json
{ "etiqueta": "Ver el kit de la sala", "destino_tipo": "bisagra",
  "destino": "8f2c...", "apoyo": "Lo necesitas antes del jueves" }
```
- `etiqueta`: 1 a 60 caracteres.
- `destino_tipo`:
  - `bisagra`: `destino` es el `raiz_id` de otra bisagra de la misma experiencia. La compuerta verifica que exista.
  - `ruta`: ruta interna del portal, tiene que empezar con `/`.
  - `externo`: URL absoluta `https://`.
  - `correo`: `mailto:`.
- `apoyo`: linea secundaria opcional, hasta 120 caracteres.

### 12. `consigna`
El espacio de escritura del participante, resuelto sin traicionar el dominio.
```json
{ "doc": { "v": 1, "nodos": [...] }, "soporte": "a_mano", "tiempo_sugerido": "20 minutos" }
```
- `soporte`: `a_mano` | `en_sala` | `en_pantalla`.
- **El bloque plantea la consigna. No captura la respuesta en v1.** La razon esta en el dominio: la carta al futuro se escribe a mano y "no se sube ni se transcribe" (`dominio.ts:177`), y la libreta de la muda "se escribe a mano, no se transcribe" (`dominio.ts:156`). Un campo de texto para el participante contradice la pieza fisica del kit.
- `soporte = 'en_pantalla'` esta reservado para cuando exista una bisagra que si deba capturarse. Hoy ninguna lo requiere, y el renderer lo pinta igual que `a_mano` con una nota interna de "captura no implementada". Ver seccion 15.

### 13. `kit_ref`
Referencia a una pieza del kit de la experiencia.
```json
{ "nota": "Una por persona, contarlas la noche anterior" }
```
- `pieza_kit_id` obligatorio, apuntando a una pieza de la MISMA version.
- **Justificacion**: el kit ya es una tabla con nombre, detalle, columna y disponibilidad (`dominio.ts:72-79`). Un bloque que reescribe "Libreta de la muda, cosida a mano" duplica la verdad y se desincroniza. `kit_ref` apunta, y la disponibilidad se lee en vivo.

## 3.2 Tipos evaluados y descartados

| Tipo | Por que no |
|---|---|
| `lista` | DocRico ya tiene nodo `lista`. Un bloque aparte partiria en dos lo que el autor escribe de corrido. |
| `galeria` | Varios bloques `imagen` seguidos dan el mismo resultado y se reordenan uno por uno. Una galeria obliga a un editor anidado. |
| `tabla` | No hay ni un solo dato tabular en el contenido de una experiencia. Si aparece, se añade despues; el `jsonb` no obliga a migrar. |
| `embed` / `iframe` | Ejecutar HTML de terceros dentro del lector. Riesgo desproporcionado para un caso que hoy no existe. |
| `acordeon` | Anida bloques dentro de bloques y rompe la regla de una sola columna. |
| `quiz`, `encuesta` | Prohibido por lexico (`dominio.ts:10`). |
| `temporizador` | Duracion ya vive en la bisagra (`dominio.ts:47`). |

## 3.3 El menu de insertar

Cuatro grupos. El orden importa porque es el orden en que el autor piensa.

| Grupo | Items |
|---|---|
| Escritura | Titulo, Texto, Cita, Destacado, Consigna |
| Medios | Imagen, Video, Audio, Archivo |
| Estructura | Separador, Llamado, Pieza del kit |
| Solo equipo | Nota para el moderador |

---

# 4. DocRico: el formato de texto rico

```ts
type Marca = 'enfasis' | 'fuerte' | 'enlace'

interface Span {
  texto: string
  marcas?: Marca[]
  href?: string      // obligatorio si marcas incluye 'enlace'
}

type Nodo =
  | { tipo: 'parrafo'; hijos: Span[] }
  | { tipo: 'lista'; estilo: 'punto' | 'numero'; items: Span[][] }

interface DocRico {
  v: 1
  nodos: Nodo[]
}
```

Reglas duras, validadas por `doc_rico_valido()` en Postgres:

1. `v` tiene que ser exactamente `1`. Cualquier version futura se migra con una funcion explicita, nunca por adivinanza.
2. Solo dos tipos de nodo. Nada mas se acepta.
3. Solo tres marcas. Nada de subrayado, tachado, color ni tamaño: la jerarquia se construye con escala y aire, no con negritas (`BRAND.md:97-98`).
4. `href` tiene que empezar con `https://`, `http://`, `/` o `mailto:`. Cualquier otra cosa (incluido `javascript:`) se rechaza en la base.
5. Maximo 200 nodos y 40 000 caracteres por documento. Un bloque mas largo que eso es dos bloques.
6. Sin nodos vacios: un parrafo sin `hijos` con texto se rechaza en la compuerta de publicacion.

## 4.1 Como se renderiza

Nunca con `dangerouslySetInnerHTML`. El renderer es un `switch` sobre `nodo.tipo` que emite JSX y aplica tokens de marca. Eso es lo que permite que el mismo `doc` salga en crema sobre teal oscuro para el participante y en tinta sobre papel para el moderador, sin duplicar contenido.

## 4.2 Migracion del texto plano que ya existe

`event_content_blocks.contenido` es `text` (`contenido/page.tsx:8`). El convertidor:

```
texto.split(/\n{2,}/)                      -> un nodo 'parrafo' por bloque
  lineas que empiezan con '- ' o '* '      -> se agrupan en un nodo 'lista' estilo 'punto'
  lineas que empiezan con '1. ', '2. '...  -> nodo 'lista' estilo 'numero'
  saltos simples dentro de un parrafo      -> se conservan como espacio
```

Sin deteccion de negritas ni de enlaces. Lo que se importa queda plano y el autor enfatiza a mano. Es preferible a adivinar mal.

---

# 5. Visibilidad por audiencia

## 5.1 El modelo

Tres audiencias con nivel numerico:

| Audiencia | Nivel | Quien |
|---|---|---|
| `participante` | 1 | miembro del foro con grant, cuando la experiencia abre espacio |
| `moderador` | 2 | el moderador titular de la corrida |
| `equipo` | 3 | 4 Meaning: autores, editores, operacion |

**La audiencia de un bloque es el PISO de quien puede verlo.** Un lector de nivel N ve todo bloque con `nivel_audiencia(bloque.audiencia) <= N`.

| Bloque marcado | Lo ve participante | Lo ve moderador | Lo ve equipo |
|---|---|---|---|
| `participante` | si | si | si |
| `moderador` | no | si | si |
| `equipo` | no | no | si |

Esto es deliberado y hay que decirlo en la interfaz, porque "moderador" se lee facil como "solo el moderador". El selector del inspector dice literalmente:

- **Todos** (participante y arriba)
- **Moderador y equipo**
- **Solo equipo 4 Meaning**

## 5.2 Como se hace cumplir

Tres capas, en este orden:

1. **RLS en Postgres.** La policy de `SELECT` sobre `bloques` compara `nivel_audiencia(audiencia)` con `mi_nivel_en(corrida)`. Es la unica capa que no se puede saltar.
2. **Filtro en el servidor.** La consulta del lector filtra ademas por nivel, para no traer filas que la RLS ya iba a negar.
3. **El renderer nunca recibe los bloques ocultos.** No se ocultan con CSS ni con `display: none`. No estan en el DOM.

La capa 3 importa: el portal actual ya tiene el patron correcto en `ItinerarioClient.tsx:411` (`isAdmin && item.notas_staff`), y hay que sostenerlo.

## 5.3 `abreEspacioAlForo`

Este flag (`dominio.ts:88`) no cambia el modelo de bloques. Cambia a quien se le emite un grant:

- `false`: solo el moderador recibe grant. Nadie del foro tiene cuenta. Los bloques `participante` existen igual y el moderador los lee como material de sala.
- `true`: cada miembro del foro recibe un grant `miembro_foro` y ve los bloques `participante` de las bisagras abiertas.

Hoy en el catalogo eso es: `El Presente como Regalo` y `El Nido Vacio` abren espacio; `Metamorfosis y Metanoia` y `Proposito de Vida` no (`dominio.ts:139, 171, 193, 205`). Consecuencia que hay que decir en voz alta: **en el catalogo de hoy, la experiencia mas trabajada es la que no tiene lector de participante.** Esta anotado en riesgos.

---

# 6. Apertura: cuando aparece cada bisagra

La apertura se decide por bisagra, no por bloque. Tres modos, en la columna `bisagras.apertura`:

| Modo | Regla | Caso tipico |
|---|---|---|
| `inmediata` | visible desde que existe el grant | portada, "que es esto", el kit |
| `programada` | visible cuando `now() >= corrida.fecha + offset_dias` | carta de convocatoria (`offset_dias = -14`), capa mensual del retorno (`+30`, `+60`, `+90`) |
| `manual` | visible solo si existe fila en `aperturas` | contenido que se libera en vivo durante la ignicion |

`offset_dias` es entero con signo. Negativo es antes de la corrida.

Funcion canonica, usada por RLS y por el lector:

```sql
bisagra_abierta(p_bisagra uuid, p_corrida uuid) returns boolean
```

## 6.1 Por que no se copio el `activo boolean` de Trascendencia

En Trascendencia los bloques son POR EVENTO (`event_content_blocks.event_id`), asi que un booleano en el bloque afecta a un solo evento. En PersonaLab los bloques son del DISEÑO y los comparten todas las corridas: un booleano en el bloque abriria el contenido a los cinco capitulos a la vez. El modo `manual` mas la tabla `aperturas` es exactamente el mismo gesto para el moderador ("activar ahora"), con el ambito correcto.

## 6.2 Lo que ve el participante cuando algo no esta abierto

Si la bisagra tiene `apertura = 'programada'` y todavia no toca, se muestra la bisagra con su titulo y un sello legible: "Se abre el 1 de agosto". Contraste minimo AA, no `white/20` como el sello actual de Trascendencia (`programa/page.tsx:256`), que es practicamente invisible.

Si es `manual`, no se muestra fecha porque no hay: se muestra "Todavia no". Si la bisagra ni siquiera deberia insinuarse, se marca con `bisagras.oculta_antes = true` y desaparece del indice hasta abrirse.

---

# 7. Ciclo de vida

## 7.1 Estados de una version

```
             abrir_borrador()
   (nada) ─────────────────────> borrador
                                    │  enviar a revision
                                    v
                                en_revision ──── devolver ────> borrador
                                    │  publicar
                                    v
                                publicada ───── al publicar N+1 ────> retirada
```

Reglas duras:

1. **Una sola version `publicada` por experiencia.** Indice unico parcial.
2. **Una sola version abierta (`borrador` o `en_revision`) por experiencia.** Indice unico parcial. Sin esto, dos autores forkean el diseño sin darse cuenta.
3. **`publicada`, `en_revision` y `retirada` son inmutables.** Un trigger `BEFORE INSERT OR UPDATE OR DELETE` sobre `bisagras`, `bloques` y `piezas_kit` lanza excepcion si la version no esta en `borrador`.
4. **`retirada` no se borra nunca.** Hay corridas ancladas leyendola.

## 7.2 Autoguardado

Solo sobre `borrador`. Contrato:

| Aspecto | Decision |
|---|---|
| Disparo | 800 ms de inactividad por bloque, mas un `flush` al perder el foco y en `beforeunload` |
| Alcance | un PATCH por bloque, nunca un guardado global |
| Optimismo | se escribe en el estado local primero. Si falla, se revierte y sale un toast de error. Es el patron de `CheckInButton.tsx:40-45`, el mejor del admin actual |
| Indicador | "Guardado hace X" en la barra superior, leyendo `versiones_experiencia.guardado_at`, actualizado por trigger |
| Boton de guardar | no existe. El unico commit es "Enviar a revision" |
| Concurrencia | `bloques.rev int`, incrementado por trigger. El cliente manda el `rev` que leyo |

Conflicto:

```sql
actualizar_bloque(p_id uuid, p_rev int, p_contenido jsonb, p_audiencia text, ...) returns int
```
Si `rev` no coincide, lanza `conflicto_de_edicion`. La ruta HTTP responde 409 y la tarjeta del bloque se pinta con borde de aviso y el texto "Alguien mas cambio este bloque. Recargar para ver la version buena." Sin merge automatico: en un texto de autor, un merge silencioso produce parrafos Frankenstein.

## 7.3 Revision

`en_revision` es un estado real, no una etiqueta. Al entrar, el contenido se congela igual que si estuviera publicado.

La pantalla de revision (`/experiencias/[id]/revisar`) muestra cuatro cosas:

1. **Compuertas**: la salida de `puede_publicar(version)`, separada en bloqueos y avisos.
2. **Que ve cada quien**: tres columnas con el conteo de bloques por audiencia y la lista completa de los bloques `equipo` y `moderador`, para que nadie publique una nota interna por error. Marcar el confirmo pone `revisado_visibilidad = true`, que es en si mismo una compuerta de bloqueo.
3. **Que cambio**: diff contra la version publicada, por `raiz_id`. Altas, bajas, movidas y modificadas.
4. **Dos acciones**: Publicar (requiere rol `editor`) y Devolver a borrador con `nota_revision` obligatoria.

## 7.4 Compuertas de publicacion

Salen de `puede_publicar(version)`, que devuelve `(severidad, codigo, mensaje, bisagra_id, bloque_id)`.

**Bloqueos** (impiden publicar):

| Codigo | Regla |
|---|---|
| `sin_ignicion` | ninguna bisagra con `tiempo = 'ignicion'`. Una experiencia sin ignicion no es una experiencia |
| `bisagra_sin_titulo` | titulo vacio |
| `texto_vacio` | bloque `titulo`, `texto`, `cita`, `destacado`, `nota` o `consigna` sin ni un caracter |
| `medio_faltante` | bloque `imagen`, `audio`, `archivo` o `video` subido sin `medio_id` |
| `medio_no_listo` | `medio_id` apunta a un medio con `estado <> 'listo'` (subida a medias) |
| `llamado_roto` | `destino_tipo = 'bisagra'` y el `raiz_id` no existe en esta version |
| `kit_ref_roto` | `pieza_kit_id` nulo o de otra version |
| `visibilidad_no_revisada` | `revisado_visibilidad = false` |
| `cita_con_lista` | un `cita` cuyo doc tiene nodos que no son parrafo |

**Avisos** (no impiden publicar, se muestran):

| Codigo | Regla |
|---|---|
| `ignicion_con_pantalla` | bisagra de ignicion con bloques `participante`. En la ignicion "el software es mudo" (`dominio.ts:29`) |
| `sala_con_pantalla` | bisagra con `soporte = 'sala'` y bloques visibles al participante |
| `bisagra_sin_bloques` | bisagra vacia |
| `tiempo_vacio` | vispera o retorno sin ninguna bisagra |
| `bisagra_no_lista` | `listo = false` |
| `imagen_sin_alt` | `alt` vacio |
| `video_sin_poster` | video externo sin `poster_medio_id` |
| `video_sin_transcripcion` | video o audio sin transcripcion |

Los dos primeros avisos son la metodologia codificada. No bloquean porque hay excepciones legitimas, pero salen en pantalla para que la decision sea consciente.

## 7.5 Que pasa al editar algo ya publicado

Este es el punto del encargo. Secuencia completa:

1. El autor abre una experiencia publicada. El editor esta en solo lectura, con un aviso: "Version 2, publicada el 3 de junio. Corren 3 corridas con esta version."
2. Boton **Abrir borrador**. Ejecuta `abrir_borrador(experiencia_id)`:
   - crea la version 3 en `borrador`, con `origen_version_id = version 2`;
   - clona bisagras, piezas de kit y bloques, con ids nuevos y **el mismo `raiz_id`**;
   - remapea `bisagra_id` y `pieza_kit_id` de los bloques a las filas nuevas, cruzando por `raiz_id`;
   - **no copia bytes.** Los `medios` pertenecen a la experiencia, no a la version. Los bloques clonados apuntan al mismo `medio_id`.
   - si ya habia un borrador abierto, devuelve ese y no crea nada.
3. El autor edita. La version 2 sigue publicada e intacta. Nadie ve el borrador salvo el equipo.
4. Publicar la version 3 (`publicar_version`), en una sola transaccion:
   - corre `puede_publicar` y aborta si hay bloqueos;
   - normaliza `orden` a 1..N por ambito;
   - pone la version 2 en `retirada` con `retirada_at`;
   - pone la version 3 en `publicada` con `publicada_at` y `publicada_por`;
   - escribe en `bitacora_experiencia`.

### 7.5.1 Que pasa con las corridas

`corridas.version_id` se ancla cuando la corrida pasa a `confirmada`, tomando la version publicada de ese momento.

| Estado de la corrida | Al publicar una version nueva |
|---|---|
| `prospecto` | sin anclar todavia. Al confirmarse tomara la nueva |
| `confirmada`, `en_preparacion` | **no se mueve.** El moderador sigue viendo el guion con el que se preparo. Aparece un aviso en la ficha de la corrida: "Hay una version 3 publicada" mas un boton "Ver que cambia" |
| `corrida` (ya paso) | tampoco se mueve. Pero el retorno dura seis meses, asi que la migracion sigue siendo posible y a veces deseable |
| `cancelada` | sin efecto |

Migracion explicita:

```sql
mover_corrida_a_version(p_corrida uuid, p_version uuid)
```
Muestra antes un diff y **advierte si alguna bisagra ya abierta desaparece en la version destino**, cruzando `aperturas.bisagra_raiz_id` contra las raices de la version destino. Si eso pasa, la fila de apertura se conserva pero queda huerfana y el aviso lo dice: "Cerraras contenido que este foro ya vio."

Nunca hay migracion automatica ni masiva.

## 7.6 Por que no hay historial por bloque

Se evaluo y se descarto. Tres razones:

1. La pregunta que la gente hace es "con que diseño corrio Anahuac en agosto", y eso lo contesta la version, no el bloque.
2. Con autoguardado cada 800 ms, un historial por bloque escribe una fila por pulsacion agrupada. Es un volumen enorme para un valor que nadie consulta.
3. Un historial granular promete un rollback quirurgico que en un texto de autor casi nunca es lo que se quiere: se quiere volver a la version anterior completa, y eso ya existe (la version `retirada` esta entera y se puede clonar con `abrir_borrador` apuntando a ella).

Lo que si se guarda es la bitacora de acciones (quien abrio borrador, quien envio a revision, quien publico, quien devolvio y con que nota). Eso responde a la responsabilidad, que es la pregunta real de gobierno.

---

# 8. Archivos

## 8.1 Punto de partida

**No existe ninguna subida de archivos en el repositorio.** Verificado por `grep` de `.storage` y `upload(` sobre `app`, `lib` y `components`: cero resultados. `documents.pdf_url` (`schema.sql:141`) es un `text` que alguien pega a mano. Todo esto se construye desde cero.

## 8.2 Buckets

Dos, ambos **privados**.

| Bucket | Contenido | MIME permitidos | Techo por archivo |
|---|---|---|---|
| `experiencia-docs` | PDF, imagenes, audio | `application/pdf`, `image/jpeg`, `image/png`, `image/webp`, `audio/mpeg`, `audio/mp4` | 50 MB |
| `experiencia-video` | video | `video/mp4`, `video/webm` | 50 MB en v1, 2 GB en fase 2 con TUS |

Ruta:
```
{experiencia_id}/{medio_id}.{ext}
```
La ruta cuelga de la EXPERIENCIA, no de la version. Es lo que permite que `abrir_borrador` clone bloques sin duplicar bytes.

Privados los dos. El guion del moderador es propiedad licenciada por capitulo (`dominio.ts:163`, "Licencia del capitulo"). Una URL publica es una fuga permanente.

## 8.3 Subida

Directa del navegador a Storage. El servidor nunca transporta los bytes.

```
1. cliente  POST /api/personalab/medios
            { experiencia_id, nombre_original, mime, bytes, clase }
2. servidor valida rol de equipo, MIME y tamaño contra la tabla de arriba
            inserta medios(..., estado='pendiente')
            crea signed upload URL de Supabase Storage
            responde { medio_id, url_subida, token }
3. cliente  PUT del archivo a url_subida, con progreso
4. cliente  POST /api/personalab/medios/{id}/confirmar { bytes, sha256 }
5. servidor verifica que el objeto existe en Storage y que el tamaño cuadra
            extrae metadatos (ancho, alto, paginas, duracion) donde se pueda
            medios.estado = 'listo'
6. cliente  el bloque queda con medio_id y ya renderiza
```

Por que asi y no por server action: el limite de cuerpo por defecto de una server action de Next 14 es de 1 MB, y `portal/next.config.mjs` esta vacio, o sea que corre con los valores de fabrica. Cualquier PDF real la tumbaria.

Si el paso 4 nunca llega, el medio queda en `pendiente`. Una tarea de limpieza borra los `pendiente` de mas de 24 horas, objeto y fila. La compuerta `medio_no_listo` impide publicar una version que apunte a uno de esos.

## 8.4 Lectura

Nunca se expone la ruta de Storage al cliente. Una sola ruta:

```
GET /api/personalab/medios/{medio_id}?corrida={id}&bloque={id}[&descarga=1]
```

El servidor:
1. Resuelve el bloque y comprueba que su `medio_id` (o `poster_medio_id`) es el pedido. Sin esto, cualquiera con un `medio_id` leeria cualquier archivo.
2. Calcula `mi_nivel_en(corrida)` y lo compara con `nivel_audiencia(bloque.audiencia)`. Si es menor, 404. **404, no 403**: un 403 confirma que el archivo existe.
3. Si `descarga=1`, exige `bloque.contenido->>'modo' = 'descarga'` y nivel >= 2. Si no, 404.
4. Emite una URL firmada de **900 segundos**, con `download` cuando corresponde.
5. Si es descarga, inserta en `descargas_medio`.
6. Responde 302.

En React se usa `<img>` plano con `loading="lazy"`, no `next/image`. Razon: la URL firmada cambia en cada request y expira; `next/image` cachearia una URL muerta.

## 8.5 La diferencia entre descargar y ver

Es la distincion que pidio el usuario y esta en tres capas:

| | Moderador descarga | Participante ve |
|---|---|---|
| `contenido.modo` | `descarga` | `lectura` |
| `audiencia` | `moderador` o `equipo` | `participante` |
| Disposition | `attachment` | `inline` |
| UI | boton "Descargar", con peso y numero de paginas | visor incrustado, sin boton |
| Registro | fila en `descargas_medio` | nada |
| Garantia | CHECK de tabla, no convencion | idem |

**Advertencia honesta.** `inline` no es proteccion. Cualquiera puede abrir la consola del navegador y guardar los bytes. Lo que da es una regla de producto legible y trazabilidad de quien pidio la descarga formalmente. Si algun dia hace falta proteccion de verdad hay que ir a marca de agua por usuario o a un visor con render en servidor, y eso es otro proyecto.

## 8.6 Video, con la verdad por delante

- v1, camino principal: `fuente = 'externo'`. El autor pega un enlace de Vimeo, YouTube no listado o Mux. Se guardan `proveedor` e `id_externo`, mas un `poster_medio_id` propio. Sin dependencias, sin transcodificacion, sin costo de almacenamiento.
- v1, camino secundario: `fuente = 'subido'` con techo de 50 MB. Suficiente para una guia de 2 a 3 minutos a 720p, que es el caso real de la vispera. **La UI dice el techo antes de que el autor elija el archivo**, no despues de que falle.
- Fase 2: subida reanudable (protocolo TUS de Supabase Storage) para levantar el techo a 2 GB, con barra de progreso real y reanudacion. Es lo que hace falta para grabaciones largas.

El techo exacto de subida estandar depende de la configuracion del proyecto de Supabase y **no se verifico en esta sesion**. Esta anotado en riesgos: hay que confirmarlo en los ajustes del proyecto antes de fijar el numero en la UI.

---

# 9. Esquema SQL

Postgres, para Supabase. Estilo de la casa: `text` mas `check` en vez de enums nativos, columnas de dominio en español, auditoria en ingles (`created_at`, `created_by`), RLS habilitado en todas las tablas. Igual que `portal/supabase/schema.sql`.

## 9.1 Funciones de validacion

Van primero: las usan los CHECK de las tablas.

```sql
-- ── Validacion de texto rico ────────────────────────────────────

create or replace function public.span_valido(p jsonb)
returns boolean language plpgsql immutable as $$
declare m jsonb;
begin
  if jsonb_typeof(p) <> 'object' then return false; end if;
  if jsonb_typeof(p->'texto') <> 'string' then return false; end if;
  if p ? 'marcas' then
    if jsonb_typeof(p->'marcas') <> 'array' then return false; end if;
    for m in select * from jsonb_array_elements(p->'marcas') loop
      if (m #>> '{}') not in ('enfasis','fuerte','enlace') then return false; end if;
    end loop;
    if (p->'marcas') @> '["enlace"]'::jsonb then
      if coalesce(p->>'href','') !~ '^(https?://|/|mailto:)' then return false; end if;
    end if;
  end if;
  return true;
end;
$$;

create or replace function public.doc_rico_valido(p_doc jsonb)
returns boolean language plpgsql immutable as $$
declare n jsonb; h jsonb; it jsonb;
begin
  if p_doc is null or jsonb_typeof(p_doc) <> 'object' then return false; end if;
  if (p_doc->>'v') <> '1' then return false; end if;
  if jsonb_typeof(p_doc->'nodos') <> 'array' then return false; end if;
  if jsonb_array_length(p_doc->'nodos') > 200 then return false; end if;
  if length(p_doc::text) > 40000 then return false; end if;

  for n in select * from jsonb_array_elements(p_doc->'nodos') loop
    if (n->>'tipo') = 'parrafo' then
      if jsonb_typeof(n->'hijos') <> 'array' then return false; end if;
      for h in select * from jsonb_array_elements(n->'hijos') loop
        if not public.span_valido(h) then return false; end if;
      end loop;
    elsif (n->>'tipo') = 'lista' then
      if (n->>'estilo') not in ('punto','numero') then return false; end if;
      if jsonb_typeof(n->'items') <> 'array' then return false; end if;
      for it in select * from jsonb_array_elements(n->'items') loop
        if jsonb_typeof(it) <> 'array' then return false; end if;
        for h in select * from jsonb_array_elements(it) loop
          if not public.span_valido(h) then return false; end if;
        end loop;
      end loop;
    else
      return false;
    end if;
  end loop;
  return true;
end;
$$;

-- ── Validacion de contenido por tipo de bloque ──────────────────

create or replace function public.bloque_valido(p_tipo text, p_contenido jsonb)
returns boolean language plpgsql immutable as $$
begin
  if p_contenido is null or jsonb_typeof(p_contenido) <> 'object' then
    return false;
  end if;

  case p_tipo
    when 'titulo' then
      return coalesce(length(p_contenido->>'texto'),0) between 1 and 200
         and (p_contenido->>'nivel') in ('2','3');

    when 'texto' then
      return public.doc_rico_valido(p_contenido->'doc');

    when 'cita' then
      return public.doc_rico_valido(p_contenido->'doc')
         and coalesce(length(p_contenido->>'autor'),0) <= 120
         and coalesce(length(p_contenido->>'fuente'),0) <= 120;

    when 'destacado', 'nota' then
      return (p_contenido->>'tono') in ('neutro','aviso','cuidado')
         and coalesce(length(p_contenido->>'titulo'),0) <= 80
         and public.doc_rico_valido(p_contenido->'doc');

    when 'imagen' then
      return coalesce(length(p_contenido->>'alt'),0) <= 300
         and (p_contenido->>'encuadre') in ('ancho','columna');

    when 'video' then
      return (p_contenido->>'fuente') in ('subido','externo')
         and coalesce(length(p_contenido->>'titulo'),0) > 0
         and (
              p_contenido->>'fuente' = 'subido'
              or ( (p_contenido->>'proveedor') in ('vimeo','youtube','mux')
                   and coalesce(length(p_contenido->>'id_externo'),0) > 0 )
             );

    when 'audio' then
      return coalesce(length(p_contenido->>'titulo'),0) > 0;

    when 'archivo' then
      return coalesce(length(p_contenido->>'nombre'),0) > 0
         and (p_contenido->>'modo') in ('descarga','lectura');

    when 'separador' then
      return (p_contenido->>'estilo') in ('linea','aire','ornamento');

    when 'llamado' then
      return coalesce(length(p_contenido->>'etiqueta'),0) between 1 and 60
         and (p_contenido->>'destino_tipo') in ('ruta','externo','bisagra','correo')
         and coalesce(length(p_contenido->>'destino'),0) > 0;

    when 'consigna' then
      return (p_contenido->>'soporte') in ('a_mano','en_sala','en_pantalla')
         and public.doc_rico_valido(p_contenido->'doc');

    when 'kit_ref' then
      return coalesce(length(p_contenido->>'nota'),0) <= 300;

    else
      return false;
  end case;
end;
$$;

-- ── Nivel de audiencia ──────────────────────────────────────────

create or replace function public.nivel_audiencia(a text)
returns int language sql immutable as $$
  select case a
    when 'participante' then 1
    when 'moderador'    then 2
    when 'equipo'       then 3
    else 3
  end
$$;
```

**Tradeoff que hay que saber.** Usar una funcion dentro de un CHECK significa que cambiar la funcion no revalida las filas viejas, y que `pg_dump` / `restore` es sensible al orden de creacion. Es aceptable aqui porque la alternativa (validar solo en la aplicacion) ya fallo en este proyecto: hoy no hay validacion mas alla del `required` del navegador. Mitigacion: una consulta de asercion nocturna que corre `bloque_valido` sobre todas las filas y avisa de las que ya no cumplen.

## 9.2 Equipo por workspace

```sql
create table public.equipo_4meaning (
  perfil_id  uuid not null references public.profiles(id) on delete cascade,
  workspace  text not null check (workspace in ('trascendencia','personalab')),
  rol        text not null check (rol in ('autor','editor','operacion')),
  desde      date not null default current_date,
  primary key (perfil_id, workspace)
);
alter table public.equipo_4meaning enable row level security;

create or replace function public.es_equipo_personalab()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.equipo_4meaning
    where perfil_id = auth.uid() and workspace = 'personalab'
  ) or public.my_role() = 'super_admin'
$$;

create or replace function public.puede_publicar_personalab()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.equipo_4meaning
    where perfil_id = auth.uid() and workspace = 'personalab' and rol = 'editor'
  ) or public.my_role() = 'super_admin'
$$;
```

`my_role()` ya existe (`schema.sql:178`). Se reutiliza, no se duplica.

## 9.3 Catalogo

```sql
-- ── EXPERIENCIAS ────────────────────────────────────────────────
create table public.experiencias (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text unique not null,
  nombre               text not null,
  subtitulo            text,
  narrativa            text,
  duracion             text,
  maduracion           text not null default 'diseño'
                         check (maduracion in ('diseño','piloto','lista','retirada')),
  abre_espacio_al_foro boolean not null default false,
  nota_diseno          text,
  created_by           uuid references public.profiles(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
alter table public.experiencias enable row level security;

-- ── VERSIONES ───────────────────────────────────────────────────
create table public.versiones_experiencia (
  id                    uuid primary key default gen_random_uuid(),
  experiencia_id        uuid not null references public.experiencias(id) on delete cascade,
  numero                int  not null,
  estado                text not null default 'borrador'
                          check (estado in ('borrador','en_revision','publicada','retirada')),
  nota_version          text,
  nota_revision         text,
  revisado_visibilidad  boolean not null default false,
  origen_version_id     uuid references public.versiones_experiencia(id),
  guardado_at           timestamptz,
  enviada_revision_at   timestamptz,
  enviada_revision_por  uuid references public.profiles(id),
  publicada_at          timestamptz,
  publicada_por         uuid references public.profiles(id),
  retirada_at           timestamptz,
  created_by            uuid references public.profiles(id),
  created_at            timestamptz not null default now(),
  unique (experiencia_id, numero)
);
alter table public.versiones_experiencia enable row level security;

create unique index versiones_una_publicada
  on public.versiones_experiencia (experiencia_id)
  where estado = 'publicada';

create unique index versiones_una_abierta
  on public.versiones_experiencia (experiencia_id)
  where estado in ('borrador','en_revision');

-- ── MEDIOS ──────────────────────────────────────────────────────
create table public.medios (
  id              uuid primary key default gen_random_uuid(),
  experiencia_id  uuid not null references public.experiencias(id) on delete restrict,
  bucket          text not null check (bucket in ('experiencia-docs','experiencia-video')),
  ruta            text not null,
  clase           text not null check (clase in ('imagen','documento','video','audio')),
  mime            text not null,
  bytes           bigint not null check (bytes > 0),
  sha256          text,
  nombre_original text not null,
  estado          text not null default 'pendiente'
                    check (estado in ('pendiente','listo','fallido')),
  ancho           int,
  alto            int,
  duracion_seg    int,
  paginas         int,
  subido_por      uuid references public.profiles(id),
  subido_at       timestamptz not null default now(),
  unique (bucket, ruta)
);
alter table public.medios enable row level security;
create index medios_experiencia_idx on public.medios (experiencia_id, clase, estado);

-- ── BISAGRAS ────────────────────────────────────────────────────
create table public.bisagras (
  id            uuid primary key default gen_random_uuid(),
  raiz_id       uuid,
  version_id    uuid not null references public.versiones_experiencia(id) on delete cascade,
  tiempo        text not null check (tiempo in ('vispera','ignicion','retorno')),
  orden         numeric(20,10) not null,
  titulo        text not null,
  descripcion   text,
  soporte       text not null default 'pantalla'
                  check (soporte in ('sala','objeto','pantalla')),
  duracion      text,
  listo         boolean not null default false,
  requiere      text[] not null default '{}',
  apertura      text not null default 'inmediata'
                  check (apertura in ('inmediata','programada','manual')),
  offset_dias   int,
  oculta_antes  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (apertura <> 'programada' or offset_dias is not null)
);
alter table public.bisagras enable row level security;
create index bisagras_version_idx on public.bisagras (version_id, tiempo, orden);
create index bisagras_raiz_idx    on public.bisagras (raiz_id);

-- ── PIEZAS DE KIT ───────────────────────────────────────────────
create table public.piezas_kit (
  id          uuid primary key default gen_random_uuid(),
  raiz_id     uuid,
  version_id  uuid not null references public.versiones_experiencia(id) on delete cascade,
  columna     text not null check (columna in ('objeto','humano','administrativo')),
  nombre      text not null,
  detalle     text,
  por_persona boolean not null default false,
  disponible  boolean not null default false,
  orden       numeric(20,10) not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.piezas_kit enable row level security;
create index piezas_kit_version_idx on public.piezas_kit (version_id, columna, orden);
create index piezas_kit_raiz_idx    on public.piezas_kit (raiz_id);

-- ── BLOQUES ─────────────────────────────────────────────────────
create table public.bloques (
  id              uuid primary key default gen_random_uuid(),
  raiz_id         uuid,
  version_id      uuid not null references public.versiones_experiencia(id) on delete cascade,
  bisagra_id      uuid references public.bisagras(id) on delete cascade,
  orden           numeric(20,10) not null,
  tipo            text not null check (tipo in (
                    'titulo','texto','cita','destacado','nota','imagen','video',
                    'audio','archivo','separador','llamado','consigna','kit_ref')),
  audiencia       text not null default 'participante'
                    check (audiencia in ('participante','moderador','equipo')),
  contenido       jsonb not null default '{}'::jsonb,
  medio_id        uuid references public.medios(id) on delete restrict,
  poster_medio_id uuid references public.medios(id) on delete restrict,
  pieza_kit_id    uuid references public.piezas_kit(id) on delete set null,
  rev             int not null default 1,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- forma del contenido segun el tipo
  constraint bloques_contenido_valido
    check (public.bloque_valido(tipo, contenido)),

  -- la nota interna nunca puede quedar visible al participante
  constraint bloques_nota_interna
    check (tipo <> 'nota' or audiencia in ('moderador','equipo')),

  -- regla de dominio: el participante recibe, no descarga
  constraint bloques_descarga_solo_profesional
    check (tipo <> 'archivo'
           or coalesce(contenido->>'modo','') <> 'descarga'
           or audiencia in ('moderador','equipo')),

  -- los tipos que exigen medio
  constraint bloques_medio_obligatorio
    check (
      case
        when tipo in ('imagen','audio','archivo') then medio_id is not null
        when tipo = 'video' and contenido->>'fuente' = 'subido' then medio_id is not null
        else true
      end
    ),

  -- kit_ref exige pieza
  constraint bloques_kit_obligatorio
    check (tipo <> 'kit_ref' or pieza_kit_id is not null)
);
alter table public.bloques enable row level security;
create index bloques_bisagra_idx  on public.bloques (bisagra_id, orden);
create index bloques_portada_idx  on public.bloques (version_id, orden) where bisagra_id is null;
create index bloques_version_idx  on public.bloques (version_id, audiencia);
create index bloques_raiz_idx     on public.bloques (raiz_id);
create index bloques_medio_idx    on public.bloques (medio_id) where medio_id is not null;
```

## 9.4 Operacion

```sql
-- ── CAPITULOS ───────────────────────────────────────────────────
create table public.capitulos (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  ciudad     text,
  pais       text default 'México',
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.capitulos enable row level security;

-- ── MODERADORES ─────────────────────────────────────────────────
create table public.moderadores (
  id           uuid primary key default gen_random_uuid(),
  perfil_id    uuid not null unique references public.profiles(id) on delete cascade,
  capitulo_id  uuid not null references public.capitulos(id) on delete restrict,
  desde        date not null default current_date,
  activo       boolean not null default true
);
alter table public.moderadores enable row level security;

-- Formacion: en que experiencias esta formado. No es progreso del participante:
-- es una habilitacion profesional, requisito para poder correr.
create table public.formaciones (
  moderador_id   uuid not null references public.moderadores(id) on delete cascade,
  experiencia_id uuid not null references public.experiencias(id) on delete cascade,
  formado_at     date not null default current_date,
  formado_por    uuid references public.profiles(id),
  primary key (moderador_id, experiencia_id)
);
alter table public.formaciones enable row level security;

-- ── CORRIDAS ────────────────────────────────────────────────────
create table public.corridas (
  id                  uuid primary key default gen_random_uuid(),
  experiencia_id      uuid not null references public.experiencias(id) on delete restrict,
  version_id          uuid references public.versiones_experiencia(id) on delete restrict,
  capitulo_id         uuid not null references public.capitulos(id) on delete restrict,
  moderador_id        uuid not null references public.moderadores(id) on delete restrict,
  fecha               date not null,
  estado              text not null default 'prospecto'
                        check (estado in ('prospecto','confirmada','en_preparacion','corrida','cancelada')),
  personas_en_el_foro int  not null default 0,
  sede                text,
  mes_de_retorno      int,
  notas               text,
  created_by          uuid references public.profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- no se puede confirmar una corrida sin anclar la version
  constraint corridas_version_anclada
    check (estado in ('prospecto','cancelada') or version_id is not null)
);
alter table public.corridas enable row level security;
create index corridas_experiencia_idx on public.corridas (experiencia_id, estado, fecha);
create index corridas_capitulo_idx    on public.corridas (capitulo_id, fecha);

-- ── GRANTS ──────────────────────────────────────────────────────
create table public.grants (
  id           uuid primary key default gen_random_uuid(),
  corrida_id   uuid not null references public.corridas(id) on delete cascade,
  perfil_id    uuid not null references public.profiles(id) on delete cascade,
  titularidad  text not null check (titularidad in ('moderador','miembro_foro')),
  otorgado_at  timestamptz not null default now(),
  otorgado_por uuid references public.profiles(id),
  revocado_at  timestamptz,
  unique (corrida_id, perfil_id)
);
alter table public.grants enable row level security;
create index grants_perfil_idx on public.grants (perfil_id) where revocado_at is null;

-- ── APERTURAS ───────────────────────────────────────────────────
-- Solo para bisagras con apertura = 'manual'.
-- Apunta a bisagra_raiz_id, no a bisagra_id, para sobrevivir a un cambio de version.
create table public.aperturas (
  id               uuid primary key default gen_random_uuid(),
  corrida_id       uuid not null references public.corridas(id) on delete cascade,
  bisagra_raiz_id  uuid not null,
  abierta_at       timestamptz not null default now(),
  abierta_por      uuid references public.profiles(id),
  unique (corrida_id, bisagra_raiz_id)
);
alter table public.aperturas enable row level security;

-- ── BITACORA ────────────────────────────────────────────────────
create table public.bitacora_experiencia (
  id             bigserial primary key,
  experiencia_id uuid not null references public.experiencias(id) on delete cascade,
  version_id     uuid references public.versiones_experiencia(id) on delete set null,
  actor_id       uuid references public.profiles(id),
  accion         text not null check (accion in (
                   'experiencia_creada','borrador_abierto','enviada_a_revision',
                   'devuelta_a_borrador','publicada','retirada',
                   'corrida_anclada','corrida_migrada','bisagra_abierta')),
  detalle        jsonb not null default '{}'::jsonb,
  at             timestamptz not null default now()
);
alter table public.bitacora_experiencia enable row level security;
create index bitacora_exp_idx on public.bitacora_experiencia (experiencia_id, at desc);

-- ── DESCARGAS ───────────────────────────────────────────────────
-- El guion del moderador es propiedad licenciada. Hay que saber quien lo bajo.
create table public.descargas_medio (
  id         bigserial primary key,
  medio_id   uuid not null references public.medios(id) on delete cascade,
  bloque_id  uuid references public.bloques(id) on delete set null,
  corrida_id uuid references public.corridas(id) on delete set null,
  perfil_id  uuid references public.profiles(id) on delete set null,
  at         timestamptz not null default now(),
  ip         inet,
  user_agent text
);
alter table public.descargas_medio enable row level security;
create index descargas_medio_idx on public.descargas_medio (medio_id, at desc);
```

## 9.5 Triggers

```sql
-- raiz_id se autoasigna al id en la fila original
create or replace function public.set_raiz_id()
returns trigger language plpgsql as $$
begin
  if new.raiz_id is null then new.raiz_id := new.id; end if;
  return new;
end;
$$;

create trigger bisagras_raiz   before insert on public.bisagras   for each row execute function public.set_raiz_id();
create trigger bloques_raiz    before insert on public.bloques    for each row execute function public.set_raiz_id();
create trigger piezas_kit_raiz before insert on public.piezas_kit for each row execute function public.set_raiz_id();

-- Solo se escribe sobre versiones en borrador.
-- La valvula de escape es la GUC que publicar_version pone dentro de su transaccion.
create or replace function public.solo_borrador()
returns trigger language plpgsql as $$
declare v_estado text; v_id uuid;
begin
  if coalesce(current_setting('personalab.publicando', true), '') = 'on' then
    return coalesce(new, old);
  end if;
  v_id := coalesce(new.version_id, old.version_id);
  select estado into v_estado from public.versiones_experiencia where id = v_id;
  if v_estado is distinct from 'borrador' then
    raise exception 'la version % esta en estado %, no admite cambios', v_id, v_estado
      using errcode = 'check_violation';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger bisagras_solo_borrador
  before insert or update or delete on public.bisagras
  for each row execute function public.solo_borrador();
create trigger bloques_solo_borrador
  before insert or update or delete on public.bloques
  for each row execute function public.solo_borrador();
create trigger piezas_kit_solo_borrador
  before insert or update or delete on public.piezas_kit
  for each row execute function public.solo_borrador();

-- rev y updated_at del bloque
create or replace function public.bump_rev()
returns trigger language plpgsql as $$
begin
  new.rev := old.rev + 1;
  new.updated_at := now();
  return new;
end;
$$;
create trigger bloques_bump_rev before update on public.bloques
  for each row execute function public.bump_rev();

-- "Guardado hace X"
create or replace function public.touch_guardado()
returns trigger language plpgsql as $$
begin
  update public.versiones_experiencia
     set guardado_at = now()
   where id = coalesce(new.version_id, old.version_id);
  return coalesce(new, old);
end;
$$;
create trigger bloques_touch    after insert or update or delete on public.bloques
  for each row execute function public.touch_guardado();
create trigger bisagras_touch   after insert or update or delete on public.bisagras
  for each row execute function public.touch_guardado();
create trigger piezas_kit_touch after insert or update or delete on public.piezas_kit
  for each row execute function public.touch_guardado();
```

## 9.6 Funciones del ciclo de vida

```sql
-- ── Abrir borrador (copia al escribir) ──────────────────────────
create or replace function public.abrir_borrador(p_experiencia uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_origen uuid; v_nueva uuid; v_num int;
begin
  if not es_equipo_personalab() then
    raise exception 'sin permiso' using errcode = '42501';
  end if;

  select id into v_nueva from versiones_experiencia
   where experiencia_id = p_experiencia and estado in ('borrador','en_revision') limit 1;
  if v_nueva is not null then return v_nueva; end if;

  select id into v_origen from versiones_experiencia
   where experiencia_id = p_experiencia and estado = 'publicada';

  select coalesce(max(numero),0) + 1 into v_num
    from versiones_experiencia where experiencia_id = p_experiencia;

  insert into versiones_experiencia (experiencia_id, numero, estado, origen_version_id, created_by)
  values (p_experiencia, v_num, 'borrador', v_origen, auth.uid())
  returning id into v_nueva;

  if v_origen is not null then
    insert into bisagras (version_id, raiz_id, tiempo, orden, titulo, descripcion,
                          soporte, duracion, listo, requiere, apertura, offset_dias, oculta_antes)
    select v_nueva, raiz_id, tiempo, orden, titulo, descripcion,
           soporte, duracion, listo, requiere, apertura, offset_dias, oculta_antes
      from bisagras where version_id = v_origen;

    insert into piezas_kit (version_id, raiz_id, columna, nombre, detalle, por_persona, disponible, orden)
    select v_nueva, raiz_id, columna, nombre, detalle, por_persona, disponible, orden
      from piezas_kit where version_id = v_origen;

    insert into bloques (version_id, raiz_id, bisagra_id, pieza_kit_id, orden, tipo,
                         audiencia, contenido, medio_id, poster_medio_id, created_by)
    select v_nueva, b.raiz_id, nb.id, np.id, b.orden, b.tipo,
           b.audiencia, b.contenido, b.medio_id, b.poster_medio_id, auth.uid()
      from bloques b
      left join bisagras   ob on ob.id = b.bisagra_id
      left join bisagras   nb on nb.version_id = v_nueva and nb.raiz_id = ob.raiz_id
      left join piezas_kit op on op.id = b.pieza_kit_id
      left join piezas_kit np on np.version_id = v_nueva and np.raiz_id = op.raiz_id
     where b.version_id = v_origen;
  end if;

  insert into bitacora_experiencia (experiencia_id, version_id, actor_id, accion, detalle)
  values (p_experiencia, v_nueva, auth.uid(), 'borrador_abierto',
          jsonb_build_object('origen', v_origen, 'numero', v_num));

  return v_nueva;
end;
$$;

-- ── Normalizar orden ────────────────────────────────────────────
create or replace function public.normalizar_orden(p_version uuid)
returns void language plpgsql as $$
begin
  with num as (
    select id, row_number() over (partition by tiempo order by orden, created_at) n
      from bisagras where version_id = p_version
  ) update bisagras b set orden = num.n from num where num.id = b.id;

  with num as (
    select id, row_number() over (
             partition by coalesce(bisagra_id, '00000000-0000-0000-0000-000000000000'::uuid)
             order by orden, created_at) n
      from bloques where version_id = p_version
  ) update bloques b set orden = num.n from num where num.id = b.id;
end;
$$;

-- ── Compuertas ──────────────────────────────────────────────────
create or replace function public.puede_publicar(p_version uuid)
returns table (severidad text, codigo text, mensaje text, bisagra_id uuid, bloque_id uuid)
language sql stable as $$
  -- BLOQUEOS
  select 'bloqueo','sin_ignicion',
         'La experiencia no tiene ninguna bisagra en la ignicion.', null::uuid, null::uuid
  where not exists (select 1 from bisagras where version_id = p_version and tiempo = 'ignicion')
  union all
  select 'bloqueo','bisagra_sin_titulo','Bisagra sin titulo.', id, null
    from bisagras where version_id = p_version and coalesce(btrim(titulo),'') = ''
  union all
  select 'bloqueo','texto_vacio','Bloque de texto vacio.', bisagra_id, id
    from bloques
   where version_id = p_version
     and tipo in ('titulo','texto','cita','destacado','nota','consigna')
     and coalesce(btrim(
           case when tipo = 'titulo' then contenido->>'texto'
                else (select string_agg(h->>'texto','')
                        from jsonb_array_elements(contenido#>'{doc,nodos}') n,
                             jsonb_array_elements(coalesce(n->'hijos','[]'::jsonb)) h)
           end), '') = ''
  union all
  select 'bloqueo','medio_no_listo','El archivo todavia no termino de subir.', b.bisagra_id, b.id
    from bloques b join medios m on m.id = b.medio_id
   where b.version_id = p_version and m.estado <> 'listo'
  union all
  select 'bloqueo','llamado_roto','El llamado apunta a una bisagra que no existe.', b.bisagra_id, b.id
    from bloques b
   where b.version_id = p_version and b.tipo = 'llamado'
     and b.contenido->>'destino_tipo' = 'bisagra'
     and not exists (select 1 from bisagras x
                      where x.version_id = p_version
                        and x.raiz_id = (b.contenido->>'destino')::uuid)
  union all
  select 'bloqueo','kit_ref_roto','La pieza de kit referenciada no es de esta version.', b.bisagra_id, b.id
    from bloques b left join piezas_kit p on p.id = b.pieza_kit_id
   where b.version_id = p_version and b.tipo = 'kit_ref'
     and (p.id is null or p.version_id <> p_version)
  union all
  select 'bloqueo','cita_con_lista','Una cita solo admite parrafos.', b.bisagra_id, b.id
    from bloques b
   where b.version_id = p_version and b.tipo = 'cita'
     and exists (select 1 from jsonb_array_elements(b.contenido#>'{doc,nodos}') n
                  where n->>'tipo' <> 'parrafo')
  union all
  select 'bloqueo','visibilidad_no_revisada',
         'Falta confirmar quien ve cada cosa.', null, null
    from versiones_experiencia
   where id = p_version and revisado_visibilidad = false

  -- AVISOS
  union all
  select 'aviso','ignicion_con_pantalla',
         'Bisagra de ignicion con contenido visible al participante. En la ignicion el software es mudo.',
         g.id, null
    from bisagras g
   where g.version_id = p_version and g.tiempo = 'ignicion'
     and exists (select 1 from bloques b where b.bisagra_id = g.id and b.audiencia = 'participante')
  union all
  select 'aviso','sala_con_pantalla',
         'Bisagra de sala con contenido de pantalla para el participante.', g.id, null
    from bisagras g
   where g.version_id = p_version and g.soporte = 'sala'
     and exists (select 1 from bloques b where b.bisagra_id = g.id and b.audiencia = 'participante')
  union all
  select 'aviso','bisagra_sin_bloques','Bisagra sin ningun bloque.', g.id, null
    from bisagras g
   where g.version_id = p_version
     and not exists (select 1 from bloques b where b.bisagra_id = g.id)
  union all
  select 'aviso','tiempo_vacio','Este tiempo no tiene ninguna bisagra: ' || t.t, null, null
    from (values ('vispera'),('retorno')) t(t)
   where not exists (select 1 from bisagras where version_id = p_version and tiempo = t.t)
  union all
  select 'aviso','bisagra_no_lista','Bisagra marcada como no lista.', id, null
    from bisagras where version_id = p_version and listo = false
  union all
  select 'aviso','imagen_sin_alt','Imagen sin texto alternativo.', bisagra_id, id
    from bloques where version_id = p_version and tipo = 'imagen'
      and coalesce(btrim(contenido->>'alt'),'') = ''
  union all
  select 'aviso','video_sin_poster','Video externo sin imagen de portada.', bisagra_id, id
    from bloques where version_id = p_version and tipo = 'video'
      and contenido->>'fuente' = 'externo' and poster_medio_id is null
  union all
  select 'aviso','video_sin_transcripcion','Pieza de audio o video sin transcripcion.', bisagra_id, id
    from bloques where version_id = p_version and tipo in ('video','audio')
      and coalesce(btrim(contenido->>'transcripcion'),'') = '';
$$;

-- ── Enviar a revision ───────────────────────────────────────────
create or replace function public.enviar_a_revision(p_version uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not es_equipo_personalab() then raise exception 'sin permiso' using errcode='42501'; end if;
  update versiones_experiencia
     set estado = 'en_revision', enviada_revision_at = now(), enviada_revision_por = auth.uid()
   where id = p_version and estado = 'borrador';
  if not found then raise exception 'la version no esta en borrador'; end if;
  insert into bitacora_experiencia (experiencia_id, version_id, actor_id, accion)
  select experiencia_id, id, auth.uid(), 'enviada_a_revision'
    from versiones_experiencia where id = p_version;
end;
$$;

-- ── Devolver a borrador ─────────────────────────────────────────
create or replace function public.devolver_a_borrador(p_version uuid, p_nota text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not puede_publicar_personalab() then raise exception 'sin permiso' using errcode='42501'; end if;
  if coalesce(btrim(p_nota),'') = '' then raise exception 'la nota de revision es obligatoria'; end if;
  update versiones_experiencia
     set estado = 'borrador', nota_revision = p_nota, revisado_visibilidad = false
   where id = p_version and estado = 'en_revision';
  if not found then raise exception 'la version no esta en revision'; end if;
  insert into bitacora_experiencia (experiencia_id, version_id, actor_id, accion, detalle)
  select experiencia_id, id, auth.uid(), 'devuelta_a_borrador', jsonb_build_object('nota', p_nota)
    from versiones_experiencia where id = p_version;
end;
$$;

-- ── Publicar ────────────────────────────────────────────────────
create or replace function public.publicar_version(p_version uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_exp uuid; v_bloqueos int;
begin
  if not puede_publicar_personalab() then raise exception 'sin permiso' using errcode='42501'; end if;

  select experiencia_id into v_exp from versiones_experiencia where id = p_version for update;
  if v_exp is null then raise exception 'version inexistente'; end if;

  select count(*) into v_bloqueos from puede_publicar(p_version) where severidad = 'bloqueo';
  if v_bloqueos > 0 then
    raise exception 'la version tiene % bloqueo(s) de publicacion', v_bloqueos
      using errcode = 'check_violation';
  end if;

  perform set_config('personalab.publicando','on', true);   -- true = local a la transaccion
  perform normalizar_orden(p_version);

  update versiones_experiencia set estado = 'retirada', retirada_at = now()
   where experiencia_id = v_exp and estado = 'publicada';

  update versiones_experiencia
     set estado = 'publicada', publicada_at = now(), publicada_por = auth.uid()
   where id = p_version and estado = 'en_revision';
  if not found then raise exception 'la version no esta en revision'; end if;

  update experiencias set updated_at = now() where id = v_exp;

  insert into bitacora_experiencia (experiencia_id, version_id, actor_id, accion)
  values (v_exp, p_version, auth.uid(), 'publicada');
end;
$$;

-- ── Migrar una corrida a otra version ───────────────────────────
create or replace function public.mover_corrida_a_version(p_corrida uuid, p_version uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_exp uuid; v_exp_v uuid;
begin
  if not es_equipo_personalab() then raise exception 'sin permiso' using errcode='42501'; end if;
  select experiencia_id into v_exp   from corridas               where id = p_corrida;
  select experiencia_id into v_exp_v from versiones_experiencia  where id = p_version;
  if v_exp is null or v_exp is distinct from v_exp_v then
    raise exception 'la version no pertenece a la experiencia de la corrida';
  end if;
  update corridas set version_id = p_version, updated_at = now() where id = p_corrida;
  insert into bitacora_experiencia (experiencia_id, version_id, actor_id, accion, detalle)
  values (v_exp, p_version, auth.uid(), 'corrida_migrada', jsonb_build_object('corrida', p_corrida));
end;
$$;
```

## 9.7 Acceso y apertura

```sql
-- Nivel del usuario actual dentro de una corrida.
-- 3 equipo, 2 moderador, 1 miembro del foro, 0 nadie.
create or replace function public.mi_nivel_en(p_corrida uuid)
returns int language sql security definer set search_path = public stable as $$
  select case
    when public.es_equipo_personalab() then 3
    when exists (
      select 1 from public.corridas c
        join public.moderadores m on m.id = c.moderador_id
       where c.id = p_corrida and m.perfil_id = auth.uid()
    ) then 2
    when exists (
      select 1 from public.grants g
       where g.corrida_id = p_corrida and g.perfil_id = auth.uid()
         and g.revocado_at is null and g.titularidad = 'miembro_foro'
    ) then 1
    else 0
  end
$$;

-- Esta abierta esta bisagra para esta corrida.
create or replace function public.bisagra_abierta(p_bisagra uuid, p_corrida uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select case g.apertura
    when 'inmediata'  then true
    when 'programada' then now() >= (c.fecha + coalesce(g.offset_dias,0))::timestamptz
    when 'manual'     then exists (
        select 1 from public.aperturas a
         where a.corrida_id = p_corrida and a.bisagra_raiz_id = g.raiz_id)
    else false
  end
  from public.bisagras g, public.corridas c
  where g.id = p_bisagra and c.id = p_corrida
$$;
```

## 9.8 RLS

```sql
-- EXPERIENCIAS
create policy "Equipo gestiona experiencias" on public.experiencias
  for all using (es_equipo_personalab()) with check (es_equipo_personalab());
create policy "Con grant se ve la experiencia" on public.experiencias
  for select using (exists (
    select 1 from public.corridas c
      join public.grants g on g.corrida_id = c.id
     where c.experiencia_id = experiencias.id
       and g.perfil_id = auth.uid() and g.revocado_at is null));

-- VERSIONES
create policy "Equipo gestiona versiones" on public.versiones_experiencia
  for all using (es_equipo_personalab()) with check (es_equipo_personalab());
create policy "Solo se lee la version anclada" on public.versiones_experiencia
  for select using (exists (
    select 1 from public.corridas c
      join public.grants g on g.corrida_id = c.id
     where c.version_id = versiones_experiencia.id
       and g.perfil_id = auth.uid() and g.revocado_at is null));

-- BISAGRAS: solo las de la version anclada de una corrida propia, y solo si estan abiertas
create policy "Equipo gestiona bisagras" on public.bisagras
  for all using (es_equipo_personalab()) with check (es_equipo_personalab());
create policy "Lector ve bisagras abiertas" on public.bisagras
  for select using (exists (
    select 1 from public.corridas c
      join public.grants g on g.corrida_id = c.id
     where c.version_id = bisagras.version_id
       and g.perfil_id = auth.uid() and g.revocado_at is null
       and (mi_nivel_en(c.id) >= 2 or public.bisagra_abierta(bisagras.id, c.id))));

-- BLOQUES: audiencia como piso, sobre bisagra abierta
create policy "Equipo gestiona bloques" on public.bloques
  for all using (es_equipo_personalab()) with check (es_equipo_personalab());
create policy "Lector ve bloques de su nivel" on public.bloques
  for select using (exists (
    select 1 from public.corridas c
      join public.grants g on g.corrida_id = c.id
     where c.version_id = bloques.version_id
       and g.perfil_id = auth.uid() and g.revocado_at is null
       and nivel_audiencia(bloques.audiencia) <= mi_nivel_en(c.id)
       and ( bloques.bisagra_id is null
             or mi_nivel_en(c.id) >= 2
             or public.bisagra_abierta(bloques.bisagra_id, c.id) )));

-- PIEZAS DE KIT
create policy "Equipo gestiona kit" on public.piezas_kit
  for all using (es_equipo_personalab()) with check (es_equipo_personalab());
create policy "Lector ve el kit de su version" on public.piezas_kit
  for select using (exists (
    select 1 from public.corridas c
      join public.grants g on g.corrida_id = c.id
     where c.version_id = piezas_kit.version_id
       and g.perfil_id = auth.uid() and g.revocado_at is null));

-- MEDIOS: nunca se leen directo. Solo el equipo hace select; el lector pasa por la ruta firmada.
create policy "Equipo gestiona medios" on public.medios
  for all using (es_equipo_personalab()) with check (es_equipo_personalab());

-- CORRIDAS
create policy "Equipo gestiona corridas" on public.corridas
  for all using (es_equipo_personalab()) with check (es_equipo_personalab());
create policy "Con grant se ve la corrida" on public.corridas
  for select using (exists (
    select 1 from public.grants g
     where g.corrida_id = corridas.id and g.perfil_id = auth.uid() and g.revocado_at is null));

-- APERTURAS: el moderador abre las suyas
create policy "Equipo gestiona aperturas" on public.aperturas
  for all using (es_equipo_personalab()) with check (es_equipo_personalab());
create policy "Moderador abre su corrida" on public.aperturas
  for insert with check (mi_nivel_en(corrida_id) >= 2);
create policy "Con grant se ven las aperturas" on public.aperturas
  for select using (mi_nivel_en(corrida_id) >= 1);

-- GRANTS, FORMACIONES, CAPITULOS, MODERADORES
create policy "Equipo gestiona grants" on public.grants
  for all using (es_equipo_personalab()) with check (es_equipo_personalab());
create policy "Cada quien ve su grant" on public.grants
  for select using (perfil_id = auth.uid());
create policy "Equipo gestiona capitulos" on public.capitulos
  for all using (es_equipo_personalab()) with check (es_equipo_personalab());
create policy "Equipo gestiona moderadores" on public.moderadores
  for all using (es_equipo_personalab()) with check (es_equipo_personalab());
create policy "Equipo gestiona formaciones" on public.formaciones
  for all using (es_equipo_personalab()) with check (es_equipo_personalab());
create policy "Equipo gestiona equipo" on public.equipo_4meaning
  for all using (my_role() in ('super_admin','admin')) with check (my_role() in ('super_admin','admin'));

-- BITACORA y DESCARGAS: append-only para el equipo, sin update ni delete
create policy "Equipo lee bitacora" on public.bitacora_experiencia
  for select using (es_equipo_personalab());
create policy "Equipo lee descargas" on public.descargas_medio
  for select using (es_equipo_personalab());
```

**Nota de rendimiento.** La policy de `bloques` cruza cuatro tablas y llama a dos funciones por fila. Para la vista del lector NO se consulta la tabla directo: se llama a una funcion `security definer` que hace la autorizacion una vez y devuelve los bloques ya filtrados.

```sql
create or replace function public.leer_bisagra(p_corrida uuid, p_bisagra_raiz uuid)
returns table (
  bloque_id uuid, orden numeric, tipo text, audiencia text,
  contenido jsonb, medio_id uuid, poster_medio_id uuid, pieza_kit_id uuid
) language plpgsql security definer set search_path = public as $$
declare v_nivel int; v_version uuid; v_bisagra uuid;
begin
  v_nivel := mi_nivel_en(p_corrida);
  if v_nivel = 0 then return; end if;

  select c.version_id into v_version from corridas c where c.id = p_corrida;
  select g.id into v_bisagra from bisagras g
   where g.version_id = v_version and g.raiz_id = p_bisagra_raiz;
  if v_bisagra is null then return; end if;
  if v_nivel < 2 and not bisagra_abierta(v_bisagra, p_corrida) then return; end if;

  return query
    select b.id, b.orden, b.tipo, b.audiencia, b.contenido,
           b.medio_id, b.poster_medio_id, b.pieza_kit_id
      from bloques b
     where b.bisagra_id = v_bisagra
       and nivel_audiencia(b.audiencia) <= v_nivel
     order by b.orden;
end;
$$;
```

La RLS queda como red de seguridad; la funcion es el camino rapido.

---

# 10. Rutas de servidor

| Metodo | Ruta | Que hace |
|---|---|---|
| POST | `/api/personalab/experiencias/{id}/borrador` | `abrir_borrador`. Devuelve `version_id` |
| PATCH | `/api/personalab/bloques/{id}` | autoguardado. Cuerpo con `rev`. 409 si hay conflicto |
| POST | `/api/personalab/bisagras/{id}/bloques` | insertar bloque. Cuerpo con `tipo`, `orden_antes`, `orden_despues` |
| DELETE | `/api/personalab/bloques/{id}` | borrar bloque |
| PATCH | `/api/personalab/bloques/{id}/orden` | mover. Cuerpo con vecinos, el servidor calcula el punto medio |
| POST | `/api/personalab/versiones/{id}/revision` | `enviar_a_revision` |
| POST | `/api/personalab/versiones/{id}/publicar` | `publicar_version` |
| POST | `/api/personalab/versiones/{id}/devolver` | `devolver_a_borrador` |
| GET | `/api/personalab/versiones/{id}/compuertas` | `puede_publicar` |
| GET | `/api/personalab/versiones/{id}/diff?contra={id}` | diff por `raiz_id` |
| POST | `/api/personalab/medios` | reserva de medio mas URL de subida firmada |
| POST | `/api/personalab/medios/{id}/confirmar` | cierra la subida, extrae metadatos |
| GET | `/api/personalab/medios/{id}` | 302 a URL firmada. `?descarga=1` para descarga |
| POST | `/api/personalab/corridas/{id}/aperturas` | abrir una bisagra manual |
| POST | `/api/personalab/corridas/{id}/version` | `mover_corrida_a_version` |

Convenciones: todas devuelven `{ error: string }` con codigo HTTP, nunca el mensaje crudo de Postgres. Es la deuda mas visible del admin actual (`NuevoItemForm.tsx:73` muestra `error.message` de Supabase en ingles a una coordinadora) y no se hereda.

---

# 11. La experiencia de autoria

## 11.1 Rutas

```
/prototipo/personalab/experiencias/[id]                       ficha (ya existe)
/prototipo/personalab/experiencias/[id]/editar                editor
/prototipo/personalab/experiencias/[id]/revisar               revision y publicacion
/prototipo/personalab/experiencias/[id]/vista/participante    vista previa, oscura
/prototipo/personalab/experiencias/[id]/vista/moderador       guion, papel, imprimible
/prototipo/personalab/experiencias/[id]/vista/equipo          todo, con las notas internas
```

## 11.2 El editor

Tres columnas sobre el chasis que ya existe (`personalab/layout.tsx` monta `WorkspaceNav` de 218 px mas un `main`).

**Barra superior del editor**, pegajosa:
- izquierda: nombre de la experiencia mas insignia "Version 3 · Borrador";
- centro: "Guardado hace 12 s", en `#6F7777`, que pasa a "Guardando" mientras hay peticiones en vuelo y a "Sin guardar" en rojo si falla;
- derecha: "Vista previa" (menu con las tres audiencias) y "Enviar a revision".

**Riel izquierdo (200 px)**: Portada, luego los tres tiempos con sus bisagras. Cada bisagra muestra su titulo, un contador de bloques y un punto terracota si `listo = false`. Arrastrar reordena dentro del tiempo. Al pie de cada tiempo, "+ Bisagra" con borde punteado (es el patron de `ChecklistClient.tsx:239`, el mejor gesto de alta del admin actual).

**Centro (medida maxima 720 px)**: los bloques de la bisagra seleccionada, en una sola columna.

Cada bloque es una tarjeta con:
- canaleta izquierda de 36 px con la manija de arrastre y un chip de audiencia (vacio si es participante, "MOD" en terracota si es moderador, "4M" en teal si es equipo);
- el contenido editable en vivo, con el aspecto aproximado de como se vera publicado;
- al pasar el cursor, una linea con un "+" arriba y otra abajo para insertar en ese punto;
- al pasar el cursor, a la derecha: duplicar y borrar.

Insertar abre el menu de cuatro grupos de la seccion 3.3. Bloque nuevo hereda la audiencia del bloque anterior, salvo `nota`, que siempre nace en `moderador`.

**Inspector derecho (280 px)**, solo cuando hay un bloque seleccionado:
- selector de audiencia (tres opciones segmentadas, con los rotulos de la seccion 5.1);
- campos propios del tipo;
- para medios: el subidor, con nombre, peso y estado;
- al pie, en tenue: tipo del bloque y fecha de ultima edicion.

**Teclado**:

| Tecla | Efecto |
|---|---|
| Enter al final de un `texto` | crea un `texto` nuevo debajo y mueve el foco |
| Backspace en un bloque vacio | lo borra y enfoca el final del anterior |
| `/` al inicio de un bloque vacio | abre el menu de insertar |
| Cmd/Ctrl + S | fuerza el guardado y muestra el toast |
| Cmd/Ctrl + Enter | vista previa |

## 11.3 El lector del participante

Es lo que el usuario pidio con "que se publique con diseño".

| Token | Valor | Origen |
|---|---|---|
| Lienzo | `#071216` | teal `#002B34` de `BRAND.md:55` llevado a fondo profundo |
| Superficie de lectura | `#0E1F25` | teal elevado, hermano de `--teal-2 #0A3B45` |
| Filete | `rgba(255,255,255,.11)` | mismo valor que `WorkspaceNav.tsx:47` |
| Texto | `#F2EFE9` | `WorkspaceNav.tsx:61` |
| Secundario | `#A8C3C8` | `WorkspaceNav.tsx:101` |
| Terciario | `#8FB0B6` | `WorkspaceNav.tsx:68` |
| Acento | `#B9735A` | terracota de `BRAND.md:57` |
| Acento sobre oscuro | `#CFA48F` | `--terra-2` de `BRAND.md:67` |

Reglas de lectura, que corrigen a proposito lo que el portal actual hace mal:

1. **Medida de linea 640 px**, no 512. El participante actual lee a `max-w-lg`.
2. **Cuerpo a 17 px con interlineado 1.75.** Hoy nada del portal del participante pasa de `text-sm` (14 px), ni siquiera en textos largos.
3. **Ningun texto por debajo de 14 px dentro de la columna de lectura.**
4. **Ritmo vertical por token**: 8 px dentro de un parrafo, 24 px entre bloques, 48 px antes de un `titulo` nivel 2, 96 px entre bisagras.
5. **Foco de teclado visible**: contorno de 2 px en `#CFA48F` con 2 px de separacion, en todo elemento enfocable. El portal actual usa `focus:outline-none` sin reemplazo.
6. **Titulos en peso 200 a 300 y escala grande**, nunca negritas pesadas (`BRAND.md:97-98`).
7. **Imagen `ancho`** rompe hasta 900 px y vuelve a la columna. Con pie debajo en `#8FB0B6`.
8. **PDF en `lectura`** se incrusta con altura de 80vh y un enlace "Abrir a pantalla completa". Sin boton de descarga.
9. **Sello de disponibilidad legible**: `#8FB0B6` sobre `#0E1F25`, nunca `white/20`.

## 11.4 El guion del moderador

Papel claro, y **imprimible**. La razon es de dominio: en la ignicion el software es mudo (`dominio.ts:29`), el moderador esta en la sala y necesita papel.

| Token | Valor | Origen |
|---|---|---|
| Papel | `#FAF8F4` | `--paper` de `BRAND.md:68` |
| Filete | `#E5DED4` | `ui.tsx:49`, el borde de `Panel` |
| Tinta | `#14181B` | `--ink` de `BRAND.md:58` |
| Titulos | `#002B34` | teal |
| Nota interna | fondo `rgba(185,115,90,.07)`, borde `rgba(185,115,90,.26)`, rotulo `#8F5341` | es exactamente el bloque de nota de diseño de `experiencias/[id]/page.tsx:132-145` |

Añadidos propios del guion:
- la duracion de la bisagra en cabecera, alineada a la derecha;
- el bloque `requiere` de la bisagra en una caja al inicio;
- los `kit_ref` con casilla de verificacion para tachar al preparar la sala;
- `@media print`: fondo blanco, sin navegacion, sin colores de fondo, salto de pagina antes de cada bisagra (`break-before: page`), URL de los enlaces impresa entre parentesis.

---

# 12. Representacion en el prototipo de TypeScript

El prototipo no toca Supabase y esta fuera del gate de sesion a proposito (`portal/middleware.ts:14`). Todo lo de abajo vive en `portal/app/prototipo/personalab/`.

## 12.1 Archivos nuevos

```
contenido.ts          tipos, catalogo de tipos de bloque y datos sembrados
almacen.ts            store de cliente con useSyncExternalStore + localStorage
lexico.ts             mapa TS <-> SQL, en un solo lugar
render/
  DocRicoVista.tsx    renderiza DocRico a JSX, sin HTML crudo
  BloqueVista.tsx     switch de 13 tipos, con prop `tema: 'oscuro' | 'papel'`
  Lector.tsx          lector del participante
  Guion.tsx           guion del moderador, imprimible
editor/
  EditorExperiencia.tsx   shell de tres columnas
  RailTiempos.tsx         riel izquierdo
  ListaBloques.tsx        columna central
  TarjetaBloque.tsx       una tarjeta editable
  MenuInsertar.tsx        menu de cuatro grupos
  Inspector.tsx           panel derecho
  SelectorAudiencia.tsx   los tres botones segmentados
  CampoRico.tsx           editor de DocRico
  SubidaSimulada.tsx      subida falsa de archivos
  BarraEditor.tsx         barra superior con "Guardado hace X"
revision/
  Compuertas.tsx      lista de bloqueos y avisos
  QueVeCadaQuien.tsx  las tres columnas de audiencia
  Diff.tsx            comparacion contra lo publicado
experiencias/[id]/editar/page.tsx
experiencias/[id]/revisar/page.tsx
experiencias/[id]/vista/[audiencia]/page.tsx
```

Estilo: **100% inline**, igual que todo el prototipo (`ui.tsx`, `WorkspaceNav.tsx`, `experiencias/[id]/page.tsx`). No se introduce Tailwind aqui.

## 12.2 Tipos

```ts
// contenido.ts

export type Audiencia = 'participante' | 'moderador' | 'equipo'
export type TipoBloque =
  | 'titulo' | 'texto' | 'cita' | 'destacado' | 'nota'
  | 'imagen' | 'video' | 'audio' | 'archivo'
  | 'separador' | 'llamado' | 'consigna' | 'kit_ref'

export type EstadoVersion = 'borrador' | 'en_revision' | 'publicada' | 'retirada'
export type Apertura      = 'inmediata' | 'programada' | 'manual'

export const NIVEL_AUDIENCIA: Record<Audiencia, 1 | 2 | 3> = {
  participante: 1, moderador: 2, equipo: 3,
}

// ── Texto rico ──────────────────────────────────────────────────
export type Marca = 'enfasis' | 'fuerte' | 'enlace'
export interface Span { texto: string; marcas?: Marca[]; href?: string }
export type Nodo =
  | { tipo: 'parrafo'; hijos: Span[] }
  | { tipo: 'lista'; estilo: 'punto' | 'numero'; items: Span[][] }
export interface DocRico { v: 1; nodos: Nodo[] }

// ── Contenido por tipo ──────────────────────────────────────────
export interface ContenidoTitulo    { texto: string; nivel: 2 | 3 }
export interface ContenidoTexto     { doc: DocRico }
export interface ContenidoCita      { doc: DocRico; autor?: string; fuente?: string }
export interface ContenidoCallout   { tono: 'neutro' | 'aviso' | 'cuidado'; titulo?: string; doc: DocRico }
export interface ContenidoImagen    { alt: string; pie?: string; encuadre: 'ancho' | 'columna'; foco?: { x: number; y: number } }
export interface ContenidoVideo     {
  fuente: 'subido' | 'externo'
  proveedor?: 'vimeo' | 'youtube' | 'mux'
  idExterno?: string
  titulo: string
  duracionSeg?: number
  transcripcion?: string
}
export interface ContenidoAudio     { titulo: string; duracionSeg?: number; transcripcion?: string }
export interface ContenidoArchivo   { nombre: string; modo: 'descarga' | 'lectura'; descripcion?: string; paginas?: number }
export interface ContenidoSeparador { estilo: 'linea' | 'aire' | 'ornamento' }
export interface ContenidoLlamado   {
  etiqueta: string
  destinoTipo: 'ruta' | 'externo' | 'bisagra' | 'correo'
  destino: string
  apoyo?: string
}
export interface ContenidoConsigna  { doc: DocRico; soporte: 'a_mano' | 'en_sala' | 'en_pantalla'; tiempoSugerido?: string }
export interface ContenidoKitRef    { nota?: string }

// Union discriminada: el compilador impide un video con campos de archivo.
export type Bloque =
  | BaseBloque & { tipo: 'titulo';     contenido: ContenidoTitulo }
  | BaseBloque & { tipo: 'texto';      contenido: ContenidoTexto }
  | BaseBloque & { tipo: 'cita';       contenido: ContenidoCita }
  | BaseBloque & { tipo: 'destacado';  contenido: ContenidoCallout }
  | BaseBloque & { tipo: 'nota';       contenido: ContenidoCallout; audiencia: 'moderador' | 'equipo' }
  | BaseBloque & { tipo: 'imagen';     contenido: ContenidoImagen;  medioId: string }
  | BaseBloque & { tipo: 'video';      contenido: ContenidoVideo;   medioId?: string; posterMedioId?: string }
  | BaseBloque & { tipo: 'audio';      contenido: ContenidoAudio;   medioId: string }
  | BaseBloque & { tipo: 'archivo';    contenido: ContenidoArchivo; medioId: string }
  | BaseBloque & { tipo: 'separador';  contenido: ContenidoSeparador }
  | BaseBloque & { tipo: 'llamado';    contenido: ContenidoLlamado }
  | BaseBloque & { tipo: 'consigna';   contenido: ContenidoConsigna }
  | BaseBloque & { tipo: 'kit_ref';    contenido: ContenidoKitRef;  piezaKitId: string }

export interface BaseBloque {
  id: string
  raizId: string
  versionId: string
  bisagraId: string | null     // null = portada
  orden: number
  audiencia: Audiencia
  rev: number
  actualizadoAt: string
}

// ── Medios ──────────────────────────────────────────────────────
export interface Medio {
  id: string
  experienciaId: string
  clase: 'imagen' | 'documento' | 'video' | 'audio'
  mime: string
  bytes: number
  nombreOriginal: string
  estado: 'pendiente' | 'listo' | 'fallido'
  ancho?: number; alto?: number; duracionSeg?: number; paginas?: number
  url: string              // en el prototipo: /ejemplos/... o un blob: efimero
  subidoAt: string
}

// ── Version ─────────────────────────────────────────────────────
export interface VersionExperiencia {
  id: string
  experienciaId: string
  numero: number
  estado: EstadoVersion
  notaVersion?: string
  notaRevision?: string
  revisadoVisibilidad: boolean
  origenVersionId?: string
  guardadoAt?: string
  publicadaAt?: string
  publicadaPor?: string
  retiradaAt?: string
}

// Bisagra: la del dominio existente mas los tres campos nuevos.
export interface BisagraV extends Omit<Bisagra, 'id'> {
  id: string
  raizId: string
  versionId: string
  apertura: Apertura
  offsetDias?: number
  ocultaAntes: boolean
}
```

## 12.3 Catalogo de tipos, en dato

Un solo objeto manda sobre el menu de insertar, los iconos, los valores por omision y la validacion del prototipo. Evita la deuda que ya tiene el admin actual: cinco mapas de insignias duplicados en cinco archivos.

```ts
export interface DefTipo {
  tipo: TipoBloque
  etiqueta: string
  grupo: 'escritura' | 'medios' | 'estructura' | 'equipo'
  ayuda: string
  audienciaPorOmision: Audiencia
  audienciasPermitidas: Audiencia[]
  exigeMedio: boolean
  nuevo: () => unknown       // contenido inicial
}

export const CATALOGO: Record<TipoBloque, DefTipo> = { /* 13 entradas */ }
export const GRUPOS: { id: DefTipo['grupo']; titulo: string }[] = [
  { id: 'escritura',  titulo: 'Escritura' },
  { id: 'medios',     titulo: 'Medios' },
  { id: 'estructura', titulo: 'Estructura' },
  { id: 'equipo',     titulo: 'Solo equipo' },
]
```

## 12.4 El store

```ts
// almacen.ts
'use client'

const CLAVE = 'personalab_borrador_v1'

interface Estado {
  versiones: Record<string, VersionExperiencia>
  bisagras:  Record<string, BisagraV>
  bloques:   Record<string, Bloque>
  medios:    Record<string, Medio>
  piezasKit: Record<string, PiezaKitV>
  guardando: number          // peticiones simuladas en vuelo
  ultimoGuardado?: string
}

export function useAlmacen<T>(sel: (e: Estado) => T): T   // useSyncExternalStore

export const acciones = {
  insertarBloque(bisagraId: string | null, tipo: TipoBloque, antes?: string, despues?: string): string
  actualizarBloque(id: string, parche: Partial<Bloque>): void   // debounce 800 ms
  moverBloque(id: string, antes?: string, despues?: string): void
  borrarBloque(id: string): void
  duplicarBloque(id: string): string
  insertarBisagra(versionId: string, tiempo: Tiempo, orden: number): string
  actualizarBisagra(id: string, parche: Partial<BisagraV>): void
  abrirBorrador(experienciaId: string): string
  enviarARevision(versionId: string): void
  publicar(versionId: string): { ok: boolean; bloqueos: Compuerta[] }
  devolver(versionId: string, nota: string): void
  registrarMedioSimulado(f: File, experienciaId: string): string
  reiniciar(): void          // vuelve a la semilla, para demos
}

export function compuertas(versionId: string): Compuerta[]   // mismo contrato que puede_publicar
export function diff(a: string, b: string): CambioDiff[]     // por raizId
```

Detalles que importan:

- Punto medio: `orden = (antes + despues) / 2`, con `antes = 0` y `despues = max + 1` en los extremos. Igual que el servidor.
- Autoguardado simulado: `actualizarBloque` escribe de inmediato en memoria, sube `guardando` y a los 400 ms lo baja y sella `ultimoGuardado`. Asi la barra "Guardado hace X" se comporta igual que con red.
- Hidratacion: la lectura de `localStorage` va SOLO dentro de `useEffect`, nunca en el inicializador de `useState`. Es el defecto exacto de `OperacionClient.tsx:512-518`, donde el autor tuvo que parchear el desajuste de servidor y cliente con un efecto justo debajo. No se hereda.
- Botones de demo en la barra del editor: "Reiniciar prototipo" y "Volver a la semilla".

## 12.5 Subida simulada

`SubidaSimulada.tsx` acepta un `File`, lee `name`, `size` y `type`, valida contra los limites de la seccion 8.2, crea `URL.createObjectURL(file)` y registra un `Medio` con `estado: 'listo'`. Sobre el control, un aviso permanente:

> Prototipo: el archivo no se sube a ningun lado y se pierde al recargar.

La semilla trae medios de ejemplo apuntando a `public/ejemplos/` para que el lector se vea lleno sin depender de que alguien suba nada.

## 12.6 Mapa TS a SQL

En `lexico.ts`, en un solo lugar, porque el prototipo usa camelCase y el esquema snake_case.

| TypeScript | SQL |
|---|---|
| `experienciaId` | `experiencias.id` |
| `abreEspacioAlForo` | `experiencias.abre_espacio_al_foro` |
| `versionId` | `versiones_experiencia.id` |
| `raizId` | `raiz_id` |
| `bisagraId` | `bloques.bisagra_id` |
| `medioId` | `bloques.medio_id` |
| `posterMedioId` | `bloques.poster_medio_id` |
| `piezaKitId` | `bloques.pieza_kit_id` |
| `offsetDias` | `bisagras.offset_dias` |
| `ocultaAntes` | `bisagras.oculta_antes` |
| `duracionSeg` | `contenido->>'duracion_seg'` |
| `idExterno` | `contenido->>'id_externo'` |
| `destinoTipo` | `contenido->>'destino_tipo'` |
| `tiempoSugerido` | `contenido->>'tiempo_sugerido'` |
| `porPersona` | `piezas_kit.por_persona` |
| `personasEnElForo` | `corridas.personas_en_el_foro` |
| `mesDeRetorno` | `corridas.mes_de_retorno` |

Dentro del `contenido` jsonb las claves van en snake_case, para que el `jsonb` guardado sea identico en prototipo y en produccion. El adaptador convierte solo en el borde.

## 12.7 Refactor del prototipo actual, con los archivos exactos

Hoy `Experiencia.bisagras` y `Experiencia.kit` son arreglos literales dentro de `dominio.ts:92-93`. Con el modelo versionado, esos datos pasan a colgar de una version.

**Plan de minima ruptura**: mover los literales a `contenido.ts` como filas por version, y en `dominio.ts` construir `EXPERIENCIAS` programaticamente, de modo que `e.bisagras` y `e.kit` sigan existiendo como **proyeccion de la version publicada**.

```ts
// dominio.ts, sustituyendo los literales
import { VERSIONES, BISAGRAS, PIEZAS_KIT } from './contenido'

function proyectar(exp: ExperienciaBase): Experiencia {
  const pub = VERSIONES.find(v => v.experienciaId === exp.id && v.estado === 'publicada')
  return {
    ...exp,
    versionPublicadaId: pub?.id,
    bisagras: pub ? BISAGRAS.filter(b => b.versionId === pub.id).sort((a, b) => a.orden - b.orden) : [],
    kit:      pub ? PIEZAS_KIT.filter(p => p.versionId === pub.id) : [],
  }
}

export const EXPERIENCIAS: Experiencia[] = BASE.map(proyectar)
```

**Archivos que tienen que seguir compilando sin cambios**, verificados por `grep` de `.bisagras` y `.kit`:

| Archivo | Lineas |
|---|---|
| `app/prototipo/personalab/page.tsx` | 17, 93, 102, 133, 153, 155 |
| `app/prototipo/personalab/experiencias/page.tsx` | 27, 45, 49, 50, 51 |
| `app/prototipo/personalab/experiencias/[id]/page.tsx` | 151, 158, 200, 205 |
| `app/prototipo/personalab/corridas/[id]/page.tsx` | 33, 34 |
| `app/prototipo/personalab/kit/page.tsx` | 8 |

`app/prototipo/experiencia/[id]/page.tsx:73, 74, 116` usa `bloque.bisagras` de `app/prototipo/data.ts`, que es el prototipo del paraguas 4 Meaning, un archivo distinto. **No se toca.**

## 12.8 Extensiones a `ui.tsx`

Hoy `ui.tsx` exporta `Badge`, `Titulo`, `Panel`, `Etiqueta`, `Cifra`, `Vacio`, `th` y `td` (139 lineas). Se le añade, en el mismo estilo inline:

| Primitiva | Para que |
|---|---|
| `Boton` | variantes `primario` (relleno teal `#002B34`), `secundario` (contorno `#E5DED4`), `fantasma`, `peligro` (texto y contorno `#8F5341`) |
| `Campo` | rotulo mas control mas texto de ayuda, con `id` y `htmlFor` reales |
| `Segmentado` | el selector de audiencia y el de vista previa |
| `Chip` | el marcador de audiencia en la canaleta del bloque |
| `Menu` | popover de insertar, con cierre por Escape y por clic fuera |
| `Dialogo` | confirmacion destructiva. Con `role="dialog"`, `aria-modal`, cierre por Escape, trampa de foco y bloqueo del scroll del cuerpo |
| `Aviso` | banda de compuerta, con severidad bloqueo o aviso |
| `Foco` | mixin de estilo de foco visible, para no repetirlo |

Dos deudas del admin actual que **no se heredan** y que estas primitivas cierran de raiz:

1. **Ningun input del admin tiene `id` ni ningun label tiene `htmlFor`**. `Campo` los genera con `useId()`.
2. **Las confirmaciones destructivas usan `confirm()` nativo** (`ChecklistClient.tsx:118`, `DeleteItemButton.tsx:17`). Aqui borrar un bloque de una experiencia licenciada es destructivo de verdad y usa `Dialogo`.

---

# 13. Lo que NO se modela, y por que

| Fuera de alcance | Razon |
|---|---|
| Estado de lectura del participante | Lexico vinculante. Es `progress` con otro nombre. Coste asumido: no hay "continuar donde ibas" |
| Captura de texto del participante | La metodologia escribe a mano y no transcribe (`dominio.ts:156, 177`). El bloque `consigna` plantea, no captura. Se reserva `soporte = 'en_pantalla'` para cuando una bisagra lo pida |
| Historial por bloque | Justificado en 7.6 |
| Autoria por el moderador | Ningun requisito lo pide y abre la puerta a que el diseño licenciado se modifique en el capitulo. Si aparece, sera un objeto propio (`aviso de corrida`), no bloques |
| Traducciones | El catalogo corre en español. Si llega, entra como `bloques_traduccion (bloque_raiz_id, idioma, contenido)` sin tocar nada de lo de arriba |
| Bloques anidados, columnas, acordeones | Rompen la lectura en una sola columna y el editor pasa a ser un arbol |
| Marca de agua o DRM en PDF | `inline` no protege. Si hace falta proteger de verdad, es un proyecto propio |
| Inventario de objetos por capitulo | `piezas_kit.disponible` significa "la pieza esta definida", no "hay existencias". El inventario ya aparece como pendiente en el propio catalogo (`dominio.ts:162`) |
| Programacion de avisos por correo | Existe `resend` en `package.json` pero ninguna bisagra lo requiere todavia |

---

# 14. Plan de implementacion

| Fase | Entrega | Depende de |
|---|---|---|
| 1 | `contenido.ts`, `lexico.ts`, `almacen.ts`, semilla derivada de `dominio.ts`, refactor de proyeccion de 12.7 | nada |
| 2 | `render/` completo mas las tres vistas previas. Con esto ya se ve "publicado con diseño" | fase 1 |
| 3 | `editor/` completo con autoguardado simulado. Aqui el usuario ya puede construir una experiencia entera | fases 1 y 2 |
| 4 | `revision/` con compuertas, "que ve cada quien" y diff | fase 3 |
| 5 | Migracion SQL `010_personalab_contenido.sql` con secciones 9.1 a 9.8 | acuerdo sobre la fase 4 |
| 6 | Buckets, rutas de medios, subida directa firmada | fase 5 |
| 7 | Sustituir el almacen simulado por Supabase. Los tipos no cambian; solo se cambia el adaptador | fases 5 y 6 |
| 8 | Reanudable TUS para video grande | fase 7 |

El punto de corte real es el final de la fase 4: ahi el usuario puede construir una experiencia completa, verla en las tres audiencias y publicarla, todo con datos simulados y sin haber tocado la base. Si algo del modelo esta mal, se descubre ahi y corregir cuesta una tarde en vez de una migracion.

---

## Tercera versión de la pantalla de autoría de PersonaLab, escrita con la fidelidad visual como requisito y no como estilo

- **Eliminar la barra lateral y adoptar el chasis horizontal de Trascendencia: barra fija de 56px con las pastillas de AdminTopNav.tsx:25-33, sub-nav pegajosa de 48px con el patrón de EventSubNav.tsx:41-97, main con pt-14 bg-slate-50 min-h-screen. Cromo total 104px, exactamente el de una página de evento.**: Es el cambio que responde al reclamo del usuario. Mientras PersonaLab tenga una columna oscura a la izquierda no se va a parecer a Trascendencia por mucho que se ajusten los grises de adentro: la silueta manda. Verifiqué con grep que portal/components/AdminNav.tsx solo aparece en su propia definición (líneas 9 y 31) y en el documento de sistema visual, ningún archivo de app/ lo importa. El chasis vivo es portal/app/(admin)/layout.tsx:22-31, que monta AdminTopNav y un main, nada más. Además libera 240px, que es lo que permite tener riel de 264, lienzo de 656 y teléfono de 400 a la vez en 1440px.
- **Todo campo editable usa el input canónico con borde de EditarEventoForm.tsx:51. Se elimina el CAMPO_FANTASMA que introducía la versión 2.**: Trascendencia tiene un solo tratamiento de input y siempre lleva su caja. Un input sin borde que se revela en hover es el idioma de Notion. El lienzo de autoría debe leerse como un panel operativo denso, que es lo que es EditarEventoForm.tsx:142-143, el formulario más largo del admin: cinco tarjetas blancas tituladas apiladas con space-y-5, cada una con campos con borde y etiquetas en versalitas.
- **Layout de dos regiones: riel de índice de 264px más lienzo, con las propiedades del bloque dentro del propio bloque abierto. El panel de vista previa aparece como tercera columna de 400px solo cuando se enciende.**: El patrón nativo de Trascendencia para ver el detalle de una fila sin salir de la lista es el acordeón de ItinerarioList.tsx:107-153, y su unidad de captura es la tarjeta titulada con campos de EditarEventoForm.tsx:142-143. Un bloque abierto es exactamente eso, así que no hace falta inventar un inspector. Una experiencia tiene tres tiempos y hasta diez bisagras (dominio.ts:143-154), así que sin índice el autor se pierde en el scroll.
- **La sección Editor recibe tratamiento de botón sólido bg-slate-900 dentro del sub-nav de la experiencia, y el resto de secciones son pastillas normales.**: Es el gesto exacto que Trascendencia le da a Operación en EventSubNav.tsx:79-83: el único item de navegación del portal con jerarquía visual propia, porque es el modo que importa. En un retiro ese modo es la operación en vivo. En PersonaLab ese modo es escribir.
- **Editor de texto en markdown restringido a diez capacidades: párrafo, salto duro, negrita, itálica, H2, H3, lista, lista numerada, cita y enlace. Renderer propio de unas cuarenta líneas que devuelve nodos de React, nunca dangerouslySetInnerHTML.**: Hoy todo el texto largo del participante es un string plano renderizado con whitespace-pre-wrap (info/page.tsx:152, programa/page.tsx:252, avisos/page.tsx:80). No hay HTML almacenado en ninguna tabla. Markdown restringido es el salto más pequeño que agrega estructura sin cambiar el tipo de la columna ni abrir superficie de inyección. El mismo componente sirve al modo Leer del editor con tono claro y a la vista previa con tono oscuro, lo que evita repetir el renderizado como pasa hoy con el contenido de acuerdos, implementado dos veces con divergencias silenciosas entre acuerdos/[id]/page.tsx:67-94 y firmar/[token]/page.tsx:152-172.
- **Eliminar con confirmación en línea de tres pasos dentro de la propia fila: icono en reposo, pregunta con botón rojo sólido y No, y luego pastilla Eliminado con botón Deshacer durante 10 segundos.**: Combina la mecánica de dos pasos que ya existe en EventStatusButton.tsx:39-57 y DeleteBlockButton.tsx:21-39 con el mejor patrón de feedback del admin, el de CheckInButton.tsx:65-91, donde el control se transforma en su estado final en vez de mostrar un mensaje. Los textos de la pregunta escalan según lo que se pierde: un bloque vacío se borra directo, una bisagra publicada avisa que los moderadores dejarán de verla.
- **Guardado doble: autoguardado a los 1200 ms de inactividad más botón explícito siempre visible y siempre pulsable, con chip de cuatro estados en el sub-nav y banner rojo persistente en el lienzo cuando falla. Los autoguardados no lanzan toast.**: El usuario pidió guardar el progreso con nombre propio, así que tiene que ser visible y pulsable. Un botón de guardar deshabilitado produce dudas, por eso guarda igual sin cambios y responde Todo guardado. El toast se reserva al guardado manual porque ToastProvider.tsx:35 no tiene cola ni tope y un toast por autoguardado apilaría tarjetas hasta salirse de la pantalla. El banner es persistente porque el toast se va solo a los 3000 ms y un error de guardado no puede desaparecer solo.
- **La publicación pasa por una ruta de revisión con tres bloques: barra de métricas de lo que recibe el participante, bloqueos que impiden publicar en franja roja, y advertencias que no impiden en franja ámbar. Confirmación de dos pasos al final con campo opcional de nota de versión.**: Distinguir bloqueo de advertencia es lo que evita que el autor publique una experiencia rota y a la vez que se sienta bloqueado por una opinión. Los bloqueos son objetivos: sin nombre, sin ignición, con archivos fallidos, con bloques de texto vacíos. Las advertencias son de dominio: la víspera vacía, un video que parece de formación cuando dominio.ts:64-66 dice que la pieza humana no se transmite por video. La barra de métricas usa el truco de hairlines por gap de eventos/[id]/page.tsx:156-167, la mejor pieza técnica del chasis.
- **Vista previa como marco de teléfono de 375px dentro del editor, con selector de dos lentes: Como participante y Como moderador, más una ruta a pantalla completa para ventanas menores a 1280px.**: Reutiliza el marco que ya existe en eventos/[id]/preview/page.tsx:264-317, con su barra de estado, su muesca y su nav inferior simulada. Las dos lentes responden la pregunta que el autor no puede contestar de otra forma: qué queda del lado de allá cuando un bloque es solo para el moderador. El chip Vista previa dentro del teléfono no es decoración, sin él una captura del panel es indistinguible de producción.
- **La barra superior lleva cinco destinos: Experiencias, Corridas, Capítulos, Moderadores, Retorno. Kit baja a ser sección de la experiencia.**: Cinco pastillas de px-3 py-2 text-sm ocupan unos 480px y caben junto al wordmark y al bloque de identidad en una ventana de 1280px. Kit ya es propiedad de la experiencia en el modelo (dominio.ts:93), así que bajarlo de nivel es corregir el modelado, no una concesión. Retorno se queda arriba porque cruza corridas.

# La pantalla de autoría de PersonaLab

Tercera versión. El usuario vio dos y dijo lo mismo las dos veces: que se parezca más a Trascendencia. Esta versión trata la fidelidad visual como requisito, no como estilo.

Léxico: experiencia, tiempo (víspera, ignición, retorno), bisagra, bloque, participante, moderador, autor, capítulo, foro, grant. Sin guion largo en ningún copy visible.

---

## 0. Lo que cambia respecto de la versión anterior, y por qué

Tres cosas del prototipo actual y de la versión 2 de la especificación son las que producen la sensación de "esto no es Trascendencia". Se corrigen aquí.

### 0.1 Se elimina la barra lateral

Es el cambio más importante de esta versión.

El prototipo monta hoy un `aside` de 218px en teal `#002B34` (`portal/app/prototipo/personalab/WorkspaceNav.tsx:37-45`) y la versión 2 de la especificación proponía reactivar `portal/components/AdminNav.tsx:53`, un `aside w-[240px]` oscuro, repintado a slate.

Trascendencia no tiene barra lateral. Verificado con grep en este repositorio: `AdminNav` solo aparece en su propia definición (`components/AdminNav.tsx:9` y `:31`) y en el documento de sistema visual. Ningún archivo de `app/` lo importa. El chasis vivo es horizontal y son once líneas:

```tsx
// portal/app/(admin)/layout.tsx:22-31
<>
  <AdminTopNav userEmail={user.email ?? ''} />
  <ToastProvider>
    <main className="pt-14 bg-slate-50 min-h-screen">
      {children}
    </main>
  </ToastProvider>
</>
```

Mientras PersonaLab tenga una columna oscura a la izquierda, no se va a parecer a Trascendencia por mucho que se ajusten los grises de adentro. La silueta manda. Se adopta el chasis horizontal literal: barra fija de 56px, sub-nav pegajosa de 48px, lienzo `bg-slate-50`, `pt-14`.

Costo asumido: se pierde la agrupación Catálogo, Operación, Después de `WorkspaceNav.tsx:10-31`. Se compensa bajando dos destinos al nivel donde de verdad viven: Kit pasa a ser sección de la experiencia (ya lo es en el modelo, `dominio.ts:93`) y Retorno se queda arriba porque cruza corridas. Quedan cinco pastillas en la barra superior, que es el mismo orden de magnitud que las dos de `AdminTopNav.tsx:43-50`.

### 0.2 Se eliminan los campos fantasma

La versión 2 introducía `CAMPO_FANTASMA`, un input sin borde que se revela en hover. Es el idioma de Notion, no el de Trascendencia. Trascendencia tiene un solo input y siempre lleva su caja:

```
w-full px-3 py-2 border border-slate-200 rounded-lg text-sm
focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white
```

`portal/app/(admin)/eventos/[id]/editar/EditarEventoForm.tsx:51`. Aquí todo campo editable usa esa clase. El lienzo de autoría es una pila de tarjetas tituladas con campos con borde, que es exactamente lo que es `EditarEventoForm.tsx:142-143`, el formulario más largo del admin.

Consecuencia visual buscada: el editor se ve como un panel operativo denso, no como un documento en blanco.

### 0.3 Se elimina todo hexadecimal suelto del lado autor

El prototipo escribe `#E5DED4`, `#8F5341`, `#002B34`, `#6F7777` en estilos en línea (`portal/app/prototipo/personalab/ui.tsx:48, 66, 83, 89`). Ninguno de esos colores existe en Trascendencia. Fuera. Del lado del autor solo hay escala slate más los cinco acentos de badge que ya usa el admin. Los hexadecimales del participante (`#0C0C0C`, `#1A1A1A`, `#F5F0E8`, `#C9A96E`, `#B0A898`) solo aparecen dentro del marco de teléfono de la vista previa, porque ahí sí son el sistema correcto.

---

## 1. Principio rector

Trascendencia es un panel operativo sobrio y denso: superficies blancas `rounded-xl` con `shadow-sm` sobre `bg-slate-50`, una escala tipográfica de dos tamaños donde `text-xs` y `text-sm` cubren casi todo, un solo negro para lo primario y color únicamente dentro de badges. La autoría de PersonaLab se construye dentro de ese vocabulario sin agregar una familia tipográfica, un radio ni un acento.

Tres deudas del admin se corrigen en vez de imitarse:

1. La página de detalle de evento no tiene título. `portal/app/(admin)/eventos/[id]/page.tsx:127` arranca con una línea de metadatos en `text-slate-400` y el nombre del evento solo vive truncado a 180px en el sub-nav. Aquí el nombre de la experiencia es un elemento identificable y no se pierde.
2. El admin tiene cuatro disciplinas de contenedor conviviendo: `max-w-2xl mx-auto` en dashboard, `max-w-4xl` sin centrar en usuarios, `max-w-7xl` sin centrar en detalle de evento, sin límite en el kanban. Aquí hay una sola: `max-w-7xl mx-auto`.
3. El admin tiene cinco mapas de badge duplicados y desalineados (`EventSubNav.tsx:12-18`, `eventos/[id]/page.tsx:6, 28, 45, 115`). Aquí hay un módulo `tokens.ts` que se importa.

---

## 2. Rutas y archivos

```
portal/app/prototipo/personalab/
  tokens.ts                              ← clases compartidas, único lugar
  PersonaLabTopNav.tsx                   ← barra fija 56px, gemela de AdminTopNav
  layout.tsx                             ← pt-14 bg-slate-50 min-h-screen
  lector/
    TarjetaLectura.tsx                   ← tarjeta del participante, tono oscuro
    RenderMarkdown.tsx                   ← un solo renderer, dos mapas de clase
    markdown.ts
  experiencias/[id]/
    ExperienciaSubNav.tsx                ← sticky top-14, 48px
    page.tsx                             ← Ficha
    editor/
      page.tsx
      EditorClient.tsx                   ← estado, autoguardado, atajos
      RielIndice.tsx
      TarjetaBisagra.tsx
      SelectorTipoBloque.tsx
      BloqueTexto.tsx
      BloqueDocumento.tsx
      BloqueVideo.tsx
      BloqueImagen.tsx
      BloqueAviso.tsx
      BloqueEscritura.tsx
      AjustesBloque.tsx
      EstadoGuardado.tsx
      PanelVistaPrevia.tsx
      ConfirmacionEnLinea.tsx
    kit/page.tsx
    accesos/page.tsx
    historial/page.tsx
    vista-previa/page.tsx
    publicar/page.tsx
```

Adición obligatoria a `portal/app/globals.css`, que hoy tiene once líneas y ningún plugin:

```css
.scrollbar-none { scrollbar-width: none; -ms-overflow-style: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
```

La clase `scrollbar-none` se usa en `EventSubNav.tsx:69` y `scrollbar-hide` en `programa/page.tsx:137`, y ninguna de las dos existe: no son utilidades de Tailwind 3.4.1 y `tailwind.config.ts:17` declara `plugins: []`. La barra de scroll nativa se ve por debajo del degradado que intentaba disimularla. Como el sub-nav de la experiencia depende de ese degradado, la regla se agrega.

---

## 3. tokens.ts

```ts
// portal/app/prototipo/personalab/tokens.ts
// Un solo lugar. Trascendencia tiene cinco mapas de badge duplicados
// (EventSubNav.tsx:12, eventos/[id]/page.tsx:6, 28, 45 y 115). Aquí no se repite.

// Superficies
export const SUPERFICIE       = 'bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden'
export const SUPERFICIE_PLANA = 'bg-white border border-slate-200 rounded-xl'
export const TARJETA_FORM     = 'bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm'
export const CABECERA_TARJETA = 'flex items-center justify-between px-4 py-3 border-b border-slate-100'
export const CABECERA_GRIS    = 'flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100'

// Botones
export const BTN_PRIMARIO   = 'px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
export const BTN_SECUNDARIO = 'px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60'
export const BTN_FILA       = 'text-xs text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium whitespace-nowrap disabled:opacity-60'
export const BTN_DASHED     = 'flex items-center justify-center gap-2 w-full text-sm text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 hover:border-slate-400 px-4 py-2.5 rounded-xl transition-colors'
export const BTN_ICONO      = 'w-7 h-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400'

// Campos
export const CAMPO            = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent'
export const AREA             = CAMPO + ' resize-y leading-relaxed'
export const ETIQUETA_CAMPO   = 'block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider'
export const ETIQUETA_SECCION = 'text-xs font-semibold text-slate-500 uppercase tracking-wider'
export const PISTA_CAMPO      = 'text-[11px] text-slate-400 mt-1'

// Badges. rounded-full dice estado, rounded-md dice taxonomía.
export const BADGE_ESTADO = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold'
export const BADGE_TIPO   = 'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold'

export const ESTADO_EXPERIENCIA = {
  borrador:  { etiqueta: 'Borrador',             cls: 'bg-slate-100 text-slate-600' },
  publicada: { etiqueta: 'Publicada',            cls: 'bg-emerald-100 text-emerald-700' },
  cambios:   { etiqueta: 'Cambios sin publicar', cls: 'bg-amber-100 text-amber-700' },
  retirada:  { etiqueta: 'Retirada',             cls: 'bg-red-100 text-red-700' },
} as const

export const TIPO_BLOQUE = {
  texto:     { etiqueta: 'Texto',     cls: 'bg-slate-100 text-slate-600' },
  cita:      { etiqueta: 'Cita',      cls: 'bg-violet-100 text-violet-700' },
  imagen:    { etiqueta: 'Imagen',    cls: 'bg-sky-100 text-sky-700' },
  documento: { etiqueta: 'Documento', cls: 'bg-amber-100 text-amber-700' },
  video:     { etiqueta: 'Video',     cls: 'bg-blue-100 text-blue-700' },
  aviso:     { etiqueta: 'Aviso',     cls: 'bg-red-100 text-red-700' },
  escritura: { etiqueta: 'Escritura', cls: 'bg-emerald-100 text-emerald-700' },
} as const

export const SOPORTE_BLOQUE = {
  sala:     { etiqueta: 'Sala',     cls: 'bg-violet-100 text-violet-700' },
  objeto:   { etiqueta: 'Objeto',   cls: 'bg-amber-100 text-amber-700' },
  pantalla: { etiqueta: 'Pantalla', cls: 'bg-blue-100 text-blue-700' },
} as const

export const AUDIENCIA = {
  participante: 'Participante',
  moderador:    'Moderador',
  ambos:        'Los dos',
} as const

export const TEXTO_GUARDANDO = 'Guardando…'   // U+2026, siempre este, nunca tres puntos
```

Tres correcciones de coherencia respecto del admin, deliberadas:

- El rojo de badge es `text-red-700`. El admin baja a `text-red-500` solo para Cancelado (`EventSubNav.tsx:17`), lo que le da menos contraste que a sus hermanos, que usan el tono 700.
- El negro primario es `bg-slate-900` con `hover:bg-slate-700`. El admin tiene dos negros: `bg-slate-900` en casi todo y `bg-[#111827]` con `hover:bg-slate-800` en `eventos/page.tsx:54` y `:74`, que es justo el botón más visible del portal. Aquí hay uno solo.
- El texto de carga es siempre `Guardando…`. El admin tiene cuatro variantes: `Guardando…`, `Guardando...`, `...` y `…`.

---

## 4. El chasis

### 4.1 Barra fija superior, 56px

Gemela de `portal/components/AdminTopNav.tsx:36-62`, con dos añadidos: la marca del workspace y el scroll horizontal de la nav, que el original no tiene.

```tsx
<header className="fixed top-0 left-0 right-0 w-full h-14 bg-white border-b border-[#E5E7EB] z-50 flex items-center justify-between px-6">
  {/* Izquierda: marca 4 Meaning y workspace */}
  <div className="flex items-center gap-2.5 flex-shrink-0">
    <Link href="/prototipo/organizador?u=d" className="flex items-center">
      <span className="text-sm font-semibold tracking-tight text-slate-900">4Meaning</span>
    </Link>
    <span className="text-slate-200">|</span>
    <span className="text-sm text-slate-500">PersonaLab</span>
  </div>

  {/* Centro: destinos del workspace */}
  <nav className="ml-8 flex gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-none">
    {[
      { href: '/prototipo/personalab/experiencias', label: 'Experiencias' },
      { href: '/prototipo/personalab/corridas',     label: 'Corridas' },
      { href: '/prototipo/personalab/capitulos',    label: 'Capítulos' },
      { href: '/prototipo/personalab/moderadores',  label: 'Moderadores' },
      { href: '/prototipo/personalab/retorno',      label: 'Retorno' },
    ].map(({ href, label }) => (
      <Link key={href} href={href} className={navLinkClass(href)}>{label}</Link>
    ))}
  </nav>

  {/* Derecha: identidad y salida */}
  <div className="flex items-center gap-4 flex-shrink-0">
    <span className="text-xs text-slate-400 hidden sm:block">lucia@4meaning.mx</span>
    <button className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none">
      Cerrar sesión
    </button>
  </div>
</header>
```

```tsx
const navLinkClass = (prefix: string) => {
  const activo = pathname === prefix || pathname.startsWith(prefix + '/')
  return [
    'px-3 py-2 text-sm rounded-md transition-colors whitespace-nowrap flex-shrink-0',
    activo
      ? 'text-slate-900 font-medium bg-slate-100'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
  ].join(' ')
}
```

Es `AdminTopNav.tsx:25-33` con una corrección: el hover del inactivo baja a `bg-slate-50`. En el original el hover del inactivo llega al mismo `bg-slate-100` que marca el activo, así que con el cursor encima los dos estados solo se distinguen por el peso de la fuente.

El borde `border-[#E5E7EB]` se conserva tal cual aunque sea gray-200 y no slate-200. Es el único punto del chasis vivo que usa la escala gray, y si PersonaLab lo cambia a slate-200 las dos barras no van a coincidir cuando estén una junto a la otra en una demostración. La coherencia entre productos gana sobre la coherencia interna.

### 4.2 Layout del workspace

```tsx
// portal/app/prototipo/personalab/layout.tsx
<>
  <PersonaLabTopNav />
  <ToastProvider>
    <main className="pt-14 bg-slate-50 min-h-screen">{children}</main>
  </ToastProvider>
</>
```

Idéntico a `portal/app/(admin)/layout.tsx:22-31`. Sin ancho máximo en este nivel: cada página decide el suyo, y todas deciden lo mismo.

### 4.3 Sub-nav de la experiencia, 48px

Traducción directa de `portal/app/(admin)/eventos/[id]/EventSubNav.tsx:41-97`. Cromo total: 56 más 48 igual a 104px, exactamente lo mismo que una página de evento en Trascendencia.

```tsx
<div className="sticky top-14 z-40 h-12 bg-white border-b border-slate-200 flex items-center px-6 gap-3 overflow-x-auto">
  <Link href="/prototipo/personalab/experiencias"
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap flex-shrink-0">
    ← Experiencias
  </Link>

  <span className="text-slate-200">|</span>

  <span className="text-sm font-semibold text-slate-900 truncate max-w-[220px] flex-shrink-0"
        title={experiencia.nombre}>
    {experiencia.nombre || 'Experiencia sin nombre'}
  </span>

  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${ESTADO_EXPERIENCIA[estado].cls}`}>
    {ESTADO_EXPERIENCIA[estado].etiqueta}
  </span>

  {/* Pista de secciones con degradado a la derecha */}
  <div className="relative flex-1 overflow-hidden">
    <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-10" />
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pr-8">
      {SECCIONES.map(({ href, label }) => {
        const esEditor = label === 'Editor'
        const activo = href === base ? pathname === href : pathname.startsWith(href)
        let cls = 'text-xs px-3 py-1.5 rounded-md whitespace-nowrap flex-shrink-0 transition-colors '
        if (esEditor) {
          cls += activo
            ? 'bg-slate-900 text-white hover:bg-slate-700'
            : 'border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white'
        } else {
          cls += activo
            ? 'text-slate-900 font-semibold bg-slate-100'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
        }
        return <Link key={label} href={href} className={cls}>{label}</Link>
      })}
    </div>
  </div>

  {/* Derecha fija: guardado, vista previa, publicar */}
  <div className="flex items-center gap-2 flex-shrink-0 pl-3 border-l border-slate-100">
    <EstadoGuardado />
    <button onClick={() => setVistaPrevia(v => !v)}
            title="Ver la experiencia como la va a ver el participante, sin publicar"
            className={`text-xs px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              vistaPrevia
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}>
      Vista previa
    </button>
    <Link href={`${base}/publicar`}
          title="Revisar y publicar. Los moderadores con acceso verán la versión nueva."
          className="text-xs font-medium px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-700 transition-colors whitespace-nowrap">
      Publicar
    </Link>
  </div>
</div>
```

Secciones: Ficha, Editor, Kit, Accesos, Historial.

Editor recibe tratamiento de botón sólido. Es exactamente el gesto que Trascendencia le da a Operación en `EventSubNav.tsx:79-83`: el único item de nav del portal con jerarquía visual propia, porque es el modo que importa. En PersonaLab el modo que importa es escribir.

Cada control lleva atributo `title` con una explicación en español. Es la única ayuda contextual que existe en el portal (`eventos/[id]/page.tsx:229, 235, 242-247`) y merece conservarse como convención.

---

## 5. El layout del editor

### 5.1 La decisión

| Opción | Veredicto |
|---|---|
| Tres paneles fijos: lista, lienzo, inspector | Descartada. El inspector es una cuarta región vertical que Trascendencia no tiene en ninguna pantalla, y obliga a mirar a otro lado para cambiar una propiedad del bloque que estás escribiendo. |
| Una sola columna con edición en sitio | Descartada. Una experiencia tiene tres tiempos y hasta diez bisagras (`dominio.ts:143-154`). Sin índice el autor se pierde en el scroll y no tiene forma de saltar. |
| Página de lista más página de edición por bloque | Descartada. Es lo que hace hoy el admin con Itinerario (`itinerario/nuevo/NuevoItemForm.tsx`), que obliga a navegar de ida y vuelta por cada campo. Rompe el flujo de escritura. |
| **Riel de índice más lienzo, propiedades dentro del bloque, panel de vista previa que sustituye al riel cuando se enciende** | **Elegida.** |

Justificación con precedente en el propio repositorio: el patrón nativo de Trascendencia para ver el detalle de una fila sin salir de la lista es el acordeón de `ItinerarioList.tsx:107-153`, y su unidad de captura es la tarjeta titulada con campos de `EditarEventoForm.tsx:142-143`. Un bloque abierto es exactamente eso: un acordeón que despliega una tarjeta con campos. No hace falta inventar un inspector.

Reparto de propiedades:

- **De la experiencia** (nombre, subtítulo, narrativa, duración, `abreEspacioAlForo`, nota de diseño, maduración): viven en Ficha, ruta aparte, igual que `eventos/[id]/editar`.
- **De la bisagra** (título, tiempo, orden, soporte, duración, requiere): cabecera de la tarjeta y su franja de Ajustes plegable.
- **Del bloque** (audiencia, descargable, nota para el moderador, pie): franja de Ajustes del bloque, dentro del bloque abierto.

### 5.2 El grid

```tsx
<div className="px-8 pt-6 pb-24 max-w-7xl mx-auto">
  <div className={`grid gap-6 items-start ${
    vistaPrevia
      ? 'grid-cols-1 lg:grid-cols-[264px_minmax(0,1fr)_400px]'
      : 'grid-cols-1 lg:grid-cols-[264px_minmax(0,1fr)]'
  }`}>
    <aside className="hidden lg:block sticky top-[120px]">
      <RielIndice ... />
    </aside>

    <div className="min-w-0 space-y-6">
      {/* lienzo */}
    </div>

    {vistaPrevia && (
      <aside className="hidden xl:block sticky top-[120px]">
        <PanelVistaPrevia ... />
      </aside>
    )}
  </div>
</div>
```

`top-[120px]` es 104 de cromo más 16 de aire.

Presupuesto de ancho, ahora que no hay barra lateral:

| Ventana | Riel | Lienzo | Vista previa |
|---|---|---|---|
| 1440px | 264 | 656 | 400 |
| 1280px | 264 | 496 | 400 |
| 1152px | 264 | 840 | oculta, se va a `/vista-previa` |
| menos de 1024px | oculto, botón Índice abre hoja inferior | ancho completo | ruta aparte |

Con 656px de lienzo y texto a `text-sm`, la medida de lectura del textarea queda en torno a 95 caracteres. Es cómoda para escribir. Eliminar la barra lateral es lo que hace posible tener riel, lienzo y teléfono a la vez a 1440px, cosa que con 240px de aside no cabía.

---

## 6. El riel del índice

Es la tarjeta con cabecera y lista de filas de `eventos/[id]/page.tsx:175-195`, el contenedor más repetido del portal, con cabeceras de grupo grises tomadas de `ChecklistClient.tsx:216`.

```tsx
<div className={SUPERFICIE}>
  <div className={CABECERA_TARJETA}>
    <h2 className={ETIQUETA_SECCION}>Índice</h2>
    <span className="text-xs text-slate-400 tabular-nums">{listas} / {total}</span>
  </div>

  {(['vispera', 'ignicion', 'retorno'] as const).map(t => {
    const bs = bisagrasDe(t)
    return (
      <div key={t}>
        <div className={CABECERA_GRIS}>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            {ETIQUETA_TIEMPO[t]}
          </span>
          <span className="text-xs text-slate-400 tabular-nums">{bs.length}</span>
        </div>

        {bs.length === 0 ? (
          <div className="px-4 py-6 text-center text-slate-400 text-sm border-b border-slate-100">
            Este tiempo no está diseñado.
          </div>
        ) : bs.map(b => (
          <button key={b.id} onClick={() => irA(b.id)}
                  className={[
                    'w-full text-left flex items-start gap-2.5 px-4 py-3 border-b border-slate-100 border-l-2 transition-colors',
                    b.id === activaId
                      ? 'bg-slate-100 border-l-slate-900'
                      : 'border-l-transparent hover:bg-slate-50',
                  ].join(' ')}>
            <span className="text-xs text-slate-400 tabular-nums mt-0.5 w-5 flex-shrink-0 text-right">
              {String(b.orden).padStart(2, '0')}
            </span>
            <span className="flex-1 min-w-0">
              <span className={`block text-sm truncate ${
                b.id === activaId ? 'font-semibold text-slate-900' : 'font-medium text-slate-900'
              }`}>
                {b.titulo || <span className="text-slate-300 font-normal">Bisagra sin título</span>}
              </span>
              <span className="block text-xs text-slate-400 mt-0.5">
                {b.bloques.length === 0 ? 'Sin bloques' : `${b.bloques.length} bloque${b.bloques.length === 1 ? '' : 's'}`}
              </span>
            </span>
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${b.listo ? 'bg-emerald-500' : 'bg-amber-400'}`}
                  title={b.listo ? 'Lista' : 'Falta trabajo'} />
          </button>
        ))}

        <div className="px-3 py-2 border-b border-slate-100">
          <button onClick={() => agregarBisagra(t)} className={BTN_DASHED + ' text-xs py-1.5'}>
            + Bisagra en {ETIQUETA_TIEMPO[t].toLowerCase()}
          </button>
        </div>
      </div>
    )
  })}
</div>
```

La marca de activo es `border-l-2 border-slate-900` más `bg-slate-100`. Es la transposición vertical del tab subrayado de `ItinerarioClient.tsx:229-231` (`border-b-2 -mb-px border-slate-900`), no la del `AdminNav` muerto. El punto verde o ámbar a la derecha es la única señal de avance del riel, es del autor y sale de `Bisagra.listo`, campo que ya existe en `dominio.ts:48`. No hay porcentaje, no hay barra, no hay racha.

Debajo de `lg` el riel desaparece y en su lugar, dentro del lienzo, aparece:

```tsx
<button onClick={abrirHoja} className={BTN_SECUNDARIO + ' w-full lg:hidden mb-4'}>
  Índice · {total} bisagras
</button>
```

que abre una hoja inferior con el mismo contenido, usando el patrón de `components/HelpButton.tsx` pero en claro: backdrop `fixed inset-0 z-50 bg-slate-900/40 flex flex-col justify-end`, hoja `bg-white rounded-t-2xl border-t border-slate-200 max-h-[80vh] overflow-y-auto`.

---

## 7. El lienzo

### 7.1 Aviso de versión publicada

Cuando el estado es Publicada o Cambios sin publicar, arriba de todo. Es el bloque de nota comercial de `eventos/[id]/page.tsx:323-325`.

```tsx
<div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
    Versión {n} publicada
  </p>
  <p className="text-sm text-blue-800 leading-relaxed">
    Lo que edites aquí no lo ven los moderadores hasta que publiques de nuevo.
  </p>
</div>
```

### 7.2 Cabecera de tiempo

Entre grupos de bisagras, sobre `bg-slate-50` directamente, sin tarjeta. Es lo que separa la pila y da respiro.

```tsx
<div className="flex items-baseline justify-between gap-4 pt-2">
  <div className="min-w-0">
    <h2 className={ETIQUETA_SECCION}>{ETIQUETA_TIEMPO[t]}</h2>
    <p className="text-xs text-slate-400 mt-1 max-w-[56ch] leading-relaxed">
      {PAPEL_SOFTWARE[t]}
    </p>
  </div>
  <span className="text-xs text-slate-400 tabular-nums flex-shrink-0">
    {listas} de {total} listas
  </span>
</div>
```

`PAPEL_SOFTWARE` ya existe en `dominio.ts:27-31` y dice cosas como que en la ignición el software es mudo y solo hay modo sala para el moderador. Ese texto es la mejor guía de autoría que tiene el producto y tiene que estar en la pantalla donde se autora, no escondido en un archivo de dominio.

### 7.3 Tarjeta de bisagra

```tsx
<section id={`bisagra-${b.id}`} className={SUPERFICIE + ' scroll-mt-[128px]'}>

  {/* Cabecera: número, título editable, badges, acciones */}
  <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-100">
    <div className="flex items-start gap-3 min-w-0 flex-1">
      <span className="text-xs text-slate-400 tabular-nums mt-2.5 w-5 flex-shrink-0 text-right">
        {String(b.orden).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <label htmlFor={`titulo-${b.id}`} className="sr-only">Título de la bisagra</label>
        <input id={`titulo-${b.id}`} value={b.titulo}
               onChange={e => setTitulo(b.id, e.target.value)}
               placeholder="Título de la bisagra"
               className={CAMPO + ' font-semibold text-slate-900'} />
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`${BADGE_TIPO} ${SOPORTE_BLOQUE[b.soporte].cls}`}
                title={SOPORTE_NOTA[b.soporte]}>
            {SOPORTE_BLOQUE[b.soporte].etiqueta}
          </span>
          {b.duracion && <span className="text-xs text-slate-400">{b.duracion}</span>}
          <span className="text-xs text-slate-400">
            {b.bloques.length === 0 ? 'Sin bloques' : `${b.bloques.length} bloques`}
          </span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-0.5 flex-shrink-0 pt-1">
      <button className={BTN_ICONO} disabled={esPrimera} title="Subir esta bisagra" aria-label="Subir esta bisagra">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button className={BTN_ICONO} disabled={esUltima} title="Bajar esta bisagra" aria-label="Bajar esta bisagra">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <button onClick={() => setAjustes(a => !a)} aria-expanded={ajustes}
              className={BTN_ICONO + (ajustes ? ' bg-slate-100 text-slate-900' : '')}
              title="Ajustes de la bisagra" aria-label="Ajustes de la bisagra">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="3" />
          <path strokeLinecap="round" d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6L7 7m10 10l1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4" />
        </svg>
      </button>
      <ConfirmacionEnLinea
        etiqueta="Eliminar bisagra"
        pregunta={preguntaBisagra(b)}
        onConfirmar={() => eliminarBisagra(b.id)} />
    </div>
  </div>

  {/* Ajustes de la bisagra, plegable */}
  {ajustes && (
    <div className="px-4 py-4 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor={`soporte-${b.id}`} className={ETIQUETA_CAMPO}>Soporte</label>
        <select id={`soporte-${b.id}`} className={CAMPO}>
          <option value="sala">Sala. Ocurre entre personas, el software no entra.</option>
          <option value="objeto">Objeto. Pieza física, el software la administra.</option>
          <option value="pantalla">Pantalla. Vive dentro del portal.</option>
        </select>
      </div>
      <div>
        <label htmlFor={`duracion-${b.id}`} className={ETIQUETA_CAMPO}>Duración</label>
        <input id={`duracion-${b.id}`} placeholder="90 min" className={CAMPO} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`requiere-${b.id}`} className={ETIQUETA_CAMPO}>
          Qué necesita el moderador en la mano
        </label>
        <input id={`requiere-${b.id}`} placeholder="Velas, libreta de cada participante" className={CAMPO} />
        <p className={PISTA_CAMPO}>Separa con comas. Aparece en el guion de sala.</p>
      </div>
      <div className="sm:col-span-2 flex items-center justify-between pt-1 border-t border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer group select-none">
          <input type="checkbox" className="sr-only peer" checked={b.listo} onChange={toggleListo} />
          <span className="w-4 h-4 rounded border-2 border-slate-300 bg-white flex items-center justify-center transition-colors peer-checked:bg-emerald-500 peer-checked:border-emerald-500 group-hover:border-slate-400">
            <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-xs text-slate-600">Esta bisagra está lista</span>
        </label>
        <div className="w-48">
          <select className={CAMPO + ' text-xs py-1.5'} defaultValue="">
            <option value="" disabled>Mover a otro tiempo</option>
            <option value="vispera">Víspera</option>
            <option value="ignicion">Ignición</option>
            <option value="retorno">Retorno</option>
          </select>
        </div>
      </div>
    </div>
  )}

  {/* Bloques */}
  {b.bloques.length === 0 ? (
    <div className="px-4 py-6 text-center text-slate-400 text-sm border-b border-slate-100">
      La bisagra existe pero no tiene contenido.
    </div>
  ) : (
    <div className="divide-y divide-slate-100">
      {b.bloques.map(bl => <FilaBloque key={bl.id} bloque={bl} />)}
    </div>
  )}

  {/* Pie: agregar bloque */}
  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
    <SelectorTipoBloque onElegir={tipo => agregarBloque(b.id, tipo)} />
  </div>
</section>
```

El checkbox es el de `ChecklistClient.tsx:46-56` con relleno `bg-emerald-500`, hecho accesible: input real con `sr-only peer` en vez de un `<button>` sin `role` ni `aria-checked` como el original.

El divisor entre bloques es `divide-y divide-slate-100`, que es lo que hace `OperacionClient.tsx:149`, no el ternario sobre el índice que repiten `FamiliasClient.tsx:200`, `ChecklistClient.tsx:223` y `ItinerarioList.tsx:96`.

### 7.4 Fila de bloque colapsada

```tsx
<div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
  <span className={`${BADGE_TIPO} mt-0.5 flex-shrink-0 ${TIPO_BLOQUE[bl.tipo].cls}`}>
    {TIPO_BLOQUE[bl.tipo].etiqueta}
  </span>

  <button onClick={() => abrir(bl.id)} aria-expanded={false} aria-controls={`bloque-${bl.id}`}
          className="flex-1 min-w-0 text-left">
    <span className="block text-sm font-medium text-slate-900 truncate">
      {resumen(bl) || <span className="text-slate-300 font-normal">Bloque vacío</span>}
    </span>
    <span className="block text-xs text-slate-400 truncate mt-0.5">{detalle(bl)}</span>
  </button>

  {bl.audiencia !== 'participante' && (
    <span className={`${BADGE_TIPO} mt-0.5 flex-shrink-0 bg-slate-100 text-slate-500`}
          title="Este bloque no lo ve el participante">
      Solo moderador
    </span>
  )}

  <div className="flex items-center gap-0.5 flex-shrink-0">
    <button className={BTN_ICONO} disabled={esPrimero} title="Subir este bloque" aria-label="Subir este bloque">…</button>
    <button className={BTN_ICONO} disabled={esUltimo} title="Bajar este bloque" aria-label="Bajar este bloque">…</button>
    <ConfirmacionEnLinea compacto etiqueta="Eliminar bloque"
      pregunta={preguntaBloque(bl)} onConfirmar={() => eliminarBloque(bl.id)} />
  </div>
</div>
```

`resumen(bl)` es la primera línea del texto, el nombre del archivo o el pie, según el tipo. `detalle(bl)` es el conteo de palabras, el peso del archivo o la duración del video.

Las acciones están siempre visibles en `slate-400`. No se usa `opacity-0 group-hover:opacity-100` como en `ChecklistClient.tsx:69`, porque eso no existe con teclado ni en pantalla táctil.

### 7.5 Fila de bloque abierta

```tsx
<div id={`bloque-${bl.id}`} className="border-l-2 border-slate-900 bg-white">
  {/* misma cabecera, con aria-expanded={true} y el chevron girado */}
  <div className="px-4 pb-4">
    {/* editor propio del tipo, secciones 9, 10 y 11 */}
  </div>
  <AjustesBloque bloque={bl} />
</div>
```

Solo un bloque abierto a la vez. Abrir otro guarda y cierra el anterior. Regla dura para que el lienzo no se convierta en una pila de formularios simultáneos.

### 7.6 Ajustes de bloque

```tsx
<div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-4 flex-wrap">
  <div className="flex items-center gap-2">
    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Quién lo ve</span>
    <div className="flex items-center bg-slate-100 rounded-lg p-1">
      {(['participante', 'moderador', 'ambos'] as const).map(a => (
        <button key={a} onClick={() => setAudiencia(bl.id, a)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  bl.audiencia === a
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}>
          {AUDIENCIA[a]}
        </button>
      ))}
    </div>
  </div>

  <button onClick={() => setNota(n => !n)}
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
    {bl.notaModerador ? 'Editar nota para el moderador' : '+ Nota para el moderador'}
  </button>
</div>

{nota && (
  <div className="px-4 pb-4 bg-slate-50">
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <label htmlFor={`nota-${bl.id}`}
             className="block font-semibold text-xs uppercase tracking-wide text-amber-600 mb-1.5">
        Nota para el moderador
      </label>
      <textarea id={`nota-${bl.id}`} rows={2}
                placeholder="El participante nunca ve esto. Sirve para el guion de sala."
                className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y" />
    </div>
  </div>
)}
```

El segmented control es el de `ItinerarioClient.tsx:448-466`: superficie blanca elevada dentro de un riel gris, no color. El callout ámbar es el de `ItinerarioClient.tsx:411-416`, que es como Trascendencia ya distingue lo que solo ve el staff.

---

## 8. Agregar, reordenar, eliminar

### 8.1 Agregar

Gesto principal: botón dashed a ancho completo al pie de la bisagra. Es el patrón de `ChecklistClient.tsx:239`, la mejor affordance de creación del admin. Al pulsarlo se expande en sitio una rejilla de tipos, sin capa flotante y sin modal.

```tsx
// cerrado
<button onClick={() => setAbierto(true)} className={BTN_DASHED}>+ Agregar bloque</button>

// abierto
<div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
  <div className="flex items-center justify-between mb-3">
    <h4 className={ETIQUETA_SECCION}>Qué quieres agregar</h4>
    <button onClick={() => setAbierto(false)}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
      Cancelar
    </button>
  </div>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    {TIPOS.map(t => (
      <button key={t.id} onClick={() => elegir(t.id)}
              className="flex flex-col items-start gap-1.5 px-3 py-2.5 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors text-left">
        <span className={`${BADGE_TIPO} ${TIPO_BLOQUE[t.id].cls}`}>{TIPO_BLOQUE[t.id].etiqueta}</span>
        <span className="text-[11px] text-slate-400 leading-snug">{t.pista}</span>
      </button>
    ))}
  </div>
</div>
```

Pistas exactas:

| Tipo | Pista |
|---|---|
| Texto | Para escribir. Es el bloque que más vas a usar. |
| Cita | Una frase sola, con peso. |
| Imagen | Una foto o una lámina, con pie. |
| Documento | Un PDF. Elige quién puede descargarlo. |
| Video | Un archivo o un enlace no listado. |
| Aviso | Algo que hay que leer sí o sí. |
| Escritura | El participante escribe para sí mismo. Nadie lo califica. |

El tipo Escritura solo se ofrece si `experiencia.abreEspacioAlForo` es verdadero (`dominio.ts:89`). Si es falso, en su lugar va una celda apagada, no un hueco:

```tsx
<div className="flex flex-col items-start gap-1.5 px-3 py-2.5 border border-dashed border-slate-200 rounded-lg opacity-60">
  <span className={`${BADGE_TIPO} bg-slate-100 text-slate-400`}>Escritura</span>
  <span className="text-[11px] text-slate-400 leading-snug">
    Esta experiencia no abre espacio al foro. Cámbialo en la Ficha.
  </span>
</div>
```

Al elegir un tipo el bloque se inserta al final de esa bisagra, ya abierto, con el foco en su primer campo. Nunca se abre un formulario en otra página.

Punto de inserción entre bloques, comodidad secundaria:

```tsx
<div className="relative h-0">
  <div className="absolute inset-x-4 -top-3 h-6 flex items-center opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
    <span className="flex-1 h-px bg-slate-200" />
    <button className="mx-2 w-5 h-5 rounded-full bg-white border border-slate-300 text-slate-400 hover:border-slate-900 hover:text-slate-900 text-xs leading-none transition-colors"
            title="Insertar bloque aquí" aria-label="Insertar bloque aquí">+</button>
    <span className="flex-1 h-px bg-slate-200" />
  </div>
</div>
```

Este sí puede vivir en hover, porque no es la única vía: el botón dashed del pie siempre está.

### 8.2 Reordenar

Gesto principal: botones de subir y bajar en la fila del bloque y en la cabecera de la bisagra. Deshabilitados en los extremos con `disabled:opacity-40`, nunca ocultos, para que la posición se lea del propio control.

Gesto secundario: mover a otra bisagra o a otro tiempo, desde un `select` en Ajustes.

```tsx
<div>
  <label htmlFor={`mover-${bl.id}`} className={ETIQUETA_CAMPO}>Mover a</label>
  <select id={`mover-${bl.id}`} className={CAMPO} defaultValue="">
    <option value="" disabled>Elige otra bisagra</option>
    {bisagras.map(b => (
      <option key={b.id} value={b.id}>
        {ETIQUETA_TIEMPO[b.tiempo]} · {String(b.orden).padStart(2, '0')} {b.titulo}
      </option>
    ))}
  </select>
</div>
```

Al mover, el lienzo hace scroll a la nueva posición y la fila queda con `bg-slate-50` durante 900 ms para que la vista no se pierda.

Arrastrar y soltar: no se construye ahora. El repositorio no tiene ninguna dependencia de arrastre ni un solo atributo `draggable`. Si algún día se agrega, va encima de los botones, nunca en su lugar.

### 8.3 Eliminar

Componente `ConfirmacionEnLinea`. Mecánica de dos pasos de `EventStatusButton.tsx:39-57` y `DeleteBlockButton.tsx:21-39`, más un tercer paso de deshacer inspirado en `CheckInButton.tsx:65-91`, donde el control se transforma en su estado final en vez de mostrar un mensaje.

```tsx
// Paso 1, reposo
<button onClick={() => setPaso('confirmar')} title={etiqueta} aria-label={etiqueta}
        className={BTN_ICONO + ' hover:text-red-600 hover:bg-red-50'}>
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
  </svg>
</button>

// Paso 2, confirmando
<div className="flex items-center gap-1.5">
  <span className="text-xs text-slate-500">{pregunta}</span>
  <button onClick={confirmar} disabled={cargando}
          className="px-2.5 py-1 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors">
    {cargando ? '…' : 'Eliminar'}
  </button>
  <button onClick={() => setPaso('reposo')}
          className="px-2.5 py-1 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
    No
  </button>
</div>

// Paso 3, deshacer, 10 segundos
<div className="flex items-center gap-2">
  <span className={`${BADGE_ESTADO} bg-slate-100 text-slate-500`}>Eliminado</span>
  <button onClick={deshacer} className={BTN_FILA}>Deshacer</button>
</div>
```

Nunca `confirm()` del navegador, que es lo que hacen hoy `ChecklistClient.tsx:118` y `DeleteItemButton.tsx:17` y que rompe por completo el lenguaje visual del panel. Nunca un modal, porque el único modal del admin (`ItinerarioClient.tsx:359-437`) no cierra con Escape, no atrapa el foco y no tiene `role="dialog"`.

Escalado de la confirmación:

| Qué se elimina | Pregunta exacta |
|---|---|
| Bloque vacío | Se borra directo, sin paso 2, con deshacer de 10 segundos. |
| Bloque con texto | Se elimina este bloque con lo que escribiste. |
| Bloque con archivo | Se elimina este bloque y su archivo deja de estar disponible. |
| Bisagra sin bloques | Se elimina "{título}". |
| Bisagra con bloques | Se elimina "{título}" con sus {n} bloques. |
| Bisagra ya publicada | Se elimina "{título}". Está publicada, así que los moderadores dejarán de verla en cuanto publiques de nuevo. |

---

## 9. El editor de texto

### 9.1 Qué necesita para escribir de verdad

Diez capacidades, ni una más:

1. Párrafo
2. Salto de línea duro dentro del párrafo
3. Negrita
4. Itálica
5. Título de sección, H2
6. Subtítulo, H3
7. Lista con viñetas
8. Lista numerada
9. Cita destacada
10. Enlace

Formato: markdown restringido guardado como texto plano. El renderer es propio, unas cuarenta líneas, y devuelve nodos de React. Nunca `dangerouslySetInnerHTML`. Cualquier sintaxis fuera de la gramática se muestra literal, no se interpreta.

Motivo de elegir markdown sobre un editor enriquecido: hoy todo el texto largo del participante es un `string` plano renderizado con `whitespace-pre-wrap` (`info/page.tsx:152`, `programa/page.tsx:252`, `avisos/page.tsx:80`). No hay HTML almacenado en ninguna tabla. Markdown restringido es el salto más pequeño que agrega estructura sin cambiar el tipo de la columna ni abrir una superficie de inyección.

### 9.2 Qué se descarta

| Descartado | Razón |
|---|---|
| Color de texto, tamaño, familia | El lector del participante tiene una sola escala. Un autor con selector de color rompe la marca en la primera semana. |
| Alineación y sangría | El lector es una columna de 512px en teléfono. No hay nada que alinear. |
| Subrayado | Se confunde con enlace. |
| Tachado y resaltado | No existe tratamiento equivalente del lado participante. |
| Tablas y columnas | No caben en teléfono y el lector no tiene patrón para ellas. |
| HTML crudo y embeds arbitrarios | Superficie de seguridad y de rotura visual sin techo. |
| Emojis como iconografía | El portal usa SVG de trazo 1.5 dibujado a mano. Los emojis de `programa/page.tsx:205` y `avisos/page.tsx:55` rompen el registro y no se replican. |
| Imagen en línea dentro del texto | La imagen es un bloque propio, con su pie y su medida. |
| Notas al pie, índices, anclas | Complejidad sin demanda. |

### 9.3 Markup

```tsx
<div className="pt-1">
  {/* Barra de herramientas */}
  <div className="flex items-center gap-1 border border-slate-200 border-b-0 rounded-t-lg bg-slate-50 px-2 py-1.5">
    <button type="button" onClick={() => envolver('**')} title="Negrita (Cmd+B)" aria-label="Negrita"
            className={BTN_ICONO + ' text-sm font-bold'}>B</button>
    <button type="button" onClick={() => envolver('*')} title="Itálica (Cmd+I)" aria-label="Itálica"
            className={BTN_ICONO + ' text-sm italic'}>I</button>

    <span className="w-px h-4 bg-slate-200 mx-1" />

    <button type="button" onClick={() => prefijo('## ')} title="Título de sección" aria-label="Título de sección"
            className={BTN_ICONO + ' text-[11px] font-semibold'}>H2</button>
    <button type="button" onClick={() => prefijo('### ')} title="Subtítulo" aria-label="Subtítulo"
            className={BTN_ICONO + ' text-[11px] font-semibold'}>H3</button>

    <span className="w-px h-4 bg-slate-200 mx-1" />

    <button type="button" onClick={() => prefijo('- ')} title="Lista con viñetas" aria-label="Lista con viñetas"
            className={BTN_ICONO}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="5" cy="7" r="1" fill="currentColor" />
        <circle cx="5" cy="12" r="1" fill="currentColor" />
        <circle cx="5" cy="17" r="1" fill="currentColor" />
        <path strokeLinecap="round" d="M9 7h11M9 12h11M9 17h11" />
      </svg>
    </button>
    <button type="button" onClick={() => prefijo('1. ')} title="Lista numerada" aria-label="Lista numerada"
            className={BTN_ICONO + ' text-[11px] font-semibold'}>1.</button>
    <button type="button" onClick={() => prefijo('> ')} title="Cita" aria-label="Cita"
            className={BTN_ICONO + ' text-sm'}>”</button>
    <button type="button" onClick={insertarEnlace} title="Enlace (Cmd+K)" aria-label="Enlace"
            className={BTN_ICONO}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.8 10.2a4 4 0 000-5.7l-.7-.7a4 4 0 00-5.7 0L4.6 6.6a4 4 0 000 5.7M10.2 13.8a4 4 0 000 5.7l.7.7a4 4 0 005.7 0l2.8-2.8a4 4 0 000-5.7" />
      </svg>
    </button>

    <div className="flex-1" />

    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
      {(['escribir', 'leer'] as const).map(m => (
        <button key={m} type="button" onClick={() => setModo(m)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  modo === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
          {m === 'escribir' ? 'Escribir' : 'Leer'}
        </button>
      ))}
    </div>
  </div>

  {/* Área */}
  {modo === 'escribir' ? (
    <>
      <label htmlFor={`texto-${bl.id}`} className="sr-only">Texto del bloque</label>
      <textarea id={`texto-${bl.id}`} rows={12} value={bl.texto}
                onChange={e => setTexto(bl.id, e.target.value)}
                placeholder="Escribe aquí lo que va a leer el participante."
                className="w-full px-4 py-3 border border-slate-200 rounded-b-lg text-sm leading-relaxed text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-y" />
    </>
  ) : (
    <div className="border border-slate-200 rounded-b-lg bg-white px-4 py-3 min-h-[280px]">
      <RenderMarkdown texto={bl.texto} tono="claro" />
    </div>
  )}

  <div className="flex items-center justify-between mt-1.5 gap-4">
    <span className="text-[11px] text-slate-400 truncate">
      Markdown simple: **negrita**, *itálica*, ## título, - lista, &gt; cita
    </span>
    <span className="text-[11px] text-slate-400 tabular-nums flex-shrink-0">
      {palabras} palabras · {minutos} min de lectura
    </span>
  </div>
</div>
```

`resize-y` existe en Tailwind. El admin escribe `resize-vertical` en `NuevoItemForm.tsx:163` y `:192`, que no es una utilidad válida y no hace nada.

Atajos dentro del textarea: Cmd o Ctrl más B negrita, I itálica, K enlace, S guardar y evitar el diálogo del navegador. Enter dentro de una lista continúa la lista. Enter en una lista vacía la cierra.

El modo Leer usa `tono="claro"` sobre blanco. La vista previa usa `tono="oscuro"` con las clases del participante. Es el mismo componente con dos mapas de clase, y ese es el punto: el markdown se renderiza en un solo lugar del código, no en dos como pasa hoy con el contenido de acuerdos, que está implementado dos veces con divergencias silenciosas (`acuerdos/[id]/page.tsx:67-94` contra `firmar/[token]/page.tsx:152-172`).

Mapa de clases en tono claro:

| Nodo | Clases |
|---|---|
| Párrafo | `text-sm leading-relaxed text-slate-700 mb-3` |
| H2 | `text-sm font-semibold text-slate-900 mt-5 mb-2` |
| H3 | `text-xs font-semibold text-slate-900 uppercase tracking-wider mt-4 mb-1.5` |
| Negrita | `font-semibold text-slate-900` |
| Itálica | `italic` |
| Lista | `list-disc pl-5 space-y-1 text-sm text-slate-700 mb-3 marker:text-slate-400` |
| Lista numerada | `list-decimal pl-5 space-y-1 text-sm text-slate-700 mb-3 marker:text-slate-400` |
| Cita | `border-l-2 border-slate-300 pl-4 italic text-sm text-slate-600 mb-3` |
| Enlace | `text-blue-600 hover:underline` |

El azul del enlace es `text-blue-600`, el único link azul del chasis (`eventos/[id]/page.tsx:306`).

---

## 10. Documento PDF

Cinco estados de interfaz. El usuario pidió cuatro: seleccionando, subiendo, listo, fallido. El quinto es el reemplazo.

### 10.1 Vacío, esperando archivo

```tsx
<label htmlFor={`pdf-${bl.id}`}
       onDragOver={e => { e.preventDefault(); setArrastrando(true) }}
       onDragLeave={() => setArrastrando(false)}
       onDrop={soltar}
       className={`flex flex-col items-center justify-center gap-2 w-full border border-dashed rounded-xl px-4 py-8 text-center cursor-pointer transition-colors ${
         arrastrando ? 'border-slate-900 bg-slate-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
       }`}>
  <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  </span>
  <span className="text-sm font-medium text-slate-700">Arrastra el PDF aquí o haz clic para elegirlo</span>
  <span className="text-xs text-slate-400">Un archivo PDF, hasta 25 MB.</span>
</label>
<input id={`pdf-${bl.id}`} type="file" accept="application/pdf" className="sr-only" onChange={elegir} />
```

El icono en caja `w-10 h-10 bg-slate-100 rounded-xl` es el del estado vacío del dashboard (`dashboard/page.tsx:75`).

### 10.2 Seleccionando

Estado corto entre elegir el archivo y empezar a subir. Existe porque validar tamaño y tipo antes de subir evita que el autor espere para nada.

```tsx
<div className={SUPERFICIE_PLANA + ' px-4 py-3 flex items-center gap-3'}>
  <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin flex-shrink-0" />
  <div className="min-w-0 flex-1">
    <p className="text-sm font-medium text-slate-900 truncate">{archivo.nombre}</p>
    <p className="text-xs text-slate-400 mt-0.5">Revisando el archivo.</p>
  </div>
</div>
```

El spinner es el de `ToggleBlockButton.tsx:37`, `border-2` con `border-t-transparent`.

### 10.3 Subiendo

```tsx
<div className={SUPERFICIE_PLANA + ' px-4 py-3'}>
  <div className="flex items-center justify-between gap-3 mb-2">
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-900 truncate">{archivo.nombre}</p>
      <p className="text-xs text-slate-400 mt-0.5 tabular-nums">{subido} de {total}</p>
    </div>
    <button onClick={cancelar} className={BTN_FILA + ' flex-shrink-0'}>Cancelar</button>
  </div>
  <div className="w-full bg-slate-100 rounded-full h-2">
    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
  </div>
</div>
```

Es literalmente la barra de progreso de `ChecklistClient.tsx:187-191`, incluida la transición de 500 ms, la más lenta del admin, que es lo que hace que el avance se sienta.

### 10.4 Listo

```tsx
<div className={SUPERFICIE_PLANA + ' px-4 py-3'}>
  <div className="flex items-center gap-3">
    <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
      PDF
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-900 truncate">{archivo.nombre}</p>
      <p className="text-xs text-slate-400 mt-0.5">
        {archivo.peso} · {archivo.paginas} páginas · subido el {fecha(archivo.subidoAt)}
      </p>
    </div>
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <a href={archivo.url} target="_blank" rel="noopener noreferrer" className={BTN_FILA}>Abrir</a>
      <label className={BTN_FILA + ' cursor-pointer'}>
        Reemplazar
        <input type="file" accept="application/pdf" className="sr-only" onChange={reemplazar} />
      </label>
      <ConfirmacionEnLinea compacto etiqueta="Quitar archivo"
        pregunta="Se quita el archivo. El bloque se queda vacío." onConfirmar={quitar} />
    </div>
  </div>

  <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-100">
    <label className="flex items-center gap-2 cursor-pointer group select-none">
      <input type="checkbox" className="sr-only peer" checked={bl.descargable} onChange={toggle} />
      <span className="w-4 h-4 rounded border-2 border-slate-300 bg-white flex items-center justify-center transition-colors peer-checked:bg-slate-900 peer-checked:border-slate-900 group-hover:border-slate-400">
        <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span className="text-xs text-slate-600">Se puede descargar</span>
    </label>
    <span className="text-xs text-slate-400">Quién lo ve se define abajo, en Quién lo ve.</span>
  </div>
</div>
```

Un documento nace con audiencia `moderador` y `descargable` activo. Es lo que pidió el usuario: cargar PDF que el moderador va a descargar.

Debajo, el pie del documento:

```tsx
<div className="mt-3">
  <label htmlFor={`pie-doc-${bl.id}`} className={ETIQUETA_CAMPO}>Qué es este documento</label>
  <input id={`pie-doc-${bl.id}`} placeholder="Guion de sala, versión 1.2" className={CAMPO} />
  <p className={PISTA_CAMPO}>Una frase. Es lo que se lee antes de descargar.</p>
</div>
```

### 10.5 Fallido

```tsx
<div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
  <div className="flex items-start gap-3">
    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-red-700">No se pudo subir {archivo.nombre}</p>
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

Motivos exactos, en español y sin jerga:

| Causa | Motivo exacto |
|---|---|
| Conexión cortada | Se cortó la conexión al {pct} por ciento. El archivo sigue en tu computadora, no se perdió nada. |
| Demasiado grande | Pesa {peso} y el máximo son 25 MB. Comprímelo o divídelo en dos. |
| Formato equivocado | Esto no es un PDF. Solo se admiten archivos .pdf. |
| PDF protegido | El PDF tiene contraseña. Quítasela y vuelve a subirlo. |
| Error del servidor | Falló del lado nuestro, no del tuyo. Vuelve a intentar en un minuto. |

---

## 11. Video

Cinco estados: vacío, subiendo, procesando, listo, fallido. Procesando existe porque después de subir todavía no se conoce la duración ni la miniatura.

### 11.1 Vacío, con dos vías

```tsx
<div className="flex items-center bg-slate-100 rounded-lg p-1 w-fit mb-3">
  {(['archivo', 'enlace'] as const).map(v => (
    <button key={v} onClick={() => setVia(v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              via === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
      {v === 'archivo' ? 'Subir archivo' : 'Pegar enlace'}
    </button>
  ))}
</div>

{via === 'archivo' ? (
  <label htmlFor={`video-${bl.id}`} className="…mismo dropzone que el PDF…">
    <span className="text-sm font-medium text-slate-700">Arrastra el video aquí o haz clic para elegirlo</span>
    <span className="text-xs text-slate-400">MP4 o MOV, hasta 500 MB.</span>
  </label>
) : (
  <div>
    <label htmlFor={`enlace-${bl.id}`} className={ETIQUETA_CAMPO}>Enlace del video</label>
    <input id={`enlace-${bl.id}`} type="url" placeholder="https://vimeo.com/…" className={CAMPO} />
    <p className={PISTA_CAMPO}>
      Vimeo o YouTube, siempre en modo no listado. Un enlace público deja de ser tuyo.
    </p>
  </div>
)}
```

### 11.2 Procesando

```tsx
<div className={SUPERFICIE_PLANA + ' px-4 py-3 flex items-center gap-3'}>
  <span className="w-24 h-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
    <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
  </span>
  <div className="min-w-0 flex-1">
    <p className="text-sm font-medium text-slate-900 truncate">{archivo.nombre}</p>
    <p className="text-xs text-slate-400 mt-0.5">
      Subido. Estamos preparándolo para que se vea bien en teléfono. Puedes seguir trabajando.
    </p>
  </div>
</div>
```

### 11.3 Listo

```tsx
<div className={SUPERFICIE_PLANA + ' px-4 py-3'}>
  <div className="flex items-center gap-3">
    <span className="relative w-24 h-14 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
      <img src={video.poster} alt="" className="w-full h-full object-cover opacity-80" />
      <span className="absolute inset-0 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="absolute bottom-1 right-1 text-[10px] font-medium text-white bg-black/70 px-1 rounded tabular-nums">
        {video.duracion}
      </span>
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-900 truncate">{video.nombre}</p>
      <p className="text-xs text-slate-400 mt-0.5">{video.peso} · {video.resolucion} · {video.duracion}</p>
    </div>
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button className={BTN_FILA}>Reproducir</button>
      <label className={BTN_FILA + ' cursor-pointer'}>
        Reemplazar<input type="file" accept="video/mp4,video/quicktime" className="sr-only" />
      </label>
      <ConfirmacionEnLinea compacto etiqueta="Quitar video"
        pregunta="Se quita el video. El bloque se queda vacío." onConfirmar={quitar} />
    </div>
  </div>

  <div className="mt-3 pt-3 border-t border-slate-100">
    <label htmlFor={`pie-video-${bl.id}`} className={ETIQUETA_CAMPO}>Qué es este video</label>
    <input id={`pie-video-${bl.id}`} placeholder="Una frase. Aparece debajo del video." className={CAMPO} />
  </div>
</div>
```

### 11.4 Advertencia de dominio

Se muestra cuando el video vive en una bisagra con soporte `sala`, o cuando el pie contiene la palabra formación.

```tsx
<div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
  <p className="font-semibold text-xs uppercase tracking-wide text-amber-600 mb-1">Ojo con el kit</p>
  <p className="text-sm text-amber-800 leading-relaxed">
    La pieza humana solo se transmite en formación presencial, nunca por video. Este video sirve de apoyo,
    no sustituye la formación del moderador.
  </p>
</div>
```

La regla está literal en `dominio.ts:64-66`. La advertencia avisa, no bloquea.

---

## 12. El guardado

El usuario lo pidió con nombre propio: guardar el progreso. Tiene que ser visible y tiene que ser pulsable.

### 12.1 Reglas

1. Autoguardado a los 1200 ms de inactividad en cualquier campo, y siempre al salir de un campo.
2. Botón explícito, siempre visible y siempre pulsable. Si no hay cambios, guarda igual y responde Todo guardado. Nunca se deshabilita: un botón de guardar apagado produce dudas.
3. Cmd o Ctrl más S guarda y evita el diálogo del navegador.
4. `beforeunload` al cerrar la pestaña con cambios pendientes.
5. Los autoguardados no lanzan toast. El toast se reserva para el guardado manual con éxito y para el fallo. `ToastProvider.tsx:35` no tiene cola ni tope, así que un toast por autoguardado apilaría tarjetas hasta salirse de la pantalla.
6. Ante fallo: reintento automático a los 5, 15 y 60 segundos, chip en rojo y banner persistente en el lienzo. El banner es persistente porque el toast se va solo a los 3000 ms y un error de guardado no puede desaparecer solo.
7. El borrador vive en el servidor, no en `localStorage`. `OperacionClient.tsx:512-518` lee `localStorage` durante el render y el propio autor lo tuvo que parchear con un efecto por desajuste entre servidor y cliente. No se repite.
8. El cliente de Supabase se crea una sola vez con `useMemo`. Hoy se crea uno nuevo por render en cinco archivos (`ChecklistClient.tsx:94`, `CheckInButton.tsx:25`, `NuevoItemForm.tsx:17`, `DeleteItemButton.tsx:11`, `familias/nueva/page.tsx:10`).

### 12.2 El chip, cuatro estados

Vive en la derecha del sub-nav de la experiencia, dentro de una región `aria-live="polite"`.

```tsx
// Todo guardado
<div className="flex items-center gap-1.5 flex-shrink-0">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
  <span className="text-xs text-slate-400">Todo guardado</span>
  <span className="text-xs text-slate-300 hidden xl:inline">· {haceCuanto}</span>
</div>

// Sin guardar
<div className="flex items-center gap-2 flex-shrink-0">
  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
  <span className="text-xs text-amber-700">Sin guardar</span>
  <button onClick={guardarAhora} className={BTN_FILA}>Guardar</button>
</div>

// Guardando
<div className="flex items-center gap-1.5 flex-shrink-0">
  <span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
  <span className="text-xs text-slate-400">{TEXTO_GUARDANDO}</span>
</div>

// Falló
<div className="flex items-center gap-2 flex-shrink-0">
  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
  <span className="text-xs text-red-700">No se pudo guardar</span>
  <button onClick={guardarAhora}
          className="text-xs font-medium text-red-700 border border-red-300 bg-white px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap">
    Reintentar
  </button>
</div>
```

El punto de color más texto es exactamente el idioma de `ToggleBlockButton.tsx:38` y `:58`, que separa estado de acción: la pastilla solo informa, el botón solo actúa. Es la mejor decisión de interacción del admin y se repite aquí sin cambios.

`haceCuanto`: menos de un minuto da "hace un momento", menos de una hora da "hace {n} min", el resto da la hora en formato de 24 horas. Se recalcula cada 30 segundos.

### 12.3 El banner de error

Al principio del lienzo, sobre todas las bisagras. Es la tarjeta de alerta con franja lateral de `dashboard/page.tsx:44-56`.

```tsx
<div className="flex items-start gap-4 border-l-4 border-red-400 bg-red-50 rounded-r-xl px-5 py-4 shadow-sm">
  <div className="flex-1 min-w-0">
    <p className="text-sm font-semibold text-slate-900">Tus últimos cambios no se guardaron</p>
    <p className="text-xs text-slate-500 mt-0.5">
      Lo que escribiste sigue en pantalla, no se ha perdido. No cierres esta pestaña hasta que diga Todo guardado.
      Reintentamos solos en {segundos} segundos.
    </p>
  </div>
  <button onClick={guardarAhora}
          className="shrink-0 text-xs font-medium text-slate-700 border border-slate-300 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap">
    Reintentar ahora
  </button>
</div>
```

Variante ámbar, misma estructura con `border-amber-400 bg-amber-50`, para sin conexión y para edición concurrente.

### 12.4 Toast de guardado manual

Éxito: `addToast('Guardado', 'success')`, tarjeta negra sólida con check `text-emerald-400` (`ToastProvider.tsx:46`).
Fallo: `addToast('No se pudo guardar. Revisa tu conexión y vuelve a intentar.', 'error')`.

---

## 13. La vista previa

### 13.1 El panel

Reutiliza el marco de teléfono que ya existe en `portal/app/(admin)/eventos/[id]/preview/page.tsx:264-317`, con su barra de estado, su muesca y su barra de navegación inferior simulada.

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
      {(['participante', 'moderador'] as const).map(l => (
        <button key={l} onClick={() => setLente(l)}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  lente === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
          {l === 'participante' ? 'Como participante' : 'Como moderador'}
        </button>
      ))}
    </div>
  </div>

  <div className="relative mx-auto" style={{ width: '375px' }}>
    <div className="relative bg-[#0C0C0C] rounded-[40px] shadow-2xl border-4 border-[#2A2A2A] overflow-hidden"
         style={{ minHeight: '640px' }}>
      {/* barra de estado y muesca, copiadas de preview/page.tsx:271-297 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-20" />
      <div className="absolute top-9 left-1/2 -translate-x-1/2 z-30 text-[9px] font-semibold uppercase tracking-widest text-[#C9A96E] bg-black/60 px-2 py-0.5 rounded-full">
        Vista previa
      </div>
      <div className="overflow-y-auto" style={{ height: '580px', paddingBottom: '80px' }}>
        <div className="px-5 pt-10 space-y-4">
          {bloquesVisibles(lente).length === 0
            ? <VacioLector lente={lente} />
            : bloquesVisibles(lente).map(bl => <TarjetaLectura key={bl.id} bloque={bl} lente={lente} />)}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-[#111] border-t border-[#2A2A2A] flex justify-around py-3 px-4">
        {['Mi experiencia', 'Recorrido', 'Kit', 'Foro'].map(l => (
          <div key={l} className="flex flex-col items-center gap-1">
            <div className="w-4 h-4 bg-[#3A3A3A] rounded-sm" />
            <span className="text-[9px] text-[#6B7280]">{l}</span>
          </div>
        ))}
      </div>
    </div>
  </div>

  <p className="text-[11px] text-slate-400 text-center px-4 leading-relaxed">
    Estás viendo el borrador. El participante ve la última versión publicada hasta que publiques de nuevo.
  </p>
</div>
```

El chip Vista previa dentro del teléfono no es decoración: sin él, una captura de pantalla del panel es indistinguible de producción.

### 13.2 Las dos lentes

- **Como participante**: solo bloques con audiencia `participante` o `ambos`. Sin notas para el moderador. Sin documentos marcados solo para moderador.
- **Como moderador**: todo, más las notas en el callout ámbar, más los documentos con su botón de descarga. Es el guion de sala tal como el moderador lo va a ver.

Esta pantalla responde la pregunta que el autor no puede contestar de otra forma: qué queda del lado de allá.

### 13.3 Tokens del lector

La tarjeta hereda el sistema editorial del participante, que es el que carga la marca (`programa/page.tsx:245-255`).

```tsx
<article className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-5 mb-4">
  <div className="text-[10px] uppercase tracking-[0.15em] text-[#C9A96E] mb-2">
    {ETIQUETA_TIEMPO[bloque.tiempo]}
  </div>
  <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">{bloque.titulo}</h3>
  <div className="space-y-3">
    <RenderMarkdown texto={bloque.texto} tono="oscuro" />
  </div>
</article>
```

Mapa de clases en tono oscuro:

| Nodo | Clases |
|---|---|
| Párrafo | `text-[15px] leading-[1.75] text-[#B0A898]` |
| H2 | `text-base font-semibold text-[#F5F0E8] mt-6 mb-2` |
| H3 | `text-sm font-semibold text-[#F5F0E8] mt-4 mb-1.5` |
| Negrita | `font-semibold text-[#F5F0E8]` |
| Itálica | `italic` |
| Lista | `list-disc pl-5 space-y-1.5 marker:text-[#C9A96E]` |
| Lista numerada | `list-decimal pl-5 space-y-1.5 marker:text-[#6B7280]` |
| Cita | `border-l-2 border-[#C9A96E]/40 pl-4 italic text-[#F5F0E8] font-[family-name:var(--font-cormorant)] text-lg leading-relaxed` |
| Enlace | `text-[#C9A96E] underline underline-offset-2 hover:text-[#D4B07A]` |

Dos cambios deliberados respecto de lo que hay hoy del lado participante: el cuerpo sube de `text-sm leading-relaxed` a `text-[15px] leading-[1.75]`, y cualquier sello de disponibilidad sube de `text-white/20` a `text-[#6B7280]`. Hoy el participante lee 14px en una columna de 512px y el sello está en un blanco al 20 por ciento que casi no se ve sobre `#1A1A1A` (`programa/page.tsx:256`).

### 13.4 Ruta a pantalla completa

`/experiencias/[id]/vista-previa`, sin sub-nav, con una banda superior oscura como la de `preview/page.tsx` y el teléfono centrado a `py-8`. Es el destino cuando la ventana es menor a 1280px y el destino de "Pantalla completa".

---

## 14. Publicar

### 14.1 Los cuatro estados de una experiencia

| Estado | Badge | Qué significa |
|---|---|---|
| Borrador | `bg-slate-100 text-slate-600` | Nunca se ha publicado. Ningún moderador la ve. |
| Publicada | `bg-emerald-100 text-emerald-700` | Lo que hay en el editor es idéntico a lo publicado. |
| Cambios sin publicar | `bg-amber-100 text-amber-700` | Está publicada y además hay ediciones que los moderadores todavía no ven. |
| Retirada | `bg-red-100 text-red-700` | Ya no se puede licenciar a capítulos nuevos. Las corridas en curso siguen. |

Cómo se ve una publicada contra una en borrador, en las tres superficies donde aparecen juntas:

1. **Sub-nav de la experiencia**: el badge junto al nombre, siempre visible mientras se edita.
2. **Índice de experiencias**: fila con el badge a la derecha, más un renglón de metadatos `text-xs text-slate-400` que dice "Versión 3, publicada el 12 de mayo" o "Nunca publicada". La fila de una experiencia con cambios sin publicar lleva además tinte `bg-amber-50/40`, con el mismo recurso con el que `contenido/page.tsx:158` tiñe la fila activa en `bg-emerald-50/40`.
3. **Editor**: el aviso azul de la sección 7.1.

### 14.2 La ruta de revisión

`/experiencias/[id]/publicar`, contenedor `px-8 pt-6 pb-12 max-w-3xl mx-auto`.

**Bloque 1: qué recibe el participante.** Barra de métricas con el truco de hairlines por gap de `eventos/[id]/page.tsx:156-167`, la mejor pieza técnica del chasis: el fondo `slate-200` del contenedor se ve solo a través del `gap-px` y produce líneas de 1px sin bordes dobles.

```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden mb-8">
  {[
    { label: 'Bisagras',           value: bisagras.length },
    { label: 'Bloques que ve',     value: bloquesParticipante },
    { label: 'Documentos',         value: documentos },
    { label: 'Minutos de lectura', value: minutos },
  ].map(m => (
    <div key={m.label} className="bg-white px-6 py-4">
      <div className="text-2xl font-semibold text-slate-900 tabular-nums">{m.value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{m.label}</div>
    </div>
  ))}
</div>
```

**Bloque 2: bloqueos.** Si hay uno solo, el botón de publicar está deshabilitado y con `title` que dice por qué.

```tsx
<h2 className={ETIQUETA_SECCION + ' mb-3'}>Hay que arreglar esto antes de publicar</h2>
<div className="flex flex-col gap-3 mb-8">
  {bloqueos.map(b => (
    <div key={b.id} className="flex items-start gap-4 border-l-4 border-red-400 bg-red-50 rounded-r-xl px-5 py-4 shadow-sm">
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

Bloqueos, copy exacto:

| Título | Detalle |
|---|---|
| La experiencia no tiene nombre | Sin nombre no se puede licenciar a ningún capítulo. |
| La ignición no tiene ninguna bisagra | Una experiencia sin ignición no es una experiencia. |
| Hay {n} bisagras sin título | Una bisagra sin título aparece en blanco en el guion del moderador. |
| Hay {n} bloques de texto vacíos | Se van a ver como una tarjeta en blanco. Escríbelos o elimínalos. |
| Hay {n} archivos que fallaron al subir | Súbelos otra vez o quita el bloque. |
| Hay {n} bloques de documento sin archivo | El bloque existe pero no hay nada que descargar. |
| Hay {n} enlaces de video que no reconocemos | Solo admitimos Vimeo y YouTube en modo no listado. |
| Hay {n} archivos todavía subiendo | Espera a que terminen. No tarda. |

**Bloque 3: advertencias.** Franja ámbar, misma estructura. No impiden publicar.

| Título | Detalle |
|---|---|
| La víspera está vacía | Es el tiempo que hoy no existe en ningún lado y es donde el software más sirve. |
| Hay {n} bisagras sin duración | El moderador no va a poder planear la jornada. |
| Hay {n} piezas del kit marcadas como que faltan | El capítulo va a recibir una lista incompleta. |
| Hay un video de {min} minutos | En teléfono, un video largo casi nadie lo termina. Considera partirlo. |
| Hay {n} documentos que ve el participante | Confirma que quieres eso. Por defecto los documentos son del moderador. |
| Ninguna bisagra abre espacio para escribir | Esta experiencia abre espacio al foro pero no hay dónde escribir. |
| Un bloque de video parece de formación | El kit dice que la pieza humana no se transmite por video. |

**Bloque 4: la confirmación.** Dos pasos, mecánica de `EventStatusButton.tsx:39-57`.

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

### 14.3 Versiones e historial

Publicar congela una copia del contenido y le da número. La corrida guarda con qué versión arrancó. El moderador de una corrida en curso ve en su panel: `Hay una versión nueva de esta experiencia. Tu foro sigue con la versión {n} hasta que termine.`

`/experiencias/[id]/historial` es una lista con divisores (`OperacionClient.tsx:145-160`): versión, fecha, quién publicó, nota, y un enlace Ver esta versión.

Decisión de producto, no consecuencia técnica. Va marcada como riesgo porque no está validada con Francisco.

---

## 15. Estados vacíos y de error, copy exacto

Dos niveles de vacío, la distinción buena que ya hace `FamiliasClient.tsx:167` contra `:177`: el vacío de verdad lleva llamada a la acción, el vacío causado por un filtro no.

### 15.1 Markup canónico del estado vacío

Uno solo. El admin tiene cuatro ejecuciones distintas del mismo patrón.

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

### 15.2 Vacíos del editor

| Situación | Dónde | Copy exacto | Acción |
|---|---|---|---|
| Experiencia sin ninguna bisagra | Lienzo, estado vacío canónico | Título: Esta experiencia todavía no está diseñada. Cuerpo: No es que falte capturarla, es que no existe. Empieza por la ignición, que es donde ocurre. | Botón: Crear la primera bisagra |
| Tiempo sin bisagras | Lienzo, dentro del grupo | Este tiempo no está diseñado. | Botón dashed: + Bisagra en {tiempo} |
| Tiempo sin bisagras | Riel | Este tiempo no está diseñado. | ninguna |
| Bisagra sin bloques | Dentro de la tarjeta | La bisagra existe pero no tiene contenido. | Selector de tipo abierto abajo |
| Bloque de texto vacío | Resumen de la fila colapsada | Bloque vacío | ninguna |
| Documento sin archivo | Fila colapsada, detalle | Sin archivo. Súbelo o elimina el bloque. | ninguna |
| Video sin archivo ni enlace | Fila colapsada, detalle | Sin video. Sube uno o pega un enlace. | ninguna |
| Kit vacío en la Ficha | Tarjeta | Sin kit definido. Un capítulo no puede correr esto sin saber qué necesita. | Botón: Definir el kit |
| Sin accesos otorgados | Pestaña Accesos | Ningún moderador tiene acceso a esta experiencia todavía. El acceso se le da al moderador, que compra para su foro. | Botón: Dar acceso a un moderador |
| Historial vacío | Pestaña Historial | Esta experiencia nunca se ha publicado. | ninguna |

### 15.3 Vacíos de la vista previa

| Situación | Copy exacto |
|---|---|
| Nada visible para el participante | Con esta lente el participante no ve nada todavía. Los bloques que hiciste son solo para el moderador. |
| Nada para el moderador | No hay nada para el moderador en esta experiencia. Ni guion, ni documentos, ni notas. |
| Bisagra de soporte sala sin nada en pantalla | Esta bisagra ocurre en la sala. El software no entra y eso está bien. |
| Experiencia entera vacía | Todavía no hay nada que leer. Escribe el primer bloque y aparece aquí. |

### 15.4 Errores

| Situación | Dónde | Copy exacto |
|---|---|---|
| Falla el autoguardado | Banner rojo en el lienzo | Tus últimos cambios no se guardaron. Lo que escribiste sigue en pantalla, no se ha perdido. No cierres esta pestaña hasta que diga Todo guardado. |
| Falla el guardado manual | Toast tipo error | No se pudo guardar. Revisa tu conexión y vuelve a intentar. |
| Sin conexión | Banner ámbar | Estás sin conexión. Puedes seguir escribiendo. Guardamos en cuanto vuelvas a estar en línea. |
| Otra persona editó | Banner ámbar con dos botones | {Nombre} guardó cambios en esta experiencia mientras la tenías abierta. Recarga para ver su versión, o copia lo tuyo antes de recargar. |
| Archivo demasiado grande | En el bloque | Pesa {peso} y el máximo son {limite}. Comprímelo o divídelo en dos. |
| Formato no admitido, PDF | En el bloque | Esto no es un PDF. Solo se admiten archivos .pdf. |
| Formato no admitido, video | En el bloque | Ese formato no lo podemos reproducir. Usa MP4 o MOV. |
| Enlace de video no reconocido | Bajo el campo, `text-xs text-red-600 mt-1` | No reconocemos ese enlace. Solo Vimeo y YouTube, siempre en modo no listado. |
| Subida cortada | En el bloque | Se cortó la conexión al {pct} por ciento. El archivo sigue en tu computadora, no se perdió nada. |
| Error del servidor al subir | En el bloque | Falló del lado nuestro, no del tuyo. Vuelve a intentar en un minuto. |
| Experiencia inexistente | Página completa | Esta experiencia no existe o la eliminaron. |
| Sin permiso de autoría | Página completa | Puedes ver esta experiencia pero no editarla. Pídele acceso de autor a quien la creó. |
| Publicación bloqueada | Página de publicar | No se puede publicar todavía. Hay {n} cosa{s} por arreglar. |
| Publicación sin cambios | Página de publicar | No hay nada nuevo que publicar. Lo que ven los moderadores es exactamente lo que hay en el editor. |
| Sesión caducada | Banner rojo | Tu sesión caducó. Abre otra pestaña, entra de nuevo y vuelve aquí. Lo que escribiste sigue en pantalla. |

Ningún mensaje muestra texto de base de datos ni inglés. El admin hoy hace `setError(error.message)` con el mensaje crudo de Postgres en `familias/nueva/page.tsx:46` y `NuevoItemForm.tsx:73`, y se lo enseña en inglés a una coordinadora. Aquí el mensaje técnico va a la consola y al log, y a la pantalla va una frase escrita por una persona.

---

## 16. Modelo de datos

### 16.1 Prototipo, TypeScript sin base de datos

Se agrega a `portal/app/prototipo/personalab/dominio.ts`, respetando el léxico y sin ningún campo prohibido.

```ts
export type TipoBloque = 'texto' | 'cita' | 'imagen' | 'documento' | 'video' | 'aviso' | 'escritura'
export type Audiencia  = 'participante' | 'moderador' | 'ambos'
export type EstadoArchivo = 'vacio' | 'seleccionando' | 'subiendo' | 'procesando' | 'listo' | 'fallido'
export type EstadoPublicacion = 'borrador' | 'publicada' | 'cambios' | 'retirada'

export interface Archivo {
  nombre: string
  peso: string
  url: string
  estado: EstadoArchivo
  progreso?: number          // 0 a 100, solo mientras sube
  motivoFallo?: string
  paginas?: number           // PDF
  duracion?: string          // video
  resolucion?: string        // video
  poster?: string            // video
  descargable: boolean
  subidoAt?: string
}

export interface Bloque {
  id: string
  tipo: TipoBloque
  orden: number
  audiencia: Audiencia
  texto?: string             // markdown restringido
  pie?: string
  archivo?: Archivo
  enlace?: string
  notaModerador?: string
}

// Bisagra gana bloques. Todo lo demás de dominio.ts:40-51 se conserva.
export interface Bisagra {
  id: string
  tiempo: Tiempo
  orden: number
  titulo: string
  descripcion: string
  soporte: Soporte
  duracion?: string
  listo: boolean
  requiere?: string[]
  bloques: Bloque[]          // nuevo
}

export interface VersionPublicada {
  numero: number
  publicadaAt: string
  publicadaPor: string
  nota?: string
}

// Experiencia gana: estadoPublicacion, versiones, versionActual,
// borradorActualizadoAt, borradorActualizadoPor
```

Campos que no existen y no van a existir en el modelo del participante: `progress`, `completion_pct`, `score`, `streak`, `badge`, `rank`, `quiz`. La única señal de avance del editor es el punto verde o ámbar del riel, es del autor y vive en `Bisagra.listo`, que ya existía en `dominio.ts:48`.

### 16.2 Esquema real, boceto

Migración `20260808_experiencia_autoria.sql`, siguiendo la convención de nombres de `portal/supabase/migrations`.

```
experiencias            id, nombre, subtitulo, narrativa, duracion, abre_espacio_al_foro,
                        maduracion, estado_publicacion, version_actual,
                        borrador_actualizado_at, borrador_actualizado_por
bisagras                id, experiencia_id, tiempo, orden, titulo, descripcion,
                        soporte, duracion, listo, requiere (text[])
bloques                 id, bisagra_id, tipo, orden, audiencia, texto, pie,
                        enlace, nota_moderador, archivo_id
archivos                id, bucket_path, nombre_original, mime, peso_bytes,
                        estado, paginas, duracion_seg, resolucion, poster_path, descargable
experiencia_versiones   id, experiencia_id, numero, contenido (jsonb congelado),
                        publicada_at, publicada_por, nota
corridas                + version_experiencia (int)
```

RLS: escritura solo para perfiles con rol de autor sobre esa experiencia. Lectura del contenido publicado para moderadores con grant vigente sobre el capítulo. Los archivos con audiencia `moderador` nunca se sirven por URL pública, siempre por URL firmada de vida corta.

---

## 17. Accesibilidad, no negociable

1. Todo `input`, `textarea` y `select` lleva `id`, y su `label` lleva `htmlFor` o es `sr-only` asociado. Verificado que el admin no lo hace en ningún archivo: `EditarEventoForm.tsx:42-52`, `NuevoItemForm.tsx:100-101`, `ChecklistClient.tsx:250-257`. Un editor de autoría es un formulario gigante y sin esto es inusable con lector de pantalla.
2. Un solo tratamiento de foco: `focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent`. El admin tiene cuatro tratamientos en cuatro archivos hermanos, uno de ellos casi invisible (`focus:ring-slate-900/10` en `NuevoItemForm.tsx:77`) y uno sin reemplazo alguno (`outline: 'none'` en `familias/nueva/page.tsx:186`).
3. Todo botón con solo icono lleva `aria-label` y `title`.
4. El acordeón de bloque lleva `aria-expanded` y `aria-controls`.
5. Ninguna acción existe únicamente en hover. El único elemento en hover es el punto de inserción entre bloques, que es redundante con el botón dashed del pie.
6. El orden de tabulación sigue el orden visual: riel, lienzo de arriba abajo, panel.
7. El chip de guardado vive dentro de `aria-live="polite"`.
8. Contraste: nada de texto informativo por debajo de `slate-400` sobre blanco. `slate-300` se reserva para separadores y para el placeholder de celda vacía.
9. Los checkboxes son `input type="checkbox"` con `sr-only peer`, no `<button>` sin `role` como en `ChecklistClient.tsx:44`.

---

## 18. Qué no se construye ahora

- Arrastrar y soltar bloques.
- Editor WYSIWYG.
- Comentarios y colaboración en tiempo real.
- Plantillas de experiencia.
- Multiidioma.
- Versionado con ramas. Una sola línea de versiones numeradas.
- Cualquier cosa que mida al participante: progreso, porcentaje, puntaje, racha, insignia, ranking, examen. Está prohibido por el dominio y no entra por la puerta de atrás disfrazado de otra cosa.

---

## 19. Orden de construcción

1. `tokens.ts`, la regla `scrollbar-none` en `globals.css`, `PersonaLabTopNav`, el nuevo `layout.tsx` con `pt-14 bg-slate-50 min-h-screen`, y la baja de `WorkspaceNav.tsx`. Repintar las siete páginas existentes del prototipo pasando de estilos en línea a las clases de `tokens.ts`. Sin esto, nada de lo demás se va a ver como Trascendencia.
2. `ExperienciaSubNav` con las cinco secciones y el tratamiento de botón para Editor.
3. Riel y lienzo con bisagras y bloques de texto, con agregar, reordenar y eliminar completos. Sin archivos todavía.
4. El guardado entero: cuatro estados del chip, banner, `beforeunload`, atajo.
5. `RenderMarkdown` y `PanelVistaPrevia` con las dos lentes.
6. La ruta de publicar con bloqueos y advertencias.
7. Bloques de documento y de video, primero simulados con temporizadores para probar los seis estados sin infraestructura, después conectados al almacenamiento real.