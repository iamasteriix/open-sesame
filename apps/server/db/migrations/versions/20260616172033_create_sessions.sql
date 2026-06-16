-- sessions: active user sessions
-- partitioned by range on created_at for future scalability
-- token_id uniqueness is delegated to jose via the jti claim
create table
  if not exists public.sessions (
  id uuid not null default uuidv7(),
  user_id uuid not null,
  token_id text not null,                         -- public-facing session token identifier
  ip_address inet null,
  user_agent_data jsonb null,                     -- parsed user-agent/device metadata
  device_id uuid null,                            -- optional device id linking multiple sessions from the same device
  last_active_at timestamptz null,
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),

  constraint sessions_pkey primary key (id, created_at),
  constraint sessions_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade
)
partition by range (created_at);


-- find all sessions for a user
create index
  if not exists sessions_user_id_idx
  on public.sessions (user_id);


-- resolve session by token_id quickly
create index
  if not exists sessions_token_id_idx
  on public.sessions (token_id);


-- partial index to accelerate lookups of active sessions per user
create index
  if not exists sessions_active_idx
  on public.sessions (user_id, expires_at)
  where revoked_at is null;


-- default partition to accept rows outside defined ranges
create table
  if not exists public.sessions_default
partition of public.sessions default;


-- partition for sessions created in calendar year 2026
create table
  if not exists public.sessions_2026
partition of public.sessions
  for values from ('2026-01-01') to ('2027-01-01');