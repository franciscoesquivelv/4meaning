-- ============================================================
-- PRUEBA DE LA ESCALADA DE PRIVILEGIOS
-- ============================================================
--
-- Correr ANTES y DESPUÉS de 20260813_cerrar_escalada_de_privilegios.sql.
--
-- ANTES: la prueba 1 SUCEDE. Eso es el agujero.
-- DESPUÉS: la prueba 1 FALLA con "Solo un super admin...". Eso es el arreglo.
--
-- Todo va en transacciones que se revierten. No cambia datos.
--
-- Sustituye el correo por una cuenta de rol `participant`.

\set correo_participante 'participante@ejemplo.mx'

-- ============================================================
-- PRUEBA 1 · Un participante intenta ponerse super_admin
-- ============================================================
-- Este es el ataque literal. No necesita la interfaz de admin: basta la
-- sesión del navegador y la anon key, que es pública por diseño.

begin;
  select set_config('request.jwt.claims',
    json_build_object('sub', (select id from public.profiles where email = :'correo_participante'))::text, true);
  set local role authenticated;

  do $$
  begin
    update public.profiles
      set role = 'super_admin'
      where id = auth.uid();
    raise warning 'FALLO DE SEGURIDAD: la escalada FUNCIONÓ. El agujero sigue abierto.';
  exception when insufficient_privilege then
    raise notice 'CORRECTO: la base rechazó la escalada.';
  when others then
    raise notice 'CORRECTO: rechazada (%).', sqlerrm;
  end $$;
rollback;

-- ============================================================
-- PRUEBA 2 · Borrar la propia fila y reinsertarla con otro rol
-- ============================================================
-- El segundo camino que abría el `for all`. Sin política de DELETE ni de
-- INSERT para usuarios, las dos operaciones no afectan ninguna fila.

begin;
  select set_config('request.jwt.claims',
    json_build_object('sub', (select id from public.profiles where email = :'correo_participante'))::text, true);
  set local role authenticated;

  with borradas as (
    delete from public.profiles where id = auth.uid() returning 1
  )
  select
    'filas que el participante logró borrar de su perfil' as prueba,
    count(*) as debe_ser_cero
  from borradas;
rollback;

-- ============================================================
-- PRUEBA 3 · Editar su nombre SÍ debe seguir funcionando
-- ============================================================
-- El arreglo no puede romper lo legítimo.

begin;
  select set_config('request.jwt.claims',
    json_build_object('sub', (select id from public.profiles where email = :'correo_participante'))::text, true);
  set local role authenticated;

  with tocadas as (
    update public.profiles
      set full_name = 'Nombre de prueba'
      where id = auth.uid()
      returning 1
  )
  select
    'filas actualizadas al cambiar su propio nombre' as prueba,
    count(*) as debe_ser_uno
  from tocadas;
rollback;

-- ============================================================
-- PRUEBA 4 · Un participante no debe ver perfiles ajenos
-- ============================================================

begin;
  select set_config('request.jwt.claims',
    json_build_object('sub', (select id from public.profiles where email = :'correo_participante'))::text, true);
  set local role authenticated;

  select
    'perfiles ajenos visibles para un participante' as prueba,
    count(*) as debe_ser_cero
  from public.profiles
  where id <> auth.uid();
rollback;

-- ============================================================
-- PRUEBA 5 · Un super admin SÍ puede cambiar roles
-- ============================================================
-- Antes del arreglo esto tampoco funcionaba: no existía ninguna política
-- que se lo permitiera, así que la pantalla de usuarios estaba rota para
-- cambiar el rol de otra persona.

begin;
  select set_config('request.jwt.claims',
    json_build_object('sub', (select id from public.profiles where role = 'super_admin' limit 1))::text, true);
  set local role authenticated;

  with tocadas as (
    update public.profiles
      set role = 'staff'
      where email = :'correo_participante'
      returning 1
  )
  select
    'filas que el super admin logró cambiar' as prueba,
    count(*) as debe_ser_uno
  from tocadas;
rollback;

-- ============================================================
-- ESTADO FINAL DE LAS POLÍTICAS
-- ============================================================

select policyname, cmd, qual is not null as tiene_using, with_check is not null as tiene_with_check
from pg_policies
where schemaname = 'public' and tablename = 'profiles'
order by policyname;

-- Esperado después del arreglo:
--   Perfil propio lectura          SELECT   using sí    with_check no
--   Perfil propio edicion          UPDATE   using sí    with_check SÍ
--   Staff ve todos                 SELECT   using sí    with_check no
--   Super admin gestiona perfiles  ALL      using sí    with_check SÍ
--
-- Y NINGUNA llamada "Perfil propio" con cmd = ALL. Esa era el agujero.
