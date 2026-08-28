import type { Metadata } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import NavigationProgress from '@/components/NavigationProgress'

// DM Sans salió. No es de la marca: la sans de 4 Meaning es Avenir Next, y
// como no es fuente web libre el sistema de marca usa el stack de Helvetica
// Neue, que además no carga nada de fuera. Vive en `--sans`, en globals.css.
//
// Cormorant se queda, con su papel del sistema de marca: citas, manifiestos
// y momentos profundos. Nunca navegación, botones ni etiquetas.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Trascendencia · 4 Meaning',
  description: 'Tu retiro, antes, durante y después.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Trascendencia',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        {/* Vino profundo, que es el color de Trascendencia. Antes era
            #111111, que no está en ninguna paleta de la marca. Es el color
            que pinta la barra del sistema cuando la app corre instalada. */}
        <meta name="theme-color" content="#2B080E" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Trascendencia" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={cormorant.variable}>
        <NavigationProgress />
        {children}
      </body>
    </html>
  )
}
