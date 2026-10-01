-- Sección de Ideas en PersonaLab. Pedido de Francisco, 2026-09-30
-- (valorado en docs/PENDIENTES.md P-022): "que nosotros podamos anotar
-- ideas y que queden ahí registradas." No existía nada parecido -- se
-- buscó en todo el código y lo único que aparecía con "idea" era
-- vocabulario de contenido de retiro, no una funcionalidad. Terreno nuevo
-- de punta a punta, sin tabla que reaprovechar.
--
-- SIN POLÍTICAS DE RLS, A PROPÓSITO. Todo el acceso pasa por los server
-- actions de `app/(admin)/personalab/ideas/actions.ts` y el loader de
-- `lib/personalab/ideas.ts`, que ya exigen `exigirEquipo()` antes de tocar
-- la tabla con el cliente de servicio -- mismo patrón que
-- `experiencias/actions.ts`. RLS habilitada sin ninguna política
-- permisiva es la postura segura por defecto: ni siquiera con la llave
-- anónima se puede leer o escribir esta tabla directo, solo el cliente de
-- servicio (que RLS no alcanza) puede, y ese cliente solo lo usa código
-- ya guardado por `exigirEquipo()`.
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  texto text not null check (char_length(trim(texto)) > 0),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.ideas enable row level security;
