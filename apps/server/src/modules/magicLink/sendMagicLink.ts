import type { MagicLinkParams } from "./types.js";
import { logger } from "../../config/logger.js";


export const sendMagicLink = async (input: MagicLinkParams): Promise<void> => {
  const { email, token, endpoint } = input;
  const url = `${endpoint}/v1/magic-link/verify?token=${token}`;

  // @todo add email transport
  logger.info({ email, url, }, 'Magic link issued');
}