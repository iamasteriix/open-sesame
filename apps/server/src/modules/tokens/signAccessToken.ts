import type { AccessTokenPayload } from "./types.js";
import { SignJWT } from "jose";
import { env } from "../../config/env.js";
import { getSigningKey } from "../../config/keys.js";
import { ACCESS_TOKEN_TTL_SECS } from "../tokens/constants.js";


/**
 * Signs and returns a JWT access token with the provided payload.
 * Uses ES256 algorithm with a private signing key; sets subject, issued-at, expiration, and issuer claims.
 *
 * @param {AccessTokenPayload} payload - Object containing `role` and `subject` fields.
 * @returns {Promise<string>} Signed JWT access token.
 * @throws {Error} If signing key retrieval or JWT signing fails.
 */
export const signAccessToken = async (payload: AccessTokenPayload): Promise<string> => {
  const now = Math.floor(Date.now()/1000);
  const signingKey = getSigningKey();

  const jwt = new SignJWT({ role: payload.role, })
    .setProtectedHeader({ alg: 'ES256' })
    .setSubject(payload.subject)
    .setIssuedAt(now)
    .setExpirationTime(now + ACCESS_TOKEN_TTL_SECS)
    .setIssuer(env.ENDPOINT)
    .sign(signingKey);

  return jwt;
}