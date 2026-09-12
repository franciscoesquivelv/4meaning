-- ============================================================
-- EL MARCADOR SOLO AVANZA
-- ============================================================
--
-- Hallazgo de Leo en el Consejo del 2026-09-11 (Sesión 1, punto de
-- reproducibilidad): `MarcarVisto.tsx` mueve `bookmarks.hinge_id` cada vez
-- que se abre CUALQUIER bisagra, incluida "Anterior". Hoy es inofensivo
-- porque nada usa ese marcador para ocultar contenido.
--
-- Deja de serlo en cuanto el índice empiece a revelar solo lo recorrido (la
-- decisión de Sora de esa misma sesión: "se revela por apertura, no por
-- logro"). Si alguien que llegó a la bisagra 8 vuelve a leer la 3, el
-- marcador retrocedería y su propio índice se vería más corto de lo que en
-- verdad lleva.
--
-- Esta migración cierra eso ANTES de que exista ninguna pantalla que dependa
-- del marcador para esconder nada. Es integridad de datos, no diseño: no
-- pasa por Sora ni Julian, y por eso es la Etapa 0.
--
-- ── CORREGIDO ANTES DE APLICARSE (auditoría de Hugo, mismo día) ──────
--
-- La primera versión de esta función era `security definer`, y no
-- reimplementaba ningún control de acceso adentro (a diferencia de
-- `pl_nivel_audiencia()`, que sí lo hace). Hugo encontró el camino de
-- explotación completo: `bookmarks` no tiene ninguna relación que ate
-- `hinge_id` a su propio `experience_id`, y la política de `update` de
-- `bookmarks` solo verifica `profile_id = auth.uid()`. Cualquier
-- participante podía, con su propia anon key, escribir en su fila un
-- `hinge_id` de una experiencia sin grant, y el trigger corría con
-- privilegios elevados y sin control propio, así que consultaba `hinges`
-- saltándose la RLS que un `select` directo sí le habría aplicado. Lo que se
-- filtraba era metadata de secuencia (tiempo, orden), no contenido: severidad
-- media, no crítica, pero un oráculo real.
--
-- Dos capas, las dos de Hugo, las dos aquí desde el origen:
--
--   (a) `hinges` gana `unique (experience_id, id)`, y `bookmarks` gana una
--       FK compuesta contra esa pareja. La base ya no permite, de raíz, que
--       el `hinge_id` de una fila de `bookmarks` pertenezca a una
--       experiencia distinta de la que esa misma fila declara.
--
--   (b) La función deja de ser `security definer`. Corre como quien la
--       invoca, así que el `select` a `hinges` queda sujeto a la RLS real
--       ("pl lectura con acceso", `pl_nivel_audiencia(experience_id) > 0`).
--       Si la persona no tiene grant sobre esa experiencia, la consulta no
--       devuelve nada: el guardia que ya existía para "esta bisagra ya no
--       existe" (`tiempo_vieja/tiempo_nueva is not null`) cubre ese caso sin
--       tocarlo, dejando pasar la escritura sin comparar, sin filtrar nada.
--       Para quien SÍ tiene grant, que es el único caso real, la RLS deja
--       pasar la consulta exactamente igual que antes.

alter table public.hinges
  add constraint hinges_experiencia_id_unica unique (experience_id, id);

alter table public.bookmarks
  add constraint bookmarks_hinge_de_su_experiencia
  foreign key (experience_id, hinge_id)
  references public.hinges (experience_id, id);

comment on constraint bookmarks_hinge_de_su_experiencia on public.bookmarks is
  'Impide que el marcador de una experiencia apunte a una bisagra de otra. Agregada junto con solo_avanza_marcador(), por el mismo hallazgo de Hugo: sin esto, esa función (u otra futura) podía usarse para preguntarle a la base por bisagras fuera del grant de quien pregunta.';

create or replace function public.solo_avanza_marcador()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  tiempo_vieja  pl_tiempo;
  orden_vieja   int;
  tiempo_nueva  pl_tiempo;
  orden_nueva   int;
begin
  -- Nada que comparar si cualquiera de las dos posiciones es nula (por
  -- ejemplo, la persona todavía no había abierto ninguna bisagra), o si el
  -- marcador no está cambiando de bisagra.
  if old.hinge_id is not null
     and new.hinge_id is not null
     and old.hinge_id is distinct from new.hinge_id then

    -- Sin `security definer`: esta consulta corre con los privilegios de
    -- quien la invoca, sujeta a la RLS real de `hinges`. Ver la nota de
    -- arriba.
    select tiempo, orden into tiempo_vieja, orden_vieja
      from public.hinges where id = old.hinge_id;

    select tiempo, orden into tiempo_nueva, orden_nueva
      from public.hinges where id = new.hinge_id;

    -- Si cualquiera de las dos bisagras no es visible desde aquí (ya no
    -- existe, o la RLS la esconde porque quien escribe no tiene grant sobre
    -- ella), no hay con qué comparar: se deja pasar el cambio tal cual, en
    -- vez de bloquear un caso que no se puede evaluar.
    if tiempo_vieja is not null and tiempo_nueva is not null
       and (tiempo_nueva, orden_nueva) < (tiempo_vieja, orden_vieja) then
      -- Retroceso: se descarta en silencio, igual que el resto de este
      -- mecanismo. Releer algo de vuelta no cuenta como abandonar lo ya
      -- alcanzado.
      new.hinge_id := old.hinge_id;
      new.visto_at := old.visto_at;
    end if;
  end if;

  return new;
end;
$$;

comment on function public.solo_avanza_marcador() is
  'Evita que releer una bisagra anterior retroceda el marcador de "dónde te quedaste". Compara tiempo+orden de la bisagra vieja contra la nueva; si la nueva es anterior, mantiene la vieja. NO es security definer a propósito: la consulta a hinges debe quedar sujeta a la RLS real de quien escribe.';

drop trigger if exists antes_de_mover_marcador on public.bookmarks;
create trigger antes_de_mover_marcador
  before update on public.bookmarks
  for each row execute function public.solo_avanza_marcador();

-- ── Comprobación ──────────────────────────────────────────
--
-- 1. Como participante de prueba con acceso a El Agradecimiento, abrir la
--    bisagra 5, luego la bisagra 2 (con "Anterior" o por URL directa).
-- 2. select hinge_id from bookmarks where experience_id = '<id>' and
--    profile_id = '<tu id>';
-- 3. Debe seguir apuntando a la bisagra 5, no a la 2.
-- 4. Intentar, con la anon key, un PATCH a bookmarks con el hinge_id de una
--    experiencia SIN grant: debe fallar por la FK compuesta antes de llegar
--    siquiera a disparar el trigger.
