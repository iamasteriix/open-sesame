import express from "express";
import http from "http";
import { env } from "./config/index.js";
import { onStart, onReady, onShutdown, } from "./middleware/index.js";


type AppInstance = {
  endpoint: string;
  port: number;
  shutdown: () => void;
};


export default (): AppInstance => {
  const app = express();
  const server = http.createServer(app);

  onStart({ app, });                  // initialize application middleware
  server.listen({ port: env.PORT, }); // start HTTP server
  onReady();                          // ready lifecycle

  return {
    endpoint: env.ENDPOINT,
    port: env.PORT,
    shutdown: () => onShutdown({ server, }),
  };
}