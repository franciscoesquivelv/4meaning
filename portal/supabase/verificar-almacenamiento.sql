-- ============================================================
-- VERIFICACIÓN · Almacenamiento, concurrencia y publicación
-- ============================================================
--
-- Sin tablas temporales: son la parte frágil, porque dependen de que la
-- sesión sobreviva entre sentencias y eso no está garantizado en el editor.
-- Aquí todo vive en una función que DEVUELVE la tabla, y el script termina
-- con un solo select.
--
-- Si ves "Success. No rows returned", corriste otro archivo: este siempre
-- devuelve 11 filas.
--
-- Corre DESPUÉS de:
--   migrations/20260813_personalab_almacenamiento.sql
--   migrations/20260813_fix_guardas_fallan_abiertas.sql
--
-- No deja cambios en la base. Al terminar puedes borrar la función:
--   drop function public.pl_pruebas_almacenamiento();

create or replace function public.pl_pruebas_almacenamiento()
returns table (n int, prueba text, resultado text, esperado text, veredicto text)
language plpgsql
as $$
declare
  id_b uuid; rev_antes int; rev_despues int;
  id_exp uuid; id_ver uuid; id_h uuid; id_super uuid;
  rechazo boolean;
  v_bool boolean;
begin
  -- ── Buckets ───────────────────────────────────────────────
  return query
  select 1, 'Bucket personalab-medios existe y es PRIVADO'::text,
    case when count(*) = 0 then 'no existe' when bool_or(b.public) then 'PÚBLICO' else 'privado' end::text,
    'privado'::text,
    case when count(*) = 1 and not bool_or(b.public) then '✅' else '❌' end::text
  from storage.buckets b where b.id = 'personalab-medios';

  return query
  select 2, 'Bucket personalab-documentos existe y es PRIVADO'::text,
    case when count(*) = 0 then 'no existe' when bool_or(b.public) then 'PÚBLICO' else 'privado' end::text,
    'privado'::text,
    case when count(*) = 1 and not bool_or(b.public) then '✅' else '❌' end::text
  from storage.buckets b where b.id = 'personalab-documentos';

  return query
  select 3, 'Los buckets NO tienen política de lectura abierta'::text,
    count(*)::text, '0'::text,
    case when count(*) = 0 then '✅' else '❌ hay una puerta lateral' end::text
  from pg_policies
  where schemaname = 'storage' and tablename = 'objects' and qual like '%personalab%';

  -- ── Concurrencia ──────────────────────────────────────────
  return query
  select 4, 'Columna rev en blocks y experience_versions'::text,
    count(*)::text, '2'::text,
    case when count(*) = 2 then '✅' else '❌' end::text
  from information_schema.columns
  where table_schema='public' and column_name='rev'
    and table_name in ('blocks','experience_versions');

  return query
  select 5, 'Trigger subir_rev en las dos tablas'::text,
    count(*)::text, '2'::text,
    case when count(*) = 2 then '✅' else '❌' end::text
  from pg_trigger
  where tgname = 'subir_rev'
    and tgrelid in ('public.blocks'::regclass, 'public.experience_versions'::regclass);

  -- ── Funciones ─────────────────────────────────────────────
  return query
  select 6, 'Las cuatro funciones existen'::text,
    count(*)::text, '4'::text,
    case when count(*) = 4 then '✅' else '❌' end::text
  from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
  where ns.nspname = 'public'
    and p.proname in ('pl_abrir_borrador','pl_publicar_version','pl_registrar_descarga','pl_es_equipo');

  return query
  select 7, 'Registro de descargas con RLS activa'::text,
    case when count(*) = 0 then 'falta la tabla'
         when bool_or(t.rowsecurity) then 'con RLS' else 'SIN RLS' end::text,
    'con RLS'::text,
    case when count(*) = 1 and bool_or(t.rowsecurity) then '✅' else '❌' end::text
  from pg_tables t where t.schemaname='public' and t.tablename='media_descargas';

  -- ── 8 · El trigger sube rev de verdad ─────────────────────
  select b.id, b.rev into id_b, rev_antes from public.blocks b limit 1;

  if id_b is null then
    return query select 8, 'El trigger sube rev al editar'::text,
      'sin bloques'::text, 'sembrar primero'::text, 'ℹ️ omitida'::text;
  else
    begin
      update public.blocks set orden = orden where id = id_b;
      select b.rev into rev_despues from public.blocks b where b.id = id_b;
      raise exception using errcode = 'ZZ999', message = '__deshacer__';
    exception
      when sqlstate 'ZZ999' then null;
      when others then rev_despues := rev_antes;
    end;
    return query select 8, 'El trigger sube rev al editar un bloque'::text,
      format('%s → %s', rev_antes, rev_despues)::text, 'sube en 1'::text,
      case when rev_despues = rev_antes + 1 then '✅' else '❌' end::text;
  end if;

  -- ── 9 · La compuerta de publicación rechaza ───────────────
  select e.id into id_exp from public.experiences e where e.slug = 'presente-regalo';
  select h.id into id_h  from public.hinges h where h.experience_id = id_exp limit 1;
  select p.id into id_super from public.profiles p where p.role = 'super_admin' limit 1;

  if id_exp is null or id_super is null then
    return query select 9, 'Rechaza publicar una bisagra en blanco'::text,
      'faltan datos'::text, 'sembrar y tener super admin'::text, 'ℹ️ omitida'::text;
  else
    -- Suplantar a un super admin: si no, rechazaría por PERMISOS y no
    -- estaríamos probando la compuerta de contenido, que es el punto.
    perform set_config('request.jwt.claims', json_build_object('sub', id_super)::text, true);
    rechazo := false;
    begin
      insert into public.experience_versions (experience_id, numero, estado)
      values (id_exp, 9999, 'borrador') returning id into id_ver;

      insert into public.blocks (version_id, hinge_id, orden, tipo, audiencia, contenido)
      values (id_ver, id_h, 1, 'nota', 'moderador', '{"texto":"solo para mí"}'::jsonb);

      perform public.pl_publicar_version(id_ver);
      rechazo := false;
      raise exception using errcode = 'ZZ999', message = '__deshacer__';
    exception
      when sqlstate 'ZZ999' then null;
      when others then rechazo := true;
    end;
    return query select 9,
      'Rechaza publicar una bisagra que el participante vería en blanco'::text,
      case when rechazo then 'rechazada' else 'PUBLICADA' end::text, 'rechazada'::text,
      case when rechazo then '✅' else '❌' end::text;
  end if;

  -- ── 10 · La guarda de permisos falla CERRADO ──────────────
  -- El defecto real que encontró la prueba 9: is_staff() devuelve NULL sin
  -- sesión, y `if not NULL` no entra en la rama.
  perform set_config('request.jwt.claims', '', true);
  rechazo := false;
  begin
    perform public.pl_abrir_borrador(id_exp);
    rechazo := false;
    raise exception using errcode = 'ZZ999', message = '__deshacer__';
  exception
    when sqlstate 'ZZ999' then null;
    when others then rechazo := true;
  end;
  return query select 10, 'Sin sesión, abrir borrador se rechaza'::text,
    case when rechazo then 'rechazado' else 'LO DEJÓ PASAR' end::text, 'rechazado'::text,
    case when rechazo then '✅' else '❌ la guarda falla abierta' end::text;

  -- ── 11 · pl_es_equipo nunca es NULL ───────────────────────
  select public.pl_es_equipo() into v_bool;
  return query select 11, 'pl_es_equipo nunca devuelve NULL'::text,
    coalesce(v_bool::text, 'NULL')::text, 'false'::text,
    case when v_bool is not null then '✅' else '❌' end::text;
end;
$$;

-- Limpieza por si algo sobrevivió de una corrida anterior.
delete from public.blocks
  where version_id in (select id from public.experience_versions where numero = 9999);
delete from public.experience_versions where numero = 9999;

-- ── EL RESULTADO. Este select SIEMPRE devuelve 11 filas. ────
select * from public.pl_pruebas_almacenamiento() order by n;
