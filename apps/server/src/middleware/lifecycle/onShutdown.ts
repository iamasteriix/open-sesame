import type { Server } from "http";
import { dbPool, redis, } from "../../config/index.js";


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
  console.log('[System] 😴 Gracefully shutting down.');

  // close db connection
  await dbPool.end();
  await redis.quit();
  
  await new Promise<void> (resolve => {
    server.close(() => {
      console.log('[HTTP] 📴 Server closed.');
      resolve();
    });
  });
}