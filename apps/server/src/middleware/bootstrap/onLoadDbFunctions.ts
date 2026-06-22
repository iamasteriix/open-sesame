import { readdir, readFile } from "fs/promises";
import { join, resolve } from "path";
import { dbPool } from "../../config/db.js";
import { logger } from "../../config/logger.js";


export const onLoadDbFunctions = async (): Promise<void> => {
  const dbFnDir = resolve('db/functions/');
  const allFiles = await readdir(dbFnDir);
  const sqlFiles = allFiles.filter(file => file.endsWith('.sql'));

  for (const file of sqlFiles) {
    const sql = await readFile(join(dbFnDir, file), 'utf-8');
    await dbPool.query(sql);
  }

  logger.info('Loaded DB functions');
}