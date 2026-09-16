import { Titulo, EsqueletoTabla } from '../ui'

export default function Cargando() {
  return (
    <>
      <Titulo sub="Por dónde va cada quien, no cuánto le falta.">
        Progreso
      </Titulo>
      <EsqueletoTabla columnas={4} />
    </>
  )
}
