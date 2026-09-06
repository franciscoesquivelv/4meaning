-- ============================================================
-- UNA SOLA COLUMNA PARA EL ESTADO DEL VIDEO
--
-- QUE PASABA. El estado del video familiar vivia en dos columnas que no se
-- hablaban:
--
--   families.video_entregado     boolean      lo escribia la pantalla de
--                                             Familias, y lo leian Familias
--                                             y la pantalla Hoy.
--   families.video_status        text         lo escribe la pantalla de
--                                             Entregas, y es lo que lee la
--                                             app de la pareja.
--
-- Apretar "Marcar entregado" en Familias le avisaba al equipo y no le avisaba
-- a la familia: su app seguia diciendo "Pendiente" sobre un video que ya
-- tenian. Es la misma falla que el Storybook tuvo durante meses y que
-- `portal/lib/entregas.ts` documenta como corregida; sobrevivio del lado del
-- video.
--
-- QUE HACE ESTA MIGRACION. `video_status` es la columna que manda: tiene el
-- CHECK de 002_phase1_pipeline.sql y ya la leen la pareja y Entregas. Aqui se
-- rescata lo que se marco por el lado viejo y se dan de baja las dos columnas
-- que quedaron sin lector en el codigo.
--
-- EL CODIGO YA NO LAS USA. Verificado antes de escribir esto: despues del
-- cambio, `video_entregado` no aparece en ninguna consulta ni en ninguna
-- pantalla del portal, solo en los comentarios que explican por que se fue.
-- Correr esta migracion no rompe nada.
--
-- ORDEN: primero el rescate, despues la baja. Si se corre solo la segunda
-- mitad se pierden las marcas viejas.
-- ============================================================

-- ── 1. Rescate. Toda familia marcada por el lado viejo pasa al bueno ──
--
-- Solo sube el estado, nunca lo baja: una familia que Entregas ya movio a
-- 'entregado' se queda como esta, y una que estaba en 'en_produccion' con el
-- boolean en true pasa a 'entregado', que es lo que el equipo quiso decir.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'families'
      and column_name  = 'video_entregado'
  ) then

    update public.families
       set video_status = 'entregado',
           video_fecha  = coalesce(
             video_fecha,
             (video_entregado_at at time zone 'America/Mexico_City')::date
           )
     where video_entregado is true
       and video_status is distinct from 'entregado';

  end if;
end
$$;

-- ── 2. Baja de las columnas sin lector ────────────────────────────────

alter table public.families
  drop column if exists video_entregado,
  drop column if exists video_entregado_at;

-- ── 3. Como se verifica ───────────────────────────────────────────────
--
-- Despues de correrla, esto debe devolver cero filas:
--
--   select column_name
--     from information_schema.columns
--    where table_schema = 'public'
--      and table_name = 'families'
--      and column_name in ('video_entregado', 'video_entregado_at');
--
-- Y este conteo debe coincidir con el numero que pinta la pantalla de
-- Familias en "Videos entregados", que ahora es el mismo que ve la pareja:
--
--   select count(*) from public.families
--    where event_id = '<id del evento>' and video_status = 'entregado';
