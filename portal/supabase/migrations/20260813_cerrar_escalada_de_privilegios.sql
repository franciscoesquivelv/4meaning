-- ============================================================
-- CIERRA LA ESCALADA DE PRIVILEGIOS EN public.profiles
-- ============================================================
--
-- EL AGUJERO, tal como estaba:
--
--   create policy "Perfil propio" on public.profiles
--     for all using (id = auth.uid());
--
-- `for all` sin `with check`: en Postgres el UPDATE reusa la expresión de
-- USING como WITH CHECK. La fila sigue cumpliendo `id = auth.uid()` después
-- de cambiar el rol, así que cualquier participante autenticado podía
-- ponerse super_admin sobre su propia fila. Con eso leía el intake de todas
-- las familias, los acuerdos firmados y los campos comerciales de todos los
-- eventos.
--
-- No hacía falta la interfaz de admin: bastaba la sesión del navegador y la
-- anon key, que es pública por diseño.
--
-- Y había un segundo camino por el mismo `for all`: borrar la propia fila e
-- insertar otra con el rol deseado.
--
-- LA CORRECCIÓN, en tres capas independientes. Cualquiera de las tres
-- detiene el ataque; las tres juntas lo detienen aunque una se rompa.
--
--   1. Políticas por comando, con `with check`, sin INSERT ni DELETE.
--   2. Trigger que rechaza el cambio de `role` salvo super admin.
--   3. Verificación en el server action (va en el commit de código).
--
-- Efecto colateral que se corrige de paso: hoy NO existe ninguna política
-- que permita a un admin cambiar el rol de otra persona, así que esa función
-- estaba rota. Se agrega.

-- ── 1. Políticas por comando ────────────────────────────────

drop policy if exists "Perfil propio" on public.profiles;
drop policy if exists "Perfil propio lectura" on public.profiles;
drop policy if exists "Perfil propio edicion" on public.profiles;
drop policy if exists "Super admin gestiona perfiles" on public.profiles;

-- Cada quien lee su perfil.
create policy "Perfil propio lectura" on public.profiles
  for select using (id = auth.uid());

-- Cada quien edita su perfil. El `with check` es explícito a propósito:
-- sin él, Postgres reusa el USING y la puerta queda abierta. Lo que impide
-- cambiar el ROL es el trigger de abajo, porque `with check` valida la fila
-- entera y no una columna.
create policy "Perfil propio edicion" on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Sin política de INSERT ni de DELETE para usuarios. El alta la hace
-- handle_new_user, que es SECURITY DEFINER y no pasa por RLS. Esto cierra
-- el camino de borrar la propia fila e insertar otra con rol elegido.

-- El super admin sí gestiona perfiles ajenos. Antes no existía esta
-- política y por eso cambiar el rol de otra persona no funcionaba.
create policy "Super admin gestiona perfiles" on public.profiles
  for all
  using (public.my_role() = 'super_admin')
  with check (public.my_role() = 'super_admin');

-- ── 2. Trigger sobre la columna role ────────────────────────

create or replace function public.proteger_rol_de_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo importa cuando el rol cambia de verdad.
  if new.role is distinct from old.role then

    -- El backend con clave de servicio ya verificó permisos en la ruta
    -- antes de llegar aquí. Es el caso de /api/admin/invite.
    if current_user = 'service_role' then
      return new;
    end if;

    if coalesce(public.my_role(), '') <> 'super_admin' then
      raise exception
        'Solo un super admin puede cambiar el rol de una cuenta.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_rol on public.profiles;
create trigger proteger_rol
  before update on public.profiles
  for each row execute function public.proteger_rol_de_perfil();

-- ── 3. Verificación ─────────────────────────────────────────
-- Deja constancia de que la política vieja ya no existe.

do $$
declare n int;
begin
  select count(*) into n
  from pg_policies
  where schemaname = 'public'
    and tablename = 'profiles'
    and policyname = 'Perfil propio';

  if n > 0 then
    raise exception 'La política "Perfil propio" sigue existiendo. La escalada no está cerrada.';
  end if;
end $$;

do $$
declare n int;
begin
  select count(*) into n
  from pg_trigger
  where tgname = 'proteger_rol'
    and tgrelid = 'public.profiles'::regclass;

  if n = 0 then
    raise exception 'El trigger proteger_rol no quedó instalado.';
  end if;
end $$;
