import type { Config } from "tailwindcss";

// Los colores salen de las variables de app/globals.css, que a su vez
// vienen de /assets/brand.css. Escribirlos aqui otra vez seria crear una
// tercera copia de la paleta, que es exactamente el problema que esto
// resuelve.
//
// Con esto, `bg-wine-deep` o `text-terra` se vuelven clases normales de
// Tailwind, y `bg-[#C9A96E]` deja de tener excusa para existir.
//
// `dom`, `dom-deep` y `sec` son la DOMINANCIA por marca: la misma clase
// pinta vino dentro de Trascendencia y teal dentro de PersonaLab, segun
// la clase de marca que ponga el layout.
//
// POR QUE LOS COLORES PASAN POR `tono()` Y NO SON LA CADENA "var(--x)".
// Medido con el compilador de Tailwind 3.4.19, no supuesto: cuando un color
// se declara como la cadena `"var(--terra)"`, el modificador de opacidad NO
// GENERA NINGUNA REGLA. `bg-terra/10`, `border-terra/40` y `hover:bg-wine/90`
// no producian una sola linea de CSS y se caian en silencio. Habia 39 de
// esas clases muertas repartidas en 11 archivos.
//
// `tono()` devuelve el `var()` a secas cuando no hay modificador, y un
// `color-mix` cuando si lo hay. Ventaja sobre la alternativa (pasar las
// variables a canales `R G B`): no toca ni una variable, asi que los
// `style={{ color: 'var(--gray)' }}` y los `stroke="var(--terra)"` que ya
// existen en las pantallas siguen funcionando igual.
// El `as unknown as string` no esconde un error: Tailwind SI acepta una
// funcion como valor de color y la invoca con `opacityValue`, pero sus tipos
// declaran solo `string`, asi que el compilador rechaza la forma que el
// runtime usa. La asercion vive aqui, en una linea, y no repartida por el
// archivo.
const tono = (variable: string): string =>
  ((({ opacityValue }: { opacityValue?: string } = {}) =>
    opacityValue === undefined || String(opacityValue).includes("--tw-")
      ? `var(${variable})`
      : `color-mix(in srgb, var(${variable}) calc(${opacityValue} * 100%), transparent)`) as unknown as string)

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // `lib/` faltaba, y no es un detalle: una clase que solo se nombra en un
    // archivo de estilos compartido de lib/ NO se generaba. Medido en el
    // navegador, no deducido: la tarjeta del login salia transparente y el
    // texto de su boton salia negro puro, porque `bg-dom` y `text-dom-deep`
    // no existian en el CSS. Se veia como un descuido de diseno y era esto.
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal:      { DEFAULT: tono("--teal"), deep: tono("--teal-deep"), 2: tono("--teal-2") },
        wine:      { DEFAULT: tono("--wine"), deep: tono("--wine-deep"), 2: tono("--wine-2") },
        terra:     { DEFAULT: tono("--terra"), lo: tono("--terra-lo"), ui: tono("--terra-ui") },
        gold:      tono("--gold"),
        ink:       tono("--ink"),
        gray:      { DEFAULT: tono("--gray"), ui: tono("--gray-ui") },
        paper:     { DEFAULT: tono("--paper"), 2: tono("--paper-2") },
        line:      tono("--line"),
        // Filete sobre fondo profundo. La variable existe en globals.css desde
        // el 26 de agosto y no estaba expuesta, asi que las pantallas oscuras
        // no tenian con que dibujar un borde y escribian `border-white/10`.
        "line-dk": tono("--line-dk"),
        alerta:    tono("--alerta"),
        bien:      tono("--bien"),

        // Dominancia por marca
        dom:  { DEFAULT: tono("--dom"), deep: tono("--dom-deep") },
        sec:  tono("--sec"),

        background: tono("--background"),
        foreground: tono("--foreground"),
      },
      fontFamily: {
        sans: ["var(--sans)"],
        cormorant: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      letterSpacing: {
        cejilla: ".34em",
      },
      minHeight: {
        // Area minima de toque, medida en pantallas reales a 375px. Estaba
        // escrita a mano como `min-h-[44px]` pantalla por pantalla, que es un
        // tamano fuera del archivo de tokens. Aqui se decide una vez.
        toque: "44px",
      },
      transitionTimingFunction: {
        marca: "cubic-bezier(.16, 1, .3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
