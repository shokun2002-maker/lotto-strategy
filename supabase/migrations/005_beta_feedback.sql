-- Day 34 Supabase Migration: public.beta_feedback
-- Purpose: In-App Beta Feedback storage table with strict RLS and explicit REVOKE for anon/authenticated roles.
-- Client direct mutations/queries from browser are denied; Service Role Server API routes handle all feedback submissions and admin actions.

-- ====================================================
-- 1. Table: public.beta_feedback
-- ====================================================
create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  page text null,
  category text not null default 'general',
  message text not null,
  device_type text null,
  os text null,
  browser text null,
  app_mode text null,
  severity text not null default 'UNCLASSIFIED',
  status text not null default 'NEW',
  admin_note text null,
  resolved_at timestamptz null,
  constraint chk_beta_feedback_category check (category in ('general', 'bug', 'ux', 'feature')),
  constraint chk_beta_feedback_severity check (severity in ('UNCLASSIFIED', 'P0', 'P1', 'P2', 'P3')),
  constraint chk_beta_feedback_status check (status in ('NEW', 'CONFIRMED', 'IN_PROGRESS', 'FIXED', 'RETEST', 'CLOSED', 'WONT_FIX'))
);

-- Indexes for beta_feedback
create index if not exists idx_beta_feedback_created_at on public.beta_feedback(created_at desc);
create index if not exists idx_beta_feedback_status on public.beta_feedback(status);
create index if not exists idx_beta_feedback_severity on public.beta_feedback(severity);
create index if not exists idx_beta_feedback_user_id on public.beta_feedback(user_id);

-- Enable RLS
alter table public.beta_feedback enable row level security;

-- Minimal Privileges: Revoke all default table privileges from anon and authenticated roles
revoke all on table public.beta_feedback from anon, authenticated;
