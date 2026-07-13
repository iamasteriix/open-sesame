-- core identity table; foundation of the schema
create table if not exists public.users (
  id uuid not null default uuidv7(),
  email text null,
  email_confirmed_at timestamptz null,
  phone text null,
  phone_confirmed_at timestamptz null,
  username text not null,
  display_name text null,
  avatar_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_phone_key unique (phone),
  constraint users_username_key unique (username),
  constraint users_phone_nonempty_check check (phone is null or length(trim(phone)) > 0),
  constraint users_username_nonempty_check check (length(trim(username)) > 3 and length(trim(username)) <= 36),
  constraint users_display_name_check check (
    display_name is null
    or (length(trim(display_name)) > 0 and char_length(display_name) <= 54)
  )
);


-- i mean, how many roles and permissions can there truly be for this one app?
create table if not exists public.roles (
  id uuid not null default uuidv7(),
  slug text not null,
  name text not null,
  description text null,
  permissions jsonb not null default '[]',
  constraint roles_pkey primary key (id),
  constraint roles_slug_key unique (slug),
  constraint roles_description_length_check check (description is null or char_length(description) <= 270)
);


-- many-to-many relationships between users and roles
create table if not exists public.user_roles (
  id uuid not null default uuidv7(),
  user_id uuid not null,
  role_id uuid not null,
  constraint user_roles_pkey primary key (id),
  constraint user_roles_user_role_key unique (user_id, role_id),
  constraint user_roles_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
  constraint user_roles_role_id_fkey foreign key (role_id) references public.roles (id) on delete cascade
);


-- partial index on soft-deleted rows so planner can exclude them efficiently
-- indexing the entire column would be inefficient since it has low cardinality (ie, mostly null rows)
-- useful when querying soft-deleted rows
-- regular lookup for active users would use the primary key or a sequential scan
create index if not exists users_deleted_at_idx
on public.users (deleted_at)
where deleted_at is not null;


-- apparently postgres does not auto-index foreign keys
create index if not exists user_roles_user_id_idx on public.user_roles (user_id);
create index if not exists user_roles_role_id_idx on public.user_roles (role_id);



-- ————————————————————————————————————————————————————————————————————————————
-- ykw? everything else also goes into this migration; i already know what the schema looks like, don't i?
-- ————————————————————————————————————————————————————————————————————————————
create table if not exists public.devices (
  id uuid not null default uuidv7(),
  name text not null,
  slug text not null,
  image_url text null,
  os text null,
  os_version text null,
  device_type text null,
  created_at timestamptz not null default now(),
  constraint devices_pkey primary key (id),
  constraint devices_slug_os_version_key unique (slug, os, os_version)
);


-- link a user to their devices
create table if not exists public.user_devices (
  id uuid not null default uuidv7(),
  user_id uuid not null,
  device_id uuid null,
  device_fingerprint text null,       -- unique hash identifying device
  constraint user_devices_pkey primary key (id),
  constraint user_devices_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
  constraint user_devices_device_id_fkey foreign key (device_id) references public.devices (id) on delete set null
);


-- active periods
create table if not exists public.user_device_activity (
  id uuid not null default uuidv7(),
  user_device_id uuid not null,
  token_id text not null,                                             -- public-facing auth token that links to this record
  ip_address inet null,
  user_agent text null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  constraint user_device_activity_pkey primary key (id, created_at),  -- postgres requires partitioned table PK to include partition key
  constraint user_device_activity_user_device_id_fkey foreign key (user_device_id) references public.user_devices (id) on delete cascade
)
partition by range (created_at);


-- partition for active devices logged in calendar year 2026
create table if not exists public.user_device_activity_2026
partition of public.user_device_activity for
  values from ('2026-01-01') to ('2027-01-01');


-- default partition for active rows outside defined ranges
create table if not exists public.user_device_activity_default
partition of public.user_device_activity default;


-- accelerate lookups
create index if not exists user_devices_user_id_idx on public.user_devices (user_id);
create index if not exists user_devices_device_id_idx on public.user_devices (device_id);
create index if not exists user_device_activity_token_id_idx on public.user_device_activity (token_id);


-- partial index to accelerate lookups of active devices per user
-- cannot include `expires_at > now()` bc partial index predicates must be immutable; check condition in query
create index if not exists user_device_activity_active_device_idx
on public.user_device_activity (user_device_id, expires_at)
where revoked_at is null;



-- ————————————————————————————————————————————————————————————————————————————
-- persistent auth secrets per user
-- type discriminates between auth mechanisms (eg. totp, webauthn, etc)
-- data shape is defined by type — validated in the application layer
create table if not exists public.user_credentials (
  id uuid not null default uuidv7(),
  user_id uuid not null,
  type text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_credentials_pkey primary key (id),
  constraint user_credentials_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade
);


-- accelerate lookup
create index if not exists user_credentials_user_id_idx on public.user_credentials (user_id);



-- ————————————————————————————————————————————————————————————————————————————
-- registered OIDC/OAuth first/third-party client applications that authenticate users via open-sesame
-- public clients (eg. SPAs, mobile apps ) have no secret; confidential clients do
-- trust level (is_public) is set by the open-sesame operator at client registration time
create table if not exists public.oauth_clients (
  id uuid not null default uuidv7(),              -- internal id for this client record
  client_id text not null,                        -- public-facing oauth identifier that can be rotated
  client_secret_hash text null,                   -- hashed client secret (null for public clients)
  name text not null,
  logo_url text null,
  redirect_uris text[] not null default '{}',
  allowed_grants text[] not null default '{}',    -- subset of supported grant types
  allowed_scopes text[] not null default '{}',    -- allowed oauth scopes for client app
  is_public boolean not null default false,       -- if true, client is public and must not have a secret
  is_native boolean not null default false,       -- first-party client flag
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz null,                    -- track valid client
  constraint oauth_clients_pkey primary key (id),
  constraint oauth_clients_client_id_key unique (client_id),
  constraint oauth_clients_public_secret_check check (
    (is_public = true and client_secret_hash is null)
    or (is_public = false and client_secret_hash is not null)
  ),
  constraint oauth_clients_grants_check check (
    allowed_grants <@ array['authorization_code', 'refresh_token', 'client_credentials', 'implicit']::text[]
  )
);


-- partial index to accelerate looking up valid clients
create index if not exists oauth_clients_client_id_idx
on public.oauth_clients (client_id)
where revoked_at is null;



-- ————————————————————————————————————————————————————————————————————————————
-- scope of grants users allow oauth clients
create table if not exists public.oauth_user_consents (
  id uuid not null default uuidv7(),
  user_id uuid not null,
  client_id uuid not null,
  scopes text[] not null default '{}',            -- scopes user consented to grant client
  granted_at timestamptz not null default now(),
  revoked_at timestamptz null,
  constraint oauth_user_consents_pkey primary key (id),
  constraint oauth_user_consents_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
  constraint oauth_user_consents_client_id_fkey foreign key (client_id) references public.oauth_clients (id) on delete cascade,
  constraint oauth_user_consents_user_client_key unique (user_id, client_id)
);


-- cover lookups during token issuance to verify scopes user consented to
create index if not exists oauth_user_consents_user_id_idx
on public.oauth_user_consents (user_id)
where revoked_at is null;

create index if not exists oauth_user_consents_client_id_idx
on public.oauth_user_consents (client_id)
where revoked_at is null;



-- ————————————————————————————————————————————————————————————————————————————
-- generic persistence table to store all the durable stateful objects the oidc provider needs to track during auth flows
-- the provider may generate different model types with similar ids across auth flows
create table if not exists public.oidc_models (
  id text not null,    -- model identifier within a flow (combined with 'name' for uniqueness)
  kind text not null,
  payload jsonb not null default '{}',  -- persisted context state
  granted_at timestamptz,
  consumed_at timestamptz,
  expires_at timestamptz,
  constraint oidc_models_pkey primary key (id, kind)
);


-- partial index for active models
create index if not exists oidc_models_active_models_idx
on public.oidc_models (expires_at)
where expires_at is not null;


-- accelerate looking up transient token identifiers
create index if not exists oidc_models_payload_grant_id_idx
on public.oidc_models ((payload->>'grantId'))
where payload->>'grantId' is not null;

create index if not exists oidc_models_payload_uid_idx
on public.oidc_models ((payload->>'uid'))
where payload->>'uid' is not null;

create index if not exists oidc_models_payload_usercode_idx
on public.oidc_models ((payload->>'userCode'))
where payload->>'userCode' is not null;


-- clean up stale entities with a scheduled job
create extension if not exists pg_cron;

select cron.schedule (
  'oidc:purge-stale-models',  -- job name (naming scheme: context:action-target)
  '0 * * * *',                -- cron expression: run at minute 0 of every hour
  $$
    delete
    from oidc_models
    where expires_at < now()
  $$
);
