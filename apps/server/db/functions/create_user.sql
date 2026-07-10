create or replace function create_user (
  p_handle text,
  p_email text,
  p_cred_type text,
  p_cred_data jsob,
  p_role text default 'user'
)
returns json as $$
declare
  v_user_id uuid;
  v_role_id uuid;
  v_now timestamptz = now();

begin
  -- create user
  insert into users (email, email_confirmed_at, handle)
  values (p_email, v_now, p_handle)
  on conflict on constraint users_handle_key do update
  set handle = excluded.handle -- fake update to force return
  returning id
  into v_user_id;

  -- assign roles
  -- sus out role id
  select id
  from roles
  where slug = p_role
  into v_role_id;

  -- it's roling time!
  insert into users_roles (user_id, role_id)
  values (v_user_id, v_role_id)
  on conflict on constraint users_roles_user_role_key do nothing;

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
end;
$$
language plpgsql
security invoker
set search_path = 'public';