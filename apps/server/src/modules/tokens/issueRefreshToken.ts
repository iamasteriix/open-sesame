import { randomBytes } from "crypto";
import { redis } from "../../config/redis.js";
import { REFRESH_TOKEN_PREFIX, REFRESH_TOKEN_TTL_SECS, TOKEN_BYTE_SIZE } from "./constants.js";


export const issueRefreshToken = async (userId: string): Promise<string> => {
  const token = randomBytes(TOKEN_BYTE_SIZE).toString('hex');
  const key = `${REFRESH_TOKEN_PREFIX}${token}`;

  await redis.set(key, userId, 'EX', REFRESH_TOKEN_TTL_SECS);

  return token;
}