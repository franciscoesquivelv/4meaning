-- ============================================================
-- ETAPA 5: EL BUCKET DE MEDIOS ADMITE AUDIO
-- ============================================================
--
-- El tipo `audio` existe en el esquema desde el 2026-09-11 y nunca pudo
-- subir un archivo real: ningún bucket de Storage tenía un mime de audio en
-- `allowed_mime_types`. El selector del editor (`SubirArchivo.tsx:35`) ya
-- declaraba qué mimes esperaba desde la Etapa 3 -- decidido, nunca
-- conectado. Esta migración lo conecta.
--
-- SE UNE A `personalab-medios`, no a un bucket propio. La alternativa (un
-- tercer bucket con techo más chico, más preciso para una voz grabada) se
-- consideró y se descartó: nada en este producto sube audio sin comprimir,
-- así que el techo de 200 MB de `medios` (puesto para video) nunca es un
-- bloqueo real para audio, solo más holgado de lo estrictamente necesario.
-- Un bucket nuevo es una pieza más que mantener (política, límite, RLS)
-- por una precisión que hoy nadie pidió. Se puede partir el día que un
-- caso real lo exija. Ver el mismo razonamiento en
-- `lib/personalab/medios.ts`.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('personalab-medios', 'personalab-medios', false, 209715200,
   array[
     'image/jpeg','image/png','image/webp','image/avif',
     'video/mp4','video/quicktime',
     'audio/mpeg','audio/mp4','audio/aac','audio/ogg','audio/webm'
   ])
on conflict (id) do update
  set file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types,
      public             = false;

-- ── Verificación ─────────────────────────────────────────────

do $$
declare
  v_tipos text[];
begin
  select allowed_mime_types into v_tipos
  from storage.buckets where id = 'personalab-medios';

  if not (v_tipos @> array['audio/mpeg','audio/mp4','audio/aac','audio/ogg','audio/webm']) then
    raise exception 'El bucket personalab-medios no quedó con los cinco mimes de audio esperados: %', v_tipos;
  end if;
end $$;
