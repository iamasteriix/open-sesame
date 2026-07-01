create or replace function update_oauth_client (
  p_id uuid,
  p_redirect_uris_add text[] default '{}',
  p_redirect_uris_remove text[] default '{}',
  p_allowed_grants_add text[] default '{}',
  p_allowed_grants_remove text[] default '{}',
  p_allowed_scopes_add text[] default '{}',
  p_allowed_scopes_remove text[] default '{}',
  p_is_public boolean default null,
  p_secret_hash text default null,
  p_name text default null,
  p_logo_url text default null
)
returns json as $$
declare
  v_row oauth_clients%rowtype;
  v_client_data json;
  v_final_redirect_uris text[];
  v_final_grants text[];
  v_final_scopes text[];

begin

  -- aggregate row data
  select redirect_uris, allowed_grants, allowed_scopes
  from oauth_clients
  where id = p_id and revoked_at is null
  into v_row
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Client not found';
  end if;


  -- redirect_uris: merge
  select coalesce(array_agg(distinct uri), '{}')
  from unnest (v_row.redirect_uris || p_redirect_uris_add) as uri
  where uri != all(p_redirect_uris_remove)
  into v_final_redirect_uris;

  -- then guard against empty
  if array_length (v_final_redirect_uris, 1) is null then
    raise exception using
      errcode = '23514',
      message = 'At least one redirect uri is required';
  end if;


  -- allowed_grants: merge
  -- constraint validates allowed set on update
  select coalesce(array_agg(distinct grant_name), '{}')
  from unnest (v_row.allowed_grants || p_allowed_grants_add) as grant_name
  where grant_name != all(p_allowed_grants_remove)
  into v_final_grants;


  -- allowed scopes: merge
  select coalesce(array_agg(distinct scope), '{}')
  from unnest (v_row.allowed_scopes || p_allowed_scopes_add) as scope
  where scope != all(p_allowed_scopes_remove)
  into v_final_scopes;


  -- update data
  update oauth_clients
  set
    client_secret_hash = case
      when p_is_public is null or p_is_public = is_public then client_secret_hash
      when p_is_public = true then null
      else p_secret_hash
    end,
    name = (p_name, name),
    logo_url = (p_logo_url, logo_url),
    redirect_uris = v_final_redirect_uris,
    allowed_grants = v_final_grants,
    allowed_scopes = v_final_scopes,
    is_public = coalesce(p_is_public, is_public),
    updated_at = now()
  where id = p_id
  returning json_build_object (
    'client_id', client_id,
    'name', name,
    'logo_url', logo_url,
    'owner_id', owner_id,
    'redirect_uris', redirect_uris,
    'allowed_grants', allowed_grants,
    'allowed_scopes', allowed_scopes,
    'created_at', created_at,
    'updated_at', updated_at
  )
  into v_client_data;


  return v_client_data;
end;
$$
language plpgsql
security invoker
set search_path = 'public';