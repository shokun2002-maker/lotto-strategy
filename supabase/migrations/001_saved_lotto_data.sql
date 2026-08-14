-- Day 15 Supabase DB Schema & RLS Policies Migration Script
-- Purpose: Documentation of public.saved_combinations & public.saved_custom_strategies

-- ====================================================
-- 1. Table: public.saved_combinations
-- ====================================================
create table if not exists public.saved_combinations (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  numbers integer[] not null,
  source text not null,
  user_picked_numbers integer[] default '{}'::integer[],
  recommended_numbers integer[] default '{}'::integer[],
  strategy_id text,
  custom_strategy_id text,
  custom_strategy_name text,
  fixed_numbers integer[] default '{}'::integer[],
  excluded_numbers integer[] default '{}'::integer[],
  target_draw_no integer,
  created_at timestamptz not null default now(),
  synced_at timestamptz default now()
);

-- Index for fast user_id lookups
create index if not exists idx_saved_combinations_user_id on public.saved_combinations(user_id);
create index if not exists idx_saved_combinations_target_draw on public.saved_combinations(target_draw_no);

-- Enable RLS
alter table public.saved_combinations enable row level security;

-- RLS Policies
create policy "Users can view their own saved combinations"
  on public.saved_combinations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved combinations"
  on public.saved_combinations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own saved combinations"
  on public.saved_combinations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved combinations"
  on public.saved_combinations for delete
  using (auth.uid() = user_id);

-- Grants
grant select, insert, update, delete
on table public.saved_combinations
to authenticated;


-- ====================================================
-- 2. Table: public.saved_custom_strategies
-- ====================================================
create table if not exists public.saved_custom_strategies (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  base_strategy text not null,
  fixed_numbers integer[] default '{}'::integer[],
  excluded_numbers integer[] default '{}'::integer[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz,
  usage_count integer not null default 0,
  synced_at timestamptz default now()
);

-- Index for fast user_id lookups
create index if not exists idx_saved_custom_strategies_user_id on public.saved_custom_strategies(user_id);

-- Enable RLS
alter table public.saved_custom_strategies enable row level security;

-- RLS Policies
create policy "Users can view their own custom strategies"
  on public.saved_custom_strategies for select
  using (auth.uid() = user_id);

create policy "Users can insert their own custom strategies"
  on public.saved_custom_strategies for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own custom strategies"
  on public.saved_custom_strategies for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own custom strategies"
  on public.saved_custom_strategies for delete
  using (auth.uid() = user_id);

-- Grants
grant select, insert, update, delete
on table public.saved_custom_strategies
to authenticated;
