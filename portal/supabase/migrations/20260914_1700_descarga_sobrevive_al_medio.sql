-- ============================================================
-- ETAPA 4: LA BITÁCORA DE DESCARGA SOBREVIVE AL ARCHIVO
-- ============================================================
--
-- Hallazgo de Hugo, nombrado y no bloqueado en la Etapa 3: `media_descargas`
-- (ip, user_agent, quién y cuándo) tenía `on delete cascade` contra `media`.
-- Mientras el DELETE de medios era código muerto no importaba; ahora que el
-- editor lo usa de verdad, borrar un archivo purga su propio rastro de
-- licencia como efecto colateral, sin que nadie lo haya decidido a
-- propósito. Es exactamente el tipo de "se guarda y no se borra nunca...
-- salvo por accidente" que este proyecto viene evitando.
--
-- LA DECISIÓN: la bitácora sobrevive. Que alguien haya descargado un
-- archivo sigue siendo cierto después de que el archivo se borre, y es
-- justo en ese momento (el documento ya no existe) cuando el rastro de
-- quién lo tuvo importa más, no menos.
--
-- CÓMO. `media_id` pasa a nullable con `on delete set null`, en vez de
-- cascade. Pero un `media_id` en null sin más deja una fila que dice "un
-- perfil descargó algo" sin decir QUÉ: la mitad del valor de la bitácora
-- desaparece igual, solo que más tarde. Por eso se agrega `nombre_medio`,
-- una copia del nombre tomada en el momento de la descarga (no una
-- referencia, una copia: sobrevive aunque la fila de origen se borre
-- después). `pl_registrar_descarga` la llena sola; nada del lado de la
-- aplicación cambia.

alter table public.media_descargas
  drop constraint media_descargas_media_id_fkey;

alter table public.media_descargas
  alter column media_id drop not null;

alter table public.media_descargas
  add constraint media_descargas_media_id_fkey
  foreign key (media_id) references public.media(id) on delete set null;

alter table public.media_descargas
  add column if not exists nombre_medio text;

comment on column public.media_descargas.nombre_medio is
  'Copia del nombre del archivo, tomada en el momento de la descarga. Sobrevive al borrado de media (media_id queda en null) porque es copia, no referencia: sin esto, borrar el archivo dejaría una fila que solo dice que alguien descargó algo, sin decir qué.';

create or replace function public.pl_registrar_descarga(m uuid, ip_txt text, ua text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_nombre text;
begin
  if not coalesce(public.pl_puede_ver_medio(m), false) then
    raise exception 'Sin acceso a ese archivo.' using errcode = '42501';
  end if;

  select nombre into v_nombre from public.media where id = m;

  insert into public.media_descargas (media_id, profile_id, ip, user_agent, nombre_medio)
  values (m, auth.uid(), ip_txt, ua, v_nombre);
end;
$fn$;

comment on function public.pl_registrar_descarga(uuid, text, text) is
  'Registra una descarga. Guarda nombre_medio como copia del nombre en ese instante, para que la bitácora siga siendo legible si el archivo se borra después. Hallazgo de Hugo, cerrado en la Etapa 4.';

-- ── Verificación ─────────────────────────────────────────────
-- Backfill para las filas que ya existen: hoy no debería haber ninguna
-- (nadie ha descargado nada real todavía, el flujo es de esta etapa), pero
-- si las hay, se les copia el nombre desde el medio que todavía tienen.

update public.media_descargas d
set nombre_medio = m.nombre
from public.media m
where d.media_id = m.id
  and d.nombre_medio is null;

do $$
declare
  n_huerfanas int;
begin
  select count(*) into n_huerfanas
  from public.media_descargas
  where media_id is not null and nombre_medio is null;

  if n_huerfanas > 0 then
    raise exception 'Quedaron % filas de media_descargas con media_id pero sin nombre_medio tras el backfill.', n_huerfanas;
  end if;
end $$;
