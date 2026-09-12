-- ============================================================
-- CIERRA EL INCIDENTE DEL ROL 'individual'
--
-- Documentado en docs/INCIDENTE-ROL-INDIVIDUAL.md y ampliado el 2026-09-11
-- por la auditoria de Hugo y Leo. Esta migracion es UNA de las tres
-- correcciones que tienen que aplicarse juntas; las otras dos son de
-- aplicacion (ROLES_VALIDOS en usuarios/actions.ts, ROLES en
-- EditRoleSelect.tsx) y van en el mismo commit de codigo, no aqui.
--
-- `profiles.role` tenia `check (role in ('super_admin','admin','staff',
-- 'participant'))`, escrito en supabase/schema.sql:12-13 SIN NOMBRE
-- explicito. Postgres le puso el nombre por convencion
-- (`profiles_role_check`), pero no se asume: se busca la restriccion real
-- por columna antes de tocarla, para que esta migracion no falle si el
-- nombre real resulta ser otro.
-- ============================================================

do $$
declare
  nombre_restriccion text;
begin
  select tc.constraint_name into nombre_restriccion
    from information_schema.table_constraints tc
    join information_schema.constraint_column_usage ccu
      on ccu.constraint_name = tc.constraint_name
     and ccu.table_schema = tc.table_schema
   where tc.table_schema = 'public'
     and tc.table_name = 'profiles'
     and tc.constraint_type = 'CHECK'
     and ccu.column_name = 'role'
   limit 1;

  if nombre_restriccion is not null then
    execute format('alter table public.profiles drop constraint %I', nombre_restriccion);
  end if;
end $$;

alter table public.profiles add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'staff', 'participant', 'individual'));

comment on constraint profiles_role_check on public.profiles is
  'individual = cliente de PersonaLab que compra una experiencia digital solo, sin foro ni moderador. Agregado 2026-09-11, ver docs/INCIDENTE-ROL-INDIVIDUAL.md.';

-- ── Comprobación ────────────────────────────────────────────
--
--   select conname, pg_get_constraintdef(oid) from pg_constraint
--    where conrelid = 'public.profiles'::regclass and contype = 'c';
--
-- Debe mostrar 'individual' dentro de la lista.
