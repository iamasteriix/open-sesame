import { redis } from "../../config/redis.js"
import { REFRESH_TOKEN_PREFIX } from "./constants.js"


/**
 * Revokes a refresh token by deleting it from Redis.
 *
 * @param {string} token - Refresh token to revoke.
 * @returns {Promise<void>}
 * @throws {Error} If Redis delete operation fails.
 */
export const revokeRefreshToken = async (token: string): Promise<void> => {
  await redis.del(`${REFRESH_TOKEN_PREFIX}${token}`);
}