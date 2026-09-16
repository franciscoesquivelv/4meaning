import { Titulo, EsqueletoTabla } from '../ui'

export default function Cargando() {
  return (
    <>
      <Titulo sub="Quién pagó, quién ya entró y quién sigue esperando su acceso.">
        Compras
      </Titulo>
      <EsqueletoTabla columnas={5} />
    </>
  )
}
