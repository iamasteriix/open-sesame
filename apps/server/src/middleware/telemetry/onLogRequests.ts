import type { Request } from "express";
import { pinoHttp } from "pino-http";
import { logger } from "../../config/logger.js";


export const onLogRequests = pinoHttp({
  logger,
  autoLogging: false,
  serializers: {
    req: (request: Request) => ({
      id: request.id,
      method: request.method,
      url: request.url,
      query: request.query,
      params: request.params,
    }),
  },
});