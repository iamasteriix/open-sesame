import type { Express } from "express";
import { json, urlencoded, } from "express";
import cookieParser from "cookie-parser";
import { onLoadDbFunctions } from "../bootstrap/onLoadDbFunctions.js";
import { dbPool } from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { initJWTKeys } from "../../lib/jwtKeys/jwtKeys.js";
import createRouter from "../../routes/index.js";


export type AppStartOptions = {
  app: Express;
};


/**
 * Configures and initializes Express application middleware and routes.
 * 
 * @async
 * @function onStart
 */
export const onStart = async ({ app }: AppStartOptions): Promise<void> => {
  logger.info('Initializing application.');

  // connect to db
  const client = await dbPool.connect();
  client.release();
  await onLoadDbFunctions();

  // initialize JWT keys
  await initJWTKeys();

  // wire up middleware
  app.use(cookieParser());
  app.use(json());
  app.use(urlencoded());

  // routing
  const router = await createRouter();
  app.use('/', router);
}