create table if not exists bounties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  requirements text not null,
  work_type text not null,
  amount_ton numeric not null check (amount_ton > 0),
  poster_wallet text not null,
  worker_wallet text,
  status text not null default 'open',
  submitted_work text,
  mira_verdict text,
  mira_reason text,
  revision_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bounties_status_idx on bounties(status);
create index if not exists bounties_poster_idx on bounties(poster_wallet);
create index if not exists bounties_worker_idx on bounties(worker_wallet);
