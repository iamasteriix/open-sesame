import { Pool } from "pg";
import { env } from "./env.js";


export const dbPool = new Pool({
  host: env.PG_HOST,
  port: Number(env.PG_PORT),
  database: env.PG_DATABASE,
  user: env.PG_USER,
  password: env.PG_PASSWORD,
});