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
//
// DOS FORMAS DE RESPONDER, Y ES A PROPÓSITO. Por defecto, esta ruta
// REDIRIGE (307) a la URL firmada: así `<img src>`, `<video src>` y
// `<audio src>` la usan directo, sin JavaScript de por medio, porque el
// navegador sigue el redirect solo. Antes SIEMPRE devolvía JSON, y
// `almacenRemoto.ts` guardaba esa URL de JSON tal cual dentro del bloque: un
// bloque de imagen o video apuntaba a un endpoint que nunca sirve una
// imagen. Hallazgo de Leo, semanas atrás, nunca cerrado porque nada escribía
// `media_id` todavía. Con `?descargar=1` sigue devolviendo JSON: esa rama
// necesita el nombre del archivo para forzar la descarga y confirmar que la
// bitácora se escribió antes de que el navegador se vaya, y eso un redirect
// no lo permite verificar del lado del cliente.

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
    return NextResponse.json({
      url: firmada.signedUrl,
      nombre: medio.nombre,
      expiraEn: VIDA_SEGUNDOS,
    })
  }

  // El caso normal, el que usan img/video/audio: redirect directo al
  // archivo real. 307 y no 302, para que un POST (si alguna vez lo hay)
  // no se convierta en GET en el salto.
  return NextResponse.redirect(firmada.signedUrl, 307)
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

  // PRIMERO LA FILA, DESPUÉS EL OBJETO. Al revés estaba antes, con el
  // razonamiento de que así no quedaba un archivo huérfano en el bucket —
  // cierto en aislamiento, pero incompleto: `blocks.media_id` es
  // `on delete set null`, y el CHECK `blocks_contenido_por_tipo` exige
  // `media_id is not null` para los tipos `archivo` e `imagen`. Si esta fila
  // todavía la usa un bloque de esos, el `set null` viola el CHECK, el
  // DELETE de la fila FALLA, y con el orden viejo el objeto YA SE HABÍA
  // BORRADO: fila viva apuntando a un archivo que ya no existe, bloque roto,
  // 500 con el error crudo de Postgres. Hallazgo de Hugo. Con este orden, si
  // la fila no se puede borrar, el objeto ni se toca: el estado inconsistente
  // deja de ser posible.
  const { error } = await service.from('media').delete().eq('id', params.id)
  if (error) {
    const enUso = error.code === '23514' // violación de CHECK
    return NextResponse.json(
      {
        error: enUso
          ? 'Este archivo todavía lo usa un bloque que lo necesita. Quítalo del bloque primero.'
          : error.message,
      },
      { status: enUso ? 409 : 500 }
    )
  }

  // La fila ya no existe: para quien pregunta, esto se borró. Pero si
  // Storage no pudo quitar el objeto, decirlo importa, aunque no haya nada
  // que deshacer — el hallazgo era que el error se ignoraba en silencio.
  // No es nuevo de este cambio (ya faltaba antes), pero antes esta ruta
  // era código muerto y ahora es alcanzable. Hallazgo de Hugo.
  const { error: errorStorage } = await service.storage.from(medio.bucket).remove([medio.path])
  if (errorStorage) {
    return NextResponse.json({
      ok: true,
      aviso: 'El registro se borró, pero el archivo pudo haber quedado en el almacén. No afecta a nadie: ya no hay ningún bloque que lo use.',
    })
  }
  return NextResponse.json({ ok: true })
}
