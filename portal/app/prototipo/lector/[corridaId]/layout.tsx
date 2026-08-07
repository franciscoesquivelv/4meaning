// El lector es un MODO, no una seccion. Sin barra inferior fija: la del
// participante de Trascendencia son 64px mas pb-24, que roban 96 de 812,
// un 12 por ciento de la pantalla, para navegar entre secciones que aqui no
// se usan. Se sale por la flecha o por la hoja de ruta.

export default function LectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[#FAF8F4]"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      {children}
    </div>
  )
}
