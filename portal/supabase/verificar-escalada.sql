-- ============================================================
-- PRUEBA DE LA ESCALADA DE PRIVILEGIOS
-- ============================================================
--
-- Para el SQL Editor de Supabase. Sin comandos de psql: aquí no existen.
--
-- ANTES del arreglo: la prueba 1 SUCEDE. Eso es el agujero.
-- DESPUÉS: la prueba 1 FALLA. Eso es el cierre.
--
-- Todo va en transacciones que se revierten. No cambia datos.
--
-- ⚠️  UNA COSA ANTES DE CORRER
-- Reemplaza participante@ejemplo.mx por una cuenta REAL de rol
-- `participant`. Aparece 5 veces: usa buscar y reemplazar.
-- Si no tienes ninguna, córrela con tu propio correo y ten en cuenta que
-- siendo super_admin las pruebas 1 y 4 van a dar distinto a propósito.

-- ============================================================
-- PRUEBA 0 · Qué cuentas hay para usar
-- ============================================================
select email, role, created_at
from public.profiles
order by role, created_at;

-- ============================================================
-- PRUEBA 1 · Un participante intenta ponerse super_admin
-- ============================================================
-- El ataque literal. No necesita la interfaz de admin: basta la sesión del
-- navegador y la anon key, que es pública por diseño.

begin;
  select set_config(
    'request.jwt.claims',
    json_build_object('sub',
      (select id from public.profiles where email = 'participante@ejemplo.mx')
    )::text,
    true
  );
  set local role authenticated;

  do $$
  begin
    update public.profiles set role = 'super_admin' where id = auth.uid();

    if found then
      raise warning '❌ FALLO DE SEGURIDAD: la escalada FUNCIONÓ. El agujero sigue abierto.';
    else
      raise notice '✅ CORRECTO: no se actualizó ninguna fila. La política lo bloqueó.';
    end if;

  exception
    when insufficient_privilege then
      raise notice '✅ CORRECTO: la base rechazó la escalada (privilegio insuficiente).';
    when others then
      raise notice '✅ CORRECTO: rechazada. Motivo: %', sqlerrm;
  end $$;
rollback;

-- ============================================================
-- PRUEBA 2 · Borrar la propia fila y reinsertarla con otro rol
-- ============================================================
-- El segundo camino que abría el `for all`.

begin;
  select set_config(
    'request.jwt.claims',
    json_build_object('sub',
      (select id from public.profiles where email = 'participante@ejemplo.mx')
    )::text,
    true
  );
  set local role authenticated;

  with borradas as (
    delete from public.profiles where id = auth.uid() returning 1
  )
  select
    'Filas que el participante logró borrar de su perfil' as prueba,
    count(*)                                             as resultado,
    0                                                    as esperado,
    case when count(*) = 0 then '✅' else '❌' end        as veredicto
  from borradas;
rollback;

-- ============================================================
-- PRUEBA 3 · Editar su propio nombre SÍ debe seguir funcionando
-- ============================================================
-- El arreglo no puede romper lo legítimo.

begin;
  select set_config(
    'request.jwt.claims',
    json_build_object('sub',
      (select id from public.profiles where email = 'participante@ejemplo.mx')
    )::text,
    true
  );
  set local role authenticated;

  with tocadas as (
    update public.profiles
      set full_name = 'Nombre de prueba'
      where id = auth.uid()
      returning 1
  )
  select
    'Filas actualizadas al cambiar su propio nombre' as prueba,
    count(*)                                        as resultado,
    1                                               as esperado,
    case when count(*) = 1 then '✅' else '❌' end   as veredicto
  from tocadas;
rollback;

-- ============================================================
-- PRUEBA 4 · Un participante no debe ver perfiles ajenos
-- ============================================================

begin;
  select set_config(
    'request.jwt.claims',
    json_build_object('sub',
      (select id from public.profiles where email = 'participante@ejemplo.mx')
    )::text,
    true
  );
  set local role authenticated;

  select
    'Perfiles ajenos visibles para un participante' as prueba,
    count(*)                                        as resultado,
    0                                               as esperado,
    case when count(*) = 0 then '✅' else '❌' end   as veredicto
  from public.profiles
  where id <> auth.uid();
rollback;

-- ============================================================
-- PRUEBA 5 · Un super admin SÍ puede cambiar roles ajenos
-- ============================================================
-- Antes del arreglo esto tampoco funcionaba: no existía política que lo
-- permitiera, así que la pantalla de usuarios estaba rota.

begin;
  select set_config(
    'request.jwt.claims',
    json_build_object('sub',
      (select id from public.profiles where role = 'super_admin' limit 1)
    )::text,
    true
  );
  set local role authenticated;

  with tocadas as (
    update public.profiles
      set role = 'staff'
      where email = 'participante@ejemplo.mx'
      returning 1
  )
  select
    'Filas que el super admin logró cambiar' as prueba,
    count(*)                                 as resultado,
    1                                        as esperado,
    case when count(*) = 1 then '✅' else '❌' end as veredicto
  from tocadas;
rollback;

-- ============================================================
-- ESTADO FINAL DE LAS POLÍTICAS
-- ============================================================

select
  policyname,
  cmd,
  qual       is not null as tiene_using,
  with_check is not null as tiene_with_check
from pg_policies
where schemaname = 'public' and tablename = 'profiles'
order by policyname;

-- Esperado después del arreglo:
--   Perfil propio edicion          UPDATE   using sí   with_check SÍ
--   Perfil propio lectura          SELECT   using sí   with_check no
--   Staff ve todos                 SELECT   using sí   with_check no
--   Super admin gestiona perfiles  ALL      using sí   with_check SÍ
--
-- Y NINGUNA llamada "Perfil propio" con cmd = ALL. Esa era el agujero.

-- ============================================================
-- EL TRIGGER QUEDÓ INSTALADO
-- ============================================================

select
  'Trigger proteger_rol instalado' as prueba,
  count(*)                         as resultado,
  1                                as esperado,
  case when count(*) = 1 then '✅' else '❌' end as veredicto
from pg_trigger
where tgname = 'proteger_rol'
  and tgrelid = 'public.profiles'::regclass;
