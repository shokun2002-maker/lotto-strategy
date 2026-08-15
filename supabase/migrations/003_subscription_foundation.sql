-- Day 18 Supabase Migration: public.subscriptions & public.payments
-- Purpose: PG-independent Subscription Backend Foundation with strict RLS read-only for authenticated users and minimal privileges.

-- ====================================================
-- 1. Table: public.subscriptions
-- ====================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_customer_id text,
  provider_subscription_id text,
  plan text not null default 'pro',
  status text not null default 'pending',
  amount integer,
  currency text not null default 'KRW',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for subscriptions
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_provider on public.subscriptions(provider);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- RLS Select Policy for subscriptions
drop policy if exists "Users can view their own subscriptions" on public.subscriptions;
create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Minimal Privileges: Revoke all default table privileges and grant SELECT to authenticated only
revoke all on table public.subscriptions from anon, authenticated;
grant select on table public.subscriptions to authenticated;


-- ====================================================
-- 2. Table: public.payments
-- ====================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider text not null,
  provider_payment_id text,
  order_id text not null unique,
  amount integer not null,
  currency text not null default 'KRW',
  status text not null default 'pending',
  paid_at timestamptz,
  failed_at timestamptz,
  failure_code text,
  created_at timestamptz not null default now()
);

-- Indexes for payments
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_subscription_id on public.payments(subscription_id);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_status on public.payments(status);

-- Enable RLS
alter table public.payments enable row level security;

-- RLS Select Policy for payments
drop policy if exists "Users can view their own payments" on public.payments;
create policy "Users can view their own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- Minimal Privileges: Revoke all default table privileges and grant SELECT to authenticated only
revoke all on table public.payments from anon, authenticated;
grant select on table public.payments to authenticated;
