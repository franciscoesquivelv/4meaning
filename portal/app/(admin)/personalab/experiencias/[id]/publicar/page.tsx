import { notFound } from 'next/navigation'
import { experiencia } from '../../../dominio'
import Publicar from './Publicar'

export default function PublicarPage({ params }: { params: { id: string } }) {
  const e = experiencia(params.id)
  if (!e) notFound()
  return <Publicar experiencia={e} />
}
