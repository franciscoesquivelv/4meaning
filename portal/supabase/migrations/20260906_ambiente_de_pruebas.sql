-- ============================================================
-- AMBIENTE DE PRUEBAS: MARCADO Y REVERSIBLE
--
-- Todo lo que hay hoy en el portal es ficticio. Las cuatro familias, los
-- acuerdos, el itinerario, las entregas: nada de eso paso. Sirve para guiar
-- y para tener algo estable que mirar mientras se construye.
--
-- El problema de tener datos falsos sin marcar es que a los seis meses ya
-- nadie se acuerda de cuales eran. Esta migracion hace dos cosas:
--
--   1. Marca lo que existe hoy como prueba, con una bandera en `events`.
--      Todo lo demas cuelga de un evento, asi que la bandera de arriba
--      alcanza para todo el arbol.
--   2. Deja escrita la manera de borrarlo, entera y de una sola vez.
--
-- NO BORRA NADA AL CORRERSE. Crea la funcion y la deja quieta. El borrado
-- ocurre solo cuando alguien la llama a proposito.
-- ============================================================


-- ── 1. La bandera ─────────────────────────────────────────────────────
--
-- Vive en `events` y no en `families` porque el evento es la raiz: todas las
-- demas tablas del portal llevan `event_id`, o cuelgan de algo que lo lleva.
-- Una bandera por familia se podria contradecir con la de su evento; una
-- sola arriba, no.

alter table public.events
  add column if not exists es_prueba boolean not null default false;

comment on column public.events.es_prueba is
  'Evento de prueba. Sus datos son ficticios y se pueden borrar en cualquier momento con borrar_datos_de_prueba(). Ver 20260906_ambiente_de_pruebas.sql';


-- ── 2. Marcar lo que existe hoy ───────────────────────────────────────
--
-- Todo lo que hay al 2026-09-06 es de prueba, declarado por Francisco.
-- La condicion de fecha existe para que, si esta migracion se vuelve a
-- correr despues de que entren eventos reales, no los marque a ellos.

update public.events
   set es_prueba = true
 where created_at < '2026-09-07'::timestamptz
   and es_prueba is false;


-- ── 3. El borrado, escrito una vez ────────────────────────────────────
--
-- POR QUE UNA FUNCION Y NO UN SCRIPT SUELTO. Un script se copia mal, se
-- corre a medias, y deja huerfanos que nadie vuelve a encontrar. Esto corre
-- entero o no corre: si algo falla, la transaccion se deshace completa.
--
-- POR QUE `to_regclass` EN CADA TABLA. El esquema de este proyecto se armo
-- a mano en el dashboard, no por migraciones, asi que el repositorio no sabe
-- con certeza que tablas existen. `to_regclass` devuelve null cuando la tabla
-- no esta, y entonces esa linea se salta en vez de reventar. Anadir una tabla
-- nueva aqui es seguro aunque todavia no exista.
--
-- ORDEN: hijos antes que padres. Primero lo que cuelga de families, luego
-- families, luego lo que cuelga del evento, y el evento al final.
--
-- LO QUE ESTA FUNCION NO HACE, Y HAY QUE HACERLO APARTE: no toca `auth.users`.
-- Las cuentas de prueba de los participantes se borran desde el dashboard de
-- Supabase, en Authentication, a mano. Borrar usuarios por SQL es justo el
-- tipo de cosa que no debe quedar automatizada en una funcion.

create or replace function public.borrar_datos_de_prueba()
returns table (tabla text, filas_borradas bigint)
language plpgsql
as $$
declare
  hijas_de_familia text[] := array[
    'intake_responses', 'compromisos', 'agreements', 'documents', 'media'
  ];
  hijas_de_evento text[] := array[
    'agreements', 'announcements', 'checklist_items', 'documents',
    'event_content_blocks', 'event_tasks', 'event_team', 'itinerary_items',
    'media', 'intake_responses'
  ];
  t text;
  n bigint;
begin
  -- Lo que cuelga de una familia de prueba, por si no lleva `event_id` propio.
  foreach t in array hijas_de_familia loop
    if to_regclass('public.' || t) is not null then
      execute format(
        'delete from public.%I where family_id in (
           select f.id from public.families f
             join public.events e on e.id = f.event_id
            where e.es_prueba)', t);
      get diagnostics n = row_count;
      if n > 0 then tabla := t; filas_borradas := n; return next; end if;
    end if;
  end loop;

  -- Lo que cuelga del evento.
  foreach t in array hijas_de_evento loop
    if to_regclass('public.' || t) is not null then
      execute format(
        'delete from public.%I where event_id in (
           select id from public.events where es_prueba)', t);
      get diagnostics n = row_count;
      if n > 0 then tabla := t; filas_borradas := n; return next; end if;
    end if;
  end loop;

  delete from public.families
   where event_id in (select id from public.events where es_prueba);
  get diagnostics n = row_count;
  if n > 0 then tabla := 'families'; filas_borradas := n; return next; end if;

  delete from public.events where es_prueba;
  get diagnostics n = row_count;
  if n > 0 then tabla := 'events'; filas_borradas := n; return next; end if;

  return;
end
$$;

-- A PROPOSITO SIN PERMISOS. No se le da `execute` a `anon` ni a
-- `authenticated`, asi que ninguna pantalla del portal puede llamarla ni por
-- accidente ni por un fallo de RLS. Se corre a mano desde el editor SQL de
-- Supabase, que es donde una decision de borrar todo debe tomarse.
revoke all on function public.borrar_datos_de_prueba() from public;
revoke all on function public.borrar_datos_de_prueba() from anon, authenticated;


-- ── 4. Como se usa ────────────────────────────────────────────────────
--
-- Ver que hay marcado como prueba, antes de tocar nada:
--
--   select nombre, ciudad, fecha_inicio, es_prueba from public.events
--    order by es_prueba desc, fecha_inicio;
--
-- Contar que se borraria, SIN borrarlo:
--
--   select count(*) from public.families f
--     join public.events e on e.id = f.event_id
--    where e.es_prueba;
--
-- Borrar, de verdad, todo lo de prueba:
--
--   select * from public.borrar_datos_de_prueba();
--
-- Devuelve una fila por tabla con cuantas borro, para que quede constancia.
--
-- Sacar un evento del ambiente de pruebas, cuando pase a ser real:
--
--   update public.events set es_prueba = false where id = '<id>';
