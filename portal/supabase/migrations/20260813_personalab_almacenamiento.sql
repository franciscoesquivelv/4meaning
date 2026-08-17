-- ============================================================
-- PERSONALAB · Almacenamiento, concurrencia y publicación
-- Corre DESPUÉS de 20260813_personalab_contenido.sql
-- ============================================================

-- ── 1. Buckets ──────────────────────────────────────────────
--
-- Los dos PRIVADOS, sin excepción. No hay política de lectura para anon ni
-- para authenticated: todo acceso pasa por una ruta del servidor que
-- verifica audiencia y devuelve una URL firmada de vida corta.
--
-- Por qué no usar RLS de storage directamente: la regla de audiencia vive
-- en `blocks`, no en el objeto, y storage.objects solo conoce su ruta.
-- Meter la regla en la ruta del archivo la duplicaría en dos lugares que
-- despues divergen. Mejor una sola puerta.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  -- Lo que puede ver el participante dentro de la lectura.
  ('personalab-medios', 'personalab-medios', false, 209715200,
   array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/quicktime']),
  -- Lo que descarga el moderador. Separado a proposito: si algun dia se
  -- afloja una politica, no se afloja sobre los dos a la vez.
  ('personalab-documentos', 'personalab-documentos', false, 52428800,
   array['application/pdf'])
on conflict (id) do update
  set file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types,
      public             = false;

-- ── 2. Registro de descargas ────────────────────────────────
-- Quién se llevó qué documento y cuándo. Un guion de sala licenciado a un
-- capitulo deja rastro.

create table if not exists public.media_descargas (
  id          uuid primary key default gen_random_uuid(),
  media_id    uuid not null references public.media(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  descargado_at timestamptz not null default now(),
  ip          text,
  user_agent  text
);
create index if not exists media_descargas_media_idx
  on public.media_descargas (media_id, descargado_at desc);

alter table public.media_descargas enable row level security;

drop policy if exists "pl equipo ve descargas" on public.media_descargas;
create policy "pl equipo ve descargas" on public.media_descargas
  for all using (public.is_staff());

drop policy if exists "pl ve sus descargas" on public.media_descargas;
create policy "pl ve sus descargas" on public.media_descargas
  for select using (profile_id = auth.uid());

-- ── 3. Concurrencia optimista ───────────────────────────────
-- Dos personas editando la misma version se pisan en silencio sin esto.
-- `rev` sube en cada escritura; el cliente manda la que tenia y si no
-- coincide recibe 409 en vez de sobrescribir.

alter table public.experience_versions add column if not exists rev int not null default 1;
alter table public.blocks              add column if not exists rev int not null default 1;

create or replace function public.pl_subir_rev()
returns trigger
language plpgsql
as $$
begin
  new.rev := coalesce(old.rev, 0) + 1;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists subir_rev on public.blocks;
create trigger subir_rev before update on public.blocks
  for each row execute function public.pl_subir_rev();

drop trigger if exists subir_rev on public.experience_versions;
create trigger subir_rev before update on public.experience_versions
  for each row execute function public.pl_subir_rev();

-- ── 4. Abrir borrador ───────────────────────────────────────
-- Copia la version publicada a una nueva en borrador, con sus bloques.
-- Sin esto, editar seria editar en vivo encima de gente leyendo.

create or replace function public.pl_abrir_borrador(exp uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_origen uuid;
  v_nuevo  uuid;
  v_numero int;
begin
  if not public.is_staff() then
    raise exception 'Solo el equipo puede abrir un borrador.' using errcode = '42501';
  end if;

  -- Si ya hay uno abierto, se devuelve ese. Dos borradores a la vez son
  -- dos verdades a la vez.
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

  -- Se copian los bloques de la publicada, si habia.
  if v_origen is not null then
    insert into public.blocks (version_id, hinge_id, orden, tipo, audiencia, contenido, media_id)
    select v_nuevo, b.hinge_id, b.orden, b.tipo, b.audiencia, b.contenido, b.media_id
    from public.blocks b
    where b.version_id = v_origen;
  end if;

  return v_nuevo;
end;
$$;

-- ── 5. Publicar version ─────────────────────────────────────
-- Atomica: retira la publicada y promueve el borrador en una sola
-- transaccion. Si falla a medias, no queda ninguna publicada.

create or replace function public.pl_publicar_version(ver uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exp uuid;
  v_estado pl_estado_version;
  v_vacios int;
begin
  if not public.is_staff() then
    raise exception 'Solo el equipo puede publicar.' using errcode = '42501';
  end if;

  select experience_id, estado into v_exp, v_estado
  from public.experience_versions where id = ver;

  if v_exp is null then
    raise exception 'Esa version no existe.';
  end if;
  if v_estado <> 'borrador' then
    raise exception 'Solo se publica un borrador. Esta version esta en %.', v_estado;
  end if;

  -- La compuerta de la aplicacion puede saltarse llamando la RPC directo.
  -- Esta es la ultima linea: ninguna bisagra donde el participante no
  -- veria nada.
  select count(*) into v_vacios
  from public.hinges h
  where h.experience_id = v_exp
    and exists (select 1 from public.blocks b where b.hinge_id = h.id and b.version_id = ver)
    and not exists (
      select 1 from public.blocks b
      where b.hinge_id = h.id and b.version_id = ver and b.audiencia = 'todos'
    );

  if v_vacios > 0 then
    raise exception
      '% bisagra(s) quedarian en blanco para el participante: todos sus bloques son solo de moderador.', v_vacios;
  end if;

  update public.experience_versions
    set estado = 'retirada'
    where experience_id = v_exp and estado = 'publicada';

  update public.experience_versions
    set estado = 'publicada', publicada_at = now(), publicada_por = auth.uid()
    where id = ver;
end;
$$;

-- ── 6. Registrar una descarga ───────────────────────────────

create or replace function public.pl_registrar_descarga(m uuid, ip_txt text, ua text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.pl_puede_ver_medio(m) then
    raise exception 'Sin acceso a ese archivo.' using errcode = '42501';
  end if;
  insert into public.media_descargas (media_id, profile_id, ip, user_agent)
  values (m, auth.uid(), ip_txt, ua);
end;
$$;
