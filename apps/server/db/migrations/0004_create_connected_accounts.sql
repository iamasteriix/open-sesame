create table
if not exists public.connected_accounts (
  id uuid not null default uuidv7(),
  user_id uuid not null,
  provider text not null,
  provider_user_id text not null,
  username text null,
  display_name text null,
  avatar_url text null,
  profile_url text null,
  metadata jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint connected_accounts_pkey primary key (id),
  constraint connected_accounts_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint connected_accounts_provider_user_id_key unique (user_id, provider, provider_user_id)
);


create index connected_accounts_provider_idx
on connected_accounts (provider, provider_user_id);