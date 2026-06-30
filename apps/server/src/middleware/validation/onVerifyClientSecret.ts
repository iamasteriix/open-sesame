import type { Request, Response, NextFunction, } from "express"
import { verify } from "argon2";
import { UnauthorizedError, ValidationError } from "../../lib/errors/errors.js";
import { dbPool } from "../../config/db.js";


export const onVerifyClientSecret = async (
  request: Request,
  _: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (request.path !== '/oidc/token') return next();

    const { authorization } = request.headers;
    if (!authorization?.startsWith('Basic ')) return next();  // public client, or provider will handle missing credentials

    const authDecoded = Buffer.from(authorization.slice(6), 'base64').toString('utf-8');
    const [clientId, clientSecret] = authDecoded.split(':');
    if (!clientId || !clientSecret) throw new UnauthorizedError('Unauthorized client');

    const { rows, rowCount, } = await dbPool.query({
      name: 'find-confidential-client',
      text: `
        select client_secret_hash
        from oauth_clients
        where client_id = $1
          and is_public = false
          and revoked_at is null
      `,
      values: [clientId],
    });
    if (!rowCount) return next(); // let provider produce error for unknown clients

    const clientSecretHashed = rows[0].client_secret_hash;
    const isValid = await verify(clientSecret, clientSecretHashed);
    if (!isValid) throw new ValidationError('Confidential client authentication failed');

    // check passed
    // swap original secret with persisted hashed secret to pass provider's check
    const authSecretHashed = Buffer.from(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecretHashed)}`).toString('base64');
    request.headers.authorization = `Basic ${authSecretHashed}`;
    return next();
    
  } catch (error) {
    return next(error);
  }
}