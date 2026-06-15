create table
  if not exists public.user_links (
  id uuid not null default uuidv7(),
  user_id uuid not null,
  url text not null,
  display_order integer not null default 0,
  favicon_url text null,
  description text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint user_links_pkey primary key (id),
  constraint user_links_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint user_links_display_order_key unique (user_id, display_order)
);