create or replace function create_user (
  p_username text,
  p_email text,
  p_phone text,
  p_secret text,
  p_avatar_url text default null
)
returns json as $$
declare
  v_user_id uuid;
  v_user json;

begin
  with
    new_user as (
      -- register core identity
      insert into users (email, phone, username, email_confirmed_at)
      values (p_email, p_phone, p_username, now())
      returning id, email, phone, username, role, deleted_at, display_name
    ),
    new_profile as (
      -- add user profile
      insert into user_profiles (user_id, avatar_url)
      select id, p_avatar_url
      from new_user
      on conflict on constraint user_profiles_user_id_fkey do nothing
      returning avatar_url
    ),
    new_credential as (
      -- save totp credential data
      insert into credentials (user_id, type, data)
      select
        id,
        'totp',
        jsonb_build_object('secret', p_secret)
      from new_user
      returning id  -- returning something ensures the write executes completely
    )
  select json_build_object (
    'id', u.id,
    'email', u.email,
    'phone', u.phone,
    'username', u.username,
    'role', u.role,
    'display_name', u.display_name,
    'avatar_url', p.avatar_url,
    'deleted_at', u.deleted_at
  )
  from new_user u
  cross join new_profile p;

  return v_user;
end;
$$
language plpgsql
security invoker
set search_path = 'public';