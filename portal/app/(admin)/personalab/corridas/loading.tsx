import { Titulo, EsqueletoTabla } from '../ui'

export default function Cargando() {
  return (
    <>
      {/* El título ya se sabe, así que se pinta desde el primer frame. Un
          encabezado que parpadea se siente peor que una espera. */}
      <Titulo>Corridas</Titulo>
      <EsqueletoTabla columnas={4} />
    </>
  )
}
