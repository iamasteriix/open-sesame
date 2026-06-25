import { Client } from "pg";
import { env } from "../../src/config/env";



/**
 * Establishes and returns a connected PostgreSQL database client configured
 * from environment variables.
 *
 * @returns {Promise<Client>} A connected database client instance.
 */
export const getDbClient = async (): Promise<Client> => {
  const client = new Client({
    host: env.PG_HOST,
    port: env.PG_PORT,
    database: env.PG_DATABASE,
    user: env.PG_USER,
    password: env.PG_PASSWORD,
  });

  await client.connect();
  return client;
}