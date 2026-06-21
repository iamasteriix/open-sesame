import { redis } from "../../config/redis.js";
import { MAGIC_LINK_PREFIX } from "./constants.js"


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
  const key = `${MAGIC_LINK_PREFIX}${token}`;

  // atomically get and delete - prevents a race condition where two
  // requests consume the same token simultaneously
  const [userId] = await redis.pipeline().get(key).del(key).exec() as [
    [Error | null, string | null],
    [Error | null, number],
  ];

  return userId[1];
}