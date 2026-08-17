-- ============================================================
-- PRUEBA DE LA ESCALADA DE PRIVILEGIOS
-- ============================================================
--
-- Para el SQL Editor de Supabase. Todo vuelve en UNA SOLA TABLA al final.
--
-- CÓMO DESHACE LOS CAMBIOS: PL/pgSQL no admite SAVEPOINT. Lo que sí tiene
-- es que un bloque `begin ... exception ... end` revierte lo suyo cuando
-- salta una excepción. Así que cada prueba que escribe termina lanzando una
-- excepción a propósito, con un código propio ZZ999, para deshacerse.
-- NO se usa P0001: ese es el que PL/pgSQL asigna por defecto a
-- `raise exception 'texto'`, y confundiría un rechazo real con el deshacer. Las
-- variables NO se revierten, así que el resultado sobrevive al deshacer.
--
-- No queda ningún cambio en la base.
--
-- ⚠️  ANTES DE CORRER
-- Cambia el correo de la línea marcada con la flecha. Es una sola vez.
-- Para ver qué cuentas tienes:  select email, role from public.profiles;

create temp table if not exists pruebas (
  n int, prueba text, resultado text, esperado text, veredicto text
);
truncate pruebas;

do $$
declare
  correo_participante text := 'participante@prueba.com';   -- ⬅ CAMBIA ESTE
  id_participante uuid;
  id_super uuid;
  rol_actual text;
  escalo boolean;
  n_filas int;
begin
  select id, role into id_participante, rol_actual
  from public.profiles where email = correo_participante;

  select id into id_super from public.profiles where role = 'super_admin' limit 1;

  if id_participante is null then
    insert into pruebas values (0, 'La cuenta de prueba existe',
      'no existe', correo_participante, '⚠️ Cambia el correo arriba.');
    return;
  end if;

  insert into pruebas values (0, 'Cuenta usada para las pruebas',
    correo_participante || ' (' || rol_actual || ')', 'rol participant',
    case when rol_actual = 'participant' then '✅'
         else '⚠️ no es participant, las pruebas 1 y 4 darán distinto' end);

  -- ── 1 · El ataque literal ───────────────────────────────
  escalo := false;
  begin
    perform set_config('request.jwt.claims',
      json_build_object('sub', id_participante)::text, true);
    execute 'set local role authenticated';

    update public.profiles set role = 'super_admin' where id = id_participante;
    escalo := found;                         -- true = la escalada FUNCIONÓ

    raise exception using errcode = 'ZZ999', message = '__deshacer__';
  exception
    when sqlstate 'ZZ999' then null;         -- deshecho a propósito
    when others then escalo := false;        -- la base lo rechazó
  end;
  execute 'reset role';

  insert into pruebas values (1,
    'Un participante intenta ponerse super_admin',
    case when escalo then 'LO LOGRÓ' else 'rechazado' end,
    'rechazado',
    case when escalo then '❌ EL AGUJERO SIGUE ABIERTO' else '✅' end);

  -- ── 2 · Borrar la propia fila ───────────────────────────
  n_filas := 0;
  begin
    perform set_config('request.jwt.claims',
      json_build_object('sub', id_participante)::text, true);
    execute 'set local role authenticated';

    delete from public.profiles where id = id_participante;
    get diagnostics n_filas = row_count;

    raise exception using errcode = 'ZZ999', message = '__deshacer__';
  exception
    when sqlstate 'ZZ999' then null;
    when others then n_filas := 0;
  end;
  execute 'reset role';

  insert into pruebas values (2,
    'Puede borrar su perfil para reinsertarlo con otro rol',
    n_filas::text, '0',
    case when n_filas = 0 then '✅' else '❌' end);

  -- ── 3 · Cambiar el nombre propio SÍ debe funcionar ──────
  n_filas := 0;
  begin
    perform set_config('request.jwt.claims',
      json_build_object('sub', id_participante)::text, true);
    execute 'set local role authenticated';

    update public.profiles set full_name = 'Nombre de prueba' where id = id_participante;
    get diagnostics n_filas = row_count;

    raise exception using errcode = 'ZZ999', message = '__deshacer__';
  exception
    when sqlstate 'ZZ999' then null;
    when others then n_filas := 0;
  end;
  execute 'reset role';

  insert into pruebas values (3,
    'Puede cambiar su propio nombre (lo legítimo no se rompió)',
    n_filas::text, '1',
    case when n_filas = 1 then '✅' else '❌ SE ROMPIÓ ALGO LEGÍTIMO' end);

  -- ── 4 · No ve perfiles ajenos ───────────────────────────
  -- Solo lee, no hace falta deshacer nada.
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_participante)::text, true);
  execute 'set local role authenticated';

  select count(*) into n_filas from public.profiles where id <> id_participante;

  execute 'reset role';

  insert into pruebas values (4,
    'Perfiles ajenos que ve un participante',
    n_filas::text, '0',
    case when n_filas = 0 then '✅' else '❌' end);

  -- ── 5 · Un super admin SÍ puede cambiar roles ───────────
  if id_super is not null and id_super <> id_participante then
    n_filas := 0;
    begin
      perform set_config('request.jwt.claims',
        json_build_object('sub', id_super)::text, true);
      execute 'set local role authenticated';

      update public.profiles set role = 'staff' where id = id_participante;
      get diagnostics n_filas = row_count;

      raise exception using errcode = 'ZZ999', message = '__deshacer__';
    exception
      when sqlstate 'ZZ999' then null;
      when others then n_filas := 0;
    end;
    execute 'reset role';

    insert into pruebas values (5,
      'Un super admin puede cambiar el rol de otra persona',
      n_filas::text, '1',
      case when n_filas = 1 then '✅' else '❌ la gestión de roles sigue rota' end);
  else
    insert into pruebas values (5,
      'Un super admin puede cambiar el rol de otra persona',
      'omitida', 'una cuenta distinta',
      'ℹ️ la cuenta de prueba es el propio super admin');
  end if;
end $$;

-- ── Comprobaciones estructurales ────────────────────────────

insert into pruebas
select 6, 'La política vieja "Perfil propio" (for all) ya no existe',
  count(*)::text, '0', case when count(*) = 0 then '✅' else '❌' end
from pg_policies
where schemaname='public' and tablename='profiles' and policyname='Perfil propio';

insert into pruebas
select 7, 'La política de edición tiene with check explícito',
  count(*)::text, '1', case when count(*) = 1 then '✅' else '❌' end
from pg_policies
where schemaname='public' and tablename='profiles'
  and policyname='Perfil propio edicion' and with_check is not null;

insert into pruebas
select 8, 'Existe política de super admin sobre perfiles',
  count(*)::text, '1', case when count(*) = 1 then '✅' else '❌' end
from pg_policies
where schemaname='public' and tablename='profiles'
  and policyname='Super admin gestiona perfiles';

insert into pruebas
select 9, 'El trigger proteger_rol está instalado',
  count(*)::text, '1', case when count(*) = 1 then '✅' else '❌' end
from pg_trigger
where tgname='proteger_rol' and tgrelid='public.profiles'::regclass;

insert into pruebas
select 10, 'No hay política de INSERT ni DELETE para usuarios comunes',
  count(*)::text, '0', case when count(*) = 0 then '✅' else '❌' end
from pg_policies
where schemaname='public' and tablename='profiles'
  and cmd in ('INSERT','DELETE')
  and policyname <> 'Super admin gestiona perfiles';

-- ── EL RESULTADO ────────────────────────────────────────────

select n, prueba, resultado, esperado, veredicto from pruebas order by n;
