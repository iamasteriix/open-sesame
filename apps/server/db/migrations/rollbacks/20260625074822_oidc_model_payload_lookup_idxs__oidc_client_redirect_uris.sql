drop index if exists oidc_models_payload_grant_id;
drop index if exists oidc_models_payload_user_code;
drop index if exists oidc_models_payload_uid;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_name = 'oauth_clients'
      and column_name = 'redirect_uris'
      and data_type = 'array'
  ) then
    alter table oauth_clients
      alter column redirect_uris
        type jsonb using to_jsonb(redirect_uris),
      alter column redirect_uris set not null,
      alter column redirect_uris set default '[]';
  end if;
end;
$$;
