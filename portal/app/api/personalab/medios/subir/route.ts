import { NextRequest, NextResponse } from 'next/server'
import { BUCKETS, bucketPara, motivoRechazo, exigirEquipo, servicio } from '@/lib/personalab/medios'

// Emite una URL firmada de SUBIDA. El archivo va del navegador a Storage sin
// pasar por el servidor de Next, que tiene limite de cuerpo y timeout.
//
// El limite se valida aqui ADEMAS de en el bucket. El del bucket es la
// verdad; este es el que permite dar un mensaje util en vez de un error
// crudo a mitad de la subida.

export async function POST(request: NextRequest) {
  const guardia = await exigirEquipo()
  if (guardia.error) {
    return NextResponse.json({ error: guardia.error }, { status: guardia.status })
  }

  let cuerpo: { nombre?: string; mime?: string; bytes?: number }
  try {
    cuerpo = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 })
  }

  const { nombre, mime, bytes } = cuerpo
  if (!nombre || !mime || typeof bytes !== 'number') {
    return NextResponse.json({ error: 'Faltan nombre, mime o bytes.' }, { status: 400 })
  }

  const rechazo = motivoRechazo(mime, bytes)
  if (rechazo) {
    return NextResponse.json({ error: rechazo }, { status: 422 })
  }

  const bucket = bucketPara(mime)!
  const id = crypto.randomUUID()
  // El nombre original se guarda en la fila de media, no en la ruta: un
  // nombre de archivo puede traer acentos, espacios y datos de la persona.
  const extension = nombre.includes('.') ? nombre.split('.').pop()!.toLowerCase() : 'bin'
  const ruta = `${id}.${extension}`

  const service = servicio()
  const { data, error } = await service.storage
    .from(BUCKETS[bucket].id)
    .createSignedUploadUrl(ruta)

  if (error) {
    return NextResponse.json({ error: 'No se pudo preparar la subida.' }, { status: 500 })
  }

  return NextResponse.json({
    bucket: BUCKETS[bucket].id,
    ruta,
    token: data.token,
    signedUrl: data.signedUrl,
  })
}
