create table
  if not exists public.user_devices (
  id uuid not null default uuidv7(),
  user_id uuid not null,
  push_token text null,
  platform text null,
  device_name text null,
  device_data jsonb null,
  last_active_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint user_devices_pkey primary key (id),
  constraint user_devices_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint user_devices_push_token_key unique (push_token),
  constraint user_devices_platform_check check (platform in ('apns', 'fcm', 'web')),
  constraint user_devices_platform_token_check check (
    (push_token is null and platform is null)
    or
    (push_token is not null and platform is not null)
  )
);


create index
  if not exists user_devices_user_id_idx
  on user_devices (user_id);


create index
  if not exists user_devices_push_token_idx
  on user_devices (push_token)
  where push_token is not null;