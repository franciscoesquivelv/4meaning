-- ============================================================
-- VERIFICACIÓN DE RLS · PersonaLab
-- ============================================================
--
-- Todas las pruebas vuelven en UNA SOLA TABLA al final. El editor de
-- Supabase solo muestra el resultado de la última consulta.
--
-- POR QUÉ HACE FALTA: en el editor corres como superusuario y la RLS NO se
-- aplica. Si consultas una tabla y ves filas, eso no prueba nada. Hay que
-- suplantar a un usuario autenticado.
--
-- Las pruebas de catálogo, acceso nulo, léxico y constraints corren SIN
-- cuentas de prueba. Las de moderador y miembro de foro se omiten solas si
-- los correos no existen, y lo dicen.
--
-- No modifica datos.

create temp table if not exists pruebas_pl (
  n int, prueba text, resultado text, esperado text, veredicto text
);
truncate pruebas_pl;

do $$
declare
  correo_moderador text := 'moderador@ejemplo.mx';   -- ⬅ CAMBIA SI EXISTE
  correo_miembro   text := 'miembro@ejemplo.mx';     -- ⬅ CAMBIA SI EXISTE
  id_mod uuid; id_mie uuid;
  c_exp int; c_blo int; c_nota int; c_kit int; c_chk int; c_bor int; c_run int;
  v uuid; h uuid; ok boolean;
begin
  -- ── A · El catálogo se sembró ─────────────────────────────
  insert into pruebas_pl values (1, 'Experiencias sembradas',
    (select count(*) from public.experiences)::text, '4',
    case when (select count(*) from public.experiences) = 4 then '✅' else '⚠️' end);

  insert into pruebas_pl values (2, 'Bisagras sembradas',
    (select count(*) from public.hinges)::text, '15',
    case when (select count(*) from public.hinges) = 15 then '✅' else '⚠️' end);

  insert into pruebas_pl values (3, 'Bloques sembrados',
    (select count(*) from public.blocks)::text, '19',
    case when (select count(*) from public.blocks) = 19 then '✅' else '⚠️' end);

  insert into pruebas_pl values (4, 'Capítulos sembrados',
    (select count(*) from public.chapters)::text, '5',
    case when (select count(*) from public.chapters) = 5 then '✅' else '⚠️' end);

  insert into pruebas_pl values (5, 'Versiones publicadas',
    (select count(*) from public.experience_versions where estado='publicada')::text, '1',
    case when (select count(*) from public.experience_versions where estado='publicada') = 1
         then '✅' else '⚠️' end);

  -- ── B · Sin ningún acceso no se ve nada ───────────────────
  savepoint sin_acceso;
  perform set_config('request.jwt.claims',
    json_build_object('sub', gen_random_uuid())::text, true);
  execute 'set local role authenticated';

  select count(*) into c_exp from public.experiences;
  select count(*) into c_blo from public.blocks;
  select count(*) into c_run from public.runs;

  execute 'reset role';
  rollback to savepoint sin_acceso;

  insert into pruebas_pl values (6, 'Experiencias visibles sin acceso',
    c_exp::text, '0', case when c_exp = 0 then '✅' else '❌' end);
  insert into pruebas_pl values (7, 'Bloques visibles sin acceso',
    c_blo::text, '0', case when c_blo = 0 then '✅' else '❌' end);
  insert into pruebas_pl values (8, 'Corridas visibles sin acceso',
    c_run::text, '0', case when c_run = 0 then '✅' else '❌' end);

  -- ── C · Miembro de foro: lo que MÁS importa ───────────────
  select id into id_mie from public.profiles where email = correo_miembro;
  if id_mie is null then
    insert into pruebas_pl values (9,
      'Miembro de foro no recibe notas de moderador',
      'sin cuenta', 'crear ' || correo_miembro, 'ℹ️ omitida');
  else
    savepoint miembro;
    perform set_config('request.jwt.claims',
      json_build_object('sub', id_mie)::text, true);
    execute 'set local role authenticated';

    select count(*) into c_nota from public.blocks where audiencia='moderador';
    select count(*) into c_kit  from public.kit_pieces;
    select count(*) into c_chk  from public.run_checklist;
    select count(*) into c_bor  from public.experience_versions where estado='borrador';

    execute 'reset role';
    rollback to savepoint miembro;

    insert into pruebas_pl values (9,  'Notas de moderador que ve el foro',
      c_nota::text, '0', case when c_nota=0 then '✅' else '❌ LA RLS ESTÁ MAL' end);
    insert into pruebas_pl values (10, 'Piezas de kit que ve el foro',
      c_kit::text,  '0', case when c_kit=0  then '✅' else '❌' end);
    insert into pruebas_pl values (11, 'Checklist que ve el foro',
      c_chk::text,  '0', case when c_chk=0  then '✅' else '❌' end);
    insert into pruebas_pl values (12, 'Borradores que ve el foro',
      c_bor::text,  '0', case when c_bor=0  then '✅' else '❌' end);
  end if;

  -- ── D · Moderador: SÍ ve notas y kit ──────────────────────
  select id into id_mod from public.profiles where email = correo_moderador;
  if id_mod is null then
    insert into pruebas_pl values (13,
      'Moderador ve las notas de sala',
      'sin cuenta', 'crear ' || correo_moderador, 'ℹ️ omitida');
  else
    savepoint moderador;
    perform set_config('request.jwt.claims',
      json_build_object('sub', id_mod)::text, true);
    execute 'set local role authenticated';

    select count(*) into c_nota from public.blocks where audiencia='moderador';
    select count(*) into c_kit  from public.kit_pieces;
    select count(*) into c_bor  from public.experience_versions where estado='borrador';

    execute 'reset role';
    rollback to savepoint moderador;

    insert into pruebas_pl values (13, 'Notas de sala que ve el moderador',
      c_nota::text, 'más de 0', case when c_nota>0 then '✅' else '⚠️ ¿tiene grant?' end);
    insert into pruebas_pl values (14, 'Piezas de kit que ve el moderador',
      c_kit::text,  'más de 0', case when c_kit>0  then '✅' else '⚠️' end);
    insert into pruebas_pl values (15, 'Borradores que ve el moderador',
      c_bor::text,  '0',        case when c_bor=0  then '✅' else '❌' end);
  end if;

  -- ── E · Los constraints muerden de verdad ─────────────────
  select id into v from public.experience_versions limit 1;
  select id into h from public.hinges limit 1;

  if v is null or h is null then
    insert into pruebas_pl values (16, 'Constraints de bloques',
      'sin datos', 'sembrar primero', 'ℹ️ omitida');
  else
    savepoint constraints;

    ok := false;
    begin
      insert into public.blocks (version_id, hinge_id, orden, tipo, audiencia, contenido)
      values (v, h, 999, 'nota', 'todos', '{"texto":"prueba"}'::jsonb);
    exception when check_violation then ok := true;
    end;
    insert into pruebas_pl values (16, 'Rechaza una nota marcada como pública',
      case when ok then 'rechazada' else 'ACEPTADA' end, 'rechazada',
      case when ok then '✅' else '❌' end);

    ok := false;
    begin
      insert into public.blocks (version_id, hinge_id, orden, tipo, audiencia, contenido)
      values (v, h, 998, 'texto', 'todos', '{}'::jsonb);
    exception when check_violation then ok := true;
    end;
    insert into pruebas_pl values (17, 'Rechaza un bloque de texto vacío',
      case when ok then 'rechazado' else 'ACEPTADO' end, 'rechazado',
      case when ok then '✅' else '❌' end);

    rollback to savepoint constraints;
  end if;
end $$;

-- ── F · Reglas estructurales ────────────────────────────────

insert into pruebas_pl
select 18, 'Campos prohibidos en el esquema', count(*)::text, '0',
  case when count(*) = 0 then '✅' else '❌' end
from information_schema.columns
where table_schema='public'
  and table_name in ('experiences','experience_versions','hinges','blocks','media',
    'kit_pieces','chapters','chapter_moderators','moderator_training','runs',
    'run_checklist','grants','returns','testimonies')
  and column_name in ('progress','completion_pct','score','streak','badge','rank','quiz');

insert into pruebas_pl
select 19, 'Experiencias con más de una versión publicada', count(*)::text, '0',
  case when count(*) = 0 then '✅' else '❌' end
from (select experience_id from public.experience_versions
      where estado='publicada' group by experience_id having count(*) > 1) x;

insert into pruebas_pl
select 20, 'Notas marcadas como públicas', count(*)::text, '0',
  case when count(*) = 0 then '✅' else '❌' end
from public.blocks where tipo='nota' and audiencia='todos';

insert into pruebas_pl
select 21, 'Tablas de PersonaLab con RLS activa', count(*)::text, '14',
  case when count(*) = 14 then '✅' else '❌' end
from pg_tables
where schemaname='public' and rowsecurity = true
  and tablename in ('experiences','experience_versions','hinges','blocks','media',
    'kit_pieces','chapters','chapter_moderators','moderator_training','runs',
    'run_checklist','grants','returns','testimonies');

-- ── EL RESULTADO ────────────────────────────────────────────

select n, prueba, resultado, esperado, veredicto
from pruebas_pl
order by n;
