import { randomBytes } from "crypto";
import { redis } from "../../config/redis.js";
import { REFRESH_TOKEN_PREFIX, REFRESH_TOKEN_TTL_SECS, TOKEN_BYTE_SIZE } from "./constants.js";


/**
 * Generates a random refresh token and stores it in Redis with the associated user ID.
 * Token is stored with an expiration time equal to REFRESH_TOKEN_TTL_SECS.
 *
 * @param {string} userId - User ID to associate with the refresh token.
 * @returns {Promise<string>} Hex-encoded random refresh token.
 * @throws {Error} If Redis set operation fails.
 */
export const issueRefreshToken = async (userId: string): Promise<string> => {
  const token = randomBytes(TOKEN_BYTE_SIZE).toString('hex');
  const key = `${REFRESH_TOKEN_PREFIX}${token}`;

  await redis.set(key, userId, 'EX', REFRESH_TOKEN_TTL_SECS);

  return token;
}