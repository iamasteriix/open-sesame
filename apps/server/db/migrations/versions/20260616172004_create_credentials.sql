-- credentials: persistent auth secrets per user
-- type discriminates between auth mechanisms (e.g. totp, webauthn)
-- data shape is defined by type — validated in the application layer
create table if not exists public.credentials (
  id uuid not null default uuidv7(),
  user_id uuid not null,                          -- owner of this credential
  type text not null,                             -- credential type used to interpret data (totp, webauthn, etc)
  data jsonb not null,                            -- type-specific credential data (totp secret, webauthn metadata, etc)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint credentials_pkey primary key (id),
  constraint credentials_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade
);


-- fast lookup by user when determining available auth methods
create index if not exists credentials_user_id_idx
on public.credentials (user_id);