-- ============================================================
-- Guardas que fallaban abiertas · segundo intento
-- ============================================================
--
-- POR QUÉ HAY UN SEGUNDO INTENTO. La migración anterior dijo "Success" pero
-- solo aplicó pl_es_equipo(). El diagnóstico lo demostró leyendo la
-- definición instalada: pl_abrir_borrador seguía con `if not is_staff()`.
--
-- La pista está en cuál sí pasó: pl_es_equipo tiene un cuerpo de UNA línea
-- sin ningún punto y coma adentro. Las otras tres tienen decenas. Eso es la
-- firma de un editor que parte el script por `;` sin respetar el cuerpo
-- delimitado por dollar-quote: las cortas sobreviven y las largas se rompen
-- en pedazos.
--
-- DOS DEFENSAS:
--   1. Etiquetas de dollar-quote con nombre, en vez de las anonimas.
--   2. Una comprobación al final que LEE la definición instalada y falla si
--      la corrección no quedó. Así "Success" no puede mentir.
--
-- SI ESTO VUELVE A FALLAR: corre cada bloque por separado, seleccionando el
-- texto de una función a la vez y ejecutando la selección.

-- ── 1 · Helper que nunca devuelve NULL ──────────────────────
-- is_staff() es `my_role() in (...)`. Sin sesión my_role() es NULL, y
-- `NULL in (...)` devuelve NULL, no false. En RLS eso es inofensivo porque
-- un USING nulo se trata como falso. En PL/pgSQL, `if not NULL then raise`
-- NO entra en la rama: la guarda se salta entera.

create or replace function public.pl_es_equipo()
returns boolean
language sql
security definer
set search_path = public
stable
as $fn$
  select coalesce(public.is_staff(), false)
$fn$;

-- ── 2 · Abrir borrador ──────────────────────────────────────

create or replace function public.pl_abrir_borrador(exp uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_origen uuid;
  v_nuevo  uuid;
  v_numero int;
begin
  if not public.pl_es_equipo() then
    raise exception 'Solo el equipo puede abrir un borrador.' using errcode = '42501';
  end if;

  select id into v_nuevo
  from public.experience_versions
  where experience_id = exp and estado = 'borrador'
  limit 1;

  if v_nuevo is not null then
    return v_nuevo;
  end if;

  select id into v_origen
  from public.experience_versions
  where experience_id = exp and estado = 'publicada'
  limit 1;

  select coalesce(max(numero), 0) + 1 into v_numero
  from public.experience_versions
  where experience_id = exp;

  insert into public.experience_versions (experience_id, numero, estado)
  values (exp, v_numero, 'borrador')
  returning id into v_nuevo;

  if v_origen is not null then
    insert into public.blocks (version_id, hinge_id, orden, tipo, audiencia, contenido, media_id)
    select v_nuevo, b.hinge_id, b.orden, b.tipo, b.audiencia, b.contenido, b.media_id
    from public.blocks b
    where b.version_id = v_origen;
  end if;

  return v_nuevo;
end;
$fn$;

-- ── 3 · Publicar versión ────────────────────────────────────

create or replace function public.pl_publicar_version(ver uuid)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_exp uuid;
  v_estado pl_estado_version;
  v_vacios int;
begin
  if not public.pl_es_equipo() then
    raise exception 'Solo el equipo puede publicar.' using errcode = '42501';
  end if;

  select experience_id, estado into v_exp, v_estado
  from public.experience_versions where id = ver;

  if v_exp is null then
    raise exception 'Esa versión no existe.' using errcode = '42704';
  end if;

  if v_estado <> 'borrador' then
    raise exception 'Solo se publica un borrador. Esta versión está en %.', v_estado
      using errcode = '22023';
  end if;

  select count(*) into v_vacios
  from public.hinges h
  where h.experience_id = v_exp
    and exists (select 1 from public.blocks b where b.hinge_id = h.id and b.version_id = ver)
    and not exists (
      select 1 from public.blocks b
      where b.hinge_id = h.id and b.version_id = ver and b.audiencia = 'todos'
    );

  if v_vacios > 0 then
    raise exception
      '% bisagra(s) quedarían en blanco para el participante: todos sus bloques son solo de moderador.', v_vacios
      using errcode = '22023';
  end if;

  update public.experience_versions
    set estado = 'retirada'
    where experience_id = v_exp and estado = 'publicada';

  update public.experience_versions
    set estado = 'publicada', publicada_at = now(), publicada_por = auth.uid()
    where id = ver;
end;
$fn$;

-- ── 4 · Registrar descarga ──────────────────────────────────

create or replace function public.pl_registrar_descarga(m uuid, ip_txt text, ua text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if not coalesce(public.pl_puede_ver_medio(m), false) then
    raise exception 'Sin acceso a ese archivo.' using errcode = '42501';
  end if;

  insert into public.media_descargas (media_id, profile_id, ip, user_agent)
  values (m, auth.uid(), ip_txt, ua);
end;
$fn$;

-- ── 5 · Comprobación que no se puede saltar ─────────────────
-- Lee la definición REALMENTE instalada. Si alguna función quedó con la
-- guarda vieja, esto falla y "Success" deja de poder mentir.

do $chk$
declare
  malas text;
begin
  select string_agg(p.proname, ', ' order by p.proname) into malas
  from pg_proc p
  join pg_namespace ns on ns.oid = p.pronamespace
  where ns.nspname = 'public'
    and p.proname in ('pl_abrir_borrador','pl_publicar_version')
    and pg_get_functiondef(p.oid) not like '%pl_es_equipo%';

  if malas is not null then
    raise exception
      'La corrección NO se aplicó a: %. El editor partió el script. Corre cada función por separado, seleccionando su texto y ejecutando la selección.',
      malas;
  end if;

  if public.pl_es_equipo() is null then
    raise exception 'pl_es_equipo devolvió NULL. La corrección no sirvió.';
  end if;

  raise notice 'Correcto: las guardas usan pl_es_equipo y fallan cerrado.';
end;
$chk$;

-- Confirmación visible, para no depender de los avisos.
select
  p.proname                                                as funcion,
  case when pg_get_functiondef(p.oid) like '%pl_es_equipo%'
       then '✅ guarda nueva' else '❌ guarda vieja' end   as estado
from pg_proc p
join pg_namespace ns on ns.oid = p.pronamespace
where ns.nspname = 'public'
  and p.proname in ('pl_es_equipo','pl_abrir_borrador','pl_publicar_version','pl_registrar_descarga')
order by p.proname;
