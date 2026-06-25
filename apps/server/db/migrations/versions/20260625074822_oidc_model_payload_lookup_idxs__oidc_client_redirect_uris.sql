-- accelerate looking up to optimize deleting models with the provided grantId
create index if not exists oidc_models_payload_grant_id
on oidc_models ((payload->>'grantId'))
where payload->>'grantId' is not null;


-- accelerate lookup
create index if not exists oidc_models_payload_user_code
on oidc_models ((payload->>'userCode'))
where payload->>'userCode' is not null;


-- accelerate lookup
create index if not exists oidc_models_payload_uid
on oidc_models ((payload->>'uid'))
where payload->>'uid' is not null;


-- created jsonb column jsonb instead of array bc i'm an idiot
-- so, fixing that
-- also just now learning how to make `alter table` idempotent
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_name = 'oauth_clients'
      and column_name = 'redirect_uris'
      and data_type = 'jsonb'
  ) then
    alter table oauth_clients
      alter column redirect_uris drop default,
      alter column redirect_uris
        type text[] USING (translate(redirect_uris::text, '[]', '{}'))::text[],
      alter column redirect_uris set default array[]::text[];
  end if;
end;
$$;
