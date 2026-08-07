-- ============================================================
-- GradConnect Live — Full Supabase Schema
-- Run this entire script in Supabase SQL Editor.
-- ============================================================

create extension if not exists pgcrypto;

-- ── Tables ──────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  phone text,
  status text not null default 'attending' check (status in ('attending','declined','maybe')),
  dietary text,
  note text,
  attendee_count integer not null default 1 check (attendee_count between 1 and 20),
  created_at timestamptz not null default now()
);

create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  is_announcement boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  location text,
  details text,
  status text not null default 'Received' check (status in ('Received','Being Handled','Completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  caption text,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Views ────────────────────────────────────────────────────

create or replace view public.feed_posts_view with (security_invoker=true) as
  select f.*, p.display_name from public.feed_posts f join public.profiles p on p.id = f.user_id;

create or replace view public.messages_view with (security_invoker=true) as
  select m.*, p.display_name from public.messages m join public.profiles p on p.id = m.user_id;

create or replace view public.requests_view with (security_invoker=true) as
  select r.*, p.display_name from public.requests r join public.profiles p on p.id = r.user_id;

create or replace view public.photos_view with (security_invoker=true) as
  select ph.*, p.display_name from public.photos ph join public.profiles p on p.id = ph.user_id;

create or replace view public.rsvps_view with (security_invoker=true) as
  select r.*, p.display_name from public.rsvps r join public.profiles p on p.id = r.user_id;

-- ── Row Level Security ───────────────────────────────────────

alter table public.profiles   enable row level security;
alter table public.rsvps      enable row level security;
alter table public.feed_posts enable row level security;
alter table public.messages   enable row level security;
alter table public.requests   enable row level security;
alter table public.photos     enable row level security;

-- Helper: is current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- profiles
create policy "profiles readable by authenticated"  on public.profiles for select to authenticated using (true);
create policy "users create own profile"            on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "users update own profile"            on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- rsvps
create policy "own rsvp or admin read"  on public.rsvps for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "own rsvp insert"         on public.rsvps for insert to authenticated with check (user_id = auth.uid());
create policy "own rsvp update"         on public.rsvps for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- feed_posts
create policy "feed readable"           on public.feed_posts for select to authenticated using (true);
create policy "feed own insert"         on public.feed_posts for insert to authenticated with check (user_id = auth.uid() and (is_announcement = false or public.is_admin()));
create policy "feed own delete or admin" on public.feed_posts for delete to authenticated using (user_id = auth.uid() or public.is_admin());

-- messages
create policy "messages readable"           on public.messages for select to authenticated using (true);
create policy "messages own insert"         on public.messages for insert to authenticated with check (user_id = auth.uid());
create policy "messages own delete or admin" on public.messages for delete to authenticated using (user_id = auth.uid() or public.is_admin());

-- requests
create policy "request own or admin read"   on public.requests for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "request own insert"          on public.requests for insert to authenticated with check (user_id = auth.uid());
create policy "request own/admin update"    on public.requests for update to authenticated using (user_id = auth.uid() or public.is_admin());

-- photos
create policy "approved photos readable"    on public.photos for select to authenticated using (approved = true or user_id = auth.uid() or public.is_admin());
create policy "photo own insert"            on public.photos for insert to authenticated with check (user_id = auth.uid());
create policy "photo own/admin delete"      on public.photos for delete to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "photo admin update"          on public.photos for update to authenticated using (public.is_admin());

-- ── Storage ──────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
  values ('event-photos', 'event-photos', true)
  on conflict (id) do update set public = true;

create policy "authenticated photo uploads" on storage.objects for insert to authenticated
  with check (bucket_id = 'event-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "public photo reads" on storage.objects for select to public
  using (bucket_id = 'event-photos');

create policy "own photo delete or admin" on storage.objects for delete to authenticated
  using (bucket_id = 'event-photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ── Realtime ─────────────────────────────────────────────────

alter publication supabase_realtime add table public.feed_posts;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.requests;
alter publication supabase_realtime add table public.photos;
alter publication supabase_realtime add table public.rsvps;

-- ── Direct Messages ──────────────────────────────────────────

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.direct_messages enable row level security;

create policy "dm send" on public.direct_messages for insert to authenticated
  with check (sender_id = auth.uid());

create policy "dm read" on public.direct_messages for select to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid());

create or replace view public.direct_messages_view with (security_invoker=true) as
  select dm.*,
    sp.display_name as sender_name,
    rp.display_name as recipient_name
  from public.direct_messages dm
  join public.profiles sp on sp.id = dm.sender_id
  join public.profiles rp on rp.id = dm.recipient_id;

alter publication supabase_realtime add table public.direct_messages;
