import type { Express } from "express";
import type { Server } from "http";
import { json, urlencoded, } from "express";
import cookieParser from "cookie-parser";
import { onLoadDbFunctions } from "../bootstrap/onLoadDbFunctions.js";
import { dbPool } from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { initJWTKeys } from "../../lib/jwtKeys/jwtKeys.js";
import { createOidcProvider } from "../../lib/oidc/oidcProvider.js";
import { env } from "../../config/env.js";
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
  
  // not having this event listener cost me a egregious amount of time trying to find out why the oidc provider kept breaking
  oidcProvider.on('server_error', (context, error) => {
    logger.error({
        err: error,
        path: context?.path,
      },
      'OIDC provider internal error'
    );
  });

  // start HTTP server
  server.listen({ port: env.PORT, });
}