-- ============================================================
-- PERSONALAB · Concurrencia optimista también en hinges (segmentos)
-- Corre DESPUÉS de 20260813_personalab_almacenamiento.sql
-- ============================================================
--
-- HALLAZGO REAL, ENCONTRADO AUDITANDO EL GUARDADO DEL EDITOR A PEDIDO DE
-- FRANCISCO (2026-09-29: "si yo tengo abierta mi cuenta y mi tía también,
-- al mismo tiempo... que nunca se vaya a perder información"). La
-- migración de `blocks` (`20260813_personalab_almacenamiento.sql`) ya lo
-- dice por escrito: "Dos personas editando la misma version se pisan en
-- silencio sin esto." Ese candado (`rev`, sube en cada UPDATE via
-- trigger, el cliente manda la que tenía y si no coincide recibe un
-- conflicto en vez de sobrescribir) se construyó para `blocks` y para
-- `experience_versions` el mismo día -- y nunca se extendió a `hinges`.
--
-- EL COSTO REAL, NO TEÓRICO: hasta hoy, si dos personas del equipo editan
-- el título o la descripción del MISMO segmento al mismo tiempo, ninguna
-- de las dos ve ningún aviso. El segundo guardado en llegar pisa al
-- primero en silencio, y quien lo escribió primero nunca se entera de
-- que se perdió. `guardarSeccionRemoto` ya tenía un candado -- pero solo
-- contra que la VERSIÓN entera dejara de ser el borrador vivo (alguien
-- publicó), nunca contra que otra persona editara esa MISMA fila.
--
-- Reusa `pl_subir_rev()`, la misma función genérica que ya usan `blocks` y
-- `experience_versions`: no hace falta escribirla de nuevo.

alter table public.hinges add column if not exists rev int not null default 1;

drop trigger if exists subir_rev on public.hinges;
create trigger subir_rev before update on public.hinges
  for each row execute function public.pl_subir_rev();

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'hinges' and column_name = 'rev'
  ) then
    raise exception 'hinges.rev no se creó.';
  end if;
end $$;
