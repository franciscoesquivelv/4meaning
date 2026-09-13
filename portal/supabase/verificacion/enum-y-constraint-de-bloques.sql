-- ============================================================
-- QUÉ TIPOS DE BLOQUE ACEPTA LA BASE DESPLEGADA, DE VERDAD
--
-- NO CAMBIA NADA. Son dos consultas de lectura.
--
-- POR QUÉ EXISTE. `contrato-contra-sql.mjs` compara el contrato de bloque
-- contra el TEXTO de las migraciones, y con eso basta mientras el esquema se
-- aplique solo por migraciones. Este proyecto no es así: el esquema se armó a
-- mano en el editor de Supabase, y ya costó una vez (`families.entrega_estimada`
-- llevaba meses sin existir y la pantalla se veía vacía en vez de rota). Esta
-- es la mitad que el script no alcanza a ver.
--
-- CUÁNDO SE CORRE. En la misma sentada en que se pega una migración que toque
-- `pl_tipo_bloque` o `blocks_contenido_por_tipo`, y en el checklist de
-- publicación. Cuesta diez segundos.
--
-- CÓMO SE LEE. Corre antes `node supabase/verificacion/contrato-contra-sql.mjs`,
-- que dice cuántos tipos conoce el código. Si el número de abajo no coincide,
-- o si la definición del constraint no es la de la última migración, alguien
-- tocó la base a mano y el código no se enteró. Eso es exactamente lo que pasó
-- con `audio`, que vivió dos días en la base pintándose como nada.

-- ── 1. Los tipos que el enum acepta hoy ──────────────────────
select
  count(*)                                as tipos_en_la_base,
  string_agg(valor, ', ' order by valor)  as lista
from unnest(enum_range(null::pl_tipo_bloque)::text[]) as valor;

-- ── 2. La restricción que gobierna qué exige cada tipo ───────
-- Compárala a ojo con la última migración que la define. Si difieren, manda
-- esta: es la que rechaza los inserts.
select
  conname                              as restriccion,
  pg_get_constraintdef(oid)            as definicion_en_la_base
from pg_constraint
where conrelid = 'public.blocks'::regclass
  and conname  = 'blocks_contenido_por_tipo';
