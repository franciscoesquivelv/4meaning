import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trascendencia — Materiales',
}

export default function ImprimirLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #f8f8f8; font-family: Georgia, 'Times New Roman', serif; }
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
            @page { margin: 0; size: letter portrait; }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
