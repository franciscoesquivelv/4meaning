// La unica superficie del portal que se abre sin cuenta: quien llega aqui
// puede no haber visto nunca nada de 4 Meaning, asi que esta pantalla es la
// marca entera para esa persona.
//
// Estaba en negro con crema, dos colores que no estan en ninguna paleta, y
// declaraba la familia tipografica como `var(--font-sans)`, una variable que
// no existe: la del sistema se llama `--sans` y ya la pone el body. Era una
// clase que no pintaba nada.
//
// Va en papel porque lo que se lee aqui es un documento, y `marca-trascendencia`
// fija la dominancia en vino para lo que haya dentro.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marca-trascendencia min-h-screen bg-paper text-ink">
      {children}
    </div>
  )
}
