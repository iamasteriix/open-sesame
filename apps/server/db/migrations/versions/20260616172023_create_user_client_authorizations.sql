-- user_client_authorizations: consent grants between users and oauth clients
-- records which scopes a user has granted to a client and when
-- a row exists only if the user has explicitly authorized the client
create table
  if not exists public.user_client_authorizations (
  id uuid not null default uuidv7(),
  user_id uuid not null,
  client_id uuid not null,
  scopes text[] not null default '{}',            -- granted scopes by this user to the client
  granted_at timestamptz not null default now(),
  revoked_at timestamptz null,

  constraint user_client_authorizations_pkey primary key (id),
  constraint user_client_authorizations_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
  constraint user_client_authorizations_client_id_fkey foreign key (client_id) references public.oauth_clients (id) on delete cascade,
  constraint user_client_authorizations_user_client_key unique (user_id, client_id)
);


-- covers lookups during token issuance to verify a user has authorized a client
create index
  if not exists user_client_authorizations_user_id_idx
  on public.user_client_authorizations (user_id)
  where revoked_at is null;