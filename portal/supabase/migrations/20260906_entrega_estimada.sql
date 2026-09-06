-- ============================================================
-- LA COLUMNA QUE FALTABA: families.entrega_estimada
--
-- QUE PASABA. La pantalla de Entregas anunciaba "No hay familias registradas
-- en este evento" y contaba 0/0, sobre un evento donde la pantalla de
-- Familias muestra cuatro. No era un evento vacio: la consulta fallaba y el
-- codigo descartaba el error, asi que el fallo se pintaba como vacio
-- legitimo. Con el error a la vista, Postgres lo dijo en una linea:
--
--   column families.entrega_estimada does not exist
--
-- DE DONDE VIENE. `002_phase1_pipeline.sql` anadio `storybook_status` y
-- `video_status` y se salto la tercera. El propio `entregas/page.tsx` lleva
-- las tres escritas en un comentario de cabecera bajo el rotulo "SQL to run
-- in Supabase"; dos se corrieron y una no. Como el esquema de este proyecto
-- se armo a mano en el dashboard, nada comparo lo que el codigo pide contra
-- lo que la base tiene, y la pantalla se quedo rota sin que nadie lo notara.
--
-- Es una fecha objetivo: para cuando se le prometio a la familia su
-- Storybook y su video. La pantalla la usa para marcar en rojo lo que ya se
-- paso de fecha y sigue sin entregar (`EntregaRow.tsx:78`, `isDelayed`).
-- Sin fecha no hay retraso posible, asi que nace nula y sin default: una
-- entrega sin fecha prometida no esta atrasada, esta sin comprometer.
-- ============================================================

alter table public.families
  add column if not exists entrega_estimada date;

comment on column public.families.entrega_estimada is
  'Fecha objetivo para entregar Storybook y video a esta familia. Nula mientras no se comprometa una. La pantalla de Entregas marca como atrasado lo que paso esta fecha sin entregarse.';

-- Verificacion. Debe devolver una fila:
--
--   select column_name, data_type, is_nullable
--     from information_schema.columns
--    where table_schema = 'public'
--      and table_name = 'families'
--      and column_name = 'entrega_estimada';
--
-- Y despues, la pantalla de Entregas debe mostrar las cuatro familias en vez
-- de "No hay familias registradas".
