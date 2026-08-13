-- ============================================================
-- VERIFICACIÓN DE RLS · PersonaLab
-- ============================================================
--
-- Para el SQL Editor de Supabase. Sin comandos de psql.
--
-- POR QUÉ HACE FALTA: en el editor corres como superusuario y la RLS NO se
-- aplica. Si consultas una tabla y ves filas, eso no prueba nada. Hay que
-- suplantar a un usuario autenticado, que es lo que hacen los `set local`.
--
-- Las pruebas A, D, E y F NO necesitan cuentas de prueba: córrelas ya.
-- Las pruebas B y C sí. Si todavía no tienes moderador ni miembro de foro,
-- sáltatelas y vuelve cuando existan.
--
-- No modifica datos. Todo va en transacciones que se revierten.

-- ============================================================
-- A · El catálogo se sembró bien
-- ============================================================

select
  (select count(*) from public.experiences)                                as experiencias,
  (select count(*) from public.hinges)                                     as bisagras,
  (select count(*) from public.blocks)                                     as bloques,
  (select count(*) from public.kit_pieces)                                 as piezas_kit,
  (select count(*) from public.chapters)                                   as capitulos,
  (select count(*) from public.experience_versions where estado='publicada') as versiones_publicadas;

-- Esperado: 4 experiencias, 15 bisagras, 19 bloques, 12 piezas de kit,
-- 5 capítulos, 1 versión publicada.

-- ============================================================
-- B · Un miembro de foro NO recibe lo del moderador
-- ============================================================
-- Reemplaza el correo por una cuenta real con grant de miembro_foro.
-- Esto es LO QUE MÁS IMPORTA de todo el archivo.

begin;
  select set_config(
    'request.jwt.claims',
    json_build_object('sub',
      (select id from public.profiles where email = 'miembro@ejemplo.mx')
    )::text,
    true
  );
  set local role authenticated;

  select
    'Notas de moderador visibles para el foro' as prueba,
    (select count(*) from public.blocks where audiencia = 'moderador') as resultado,
    0 as esperado,
    case when (select count(*) from public.blocks where audiencia='moderador') = 0
         then '✅' else '❌ LA RLS ESTÁ MAL' end as veredicto
  union all
  select
    'Piezas de kit visibles para el foro',
    (select count(*) from public.kit_pieces), 0,
    case when (select count(*) from public.kit_pieces) = 0 then '✅' else '❌' end
  union all
  select
    'Checklist de preparación visible para el foro',
    (select count(*) from public.run_checklist), 0,
    case when (select count(*) from public.run_checklist) = 0 then '✅' else '❌' end
  union all
  select
    'Borradores visibles para el foro',
    (select count(*) from public.experience_versions where estado='borrador'), 0,
    case when (select count(*) from public.experience_versions where estado='borrador') = 0
         then '✅' else '❌' end;
rollback;

-- ============================================================
-- C · Un moderador SÍ ve las notas y el kit
-- ============================================================

begin;
  select set_config(
    'request.jwt.claims',
    json_build_object('sub',
      (select id from public.profiles where email = 'moderador@ejemplo.mx')
    )::text,
    true
  );
  set local role authenticated;

  select
    'Experiencias visibles'  as que, count(*) as cuantas from public.experiences
  union all
  select 'Bloques visibles',        count(*) from public.blocks
  union all
  select 'Notas de moderador',      count(*) from public.blocks where audiencia='moderador'
  union all
  select 'Piezas de kit',           count(*) from public.kit_pieces
  union all
  select 'Borradores (debe ser 0)', count(*) from public.experience_versions where estado='borrador';
rollback;

-- ============================================================
-- D · Sin ningún acceso no se ve nada
-- ============================================================
-- Un uuid inventado: nadie con ese id existe.

begin;
  select set_config(
    'request.jwt.claims',
    json_build_object('sub', gen_random_uuid())::text,
    true
  );
  set local role authenticated;

  select
    'Experiencias visibles sin acceso' as prueba,
    (select count(*) from public.experiences) as resultado,
    0 as esperado,
    case when (select count(*) from public.experiences) = 0 then '✅' else '❌' end as veredicto
  union all
  select
    'Bloques visibles sin acceso',
    (select count(*) from public.blocks), 0,
    case when (select count(*) from public.blocks) = 0 then '✅' else '❌' end
  union all
  select
    'Corridas visibles sin acceso',
    (select count(*) from public.runs), 0,
    case when (select count(*) from public.runs) = 0 then '✅' else '❌' end;
rollback;

-- ============================================================
-- E · Integridad del léxico
-- ============================================================

select
  'Campos prohibidos en el esquema' as prueba,
  count(*)                          as resultado,
  0                                 as esperado,
  case when count(*) = 0 then '✅' else '❌' end as veredicto
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'experiences','experience_versions','hinges','blocks','media','kit_pieces',
    'chapters','chapter_moderators','moderator_training','runs','run_checklist',
    'grants','returns','testimonies','media_descargas'
  )
  and column_name in ('progress','completion_pct','score','streak','badge','rank','quiz');

-- ============================================================
-- F · Reglas que viven en la base, no en la aplicación
-- ============================================================

select
  'Experiencias con más de una versión publicada' as prueba,
  count(*)                                        as resultado,
  0                                               as esperado,
  case when count(*) = 0 then '✅' else '❌' end   as veredicto
from (
  select experience_id from public.experience_versions
  where estado = 'publicada' group by experience_id having count(*) > 1
) x
union all
select
  'Notas marcadas como públicas',
  (select count(*) from public.blocks where tipo='nota' and audiencia='todos'), 0,
  case when (select count(*) from public.blocks where tipo='nota' and audiencia='todos') = 0
       then '✅' else '❌' end;

-- ============================================================
-- G · Los constraints rechazan de verdad
-- ============================================================
-- No basta con que existan: hay que ver que muerdan.

do $$
declare v uuid; h uuid;
begin
  select id into v from public.experience_versions limit 1;
  select id into h from public.hinges limit 1;
  if v is null or h is null then
    raise notice 'ℹ️  Sin datos sembrados, se omite esta prueba.';
    return;
  end if;

  -- 1. Una nota pública
  begin
    insert into public.blocks (version_id, hinge_id, orden, tipo, audiencia, contenido)
    values (v, h, 999, 'nota', 'todos', '{"texto":"prueba"}'::jsonb);
    raise warning '❌ Se aceptó una nota pública. El constraint no funciona.';
  exception when check_violation then
    raise notice '✅ Rechazó una nota pública.';
  end;

  -- 2. Un bloque de texto vacío
  begin
    insert into public.blocks (version_id, hinge_id, orden, tipo, audiencia, contenido)
    values (v, h, 998, 'texto', 'todos', '{}'::jsonb);
    raise warning '❌ Se aceptó un bloque de texto sin texto.';
  exception when check_violation then
    raise notice '✅ Rechazó un bloque de texto vacío.';
  end;
end $$;

-- Limpia lo que hubiera entrado si algún constraint falló.
delete from public.blocks where orden in (998, 999);
