-- register client
insert into oauth_clients (
  client_id, client_secret_hash,
  name, logo_url,
  redirect_uris,
  allowed_grants, allowed_scopes,
  is_public
)
values (
  'shower-with-shampoo',
  null,
  'Wavebyte',
  'api.dicebear.com/10.x/icons/svg?seed=mach',
  '{"http://localhost:5000/callback"}',
  '{"authorization_code", "refresh_token"}',
  '{"openid", "profile", "email"}',
  true
)
on conflict on constraint oauth_clients_client_id_key do nothing;