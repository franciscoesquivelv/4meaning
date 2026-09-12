-- ============================================================
-- EL MARCADOR SOLO SE MUEVE DENTRO DE UNA EXPERIENCIA CON GRANT
-- ============================================================
--
-- Hallazgo de Hugo, en la meta-auditoría del Consejo del 2026-09-11: las
-- políticas de `insert` y `update` de `bookmarks` (`20260911_0900_
-- personalab_modo_digital.sql:137-142`) solo verifican `profile_id =
-- auth.uid()`. Ninguna de las dos revisa que `experience_id` sea una
-- experiencia sobre la que esa persona de verdad tenga grant.
--
-- `experience_id` es parte de la llave primaria de `bookmarks`
-- (`profile_id, experience_id`), así que un `update` puede cambiarlo: mover
-- la fila de una experiencia a otra. Con la FK compuesta que se agregó hoy
-- (`20260911_1600_marcador_solo_avanza.sql`), ese `hinge_id` tendría que
-- pertenecer de verdad a la experiencia nueva, pero nada impedía que la
-- experiencia nueva fuera una sin grant.
--
-- Hugo mismo lo calificó de severidad BAJA, no bloqueante: no es un oráculo
-- explotable (acertar un `hinge_id` real de una experiencia ajena es un
-- espacio de 128 bits) y no da acceso a contenido, porque `hinges`/`blocks`
-- tienen su propia RLS de todas formas. Se cierra igual, porque es la misma
-- tabla que ya se tocó hoy y el costo de dejarlo abierto es cero.
--
-- `pl_nivel_audiencia(exp)` ya es el helper que decide esto en todo el resto
-- del esquema (`20260813_personalab_contenido.sql:309-333`): >0 significa
-- que la persona tiene grant vivo, es moderador, o es equipo.

drop policy if exists "cada quien mueve su marcador" on public.bookmarks;
create policy "cada quien mueve su marcador" on public.bookmarks
  for insert with check (
    profile_id = auth.uid()
    and public.pl_nivel_audiencia(experience_id) > 0
  );

drop policy if exists "cada quien actualiza su marcador" on public.bookmarks;
create policy "cada quien actualiza su marcador" on public.bookmarks
  for update using (profile_id = auth.uid())
          with check (
            profile_id = auth.uid()
            and public.pl_nivel_audiencia(experience_id) > 0
          );

-- ── Comprobación ──────────────────────────────────────────
--
-- Como participante con grant solo sobre El Agradecimiento, intentar (con la
-- anon key, no desde el editor SQL) un upsert de `bookmarks` con
-- `experience_id` de "El Presente como Regalo": debe fallar la política, no
-- la FK.
