create or replace function find_user_by_username (p_username text)
returns json as $$
declare
  v_user json;

begin
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
  from users u
  join user_profiles p on p.user_id = u.id
  where u.username = p_username
    and u.deleted_at is null
  into v_user;

  return v_user;
end;
$$
language plpgsql
security invoker
set search_path = 'public';