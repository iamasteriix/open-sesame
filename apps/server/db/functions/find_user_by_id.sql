create or replace function find_user_by_id (p_id uuid)
returns json as $$
begin
  return
  select json_build_object (
    'id', u.id,
    'email', u.email,
    'phone', u.phone,
    'username', u.username,
    'role', u.role,
    'display_name', p.display_name,
    'avatar_url', p.avatar_url,
    'deleted_at', u.deleted_at
  )
  from users u
  join user_profiles p on p.user_id = u.id
  where u.id = p_id
    and u.deleted_at is null;
end;
language plpgsql
security invoker
set search_path = 'public';