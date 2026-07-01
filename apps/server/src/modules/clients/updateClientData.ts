import type { RegisteredClientResult, UpdateClientParams } from "./types.js";
import { randomBytes } from "crypto";
import { hash } from "argon2";
import { dbPool } from "../../config/db.js"
import { TOKEN_BYTE_SIZE } from "./constants.js";
import { AppError } from "../../lib/errors/errors.js";


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
  redirectUris,
  allowedGrants,
  allowedScopes,
  isPublic,
}: UpdateClientParams): Promise<RegisteredClientResult | undefined> => {

  let rawSecret: string | undefined;
  let secretHash: string | null = null;
  if (isPublic.incoming !== isPublic.current && isPublic.incoming === false) {
    rawSecret = randomBytes(TOKEN_BYTE_SIZE).toString('base64url'); // url-safe encoding
    secretHash = await hash(rawSecret);
  }
  
  let result;
  try {
    result = await dbPool.query({
      text: `
        select update_oauth_client ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        as data
      `,
      values: [
        id,
        redirectUris.add,
        redirectUris.remove,
        allowedGrants.add,
        allowedGrants.remove,
        allowedScopes.add,
        allowedScopes.remove,
        isPublic.incoming,
        secretHash,
        name,
        logoUrl,
      ],
    });
  } catch (error) {
    if (error instanceof AppError) {
      if (error.code === 'P0002') throw new AppError(error.message, 404, error.code);
      if (error.code === '23514') throw new AppError(error.message, 400, error.code);
    } else throw error;
  }
  
  const row = result?.rows[0]?.data;
  if (!row) return undefined;

  return {
    client: row,
    secret: rawSecret,
  };
}