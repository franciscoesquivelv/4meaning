-- ============================================================
-- CUENTAS DE PRUEBA · para poder verificar la RLS de verdad
-- ============================================================
--
-- ANTES: crea tres usuarios en Authentication → Users → Add user,
-- marcando "Auto Confirm User":
--
--   participante@prueba.com     ← sin acceso, para probar la escalada
--   moderador@prueba.com        ← conduce, ve notas y kit
--   miembro@prueba.com          ← va al foro, NO debe ver notas ni kit
--
-- La contraseña no se usa: las pruebas suplantan por id, nunca hacen login.
--
-- Este script repara perfiles faltantes, conecta capítulo, formación,
-- corrida y accesos, y termina con UNA tabla que muestra cómo quedó todo.
-- Se puede correr varias veces sin duplicar nada.

do $$
declare
  id_part uuid; id_mod uuid; id_mie uuid;
  id_cap uuid; id_exp uuid; id_ver uuid; id_run uuid;
  n_auth int; correos text;
begin
  -- ── 0 · Reparar perfiles que el trigger no creó ───────────
  -- handle_new_user termina con `exception when others then return new`,
  -- así que un alta puede quedar en auth.users sin fila en profiles y sin
  -- que nadie se entere. Esto lo arregla antes de necesitarlo.
  insert into public.profiles (id, email, full_name, role)
  select u.id, u.email, split_part(u.email, '@', 1), 'participant'
  from auth.users u
  where u.email like '%@prueba.com'
    and not exists (select 1 from public.profiles p where p.id = u.id)
  on conflict (id) do nothing;

  select id into id_part from public.profiles where email = 'participante@prueba.com';
  select id into id_mod  from public.profiles where email = 'moderador@prueba.com';
  select id into id_mie  from public.profiles where email = 'miembro@prueba.com';

  if id_part is null or id_mod is null or id_mie is null then
    select count(*) into n_auth from auth.users
    where email in ('participante@prueba.com','moderador@prueba.com','miembro@prueba.com');
    select string_agg(email, ', ' order by email) into correos
    from public.profiles where email like '%@prueba.com';

    raise exception E'Faltan cuentas.\n  En auth.users hay % de 3.\n  Perfiles de prueba: %\n  Créalas en Authentication → Users con Auto Confirm User.',
      n_auth, coalesce(correos, 'ninguno');
  end if;

  -- Los tres arrancan como participant. Eso es lo que hace útil al primero:
  -- sin rol elevado, el ataque de escalada tiene sentido.
  update public.profiles set role = 'participant'
    where id in (id_part, id_mod, id_mie);

  select id into id_cap from public.chapters    where nombre = 'Foro Anáhuac';
  select id into id_exp from public.experiences where slug   = 'presente-regalo';
  select id into id_ver from public.experience_versions
    where experience_id = id_exp and estado = 'publicada';

  -- ── 1 · El moderador pertenece y está formado ─────────────
  -- Sin formación no puede conducir, aunque su capítulo tenga licencia.
  insert into public.chapter_moderators (chapter_id, profile_id)
  values (id_cap, id_mod) on conflict (chapter_id, profile_id) do nothing;

  insert into public.moderator_training (profile_id, experience_id)
  values (id_mod, id_exp) on conflict (profile_id, experience_id) do nothing;

  -- ── 2 · Una corrida real donde colgar los accesos ─────────
  select id into id_run from public.runs
    where experience_id = id_exp and chapter_id = id_cap and moderador_id = id_mod;

  if id_run is null then
    insert into public.runs
      (experience_id, version_id, chapter_id, moderador_id, fecha, estado, personas_en_el_foro, sede)
    values
      (id_exp, id_ver, id_cap, id_mod, current_date + 30, 'confirmada', 11, 'Oficinas del foro')
    returning id into id_run;

    insert into public.run_checklist (run_id, fase, titulo, orden, hecho) values
      (id_run, 'Antes de confirmar',   'Moderador formado',            1, true),
      (id_run, 'Antes de confirmar',   'Acuerdo de licencia firmado',  2, true),
      (id_run, 'Cuatro semanas antes', 'Lista del foro cargada',       3, false),
      (id_run, 'Dos semanas antes',    'Carta de convocatoria enviada',4, false);
  end if;

  -- ── 3 · Los dos accesos ───────────────────────────────────
  insert into public.grants (profile_id, experience_id, run_id, titularidad)
  values (id_mod, id_exp, id_run, 'moderador')
  on conflict (profile_id, experience_id, run_id) do nothing;

  -- El miembro solo entra porque esta experiencia abre espacio al foro.
  insert into public.grants (profile_id, experience_id, run_id, titularidad)
  values (id_mie, id_exp, id_run, 'miembro_foro')
  on conflict (profile_id, experience_id, run_id) do nothing;

  -- El participante NO recibe acceso a propósito.
end $$;

-- ── CÓMO QUEDÓ ──────────────────────────────────────────────
-- Única tabla del script. Si el editor solo muestra un resultado, es este.

select
  p.email,
  p.role                                              as rol,
  coalesce(g.titularidad::text, 'sin acceso')         as acceso,
  case when mt.id is not null then 'sí' else 'no' end as formado,
  case when r.id is not null then 'conduce'
       when g.run_id is not null then 'asiste'
       else '—' end                                   as en_la_corrida,
  case
    when p.email = 'participante@prueba.com' and g.id is null then '✅ listo para probar la escalada'
    when p.email = 'moderador@prueba.com'    and g.titularidad = 'moderador'    then '✅ listo'
    when p.email = 'miembro@prueba.com'      and g.titularidad = 'miembro_foro' then '✅ listo'
    else '⚠️ revisar'
  end                                                 as veredicto
from public.profiles p
left join public.grants g  on g.profile_id = p.id and g.revocado_at is null
left join public.moderator_training mt on mt.profile_id = p.id
left join public.runs r    on r.moderador_id = p.id
where p.email like '%@prueba.com'
order by p.email;

-- ============================================================
-- LIMPIADOR · descomenta y corre cuando termines
-- ============================================================
-- Las cuentas de auth se borran desde el dashboard.
--
-- delete from public.grants
--   where profile_id in (select id from public.profiles where email like '%@prueba.com');
-- delete from public.run_checklist
--   where run_id in (select id from public.runs where moderador_id in
--     (select id from public.profiles where email like '%@prueba.com'));
-- delete from public.runs
--   where moderador_id in (select id from public.profiles where email like '%@prueba.com');
-- delete from public.moderator_training
--   where profile_id in (select id from public.profiles where email like '%@prueba.com');
-- delete from public.chapter_moderators
--   where profile_id in (select id from public.profiles where email like '%@prueba.com');
