import type {
  RegisterClientParams,
  RegisteredClientOptions,
  RegisteredClientResult,
  RevokedClientOptions,
  UpdateClientParams,
} from "./types.js";
import { randomBytes } from "crypto";
import { hash } from "argon2";
import { execAsync } from "../../lib/postgres/client.js";
import * as constants from "./constants.js";



export const findClientById = async (id: string): Promise<RegisteredClientOptions | undefined> => {
  const data = await execAsync<RegisteredClientOptions>({
    name: 'find-client-by-id',
    statement: `
      select
        client_id, name, logo_url, redirect_uris,
        allowed_grants, allowed_scopes, created_at, updated_at
      from oauth_clients
      where id = $id and revoked_at is null
    `,
    params: { id },
  });
  return data[0];
}



/**
 * @note We use `'base64url'` for encoding here to only include characters that are url safe.
 */
export const submitClientData = async ({
  name,
  logoUrl,
  redirectUris,
  allowedGrants = constants.DEFAULT_ALLOWED_GRANTS,
  allowedScopes = constants.DEFAULT_ALLOWED_SCOPES,
  isPublic,
}: RegisterClientParams): Promise<RegisteredClientResult | undefined> => {

  const clientId = randomBytes(constants.TOKEN_BYTE_SIZE).toString('base64url');

  let rawSecret: string | undefined;
  let secretHash: string | null = null;
  if (!isPublic) {
    rawSecret = randomBytes(constants.TOKEN_BYTE_SIZE).toString('base64url');
    secretHash = await hash(rawSecret);
  }

  const data = await execAsync<RegisteredClientOptions>({
    name: 'register-oauth-client',
    statement: `
      insert into oauth_clients (
        client_id, client_secret_hash, name, logo_url,
        redirect_uris, allowed_grants, allowed_scopes, is_public
      )
      values (
        $p_client_id, $p_client_secret_hash, $p_name, $p_logo_url,
        $p_redirect_uris, $p_allowed_grants, $p_allowed_scopes, $p_is_public
      )
      returning
        client_id, name, logo_url, redirect_uris,
        allowed_grants, allowed_scopes, created_at, updated_at
    `,
    params: {
      p_client_id: clientId,
      p_client_secret_hash: secretHash,
      p_name: name,
      p_logo_url: logoUrl,
      p_redirect_uris: redirectUris,
      p_allowed_grants: allowedGrants,
      p_allowed_scopes: allowedScopes,
      p_is_public: isPublic,
    },
  });

  return {
    client: data[0],
    secret: rawSecret,
  };
}



/**
 * @note We speculatively prepare a new secret if a client chooses to update
 * their public app to a confidential one, then discard it if the client was already confidential.
 * This in an accepted cost for now since I don't expect that many clients are going to switch
 * from an SPA to a backend.
 * 
 * @author iamasteriix
 */
export const updateClientData = async ({
  id,
  name,
  logoUrl,
  redirectUrisDiff,
  allowedGrantsDiff,
  allowedScopesDiff,
  isPublicDiff,
}: UpdateClientParams): Promise<RegisteredClientResult | undefined> => {

  let rawSecret: string | undefined;
  let secretHash: string | null = null;
  if (isPublicDiff.incoming !== isPublicDiff.current && isPublicDiff.incoming === false) {
    rawSecret = randomBytes(constants.TOKEN_BYTE_SIZE).toString('base64url'); // url-safe encoding
    secretHash = await hash(rawSecret);
  }

  const data = await execAsync<RegisteredClientOptions>({
    statement: `
      select update_oauth_client (
        $p_id, $p_redirect_uris_add, $p_redirect_uris_remove,
        $p_allowed_grants_add, $p_allowed_grants_remove, $p_allowed_scopes_add,
        $p_allowed_scopes_remove, $p_is_public, $p_secret_hash, $p_name,
        $p_logo_url
      )
    `,
    params: {
      p_id: id,
      p_secret_hash: secretHash,
      p_redirect_uris_add: redirectUrisDiff?.add,
      p_redirect_uris_remove: redirectUrisDiff?.remove,
      p_allowed_grants_add: allowedGrantsDiff?.add,
      p_allowed_grants_remove: allowedGrantsDiff?.remove,
      p_allowed_scopes_add: allowedScopesDiff?.add,
      p_allowed_scopes_remove: allowedScopesDiff?.remove,
      p_is_public: isPublicDiff.incoming,
      p_name: name,
      p_logo_url: logoUrl,
    },
  });

  return {
    client: data[0],
    secret: rawSecret,
  };
}



export const revokeClient = async (id: string): Promise<RevokedClientOptions | undefined> => {
  const data = await execAsync<RevokedClientOptions>({
    statement: `select revoke_oauth_client ($p_id)`,
    params: { p_id: id, },
  });

  return data[0];
}
