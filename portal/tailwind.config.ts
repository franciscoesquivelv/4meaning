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

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal:      { DEFAULT: "var(--teal)", deep: "var(--teal-deep)", 2: "var(--teal-2)" },
        wine:      { DEFAULT: "var(--wine)", deep: "var(--wine-deep)", 2: "var(--wine-2)" },
        terra:     { DEFAULT: "var(--terra)", lo: "var(--terra-lo)" },
        gold:      "var(--gold)",
        ink:       "var(--ink)",
        gray:      "var(--gray)",
        paper:     { DEFAULT: "var(--paper)", 2: "var(--paper-2)" },
        line:      "var(--line)",
        alerta:    "var(--alerta)",
        bien:      "var(--bien)",

        // Dominancia por marca
        dom:  { DEFAULT: "var(--dom)", deep: "var(--dom-deep)" },
        sec:  "var(--sec)",

        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--sans)"],
        cormorant: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      letterSpacing: {
        cejilla: ".34em",
      },
      transitionTimingFunction: {
        marca: "cubic-bezier(.16, 1, .3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
