import type { AccessTokenPayload } from "./types.js";
import { jwtVerify } from "jose";
import { env } from "../../config/env.js";
import { getJWVerifyKey } from "../../lib/jwtKeys/jwtKeys.js";


/**
 * Verifies and decodes a JWT access token, validating issuer and algorithm.
 * Extracts and type-checks `sub` and `role` claims, returning them as `subject` and `role`.
 *
 * @param {string} token - JWT access token to verify.
 * @returns {Promise<AccessTokenPayload>} Decoded payload with `subject` and `role` fields.
 * @throws {Error} If token is invalid, verification fails, issuer/algorithm mismatch, or claims are missing/malformed.
 */
export const verifyAccessToken = async (token: string): Promise<AccessTokenPayload> => {
  const verifyKey = getJWVerifyKey();

  const { payload } = await jwtVerify(
    token,
    verifyKey,
    {
      issuer: env.ENDPOINT,
      algorithms: ['ES256'],
    }
  );

  if (typeof payload.sub !== 'string' || typeof payload.role !== 'string')
    throw new Error('Invalid token payload');

  return {
    subject: payload.sub,
    role: payload.role,
  };
}