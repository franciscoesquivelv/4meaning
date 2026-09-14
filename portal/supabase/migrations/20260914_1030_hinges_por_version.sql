-- ============================================================
-- ETAPA 2 DEL EDITOR: LA VERSIÓN CUBRE LA BISAGRA
--
-- Hasta hoy, `pl_abrir_borrador` protegía los párrafos (`blocks`) y dejaba
-- sueltos el título, el orden, el `modo` y el `listo` de cada sección
-- (`hinges`): esos campos se editaban EN VIVO, directo sobre lo publicado,
-- sin borrador y sin publicar. Poner `listo = false` en una sección
-- publicada la desaparecía del lector en el acto. Hallazgo de Leo y Daniel,
-- 2026-09-13.
--
-- Y UN SEGUNDO HALLAZGO, MÁS GRAVE: la RLS de lectura de `hinges` no
-- filtraba por versión en absoluto porque `hinges` no tenía versión.
-- Cualquiera con acceso (nivel > 0, o sea cualquier participante) podía leer
-- TODAS las bisagras de una experiencia, borrador incluido, el día que
-- existiera un borrador. Esta migración lo cierra junto con lo demás.
--
-- QUÉ HACE ESTA MIGRACIÓN, en orden:
--   1. `hinges` gana `version_id`, con las filas existentes migradas SIN
--      cambiar su id (para no huerfanar los `bookmarks` y `blocks` que ya
--      las referencian).
--   2. `hinges.experience_id` SE QUEDA, a propósito, y no es el diseño
--      original de esta migración: la primera versión la retiraba (para
--      derivarla de `version_id`, igual que ya hace `blocks`), hasta que una
--      relectura encontró que `bookmarks_hinge_de_su_experiencia`
--      (hallazgo de seguridad de Hugo, 2026-09-11) es una FK COMPUESTA que
--      depende literalmente de esa columna para existir: impide que el
--      marcador de una persona apunte a una bisagra de una experiencia
--      distinta a la que declara. Quitar la columna habría apagado esa
--      defensa sin decirlo en ningún lado. En vez de eso, se cierra el
--      riesgo de que las dos columnas se desincronicen con el MISMO patrón
--      que Hugo ya usó ahí: una FK compuesta que obliga a que el
--      `experience_id` de cada bisagra coincida con el de su versión.
--   3. `pl_abrir_borrador` copia bisagras además de bloques, y REMAPEA
--      `blocks.hinge_id` a las bisagras nuevas del borrador.
--   4. `pl_puede_ver_version()`: una versión se puede leer si está
--      publicada, o si está retirada Y quien pregunta ya estaba anclado ahí
--      (su marcador apunta a una bisagra de esa versión exacta). Esto es lo
--      que hace posible la Regla 3: quien empezó a leer no se mueve el piso
--      debajo cuando el equipo publica de nuevo. Se usa desde `hinges`,
--      `blocks` y `pl_puede_ver_medio`, los tres puntos donde el lector
--      toca contenido versionado.
--   5. La compuerta de "gestiona" del equipo, para `hinges` y `blocks`
--      exclusivamente, se restringe a la versión en borrador. Sin esto, el
--      sistema de versiones es decorativo: cualquiera del equipo podía
--      seguir escribiendo directo sobre lo publicado por otra vía.
--   6. El mismo patrón de FK compuesta, una vez más: `blocks` contra
--      `hinges`, para que un bloque no pueda declarar una versión distinta
--      a la de su propia bisagra. Encontrado por Hugo y por Daniel por
--      separado, auditando esta misma migración.
--
-- LO QUE NO SE TOCA: las otras doce tablas de la compuerta genérica
-- ('experiences', 'media', 'kit_pieces', 'chapters', ...) siguen con
-- `is_staff()` sin condición, porque no tienen concepto de versión.
--
-- UN COSTO QUE ESTA MIGRACIÓN ACEPTA A PROPÓSITO, NOMBRADO PARA QUE NADIE
-- LO DESCUBRA DESPUÉS. Hallazgo de Hugo: cada `pl_abrir_borrador` duplica
-- TODAS las bisagras de la experiencia (antes solo duplicaba bloques), y no
-- existe ninguna política de borrado en todo el proyecto. Las filas de
-- versiones retiradas se acumulan para siempre. Hoy con cero ciclos
-- borrador→publicar completados en producción esto es teórico; deja de
-- serlo en cuanto el editor real (Etapa 3) empiece a usarse a diario. La
-- única válvula que existe hoy es manual: `experience_versions` sigue sin
-- restricción en su propia compuerta de "gestiona" (`is_staff()` puro), así
-- que alguien del equipo puede borrar a mano una versión retirada vieja y
-- el `on delete cascade` se lleva sus hinges y blocks. ESA MISMA CASCADA
-- también borra en silencio cualquier `bookmarks` de alguien que siga
-- anclado ahí (poco probable para una versión vieja, pero no imposible). No
-- es una purga diseñada, es una capacidad cruda que ya existía. Diseñar la
-- purga de verdad es trabajo de una etapa futura, no de esta.
--
-- CÓMO SE VERIFICÓ, a falta de un entorno local para `db reset` (el CLI no
-- está enlazado a este proyecto desde esta sesión): se leyó el estado real
-- de producción antes de escribir esto. Hoy hay 3 experiencias con
-- contenido (31 bisagras en total), cada una con como mucho UNA fila en
-- `experience_versions`, así que el backfill del paso 1 no tiene ningún
-- caso ambiguo que resolver. Los 7 `bookmarks` reales existentes quedan
-- intactos porque ninguna bisagra cambia de id.

-- ── 1. `hinges` gana version_id, sin tocar los ids existentes ──────────

alter table public.hinges
  add column if not exists version_id uuid references public.experience_versions(id) on delete cascade;

-- Cada bisagra existente se asigna a la ÚNICA versión de su experiencia hoy
-- (publicada si existe, o la que haya si no). Es una actualización de
-- columna, no una reinserción: el id de la fila no cambia, así que todo lo
-- que ya apunta a ella (bookmarks.hinge_id, blocks.hinge_id) sigue siendo
-- válido sin tocar nada más.
update public.hinges h
set version_id = v.id
from (
  select distinct on (experience_id) id, experience_id
  from public.experience_versions
  order by experience_id, (estado = 'publicada') desc, numero desc
) v
where v.experience_id = h.experience_id
  and h.version_id is null;

-- Si alguna bisagra se quedó sin versión (una experiencia con bisagras y
-- cero filas en experience_versions), es un estado que esta migración no
-- sabe resolver solo y no debe seguir en silencio.
do $$
declare n int;
begin
  select count(*) into n from public.hinges where version_id is null;
  if n > 0 then
    raise exception
      '% bisagra(s) sin ninguna experience_version a la cual asignarse. Revisar a mano antes de continuar.', n;
  end if;
end $$;

alter table public.hinges alter column version_id set not null;

-- ── 2. experience_id se queda, pero deja de poder desincronizarse ───────
--
-- El mismo patrón que ya usa `bookmarks_hinge_de_su_experiencia`: una FK
-- compuesta contra una pareja (id, experience_id) que ya es única porque
-- `id` ya es la llave primaria. Con esto, la base rechaza de raíz cualquier
-- fila de `hinges` cuyo `experience_id` no coincida con el de la versión
-- que declara en `version_id`. No es una comprobación de aplicación: es
-- estructural, igual que la de Hugo.

alter table public.experience_versions
  drop constraint if exists experience_versions_id_experiencia_unica;
alter table public.experience_versions
  add constraint experience_versions_id_experiencia_unica unique (id, experience_id);

alter table public.hinges
  drop constraint if exists hinges_version_de_su_experiencia;
alter table public.hinges
  add constraint hinges_version_de_su_experiencia
  foreign key (version_id, experience_id)
  references public.experience_versions (id, experience_id);

comment on constraint hinges_version_de_su_experiencia on public.hinges is
  'Impide que una bisagra declare una version_id de una experiencia distinta a su propio experience_id. Mismo patrón que bookmarks_hinge_de_su_experiencia. OJO, para quien lea esto pensando que protege la RLS: no la protege. Ni pl_puede_ver_version() ni la política de lectura ni "gestiona" leen hinges.experience_id; todas derivan la experiencia real desde experience_versions. Lo que esta FK protege es integridad y disponibilidad: que bookmarks_hinge_de_su_experiencia se pueda seguir verificando, y que versionAnclada()/ultimaVista() en lectura.ts no le muestren a alguien una página vacía bajo el slug equivocado si las dos columnas se desincronizaran. Hallazgo de Hugo, 2026-09-14: la primera redacción de este comentario sugería más de lo que la FK de verdad hace.';

-- Las consultas de lectura ahora filtran por version_id, no por
-- experience_id directo (ver lectura.ts, versionAnclada). Los índices
-- viejos servían al patrón viejo; estos sirven al nuevo. La columna
-- experience_id sigue teniendo su propio índice implícito vía el unique
-- constraint de arriba y vía `hinges_experiencia_id_unica`, así que no
-- pierde cobertura para lo que todavía la usa (la FK de bookmarks).

-- ── 2b. El mismo patrón, un nivel abajo: blocks contra hinges ───────────
--
-- Encontrado por Hugo Y por Daniel, cada uno por su cuenta, mirando esta
-- misma migración: `blocks` tiene `hinge_id` y `version_id` como dos FK
-- SUELTAS, sin nada que obligue a que el hinge referenciado pertenezca a
-- esa misma versión. Hoy no es explotable (`pl_abrir_borrador` es el único
-- camino que escribe blocks, y siempre los copia junto con la bisagra que
-- les corresponde), pero es la MISMA forma de hueco que se acaba de cerrar
-- arriba, y dejarlo abierto "porque hoy no se usa" es exactamente lo que le
-- pasó a `hinges` antes de esta migración. Verificado contra los 78 blocks
-- reales de producción antes de agregar esto: cero filas inconsistentes,
-- así que la FK no tiene nada que rechazar en los datos que ya existen.

alter table public.hinges
  drop constraint if exists hinges_id_version_unica;
alter table public.hinges
  add constraint hinges_id_version_unica unique (id, version_id);

alter table public.blocks
  drop constraint if exists blocks_version_de_su_bisagra;
alter table public.blocks
  add constraint blocks_version_de_su_bisagra
  foreign key (hinge_id, version_id)
  references public.hinges (id, version_id);

comment on constraint blocks_version_de_su_bisagra on public.blocks is
  'Impide que un bloque declare una version_id distinta a la de la bisagra que dice ser suya (hinge_id). Sin explotación conocida hoy porque pl_abrir_borrador es el único escritor y siempre los mantiene en pareja, pero es estructural, no por convención: si algún día almacenRemoto.ts u otro camino escribe blocks directo, la base rechaza el caso roto en vez de aceptarlo en silencio.';

drop index if exists hinges_experiencia_idx;
drop index if exists hinges_tramo_idx;
drop index if exists hinges_modo_idx;

create index if not exists hinges_version_idx
  on public.hinges (version_id, tiempo, orden);
create index if not exists hinges_version_tramo_idx
  on public.hinges (version_id, tramo, orden);
create index if not exists hinges_version_modo_idx
  on public.hinges (version_id, modo, tiempo, orden);

comment on column public.hinges.version_id is
  'De qué versión es esta bisagra. La lectura filtra por aquí, no por experience_id: eso es lo que hace posible que una versión retirada siga siendo legible para quien ya estaba anclado ahí.';

-- ── 3. pl_abrir_borrador copia bisagras, no solo bloques ────────────────
--
-- LA PARTE QUE HAY QUE LEER DOS VECES: el `with mapa as materialized (...)`
-- genera un uuid nuevo por bisagra UNA sola vez, y ese mismo uuid se usa
-- tanto para insertar la bisagra copiada como para remapear
-- `blocks.hinge_id` al copiar los bloques. Sin el `materialized` explícito,
-- Postgres tiene permiso de volver a evaluar el CTE por cada referencia, y
-- `gen_random_uuid()` generaría un id DISTINTO cada vez: los bloques
-- copiados quedarían apuntando a una bisagra que no es la que se insertó.
-- El `materialized` no es estilo, es lo que hace correcto todo lo demás.

create or replace function public.pl_abrir_borrador(exp uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_origen uuid;
  v_nuevo  uuid;
  v_numero int;
begin
  if not public.pl_es_equipo() then
    raise exception 'Solo el equipo puede abrir un borrador.' using errcode = '42501';
  end if;

  select id into v_nuevo
  from public.experience_versions
  where experience_id = exp and estado = 'borrador'
  limit 1;

  if v_nuevo is not null then
    return v_nuevo;
  end if;

  select id into v_origen
  from public.experience_versions
  where experience_id = exp and estado = 'publicada'
  limit 1;

  select coalesce(max(numero), 0) + 1 into v_numero
  from public.experience_versions
  where experience_id = exp;

  insert into public.experience_versions (experience_id, numero, estado)
  values (exp, v_numero, 'borrador')
  returning id into v_nuevo;

  if v_origen is not null then
    with mapa as materialized (
      select
        h.id as vieja, gen_random_uuid() as nueva,
        h.tiempo, h.orden, h.titulo, h.descripcion, h.soporte, h.duracion,
        h.requiere, h.listo, h.modo, h.tramo
      from public.hinges h
      where h.version_id = v_origen
    ),
    bisagras_copiadas as (
      insert into public.hinges
        (id, version_id, experience_id, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo, tramo)
      select nueva, v_nuevo, exp, tiempo, orden, titulo, descripcion, soporte, duracion, requiere, listo, modo, tramo
      from mapa
      returning id
    )
    insert into public.blocks (version_id, hinge_id, orden, tipo, audiencia, contenido, media_id)
    select v_nuevo, mapa.nueva, b.orden, b.tipo, b.audiencia, b.contenido, b.media_id
    from public.blocks b
    join mapa on mapa.vieja = b.hinge_id
    where b.version_id = v_origen;
  end if;

  return v_nuevo;
end;
$fn$;

-- ── 4. pl_publicar_version: el chequeo de bisagras vacías ya no cruza por
--    experience_id, cruza por version_id directo. Más simple y más
--    correcto: antes comparaba TODAS las bisagras de la experiencia
--    (cualquier versión) contra los bloques de la versión a publicar; con
--    hinges ahora versionadas, cada versión tiene sus propias bisagras y el
--    cruce natural ya es 1 a 1. ──────────────────────────────────────────

create or replace function public.pl_publicar_version(ver uuid)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_exp uuid;
  v_estado pl_estado_version;
  v_vacios int;
begin
  if not public.pl_es_equipo() then
    raise exception 'Solo el equipo puede publicar.' using errcode = '42501';
  end if;

  select experience_id, estado into v_exp, v_estado
  from public.experience_versions where id = ver;

  if v_exp is null then
    raise exception 'Esa versión no existe.' using errcode = '42704';
  end if;

  if v_estado <> 'borrador' then
    raise exception 'Solo se publica un borrador. Esta versión está en %.', v_estado
      using errcode = '22023';
  end if;

  select count(*) into v_vacios
  from public.hinges h
  where h.version_id = ver
    and exists (select 1 from public.blocks b where b.hinge_id = h.id and b.version_id = ver)
    and not exists (
      select 1 from public.blocks b
      where b.hinge_id = h.id and b.version_id = ver and b.audiencia = 'todos'
    );

  if v_vacios > 0 then
    raise exception
      '% bisagra(s) quedarían en blanco para el participante: todos sus bloques son solo de moderador.', v_vacios
      using errcode = '22023';
  end if;

  update public.experience_versions
    set estado = 'retirada'
    where experience_id = v_exp and estado = 'publicada';

  update public.experience_versions
    set estado = 'publicada', publicada_at = now(), publicada_por = auth.uid()
    where id = ver;
end;
$fn$;

-- ── 5. pl_puede_ver_version: la regla 3 hecha mecanismo ─────────────────
--
-- Publicada: la ve cualquiera con acceso a la experiencia. Retirada: SOLO
-- la ve quien ya estaba anclado ahí, o sea quien tiene un marcador
-- apuntando a una bisagra de ESA versión exacta. Nunca borrador: eso lo
-- cubre la compuerta de "gestiona" del equipo, más abajo.
--
-- SECURITY DEFINER a propósito, mismo motivo que ya lleva escrito
-- `pl_puede_ver_medio`: esta consulta cruza a `bookmarks` y a `hinges`, y
-- una política que las consultara directo volvería a disparar la RLS de
-- esas tablas, con riesgo de recursión o de resultados que dependen del
-- orden.
create or replace function public.pl_puede_ver_version(v uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.experience_versions ev
    where ev.id = v
      and public.pl_nivel_audiencia(ev.experience_id) > 0
      and (
        ev.estado = 'publicada'
        or (
          ev.estado = 'retirada'
          and exists (
            select 1 from public.bookmarks bm
            join public.hinges h on h.id = bm.hinge_id
            where bm.profile_id = auth.uid()
              and h.version_id = v
          )
        )
      )
  )
$$;

-- ── 6. RLS de lectura de hinges y blocks, sobre pl_puede_ver_version ────

drop policy if exists "pl lectura con acceso" on public.hinges;
create policy "pl lectura con acceso" on public.hinges
  for select using (public.pl_puede_ver_version(version_id));

drop policy if exists "pl lectura con acceso" on public.blocks;
create policy "pl lectura con acceso" on public.blocks
  for select using (
    public.pl_puede_ver_version(version_id)
    and public.pl_peso_audiencia(blocks.audiencia) <= public.pl_nivel_audiencia(
      (select experience_id from public.experience_versions where id = blocks.version_id)
    )
  );

-- ── 7. pl_puede_ver_medio, mismo criterio ────────────────────────────────
--
-- Antes exigía `v.estado = 'publicada'` sin salida para nadie, ni siquiera
-- para el equipo previsualizando un borrador (eso sigue así: previsualizar
-- un borrador es un problema de la Etapa 5, no de esta). Lo que cambia es
-- la misma ampliación que arriba: quien está anclado a una versión retirada
-- sigue pudiendo ver sus medios, no solo sus bloques y bisagras.

create or replace function public.pl_puede_ver_medio(m uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.blocks b
    join public.experience_versions v on v.id = b.version_id
    where b.media_id = m
      and public.pl_puede_ver_version(b.version_id)
      and public.pl_peso_audiencia(b.audiencia) <= public.pl_nivel_audiencia(v.experience_id)
  )
$$;

-- ── 8. La compuerta de "gestiona" del equipo, solo para hinges y blocks,
--    se restringe a la versión en borrador ───────────────────────────────
--
-- SIN ESTO, TODO LO DE ARRIBA ES DECORATIVO. La política genérica dejaba
-- que cualquiera del equipo escribiera sobre CUALQUIER versión, publicada
-- incluida, sin pasar por borrador ni por publicar. El sistema de versiones
-- prometía que editar nunca toca lo que alguien está leyendo; esta política
-- sin restricción es la puerta de atrás por la que esa promesa se rompía.
-- Hallazgo de Hugo, consejo del editor, 2026-09-13.
--
-- No toca las otras doce tablas de la compuerta genérica: no tienen versión
-- y no aplica.

drop policy if exists "pl equipo gestiona" on public.hinges;
create policy "pl equipo gestiona" on public.hinges
  for all using (
    public.pl_es_equipo()
    and exists (
      select 1 from public.experience_versions v
      where v.id = hinges.version_id and v.estado = 'borrador'
    )
  )
  with check (
    public.pl_es_equipo()
    and exists (
      select 1 from public.experience_versions v
      where v.id = hinges.version_id and v.estado = 'borrador'
    )
  );

drop policy if exists "pl equipo gestiona" on public.blocks;
create policy "pl equipo gestiona" on public.blocks
  for all using (
    public.pl_es_equipo()
    and exists (
      select 1 from public.experience_versions v
      where v.id = blocks.version_id and v.estado = 'borrador'
    )
  )
  with check (
    public.pl_es_equipo()
    and exists (
      select 1 from public.experience_versions v
      where v.id = blocks.version_id and v.estado = 'borrador'
    )
  );
