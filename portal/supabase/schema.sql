-- ============================================================
-- PORTAL TRASCENDENCIA — Schema completo
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── PROFILES ────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  phone       text,
  role        text not null default 'participant'
                check (role in ('super_admin','admin','staff','participant')),
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.profiles enable row level security;

-- Auto-crear perfil cuando se registra un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
exception when others then
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── EVENTS ──────────────────────────────────────────────────
create table public.events (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique,
  nombre        text not null,
  capitulo      text,
  ciudad        text,
  pais          text default 'México',
  fecha_inicio  date,
  fecha_fin     date,
  ubicacion     text,
  status        text not null default 'draft'
                  check (status in ('draft','active','completed','archived')),
  n_parejas     int default 0,
  notas_internas text,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.events enable row level security;

-- ── FAMILIES ────────────────────────────────────────────────
create table public.families (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events(id) on delete cascade,
  nombre_familia  text not null,
  nombre1         text,
  email1          text,
  user_id1        uuid references public.profiles(id),
  nombre2         text,
  email2          text,
  user_id2        uuid references public.profiles(id),
  habitacion      text,
  notas           text,
  status          text not null default 'invited'
                    check (status in ('invited','confirmed','completed')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table public.families enable row level security;

-- ── INVITATIONS ─────────────────────────────────────────────
create table public.invitations (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid references public.events(id) on delete cascade,
  family_id       uuid references public.families(id) on delete cascade,
  email           text not null,
  full_name       text,
  role            text not null default 'participant'
                    check (role in ('admin','staff','participant')),
  status          text not null default 'pending'
                    check (status in ('pending','accepted','expired','cancelled')),
  custom_message  text,
  profile_id      uuid references public.profiles(id),
  sent_at         timestamptz default now(),
  accepted_at     timestamptz,
  expires_at      timestamptz default (now() + interval '7 days'),
  created_by      uuid references public.profiles(id)
);
alter table public.invitations enable row level security;

-- ── AGREEMENTS ──────────────────────────────────────────────
create table public.agreements (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid references public.events(id) on delete cascade,
  family_id       uuid references public.families(id) on delete cascade,
  assigned_to     uuid references public.profiles(id),
  assigned_email  text,
  type            text not null default 'participante'
                    check (type in ('evento','video','staff','participante','storybook','fotografo','custom')),
  nombre          text not null,
  contenido       jsonb default '{}'::jsonb,
  status          text not null default 'draft'
                    check (status in ('draft','sent','viewed','signed','approved','rejected')),
  signed_at       timestamptz,
  signed_ip       text,
  signed_user_agent text,
  approved_at     timestamptz,
  approved_by     uuid references public.profiles(id),
  rejected_at     timestamptz,
  rejected_by     uuid references public.profiles(id),
  notas_admin     text,
  pdf_url         text,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table public.agreements enable row level security;

-- ── DOCUMENTS ───────────────────────────────────────────────
create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid references public.events(id) on delete cascade,
  family_id     uuid references public.families(id) on delete cascade,
  tipo          text not null default 'custom'
                  check (tipo in ('itinerario','material_familia','storybook','info_preliminar','custom')),
  nombre        text not null,
  contenido     jsonb default '{}'::jsonb,
  visibilidad   text not null default 'participant'
                  check (visibilidad in ('admin_only','staff','participant','all')),
  pdf_url       text,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.documents enable row level security;

-- ── ITINERARY ITEMS ─────────────────────────────────────────
create table public.itinerary_items (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  dia           int not null default 1,
  fecha         date,
  hora_inicio   time,
  hora_fin      time,
  titulo        text not null,
  descripcion   text,
  tipo          text not null default 'actividad'
                  check (tipo in ('actividad','taller','comida','logistica','libre','privado','traslado')),
  visibilidad   text not null default 'participant'
                  check (visibilidad in ('staff_only','participant','all')),
  ubicacion     text,
  responsable   text,
  notas_staff   text,
  orden         int default 0,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index on public.itinerary_items (event_id, dia, orden, hora_inicio);
alter table public.itinerary_items enable row level security;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Helper: rol del usuario actual
create or replace function public.my_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Helper: ¿es staff o superior?
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select my_role() in ('super_admin','admin','staff')
$$;

-- PROFILES
create policy "Perfil propio" on public.profiles
  for all using (id = auth.uid());
create policy "Staff ve todos" on public.profiles
  for select using (is_staff());

-- EVENTS
create policy "Staff ve eventos" on public.events
  for select using (is_staff());
create policy "Participante ve su evento" on public.events
  for select using (
    exists (
      select 1 from public.families f
      where f.event_id = id
        and (f.user_id1 = auth.uid() or f.user_id2 = auth.uid())
    )
  );
create policy "Admin gestiona eventos" on public.events
  for all using (my_role() in ('super_admin','admin'));

-- FAMILIES
create policy "Staff ve familias" on public.families
  for select using (is_staff());
create policy "Participante ve su familia" on public.families
  for select using (user_id1 = auth.uid() or user_id2 = auth.uid());
create policy "Admin gestiona familias" on public.families
  for all using (my_role() in ('super_admin','admin'));

-- INVITATIONS
create policy "Staff ve invitaciones" on public.invitations
  for select using (is_staff());
create policy "Participante ve su invitacion" on public.invitations
  for select using (profile_id = auth.uid() or email = (select email from public.profiles where id = auth.uid()));
create policy "Admin gestiona invitaciones" on public.invitations
  for all using (my_role() in ('super_admin','admin'));

-- AGREEMENTS
create policy "Staff ve acuerdos" on public.agreements
  for select using (is_staff());
create policy "Participante ve sus acuerdos" on public.agreements
  for select using (
    assigned_to = auth.uid()
    or exists (
      select 1 from public.families f
      where f.id = family_id
        and (f.user_id1 = auth.uid() or f.user_id2 = auth.uid())
    )
  );
create policy "Participante firma acuerdo" on public.agreements
  for update using (
    assigned_to = auth.uid()
    or exists (
      select 1 from public.families f
      where f.id = family_id
        and (f.user_id1 = auth.uid() or f.user_id2 = auth.uid())
    )
  );
create policy "Admin gestiona acuerdos" on public.agreements
  for all using (my_role() in ('super_admin','admin'));

-- DOCUMENTS
create policy "Staff ve documentos" on public.documents
  for select using (is_staff());
create policy "Participante ve documentos" on public.documents
  for select using (
    visibilidad in ('participant','all')
    and exists (
      select 1 from public.families f
      where (f.event_id = event_id or f.id = family_id)
        and (f.user_id1 = auth.uid() or f.user_id2 = auth.uid())
    )
  );
create policy "Admin gestiona documentos" on public.documents
  for all using (my_role() in ('super_admin','admin'));

-- ITINERARY ITEMS
create policy "Staff ve itinerario completo" on public.itinerary_items
  for select using (is_staff());
create policy "Participante ve su itinerario" on public.itinerary_items
  for select using (
    visibilidad in ('participant','all')
    and exists (
      select 1 from public.families f
      where f.event_id = event_id
        and (f.user_id1 = auth.uid() or f.user_id2 = auth.uid())
    )
  );
create policy "Admin gestiona itinerario" on public.itinerary_items
  for all using (my_role() in ('super_admin','admin'));

-- ============================================================
-- Actualizar perfil del primer super_admin
-- ============================================================
-- Ejecutar esto DESPUÉS de que el schema haya corrido:
-- update public.profiles set role = 'super_admin', full_name = 'Francisco Esquivel'
-- where email = 'f.esquivelviteri@gmail.com';
