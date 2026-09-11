-- ============================================================
-- LA PROTECCIÓN DE `profiles.role` NUNCA DEJÓ PASAR AL BACKEND
-- ============================================================
--
-- `20260813_cerrar_escalada_de_privilegios.sql` agregó un disparador que
-- protege la columna `role`, con esta salida para el backend:
--
--   if current_user = 'service_role' then
--     return new;
--   end if;
--
-- LA REGLA DE POSTGRES QUE LO ROMPE. `proteger_rol_de_perfil()` es
-- `security definer`. Dentro de una función así, `current_user` deja de
-- reflejar quién llamó y pasa a reflejar quién es el DUEÑO de la función
-- (documentado por Postgres: "within a SECURITY DEFINER function,
-- current_user is temporarily changed to the function owner"). La
-- comparación nunca comprobó si el backend llamaba: comprobó si el backend
-- era el dueño de la función, que nunca es cierto.
--
-- POR QUÉ NO SE NOTÓ ANTES. `handle_new_user()` ya deja cada perfil nuevo
-- en `role = 'participant'`, el valor por defecto de la columna. Invitar
-- con ese mismo rol no CAMBIA nada, así que `new.role is distinct from
-- old.role` es falso y el disparador ni se activa. El bug solo se dispara
-- cuando se pide un rol distinto del que nace por defecto: admin, staff, o
-- el nuevo 'individual'. Probablemente lleva roto desde el 13 de agosto.
--
-- LA CORRECCIÓN. `auth.role()` es el ayudante que Supabase expone en todo
-- proyecto: lee el reclamo `role` del JWT que PostgREST ya validó, un
-- parámetro de sesión, no una identidad de Postgres. No lo toca la
-- sustitución de `current_user` que hace SECURITY DEFINER, así que sigue
-- diciendo la verdad sin importar de qué función se llame.
-- ============================================================

create or replace function public.proteger_rol_de_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then

    -- CORREGIDO 2026-09-11: antes decía `current_user = 'service_role'`,
    -- que dentro de esta función SIEMPRE es falso, sin importar quién
    -- llame. Ver la migración de este mismo día para la explicación
    -- completa.
    if auth.role() = 'service_role' then
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

-- No hace falta recrear el trigger: sigue apuntando a la misma función,
-- que ya se reemplazó con `create or replace`.

-- ── Comprobación ──────────────────────────────────────────
--
-- No se puede comprobar desde el editor SQL, porque ahí se corre como un
-- rol con privilegios propios, no a través de PostgREST con la clave de
-- servicio: no reproduce el mismo camino que usa la aplicación. La prueba
-- real es volver a intentar la invitación que falló. Si ahora funciona,
-- la corrección está confirmada.
