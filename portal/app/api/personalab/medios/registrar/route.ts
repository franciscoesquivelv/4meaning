import { NextRequest, NextResponse } from 'next/server'
import { exigirEquipo, servicio } from '@/lib/personalab/medios'

// Registra en `media` un archivo que ya subio el navegador. Se separa de la
// subida a proposito: si el navegador se cae a mitad, no queda una fila
// apuntando a un objeto que no existe.
//
// Verifica que el objeto EXISTA antes de registrarlo. Sin eso, cualquiera
// del equipo podria inventar una ruta.

export async function POST(request: NextRequest) {
  const guardia = await exigirEquipo()
  if (guardia.error) {
    return NextResponse.json({ error: guardia.error }, { status: guardia.status })
  }

  let cuerpo: {
    bucket?: string; ruta?: string; nombre?: string
    mime?: string; bytes?: number; descargable?: boolean
  }
  try {
    cuerpo = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 })
  }

  const { bucket, ruta, nombre, mime, bytes, descargable } = cuerpo
  if (!bucket || !ruta || !nombre) {
    return NextResponse.json({ error: 'Faltan bucket, ruta o nombre.' }, { status: 400 })
  }

  const service = servicio()

  // El objeto tiene que existir de verdad.
  const carpeta = ruta.includes('/') ? ruta.slice(0, ruta.lastIndexOf('/')) : ''
  const archivo = ruta.slice(ruta.lastIndexOf('/') + 1)
  const { data: listado } = await service.storage.from(bucket).list(carpeta, { search: archivo })
  if (!listado || listado.length === 0) {
    return NextResponse.json({ error: 'Ese archivo no está en el almacén.' }, { status: 409 })
  }

  const { data, error } = await service
    .from('media')
    .insert({
      bucket,
      path: ruta,
      nombre,
      mime: mime ?? null,
      peso_bytes: bytes ?? null,
      // Descargable es del moderador. Lo que se entrega al participante se
      // recibe, no se descarga.
      descargable: bucket === 'personalab-documentos' ? (descargable ?? true) : false,
      subido_por: guardia.user!.id,
    })
    .select('id, nombre, peso_bytes, descargable')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
