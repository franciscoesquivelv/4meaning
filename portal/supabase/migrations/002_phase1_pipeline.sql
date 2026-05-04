-- ============================================================
-- PHASE 1 — Pipeline comercial + Checklist de preparación
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── EVENTS: agregar pipeline_status y campos comerciales ────

alter table public.events
  add column if not exists pipeline_status text not null default 'prospecto'
    check (pipeline_status in ('prospecto','confirmado','en_preparacion','ejecutado','cancelado')),
  add column if not exists costo_por_pareja    numeric,
  add column if not exists ingreso_estimado    numeric,
  add column if not exists primer_deposito     numeric,
  add column if not exists contacto_capitulo   text,
  add column if not exists notas_comerciales   text;

-- ── EVENT TASKS — checklist extensible por evento ──────────

create table if not exists public.event_tasks (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  titulo      text not null,
  descripcion text,
  fase        text,   -- ej: "4 meses antes", "Semana del evento", "Post-evento"
  done        boolean not null default false,
  done_at     timestamptz,
  done_by     uuid references public.profiles(id),
  orden       int not null default 0,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists event_tasks_event_id_idx on public.event_tasks (event_id, fase, orden);

alter table public.event_tasks enable row level security;

-- RLS: staff puede ver y actualizar (marcar done), admin gestiona todo
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'event_tasks' and policyname = 'Staff ve tareas'
  ) then
    create policy "Staff ve tareas" on public.event_tasks
      for select using (is_staff());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'event_tasks' and policyname = 'Staff marca tareas'
  ) then
    create policy "Staff marca tareas" on public.event_tasks
      for update using (is_staff());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'event_tasks' and policyname = 'Admin gestiona tareas'
  ) then
    create policy "Admin gestiona tareas" on public.event_tasks
      for all using (my_role() in ('super_admin','admin'));
  end if;
end
$$;

-- ── ANNOUNCEMENTS (si no existe — de la sesión anterior) ───

create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  tipo        text not null default 'info'
                check (tipo in ('info','logistica','urgente')),
  titulo      text not null,
  cuerpo      text,
  published   boolean not null default true,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now()
);

create index if not exists announcements_event_id_idx on public.announcements (event_id, created_at desc);

alter table public.announcements enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'announcements' and policyname = 'Staff ve avisos'
  ) then
    create policy "Staff ve avisos" on public.announcements
      for select using (is_staff());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'announcements' and policyname = 'Admin gestiona avisos'
  ) then
    create policy "Admin gestiona avisos" on public.announcements
      for all using (my_role() in ('super_admin','admin'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'announcements' and policyname = 'Participante ve avisos publicados'
  ) then
    create policy "Participante ve avisos publicados" on public.announcements
      for select using (
        published = true
        and exists (
          select 1 from public.families f
          where f.event_id = event_id
            and (f.user_id1 = auth.uid() or f.user_id2 = auth.uid())
        )
      );
  end if;
end
$$;

-- ── FAMILIES: campos de entrega (si no existen) ────────────

alter table public.families
  add column if not exists storybook_status text not null default 'pendiente'
    check (storybook_status in ('pendiente','en_produccion','entregado')),
  add column if not exists storybook_fecha   date,
  add column if not exists video_status      text not null default 'pendiente'
    check (video_status in ('pendiente','en_produccion','entregado')),
  add column if not exists video_fecha       date,
  add column if not exists checked_in        boolean not null default false,
  add column if not exists checked_in_at     timestamptz;
