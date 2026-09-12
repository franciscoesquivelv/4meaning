-- ============================================================
-- DÓNDE VIVE "YA VIO LA BIENVENIDA"
-- ============================================================
--
-- Decisión del Consejo del 2026-09-11 (Julian, pregunta 2 de la Sesión 1;
-- Leo, Sesión 2): el umbral de bienvenida de una experiencia se recuerda por
-- CUENTA, no por navegador. `FirstTimeWelcome.tsx` usa `localStorage`, y esa
-- es la forma equivocada para un producto pagado que se puede retomar desde
-- otro dispositivo. Se extiende `bookmarks`, que ya es la fila correcta (una
-- por persona y experiencia), en vez de nacer una tabla nueva.
--
-- `hinge_id` deja de ser obligatorio porque ahora existe un estado real
-- entre "compró la experiencia" y "abrió su primera bisagra": vio la
-- bienvenida, y todavía no hay ninguna bisagra que apuntar. Antes de esta
-- migración ese estado no tenía manera honesta de guardarse.

alter table public.bookmarks
  alter column hinge_id drop not null;

alter table public.bookmarks
  add column if not exists bienvenida_vista_at timestamptz;

comment on column public.bookmarks.hinge_id is
  'La última bisagra abierta. Nula si la persona vio la bienvenida pero todavía no abrió ninguna.';

comment on column public.bookmarks.bienvenida_vista_at is
  'Cuándo esta persona vio la pantalla de bienvenida de esta experiencia. Nulo hasta entonces. Misma fila que ya guarda dónde se quedó, no es progreso.';

-- ── Comprobación ──────────────────────────────────────────
--
-- select column_name, is_nullable from information_schema.columns
--  where table_schema='public' and table_name='bookmarks'
--  order by column_name;
--
-- `hinge_id` debe salir con is_nullable = YES, y debe aparecer
-- `bienvenida_vista_at`.
