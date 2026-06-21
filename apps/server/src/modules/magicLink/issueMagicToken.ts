import { randomBytes } from "crypto";
import { MAGIC_LINK_PREFIX, MAGIC_LINK_TTL_SECS, TOKEN_BYTE_SIZE } from "./constants.js"
import { redis } from "../../config/redis.js";


export const issueMagicToken = async (userId: string): Promise<string> => {
  const token = randomBytes(TOKEN_BYTE_SIZE).toString('hex');
  const key = `${MAGIC_LINK_PREFIX}${token}`;

  await redis.set(key, userId, 'EX', MAGIC_LINK_TTL_SECS);

  return token;
}