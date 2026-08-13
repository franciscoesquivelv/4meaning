-- ============================================================
-- CUENTAS DE PRUEBA · para poder verificar la RLS de verdad
-- ============================================================
--
-- ANTES DE CORRER ESTO, crea tres usuarios en el dashboard:
--   Authentication → Users → Add user  (marca "Auto Confirm User")
--
--   participante@prueba.com
--   moderador@prueba.com
--   miembro@prueba.com
--
-- La contraseña da igual, no se va a usar: las pruebas suplantan por id, no
-- por login. No se crean desde SQL a propósito: insertar en auth.users a
-- mano depende de la versión de Supabase y puede dejar la autenticación en
-- un estado raro. El dashboard hace lo correcto.
--
-- Este script solo los CONECTA: capítulo, formación, corrida y accesos.
-- Al final está el limpiador para borrarlo todo cuando termines.

do $$
declare
  id_part uuid; id_mod uuid; id_mie uuid;
  id_cap uuid; id_exp uuid; id_ver uuid; id_run uuid;
  n_auth int; correos_existentes text;
begin
  select id into id_part from public.profiles where email = 'participante@prueba.com';
  select id into id_mod  from public.profiles where email = 'moderador@prueba.com';
  select id into id_mie  from public.profiles where email = 'miembro@prueba.com';

  if id_part is null or id_mod is null or id_mie is null then
    -- Distinguir dos fallas que se ven igual: que la cuenta no exista, o
    -- que exista en auth pero sin perfil. Lo segundo pasa porque el trigger
    -- handle_new_user se traga sus propios errores con `when others then
    -- return new`, asi que un alta puede quedar a medias en silencio.
    select count(*) into n_auth
    from auth.users where email in
      ('participante@prueba.com','moderador@prueba.com','miembro@prueba.com');

    select string_agg(email, ', ' order by email) into correos_existentes
    from public.profiles;

    raise exception E'Faltan perfiles.\n'
      '  En auth.users hay % de 3 cuentas de prueba.\n'
      '  Perfiles que existen hoy: %\n'
      '  %',
      n_auth,
      coalesce(correos_existentes, 'ninguno'),
      case
        when n_auth = 3 then
          'Las tres cuentas SI existen en auth pero no tienen perfil. El trigger handle_new_user fallo en silencio. Corre el bloque de reparacion que esta al final de este archivo.'
        else
          'Crealas en Authentication → Users con Auto Confirm User, y revisa que el correo coincida exactamente.'
      end;
  end if;

  -- Los tres arrancan como participant, que es lo que hace útil al primero.
  update public.profiles set role = 'participant'
    where id in (id_part, id_mod, id_mie);

  select id into id_cap from public.chapters where nombre = 'Foro Anáhuac';
  select id into id_exp from public.experiences where slug = 'presente-regalo';
  select id into id_ver from public.experience_versions
    where experience_id = id_exp and estado = 'publicada';

  -- El moderador pertenece al capítulo y está formado en la experiencia.
  -- Sin formación no puede conducirla, aunque el capítulo tenga licencia.
  insert into public.chapter_moderators (chapter_id, profile_id)
  values (id_cap, id_mod)
  on conflict (chapter_id, profile_id) do nothing;

  insert into public.moderator_training (profile_id, experience_id)
  values (id_mod, id_exp)
  on conflict (profile_id, experience_id) do nothing;

  -- Una corrida real para colgar los accesos.
  select id into id_run from public.runs
    where experience_id = id_exp and chapter_id = id_cap and moderador_id = id_mod;

  if id_run is null then
    insert into public.runs
      (experience_id, version_id, chapter_id, moderador_id, fecha, estado, personas_en_el_foro, sede)
    values
      (id_exp, id_ver, id_cap, id_mod, current_date + 30, 'confirmada', 11, 'Oficinas del foro')
    returning id into id_run;

    insert into public.run_checklist (run_id, fase, titulo, orden, hecho)
    values
      (id_run, 'Antes de confirmar',   'Moderador formado',          1, true),
      (id_run, 'Antes de confirmar',   'Acuerdo de licencia firmado',2, true),
      (id_run, 'Cuatro semanas antes', 'Lista del foro cargada',     3, false),
      (id_run, 'Dos semanas antes',    'Carta de convocatoria enviada',4, false);
  end if;

  -- Los dos accesos. Esta es la pieza que abre la experiencia.
  insert into public.grants (profile_id, experience_id, run_id, titularidad)
  values (id_mod, id_exp, id_run, 'moderador')
  on conflict (profile_id, experience_id, run_id) do nothing;

  -- El miembro solo entra porque esta experiencia abre espacio al foro.
  insert into public.grants (profile_id, experience_id, run_id, titularidad)
  values (id_mie, id_exp, id_run, 'miembro_foro')
  on conflict (profile_id, experience_id, run_id) do nothing;

  -- El participante NO recibe ningún acceso: sirve para probar la escalada
  -- y para comprobar que sin grant no ve nada.

  raise notice 'Listo. Moderador y miembro con acceso a El Presente como Regalo. Participante sin acceso.';
end $$;

-- Qué quedó
select
  p.email,
  p.role,
  coalesce(g.titularidad::text, 'sin acceso') as acceso,
  case when mt.id is not null then 'formado' else '—' end as formacion
from public.profiles p
left join public.grants g on g.profile_id = p.id and g.revocado_at is null
left join public.moderator_training mt on mt.profile_id = p.id
where p.email like '%@prueba.com'
order by p.email;

-- ============================================================
-- LIMPIADOR · descomenta y corre cuando termines de probar
-- ============================================================
-- Borra los accesos, la corrida y los vínculos. Las cuentas de auth se
-- borran desde el dashboard.
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

-- ============================================================
-- REPARACIÓN · solo si las cuentas existen en auth pero sin perfil
-- ============================================================
-- El trigger handle_new_user se traga sus errores, así que un alta puede
-- quedar a medias. Esto crea los perfiles que falten, sin tocar los que ya
-- estén bien.

insert into public.profiles (id, email, full_name, role)
select u.id, u.email, split_part(u.email, '@', 1), 'participant'
from auth.users u
where u.email like '%@prueba.com'
  and not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

select email, role from public.profiles where email like '%@prueba.com' order by email;
