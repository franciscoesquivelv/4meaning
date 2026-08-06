# Sistema de marca · 4 Meaning

> Fuente: identidad oficial de 4 Meaning (Liquid Brand Lab).
> Este documento es la referencia única para todo el sitio `4meaning.life`.
> Cualquier página del repositorio debe respetar estos tokens.

---

## 1. Esencia

**Propósito.** 4 Meaning ayuda a personas, familias y organizaciones a examinar
sus **huellas** con conciencia, **excavar** la historia que las sostiene,
descubrir los **tesoros** que ya existen y transformarlos en **legado** vivo para otros.

**Personalidad: "El arqueólogo del sentido".** Una guía que mira con
profundidad, hace preguntas, ilumina y acompaña el descubrimiento de lo que ya
existe dentro de cada historia.

**Tono de voz.** Acompaña, revela y ordena sin perder calidez humana. Evita el
lenguaje genérico de coaching y el manual corporativo. Habla como una guía
contemplativa, con presencia intencional. Sin prisa, con propósito.

**Valores.** Profundo · Claro · Cálido · Aspiracional · Sin prisa · Con propósito.

---

## 2. Los cuatro pilares

| # | Pilar | Territorio |
|---|-------|-----------|
| 01 | **Conocerme** | Identidad, memoria, autoconocimiento |
| 02 | **Crecer** | Desarrollo humano intencional |
| 03 | **Conectar** | Vínculos, comunidad, encuentro |
| 04 | **Trascender** | Propósito, sentido, legado |

## 3. Arquitectura verbal

El recorrido de toda experiencia sigue esta secuencia narrativa:

**Huellas** → **Excavaciones** → **Tesoros** → **Legado**

- **Huellas**: lo que ya vamos dejando.
- **Excavaciones**: la búsqueda consciente en la historia que nos sostiene.
- **Tesoros**: los hallazgos valiosos cuando se examina la historia con intención.
- **Legado**: lo que decidimos preservar y entregar hacia adelante.

---

## 4. Color

Paleta oficial. El **Verde Petróleo es el color rector**; todo lo demás lo acompaña.

> **Fuente única de verdad: `/assets/brand.css`.** Los valores de esta tabla
> son los que realmente están en producción (auditados en vivo). Son una
> versión ligeramente más cálida que la primera pasada de este documento,
> ajuste deliberado para servir el valor de marca "Cálido" — si alguna vez
> `brand.css` cambia, este documento se actualiza a partir de ahí, nunca al revés.

| Token CSS | Nombre | Hex | Uso |
|-----------|--------|-----|-----|
| `--teal`  | Verde Petróleo | `#002B34` | Color rector · acentos, texto sobre claro |
| `--wine`  | Vino Profundo  | `#4C0F18` | Legado y profundidad · Trascendencia |
| `--terra` | Terracota      | `#B9735A` | Acento humano · calidez |
| `--ink`   | Tinta          | `#171310` | Texto base (negro-marrón cálido) |
| `--gray`  | Gris Criterio  | `#7A736B` | Texto secundario (gris cálido) |
| `--white` | Blanco         | `#FFFFFF` | Espacio y lectura |

**Variantes "deep" — para fondos inmersivos a pantalla completa.** El color
rector tiene una versión más profunda, reservada para heroes/CTA a sangre;
`--teal`/`--wine` puros se usan como acento (texto, iconos, bordes), no como
fondo de página completa:

| Token | Hex | Uso |
|-------|-----|-----|
| `--teal-deep` | `#001A21` | Fondo de hero/CTA · dominancia teal (4 Meaning, PersonaLab) |
| `--wine-deep` | `#2B080E` | Fondo de hero/CTA · dominancia vino (Trascendencia) |

Tintes de apoyo (derivados, para ritmo y jerarquía: no son colores nuevos):

| Token | Hex | Uso |
|-------|-----|-----|
| `--teal-2`  | `#0E5866` | Superficie teal elevada, blob de degradado vivo |
| `--wine-2`  | `#6E1A26` | Superficie vino elevada, blob de degradado vivo |
| `--terra-lo`| `#D8AC96` | Terracota clara sobre oscuro (antes `--terra-2`) |
| `--gold`    | `#C99E63` | Cuarto acento del degradado vivo (dorado, dosis mínima) |
| `--paper`   | `#F6EEE3` | Blanco cálido para grandes lienzos claros |
| `--paper-2` | `#EFE4D5` | Paper un tono más oscuro, para alternar secciones consecutivas |
| `--line`    | `#E2D5C4` | Filete sobre claro |
| `--line-dk` | `rgba(255,255,255,.14)` | Filete sobre oscuro |

**Reglas de color.** Fondos profundos con tipografía clara. Terracota como
acento humano, nunca como fondo dominante. El blanco puro (`#FFFFFF`) y
tonos fríos ajenos a esta tabla no se usan en fondos de sección: toda
superficie clara es `--paper` o `--paper-2`, nunca blanco liso.

### Dominancia por marca (casa de marca)

Las tres marcas usan **la misma combinación** (teal + vino + terracota). Lo que
cambia es **cuál domina**:

| Marca | Color dominante | Secundario | Acento |
|-------|-----------------|-----------|--------|
| **Trascendencia** | Vino `#4C0F18` | Teal `#002B34` | Terracota |
| **PersonaLab** | Teal `#002B34` | Vino `#4C0F18` | Terracota |
| **4 Meaning** (madre) | Balance vino + teal | — | Terracota |

- **4 Meaning** equilibra ambos colores y **muestra los dos logos** de sus
  líneas (Trascendencia + PersonaLab), siempre **proporcionales y sin
  distorsión** (ancho explícito + `height:auto`, nunca `width:auto` dentro de un
  flex, que provoca estirado).
- El color dominante manda en hero, fondos de sección y acentos de esa marca;
  el secundario aparece como respiro/contrapunto.

---

## 5. Tipografía

La jerarquía se construye con **escala, aire, ritmo y composición: no con
negritas**. Se evita el uso de pesos 800/900 y las mayúsculas apretadas.

**Decisión de la web (por preferencia del cliente): tipografía 100% sans serif.**
Los títulos van en la sans a pesos ligeros (200–300) y gran escala; se descartó
la capa serif editorial (Cormorant) en el sitio.

| Rol | Familia | Stack CSS | Uso |
|-----|---------|-----------|-----|
| Sans (única) | Helvetica Neue (sistema) | `-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif` | Títulos, cuerpo, navegación, eyebrows, todo |

> La marca especifica Avenir Next / Helvetica Neue para la sans. Como Avenir no
> es una fuente web libre, se usa el stack de sistema Helvetica Neue (fiel,
> sin dependencias externas y sin cargar fuentes externas).

**Pautas.**
- Display en sans, pesos 200–300 a gran escala, `line-height` ajustado (0.98–1.1).
- Énfasis con color (terracota/vino) y peso 500, no con negritas pesadas.
- Eyebrows en sans, mayúsculas, `letter-spacing` amplio (0.3em+).
- Cuerpo en sans, peso 300, mucho interlineado (aire).

---

## 6. Logo

- Lockup horizontal (símbolo + palabra). Símbolo = infinito → continuidad,
  historia, sentido, legado.
- Versiones: oscura (principal), blanca (sobre fondos profundos), negativa.
- Aire de protección 1× (altura del símbolo) en todos los lados.
- Sin rotar, distorsionar, sombrear ni aplicar efectos. Eje horizontal siempre.
- Sello de aval: **"Una experiencia de 4 Meaning"**.

Assets en el repo: `logos-4meaning/` (blk/wht · logo/icon) y `logos/`
(marcas de Trascendencia y PersonaLab).

---

## 7. Casa de marca

- **Marca madre:** 4 Meaning: filosofía, visión, identidad, criterio central.
- **Línea 1 · PersonaLab**: identidad, liderazgo, cultura, crecimiento personal.
- **Línea 2 · Trascendencia**: historia familiar, propósito, memoria, legado.

Toda sub-marca queda avalada por y enraizada en 4 Meaning.

---

## 8. Radios de esquina (border-radius)

Solo dos valores en todo el sitio, sin excepciones:

| Uso | Valor |
|-----|-------|
| Botones, píldoras, chips, tags | `999px` (píldora completa) |
| Tarjetas y contenedores de foto | `10px` |

Cero radio (esquinas rectas) solo en cuadrículas tipo tabla con hairlines
entre celdas (ej. `.pillars`, `.steps` del home): ahí la línea recta es
intencional, forma parte del patrón de grid editorial, no un descuido.

## 9. Estilo visual

Amplio, sereno, con espacio para respirar. Se evitan composiciones saturadas o
condensadas. Énfasis en aire, escala y composición editorial. Fondos profundos
con tipografía clara; tintes del color rector para dar ritmo y jerarquía.
