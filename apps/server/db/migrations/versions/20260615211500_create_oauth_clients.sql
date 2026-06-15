create table
  if not exists public.oauth_clients (
  id uuid not null default uuidv7(),
  client_id text not null,
  client_secret_hash text null,
  name text not null,
  logo_url text null,
  owner_id uuid null,
  redirect_uris text[] not null default '{}',
  allowed_grants text[] not null default '{}',
  allowed_scopes text[] not null default '{}',
  is_public boolean not null default false,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint oauth_clients_pkey primary key (id),
  constraint oauth_clients_client_id_key unique (client_id),
  constraint oauth_clients_owner_id_fkey foreign key (owner_id) references users (id) on delete set null,
  constraint oauth_clients_grants_check check (
    allowed_grants <@ array['authorization_code', 'refresh_token', 'client_credentials', 'implicit']::text[]
  ),
  constraint oauth_clients_public_secret_check check (
    (is_public = true and client_secret_hash is null)
    or
    (is_public = false and client_secret_hash is not null)
  )
);


create index
  if not exists oauth_clients_client_id_idx
  on oauth_clients (client_id)
where revoked_at is null;


create index
  if not exists oauth_clients_owner_id_idx
  on oauth_clients (owner_id)
where owner_id is not null;