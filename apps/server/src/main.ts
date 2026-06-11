import express from "express";
import http from "http";
import { env } from "./config/env.js";
import { onStart } from "./middleware/lifecycle/onStart.js";
import { onReady } from "./middleware/lifecycle/onReady.js";
import { onShutdown } from "./middleware/lifecycle/onShutdown.js";


type AppInstance = {
  endpoint: string;
  port: number;
  shutdown: () => Promise<void>;
};


export default async (): Promise<AppInstance> => {
  const app = express();
  const server = http.createServer(app);

  await onStart({ app, });            // initialize application middleware
  server.listen({ port: env.PORT, }); // start HTTP server
  onReady();                          // ready lifecycle

  return {
    endpoint: env.ENDPOINT,
    port: env.PORT,
    shutdown: () => onShutdown({ server, }),
  };
}