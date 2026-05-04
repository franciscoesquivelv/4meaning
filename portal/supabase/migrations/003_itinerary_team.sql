-- Add grupo to itinerary_items
alter table public.itinerary_items
  add column if not exists grupo text; -- null = todos, 'A','B','C' etc.

-- Event team members table
create table if not exists public.event_team (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  nombre        text not null,
  rol           text not null,
  bio_publica   text,
  notas_equipo  text,
  orden         int not null default 0,
  created_at    timestamptz default now()
);
create index if not exists event_team_event_id_idx on public.event_team (event_id, orden);
alter table public.event_team enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='event_team' and policyname='Staff ve equipo') then
    create policy "Staff ve equipo" on public.event_team for select using (is_staff());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='event_team' and policyname='Admin gestiona equipo') then
    create policy "Admin gestiona equipo" on public.event_team for all using (my_role() in ('super_admin','admin'));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='event_team' and policyname='Participante ve bio publica') then
    create policy "Participante ve bio publica" on public.event_team
      for select using (
        bio_publica is not null
        and exists (
          select 1 from public.families f
          where f.event_id = event_id
            and (f.user_id1 = auth.uid() or f.user_id2 = auth.uid())
        )
      );
  end if;
end
$$;
