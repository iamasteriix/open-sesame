import { pinoHttp } from "pino-http";
import { logger } from "../../config/logger.js";


export const onRequestLogging = pinoHttp({ logger });