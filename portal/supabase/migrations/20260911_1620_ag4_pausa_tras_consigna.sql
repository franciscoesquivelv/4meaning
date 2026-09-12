-- ============================================================
-- AG4 GANA SU PAUSA: EL CRITERIO DE SORA, APLICADO
-- ============================================================
--
-- Consejo del 2026-09-11. Elena propuso en la Sesión 1 que la pausa se
-- vuelva obligatoria antes y/o después de toda consigna que "abra algo".
-- Leo, en la Sesión 2, dejó el criterio exacto para Sora. Su dictamen:
--
--   "Una consigna abre algo cuando su objeto es que la persona busque, se
--    quede en, o exponga ante otro un recuerdo o estado puntual y cargado...
--    eso es lo que separa la consigna que merece pausa de la que no."
--
-- Aplicado a las nueve consignas reales de El Agradecimiento, solo tres la
-- cumplen: ag5 (g21) y ag7 (g34) ya la tienen, a mano. ag4 (g16, "busca un
-- momento en que alguien te sostuvo, con fecha, con lugar y con cara") la
-- cumple y no la tenía: pasaba directo de la consigna al gesto de
-- escribirlo, sin que el recuerdo asiente. Las otras seis consignas
-- (ag3, ag6, ag8, ag9, ag10, ag11) NO la necesitan, según el mismo dictamen,
-- y no se tocan.
--
-- Se inserta la pausa en el mismo lugar donde ya vive en ag5: después de la
-- consigna, antes del bloque de escritura.
--
-- ORDEN DE MIGRACIONES. Esta migración pisa el `orden` que la siembra
-- original (`20260911_0915_siembra_agradecimiento.sql`) le dio al gesto y a la
-- nota de ag4. Si esa siembra se volviera a correr DESPUÉS de esta, los
-- devolvería a su `orden` viejo. Se deja anotado para quien mantenga esto:
-- las migraciones de esta carpeta se corren una sola vez, en orden, nunca
-- se repiten sueltas.

update public.blocks set orden = 5
  where id = 'b2942b66-1f06-5e0d-b3e6-7cabc7b29b69'; -- gesto, ag4, escribir el momento (era orden 4)

update public.blocks set orden = 6
  where id = '49d7d568-5023-5757-a719-0ab3d8153a1b'; -- nota de moderador, ag4 (era orden 5)

insert into public.blocks (id, version_id, hinge_id, orden, tipo, audiencia, contenido)
values (
  'c27014c2-fa3d-47b3-86b2-69aa4f54def9',
  '98cde38b-d08a-5cdf-9bba-e475a60b5548', -- version_id de El Agradecimiento
  '0cbfc7f2-a3f1-5ddb-abe6-581b65d06fa0', -- hinge_id de ag4, "Alguien te sostuvo"
  4,
  'pausa',
  'todos',
  '{}'::jsonb
)
on conflict (id) do update set orden = excluded.orden;

-- ── Comprobación ──────────────────────────────────────────
--
-- select orden, tipo from public.blocks
--  where hinge_id = '0cbfc7f2-a3f1-5ddb-abe6-581b65d06fa0'
--  order by orden;
--
-- Debe salir, en este orden: 1 texto, 2 cita, 3 consigna, 4 pausa,
-- 5 gesto, 6 nota.
