import type { AccessTokenPayload, RefreshTokenParams } from "./types.js";
import type { UserRoles } from "../users/types.js";
import { randomBytes } from "crypto";
import { decodeJwt, jwtVerify, SignJWT } from "jose";
import { redis } from "../../config/redis.js";
import { env } from "../../config/env.js";
import { getJWSigningKey, getJWVerifyKey } from "../../lib/jwtKeys/jwt-keys.js";
import { UnauthorizedError, ValidationError } from "../../lib/errors/errors.js";
import * as constants from "./constants.js";



/**
 * Signs and returns a JWT access token with the provided payload.
 * Uses ES256 algorithm with a private signing key; sets subject, issued-at, expiration, and issuer claims.
 */
export const signAccessToken = async (
  subject: string,
  roles: UserRoles[]
): Promise<string> => {
  const now = Math.floor(Date.now()/1000);
  const signingKey = getJWSigningKey();
  const jti = randomBytes(constants.TOKEN_BYTE_SIZE).toString('hex');

  const jwt = new SignJWT({ roles, })
    .setProtectedHeader({ alg: 'ES256' })
    .setSubject(subject)
    .setJti(jti)
    .setIssuedAt(now)
    .setExpirationTime(now + constants.ACCESS_TOKEN_TTL_SECS)
    .setIssuer(env.ENDPOINT)
    .sign(signingKey);

  return jwt;
}



/**
 * Verifies and decodes a JWT access token, validating issuer and algorithm, and
 * whether the token is blacklisted
 *
 * @returns {Promise<AccessTokenPayload>} Decoded payload with `sub`, `role`, and `jti` fields.
 * @throws {Error} If token is invalid, verification fails, issuer/algorithm mismatch, or claims are missing/malformed.
 */
export const verifyAccessToken = async (token: string): Promise<AccessTokenPayload> => {
  const verifyKey = getJWVerifyKey();
  const { payload } = await jwtVerify(
    token,
    verifyKey, {
      issuer: env.ENDPOINT,
      algorithms: ['ES256'],
    });
  if (
    typeof payload.sub !== 'string' ||
    typeof payload.jti !== 'string' ||
    !Array.isArray(payload.roles)
  ) throw new Error('Invalid token payload');

  const isBlacklisted = await redis.exists(`${constants.BLACKLIST_TOKEN_PREFIX}${payload.jti}`);
  if (isBlacklisted) throw new UnauthorizedError('Token has been revoked');

  return {
    sub: payload.sub,
    roles: payload.roles,
    jti: payload.jti,
  };
}



/**
 * Revokes the access token by adding it to the Redis blacklist.
 * We calculate the exact remaining lifetime of the token's `exp` claim so we don't
 * waste Redis memory.
 */
export const revokeAccessToken = async (token: string): Promise<void> => {
  const payload = decodeJwt(token);
  if (!payload.jti || typeof payload.jti !== 'string') throw new ValidationError('Invalid access token');

  const key = `${constants.BLACKLIST_TOKEN_PREFIX}${payload.jti}`;
  const ttl = payload.exp
    ? Math.max(0, payload.exp - Math.floor(Date.now() / 1000))
    : constants.ACCESS_TOKEN_TTL_SECS;
    
  if (ttl) await redis.set(key, '1', 'EX', ttl);
}



/**
 * Removes the current token and issues a new one
 */  
export const rotateRefreshToken = async (currentToken: string): Promise<RefreshTokenParams | null> => {
  const oldKey = `${constants.REFRESH_TOKEN_PREFIX}${currentToken}`;
  const newToken = randomBytes(constants.TOKEN_BYTE_SIZE).toString('hex');
  const newKey = `${constants.REFRESH_TOKEN_PREFIX}${newToken}`;

  const userStr = await redis.eval(
    `
      local value = redis.call('GET', KEYS[1])
      if not value then
        return nil
      end
      redis.call('DEL', KEYS[1])
      redis.call('SET', KEYS[2], value, 'EX', ARGV[1])
      return value
    `,
    2,
    oldKey,                           // KEYS[1]
    newKey,                           // KEYS[2]
    constants.REFRESH_TOKEN_TTL_SECS, // ARGV[1]
  );

  if (typeof userStr !== 'string') return null;
  const { userId, roles, } = JSON.parse(userStr);

  return {
    userId,
    roles,
    newRefreshToken: newToken,
  };
}



/**
 * Generic function to cache tokens in Redis because writing the same function every single
 * time for this or that ephemeral token is goofy
 * 
 * @returns token string
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
 * Consumes a token by atomically retrieving and deleting it from Redis to
 * prevent a race condition where two requests consume the same token simultaneously.
 *
 * @returns {Promise<string | null>} Value associated with the token, or null if token not found or expired.
 */
export const consumeEphemeralToken = async (
  prefix: string,
  token: string
): Promise<string | null> => {
  return await redis.getdel(`${prefix}${token}`);
}



/**
 * Removes ephemeral token from Redis
 * 
 * @returns {Promise<string | null>} Returns `'revoked'` on successful deletion, `null` if token did not exist.
 */
export const revokeEphemeralToken = async (
  prefix: string,
  token: string
): Promise<string | null> => {
  const result = await redis.del(`${prefix}${token}`);
  if (!result) return null;
  return 'revoked';
}