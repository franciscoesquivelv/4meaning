import { notFound } from 'next/navigation'
import { experiencia } from '../../../dominio'
import Editor from './Editor'

export default function EditorPage({ params }: { params: { id: string } }) {
  const e = experiencia(params.id)
  if (!e) notFound()
  return <Editor experiencia={e} />
}
