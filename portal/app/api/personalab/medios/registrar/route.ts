import { NextRequest, NextResponse } from 'next/server'
import { BUCKETS, exigirEquipo, servicio } from '@/lib/personalab/medios'

// Registra en `media` un archivo que ya subio el navegador. Se separa de la
// subida a proposito: si el navegador se cae a mitad, no queda una fila
// apuntando a un objeto que no existe.
//
// DOS HUECOS CERRADOS AQUÍ, los dos hallazgo de Hugo (auditoría de
// seguridad por adelantado, 2026-09-13), severidad alta los dos, y los dos
// seguían abiertos hasta que el editor empezó a escribir de verdad:
//
//   A1. `bucket` NO SE ACEPTA DEL CLIENTE. Antes se guardaba tal cual venía
//   en el cuerpo, y `[id]/route.ts` dereferencia `media.bucket` con el
//   cliente de SERVICIO. Cualquiera del equipo podía apuntar una fila de
//   `media` a cualquier bucket del proyecto. Ahora `bucket` se valida contra
//   la lista cerrada de `BUCKETS`: si no es uno de los dos que existen, se
//   rechaza antes de tocar Storage.
//
//   A2. `mime` y `bytes` NO SE GUARDAN COMO LOS DECLARA EL CLIENTE. Se leen
//   de `storage.info(path)`, que es la metadata que Storage mismo registró
//   al recibir el archivo. Antes eran texto libre del cuerpo del POST: un
//   cliente (o un bug) podía declarar "PDF, 200 KB" sobre un archivo que en
//   realidad es otra cosa, y esa mentira viajaba tal cual a la base y de ahí
//   a cualquier pantalla que confiara en `media.mime`/`media.peso_bytes`.

export async function POST(request: NextRequest) {
  const guardia = await exigirEquipo()
  if (guardia.error) {
    return NextResponse.json({ error: guardia.error }, { status: guardia.status })
  }

  let cuerpo: {
    bucket?: string; ruta?: string; nombre?: string
    descargable?: boolean
  }
  try {
    cuerpo = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 })
  }

  const { bucket, ruta, nombre, descargable } = cuerpo
  if (!bucket || !ruta || !nombre) {
    return NextResponse.json({ error: 'Faltan bucket, ruta o nombre.' }, { status: 400 })
  }

  const idsValidos = Object.values(BUCKETS).map(b => b.id) as string[]
  if (!idsValidos.includes(bucket)) {
    return NextResponse.json({ error: 'Ese bucket no existe.' }, { status: 400 })
  }

  const service = servicio()

  // El objeto tiene que existir de verdad, Y se lee SU metadata real, no la
  // que declaró el cliente. `info()` es del propio paquete instalado
  // (storage-js), pensado exactamente para esto.
  const { data: info, error: errorInfo } = await service.storage.from(bucket).info(ruta)
  if (errorInfo || !info) {
    return NextResponse.json({ error: 'Ese archivo no está en el almacén.' }, { status: 409 })
  }

  const { data, error } = await service
    .from('media')
    .insert({
      bucket,
      path: ruta,
      nombre,
      mime: info.contentType ?? null,
      peso_bytes: info.size ?? null,
      // Descargable es del moderador. Lo que se entrega al participante se
      // recibe, no se descarga.
      descargable: bucket === BUCKETS.documentos.id ? (descargable ?? true) : false,
      subido_por: guardia.user!.id,
    })
    .select('id, nombre, peso_bytes, descargable')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
