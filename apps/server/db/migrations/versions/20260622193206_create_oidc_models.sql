-- a generic persistence table used to store all the stateful objects the OIDC server needs to track during auth flows
-- these OIDC server models are different entity types with similar ids across a flow, discriminated with the `type` column
create table if not exists oidc_models (
  id text not null,                     -- model identifier within a flow/context (combined with type for uniqueness)
  type text not null,                   -- discriminator for the model subtype (e.g., 'authorization_request', 'access_token', etc.)
  payload jsonb not null default '{}',  -- json state for the model
  granted_at timestamptz,               -- when this state was issued
  consumed_at timestamptz,              -- along with granted_at, lifecycle timestamps the adapter protocol tracked separately from the payload
  expires_at timestamptz,               -- to facilitate cleaning up

  constraint oidc_models_pkey primary key (id, type)
);


-- partial index to speed cleanup of invalid model state
create index if not exists oidc_models_expires_at_idx
on oidc_models (expires_at)
where expires_at is not null;