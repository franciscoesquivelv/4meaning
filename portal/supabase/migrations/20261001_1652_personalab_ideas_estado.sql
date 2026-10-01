-- Estado por idea. Pedido de Francisco, 2026-10-01, después de ver la
-- sección recién construida (P-027): "la veo muy básica... qué me
-- recomiendas." Propuesta aceptada ("Sí, construye el estado"): una lista
-- plana que solo crece no distingue una idea buena sin resolver de una ya
-- descartada -- las dos se ven exactamente igual para siempre. Mismo
-- espíritu que ya rige `docs/PENDIENTES.md`: un hallazgo no cuenta como
-- cerrado hasta que su fila lo diga, y "adoptado y no hecho" no puede
-- verse igual que "descartado".
--
-- Cuatro estados, no dos (abierto/cerrado): "en progreso" y "descartada"
-- son verdades distintas de "hecha" -- una idea en progreso sigue viva,
-- una descartada no se perdió, se decidió activamente no hacerla.
alter table public.ideas
  add column if not exists estado text not null default 'abierta';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ideas_estado_check'
  ) then
    alter table public.ideas
      add constraint ideas_estado_check
      check (estado in ('abierta', 'en_progreso', 'hecha', 'descartada'));
  end if;
end $$;
