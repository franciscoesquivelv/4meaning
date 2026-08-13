-- ============================================================
-- PRUEBA DE LA ESCALADA DE PRIVILEGIOS
-- ============================================================
--
-- Para el SQL Editor de Supabase.
--
-- Todas las pruebas vuelven en UNA SOLA TABLA al final. El editor solo
-- muestra el resultado de la última consulta, así que si cada prueba fuera
-- su propio SELECT, solo verías la última.
--
-- No modifica datos: cada prueba se revierte con un savepoint.
--
-- ⚠️  ANTES DE CORRER
-- Reemplaza participante@ejemplo.mx por una cuenta REAL de rol
-- `participant`. Aparece 1 sola vez, en la línea de abajo.
-- Para ver qué cuentas tienes, corre primero solo esto:
--     select email, role from public.profiles order by role;

create temp table if not exists pruebas (
  n int, prueba text, resultado text, esperado text, veredicto text
);
truncate pruebas;

do $$
declare
  correo_participante text := 'participante@ejemplo.mx';   -- ⬅ CAMBIA ESTE
  id_participante uuid;
  id_super uuid;
  n_filas int;
  paso boolean;
begin
  select id into id_participante from public.profiles where email = correo_participante;
  select id into id_super from public.profiles where role = 'super_admin' limit 1;

  if id_participante is null then
    insert into pruebas values
      (0, 'Cuenta de prueba', correo_participante, 'que exista',
       '⚠️ No existe. Cambia el correo arriba.');
    return;
  end if;

  -- ── 1 · El ataque literal ───────────────────────────────
  savepoint p1;
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_participante)::text, true);
  execute 'set local role authenticated';

  paso := false;
  begin
    update public.profiles set role = 'super_admin' where id = id_participante;
    paso := found;             -- true = la escalada FUNCIONÓ
  exception when others then
    paso := false;             -- la base la rechazó
  end;

  execute 'reset role';
  rollback to savepoint p1;

  insert into pruebas values (1,
    'Un participante intenta ponerse super_admin',
    case when paso then 'LO LOGRÓ' else 'rechazado' end,
    'rechazado',
    case when paso then '❌ EL AGUJERO SIGUE ABIERTO' else '✅' end);

  -- ── 2 · Borrar la propia fila ───────────────────────────
  savepoint p2;
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_participante)::text, true);
  execute 'set local role authenticated';

  begin
    delete from public.profiles where id = id_participante;
    get diagnostics n_filas = row_count;
  exception when others then
    n_filas := 0;
  end;

  execute 'reset role';
  rollback to savepoint p2;

  insert into pruebas values (2,
    'Puede borrar su propio perfil para reinsertarlo con otro rol',
    n_filas::text, '0',
    case when n_filas = 0 then '✅' else '❌' end);

  -- ── 3 · Editar el nombre propio SÍ debe funcionar ───────
  savepoint p3;
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_participante)::text, true);
  execute 'set local role authenticated';

  begin
    update public.profiles set full_name = 'Nombre de prueba' where id = id_participante;
    get diagnostics n_filas = row_count;
  exception when others then
    n_filas := 0;
  end;

  execute 'reset role';
  rollback to savepoint p3;

  insert into pruebas values (3,
    'Puede cambiar su propio nombre (lo legítimo no se rompió)',
    n_filas::text, '1',
    case when n_filas = 1 then '✅' else '❌ SE ROMPIÓ ALGO LEGÍTIMO' end);

  -- ── 4 · No ve perfiles ajenos ───────────────────────────
  savepoint p4;
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_participante)::text, true);
  execute 'set local role authenticated';

  select count(*) into n_filas from public.profiles where id <> id_participante;

  execute 'reset role';
  rollback to savepoint p4;

  insert into pruebas values (4,
    'Perfiles ajenos que ve un participante',
    n_filas::text, '0',
    case when n_filas = 0 then '✅' else '❌' end);

  -- ── 5 · Un super admin SÍ puede cambiar roles ───────────
  if id_super is not null then
    savepoint p5;
    perform set_config('request.jwt.claims',
      json_build_object('sub', id_super)::text, true);
    execute 'set local role authenticated';

    begin
      update public.profiles set role = 'staff' where id = id_participante;
      get diagnostics n_filas = row_count;
    exception when others then
      n_filas := 0;
    end;

    execute 'reset role';
    rollback to savepoint p5;

    insert into pruebas values (5,
      'Un super admin puede cambiar el rol de otra persona',
      n_filas::text, '1',
      case when n_filas = 1 then '✅' else '❌ la gestión de roles sigue rota' end);
  end if;
end $$;

-- ── Estado estructural ──────────────────────────────────────

insert into pruebas
select 6,
  'La política vieja "Perfil propio" (for all) ya no existe',
  count(*)::text, '0',
  case when count(*) = 0 then '✅' else '❌' end
from pg_policies
where schemaname='public' and tablename='profiles' and policyname='Perfil propio';

insert into pruebas
select 7,
  'La política de edición tiene with check explícito',
  count(*)::text, '1',
  case when count(*) = 1 then '✅' else '❌' end
from pg_policies
where schemaname='public' and tablename='profiles'
  and policyname='Perfil propio edicion' and with_check is not null;

insert into pruebas
select 8,
  'Existe política de super admin sobre perfiles',
  count(*)::text, '1',
  case when count(*) = 1 then '✅' else '❌' end
from pg_policies
where schemaname='public' and tablename='profiles'
  and policyname='Super admin gestiona perfiles';

insert into pruebas
select 9,
  'El trigger proteger_rol está instalado',
  count(*)::text, '1',
  case when count(*) = 1 then '✅' else '❌' end
from pg_trigger
where tgname='proteger_rol' and tgrelid='public.profiles'::regclass;

insert into pruebas
select 10,
  'No hay política de INSERT ni de DELETE para usuarios',
  count(*)::text, '0',
  case when count(*) = 0 then '✅' else '❌' end
from pg_policies
where schemaname='public' and tablename='profiles'
  and cmd in ('INSERT','DELETE')
  and policyname <> 'Super admin gestiona perfiles';

-- ── EL RESULTADO ────────────────────────────────────────────

select n, prueba, resultado, esperado, veredicto
from pruebas
order by n;
