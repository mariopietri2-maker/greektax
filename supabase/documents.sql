-- GreekTax GR — Documents organizer
-- Run in Supabase Dashboard → SQL Editor (after schema.sql)

create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null default 'Άλλο'
    check (category in ('Τιμολόγια', 'Τράπεζα', 'MyData', 'Φορολογικά', 'Λοιπά')),
  kind text not null default 'income'
    check (kind in ('income', 'expense', 'mixed')),
  amount numeric not null default 0,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists documents_user_created_idx
  on public.documents (user_id, created_at desc);

alter table public.documents enable row level security;

create policy "Users can view own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.documents for delete
  using (auth.uid() = user_id);