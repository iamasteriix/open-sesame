import type { Express } from "express";
import { json, urlencoded, } from "express";
import { dbPool } from "../../config/db.js";
import v1Router from "../../routes/v1/index.js";


type StartParams = {
  app: Express;
};


/**
 * Configures and initializes Express application middleware and routes.
 * 
 * @async
 * @function onStart
 */
export const onStart = async ({ app }: StartParams): Promise<void> => {
  console.log('[Lifecycle] 🟡 Initializing application.');

  // connect to db
  const client = await dbPool.connect();
  client.release();

  // initialize middleware
  app.use(json());
  app.use(urlencoded());

  // versioned api routes
  app.use('/v1', v1Router);
}