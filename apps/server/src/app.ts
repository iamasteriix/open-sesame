import express from "express";
import { createServer } from "http";
import { env } from "./config/env.js";
import { onStart } from "./middleware/lifecycle/onStart.js";
import { onReady } from "./middleware/lifecycle/onReady.js";
import { onShutdown } from "./middleware/lifecycle/onShutdown.js";


export type AppInstanceParams = {
  endpoint: string;
  port: number;
  shutdown: () => Promise<void>;
};


export default async (): Promise<AppInstanceParams> => {
  const app = express();
  const server = createServer(app);

  await onStart(app, server); // wire up middleware, routes, and start app
  onReady(app);               // ready lifecycle

  return {
    endpoint: env.ENDPOINT,
    port: env.PORT,
    shutdown: () => onShutdown(server),
  };
}