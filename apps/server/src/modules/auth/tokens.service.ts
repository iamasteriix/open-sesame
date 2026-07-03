import type { AccessTokenPayload, RefreshTokenParams } from "./types.js";
import type { RedisPipelineExecType } from "./types.js";
import { randomBytes } from "crypto";
import { jwtVerify, SignJWT } from "jose";
import { redis } from "../../config/redis.js";
import { env } from "../../config/env.js";
import { getJWSigningKey, getJWVerifyKey } from "../../lib/jwtKeys/jwtKeys.js";
import * as constants from "./constants.js";



/**
 * Consumes a magic link token by retrieving and atomically deleting it from Redis.
 * `pipeline().get().delete()` is critical here: It sends both commands to Redis in a single
 * round-trip and executes them sequentially. Running the commands separately leaves
 * a window where a second request could consume the token before the first deletes it.
 *
 * @param {string} token - Magic link token to consume.
 * @returns {Promise<string | null>} User ID associated with the token, or null if token not found or expired.
 * @throws {Error} If Redis pipeline execution fails.
 */
export const consumeMagicToken = async (token: string): Promise<string | null> => {
  const key = `${constants.MAGIC_LINK_PREFIX}${token}`;

  // atomically get and delete key - prevents a race condition where two
  // requests consume the same token simultaneously
  const [userId] = await redis.pipeline().get(key).del(key).exec() as RedisPipelineExecType;

  return userId[1];
}



/**
 * Signs and returns a JWT access token with the provided payload.
 * Uses ES256 algorithm with a private signing key; sets subject, issued-at, expiration, and issuer claims.
 */
export const signAccessToken = async (
  subject: string,
  role: string
): Promise<string> => {
  const now = Math.floor(Date.now()/1000);
  const signingKey = getJWSigningKey();

  const jwt = new SignJWT({ role, })
    .setProtectedHeader({ alg: 'ES256' })
    .setSubject(subject)
    .setIssuedAt(now)
    .setExpirationTime(now + constants.ACCESS_TOKEN_TTL_SECS)
    .setIssuer(env.ENDPOINT)
    .sign(signingKey);

  return jwt;
}



/**
 * Verifies and decodes a JWT access token, validating issuer and algorithm.
 * Extracts and type-checks `sub` and `role` claims, returning them as `subject` and `role`.
 *
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



/**
 * Removes the current token and issues a new one
 */
export const rotateRefreshToken = async (currentToken: string): Promise<RefreshTokenParams | null> => {
  const oldKey = `${constants.REFRESH_TOKEN_PREFIX}${currentToken}`;
  const userId = await redis.get(oldKey);
  if (!userId) return null;

  await redis.del(oldKey);

  const newToken = randomBytes(constants.TOKEN_BYTE_SIZE).toString('hex');
  const newKey = `${constants.REFRESH_TOKEN_PREFIX}${newToken}`;

  await redis.set(newKey, userId, 'EX', constants.REFRESH_TOKEN_TTL_SECS);
  
  return {
    userId,
    newRefreshToken: newToken,
  };
}



/**
 * Generic function to cache tokens in Redis because writing the same function every single
 * time for this or that ephemeral token is goofy
 */
export const issueEphemeralToken = async (
  prefix: string,
  value: string,
  ttl: number,
  byteSize: number = constants.TOKEN_BYTE_SIZE,
): Promise<string> => {
  const token = randomBytes(byteSize).toString('hex');
  const key = `${prefix}${token}`;
  await redis.set(key, value, 'EX', ttl);
  return token;
}



/**
 * Removes ephemeral token from Redis
 */
export const revokeEphemeralToken = async (
  prefix: string,
  token: string
): Promise<string | null> => {
  const result = await redis.del(`${prefix}${token}`);
  if (!result) return null;
  return 'revoked';
}