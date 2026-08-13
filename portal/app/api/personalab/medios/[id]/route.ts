import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { exigirEquipo } from '@/lib/personalab/medios'

// Lectura firmada. Esta es la puerta unica: nadie llega a Storage sin pasar
// por aqui, porque los dos buckets son privados y no tienen politica de
// lectura para nadie.
//
// DEVUELVE 404, NO 403, cuando no hay acceso. Un 403 confirma que el archivo
// existe, y con eso se puede sondear el catalogo entero preguntando por ids.
// El 404 no distingue entre "no existe" y "no es tuyo", que es justo lo que
// se quiere.

const VIDA_SEGUNDOS = 300

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })

  // La regla de audiencia vive en la base, no aqui. pl_puede_ver_medio
  // compara el peso de la audiencia del bloque contra el nivel de la
  // persona sobre esa experiencia.
  const { data: puede, error: errorPermiso } = await supabase
    .rpc('pl_puede_ver_medio', { m: params.id })

  if (errorPermiso || puede !== true) {
    return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })
  }

  const service = createServiceClient()
  const { data: medio } = await service
    .from('media')
    .select('bucket, path, nombre, descargable')
    .eq('id', params.id)
    .single()

  if (!medio) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })

  const quiereDescargar = request.nextUrl.searchParams.get('descargar') === '1'

  // Solo se descarga lo que esta marcado como descargable, y eso solo
  // existe en el bucket de documentos.
  if (quiereDescargar && !medio.descargable) {
    return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })
  }

  const { data: firmada, error } = await service.storage
    .from(medio.bucket)
    .createSignedUrl(medio.path, VIDA_SEGUNDOS,
      quiereDescargar ? { download: medio.nombre } : undefined)

  if (error || !firmada) {
    return NextResponse.json({ error: 'No se pudo abrir el archivo.' }, { status: 500 })
  }

  if (quiereDescargar) {
    // Un guion de sala licenciado a un capitulo deja rastro.
    await supabase.rpc('pl_registrar_descarga', {
      m: params.id,
      ip_txt: request.headers.get('x-forwarded-for') ?? null,
      ua: request.headers.get('user-agent') ?? null,
    })
  }

  return NextResponse.json({
    url: firmada.signedUrl,
    nombre: medio.nombre,
    expiraEn: VIDA_SEGUNDOS,
  })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guardia = await exigirEquipo()
  if (guardia.error) {
    return NextResponse.json({ error: guardia.error }, { status: guardia.status })
  }

  const service = createServiceClient()
  const { data: medio } = await service
    .from('media').select('bucket, path').eq('id', params.id).single()

  if (!medio) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })

  // Primero el objeto, despues la fila. Al reves quedaria un archivo
  // huerfano en el bucket que nadie sabe que existe.
  await service.storage.from(medio.bucket).remove([medio.path])
  const { error } = await service.from('media').delete().eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
