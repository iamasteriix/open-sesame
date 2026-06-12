import type { Server } from "http";
import { dbPool } from "../../config/db.js";
import { redis } from "../../config/redis.js";
import { logger } from "../../config/logger.js";


type ShutdownOptions = {
  server: Server;
};


/**
 * Gracefully shuts down the server.
 * 
 * @async
 * @function onShutdown
 * @param {Object} params - Parameters for shutting down the server
 * @param {Object} params.server - HTTP server instance
 */
export const onShutdown = async ({ server }: ShutdownOptions): Promise<void> => {
  logger.info('Gracefully shutting down.');

  // close db connection
  await dbPool.end();
  await redis.quit();
  
  await new Promise<void> (resolve => {
    server.close(() => {
      logger.info('Server closed.');
      resolve();
    });
  });
}