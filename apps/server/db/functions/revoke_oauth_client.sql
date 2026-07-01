create or replace function revoke_oauth_client (p_id uuid)
returns json as $$
declare
  v_client_id text;
  v_revoked_at timestamptz = now();

begin
  -- update client record
  -- coalesce keeps this idempotent
  update oauth_clients
  set revoked_at = coalesce(revoked_at, v_revoked_at)
  where id = p_id
  returning client_id, revoked_at
  into v_client_id, v_revoked_at;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Client not found';
  end if;

  -- invalidate tokens issued to this client immediately
  delete
  from oidc_models
  where payload->>'clientId' = v_client_id;

  return json_build_object (
    'id', p_id,
    'revoked_at', v_revoked_at
  );
end;
$$
language plpgsql
security invoker
set search_path = 'public';