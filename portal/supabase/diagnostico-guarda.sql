-- ============================================================
-- DIAGNÓSTICO · por qué la guarda dejó pasar
-- ============================================================
--
-- La prueba 11 dice que pl_es_equipo() devuelve false, y la 10 dice que
-- pl_abrir_borrador dejó pasar. Si la función devuelve false, la guarda
-- `if not pl_es_equipo() then raise` tendría que disparar.
--
-- Este script mira tres cosas que descartan las tres explicaciones
-- posibles, en vez de suponer cuál es.
--
-- No cambia nada.

create or replace function public.pl_diagnostico_guarda()
returns table (n int, que text, valor text, lectura text)
language plpgsql
as $$
declare
  def text;
  v_antes boolean; v_durante boolean;
  id_exp uuid; id_super uuid; id_ver uuid;
  paso boolean := false;
  err text;
begin
  select e.id into id_exp from public.experiences e where e.slug = 'presente-regalo';
  select p.id into id_super from public.profiles p where p.role = 'super_admin' limit 1;

  -- ── 1 · ¿Qué versión de pl_abrir_borrador está instalada? ──
  select pg_get_functiondef(p.oid) into def
  from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
  where ns.nspname = 'public' and p.proname = 'pl_abrir_borrador';

  return query select 1,
    'La función instalada usa pl_es_equipo()'::text,
    case when def like '%pl_es_equipo%' then 'sí' else 'NO, usa la vieja is_staff()' end::text,
    case when def like '%pl_es_equipo%'
      then 'La corrección sí se aplicó.'
      else 'La migración de corrección NO reemplazó esta función. Vuelve a correrla.' end::text;

  return query select 2,
    'Texto exacto de la guarda instalada'::text,
    coalesce(substring(def from 'if not [^\n]*'), 'no encontrada')::text,
    'Debe decir: if not public.pl_es_equipo()'::text;

  -- ── 3 · Sin sesión, ¿qué ve cada función? ─────────────────
  perform set_config('request.jwt.claims', '', true);

  return query select 3, 'auth.uid() sin sesión'::text,
    coalesce(auth.uid()::text, 'NULL')::text,
    'Debe ser NULL'::text;

  return query select 4, 'public.my_role() sin sesión'::text,
    coalesce(public.my_role(), 'NULL')::text,
    'Debe ser NULL'::text;

  return query select 5, 'public.is_staff() sin sesión'::text,
    coalesce(public.is_staff()::text, 'NULL')::text,
    'NULL es lo esperado, y es la causa del defecto original'::text;

  select public.pl_es_equipo() into v_antes;
  return query select 6, 'public.pl_es_equipo() sin sesión'::text,
    coalesce(v_antes::text, 'NULL')::text,
    'Debe ser false'::text;

  -- ── 7 · La llamada real, capturando el error ──────────────
  begin
    select public.pl_es_equipo() into v_durante;
    perform public.pl_abrir_borrador(id_exp);
    paso := true;
    raise exception using errcode = 'ZZ999', message = '__deshacer__';
  exception
    when sqlstate 'ZZ999' then null;
    when others then
      paso := false;
      err := sqlstate || ' · ' || sqlerrm;
  end;

  return query select 7,
    'pl_es_equipo() justo antes de llamar'::text,
    coalesce(v_durante::text, 'NULL')::text,
    'Si aquí sale true, el valor se está cacheando entre llamadas'::text;

  return query select 8,
    'pl_abrir_borrador sin sesión'::text,
    case when paso then 'PASÓ' else 'rechazó' end::text,
    coalesce(err, 'no hubo error: la guarda no disparó')::text;

  -- ── 9 · ¿Quedó un borrador colgado? ───────────────────────
  select v.id into id_ver from public.experience_versions v
  where v.experience_id = id_exp and v.estado = 'borrador'
  order by v.numero desc limit 1;

  return query select 9,
    'Borradores de la experiencia ahora'::text,
    (select count(*)::text from public.experience_versions v
      where v.experience_id = id_exp and v.estado = 'borrador'),
    'Si hay uno y la guarda debía rechazar, lo creó la llamada de prueba'::text;
end;
$$;

select * from public.pl_diagnostico_guarda() order by n;
