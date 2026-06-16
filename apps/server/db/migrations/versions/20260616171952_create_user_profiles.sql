-- user_profiles: extended identity information
-- one-to-one with users; separated to keep the users table lean
create table
  if not exists public.user_profiles (
  id uuid not null default uuidv7(),
  user_id uuid not null,                          -- one-to-one relation linking profile to user
  bio text null,
  avatar_url text null,
  location jsonb null,                            -- sturctured location metadata
  timezone text null,                             -- IANA timezone identifier
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
  constraint user_profiles_user_id_key unique (user_id),

  constraint user_profiles_timezone_check check (
    timezone is null or timezone ~ '^[A-Za-z_]+/[A-Za-z_/]+$'
  ),
  constraint user_profiles_location_check check (
    location is null or (
      jsonb_typeof(location) = 'object'
      and ((location->>'city') is null or jsonb_typeof(location->'city') = 'string')
      and ((location->>'region_code') is null or jsonb_typeof(location->'region_code') = 'string')
      and ((location->>'country') is null or location->>'country' ~ '^[A-Z]{2}$')
      and ((location->>'postal') is null or jsonb_typeof(location->'postal') = 'string')
      and ((location->>'country_calling_code') is null or location->>'country_calling_code' ~ '^[0-9]{1,4}$')
      and ((location->>'currency') is null or location->>'currency' ~ '^[A-Z]{3}$')
      and ((location->>'asn') is null or location->>'asn' ~ '^[0-9]+$')
      and ((location->>'language') is null or location->>'language' ~ '^[a-z]{2,3}(-[A-Z]{2})?$')
      and (location - array['city', 'region_code', 'country', 'postal', 'country_calling_code', 'currency', 'asn', 'language']) = '{}'::jsonb
    )
  )
);