-- ============================================================
-- EL PRESENTE COMO REGALO · estructura del modo digital
--
-- Corre DESPUÉS de 20260911_personalab_modo_digital.sql.
--
-- Arma el esqueleto vacío para que se pueda ver en su sitio y llenarlo.
-- No trae contenido: los cuatro tramos están escritos como títulos y
-- descripciones, y los momentos de cada uno se escriben después.
-- ============================================================


-- ── 1. El tramo ───────────────────────────────────────────────────────
--
-- POR QUÉ NO SE LLAMA "BLOQUE". La especificación los llama "bloques
-- temáticos", pero en esta base `blocks` ya nombra otra cosa: los fragmentos
-- de contenido dentro de una pantalla (un texto, una cita, una pausa). Usar
-- la misma palabra para las dos cosas es exactamente el defecto que se contó
-- en la otra marca: ocho grupos de vocabulario duplicado, cinco nombres para
-- un mismo formulario.
--
-- "Tramo" ya es palabra de la casa (así se agrupan los momentos del retiro de
-- Trascendencia) y no choca con nada.
--
-- POR QUÉ HACE FALTA. Un tramo agrupa varios momentos, y un momento es una
-- bisagra, que es una pantalla. Sin este campo, finitud sería una sola
-- pantalla larga en vez de las varias que la especificación pide.
--
-- Es nulable a propósito: El Agradecimiento no tiene tramos y no debe
-- inventárselos. Cuando es nulo, la lista va plana.

alter table public.hinges
  add column if not exists tramo text;

comment on column public.hinges.tramo is
  'Agrupación temática de momentos dentro de una experiencia digital. Nulo cuando la experiencia no se agrupa. No se llama "bloque" porque esa palabra ya nombra los fragmentos de contenido.';

create index if not exists hinges_tramo_idx
  on public.hinges (experience_id, tramo, orden);


-- ── 2. La experiencia y su versión ────────────────────────────────────
--
-- El Presente como Regalo ya existe como diseño presencial en el prototipo,
-- con cinco bisagras que son el andamio del moderador (invitación, sesión de
-- sala, carta, capa mensual, entrega). Eso NO es el contenido digital.
--
-- Decidido por Francisco el 2026-09-10: es una sola experiencia con dos
-- formas de entregarla. Por eso comparte la fila y lo que cambia es el modo
-- de cada bisagra.

insert into public.experiences (slug, nombre, subtitulo, duracion, maduracion, abre_espacio_al_foro)
values (
  'presente-regalo',
  'El Presente como Regalo',
  '',
  'A tu ritmo',
  'piloto',
  false
)
on conflict (slug) do update set
  nombre = excluded.nombre;

insert into public.experience_versions (experience_id, numero, estado, notas, publicada_at)
select id, 1, 'publicada', 'Esqueleto del modo digital. Sin contenido todavía.', now()
  from public.experiences where slug = 'presente-regalo'
on conflict (experience_id, numero) do update set estado = 'publicada';


-- ── 3. Los cuatro tramos ──────────────────────────────────────────────
--
-- Uno por tema, con un momento cada uno para empezar. Cuando finitud necesite
-- cuatro pantallas, se agregan tres bisagras más con el mismo `tramo` y la
-- lista se agrupa sola.
--
-- `tiempo` va en 'ignicion' para las cuatro. El modelo de tiempos
-- (víspera / ignición / retorno) se hizo para el presencial, donde la víspera
-- prepara y el retorno sostiene a seis meses. En el digital no hay víspera,
-- porque la persona empieza cuando compra, y el retorno se decidió dejar para
-- después. Queda todo en ignición, que es lo honesto: es lo único que hay.
--
-- `listo` va en false: el esqueleto existe, el contenido no.
--
-- Va dentro de un bloque con guarda porque `hinges` no tiene clave natural, y
-- sin esto correr la migración dos veces crearía ocho tramos en vez de cuatro.

do $$
declare
  exp_id uuid;
begin
  select id into exp_id from public.experiences where slug = 'presente-regalo';

  if not exists (
    select 1 from public.hinges
     where experience_id = exp_id and tramo is not null
  ) then
    insert into public.hinges (experience_id, tiempo, orden, titulo, descripcion, soporte, modo, tramo, listo)
    values
      (exp_id, 'ignicion', 1, 'Finitud',
       'Que esto se acaba, y que saberlo cambia lo que hay.',
       'pantalla', 'digital', 'finitud', false),

      (exp_id, 'ignicion', 2, 'Gratitud',
       'Lo que ya está aquí y no se está mirando.',
       'pantalla', 'digital', 'gratitud', false),

      (exp_id, 'ignicion', 3, 'Silencio',
       'Bajar el ruido lo suficiente para oír lo que hay debajo.',
       'pantalla', 'digital', 'silencio', false),

      (exp_id, 'ignicion', 4, 'Perdón',
       'Lo que sigue pesando, y qué se hace con eso.',
       'pantalla', 'digital', 'perdon', false);
  end if;
end $$;


-- ── 4. Comprobación ───────────────────────────────────────────────────
--
--   select h.tramo, h.orden, h.titulo, h.modo, h.listo
--     from public.hinges h
--     join public.experiences e on e.id = h.experience_id
--    where e.slug = 'presente-regalo' and h.tramo is not null
--    order by h.orden;
--
-- Deben salir cuatro filas, todas en modo 'digital' y con listo en false.
