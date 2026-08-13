-- GreekTax GR — Supabase schema
-- Run in Supabase Dashboard → SQL Editor

-- 1) Enable realtime-safe helper
create extension if not exists "uuid-ossp";

-- 2) Profiles (one per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  profile_type text not null default 'individual'
    check (profile_type in ('individual', 'self', 'business')),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 3) Calculations history (one row per saved result)
create table if not exists public.calculations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tool text not null,
  title text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists calculations_user_created_idx
  on public.calculations (user_id, created_at desc);

alter table public.calculations enable row level security;

create policy "Users can view own calculations"
  on public.calculations for select
  using (auth.uid() = user_id);

create policy "Users can insert own calculations"
  on public.calculations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own calculations"
  on public.calculations for delete
  using (auth.uid() = user_id);

-- 4) Auto-update updated_at on profiles
create or replace function public.set_updated_at ()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at ();