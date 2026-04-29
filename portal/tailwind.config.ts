import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
      },
      colors: {
        // Trascendencia design system
        bg:       '#0a0a0a',
        surface:  '#141414',
        surface2: '#1c1c1c',
        border:   '#272727',
        'border-hi': '#3a3a3a',
        ink:      '#f8f7f5',
        muted:    '#666666',
        // Status
        success:  '#4ade80',
        warning:  '#facc15',
        error:    '#f87171',
        info:     '#60a5fa',
      },
      screens: {
        xs: '390px',
      },
      borderRadius: {
        DEFAULT: '6px',
      },
    },
  },
  plugins: [],
}

export default config
