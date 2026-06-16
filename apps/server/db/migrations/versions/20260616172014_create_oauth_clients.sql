-- oauth_clients: registered OIDC/OAuth client applications
-- represents third-party or first-party apps that authenticate users via open-sesame
-- public clients (e.g. SPAs, mobile apps) have no secret; confidential clients do
-- trust level (is_public) is set by the open-sesame operator at client registration time
create table
  if not exists public.oauth_clients (
  id uuid not null default uuidv7(),              -- internal id for this client record
  client_id text not null,                        -- public-facing oauth identifier that can be rotated
  client_secret_hash text null,                   -- hashed client secret (null for public clients)
  name text not null,                             -- client app name
  logo_url text null,                             -- optional url to app logo
  owner_id uuid null,                             -- developer user id
  redirect_uris jsonb not null default '[]',      -- redirect uris to consent management pages (privacy, terms, etc)
  allowed_grants text[] not null default '{}',    -- subset of supported grant types
  allowed_scopes text[] not null default '{}',    -- allowed oauth scopes for client app
  is_public boolean not null default false,       -- if true, client is public and must not have a secret
  revoked_at timestamptz null,                    -- track whether client is active
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint oauth_clients_pkey primary key (id),
  constraint oauth_clients_client_id_key unique (client_id),
  constraint oauth_clients_owner_id_fkey foreign key (owner_id) references public.users (id) on delete set null,
  constraint oauth_clients_public_secret_check check (
    (is_public = true and client_secret_hash is null)
    or
    (is_public = false and client_secret_hash is not null)
  ),
  constraint oauth_clients_grants_check check (
    allowed_grants <@ array['authorization_code', 'refresh_token', 'client_credentials', 'implicit']::text[]
  )
);


-- primary lookup path during oauth flows
-- non-null rows (revoked clients) are excluded from index entirely since they'll never be valid in an auth flow
create index
  if not exists oauth_clients_client_id_idx
  on public.oauth_clients (client_id)
  where revoked_at is null;


-- find all clients owned by a user (the dev)
create index
  if not exists oauth_clients_owner_id_idx
  on public.oauth_clients (owner_id)
  where owner_id is not null;