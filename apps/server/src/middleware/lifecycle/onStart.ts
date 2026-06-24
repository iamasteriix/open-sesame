import type { Express } from "express";
import { json, urlencoded, } from "express";
import { onLoadDbFunctions } from "../bootstrap/onLoadDbFunctions.js";
import { dbPool } from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { initJWTKeys } from "../../lib/jwtKeys/jwtKeys.js";
import { createOidcProvider } from "../../lib/oidc/oidcProvider.js";
import v1Router from "../../routes/v1.routes.js";


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

  // initialize middleware
  app.use(json());
  app.use(urlencoded());

  // versioned api routes
  app.use('/v1', v1Router);

  // mount oidc provider
  const oidcProvider = await createOidcProvider();
  app.use('/oidc', oidcProvider.callback());
}