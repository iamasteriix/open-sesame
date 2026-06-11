import { Redis } from "ioredis";
import { env } from "./env.js";


export const redis = new Redis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  password: env.REDIS_PASSWORD,
});