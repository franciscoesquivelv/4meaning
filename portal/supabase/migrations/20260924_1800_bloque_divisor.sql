-- ── BLOQUE "DIVISOR" ────────────────────────────────────────────────
--
-- Pedido de Francisco, 2026-09-23/24: un separador visual entre bloques
-- dentro de una sección, sin contenido -- el mismo espíritu que `pausa`
-- (que ya es "el único separador que la marca admite", según el propio
-- comentario de bloques.ts), pero sin el piso de tiempo: es puramente
-- visual, un filete horizontal.
--
-- Mismo patrón que `audio` (20260911_0900_personalab_modo_digital.sql):
-- agregar el valor al enum, y reescribir la restricción para que el
-- tipo nuevo no nazca roto contra el `else` que exige texto.

alter type pl_tipo_bloque add value if not exists 'divisor';

-- Nota de método, igual que la migración de audio: Postgres no deja usar
-- un valor de enum recién agregado dentro de la misma transacción que lo
-- agregó, así que la comparación va como `tipo::text`, no como literal
-- del enum, y esta migración corre de una sola pasada.

alter table public.blocks drop constraint if exists blocks_contenido_por_tipo;
alter table public.blocks add constraint blocks_contenido_por_tipo check (
  case
    when tipo::text = 'pausa'   then true
    when tipo::text = 'divisor' then true
    when tipo::text = 'cita'    then coalesce(contenido->>'texto','') <> ''
    when tipo::text = 'objeto'  then coalesce(contenido->>'texto','') <> ''
    when tipo::text = 'archivo' then media_id is not null
    when tipo::text = 'imagen'  then media_id is not null
    when tipo::text in ('video','audio')
      then media_id is not null or coalesce(contenido->>'url','') <> ''
    else coalesce(contenido->>'texto','') <> ''
  end
);

-- ── Verificación ────────────────────────────────────────────────────

do $$
declare n int;
begin
  select count(*) into n
  from pg_enum e join pg_type t on e.enumtypid = t.oid
  where t.typname = 'pl_tipo_bloque' and e.enumlabel = 'divisor';
  if n = 0 then
    raise exception 'divisor no quedó en el enum pl_tipo_bloque.';
  end if;
end $$;

do $$
declare n int;
begin
  select count(*) into n
  from pg_constraint
  where conname = 'blocks_contenido_por_tipo'
    and conrelid = 'public.blocks'::regclass;
  if n = 0 then
    raise exception 'blocks_contenido_por_tipo no quedó instalada.';
  end if;
end $$;
