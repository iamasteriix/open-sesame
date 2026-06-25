import type { Client } from "pg";
import { dirname, resolve } from "path";
import { readdir, readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { getDbClient } from "../lib/db.js";
import { logger } from "../../src/config/logger.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_DIR = resolve(__dirname, '../../db/');
const SEEDS_DIR = resolve(DB_DIR, 'seeds/dev/');


const runSeed = async (client: Client, filename: string): Promise<void> => {
  logger.info(`○ Running seeder: ${filename}`);
  const file = resolve(SEEDS_DIR, filename);
  const sql = await readFile(file, 'utf-8');
  await client.query(sql);
  logger.info(`✓ Seeder complete: ${filename}`);
}


const main = async (): Promise<void> => {
  const seeder = process.argv[2];
  const client = await getDbClient();

  try {
    // run everything if seeder not specified
    if (!seeder) {
      const allFiles = await readdir(SEEDS_DIR);
      const sqlFiles = allFiles
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const file of sqlFiles)
        await  runSeed(client, file);
    }

    // run seeder
    if (seeder) {
      const filename = seeder.endsWith('.sql') ? seeder : `${seeder}.sql`;
      await runSeed(client, filename);
    }

  } catch (error) {
    logger.fatal({ err: error }, 'Seeder failed');
    process.exit(1);

  } finally {
    await client.end();
  }
}


main();