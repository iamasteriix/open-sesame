import type { Request, Response, NextFunction, } from "express";
import { dbPool } from "../../config/db.js";
import { redis } from "../../config/redis.js";


export const onHealthStatus = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  
  const result = await Promise.allSettled([
    dbPool.query('select 1'),
    redis.ping(),
  ]);

  const health = {
    postgres: result[0].status === 'fulfilled' ? 'ok' : 'error',
    redis: result[1].status === 'fulfilled' ? 'ok' : 'error',
  };

  const allHealthy = result.every(item => item.status === 'fulfilled');

  response
  .status(allHealthy ? 200 : 503)
  .json(health);
}