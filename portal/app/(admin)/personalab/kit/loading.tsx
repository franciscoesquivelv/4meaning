import { Titulo, EsqueletoTabla } from '../ui'

export default function Cargando() {
  return (
    <>
      {/* El título ya se sabe, así que se pinta desde el primer frame. Un
          encabezado que parpadea se siente peor que una espera. */}
      <Titulo>Kit</Titulo>
      <EsqueletoTabla columnas={5} />
    </>
  )
}
