-- ============================================================
-- VERIFICACIÓN DE RLS · PersonaLab
-- ============================================================
--
-- Correr en el SQL Editor DESPUÉS de las dos migraciones.
--
-- Por qué hace falta: en el editor de Supabase corres como superusuario y
-- la RLS NO se aplica. Si consultas una tabla y ves filas, eso no prueba
-- nada. Hay que suplantar a un usuario autenticado de verdad, que es lo que
-- hacen los `set local` de abajo.
--
-- No modifica datos. Todo va dentro de transacciones que se revierten.

-- ── Preparación: tres personas de prueba ────────────────────
-- Sustituye los tres correos por cuentas que existan en tu proyecto.
-- Si no existen, créalas primero en Authentication → Users.

\set correo_equipo    'f.esquivelviteri@gmail.com'
\set correo_moderador 'moderador@ejemplo.mx'
\set correo_miembro   'miembro@ejemplo.mx'

-- ============================================================
-- PRUEBA 1 · El equipo ve todo
-- ============================================================
begin;
  select set_config('request.jwt.claims',
    json_build_object('sub', (select id from public.profiles where email = :'correo_equipo'))::text, true);
  set local role authenticated;

  select
    'equipo' as quien,
    (select count(*) from public.experiences)          as experiencias,
    (select count(*) from public.blocks)               as bloques_visibles,
    (select count(*) from public.kit_pieces)           as kit,
    (select count(*) from public.experience_versions
      where estado = 'borrador')                       as borradores_visibles;
rollback;

-- Esperado: ve las 4 experiencias, TODOS los bloques incluidas las notas,
-- todo el kit, y los borradores.

-- ============================================================
-- PRUEBA 2 · El moderador con grant
-- ============================================================
begin;
  select set_config('request.jwt.claims',
    json_build_object('sub', (select id from public.profiles where email = :'correo_moderador'))::text, true);
  set local role authenticated;

  select
    'moderador' as quien,
    (select count(*) from public.experiences)          as experiencias,
    (select count(*) from public.blocks)               as bloques_visibles,
    (select count(*) from public.blocks
      where audiencia = 'moderador')                   as notas_visibles,
    (select count(*) from public.kit_pieces)           as kit,
    (select count(*) from public.experience_versions
      where estado = 'borrador')                       as borradores_visibles;
rollback;

-- Esperado: solo las experiencias con grant. VE las notas de moderador.
-- VE el kit. NO ve ningún borrador: cero.

-- ============================================================
-- PRUEBA 3 · El miembro del foro
-- ============================================================
begin;
  select set_config('request.jwt.claims',
    json_build_object('sub', (select id from public.profiles where email = :'correo_miembro'))::text, true);
  set local role authenticated;

  select
    'miembro' as quien,
    (select count(*) from public.experiences)          as experiencias,
    (select count(*) from public.blocks)               as bloques_visibles,
    (select count(*) from public.blocks
      where audiencia = 'moderador')                   as notas_visibles,
    (select count(*) from public.kit_pieces)           as kit,
    (select count(*) from public.run_checklist)        as checklist_visible;
rollback;

-- Esperado, y esto es LO QUE MÁS IMPORTA:
--   notas_visibles     = 0   nunca recibe una nota de sala
--   kit                = 0   el kit es del moderador
--   checklist_visible  = 0   la preparación no es suya
-- Si alguno de esos tres es distinto de cero, la RLS está mal y NO se
-- despliega hasta corregirlo.

-- ============================================================
-- PRUEBA 4 · Alguien sin ningún acceso
-- ============================================================
begin;
  select set_config('request.jwt.claims',
    json_build_object('sub', gen_random_uuid())::text, true);
  set local role authenticated;

  select
    'sin acceso' as quien,
    (select count(*) from public.experiences) as experiencias,
    (select count(*) from public.blocks)      as bloques,
    (select count(*) from public.runs)        as corridas;
rollback;

-- Esperado: los tres en cero. Sin grant no se ve nada.

-- ============================================================
-- PRUEBA 5 · El retorno es privado
-- ============================================================
-- Lo que alguien escribe en su retorno no lo lee ni su moderador.
begin;
  select set_config('request.jwt.claims',
    json_build_object('sub', (select id from public.profiles where email = :'correo_moderador'))::text, true);
  set local role authenticated;

  select
    'moderador mirando retornos ajenos' as prueba,
    count(*) as debe_ser_cero
  from public.returns
  where profile_id <> (select id from public.profiles where email = :'correo_moderador');
rollback;

-- ============================================================
-- PRUEBA 6 · Integridad del léxico
-- ============================================================
select
  'campos prohibidos' as prueba,
  count(*) as debe_ser_cero
from information_schema.columns
where table_schema = 'public'
  and column_name in ('progress','completion_pct','score','streak','badge','rank','quiz');

-- ============================================================
-- PRUEBA 7 · Una sola versión publicada por experiencia
-- ============================================================
select
  'experiencias con más de una versión publicada' as prueba,
  count(*) as debe_ser_cero
from (
  select experience_id
  from public.experience_versions
  where estado = 'publicada'
  group by experience_id
  having count(*) > 1
) x;

-- ============================================================
-- PRUEBA 8 · Una nota nunca es pública
-- ============================================================
select
  'notas marcadas como públicas' as prueba,
  count(*) as debe_ser_cero
from public.blocks
where tipo = 'nota' and audiencia = 'todos';
