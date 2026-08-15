-- Day 17 Supabase Migration: public.user_entitlements & RLS Policies
-- Purpose: Authoritative FREE / PRO entitlement storage with strict RLS read-only for authenticated users.

-- ====================================================
-- 1. Table: public.user_entitlements
-- ====================================================
create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  source text not null default 'system',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for plan & status lookups
create index if not exists idx_user_entitlements_plan on public.user_entitlements(plan);
create index if not exists idx_user_entitlements_status on public.user_entitlements(status);

-- Enable RLS
alter table public.user_entitlements enable row level security;

-- ====================================================
-- 2. RLS Security Policies
-- ====================================================
-- Allow authenticated users to SELECT ONLY their own entitlement row
create policy "Users can view their own entitlement"
  on public.user_entitlements for select
  using (auth.uid() = user_id);

-- IMPORTANT: No INSERT, UPDATE, or DELETE policies are granted to authenticated/anon.
-- Users cannot mutate their own plan directly from the browser client.

-- Grant SELECT only to authenticated users
grant select on table public.user_entitlements to authenticated;


-- ====================================================
-- 3. Automatic Trigger for New User Entitlements (Default FREE)
-- ====================================================
create or replace function public.handle_new_user_entitlement()
returns trigger as $$
begin
  insert into public.user_entitlements (user_id, plan, status, source)
  values (new.id, 'free', 'active', 'system')
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution on auth.users insert
drop trigger if exists on_auth_user_created_entitlement on auth.users;
create trigger on_auth_user_created_entitlement
  after insert on auth.users
  for each row execute procedure public.handle_new_user_entitlement();
