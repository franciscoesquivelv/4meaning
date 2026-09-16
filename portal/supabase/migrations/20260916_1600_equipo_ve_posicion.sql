-- ETAPA 6b. Reversa explícita de una decisión deliberada.
--
-- `bookmarks` nació con una sola regla de lectura: "cada quien ve su
-- marcador" (profile_id = auth.uid()). El equipo, a propósito, no tenía
-- ninguna política que le diera acceso — ni siquiera "pl equipo gestiona",
-- que todas las demás tablas de PersonaLab sí tienen. El comentario de la
-- migración original lo decía por escrito: "el equipo no lee: saber por
-- dónde va alguien en una experiencia íntima no le hace falta a nadie para
-- operar, y pedirlo sería recolección sin uso."
--
-- Ese supuesto ("sin uso") dejó de ser cierto. Preguntado directamente,
-- Francisco confirmó que sí hay un uso real: dar seguimiento a quién
-- compró y nunca empezó, o a quién se quedó a medias, para poder
-- acompañarlo. Es una decisión de negocio, no un hallazgo técnico, y por
-- eso se reversa con la misma explicitud con la que se cerró.
--
-- LO QUE SIGUE PROHIBIDO: el contenido. `bookmarks` no tiene columna de
-- contenido y nunca la tuvo — solo `hinge_id` (dónde) y `visto_at`
-- (cuándo). Esta reversa no abre ninguna puerta a lo que alguien escribió
-- o pensó, solo a POR DÓNDE VA. `returns` y `testimonies`, que sí son
-- reflexión de la persona, no se tocan aquí y siguen tan cerradas como
-- estaban.

drop policy if exists "pl equipo ve posicion" on public.bookmarks;
create policy "pl equipo ve posicion" on public.bookmarks
  for select using (public.is_staff());

comment on table public.bookmarks is
  'La última bisagra que abrió cada persona, para recibirla donde la dejó. No es progreso: no hay porcentaje ni racha, y está prohibido agregarlos. Desde el 2026-09-16 el equipo puede leerlo (posición, no contenido): decisión explícita del negocio, no un permiso por descuido.';

-- ── VERIFICACIÓN ────────────────────────────────────────────────────────
--   select policyname, cmd from pg_policies
--    where schemaname = 'public' and tablename = 'bookmarks';
--   -- debe listar "pl equipo ve posicion" junto a las tres de antes.
