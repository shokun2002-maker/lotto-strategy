-- Day 19 Supabase Migration: public.payment_products
-- Purpose: Payment product catalog with explicit REVOKE for client roles and SELECT granted to authenticated users.

-- ====================================================
-- 1. Table: public.payment_products
-- ====================================================
create table if not exists public.payment_products (
  id text primary key,
  name text not null,
  product_type text not null,
  plan text not null default 'pro',
  duration_days integer,
  amount integer not null default 0,
  currency text not null default 'KRW',
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for payment_products
create index if not exists idx_payment_products_active on public.payment_products(active);
create index if not exists idx_payment_products_type on public.payment_products(product_type);

-- Enable RLS
alter table public.payment_products enable row level security;

-- RLS Select Policy for payment_products
drop policy if exists "Anyone can view payment products" on public.payment_products;
create policy "Anyone can view payment products"
  on public.payment_products for select
  using (true);

-- Minimal Privileges: Revoke all default table privileges and grant SELECT to authenticated only
revoke all on table public.payment_products from anon, authenticated;
grant select on table public.payment_products to authenticated;

-- Insert initial product seed catalog (active = false until PG approval)
-- 참고: 아래 amount 금액(9900, 3900, 1900)은 개발 및 테스트 흐름 검증용 임시 fixture 가격이며 실제 판매가격은 미확정 상태입니다.
insert into public.payment_products (id, name, product_type, plan, duration_days, amount, active)
values
  ('pro_monthly_sub', 'PRO 월간 정기구독', 'subscription', 'pro', 30, 9900, false),
  ('pro_7day_pass', 'PRO 7일 체험 패스', 'access_pass', 'pro', 7, 3900, false),
  ('pro_30day_pass', 'PRO 30일 이용권', 'access_pass', 'pro', 30, 9900, false),
  ('pro_single_pass', 'PRO 1회 이용권', 'one_time', 'pro', 1, 1900, false)
on conflict (id) do nothing;
