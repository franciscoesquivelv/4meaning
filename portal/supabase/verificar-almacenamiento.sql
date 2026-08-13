-- ============================================================
-- VERIFICACIÓN · Almacenamiento, concurrencia y publicación
-- ============================================================
-- Una sola tabla al final. No deja cambios en la base.

create temp table if not exists pruebas_alm (
  n int, prueba text, resultado text, esperado text, veredicto text
);
truncate pruebas_alm;

-- ── Buckets ─────────────────────────────────────────────────

insert into pruebas_alm
select 1, 'Bucket personalab-medios existe y es PRIVADO',
  case when count(*) = 0 then 'no existe'
       when bool_or(public) then 'PÚBLICO' else 'privado' end,
  'privado',
  case when count(*) = 1 and not bool_or(public) then '✅' else '❌' end
from storage.buckets where id = 'personalab-medios';

insert into pruebas_alm
select 2, 'Bucket personalab-documentos existe y es PRIVADO',
  case when count(*) = 0 then 'no existe'
       when bool_or(public) then 'PÚBLICO' else 'privado' end,
  'privado',
  case when count(*) = 1 and not bool_or(public) then '✅' else '❌' end
from storage.buckets where id = 'personalab-documentos';

insert into pruebas_alm
select 3, 'Los buckets NO tienen política de lectura abierta',
  count(*)::text, '0',
  case when count(*) = 0 then '✅' else '❌ hay una puerta lateral' end
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and qual like '%personalab%';

-- ── Concurrencia ────────────────────────────────────────────

insert into pruebas_alm
select 4, 'Columna rev en blocks y experience_versions',
  count(*)::text, '2',
  case when count(*) = 2 then '✅' else '❌' end
from information_schema.columns
where table_schema='public' and column_name='rev'
  and table_name in ('blocks','experience_versions');

insert into pruebas_alm
select 5, 'Trigger subir_rev instalado en las dos tablas',
  count(*)::text, '2',
  case when count(*) = 2 then '✅' else '❌' end
from pg_trigger
where tgname = 'subir_rev'
  and tgrelid in ('public.blocks'::regclass, 'public.experience_versions'::regclass);

-- ── Funciones ───────────────────────────────────────────────

insert into pruebas_alm
select 6, 'Las tres funciones nuevas existen',
  count(*)::text, '3',
  case when count(*) = 3 then '✅' else '❌' end
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('pl_abrir_borrador','pl_publicar_version','pl_registrar_descarga');

insert into pruebas_alm
select 7, 'Registro de descargas con RLS activa',
  case when count(*) = 0 then 'falta la tabla'
       when bool_or(rowsecurity) then 'con RLS' else 'SIN RLS' end,
  'con RLS',
  case when count(*) = 1 and bool_or(rowsecurity) then '✅' else '❌' end
from pg_tables where schemaname='public' and tablename='media_descargas';

-- ── El trigger de rev sube de verdad ────────────────────────

do $$
declare
  id_b uuid; rev_antes int; rev_despues int;
begin
  select id, rev into id_b, rev_antes from public.blocks limit 1;

  if id_b is null then
    insert into pruebas_alm values (8, 'El trigger sube rev al editar',
      'sin bloques', 'sembrar primero', 'ℹ️ omitida');
    return;
  end if;

  begin
    update public.blocks set orden = orden where id = id_b;
    select rev into rev_despues from public.blocks where id = id_b;
    raise exception using errcode = 'P0001', message = '__deshacer__';
  exception
    when sqlstate 'P0001' then null;
    when others then rev_despues := rev_antes;
  end;

  insert into pruebas_alm values (8,
    'El trigger sube rev al editar un bloque',
    format('%s → %s', rev_antes, rev_despues),
    'sube en 1',
    case when rev_despues = rev_antes + 1 then '✅' else '❌' end);
end $$;

-- ── La compuerta de publicación rechaza de verdad ───────────
-- pl_publicar_version revalida que ninguna bisagra quede en blanco para el
-- participante. La compuerta de la aplicación se puede saltar llamando la
-- RPC directo; esta es la última línea.

do $$
declare
  id_exp uuid; id_ver uuid; id_h uuid; rechazo boolean := false;
begin
  select id into id_exp from public.experiences where slug = 'presente-regalo';
  select id into id_h from public.hinges where experience_id = id_exp limit 1;

  begin
    -- Un borrador con una bisagra donde todo es solo de moderador.
    insert into public.experience_versions (experience_id, numero, estado)
    values (id_exp, 9999, 'borrador') returning id into id_ver;

    insert into public.blocks (version_id, hinge_id, orden, tipo, audiencia, contenido)
    values (id_ver, id_h, 1, 'nota', 'moderador', '{"texto":"solo para mí"}'::jsonb);

    perform public.pl_publicar_version(id_ver);
    rechazo := false;                    -- lo dejó publicar: mal
    raise exception using errcode = 'P0001', message = '__deshacer__';
  exception
    when sqlstate 'P0001' then null;
    when others then rechazo := true;    -- lo rechazó: bien
  end;

  insert into pruebas_alm values (9,
    'Rechaza publicar una bisagra que el participante vería en blanco',
    case when rechazo then 'rechazada' else 'PUBLICADA' end,
    'rechazada',
    case when rechazo then '✅' else '❌' end);
end $$;

-- Limpieza por si algo sobrevivió al deshacer.
delete from public.blocks
  where version_id in (select id from public.experience_versions where numero = 9999);
delete from public.experience_versions where numero = 9999;

select n, prueba, resultado, esperado, veredicto from pruebas_alm order by n;
