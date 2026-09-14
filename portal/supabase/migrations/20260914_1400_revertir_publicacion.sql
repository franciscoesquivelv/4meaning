-- ============================================================
-- ETAPA 3: DESHACER UNA PUBLICACIÓN
-- ============================================================
--
-- Hugo lo marcó como bloqueo explícito antes de que el editor escribiera de
-- verdad: "publicar no es reversible... es de los dos únicos casos donde un
-- solo clic no tiene vuelta atrás." Hoy es exactamente ese momento: el
-- editor real empieza a escribir en esta etapa, así que esto se construye
-- antes, no después.
--
-- QUÉ HACE. Vuelve la versión publicada de hoy a 'retirada', y la que
-- estaba retirada antes (la más reciente por número) vuelve a 'publicada'.
-- Es el mismo movimiento que `pl_publicar_version`, en sentido contrario, y
-- reusa exactamente su misma disciplina: mismo guardia de equipo, mismo
-- índice único que impide dos publicadas a la vez, atómico en una sola
-- función.
--
-- LO QUE NO HACE, dicho para que no se dé por sentado: no toca bookmarks ni
-- el ancla de nadie que esté leyendo. Alguien anclado a la versión que
-- ACABA de volver a publicarse la sigue leyendo sin darse cuenta de nada,
-- por el mismo mecanismo de la Etapa 2 (`pl_puede_ver_version`, publicada o
-- retirada+anclada). Alguien anclado a la versión que se retira con este
-- revertir tampoco pierde acceso: sigue siendo 'retirada', solo que ahora
-- ninguna otra persona la ve como la actual.

create or replace function public.pl_revertir_version(exp uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_actual   uuid;
  v_anterior uuid;
begin
  if not public.pl_es_equipo() then
    raise exception 'Solo el equipo puede revertir una publicación.' using errcode = '42501';
  end if;

  select id into v_actual
  from public.experience_versions
  where experience_id = exp and estado = 'publicada';

  if v_actual is null then
    raise exception 'No hay ninguna versión publicada para revertir.' using errcode = '22023';
  end if;

  select id into v_anterior
  from public.experience_versions
  where experience_id = exp and estado = 'retirada'
  order by numero desc
  limit 1;

  if v_anterior is null then
    raise exception 'No hay ninguna versión anterior a la cual volver.' using errcode = '22023';
  end if;

  -- Primero se retira la actual, DESPUÉS se publica la anterior: en ese
  -- orden, nunca hay un instante con dos versiones publicadas ni con cero.
  -- El índice único (`experience_versions_una_publicada`) lo haría fallar
  -- igual si el orden fuera al revés, así que esto no depende de la
  -- disciplina del orden para ser correcto, pero es la forma legible.
  update public.experience_versions
    set estado = 'retirada'
    where id = v_actual;

  update public.experience_versions
    set estado = 'publicada', publicada_at = now(), publicada_por = auth.uid()
    where id = v_anterior;

  return v_anterior;
end;
$fn$;

comment on function public.pl_revertir_version(uuid) is
  'Deshace la última publicación: la versión publicada vuelve a retirada, y la retirada más reciente vuelve a publicada. Hermana de pl_publicar_version, construida junto con ella por el mismo motivo: sin esto, un clic de publicar no tenía vuelta atrás. Hallazgo de Hugo, cerrado en la Etapa 3.';
