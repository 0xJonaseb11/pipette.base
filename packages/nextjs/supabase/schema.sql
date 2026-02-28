-- Users table
create table public.users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  github_id text unique,
  github_login text,
  github_account_age_days integer default 0,
  github_public_repos integer default 0,
  github_followers integer default 0,
  sybil_score integer default 0,
  status text not null default 'pending' check (status in ('active', 'pending', 'blocked')),
  last_claim_at timestamptz,
  total_claimed numeric default 0,
  created_at timestamptz default now()
);

-- Claim history for analytics
create table public.claim_history (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null references public.users(wallet_address),
  amount numeric not null,
  tx_hash text not null,
  claimed_at timestamptz default now()
);

-- Treasury snapshot for tracking balance over time
create table public.treasury_snapshots (
  id uuid primary key default gen_random_uuid(),
  balance_eth numeric not null,
  recorded_at timestamptz default now()
);

-- Indexes
create index on public.users(wallet_address);
create index on public.users(status);
create index on public.claim_history(wallet_address);
create index on public.claim_history(claimed_at);

-- Function to update user after a claim (used by service role only)
create or replace function public.increment_total_claimed(
  p_wallet_address text,
  p_amount numeric
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.users
  set total_claimed = total_claimed + p_amount,
      last_claim_at = now()
  where wallet_address = p_wallet_address;
$$;

-- RLS: service_role (API) bypasses RLS. anon/authenticated have no direct access.
-- All mutations go through the API with wallet signature verification (Ethereum sign-in).
alter table public.users enable row level security;
alter table public.claim_history enable row level security;
alter table public.treasury_snapshots enable row level security;

-- Explicit: anon cannot read or modify any table (API uses service_role only)
create policy "anon_no_users" on public.users for all to anon using (false) with check (false);
create policy "anon_no_claim_history" on public.claim_history for all to anon using (false) with check (false);
create policy "anon_no_treasury_snapshots" on public.treasury_snapshots for all to anon using (false) with check (false);

