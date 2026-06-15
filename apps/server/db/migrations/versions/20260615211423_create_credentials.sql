create table
  if not exists public.credentials (
  id uuid not null default uuidv7(),
  user_id uuid not null,
  provider text not null,
  provider_user_id text null,
  password_hash text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint credentials_pkey primary key (id),
  constraint credentials_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint credentials_user_provider_key unique (user_id, provider),
  constraint credentials_provider_check check (provider in ('local', 'google', 'github', 'instagram')),
  constraint credentials_password_hash_check check (
    (provider = 'local' and password_hash is not null and provider_user_id is null)
    or
    (provider != 'local' and password_hash is null and provider_user_id is not null)
  )
);


create index
  if not exists credentials_provider_idx
  on credentials (provider, provider_user_id)
  where provider_user_id is not null;