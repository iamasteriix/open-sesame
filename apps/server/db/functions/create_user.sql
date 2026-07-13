create or replace function create_user (
  p_username text,
  p_email text,
  p_cred_type text,
  p_cred_data jsonb,
  p_role text default 'user'
)
returns json as $$
declare
  v_user_id uuid;
  v_role_id uuid;
  v_user json;
  v_now timestamptz = now();

begin
  -- create user
  insert into users (email, email_confirmed_at, username)
  values (p_email, v_now, p_username)
  on conflict on constraint users_username_key do update
  set username = excluded.username -- fake update to force return
  returning id
  into v_user_id;


  -- assign roles
  -- sus out role id
  select id
  from roles
  where slug = p_role
  into v_role_id;

  -- it's roling time!
  insert into user_roles (user_id, role_id)
  values (v_user_id, v_role_id)
  on conflict on constraint user_roles_user_role_key do nothing;


  -- save credential
  if not exists (
    -- totp can only be enrolled once
    select 1
    from user_credentials
    where user_id = v_user_id and type = 'totp'
  ) then
    insert into user_credentials (user_id, type, data)
    values (v_user_id, p_cred_type, p_cred_data);
  end if;


  -- fetch user
  select json_build_object (
    'id', u.id,
    'email', u.email,
    'phone', u.phone,
    'username', u.username,
    'display_name', u.display_name,
    'avatar_url', u.avatar_url,
    'roles', urr.roles
  ) from users u
  join lateral (
    select array_agg (r.slug order by r.slug) as roles
    from roles r
    join user_roles ur on ur.role_id = r.id
    where ur.user_id = u.id
    group by ur.user_id
  ) urr on true
  where u.email = p_email and u.deleted_at is null
  into v_user;

  return v_user;
end;
$$
language plpgsql
security invoker
set search_path = 'public';