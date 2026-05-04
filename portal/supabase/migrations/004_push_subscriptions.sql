create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  event_id    uuid references public.events(id) on delete set null,
  endpoint    text not null,
  subscription jsonb not null,
  created_at  timestamptz default now(),
  unique (user_id, endpoint)
);
create index if not exists push_subs_event_idx on public.push_subscriptions (event_id);
alter table public.push_subscriptions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='push_subscriptions' and policyname='User gestiona sus suscripciones') then
    create policy "User gestiona sus suscripciones" on public.push_subscriptions
      for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='push_subscriptions' and policyname='Admin ve suscripciones') then
    create policy "Admin ve suscripciones" on public.push_subscriptions
      for select using (my_role() in ('super_admin','admin','staff'));
  end if;
end
$$;

-- NOTE: Generate VAPID keys by running:
--   npx web-push generate-vapid-keys
-- Then add to .env.local:
--   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public key>
--   VAPID_PRIVATE_KEY=<private key>
--   VAPID_EMAIL=admin@trascendencia.com
