import type { Express } from "express";
import type { Server } from "http";
import { json, urlencoded, } from "express";
import { onLoadDbFunctions } from "../bootstrap/onLoadDbFunctions.js";
import { dbPool } from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { initJWTKeys } from "../../lib/jwtKeys/jwt-keys.js";
import { createOidcProvider } from "../../lib/oidc/oidc-provider.js";
import { env } from "../../config/env.js";
import cookieParser from "cookie-parser";
import createRouter from "../../routes/index.js";


/**
 * Configures and initializes Express application, database, middleware, routing, and HTTP server.
 * 
 * @async
 * @function onStart
 */
export const onStart = async (
  app: Express,
  server: Server,
): Promise<void> => {
  logger.info('Initializing application.');

  // connect to db
  const client = await dbPool.connect();
  client.release();
  await onLoadDbFunctions();

  // wire up middleware
  app.use(cookieParser());
  app.use(json());
  app.use(urlencoded());

  // manage auth
  await initJWTKeys();                              // initialize JWT keys first
  const oidcProvider = await createOidcProvider();  // then oidc provider

  // routing
  const router = createRouter(oidcProvider);
  app.use('/', router);

  // start HTTP server
  server.listen({ port: env.PORT, });
}