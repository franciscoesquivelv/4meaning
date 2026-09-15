-- ============================================================
-- ETAPA 5: LA DESCARGA DEL PARTICIPANTE NO DEJA IP NI NAVEGADOR
-- ============================================================
--
-- Decisión de Francisco, 2026-09-13 (documento de las once decisiones de
-- "El Presente como Regalo" digital): "descargable es del moderador" se
-- jubila para el producto digital -- al participante sí se le puede pedir
-- que descargue su hoja de trabajo. Consecuencia que la misma decisión ya
-- dejó escrita: esa descarga NO registra IP ni navegador, porque
-- `media_descargas` los guarda para siempre y sin ningún camino de
-- borrado (cero políticas `for delete` en todo el proyecto, hallazgo
-- repetido de Hugo), y eso contradice lo que se le promete a la persona:
-- "lo guardamos, es tuyo".
--
-- LA DISTINCIÓN NO ES POR ARCHIVO, ES POR QUIÉN DESCARGA. `media.descargable`
-- y `blocks.audiencia` son propiedades del CONTENIDO: dicen si un archivo
-- se puede forzar a descargar y quién puede VERLO, pero un moderador y un
-- participante pueden descargar el mismo archivo `descargable`, y hoy los
-- dos quedan registrados igual. Lo único que distingue a quien pide, en el
-- momento en que pide, es su nivel real: `pl_nivel_audiencia()`, que ya
-- existe y ya separa equipo (3), moderador (2) y cualquier otro grant vivo
-- -- miembro de foro o comprador individual -- (1).
--
-- LA REGLA: nivel 2 y 3 sí dejan rastro (moderador y equipo: es su propia
-- descarga de trabajo, y saber quién entregó qué le sigue sirviendo al
-- equipo). Nivel 1 -- un participante, sea del foro o del producto digital
-- solo -- no deja IP ni navegador. `profile_id` y `nombre_medio` se
-- guardan igual: la persona sigue siendo dueña de saber qué descargó y
-- cuándo, lo que se retira es el rastro técnico que nadie le prometió
-- guardar.

create or replace function public.pl_registrar_descarga(m uuid, ip_txt text, ua text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_nombre text;
  v_experiencia uuid;
  v_nivel int;
begin
  if not coalesce(public.pl_puede_ver_medio(m), false) then
    raise exception 'Sin acceso a ese archivo.' using errcode = '42501';
  end if;

  select nombre into v_nombre from public.media where id = m;

  -- Misma condición de join que pl_puede_ver_medio: si el chequeo de arriba
  -- pasó, esta consulta encuentra al menos una fila, así que v_experiencia
  -- nunca llega null a pl_nivel_audiencia.
  select v.experience_id into v_experiencia
  from public.blocks b
  join public.experience_versions v on v.id = b.version_id
  where b.media_id = m
  limit 1;

  v_nivel := public.pl_nivel_audiencia(v_experiencia);

  insert into public.media_descargas (media_id, profile_id, ip, user_agent, nombre_medio)
  values (
    m,
    auth.uid(),
    case when v_nivel >= 2 then ip_txt else null end,
    case when v_nivel >= 2 then ua else null end,
    v_nombre
  );
end;
$fn$;

comment on function public.pl_registrar_descarga(uuid, text, text) is
  'Registra una descarga. Nivel 2+ (moderador, equipo) deja IP y navegador; nivel 1 (participante) no, por decisión de privacidad del 2026-09-13. profile_id y nombre_medio se guardan siempre. Hallazgo cerrado en la Etapa 5.';
