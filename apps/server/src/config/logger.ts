import pino from "pino";
import { env } from "./env.js";


/**
 * Pino logs are NDJSON, which is standard for production, but unyeildy for development
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  transport: env.NODE_ENV !== 'producton'
    ? {
        target: 'pino-pretty',
        options: { colorize: true, },
      }
    : undefined
});