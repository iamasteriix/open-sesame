import { logger } from "../../config/logger.js";
import { env } from "../../config/env.js";


export const sendMagicLink = async (
  email: string,
  token: string
): Promise<void> => {

  const url = `${env.ENDPOINT}/auth/?token=${token}`;

  // @todo add email transport
  logger.info({ email, url, }, 'Magic link issued');
}