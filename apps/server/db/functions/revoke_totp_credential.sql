create or replace function revoke_totp_credential (p_user_id uuid)
returns void as $$
begin
  -- check that user already has credential
  if not exists (
    select 1
    from credentials
    where user_id = p_user_id and type = 'totp'
  ) then
    raise exception using
      errcode = 'P0002',
      message = 'TOTP not enrolled for this user';
  end if;

  -- delete totp credential data
  delete
  from credentials
  where user_id = p_user_id and type = 'totp';
end;
$$
language plpgsql
security invoker
set search_path = 'public';