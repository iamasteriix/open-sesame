import type { Express } from "express";
import { onError } from "../errors/onError.js";
import { logger } from "../../config/logger.js";


/**
 * Initializes server components after successful startup.
 * 
 * @function onReady
 */
export const onReady = (app: Express): void => {
  // do all the things

  logger.info('Server live and accepting connections.');

  // handle errors
  app.use(onError);
}