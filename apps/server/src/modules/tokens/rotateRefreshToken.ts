import type { RefreshTokenParams } from "./types.js";
import { randomBytes } from "node:crypto";
import { REFRESH_TOKEN_PREFIX, REFRESH_TOKEN_TTL_SECS, TOKEN_BYTE_SIZE } from "./constants.js";
import { redis } from "../../config/redis.js";


/**
 * Rotates a refresh token by removing the old token and issuing a new one.
 *
 * @param {string} oldToken - Existing refresh token.
 * @returns {Promise<RefreshTokenParams | null>} Object with userId and newRefreshToken, or null if token not found.
 * @throws {Error} If Redis operations fail.
 */
export const rotateRefreshToken = async (oldToken: string): Promise<RefreshTokenParams | null> => {
  const oldKey = `${REFRESH_TOKEN_PREFIX}${oldToken}`;
  const userId = await redis.get(oldKey);

  if (!userId) return null;

  await redis.del(oldKey);

  const newToken = randomBytes(TOKEN_BYTE_SIZE).toString('hex');
  const newKey = `${REFRESH_TOKEN_PREFIX}${newToken}`;

  await redis.set(newKey, userId, 'EX', REFRESH_TOKEN_TTL_SECS);
  
  return {
    userId,
    newRefreshToken: newToken,
  };
}