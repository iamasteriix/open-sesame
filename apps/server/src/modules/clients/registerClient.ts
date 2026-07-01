import type { RegisterClientParams, RegisteredClientResult } from "./types.js";
import { randomBytes } from "crypto";
import { hash } from "argon2";
import { DEFAULT_ALLOWED_GRANTS, DEFAULT_ALLOWED_SCOPES, TOKEN_BYTE_SIZE } from "./constants.js";
import { dbPool } from "../../config/db.js";


/**
 * @note We use `'base64url'` for encoding here to only include characters that are url safe.
 */
export const registerClient = async ({
  name,
  logoUrl,
  ownerId,
  redirectUris,
  allowedGrants = DEFAULT_ALLOWED_GRANTS,
  allowedScopes = DEFAULT_ALLOWED_SCOPES,
  isPublic,
}: RegisterClientParams): Promise<RegisteredClientResult | undefined> => {

  const clientId = randomBytes(TOKEN_BYTE_SIZE).toString('base64url');

  let rawSecret: string | undefined;
  let secretHash: string | null = null;
  if (!isPublic) {
    rawSecret = randomBytes(TOKEN_BYTE_SIZE).toString('base64url');
    secretHash = await hash(rawSecret);
  }

  const { rows, rowCount, } = await dbPool.query({
    name: 'register-oauth-client',
    text: `
      insert into oauth_clients (
        client_id, client_secret_hash,
        name, logo_url,
        owner_id,
        redirect_uris,
        allowed_grants, allowed_scopes,
        is_public
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      returning
        client_id,
        name, logo_url,
        owner_id,
        redirect_uris,
        allowed_grants, allowed_scopes,
        created_at, updated_at
    `,
    values: [
      clientId, secretHash,
      name, logoUrl,
      ownerId,
      redirectUris,
      allowedGrants, allowedScopes,
      isPublic
    ],
  });
  if (!rowCount) return undefined;

  return {
    client: rows[0],
    secret: rawSecret,
  };
}