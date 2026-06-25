create or replace function save_totp_credential (
  p_user_id uuid,
  p_secret text
) returns void as $$
begin
  -- check that user has not enrolled with totp already
  if exists (
    select 1
    from credentials
    where
      user_id = p_user_id
      and type = 'totp'
  ) then
    raise exception 'totp_already_enrolled';
  end if;

  -- add totp credential data
  insert
  into credentials (user_id, type, data)
  values (
    p_user_id,
    'totp',
    jsonb_build_object('secret', p_secret)
  );
end;
$$
language plpgsql
security invoker
set search_path = 'public';