-- ============================================================
-- PERSONALAB · Contenido, corridas y accesos
-- Migración 20260813. Idempotente: se puede correr dos veces.
-- ============================================================
--
-- LÉXICO VINCULANTE (Consejo #002). Los nombres NO son decorativos:
-- el esquema es la ontología, y una vez que existe una tabla `lessons`
-- con un campo `completed`, todo lo demás se acomoda a ella.
--
--   experiencia   no curso        → experiences
--   bisagra       no lección      → hinges
--   tiempo        no módulo       → enum vispera / ignicion / retorno
--   participante  no alumno       → profiles (ya existe)
--   capítulo      no cohorte      → chapters + runs
--   corrida       no evento       → runs
--   acceso        no enrollment   → grants
--   retorno       no progreso     → returns, con occurred_at y NO booleano
--   testimonio    no certificado  → testimonies, con delivered_by humano
--
-- CAMPOS PROHIBIDOS en todo el modelo del participante:
--   progress, completion_pct, score, streak, badge, rank, quiz.
-- Al final del archivo hay una verificación que falla si alguno aparece.

-- ── TIPOS ───────────────────────────────────────────────────

do $$ begin
  create type pl_tiempo as enum ('vispera','ignicion','retorno');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pl_soporte as enum ('sala','objeto','pantalla');
exception when duplicate_object then null; end $$;

-- Acumulativa: el moderador ve lo de todos, el equipo ve todo.
do $$ begin
  create type pl_audiencia as enum ('todos','moderador','equipo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pl_tipo_bloque as enum (
    'texto','cita','consigna','aviso','nota','pausa',
    'gesto','objeto','archivo','imagen','video'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type pl_estado_version as enum ('borrador','publicada','retirada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pl_maduracion as enum ('diseno','piloto','lista','retirada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pl_estado_corrida as enum ('prospecto','confirmada','en_preparacion','corrida','cancelada');
exception when duplicate_object then null; end $$;

-- El acceso a una experiencia se otorga al MODERADOR, que compra para su
-- foro. Algunas experiencias además abren espacio a cada persona.
do $$ begin
  create type pl_titularidad as enum ('moderador','miembro_foro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pl_columna_kit as enum ('objeto','humano','administrativo');
exception when duplicate_object then null; end $$;

-- ── CATÁLOGO ────────────────────────────────────────────────

create table if not exists public.experiences (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  nombre        text not null,
  subtitulo     text,
  narrativa     text,
  duracion      text,
  maduracion    pl_maduracion not null default 'diseno',
  -- Si además del moderador se puede abrir acceso individual a la gente del
  -- foro. Se decide experiencia por experiencia, no como regla general.
  abre_espacio_al_foro boolean not null default false,
  nota_diseno   text,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.experience_versions (
  id            uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  numero        int not null,
  estado        pl_estado_version not null default 'borrador',
  notas         text,
  publicada_at  timestamptz,
  publicada_por uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (experience_id, numero)
);

-- Una sola versión publicada por experiencia. Sin esto, dos publicadas a la
-- vez dejan al lector eligiendo al azar.
create unique index if not exists experience_versions_una_publicada
  on public.experience_versions (experience_id)
  where estado = 'publicada';

create table if not exists public.hinges (
  id            uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  tiempo        pl_tiempo not null,
  orden         int not null default 0,
  titulo        text not null,
  descripcion   text,
  soporte       pl_soporte not null default 'pantalla',
  duracion      text,
  -- Lo que el moderador necesita tener en la mano para esta bisagra.
  requiere      text[] not null default '{}',
  listo         boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists hinges_experiencia_idx
  on public.hinges (experience_id, tiempo, orden);

-- ── MEDIOS ──────────────────────────────────────────────────
-- Los archivos viven en Storage. Aquí solo el registro y sus reglas.

create table if not exists public.media (
  id            uuid primary key default gen_random_uuid(),
  bucket        text not null,
  path          text not null,
  nombre        text not null,
  mime          text,
  peso_bytes    bigint,
  -- Descargable es del MODERADOR, no del participante. Lo que se entrega al
  -- participante se recibe, no se descarga.
  descargable   boolean not null default false,
  subido_por    uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  unique (bucket, path)
);

-- ── BLOQUES ─────────────────────────────────────────────────
-- El contenido no es un formulario fijo: es una lista ordenada de bloques
-- tipados. Por eso dos experiencias no se parecen en nada y aun así viven
-- en el mismo esquema.

create table if not exists public.blocks (
  id            uuid primary key default gen_random_uuid(),
  version_id    uuid not null references public.experience_versions(id) on delete cascade,
  hinge_id      uuid not null references public.hinges(id) on delete cascade,
  orden         int not null default 0,
  tipo          pl_tipo_bloque not null,
  audiencia     pl_audiencia not null default 'todos',
  -- Forma según el tipo. Se valida abajo, no se deja libre.
  contenido     jsonb not null default '{}'::jsonb,
  media_id      uuid references public.media(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists blocks_version_idx on public.blocks (version_id, hinge_id, orden);

-- Una nota nunca puede ser pública: es la definición del tipo, no una
-- preferencia que alguien pueda cambiar por descuido.
alter table public.blocks drop constraint if exists blocks_nota_es_privada;
alter table public.blocks add constraint blocks_nota_es_privada
  check (tipo <> 'nota' or audiencia <> 'todos');

-- Cada tipo exige lo suyo. Sin esto, un bloque vacío llega al lector.
alter table public.blocks drop constraint if exists blocks_contenido_por_tipo;
alter table public.blocks add constraint blocks_contenido_por_tipo check (
  case tipo
    when 'pausa'   then true
    when 'cita'    then coalesce(contenido->>'texto','') <> ''
    when 'objeto'  then coalesce(contenido->>'texto','') <> ''
    when 'archivo' then media_id is not null
    when 'imagen'  then media_id is not null
    when 'video'   then media_id is not null or coalesce(contenido->>'url','') <> ''
    else coalesce(contenido->>'texto','') <> ''
  end
);

-- ── KIT ─────────────────────────────────────────────────────
-- La carta de frontera, hecha estructura: qué se replica en software y qué
-- no. El kit es físico y humano; el software lo administra, no lo entrega.

create table if not exists public.kit_pieces (
  id            uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  columna       pl_columna_kit not null,
  nombre        text not null,
  detalle       text,
  por_persona   boolean not null default false,
  disponible    boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists kit_pieces_experiencia_idx on public.kit_pieces (experience_id, columna);

-- ── CAPÍTULOS Y CORRIDAS ────────────────────────────────────

create table if not exists public.chapters (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  ciudad        text,
  pais          text,
  created_at    timestamptz not null default now()
);

-- Un moderador está FORMADO en una experiencia, y la formación es presencial.
-- Sin registro de formación no puede conducir, aunque su capítulo tenga
-- licencia.
create table if not exists public.chapter_moderators (
  id            uuid primary key default gen_random_uuid(),
  chapter_id    uuid not null references public.chapters(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  desde         date not null default current_date,
  created_at    timestamptz not null default now(),
  unique (chapter_id, profile_id)
);

create table if not exists public.moderator_training (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  formado_at    date not null default current_date,
  formado_por   uuid references public.profiles(id),
  unique (profile_id, experience_id)
);

create table if not exists public.runs (
  id            uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  -- Qué versión se corrió. Congela lo que la gente leyó ese día.
  version_id    uuid references public.experience_versions(id),
  chapter_id    uuid not null references public.chapters(id),
  moderador_id  uuid not null references public.profiles(id),
  fecha         date,
  estado        pl_estado_corrida not null default 'prospecto',
  personas_en_el_foro int not null default 0,
  sede          text,
  notas         text,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists runs_experiencia_idx on public.runs (experience_id, fecha);
create index if not exists runs_moderador_idx on public.runs (moderador_id);

create table if not exists public.run_checklist (
  id            uuid primary key default gen_random_uuid(),
  run_id        uuid not null references public.runs(id) on delete cascade,
  fase          text,
  titulo        text not null,
  orden         int not null default 0,
  hecho         boolean not null default false,
  hecho_at      timestamptz,
  hecho_por     uuid references public.profiles(id)
);
create index if not exists run_checklist_run_idx on public.run_checklist (run_id, orden);

-- ── ACCESOS ─────────────────────────────────────────────────
-- El grant es la pieza que hace posible "este usuario ve estas tres cosas".

create table if not exists public.grants (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  run_id        uuid references public.runs(id) on delete cascade,
  titularidad   pl_titularidad not null default 'moderador',
  otorgado_por  uuid references public.profiles(id),
  otorgado_at   timestamptz not null default now(),
  -- Se revoca, no se borra: el registro de quién tuvo acceso importa.
  revocado_at   timestamptz,
  unique (profile_id, experience_id, run_id)
);
create index if not exists grants_profile_idx on public.grants (profile_id) where revocado_at is null;

-- ── RETORNO ─────────────────────────────────────────────────
-- Lo que sostiene después. NO hay porcentaje, racha ni puntaje: hay
-- momentos que ocurrieron, con su fecha.

create table if not exists public.returns (
  id            uuid primary key default gen_random_uuid(),
  run_id        uuid not null references public.runs(id) on delete cascade,
  profile_id    uuid references public.profiles(id) on delete cascade,
  mes           int not null check (mes between 1 and 6),
  -- Ocurrió o no ocurrió, con su fecha. Nunca un booleano suelto.
  occurred_at   timestamptz,
  nota          text,
  unique (run_id, profile_id, mes)
);

-- El testimonio lo entrega una persona, no el sistema. Por eso delivered_by
-- es obligatorio y apunta a un humano.
create table if not exists public.testimonies (
  id            uuid primary key default gen_random_uuid(),
  run_id        uuid not null references public.runs(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  delivered_by  uuid not null references public.profiles(id),
  delivered_at  timestamptz not null default now(),
  texto         text
);

-- ============================================================
-- FUNCIONES DE APOYO
-- ============================================================

-- Nivel de audiencia de la persona actual sobre una experiencia:
--   3 equipo · 2 moderador con grant · 1 miembro de foro con grant · 0 nada
create or replace function public.pl_nivel_audiencia(exp uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select case
    when public.is_staff() then 3
    when exists (
      select 1 from public.grants g
      where g.profile_id = auth.uid()
        and g.experience_id = exp
        and g.revocado_at is null
        and g.titularidad = 'moderador'
    ) then 2
    when exists (
      select 1 from public.grants g
      where g.profile_id = auth.uid()
        and g.experience_id = exp
        and g.revocado_at is null
    ) then 1
    else 0
  end
$$;

-- Nivel numérico de un valor de audiencia, para comparar.
create or replace function public.pl_peso_audiencia(a pl_audiencia)
returns int
language sql
immutable
as $$
  select case a when 'todos' then 1 when 'moderador' then 2 else 3 end
$$;

-- Si la persona actual puede ver un medio. Va en SECURITY DEFINER a
-- propósito: una política que consulta otra tabla vuelve a disparar la RLS
-- de esa tabla, y eso produce recursión o resultados que dependen del orden
-- de evaluación. La función corta ese cruce.
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
      and v.estado = 'publicada'
      and public.pl_peso_audiencia(b.audiencia) <= public.pl_nivel_audiencia(v.experience_id)
  )
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.experiences         enable row level security;
alter table public.experience_versions enable row level security;
alter table public.hinges              enable row level security;
alter table public.blocks              enable row level security;
alter table public.media               enable row level security;
alter table public.kit_pieces          enable row level security;
alter table public.chapters            enable row level security;
alter table public.chapter_moderators  enable row level security;
alter table public.moderator_training  enable row level security;
alter table public.runs                enable row level security;
alter table public.run_checklist       enable row level security;
alter table public.grants              enable row level security;
alter table public.returns             enable row level security;
alter table public.testimonies         enable row level security;

-- Se recrean para que la migración sea idempotente.
do $$
declare t text;
begin
  foreach t in array array[
    'experiences','experience_versions','hinges','blocks','media','kit_pieces',
    'chapters','chapter_moderators','moderator_training','runs','run_checklist',
    'grants','returns','testimonies'
  ] loop
    execute format('drop policy if exists "pl equipo gestiona" on public.%I', t);
    execute format('drop policy if exists "pl lectura con acceso" on public.%I', t);
  end loop;
end $$;

-- El equipo de 4 Meaning gestiona todo el catálogo.
do $$
declare t text;
begin
  foreach t in array array[
    'experiences','experience_versions','hinges','blocks','media','kit_pieces',
    'chapters','chapter_moderators','moderator_training','runs','run_checklist',
    'grants','returns','testimonies'
  ] loop
    execute format(
      'create policy "pl equipo gestiona" on public.%I for all using (public.is_staff())', t);
  end loop;
end $$;

-- Quien tiene grant ve la experiencia.
create policy "pl lectura con acceso" on public.experiences
  for select using (public.pl_nivel_audiencia(id) > 0);

-- Solo la versión PUBLICADA. El borrador es del equipo.
create policy "pl lectura con acceso" on public.experience_versions
  for select using (
    estado = 'publicada' and public.pl_nivel_audiencia(experience_id) > 0
  );

create policy "pl lectura con acceso" on public.hinges
  for select using (public.pl_nivel_audiencia(experience_id) > 0);

-- Aquí está el filtro que importa: el participante NO recibe los bloques de
-- moderador. No se filtran en la aplicación, se filtran en la base.
create policy "pl lectura con acceso" on public.blocks
  for select using (
    exists (
      select 1
      from public.experience_versions v
      where v.id = version_id
        and v.estado = 'publicada'
        and public.pl_peso_audiencia(blocks.audiencia) <= public.pl_nivel_audiencia(v.experience_id)
    )
  );

-- Un medio se ve si se ve algún bloque publicado que lo usa, y con la misma
-- regla de audiencia. Un PDF de moderador no llega al foro por la puerta de
-- atrás. Va por función para no cruzar RLS entre tablas.
create policy "pl lectura con acceso" on public.media
  for select using (public.pl_puede_ver_medio(id));

-- El kit es del moderador, no del foro.
create policy "pl lectura con acceso" on public.kit_pieces
  for select using (public.pl_nivel_audiencia(experience_id) >= 2);

create policy "pl lectura con acceso" on public.chapters
  for select using (
    exists (
      select 1 from public.chapter_moderators m
      where m.chapter_id = chapters.id and m.profile_id = auth.uid()
    )
  );

create policy "pl lectura con acceso" on public.chapter_moderators
  for select using (profile_id = auth.uid());

create policy "pl lectura con acceso" on public.moderator_training
  for select using (profile_id = auth.uid());

-- El moderador ve sus corridas. El miembro de foro ve aquella a la que fue.
create policy "pl lectura con acceso" on public.runs
  for select using (
    moderador_id = auth.uid()
    or exists (
      select 1 from public.grants g
      where g.run_id = runs.id and g.profile_id = auth.uid() and g.revocado_at is null
    )
  );

-- La preparación es trabajo del moderador. El foro no la ve.
create policy "pl lectura con acceso" on public.run_checklist
  for select using (
    exists (select 1 from public.runs r where r.id = run_id and r.moderador_id = auth.uid())
  );

create policy "pl lectura con acceso" on public.grants
  for select using (profile_id = auth.uid());

-- Lo que alguien escribe en su retorno es suyo. Ni el moderador lo lee.
create policy "pl lectura con acceso" on public.returns
  for select using (profile_id = auth.uid());

create policy "pl lectura con acceso" on public.testimonies
  for select using (profile_id = auth.uid() or delivered_by = auth.uid());

-- ============================================================
-- VERIFICACIÓN: campos prohibidos
-- ============================================================
-- Falla la migración si alguien introdujo lógica de LMS por descuido.

do $$
declare n int;
begin
  select count(*) into n
  from information_schema.columns
  where table_schema = 'public'
    and table_name in (
      'experiences','experience_versions','hinges','blocks','media','kit_pieces',
      'chapters','chapter_moderators','moderator_training','runs','run_checklist',
      'grants','returns','testimonies'
    )
    and column_name in ('progress','completion_pct','score','streak','badge','rank','quiz');

  if n > 0 then
    raise exception 'Campos prohibidos en el esquema de PersonaLab: % columnas. Ver el léxico del Consejo #002.', n;
  end if;
end $$;
