import type { Express } from "express";
import { json, urlencoded, } from "express";
import { v1Router } from "../../routes";


type StartParams = {
  app: Express;
};


/**
 * Configures and initializes Express application middleware and routes.
 * @function onStart
 */
export const onStart = ({ app }: StartParams): void => {
  console.log('[Lifecycle] 🟡 Initializing middleware and sockets.');

  // initialize middleware
  app.use(json());
  app.use(urlencoded());

  // versioned api routes
  app.use('/v1', v1Router);
}