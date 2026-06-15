create table
if not exists public.sessions (
  id uuid not null default uuidv7(),
  user_id uuid not null,
  credential_id uuid null,
  token_id text not null,
  ip_address inet null,
  user_agent_data jsonb null,
  device_id uuid null,
  last_active_at timestamptz null,
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),

  constraint sessions_pkey primary key (id, created_at),
  constraint sessions_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint sessions_device_id_fkey foreign key (device_id) references user_devices (id) on delete set null,
  constraint sessions_credential_id_fkey foreign key (credential_id) references credentials (id) on delete set null,
  constraint sessions_token_id_key unique (token_id)
) partition by range (created_at);


create index sessions_user_id_idx
on sessions (user_id);


create index sessions_token_id_idx
on sessions (token_id);


create index sessions_active_idx
on sessions (user_id, expires_at)
where revoked_at is null;


create table sessions_default
partition of sessions default;