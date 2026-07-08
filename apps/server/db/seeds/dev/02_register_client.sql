insert into oauth_clients (
  client_id,
  name,
  logo_url,
  redirect_uris,
  allowed_grants,
  allowed_scopes,
  is_public,
  is_native
)
values (
  'web-app',
  'Web',
  'api.dicebear.com/10.x/icons/svg?seed=0iww0wma',
  '{"http://localhost:3001/callback"}',
  '{"authorization_code", "refresh_token"}',
  '{"openid", "profile", "email"}',
  true,
  true
)
on conflict on constraint oauth_clients_client_id_key do nothing;