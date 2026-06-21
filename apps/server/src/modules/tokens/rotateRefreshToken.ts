import type { RefreshTokenParams } from "./types.js";
import { randomBytes } from "node:crypto";
import { REFRESH_TOKEN_PREFIX, REFRESH_TOKEN_TTL_SECS, TOKEN_BYTE_SIZE } from "./constants.js";
import { redis } from "../../config/redis.js";


/**
 * Generates a random refresh token and stores it in Redis with the associated user ID.
 * Token is stored with an expiration time equal to REFRESH_TOKEN_TTL_SECS.
 *
 * @param {string} userId - User ID to associate with the refresh token.
 * @returns {Promise<string>} Hex-encoded random refresh token.
 * @throws {Error} If Redis set operation fails.
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
  }
}