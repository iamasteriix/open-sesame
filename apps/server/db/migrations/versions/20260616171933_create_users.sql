-- users: core identity table
-- the foundation of the schema; all other tables reference this one
create table if not exists public.users (
  id uuid not null default uuidv7(),
  email text null,
  email_confirmed_at timestamptz null,
  phone text null,
  phone_confirmed_at timestamptz null,
  display_name text null,                         -- optional name shown in UI
  username text not null,                         -- required unique handle longer than 3 non-space characters
  role text not null default 'user'::text,        -- authorization role
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,

  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_phone_key unique (phone),
  constraint users_username_key unique (username),
  constraint users_role_check check (role in ('user', 'admin')),
  constraint users_phone_not_empty check (phone is null or length(trim(phone)) > 0),
  constraint users_username_check check (length(trim(username)) > 3),
  constraint users_display_name_check check (display_name is null or length(trim(display_name)) > 0)
);


-- partial index on soft-deleted rows so planner can exclude them efficiently
-- indexing the entire column would be inefficient since it has low cardinality (ie, mostly null rows)
-- useful when querying soft-deleted rows
-- regular lookup for active users would use the primary key or a sequential scan
create index if not exists users_deleted_at_idx
on public.users (deleted_at)
where deleted_at is not null;