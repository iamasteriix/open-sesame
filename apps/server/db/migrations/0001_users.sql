create table users (
  id uuid not null default uuidv7(),
  email text not null,
  email_confirmed_at timestamptz null,
  phone text null,
  phone_confirmed_at timestamptz null,
  display_name text null,
  username text null,
  role text not null default 'user'::text,
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
  constraint user_display_name_check check (display_name is null or length(trim(display_name)) > 0)
);


create index users_deleted_at_idx
on users (deleted_at)
where deleted_at is not null;